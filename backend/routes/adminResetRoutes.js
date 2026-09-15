/**
 * Endpoint temporal para resetear la contraseña del admin en producción.
 *
 * Solo se activa si la env var ENABLE_ADMIN_RESET=true está configurada.
 * Útil para recuperación de contraseña en producción cuando no hay acceso
 * a la BD directamente.
 *
 * USO:
 *   POST /api/_admin/reset-password
 *   Body: { "username": "admin", "newPassword": "NuevaPass123", "secret": "..." }
 *
 * El "secret" debe coincidir con la env var ADMIN_RESET_SECRET.
 *
 * ⚠️  ELIMINAR O DESACTIVAR después de usarlo en producción.
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const logger = require('../config/logger');

const ENABLED = process.env.ENABLE_ADMIN_RESET === 'true';
const SECRET = process.env.ADMIN_RESET_SECRET;

router.post('/reset-password', async (req, res) => {
  if (!ENABLED || !SECRET) {
    return res.status(404).json({ error: 'Endpoint deshabilitado' });
  }

  const { username, newPassword, secret } = req.body;

  if (secret !== SECRET) {
    return res.status(403).json({ error: 'Secreto inválido' });
  }

  if (!username || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'username y newPassword (min 6 chars) son requeridos' });
  }

  try {
    const { rows } = await db.query('SELECT id FROM usuarios WHERE username = $1', [username]);
    if (rows.length === 0) {
      return res.status(404).json({ error: `Usuario "${username}" no existe` });
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE usuarios SET password = $1 WHERE username = $2', [hash, username]);

    logger.warn('Contraseña reseteada via endpoint temporal', { username });

    res.json({
      mensaje: 'Contraseña actualizada correctamente',
      username,
      nota: 'Desactiva ENABLE_ADMIN_RESET después de usar este endpoint',
    });
  } catch (err) {
    res.status(500).json({ error: 'Error interno' });
  }
});

module.exports = router;
