const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: true }
});

function query(sql, params, cb) {
  if (typeof params === 'function') {
    cb = params;
    params = [];
  }
  pool.query(sql, params)
    .then(res => cb(null, res.rows))
    .catch(err => cb(err));
}

module.exports = { query };
