// Data with persistence
const defaultProducts = [
    { id: 1, name: "Laptop", price: 50000, category: "Electronics", desc: "High-performance laptop", img: "https://via.placeholder.com/150", stock: 10, rating: 4.5, reviews: [{ user: "user1", text: "Great!", rating: 5 }], createdAt: Date.now(), priceHistory: [{ date: "2025-03-01", price: 52000 }, { date: "2025-04-01", price: 50000 }] },
    { id: 2, name: "T-Shirt", price: 999, category: "Fashion", desc: "Cotton T-Shirt", img: "https://via.placeholder.com/150", stock: 50, rating: 4.0, reviews: [{ user: "user2", text: "Nice fit", rating: 4 }], createdAt: Date.now(), priceHistory: [{ date: "2025-03-01", price: 1099 }, { date: "2025-04-01", price: 999 }] }
];
let products = JSON.parse(localStorage.getItem("products")) || defaultProducts;
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
let orders = JSON.parse(localStorage.getItem("orders")) || [];
let users = JSON.parse(localStorage.getItem("users")) || [];
let loggedInUser = localStorage.getItem("loggedInUser") || null;
let currency = localStorage.getItem("currency") || "INR";
let displayedProducts = 20;
const exchangeRate = { INR: 1, USD: 0.012 }; // Simulated rates
const coupons = { "SAVE10": 0.1, "FLAT50": 50 }; // Simulated coupons

// Utility
function showSection(sectionId) {
    if (!loggedInUser && sectionId !== "login") return showSection("login");
    document.querySelectorAll(".section").forEach(section => {
        section.classList.toggle("active", section.id === sectionId);
        section.style.opacity = section.id === sectionId ? "1" : "0";
    });
    saveData();
}

function saveData() {
    localStorage.setItem("products", JSON.stringify(products));
    localStorage.setItem("cart", JSON.stringify(cart));
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    localStorage.setItem("orders", JSON.stringify(orders));
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("loggedInUser", loggedInUser);
    localStorage.setItem("currency", currency);
}

function toggleTheme() {
    document.body.classList.toggle("dark");
    document.getElementById("theme-toggle").innerText = document.body.classList.contains("dark") ? "☀️" : "🌙";
}

function changeCurrency() {
    currency = document.getElementById("currency").value;
    displayProducts();
    updateCart();
    updateWishlist();
    if (loggedInUser) updateProfile();
}

// Display products with infinite scroll
function displayProducts(filteredProducts = products) {
    const productGrid = document.getElementById("shop-products");
    productGrid.innerHTML = "";
    filteredProducts.slice(0, displayedProducts).forEach(product => renderProduct(product, productGrid));
    document.getElementById("load-more").style.display = displayedProducts < filteredProducts.length ? "block" : "none";
    displayRecommendations();
}

function renderProduct(product, container) {
    const price = convertCurrency(product.price);
    const div = document.createElement("div");
    div.className = "product-card";
    div.innerHTML = `
        <img src="${product.img}" alt="${product.name}" loading="lazy">
        <h3>${product.name}</h3>
        <p>${currency === "INR" ? "₹" : "$"}${price.toLocaleString()}</p>
        <div class="rating">${"★".repeat(Math.floor(product.rating)) + "☆".repeat(5 - Math.floor(product.rating))} (${product.rating})</div>
        <button onclick="showProduct(${product.id})">View Details</button>
    `;
    container.appendChild(div);
}

function loadMoreProducts() {
    displayedProducts += 20;
    displayProducts();
}

// Show product details
function showProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const price = convertCurrency(product.price);
    document.getElementById("product-img").src = product.img;
    document.getElementById("product-name").innerText = product.name;
    document.getElementById("product-price").innerText = `${currency === "INR" ? "₹" : "$"}${price.toLocaleString()}`;
    document.getElementById("product-rating").innerText = `${"★".repeat(Math.floor(product.rating)) + "☆".repeat(5 - Math.floor(product.rating))} (${product.rating})`;
    document.getElementById("product-desc").innerText = product.desc;
    document.getElementById("product-stock").innerText = product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock";
    document.getElementById("product-delivery").innerText = `Free Delivery by ${new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString()}`;
    document.getElementById("product-price-history").innerText = product.priceHistory.map(h => `${h.date}: ${currency === "INR" ? "₹" : "$"}${convertCurrency(h.price).toLocaleString()}`).join(", ");
    document.getElementById("product-add-btn").onclick = () => addToCart(product);
    document.getElementById("product-wishlist-btn").onclick = () => addToWishlist(product);
    document.getElementById("product-quantity").value = 1;
    const reviewsList = document.getElementById("product-reviews");
    reviewsList.innerHTML = product.reviews.map(r => `<li>${r.user}: ${r.text} (${"★".repeat(r.rating)})</li>`).join("");
    showSection("product");
}

