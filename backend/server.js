const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5003;

// simple request logger for debugging
app.use((req, res, next) => {
  console.log(new Date().toISOString(), req.method, req.path);
  next();
});

// ================== CORS & body parsers ==================
app.use(cors({
  origin: '*',
  methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ================== Database ==================
const db = require('./db');

// ================== Routes (API first) ==================
app.use('/admin/products', require('./routes/products'));
app.use('/api/products', require('./routes/productspub'));
app.use('/orders', require('./routes/orders'));

// Wilayas / Communes with explicit logging
app.get('/api/wilayas', (req, res) => {
  console.log('HANDLER: GET /api/wilayas');
  const q = `
    SELECT DISTINCT wilaya_code AS id,
           COALESCE(NULLIF(wilaya_name_ascii, ''), wilaya_name) AS name
    FROM algeria_cities
    ORDER BY name ASC
  `;
  db.query(q, (err, rows) => {
    res.setHeader('Content-Type', 'application/json');
    if (err) {
      console.error('GET /api/wilayas error', err);
      return res.status(200).send(JSON.stringify([]));
    }
    return res.status(200).send(JSON.stringify(rows || []));
  });
});

app.get('/api/communes/:wilayaId', (req, res) => {
  console.log('HANDLER: GET /api/communes/', req.params.wilayaId);
  const wid = req.params.wilayaId;
  const q = `
    SELECT id,
           COALESCE(NULLIF(commune_name_ascii, ''), commune_name) AS name
    FROM algeria_cities
    WHERE wilaya_code = $1
    ORDER BY name ASC
  `;
  db.query(q, [wid], (err, rows) => {
    res.setHeader('Content-Type', 'application/json');
    if (err) {
      console.error('GET /api/communes error', err);
      return res.status(200).send(JSON.stringify([]));
    }
    return res.status(200).send(JSON.stringify(rows || []));
  });
});

// ================== Static folders (after API) ==================

// Serve admin static files from backend/admin
app.use('/admin', express.static(path.join(__dirname, 'admin')));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'frontend')));

// ================== Default route → frontend ==================
app.get('*', (req, res) => {
  // keep API/uploads handled as JSON 404, but allow /admin to be served by static above
  if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// ================== Start server ==================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});