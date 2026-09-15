const { deleteFromStorage } = require('../config/storage');
const logger = require('../config/logger');

/**
 * Elimina un archivo del storage de forma segura sin tirar la request.
 * Pensado para usar en controllers antes/después de borrar un registro.
 *
 * @param {string|null} value  URL pública de Supabase o path /uploads/...
 */
async function deleteFileSafely(value) {
  if (!value) return;
  try {
    await deleteFromStorage(value);
  } catch (err) {
    logger.warn('No se pudo eliminar archivo del storage', { value, message: err.message });
  }
}

/**
 * Wrapper para que un controller responda con error 500 uniforme sin filtrar
 * el mensaje real al cliente (solo lo loguea).
 *
 * Uso:
 *   exports.getX = async (req, res) => safeHandler(res, async () => {...}, 'No se pudo obtener X');
 */
function safeHandler(res, fn, userMessage = 'Error interno del servidor') {
  return async (req, _res, next) => {
    try {
      await fn(req, res, next);
    } catch (err) {
      logger.error('Error en controller', { message: err.message });
      if (!res.headersSent) {
        res.status(500).json({ error: userMessage });
      }
    }
  };
}

module.exports = { deleteFileSafely, safeHandler };
