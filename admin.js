const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3001; // Different port to avoid conflict

// MongoDB Connection
mongoose.connect('mongodb+srv://<your-username>:<your-password>@cluster0.mongodb.net/amarkart?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected for Admin'))
    .catch(err => console.log(err));

// Models
const UserSchema = new mongoose.Schema({
    email: String,
    password: String,
    isAdmin: { type: Boolean, default: false }
});
const ProductSchema = new mongoose.Schema({
    name: String,
    price: Number,
    desc: String,
    img: String,
    category: String,
    stock: Number
});
const OrderSchema = new mongoose.Schema({
    userId: String,
    items: Array,
    total: Number,
    method: String,
    date: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Product = mongoose.model('Product', ProductSchema);
const Order = mongoose.model('Order', OrderSchema);

// Middleware
app.use(bodyParser.json());
app.set('view engine', 'ejs');

// Admin Authentication Middleware (Updated with your correct email and password)
const authAdmin = (req, res, next) => {
    const { email, password } = req.query;
    if (email === 'anuragchauhan78760@gmail.com' && password === '__anurag__chauhan__') {
        next();
    } else {
        res.status(401).send('Unauthorized. Use email: anuragchauhan78760@gmail.com and password: __anurag__chauhan__');
    }
};

// Routes
app.get('/admin', authAdmin, (req, res) => {
    res.render('admin', { products: [], orders: [], users: [] }); // Initial render
});

app.get('/api/admin/products', authAdmin, async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

app.get('/api/admin/orders', authAdmin, async (req, res) => {
    const orders = await Order.find();
    res.json(orders);
});

app.get('/api/admin/users', authAdmin, async (req, res) => {
    const users = await User.find();
    res.json(users);
});

app.post('/api/admin/products', authAdmin, async (req, res) => {
    const { name, price, desc, img, category, stock } = req.body;
    const product = new Product({ name, price, desc, img, category, stock });
    await product.save();
    res.json(product);
});

app.put('/api/admin/products/:id', authAdmin, async (req, res) => {
    const { id } = req.params;
    const update = req.body;
    const product = await Product.findByIdAndUpdate(id, update, { new: true });
    res.json(product);
});

app.delete('/api/admin/products/:id', authAdmin, async (req, res) => {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    res.sendStatus(200);
});

app.get('/admin/dashboard', authAdmin, (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Amarkart Admin Panel</title>
            <style>
                body { font-family: Arial, sans-serif; background: #f1f3f6; padding: 20px; }
                .dashboard { max-width: 1200px; margin: 0 auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                h1 { color: #2874f0; margin-bottom: 20px; }
                .tab { overflow: hidden; border-bottom: 1px solid #ddd; }
                .tab button { background-color: inherit; float: left; border: none; outline: none; cursor: pointer; padding: 14px 16px; transition: 0.3s; font-size: 16px; }
                .tab button:hover { background-color: #ddd; }
                .tab button.active { background-color: #ff6161; color: white; }
                .tabcontent { display: none; padding: 20px; }
                .product-form input, .product-form select, .product-form button { width: 100%; padding: 10px; margin: 5px 0; border: 1px solid #d5d9d9; border-radius: 4px; }
                .product-form button { background: #ff6161; color: #fff; border: none; cursor: pointer; }
                .product-form button:hover { background: #ff8f8f; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                table, th, td { border: 1px solid #ddd; }
                th, td { padding: 12px; text-align: left; }
                th { background-color: #2874f0; color: white; }
                .delete-btn { background: #ff4444; color: white; border: none; padding: 5px 10px; cursor: pointer; }
                .delete-btn:hover { background: #cc0000; }
            </style>
        </head>
        <body>
            <div class="dashboard">
                <h1>Amarkart Admin Panel</h1>
                <div class="tab">
                    <button class="tablinks" onclick="openTab(event, 'Products')">Products</button>
                    <button class="tablinks" onclick="openTab(event, 'Orders')">Orders</button>
                    <button class="tablinks" onclick="openTab(event, 'Users')">Users</button>
                </div>

                <div id="Products" class="tabcontent">
                    <h2>Manage Products</h2>
                    <form class="product-form" onsubmit="addProduct(event)">
                        <input type="text" id="product-name" placeholder="Product Name" required>
                        <input type="number" id="product-price" placeholder="Price (₹)" required>
                        <input type="text" id="product-desc" placeholder="Description" required>
                        <input type="text" id="product-img" placeholder="Image URL" required>
                        <select id="product-category" required>
                            <option value="Electronics">Electronics</option>
                            <option value="Clothes">Fashion</option>
                            <option value="Handmade">Handmade</option>
                            <option value="Digital">Digital</option>
                        </select>
                        <input type="number" id="product-stock" placeholder="Stock" required>
                        <button type="submit">Add Product</button>
                    </form>
                    <table id="product-table">
                        <tr><th>Name</th><th>Price</th><th>Stock</th><th>Action</th></tr>
                    </table>
                </div>

                <div id="Orders" class="tabcontent">
                    <h2>Manage Orders</h2>
                    <table id="order-table">
                        <tr><th>Order ID</th><th>Total</th><th>Method</th><th>Date</th></tr>
                    </table>
                </div>

                <div id="Users" class="tabcontent">
                    <h2>Manage Users</h2>
                    <table id="user-table">
                        <tr><th>Email</th><th>Action</th></tr>
                    </table>
                </div>
            </div>

            <script>
                let products = [];
                let orders = [];
                let users = [];

                function openTab(evt, tabName) {
                    var i, tabcontent, tablinks;
                    tabcontent = document.getElementsByClassName("tabcontent");
                    for (i = 0; i < tabcontent.length; i++) {
                        tabcontent[i].style.display = "none";
                    }
                    tablinks = document.getElementsByClassName("tablinks");
                    for (i = 0; i < tablinks.length; i++) {
                        tablinks[i].className = tablinks[i].className.replace(" active", "");
                    }
                    document.getElementById(tabName).style.display = "block";
                    evt.currentTarget.className += " active";
                }

                function fetchData() {
                    fetch('/api/admin/products').then(r => r.json()).then(data => { products = data; renderProducts(); });
                    fetch('/api/admin/orders').then(r => r.json()).then(data => { orders = data; renderOrders(); });
                    fetch('/api/admin/users').then(r => r.json()).then(data => { users = data; renderUsers(); });
                }

                function renderProducts() {
                    const table = document.getElementById('product-table');
                    table.innerHTML = '<tr><th>Name</th><th>Price</th><th>Stock</th><th>Action</th></tr>';
                    products.forEach(p => {
                        const row = table.insertRow();
                        row.insertCell(0).innerText = p.name;
                        row.insertCell(1).innerText = `₹${p.price}`;
                        row.insertCell(2).innerText = p.stock;
                        row.insertCell(3).innerHTML = `<button class="delete-btn" onclick="deleteProduct('${p._id}')">Delete</button>`;
                    });
                }

                function renderOrders() {
                    const table = document.getElementById('order-table');
                    table.innerHTML = '<tr><th>Order ID</th><th>Total</th><th>Method</th><th>Date</th></tr>';
                    orders.forEach(o => {
                        const row = table.insertRow();
                        row.insertCell(0).innerText = o._id;
                        row.insertCell(1).innerText = `₹${o.total}`;
                        row.insertCell(2).innerText = o.method;
                        row.insertCell(3).innerText = new Date(o.date).toLocaleString();
                    });
                }

                function renderUsers() {
                    const table = document.getElementById('user-table');
                    table.innerHTML = '<tr><th>Email</th><th>Action</th></tr>';
                    users.forEach(u => {
                        const row = table.insertRow();
                        row.insertCell(0).innerText = u.email;
                        row.insertCell(1).innerHTML = `<button class="delete-btn" onclick="deleteUser('${u._id}')">Delete</button>`;
                    });
                }

                function addProduct(event) {
                    event.preventDefault();
                    fetch('/api/admin/products', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: document.getElementById('product-name').value,
                            price: parseInt(document.getElementById('product-price').value),
                            desc: document.getElementById('product-desc').value,
                            img: document.getElementById('product-img').value,
                            category: document.getElementById('product-category').value,
                            stock: parseInt(document.getElementById('product-stock').value)
                        })
                    }).then(() => fetchData());
                }

                function deleteProduct(id) {
                    fetch(`/api/admin/products/${id}`, { method: 'DELETE' }).then(() => fetchData());
                }

                function deleteUser(id) {
                    fetch(`/api/admin/users/${id}`, { method: 'DELETE' }).then(() => fetchData());
                }

                document.addEventListener('DOMContentLoaded', () => {
                    openTab(event, 'Products');
                    fetchData();
                    setInterval(fetchData, 5000); // Auto-refresh every 5 seconds
                });
            </script>
            </body>
            </html>
    `);
});

app.listen(port, () => console.log(`Admin server running on port ${port}`));
