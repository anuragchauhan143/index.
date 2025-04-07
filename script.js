let products = JSON.parse(localStorage.getItem("products")) || [];
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
let orders = JSON.parse(localStorage.getItem("orders")) || [];
let users = JSON.parse(localStorage.getItem("users")) || [];
let loggedInUser = localStorage.getItem("loggedInUser") || null;
let adminLoggedIn = JSON.parse(localStorage.getItem("adminLoggedIn")) || false;
let currentPage = 1;
const itemsPerPage = 12;

const defaultAdmin = { email: "anuragchauhan78760@gmail.com", password: "__anurag__chauhan__" };
if (!users.some(u => u.email === defaultAdmin.email)) {
    users.push(defaultAdmin);
    localStorage.setItem("users", JSON.stringify(users));
}

function showPage(pageId) {
    if (!loggedInUser && pageId !== "login" && pageId !== "admin-login") return showPage("login");
    document.querySelectorAll(".page").forEach(page => {
        page.classList.toggle("active", page.id === pageId);
    });
    if (pageId === "shop") currentPage = 1;
    updateUI();
}

function saveData() {
    localStorage.setItem("products", JSON.stringify(products));
    localStorage.setItem("cart", JSON.stringify(cart));
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    localStorage.setItem("orders", JSON.stringify(orders));
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("loggedInUser", loggedInUser);
    localStorage.setItem("adminLoggedIn", JSON.stringify(adminLoggedIn));
}

function toggleTheme() {
    document.body.classList.toggle("dark");
    document.getElementById("theme-toggle").innerText = document.body.classList.contains("dark") ? "☀️" : "🌙";
}

function searchProducts() {
    const query = document.getElementById("search").value.toLowerCase();
    const suggestions = document.getElementById("search-suggestions");
    const filtered = products.filter(p => p.name.toLowerCase().includes(query) || p.brand.toLowerCase().includes(query));
    suggestions.innerHTML = filtered.slice(0, 5).map(p => `<div onclick="showProduct(${p.id})">${p.name} - ${p.brand}</div>`).join("");
    suggestions.style.display = query && filtered.length ? "block" : "none";
    displayProducts(filtered);
}

function displayProducts(filteredProducts = products, isDeals = false) {
    const productList = isDeals ? document.getElementById("deal-products") : document.getElementById("product-list");
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginated = filteredProducts.slice(start, end);
    productList.innerHTML = paginated.map(p => `
        <div class="product-card">
            <img src="${p.img}" alt="${p.name}" onclick="showProduct(${p.id})">
            <h3>${p.name}</h3>
            <p>₹${p.price.toLocaleString()}</p>
            <div>${"★".repeat(Math.floor(p.rating))} (${p.rating})</div>
            <button onclick="addToCart(${p.id})">Add to Cart</button>
        </div>
    `).join("");
    if (!isDeals) {
        document.getElementById("page-info").innerText = `Page ${currentPage} of ${Math.ceil(filteredProducts.length / itemsPerPage)}`;
    }
}

function showProduct(productId) {
    const product = products.find(p => p.id === productId);
    document.getElementById("product-img").src = product.img;
    document.getElementById("product-name").innerText = product.name;
    document.getElementById("product-price").innerText = `₹${product.price.toLocaleString()}`;
    document.getElementById("product-rating").innerText = `${"★".repeat(Math.floor(product.rating))} (${product.rating})`;
    document.getElementById("product-desc").innerText = product.desc;
    document.getElementById("product-stock").innerText = product.stock > 0 ? `${product.stock} in stock` : "Out of Stock";
    document.getElementById("quantity").value = 1;
    showPage("product");
    window.currentProductId = productId;
}

function addToCart(productId = window.currentProductId) {
    const product = products.find(p => p.id === productId);
    const quantity = parseInt(document.getElementById("quantity")?.value || 1);
    if (product.stock < quantity) return alert("Stock kam hai!");
    cart.push({ ...product, cartId: Date.now(), quantity });
    product.stock -= quantity;
    updateCart();
    saveData();
    alert(`${product.name} cart mein add hua!`);
}

function addToWishlist() {
    const product = products.find(p => p.id === window.currentProductId);
    if (!wishlist.some(w => w.id === product.id)) {
        wishlist.push(product);
        updateWishlist();
        alert(`${product.name} wishlist mein add hua!`);
    }
}

