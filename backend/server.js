// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5003;

// ================== CORS ==================
// سماح للطلبات من أي مكان (تجربة محلية)
// إذا تحبي تحددي الفرونت فقط، بدل '*' برابط الفرونت تاعك
app.use(cors({
  origin: '*', 
  methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ================== Body parsers ==================
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ================== Static folders ==================
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'frontend')));

// ================== Database ==================
const db = require('./db');

// ================== Routes ==================
app.use('/admin/products', require('./routes/products'));
app.use('/api/products', require('./routes/productspub'));
app.use('/orders', require('./routes/orders'));


// ================== Wilayas / Communes API (enable before the wildcard route) ==================
app.get('/api/wilayas', (req, res) => {
  const q = `
    SELECT DISTINCT wilaya_code AS id,
           COALESCE(NULLIF(wilaya_name_ascii, ''), wilaya_name) AS name
    FROM algeria_cities
    ORDER BY name ASC
  `;
  const db = require('./db');
  db.query(q, (err, rows) => {
    if (err) {
      console.error('GET /api/wilayas error', err);
      return res.status(500).json({ error: 'Server error' });
    }
    res.json(rows || []);
  });
});

app.get('/api/communes/:wilayaId', (req, res) => {
  const wid = req.params.wilayaId;
  const q = `
    SELECT id,
           COALESCE(NULLIF(commune_name_ascii, ''), commune_name) AS name
    FROM algeria_cities
    WHERE wilaya_code = $1
    ORDER BY name ASC
  `;
  const db = require('./db');
  db.query(q, [wid], (err, rows) => {
    if (err) {
      console.error('GET /api/communes error', err);
      return res.status(500).json({ error: 'Server error' });
    }
    res.json(rows || []);
  });
});

// ================== Default route → frontend ==================
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// ================== Start server ==================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
