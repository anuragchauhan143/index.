// Initialize Firebase
var config = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    databaseURL: "YOUR_DATABASE_URL",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};
firebase.initializeApp(config);

// Get elements
var header = document.querySelector("header");
var main = document.querySelector("main");
var footer = document.querySelector("footer");
var searchInput = document.querySelector(".search-bar input[type='search']");
var searchButton = document.querySelector(".search-bar button");
var productGrid = document.querySelector(".product-grid");
var cartPage = document.querySelector(".cart-page");
var wishlistPage = document.querySelector(".wishlist-page");
var checkoutFlow = document.querySelector(".checkout-flow");

// Add event listeners
searchButton.addEventListener("click", searchProducts);
productGrid.addEventListener("click", viewProductDetail);
cartPage.addEventListener("click", viewCart);
wishlistPage.addEventListener("click", viewWishlist);
checkoutFlow.addEventListener("click", checkout);

// Functions
function searchProducts() {
    var searchQuery = searchInput.value;
    // Use Firebase Firestore to search for products
    firebase.firestore().collection("products").where("name", "==", searchQuery).get().then(function(querySnapshot) {
        var products = querySnapshot.docs.map(function(doc) {
            return doc.data();
        });
        // Display search results
        productGrid.innerHTML = "";
        products.forEach(function(product) {
            var productCard = document.createElement("div");
            productCard.classList.add("product-card");
            productCard.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <p>Price: ${product.price}</p>
            `;
            productGrid.appendChild(productCard);
        });
    });
}

function viewProductDetail(event) {
    var productCard = event.target.closest(".product-card");
    var productId = productCard.dataset.productId;
    // Use Firebase Firestore to get product details
    firebase.firestore().collection("products").doc(productId).get().then(function(doc) {
        var product = doc.data();
        // Display product details
        var productDetail = document.createElement("div");
        productDetail.classList.add("product-detail");
        productDetail.innerHTML = `
            <h2>${product.name}</h2>
            <img src="${product.image}" alt="${product.name}">
            <p>${product.description}</p>
            <p>Price: ${product.price}</p>
        `;
        main.appendChild(productDetail);
    });
}

function viewCart() {
    // Use Firebase Firestore to get cart items
    firebase.firestore().collection("cart").get().then(function(querySnapshot) {
        var cartItems = querySnapshot.docs.map(function(doc) {
            return doc.data();
        });
        // Display cart items
        cartPage.innerHTML = "";
        cartItems.forEach(function(cartItem) {
            var cartItemCard = document.createElement("div");
            cartItemCard.classList.add("cart-item");
            cartItemCard.innerHTML = `
                <img src="${cartItem.image}" alt="${cartItem.name}">
                <h3>${cartItem.name}</h3>
                <p>Price: ${cartItem.price}</p>
            `;
            cartPage.appendChild(cartItemCard);
        });
    });
}

function viewWishlist() {
    // Use Firebase Firestore to get wishlist items
    firebase.firestore().collection("wishlist").get().then(function(querySnapshot) {
        var wishlistItems = querySnapshot.docs.map(function(doc) {
            return doc.data();
        });
        // Display wishlist items
        wishlistPage.innerHTML = "";
        wishlistItems.forEach(function(wishlistItem) {
            var wishlistItemCard = document.createElement("div");
            wishlistItemCard.classList.add("wishlist-item");
            wishlistItemCard.innerHTML = `
                <img src="${wishlistItem.image}" alt="${wishlistItem.name}">
                <h3>${wishlistItem.name}</h3>
                <p>Price: ${wishlistItem.price}</p>
            `;
            wishlistPage.appendChild(wishlistItemCard);
        });
    });
}

function checkout() {
    // Use Firebase Firestore to get order details
    firebase.firestore().collection("orders").get().then(function(querySnapshot) {
        var orders = querySnapshot.docs.map(function(doc) {
            return doc.data();
        });
        // Display order summary
        var orderSummary = document.createElement("div");
        orderSummary.classList.add("order-summary");
        orderSummary.innerHTML = `
            <h2>Order Summary</h2>
            <ul>
                ${orders.map(function(order) {
                    return `
                        <li>
                            <h3>${order.name}</h3>
                            <p>Price: ${order.price}</p>
                        </li>
                    `;
                }).join("")}
            </ul>
        `;
        main.appendChild(orderSummary);
    });
                                }