// Cart/Wishlist
function addToCart(product) {
    const quantity = parseInt(document.getElementById("product-quantity").value);
    if (product.stock < quantity) return alert(`Only ${product.stock} items in stock!`);
    cart.push({ ...product, cartId: Date.now() + Math.random(), quantity });
    product.stock -= quantity;
    updateCart();
    updateAdminProductList();
    alert(`${product.name} (${quantity}) added to cart!`);
}

function addToWishlist(product) {
    if (wishlist.some(w => w.id === product.id)) return alert("Already in wishlist!");
    wishlist.push(product);
    updateWishlist();
    alert(`${product.name} added to wishlist!`);
}

function updateCart() {
    const cartItems = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");
    const cartTotalCurrency = document.getElementById("cart-total-currency");
    const cartCount = document.getElementById("cart-count");
    cartItems.innerHTML = "";
    cart.forEach(item => {
        const price = convertCurrency(item.price * item.quantity);
        const li = document.createElement("li");
        li.innerHTML = `${item.name} - ${currency === "INR" ? "₹" : "$"}${price.toLocaleString()} (${item.quantity}) 
            <button onclick="removeFromCart(${item.cartId})">Remove</button>`;
        cartItems.appendChild(li);
    });
    const total = convertCurrency(cart.reduce((sum, item) => sum + item.price * item.quantity, 0));
    cartTotal.innerText = total.toLocaleString();
    cartTotalCurrency.innerText = currency === "INR" ? "₹" : "$";
    cartCount.innerText = cart.length;
}

function removeFromCart(cartId) {
    const item = cart.find(i => i.cartId === cartId);
    cart = cart.filter(i => i.cartId !== cartId);
    const product = products.find(p => p.id === item.id);
    product.stock += item.quantity;
    updateCart();
    updateAdminProductList();
}

function updateWishlist() {
    const wishlistItems = document.getElementById("wishlist-items");
    const wishlistCount = document.getElementById("wishlist-count");
    wishlistItems.innerHTML = "";
    wishlist.forEach(item => {
        const price = convertCurrency(item.price);
        const li = document.createElement("li");
        li.innerHTML = `${item.name} - ${currency === "INR" ? "₹" : "$"}${price.toLocaleString()} 
            <button onclick="removeFromWishlist(${item.id})">Remove</button>
            <button onclick="addToCartFromWishlist(${item.id})">Add to Cart</button>`;
        wishlistItems.appendChild(li);
    });
    wishlistCount.innerText = wishlist.length;
}

function removeFromWishlist(productId) {
    wishlist = wishlist.filter(w => w.id !== productId);
    updateWishlist();
}

function addToCartFromWishlist(productId) {
    const product = wishlist.find(w => w.id === productId);
    addToCart(product);
    removeFromWishlist(productId);
}

// Search, Sort, Filter, Coupon
function searchProducts() {
    const query = document.getElementById("search").value.toLowerCase();
    const suggestions = document.getElementById("search-suggestions");
    const filtered = products.filter(p => p.name.toLowerCase().includes(query) || p.desc.toLowerCase().includes(query));
    suggestions.innerHTML = filtered.slice(0, 5).map(p => `<div onclick="showProduct(${p.id})">${p.name}</div>`).join("");
    suggestions.style.display = query ? "block" : "none";
    displayProducts(filtered);
}

function voiceSearch() {
    alert("Voice search simulation: Say something like 'Laptop' (not implemented due to API limitations).");
    document.getElementById("search").value = "Laptop"; // Simulated
    searchProducts();
}

function sortProducts() {
    const sortValue = document.getElementById("sort").value;
    let sorted = [...products];
    if (sortValue === "high-to-low") sorted.sort((a, b) => b.price - a.price);
    else if (sortValue === "low-to-high") sorted.sort((a, b) => a.price - b.price);
    else if (sortValue === "rating") sorted.sort((a, b) => b.rating - a.rating);
    else if (sortValue === "newest") sorted.sort((a, b) => b.createdAt - a.createdAt);
    displayProducts(sorted);
}

