const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

let pool = null;

function makePool(sslOption) {
  return new Pool({
    connectionString,
    ssl: sslOption
  });
}

async function tryConnect(p) {
  const client = await p.connect();
  client.release();
  return true;
}

(async function init() {
  if (!connectionString) {
    console.error('❌ DATABASE_URL not set');
    return;
  }

  const envDisable = process.env.PGSSLMODE === 'disable';

  // Try preferred based on PGSSLMODE
  const firstAttemptSsl = envDisable ? false : { rejectUnauthorized: false };
  const fallbackSsl = envDisable ? { rejectUnauthorized: false } : false;

  try {
    pool = makePool(firstAttemptSsl);
    await tryConnect(pool);
    console.log('✅ Connected to PostgreSQL database (ssl:', envDisable ? 'disabled' : 'enabled', ')');
    return;
  } catch (err) {
    console.warn('⚠️ First DB connect attempt failed:', err.message);
    // if error suggests SSL mismatch, try fallback
    try {
      pool && pool.end && (await pool.end());
    } catch (_) {}
    try {
      pool = makePool(fallbackSsl);
      await tryConnect(pool);
      console.log('✅ Connected to PostgreSQL database (ssl:', envDisable ? 'enabled (fallback)' : 'disabled (fallback)', ')');
      return;
    } catch (err2) {
      console.error('❌ Failed to connect to PostgreSQL database');
      console.error('Message:', err2.message);
      console.error('Stack:', err2.stack);
      // leave pool as null so queries return error
      pool = null;
    }
  }
})();

function query(sql, params, cb) {
  if (typeof params === 'function') {
    cb = params;
    params = [];
  }
  if (!pool) {
    const err = new Error('Database pool not initialized');
    console.error('❌ Database query error: pool not initialized', sql);
    return cb(err);
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