const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Хранилище заявок (в реальном проекте - база данных)
const ORDERS_FILE = path.join(__dirname, 'orders.json');

function loadOrders() {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      return JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Error loading orders:', e);
  }
  return [];
}

function saveOrder(order) {
  const orders = loadOrders();
  orders.unshift({
    ...order,
    id: Date.now(),
    createdAt: new Date().toISOString()
  });
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
  return order;
}

// API: получить все заявки
app.get('/api/orders', (req, res) => {
  const orders = loadOrders();
  res.json(orders);
});

// API: создать заявку
app.post('/api/orders', (req, res) => {
  try {
    const order = saveOrder(req.body);
    console.log('New order:', order);
    res.json({ success: true, order });
  } catch (e) {
    console.error('Error saving order:', e);
    res.status(500).json({ error: 'Failed to save order' });
  }
});

// API: статистика
app.get('/api/stats', (req, res) => {
  const orders = loadOrders();
  const stats = {
    total: orders.length,
    thisMonth: orders.filter(o => {
      const date = new Date(o.createdAt);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length,
    avgPrice: orders.length > 0 
      ? Math.round(orders.reduce((a, b) => a + (b.total || 0), 0) / orders.length)
      : 0
  };
  res.json(stats);
});

app.listen(PORT, () => {
  console.log(`🚀 Novasat Calculator API running on port ${PORT}`);
});