function filterProducts() {
    const minPrice = parseFloat(document.getElementById("min-price").value) || 0;
    const maxPrice = parseFloat(document.getElementById("max-price").value) || Infinity;
    const category = document.getElementById("category").value;
    const inStock = document.getElementById("in-stock").checked;
    const filtered = products.filter(p => 
        convertCurrency(p.price) >= minPrice && convertCurrency(p.price) <= maxPrice && 
        (category === "all" || p.category === category) &&
        (!inStock || p.stock > 0)
    );
    displayedProducts = 20;
    displayProducts(filtered);
}

function applyCoupon() {
    const code = document.getElementById("coupon").value.toUpperCase();
    const discount = coupons[code];
    if (discount) {
        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const discounted = discount < 1 ? total * (1 - discount) : total - discount;
        document.getElementById("cart-total").innerText = convertCurrency(discounted).toLocaleString();
        alert(`Coupon ${code} applied!`);
    }
}

// Recommendations (AI-like)
function displayRecommendations() {
    const recommended = products.filter(p => p.rating >= 4 || p.stock > 20).sort(() => 0.5 - Math.random()).slice(0, 4);
    const recommendedGrid = document.getElementById("recommended-products");
    recommendedGrid.innerHTML = "";
    recommended.forEach(product => renderProduct(product, recommendedGrid));
}

// Checkout
function placeOrder(event) {
    event.preventDefault();
    if (!loggedInUser) return alert("Please login first!");
    if (cart.length === 0) return alert("Cart is empty!");
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const paymentMethod = document.getElementById("payment-method").value;
    const order = { 
        id: Date.now(), 
        items: [...cart], 
        total, 
        status: "Processing", 
        user: loggedInUser, 
        paymentMethod, 
        details: {
            name: document.getElementById("full-name").value,
            address: document.getElementById("address").value,
            phone: document.getElementById("phone").value,
            email: document.getElementById("email").value
        },
        timeline: [{ status: "Order Placed", date: new Date().toLocaleString() }]
    };

    document.getElementById("payment-details").style.display = paymentMethod === "cod" ? "none" : "block";
    if (paymentMethod === "upi") {
        const upiId = document.getElementById("upi-id").value;
        const upiPin = document.getElementById("upi-pin").value;
        if (!/^[a-zA-Z0-9]+@[a-zA-Z0-9]+$/.test(upiId) || upiPin.length !== 4) return alert("Invalid UPI ID or PIN!");
        simulatePayment(total, `UPI (${upiId})`, order);
    } else if (paymentMethod === "card") {
        const cardNumber = document.getElementById("card-number").value;
        const otp = document.getElementById("card-otp").value;
        if (!/^\d{16}$/.test(cardNumber) || otp.length !== 6) return alert("Invalid card details or OTP!");
        simulatePayment(total, "Card", order);
    } else {
        orders.push(order);
        finishOrder(total, "COD", order);
    }
}

function simulatePayment(amount, method, order) {
    setTimeout(() => {
        orders.push(order);
        finishOrder(amount, method, order);
        simulateEmail(order);
    }, 2000);
}

function finishOrder(amount, method, order) {
    document.getElementById("order-confirmation").innerText = `Order #${order.id} placed! Total: ${currency === "INR" ? "₹" : "$"}${convertCurrency(amount).toLocaleString()} (${method})`;
    document.getElementById("order-confirmation").style.display = "block";
    cart = [];
    updateCart();
    updateProfile();
    updateAdminOrderList();
}

function simulateEmail(order) {
    console.log(`Simulated email sent to ${order.details.email}: Your order #${order.id} has been placed! Total: ${currency === "INR" ? "₹" : "$"}${convertCurrency(order.total).toLocaleString()}`);
}

// Reviews
function addReview() {
    const productName = document.getElementById("product-name").innerText;
    const product = products.find(p => p.name === productName);
    const text = document.getElementById("review-text").value;
    const rating = parseInt(document.getElementById("review-rating").value);
    if (!text || !loggedInUser) return alert("Login and write a review!");
    product.reviews.push({ user: loggedInUser, text, rating });
    product.rating = product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length;
    showProduct(product.id);
    document.getElementById("review-text").value = "";
}

// User management
function createAccount() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    if (!email || !password) return alert("Fill all fields!");
    if (users.some(u => u.email === email)) return alert("User already exists!");
    users.push({ email, password, createdAt: Date.now(), role: "user" });
    loggedInUser = email;
    document.getElementById("login-message").innerText = `Account created for ${email}!`;
    updateProfile();
    checkAdminAccess();
    showSection("shop");
}

function loginAccount() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return alert("Invalid credentials!");
    loggedInUser = email;
    document.getElementById("login-message").innerText = `Logged in as ${email}!`;
    updateProfile();
    checkAdminAccess();
    showSection("shop");
}

