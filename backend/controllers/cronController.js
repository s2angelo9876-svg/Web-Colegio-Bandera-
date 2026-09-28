const db = require('../config/db');
const logger = require('../config/logger');

/**
 * Endpoints internos para tareas programadas (cron jobs).
 *
 * GET /api/cron/publish-scheduled
 *   - Recorre las tablas noticias/comunicados/eventos y publica
 *     los items que tengan estado='programado' y fecha_publicacion <= NOW().
 *   - Diseñado para ser llamado por un cron job de Render cada 5-10 minutos.
 *   - Protegido con CRON_SECRET header (no requiere auth de usuario).
 *
 * GET /api/cron/health
 *   - Health check del cron.
 */
const TABLES = [
  { table: 'noticias',    titleCol: 'titulo' },
  { table: 'comunicados', titleCol: 'titulo' },
  { table: 'eventos',     titleCol: 'titulo' },
];

exports.publishScheduled = async (req, res) => {
  const provided = req.headers['x-cron-secret'];
  const expected = process.env.CRON_SECRET || process.env.JWT_SECRET;

  if (!expected || provided !== expected) {
    return res.status(401).json({ error: 'No autorizado' });
  }

  const results = {};

  try {
    for (const { table, titleCol } of TABLES) {
      const { rowCount } = await db.query(
        `UPDATE ${table}
         SET estado = 'publicado'
         WHERE estado = 'programado'
           AND fecha_publicacion IS NOT NULL
           AND fecha_publicacion <= NOW()`
      );
      results[table] = { publicados: rowCount };
    }

    logger.info('Cron publishScheduled ejecutado', results);
    res.json({
      ok: true,
      timestamp: new Date().toISOString(),
      results,
    });
  } catch (err) {
    logger.error('Error en publishScheduled', { message: err.message });
    res.status(500).json({ error: 'Error al publicar programados' });
  }
};

exports.cronHealth = async (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
};
