const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3001;

mongoose.connect('mongodb+srv://anuragchauhan78760:__anurag__chauhan__@anurakart.z4ltcpf.mongodb.net/anurakart?retryWrites=true&w=majority&appName=anurakart', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected')).catch(err => console.log(err));

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

app.use(bodyParser.json());
app.set('view engine', 'ejs');

const authAdmin = (req, res, next) => {
  const { email, password } = req.query;
  if (email === 'anuragchauhan78760@gmail.com' && password === '__anurag__chauhan__') {
    next();
  } else {
    res.status(401).send('Unauthorized');
  }
};

app.get('/admin', authAdmin, (req, res) => {
  res.render('admin');
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

app.delete('/api/admin/users/:id', authAdmin, async (req, res) => {
  const { id } = req.params;
  await User.findByIdAndDelete(id);
  res.sendStatus(200);
});

app.listen(port, () => console.log(`Admin panel running on port ${port}`));
