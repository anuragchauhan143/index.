// Data with 150 products
const generateProducts = () => {
    const categories = ["Electronics", "Fashion", "Home", "Books"];
    const brands = ["TechTrend", "StyleVibe", "HomeEssence", "BookWorm"];
    const products = [];
    for (let i = 1; i <= 150; i++) {
        const category = categories[Math.floor(Math.random() * categories.length)];
        const brand = brands[Math.floor(Math.random() * brands.length)];
        const name = `${brand} ${category} Item ${i}`;
        products.push({
            id: i,
            name,
            price: Math.floor(Math.random() * 50000) + 500,
            category,
            desc: `${name} - High-quality product with great features.`,
            img: `https://via.placeholder.com/150?text=${name.replace(/\s/g, "+")}`,
            stock: Math.floor(Math.random() * 100),
            rating: (Math.random() * 2 + 3).toFixed(1),
            reviews: [],
            createdAt: Date.now() - Math.floor(Math.random() * 10000000000)
        });
    }
    return products;
};

let products = JSON.parse(localStorage.getItem("products")) || generateProducts();
let cart = JSON.parse(localStorage.getItem("cart")) || [];
let wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
let orders = JSON.parse(localStorage.getItem("orders")) || [];
let users = JSON.parse(localStorage.getItem("users")) || [];
let loggedInUser = localStorage.getItem("loggedInUser") || null;
let adminLoggedIn = JSON.parse(localStorage.getItem("adminLoggedIn")) || false;
let adminPassword = localStorage.getItem("adminPassword") || "admin123"; // Default password

// Utility
function showSection(sectionId) {
    if (!loggedInUser && sectionId !== "login" && sectionId !== "admin-login") return showSection("login");
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
    localStorage.setItem("adminLoggedIn", JSON.stringify(adminLoggedIn));
    localStorage.setItem("adminPassword", adminPassword);
}

function toggleTheme() {
    document.body.classList.toggle("dark");
    document.getElementById("theme-toggle").innerText = document.body.classList.contains("dark") ? "☀️" : "🌙";
}

// Search
function searchProducts() {
    const query = document.getElementById("search").value.toLowerCase().trim();
    const suggestions = document.getElementById("search-suggestions");
    const filtered = products.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.desc.toLowerCase().includes(query) || 
        p.category.toLowerCase().includes(query)
    );

    suggestions.innerHTML = filtered.slice(0, 10).map(p => `
        <div onclick="showProduct(${p.id})">
            <strong>${p.name}</strong> - ${p.category} (₹${p.price.toLocaleString()})
        </div>
    `).join("");
    suggestions.style.display = query && filtered.length ? "block" : "none";
    displayProducts(filtered);
}

