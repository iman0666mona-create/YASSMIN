const { Pool } = require('pg');
require('dotenv').config();

const { Pool } = require('pg');
require('dotenv').config();

const isLocal = process.env.DATABASE_URL?.includes('localhost') || process.env.DATABASE_URL?.includes('127.0.0.1');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ...(isLocal ? {} : { ssl: { rejectUnauthorized: false } })
});

// ======= اختبار الاتصال عند تشغيل السيرفر =======
pool
  .connect()
  .then(client => {
    console.log('✅ Connected to PostgreSQL database successfully');
    client.release();
  })
  .catch(err => {
    console.error('❌ Failed to connect to PostgreSQL database');
    console.error('Message:', err.message);
    console.error('Stack:', err.stack);
  });

// ======= تنفيذ الاستعلامات مع تسجيل الأخطاء =======
function query(sql, params, cb) {
  if (typeof params === 'function') {
    cb = params;
    params = [];
  }

  pool
    .query(sql, params)
    .then(res => cb(null, res.rows))
    .catch(err => {
      console.error('❌ Database query error');
      console.error('SQL:', sql);
      console.error('Params:', params);
      console.error('Message:', err.message);
      console.error('Stack:', err.stack);
      cb(err);
    });
}

module.exports = { query };
