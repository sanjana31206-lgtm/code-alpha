const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DB = {
  products: () => JSON.parse(fs.readFileSync('./data/products.json')),
  users: () => JSON.parse(fs.readFileSync('./data/users.json')),
  orders: () => JSON.parse(fs.readFileSync('./data/orders.json')),
  save: (file, data) => fs.writeFileSync(`./data/${file}.json`, JSON.stringify(data, null, 2))
};

// GET /products
app.get('/products', (req, res) => {
  const { search, category } = req.query;
  let products = DB.products();
  if (search) products = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  if (category && category !== 'all') products = products.filter(p => p.category === category);
  res.json(products);
});

app.get('/products/:id', (req, res) => {
  const product = DB.products().find(p => p.id == req.params.id);
  product ? res.json(product) : res.status(404).json({ error: 'Product not found' });
});

// POST /register
app.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
  const users = DB.users();
  if (users.find(u => u.email === email)) return res.status(409).json({ error: 'Email already registered' });
  const user = { id: crypto.randomUUID(), name, email, password, createdAt: new Date().toISOString() };
  users.push(user);
  DB.save('users', users);
  res.json({ message: 'Registration successful', user: { id: user.id, name, email } });
});

// POST /login
app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = DB.users().find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  res.json({ message: 'Login successful', user: { id: user.id, name: user.name, email: user.email } });
});

// POST /order
app.post('/order', (req, res) => {
  const { userEmail, products, totalPrice } = req.body;
  if (!userEmail || !products || !totalPrice) return res.status(400).json({ error: 'Missing order data' });
  const order = {
    orderId: 'ORD-' + crypto.randomUUID().slice(0, 8).toUpperCase(),
    userEmail,
    products,
    totalPrice,
    status: 'Confirmed',
    timestamp: new Date().toISOString()
  };
  const orders = DB.orders();
  orders.push(order);
  DB.save('orders', orders);
  console.log(`\n✅ NEW ORDER PLACED`);
  console.log(`   Order ID  : ${order.orderId}`);
  console.log(`   Customer  : ${userEmail}`);
  console.log(`   Total     : ₹${totalPrice}`);
  console.log(`   Items     : ${products.length}`);
  console.log(`   Time      : ${order.timestamp}\n`);
  res.json({ message: 'Order placed successfully', order });
});

// GET /orders
app.get('/orders', (req, res) => {
  const { email } = req.query;
  let orders = DB.orders();
  if (email) orders = orders.filter(o => o.userEmail === email);
  res.json(orders);
});

app.listen(3000, () => {
  console.log('🚀 CodeAlpha E-commerce Pro running at http://localhost:3000');
});
