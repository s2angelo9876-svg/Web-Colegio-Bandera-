const express = require('express');
const router = express.Router();
const db = require('../config/db');

router.get('/debug/columns', async (req, res) => {
  try {
    const { rows: cols } = await db.query(\`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'usuarios'
      ORDER BY ordinal_position
    \`);
    res.json(cols);
  } catch (err) {
    res.status(500).json({ error: err.message, code: err.code });
  }
});

module.exports = router;
