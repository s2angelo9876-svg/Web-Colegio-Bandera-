const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Diagnostico: columnas de la tabla usuarios
router.get('/debug/columns', async (req, res) => {
  try {
    const { rows: cols } = await db.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'usuarios'
      ORDER BY ordinal_position
    `);
    res.json(cols);
  } catch (err) {
    res.status(500).json({ error: err.message, code: err.code });
  }
});

// Diagnostico: listado de tablas
router.get('/debug/tables', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    res.json(rows.map(r => r.table_name));
  } catch (err) {
    res.status(500).json({ error: err.message, code: err.code });
  }
});

// Diagnostico: query directo (solo lectura)
router.get('/debug/test-query', async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT id, username, rol,
             to_char(created_at, 'YYYY-MM-DD') AS created_at_fmt
      FROM usuarios
      LIMIT 3
    `);
    res.json({ ok: true, rows });
  } catch (err) {
    res.json({ ok: false, error: err.message, code: err.code, detail: err.detail });
  }
});

module.exports = router;