function updateCart() {
    const cartItems = document.getElementById("cart-items");
    const cartTotal = document.getElementById("cart-total");
    const cartCount = document.getElementById("cart-count");
    cartItems.innerHTML = cart.map(item => `
        <li>${item.name} - ₹${(item.price * item.quantity).toLocaleString()} (x${item.quantity})
            <button onclick="removeFromCart(${item.cartId})">Remove</button>
        </li>
    `).join("");
    cartTotal.innerText = cart.reduce((sum, item) => sum + item.price * item.quantity, 0).toLocaleString();
    cartCount.innerText = cart.length;
}

function removeFromCart(cartId) {
    const item = cart.find(i => i.cartId === cartId);
    cart = cart.filter(i => i.cartId !== cartId);
    const product = products.find(p => p.id === item.id);
    product.stock += item.quantity;
    updateCart();
    saveData();
}

function applyCoupon() {
    const coupon = document.getElementById("coupon").value;
    if (coupon === "SAVE10") {
        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        document.getElementById("cart-total").innerText = (total * 0.9).toLocaleString();
        alert("10% discount applied!");
    } else {
        alert("Invalid coupon!");
    }
}

function updateWishlist() {
    const wishlistItems = document.getElementById("wishlist-items");
    const wishlistCount = document.getElementById("wishlist-count");
    wishlistItems.innerHTML = wishlist.map(w => `
        <li>${w.name} - ₹${w.price.toLocaleString()}
            <button onclick="removeFromWishlist(${w.id})">Remove</button>
            <button onclick="addToCart(${w.id})">Add to Cart</button>
        </li>
    `).join("");
    wishlistCount.innerText = wishlist.length;
}

function removeFromWishlist(productId) {
    wishlist = wishlist.filter(w => w.id !== productId);
    updateWishlist();
    saveData();
}

function sortProducts() {
    const sort = document.getElementById("sort").value;
    let sorted = [...products];
    if (sort === "price-low") sorted.sort((a, b) => a.price - b.price);
    else if (sort === "price-high") sorted.sort((a, b) => b.price - a.price);
    else if (sort === "rating") sorted.sort((a, b) => b.rating - a.rating);
    else if (sort === "popularity") sorted.sort((a, b) => b.id - a.id);
    displayProducts(sorted);
}

function filterProducts() {
    const minPrice = parseFloat(document.getElementById("min-price").value) || 0;
    const maxPrice = parseFloat(document.getElementById("max-price").value) || Infinity;
    const brand = document.getElementById("brand-filter").value;
    const filtered = products.filter(p => 
        p.price >= minPrice && p.price <= maxPrice && 
        (brand === "all" || p.brand === brand)
    );
    displayProducts(filtered);
}

function filterCategory(category) {
    const filtered = products.filter(p => p.category === category);
    displayProducts(filtered);
    showPage("shop");
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        displayProducts();
    }
}

function nextPage() {
    const maxPage = Math.ceil(products.length / itemsPerPage);
    if (currentPage < maxPage) {
        currentPage++;
        displayProducts();
    }
}

function placeOrder(event) {
    event.preventDefault();
    if (!cart.length) return alert("Cart khali hai!");
    const order = {
        id: Date.now(),
        items: [...cart],
        total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
        user: loggedInUser,
        status: "Pending",
        details: {
            name: document.getElementById("name").value,
            address: document.getElementById("address").value,
            phone: document.getElementById("phone").value,
            payment: document.getElementById("payment").value
        }
    };
    orders.push(order);
    document.getElementById("order-message").innerText = `Order placed! #${order.id}`;
    cart = [];
    updateCart();
    updateProfile();
    saveData();
}

function createAccount() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    if (users.some(u => u.email === email)) return alert("Email pehle se hai!");
    users.push({ email, password, addresses: [] });
    loggedInUser = email;
    showPage("shop");
    saveData();
}

function login() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return alert("Galat email ya password!");
    loggedInUser = email;
    showPage("shop");
    saveData();
}

function logout() {
    loggedInUser = null;
    adminLoggedIn = false;
    showPage("login");
}

