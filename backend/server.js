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

// ================== Optional: Wilayas/Communes API ==================
// مفعلتهمش دلوقت، تقدري ترجعيهم إذا تحتاجي
/*
app.get('/api/wilayas', async (req, res) => {
  try {
    const rows = await db.query(
      `SELECT DISTINCT wilaya_code AS id,
              COALESCE(NULLIF(wilaya_name_ascii, ''), wilaya_name) AS name
       FROM algeria_cities
       ORDER BY name ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/communes/:wilayaId', async (req, res) => {
  const wid = req.params.wilayaId;
  try {
    const rows = await db.query(
      `SELECT id,
              COALESCE(NULLIF(commune_name_ascii, ''), commune_name) AS name
       FROM algeria_cities
       WHERE wilaya_code = $1
       ORDER BY name ASC`,
      [wid]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});
*/

// ================== Default route → frontend ==================
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// ================== Start server ==================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
