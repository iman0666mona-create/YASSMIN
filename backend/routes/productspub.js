// ...existing code...
const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /products (public)
router.get('/', (req, res) => {
  const q = `SELECT id, name, price, description, media, colors, sizes, category_id
             FROM products
             ORDER BY id DESC`;
  db.query(q, (err, rows) => {
  if (err) {
    console.error('GET /products error', err);
    return res.status(500).json({ error: 'Server error' });
  }

  console.log('PRODUCTS FROM DB:', rows); // 👈 هذا هو المهم

  const out = (rows || []).map(r => r);

  res.json(out);
});

});

// GET /products/:id (public)
router.get('/:id', (req, res) => {
  const id = req.params.id;
  const q = `SELECT id, name, price, description, media, colors, sizes, category_id
             FROM products
             WHERE id = $1`;
  db.query(q, [id], (err, rows) => {
    if (err) {
      console.error('GET /products/:id error', err);
      return res.status(500).json({ error: 'Server error' });
    }
    if (!rows.length) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(rows[0]);
  });
});

module.exports = router;
// ...existing code...