// Display products
function displayProducts(filteredProducts = products) {
    const productGrid = document.getElementById("shop-products");
    productGrid.innerHTML = "";
    filteredProducts.forEach(product => {
        const div = document.createElement("div");
        div.className = "product-card";
        div.innerHTML = `
            <img src="${product.img}" alt="${product.name}" loading="lazy">
            <h3>${product.name}</h3>
            <p>₹${product.price.toLocaleString()}</p>
            <div class="rating">${"★".repeat(Math.floor(product.rating)) + "☆".repeat(5 - Math.floor(product.rating))} (${product.rating})</div>
            <button onclick="showProduct(${product.id})">View Details</button>
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
    document.getElementById("product-quantity").value = 1;
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
    const cartCount = document.getElementById("cart-count");
    cartItems.innerHTML = "";
    cart.forEach(item => {
        const li = document.createElement("li");
        li.innerHTML = `${item.name} - ₹${(item.price * item.quantity).toLocaleString()} (${item.quantity}) 
            <button onclick="removeFromCart(${item.cartId})">Remove</button>`;
        cartItems.appendChild(li);
    });
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    cartTotal.innerText = total.toLocaleString();
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
        const li = document.createElement("li");
        li.innerHTML = `${item.name} - ₹${item.price.toLocaleString()} 
            <button onclick="removeFromWishlist(${item.id})">Remove</button>`;
        wishlistItems.appendChild(li);
    });
    wishlistCount.innerText = wishlist.length;
}

function removeFromWishlist(productId) {
    wishlist = wishlist.filter(w => w.id !== productId);
    updateWishlist();
}

// Sort/Filter
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
        }
    };
    orders.push(order);
    document.getElementById("order-confirmation").innerText = `Order #${order.id} placed! Total: ₹${total.toLocaleString()} (${paymentMethod})`;
    document.getElementById("order-confirmation").style.display = "block";
    cart = [];
    updateCart();
    updateProfile();
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
    showSection("shop");
}

function logout() {
    loggedInUser = null;
    adminLoggedIn = false;
    showSection("login");
}

// Admin Panel Functions
function loginAdmin() {
    const password = document.getElementById("admin-password").value;
    if (password === adminPassword) {
        adminLoggedIn = true;
        document.getElementById("admin-login-message").innerText = "";
        showSection("admin");
        updateAdminProductList();
    } else {
        document.getElementById("admin-login-message").innerText = "Incorrect password!";
    }
    document.getElementById("admin-password").value = "";
}

function logoutAdmin() {
    adminLoggedIn = false;
    showSection("shop");
}

function addProduct() {
    if (!adminLoggedIn) return alert("Please login as admin first!");
    const newProduct = {
        id: products.length + 1,
        name: document.getElementById("admin-product-name").value.trim(),
        price: parseFloat(document.getElementById("admin-product-price").value),
        desc: document.getElementById("admin-product-desc").value.trim(),
        img: document.getElementById("admin-product-img").value.trim() || "https://via.placeholder.com/150",
        category: document.getElementById("admin-product-category").value,
        stock: parseInt(document.getElementById("admin-product-stock").value),
        rating: 0,
        reviews: [],
        createdAt: Date.now()
    };
    if (!newProduct.name || isNaN(newProduct.price) || !newProduct.desc || newProduct.stock < 0) return alert("Please fill all required fields correctly!");
    products.push(newProduct);
    displayProducts();
    updateAdminProductList();
    clearAdminForm();
    alert(`${newProduct.name} added successfully!`);
}

function clearAdminForm() {
    document.getElementById("admin-product-name").value = "";
    document.getElementById("admin-product-price").value = "";
    document.getElementById("admin-product-desc").value = "";
    document.getElementById("admin-product-img").value = "";
    document.getElementById("admin-product-stock").value = "";
}

function updateAdminProductList(filteredProducts = products) {
    if (!adminLoggedIn) return;
    const adminList = document.getElementById("admin-product-list");
    adminList.innerHTML = "";
    filteredProducts.forEach(p => {
        const li = document.createElement("li");
        li.innerHTML = `
            ${p.name} - ₹${p.price.toLocaleString()} (${p.category}) - Stock: ${p.stock}
            <div>
                <button onclick="editProduct(${p.id})">Edit</button>
                <button onclick="deleteProduct(${p.id})">Delete</button>
            </div>
        `;
        adminList.appendChild(li);
    });
}

function searchAdminProducts() {
    if (!adminLoggedIn) return;
    const query = document.getElementById("admin-search").value.toLowerCase().trim();
    const filtered = products.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.desc.toLowerCase().includes(query) || 
        p.category.toLowerCase().includes(query)
    );
    updateAdminProductList(filtered);
}

function editProduct(productId) {
    if (!adminLoggedIn) return alert("Please login as admin first!");
    const product = products.find(p => p.id === productId);
    if (!product) return;
    document.getElementById("admin-product-name").value = product.name;
    document.getElementById("admin-product-price").value = product.price;
    document.getElementById("admin-product-desc").value = product.desc;
    document.getElementById("admin-product-img").value = product.img;
    document.getElementById("admin-product-category").value = product.category;
    document.getElementById("admin-product-stock").value = product.stock;
    deleteProduct(productId); // Remove old version, user will re-add edited version
    alert("Edit the details and click 'Add Product' to save changes.");
}

function deleteProduct(productId) {
    if (!adminLoggedIn) return alert("Please login as admin first!");
    if (confirm("Are you sure you want to delete this product?")) {
        products = products.filter(p => p.id !== productId);
        cart = cart.filter(item => item.id !== productId);
        wishlist = wishlist.filter(w => w.id !== productId);
        displayProducts();
        updateAdminProductList();
        updateCart();
        updateWishlist();
    }
}

function changeAdminPassword() {
    if (!adminLoggedIn) return alert("Please login as admin first!");
    const newPassword = document.getElementById("new-admin-password").value.trim();
    if (newPassword.length < 6) return alert("Password must be at least 6 characters long!");
    adminPassword = newPassword;
    document.getElementById("new-admin-password").value = "";
    document.getElementById("password-change-message").innerText = "Admin password changed successfully!";
    saveData();
}

// Initialize
displayProducts();
updateCart();
updateWishlist();
updateProfile();
if (adminLoggedIn) {
    showSection("admin");
    updateAdminProductList();
} else {
    showSection(loggedInUser ? "shop" : "login");
}
if (document.body.classList.contains("dark")) document.getElementById("theme-toggle").innerText = "☀️";

function updateProfile() {
    const profileInfo = document.getElementById("profile-info");
    const orderHistory = document.getElementById("order-history");
    profileInfo.innerHTML = loggedInUser ? `<p>Email: ${loggedInUser}</p>` : "<p>Please login</p>";
    orderHistory.innerHTML = "";
    orders.filter(o => o.user === loggedInUser).forEach(order => {
        const li = document.createElement("li");
        li.innerHTML = `Order #${order.id} - ₹${order.total.toLocaleString()} - ${order.status}`;
        orderHistory.appendChild(li);
    });
        }
