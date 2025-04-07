// Data
let products = [
    { id: 1, name: "Laptop", price: 50000, category: "Electronics", desc: "High-performance laptop", img: "https://via.placeholder.com/150", stock: 10, rating: 4.5, reviews: ["Great product!"] },
    { id: 2, name: "T-Shirt", price: 999, category: "Clothes", desc: "Cotton T-Shirt", img: "https://via.placeholder.com/150", stock: 50, rating: 4.0, reviews: ["Nice fit."] }
];
let cart = [];
let wishlist = [];
let orders = [];
let users = [];
let loggedInUser = null;

// Utility: Show section
function showSection(sectionId) {
    document.querySelectorAll(".section").forEach(section => {
        section.classList.toggle("active", section.id === sectionId);
    });
    if (!loggedInUser && sectionId !== "login") showSection("login");
}

// Display products
function displayProducts(filteredProducts = products) {
    const productGrid = document.getElementById("shop-products");
    productGrid.innerHTML = "";
    filteredProducts.forEach(product => {
        const div = document.createElement("div");
        div.className = "product-card";
        div.innerHTML = `
            <img src="${product.img}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>₹${product.price.toLocaleString()}</p>
            <div class="rating">${"★".repeat(Math.floor(product.rating)) + "☆".repeat(5 - Math.floor(product.rating))} (${product.rating})</div>
            <button onclick="showProduct(${product.id})">View</button>
        `;
        productGrid.appendChild(div);
    });
}

// Show product details
function showProduct(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    document.getElementById("product-img").src = product.img;
    document.getElementById("product-name").innerText = product.name;
    document.getElementById("product-price").innerText = `₹${product.price.toLocaleString()}`;
    document.getElementById("product-rating").innerText = `${"★".repeat(Math.floor(product.rating)) + "☆".repeat(5 - Math.floor(product.rating))} (${product.rating})`;
    document.getElementById("product-desc").innerText = product.desc;
    document.getElementById("product-stock").innerText = product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock";
    document.getElementById("product-add-btn").onclick = () => addToCart(product);
    document.getElementById("product-wishlist-btn").onclick = () => addToWishlist(product);
    const reviewsList = document.getElementById("product-reviews");
    reviewsList.innerHTML = "";
    product.reviews.forEach(review => {
        const li = document.createElement("li");
        li.innerText = review;
        reviewsList.appendChild(li);
    });
    showSection("product");
}

// Cart/Wishlist management
function addToCart(product) {
    if (product.stock <= 0) return alert("Out of stock!");
    cart.push({ ...product, cartId: Date.now() + Math.random() });
    product.stock--;
    updateCart();
    updateAdminProductList();
    alert(`${product.name} added to cart!`);
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
    const cartCount = document.getElementById("cart-count");
    cartItems.innerHTML = "";
    cart.forEach(item => {
        const li = document.createElement("li");
        li.innerHTML = `${item.name} - ₹${item.price.toLocaleString()} <button onclick="removeFromCart(${item.cartId})">Remove</button>`;
        cartItems.appendChild(li);
    });
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    cartTotal.innerText = total.toLocaleString();
    cartCount.innerText = cart.length;
}

function removeFromCart(cartId) {
    const item = cart.find(i => i.cartId === cartId);
    cart = cart.filter(i => i.cartId !== cartId);
    const product = products.find(p => p.id === item.id);
    product.stock++;
    updateCart();
    updateAdminProductList();
}

function updateWishlist() {
    const wishlistItems = document.getElementById("wishlist-items");
    const wishlistCount = document.getElementById("wishlist-count");
    wishlistItems.innerHTML = "";
    wishlist.forEach(item => {
        const li = document.createElement("li");
        li.innerHTML = `${item.name} - ₹${item.price.toLocaleString()} <button onclick="removeFromWishlist(${item.id})">Remove</button>`;
        wishlistItems.appendChild(li);
    });
    wishlistCount.innerText = wishlist.length;
}

function removeFromWishlist(productId) {
    wishlist = wishlist.filter(w => w.id !== productId);
    updateWishlist();
}

// Search, Sort, Filter
function searchProducts() {
    const query = document.getElementById("search").value.toLowerCase();
    const filtered = products.filter(p => p.name.toLowerCase().includes(query) || p.desc.toLowerCase().includes(query));
    displayProducts(filtered);
}

function sortProducts() {
    const sortValue = document.getElementById("sort").value;
    let sorted = [...products];
    if (sortValue === "high-to-low") sorted.sort((a, b) => b.price - a.price);
    else if (sortValue === "low-to-high") sorted.sort((a, b) => a.price - b.price);
    else if (sortValue === "rating") sorted.sort((a, b) => b.rating - a.rating);
    displayProducts(sorted);
}

function filterProducts() {
    const minPrice = parseFloat(document.getElementById("min-price").value) || 0;
    const maxPrice = parseFloat(document.getElementById("max-price").value) || Infinity;
    const category = document.getElementById("category").value;
    const filtered = products.filter(p => 
        p.price >= minPrice && p.price <= maxPrice && 
        (category === "all" || p.category === category)
    );
    displayProducts(filtered);
}

