const { Pool } = require('pg');
const pg = require('pg');
require('dotenv').config();
const logger = require('./logger');

if (!process.env.DATABASE_URL) {
  throw new Error('Configuración crítica faltante: DATABASE_URL no está definido en .env');
}

// pg devuelve BIGINT (INT8) como string por defecto — los queremos como Number
pg.types.setTypeParser(pg.types.builtins.INT8, (value) => parseInt(value, 10));
pg.types.setTypeParser(pg.types.builtins.NUMERIC, (value) => parseFloat(value));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30_000,
});

pool.on('error', (err) => {
  logger.error('Error inesperado en el pool de PostgreSQL', { message: err.message });
});

/**
 * API unificada para queries.
 *  - Para SELECT  →  { rows, rowCount }
 *  - Para INSERT  →  { rows, rowCount, insertId }
 *  - Para UPDATE/DELETE → { rows, rowCount }
 *
 * @param {string} text  SQL con placeholders $1, $2, ...
 * @param {Array}  params
 */
async function query(text, params = []) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.LOG_SQL === 'true') {
      logger.debug('SQL', { ms: duration, rows: res.rowCount, sql: text.split('\n')[0].slice(0, 120) });
    }
    const out = { rows: res.rows, rowCount: res.rowCount };
    if (text.trim().toUpperCase().startsWith('INSERT') && res.rows[0]?.id !== undefined) {
      out.insertId = res.rows[0].id;
    }
    return out;
  } catch (err) {
    logger.error('Error en query PostgreSQL', { message: err.message, sql: text });
    throw err;
  }
}

/**
 * Cliente para transacciones (BEGIN / COMMIT / ROLLBACK).
 * Uso:
 *   const client = await getClient();
 *   try { await client.query('BEGIN'); ... await client.query('COMMIT'); }
 *   finally { client.release(); }
 */
async function getClient() {
  return pool.connect();
}

module.exports = { query, getClient, pool };
