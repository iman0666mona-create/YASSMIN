const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /orders - list all orders
router.get('/', (req, res) => {
  db.query('SELECT * FROM orders ORDER BY id DESC', [], (err, rows) => {
    if (err) {
      console.error('GET /orders error', err);
      return res.status(500).json({ error: 'Server error' });
    }
    res.json(rows.rows || rows); // pg returns { rows: [...] }
  });
});

// POST /orders - create order
router.post('/', (req, res) => {
  const {
    product_id, product_name, product_price,
    customer_name, customer_phone,
    wilaya, commune, address, size, color,
    created_at, status
  } = req.body;

  const q = `INSERT INTO orders
    (product_id, product_name, product_price, customer_name, customer_phone, wilaya, commune, address, size, color, created_at, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING id`;

  const params = [
    product_id || '', product_name || '', product_price || null,
    customer_name || '', customer_phone || '',
    wilaya || '', commune || '', address || '',
    size || '', color || '',
    created_at ? new Date(created_at) : new Date(), status || 'pending'
  ];

 db.query(
  `INSERT INTO products (name, price, description, category_id, media, colors, sizes)
   VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
  [name, price, description, category_id, media, colors, sizes],
  (err, result) => {
    if (err) {
      console.log('ERROR POST PRODUCT:', err);
      return res.status(500).json(err);
    }
    res.json({ message: 'Product added', id: result[0]?.id });
  }
);
});

// PATCH /orders/:id - partial update (e.g. status)
router.patch('/:id', (req, res) => {
  const id = req.params.id;
  const fields = req.body;
  const updates = [];
  const params = [];
  let idx = 1;
  for (const k in fields) {
    updates.push(`${k} = $${idx++}`);
    params.push(fields[k]);
  }
  if (!updates.length) return res.status(400).json({ error: 'No fields' });
  params.push(id);
  db.query(`UPDATE orders SET ${updates.join(', ')} WHERE id = $${idx}`, params, (err) => {
    if (err) {
      console.error('PATCH /orders/:id error', err);
      return res.status(500).json({ error: 'Server error' });
    }
    res.json({ ok: true });
  });
});

// DELETE /orders/:id
router.delete('/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM orders WHERE id = $1', [id], (err) => {
    if (err) {
      console.error('DELETE /orders/:id error', err);
      return res.status(500).json({ error: 'Server error' });
    }
    res.json({ ok: true });
  });
});

module.exports = router;