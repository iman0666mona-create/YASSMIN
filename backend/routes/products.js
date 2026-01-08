// routes/products.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const db = require('../db');

// ================== MULTER ==================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage }).array('media', 10);

// ================== GET ==================

router.get('/', (req, res) => {
  db.query('SELECT * FROM products', (err, results) => {
    if (err) {
      console.log('ERROR GET PRODUCTS:', err);
      return res.status(500).json(err);
    }
    res.json(results);
  });
});

// ✅ كل الألوان
router.get('/colors', (req, res) => {
  db.query('SELECT * FROM colors', (err, results) => {
    if (err) {
      console.log('ERROR GET COLORS:', err);
      return res.status(500).json(err);
    }
    res.json(results);
  });
});

// ✅ كل المقاسات
router.get('/sizes', (req, res) => {
  db.query('SELECT * FROM sizes', (err, results) => {
    if (err) {
      console.log('ERROR GET SIZES:', err);
      return res.status(500).json(err);
    }
    res.json(results);
  });
});


router.get('/:id', (req, res) => {
  const id = req.params.id;
  db.query('SELECT * FROM products WHERE id = $1', [id], (err, result) => {
    if (err) {
      console.log('ERROR GET PRODUCT:', err);
      return res.status(500).json(err);
    }
    if (!result.length) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(result[0]);
  });
});


// ================== POST ==================
router.post('/', upload, (req, res) => {
  const { name, price, description, category_id, colors, sizes } = req.body;

  let media = '[]';
  if (req.files && req.files.length) {
    media = JSON.stringify(req.files.map(f => f.filename));
  }

  db.query(
    `INSERT INTO products (name, price, description, category_id, media, colors, sizes)
     VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
    [name, price, description, category_id, media, colors, sizes],
    (err, rows) => {
      if (err) {
        console.log('ERROR POST PRODUCT:', err);
        return res.status(500).json(err);
      }
      const id = rows && rows[0] ? rows[0].id : null;
      res.json({ message: 'Product added', id });
    }
  );
});

// ================== PUT ==================
router.put('/:id', upload, (req, res) => {
  const id = req.params.id;
  const { name, price, description, category_id, colors, sizes } = req.body;

  let mediaSQL = '';
  let params = [name, price, description, category_id, colors, sizes];

  if (req.files && req.files.length) {
    mediaSQL = ', media = $7';
    params.push(JSON.stringify(req.files.map(f => f.filename)));
  }

  params.push(id);

  const sql = `
    UPDATE products
    SET name = $1, price = $2, description = $3, category_id = $4, colors = $5, sizes = $6
    ${mediaSQL}
    WHERE id = $${params.length}
  `;

  db.query(sql, params, err => {
    if (err) {
      console.log('ERROR PUT PRODUCT:', err);
      return res.status(500).json(err);
    }
    res.json({ message: 'Product updated' });
  });
});

// ================== DELETE ==================
router.delete('/:id', (req, res) => {
  const id = req.params.id;
  db.query('DELETE FROM products WHERE id = $1', [id], err => {
    if (err) {
      console.log('ERROR DELETE PRODUCT:', err);
      return res.status(500).json(err);
    }
    res.json({ message: 'Product deleted' });
  });
});



module.exports = router;
