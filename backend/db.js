const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://iconic_db_7haq_user:nZLqrHUVe4tW81Xi7Sna3S6LnjiL6VGv@dpg-d5a528emcj7s73c68vu0-a.frankfurt-postgres.render.com/iconic_db_7haq',
  ssl: { rejectUnauthorized: false }
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