// Checkout
function placeOrder(event) {
    event.preventDefault();
    if (!loggedInUser) return alert("Please login first!");
    if (cart.length === 0) return alert("Cart is empty!");
    const total = cart.reduce((sum, item) => sum + item.price, 0);
    const paymentMethod = document.getElementById("payment-method").value;
    const order = { id: Date.now(), items: [...cart], total, status: "Processing", user: loggedInUser, paymentMethod };

    if (paymentMethod === "upi") {
        const upiId = prompt("Enter UPI ID (e.g., user@upi):");
        if (!/^[a-zA-Z0-9]+@[a-zA-Z0-9]+$/.test(upiId)) return alert("Invalid UPI ID!");
        simulateUPIPayment(total, upiId, order);
    } else {
        orders.push(order);
        document.getElementById("order-confirmation").innerText = `Order placed! Total: ₹${total.toLocaleString()} (${paymentMethod})`;
        document.getElementById("order-confirmation").style.display = "block";
        cart = [];
        updateCart();
        updateProfile();
        updateAdminOrderList();
    }
}

function simulateUPIPayment(amount, upiId, order) {
    setTimeout(() => {
        orders.push(order);
        document.getElementById("order-confirmation").innerText = `Order placed! Paid ₹${amount.toLocaleString()} via UPI (${upiId})`;
        document.getElementById("order-confirmation").style.display = "block";
        cart = [];
        updateCart();
        updateProfile();
        updateAdminOrderList();
    }, 1500);
}

// Reviews
function addReview() {
    const productName = document.getElementById("product-name").innerText;
    const product = products.find(p => p.name === productName);
    const review = document.getElementById("review-text").value;
    if (!review) return alert("Write a review first!");
    product.reviews.push(review);
    showProduct(product.id);
    document.getElementById("review-text").value = "";
}

// User management
function createAccount() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    if (!email || !password) return alert("Fill all fields!");
    if (users.some(u => u.email === email)) return alert("User already exists!");
    users.push({ email, password });
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
    profileInfo.innerHTML = loggedInUser ? `<p>Email: ${loggedInUser}</p>` : "<p>Please login</p>";
    orderHistory.innerHTML = "";
    orders.filter(o => o.user === loggedInUser).forEach(order => {
        const li = document.createElement("li");
        li.innerHTML = `Order #${order.id} - ₹${order.total.toLocaleString()} - ${order.status} 
            <button onclick="trackOrder(${order.id})">Track</button>
            <button onclick="returnOrder(${order.id})">Return</button>`;
        orderHistory.appendChild(li);
    });
}

function trackOrder(orderId) {
    alert(`Tracking Order #${orderId}: ${orders.find(o => o.id === orderId).status}`);
}

function returnOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (order.status === "Delivered") {
        order.status = "Return Requested";
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
        reviews: []
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
        const li = document.createElement("li");
        li.innerHTML = `${p.name} - ₹${p.price.toLocaleString()} (${p.category}) - Stock: ${p.stock}
            <button onclick="editProduct(${p.id})">Edit</button>
            <button onclick="deleteProduct(${p.id})">Delete</button>`;
        adminList.appendChild(li);
    });
}

function updateAdminOrderList() {
    const adminOrderList = document.getElementById("admin-order-list");
    adminOrderList.innerHTML = "";
    orders.forEach(o => {
        const li = document.createElement("li");
        li.innerHTML = `Order #${o.id} - ${o.user} - ₹${o.total.toLocaleString()} - ${o.status}
            <button onclick="updateOrderStatus(${o.id}, 'Shipped')">Ship</button>
            <button onclick="updateOrderStatus(${o.id}, 'Delivered')">Deliver</button>`;
        adminOrderList.appendChild(li);
    });
}

function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    const newName = prompt("New name:", product.name);
    const newPrice = parseFloat(prompt("New price:", product.price));
    if (newName && !isNaN(newPrice)) {
        product.name = newName;
        product.price = newPrice;
        displayProducts();
        updateAdminProductList();
        updateCart();
        updateWishlist();
    }
}

function deleteProduct(productId) {
    if (confirm("Delete this product?")) {
        products = products.filter(p => p.id !== productId);
        cart = cart.filter(item => item.id !== productId);
        wishlist = wishlist.filter(w => w.id !== productId);
        displayProducts();
        updateAdminProductList();
        updateCart();
        updateWishlist();
    }
}

function updateOrderStatus(orderId, status) {
    const order = orders.find(o => o.id === orderId);
    order.status = status;
    updateAdminOrderList();
    updateProfile();
}

function checkAdminAccess() {
    document.getElementById("admin").style.display = loggedInUser === "admin@example.com" ? "block" : "none";
}

// Initialize
displayProducts();
updateCart();
updateWishlist();
updateProfile();
updateAdminProductList();
updateAdminOrderList();
showSection("shop");
