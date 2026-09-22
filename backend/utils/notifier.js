const db = require('../config/db');
const logger = require('../config/logger');

/**
 * Crea una notificación para el panel de administración.
 *
 * @param {Object} params
 * @param {string} params.type    - Tipo: 'mesa_partes', 'publicacion', 'usuario', etc.
 * @param {string} params.title   - Título corto de la notificación
 * @param {string} params.message - Mensaje descriptivo
 * @param {string} [params.link]  - Ruta relativa en el admin, ej: '/admin/mesa-partes'
 */
async function createNotification({ type, title, message, link }) {
  try {
    await db.query(
      `INSERT INTO admin_notifications (type, title, message, link)
       VALUES ($1, $2, $3, $4)`,
      [type, title, message, link || null]
    );
  } catch (err) {
    // No lanzamos error para no romper la operación principal
    logger.error('Error al crear notificación', { message: err.message, type, title });
  }
}

module.exports = { createNotification };