function adminLogin() {
    const email = document.getElementById("admin-email").value;
    const password = document.getElementById("admin-password").value;
    if (email === "anuragchauhan78760@gmail.com" && password === "__anurag__chauhan__") {
        adminLoggedIn = true;
        showPage("admin");
        updateAdminUI();
    } else {
        document.getElementById("admin-login-message").innerText = "Galat email ya password!";
    }
}

function adminLogout() {
    adminLoggedIn = false;
    showPage("shop");
}

function addProduct() {
    if (!adminLoggedIn) return alert("Admin login karo!");
    const product = {
        id: products.length + 1,
        name: document.getElementById("product-name").value,
        price: parseFloat(document.getElementById("product-price").value),
        desc: document.getElementById("product-desc").value,
        img: document.getElementById("product-img").value || "https://via.placeholder.com/150",
        brand: document.getElementById("product-brand").value,
        category: document.getElementById("product-category").value,
        stock: parseInt(document.getElementById("product-stock").value),
        rating: 0
    };
    products.push(product);
    updateAdminUI();
    displayProducts();
    saveData();
}

function updateAdminUI() {
    const productList = document.getElementById("admin-product-list");
    productList.innerHTML = products.map(p => `
        <li>${p.name} - ₹${p.price} - ${p.brand} - Stock: ${p.stock}
            <button onclick="deleteProduct(${p.id})">Delete</button>
        </li>
    `).join("");
    const orderList = document.getElementById("admin-order-list");
    orderList.innerHTML = orders.map(o => `
        <li>Order #${o.id} - ₹${o.total} - ${o.status} - ${o.user}
            <button onclick="updateOrderStatus(${o.id}, 'Shipped')">Ship</button>
            <button onclick="updateOrderStatus(${o.id}, 'Delivered')">Deliver</button>
        </li>
    `).join("");
    const userList = document.getElementById("admin-user-list");
    userList.innerHTML = users.map(u => `
        <li>${u.email} - Orders: ${orders.filter(o => o.user === u.email).length}
            <button onclick="blockUser('${u.email}')">Block</button>
        </li>
    `).join("");
}

function deleteProduct(productId) {
    products = products.filter(p => p.id !== productId);
    cart = cart.filter(c => c.id !== productId);
    wishlist = wishlist.filter(w => w.id !== productId);
    updateAdminUI();
    displayProducts();
    saveData();
}

function updateOrderStatus(orderId, status) {
    const order = orders.find(o => o.id === orderId);
    order.status = status;
    updateAdminUI();
    updateProfile();
    saveData();
}

function blockUser(email) {
    const user = users.find(u => u.email === email);
    user.blocked = !user.blocked;
    if (user.blocked && loggedInUser === email) logout();
    updateAdminUI();
    saveData();
}

function updateProfile() {
    const user = users.find(u => u.email === loggedInUser);
    document.getElementById("profile-info").innerHTML = loggedInUser ? `Email: ${loggedInUser}` : "Login karo!";
    const orderHistory = document.getElementById("order-history");
    orderHistory.innerHTML = orders.filter(o => o.user === loggedInUser).map(o => `
        <li>Order #${o.id} - ₹${o.total} - ${o.status}</li>
    `).join("");
    const addresses = document.getElementById("saved-addresses");
    addresses.innerHTML = user?.addresses?.map(a => `<li>${a}</li>`).join("") || "Koi address nahi!";
}

function updateUI() {
    displayProducts();
    displayProducts(products.slice(0, 4), true); // Top Deals
    updateCart();
    updateWishlist();
    updateProfile();
    if (adminLoggedIn) updateAdminUI();
}

// Dummy Products
if (!products.length) {
    const brands = ["TechTrend", "StyleVibe", "HomeEssence", "BookWorm"];
    for (let i = 1; i <= 100; i++) {
        const category = ["Electronics", "Fashion", "Home", "Books"][Math.floor(Math.random() * 4)];
        const brand = brands[Math.floor(Math.random() * brands.length)];
        products.push({
            id: i,
            name: `${brand} Item ${i}`,
            price: Math.floor(Math.random() * 50000) + 500,
            desc: `High-quality ${category} product by ${brand}.`,
            img: `https://via.placeholder.com/150?text=${brand}+Item+${i}`,
            brand,
            category,
            stock: Math.floor(Math.random() * 100),
            rating: (Math.random() * 4 + 1).toFixed(1)
        });
    }
    saveData();
}

showPage(loggedInUser ? "shop" : "login");
