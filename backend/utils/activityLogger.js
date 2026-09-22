const db = require('../config/db');
const logger = require('../config/logger');

/**
 * Registra una acción en el log de actividad.
 * Se invoca desde los controladores después de operaciones exitosas.
 *
 * @param {Object} params
 * @param {number} params.userId    - ID del usuario que realizó la acción
 * @param {string} params.username  - Nombre del usuario
 * @param {string} params.action    - 'crear' | 'editar' | 'eliminar'
 * @param {string} params.entityType - 'noticia' | 'evento' | 'comunicado' | 'docente' | 'galeria' | 'carrusel' | etc.
 * @param {number} [params.entityId] - ID de la entidad afectada
 * @param {string} [params.entityTitle] - Título/nombre legible de la entidad
 * @param {string} [params.details] - Detalles adicionales opcionales
 */
async function logActivity({ userId, username, action, entityType, entityId, entityTitle, details }) {
  try {
    await db.query(
      `INSERT INTO activity_log (user_id, username, action, entity_type, entity_id, entity_title, details)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [userId || null, username || 'sistema', action, entityType, entityId || null, entityTitle || null, details || null]
    );
  } catch (err) {
    // No lanzamos error para no romper la operación principal
    logger.error('Error al registrar actividad', { message: err.message, action, entityType });
  }
}

module.exports = { logActivity };