function logout() {
    loggedInUser = null;
    document.getElementById("admin").style.display = "none";
    showSection("login");
}

function updateProfile() {
    const profileInfo = document.getElementById("profile-info");
    const orderHistory = document.getElementById("order-history");
    profileInfo.innerHTML = loggedInUser ? `<p>Email: ${loggedInUser}</p><p>Role: ${users.find(u => u.email === loggedInUser).role}</p>` : "<p>Please login</p>";
    orderHistory.innerHTML = "";
    orders.filter(o => o.user === loggedInUser).forEach(order => {
        const total = convertCurrency(order.total);
        const li = document.createElement("li");
        li.innerHTML = `Order #${order.id} - ${currency === "INR" ? "₹" : "$"}${total.toLocaleString()} - ${order.status} 
            <button onclick="trackOrder(${order.id})">Track</button>
            <button onclick="returnOrder(${order.id})">Return</button>`;
        orderHistory.appendChild(li);
    });
}

function trackOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    alert(`Order #${orderId}: ${order.status}\nTimeline:\n${order.timeline.map(t => `${t.status} - ${t.date}`).join("\n")}`);
}

function returnOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order.status === "Delivered") {
        order.status = "Return Requested";
        order.timeline.push({ status: "Return Requested", date: new Date().toLocaleString() });
        updateProfile();
        updateAdminOrderList();
        alert("Return requested!");
    } else {
        alert("Order must be delivered to return!");
    }
}

// Admin
function addProduct() {
    const newProduct = {
        id: products.length + 1,
        name: document.getElementById("admin-product-name").value,
        price: parseFloat(document.getElementById("admin-product-price").value),
        desc: document.getElementById("admin-product-desc").value,
        img: document.getElementById("admin-product-img").value || "https://via.placeholder.com/150",
        category: document.getElementById("admin-product-category").value,
        stock: parseInt(document.getElementById("admin-product-stock").value),
        rating: 0,
        reviews: [],
        createdAt: Date.now(),
        priceHistory: [{ date: new Date().toISOString().split("T")[0], price: parseFloat(document.getElementById("admin-product-price").value) }]
    };
    if (!newProduct.name || isNaN(newProduct.price) || newProduct.stock < 0) return alert("Invalid input!");
    products.push(newProduct);
    displayProducts();
    updateAdminProductList();
    alert("Product added!");
}

function updateAdminProductList() {
    const adminList = document.getElementById("admin-product-list");
    adminList.innerHTML = "";
    products.forEach(p => {
        const price = convertCurrency(p.price);
        const li = document.createElement("li");
        li.innerHTML = `${p.name} - ${currency === "INR" ? "₹" : "$"}${price.toLocaleString()} (${p.category}) - Stock: ${p.stock}
            <button onclick="editProduct(${p.id})">Edit</button>
            <button onclick="deleteProduct(${p.id})">Delete</button>`;
        adminList.appendChild(li);
    });
}

function updateAdminOrderList() {
    const adminOrderList = document.getElementById("admin-order-list");
    adminOrderList.innerHTML = "";
    orders.forEach(o => {
        const total = convertCurrency(o.total);
        const li = document.createElement("li");
        li.innerHTML = `Order #${o.id} - ${o.user} - ${currency === "INR" ? "₹" : "$"}${total.toLocaleString()} - ${o.status}
            <button onclick="updateOrderStatus(${o.id}, 'Shipped')">Ship</button>
            <button onclick="updateOrderStatus(${o.id}, 'Delivered')">Deliver</button>`;
        adminOrderList.appendChild(li);
    });
}

function updateAdminUserList() {
    const adminUserList = document.getElementById("admin-user-list");
    adminUserList.innerHTML = "";
    users.forEach(u => {
        const li = document.createElement("li");
        li.innerHTML = `${u.email} - Role: ${u.role} - Joined: ${new Date(u.createdAt).toLocaleDateString()}
            <button onclick="deleteUser('${u.email}')">Delete</button>
            <button onclick="changeUserRole('${u.email}')">Change Role</button>`;
        adminUserList.appendChild(li);
    });
}

function updateAdminAnalytics() {
    const analytics = document.getElementById("admin-analytics");
    const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
    const topProduct = products.reduce((max, p) => p.reviews.length > max.reviews.length ? p : max, products[0]);
    analytics.innerHTML = `
        <p>Total Sales: ${currency === "INR" ? "₹" : "$"}${convertCurrency(totalSales).toLocaleString()}</p>
        <p>Total Orders: ${orders.length}</p>
        <p>Total Users: ${users.le
