const db = require('../config/db');

/**
 * GET /api/activity-log
 * Devuelve las últimas actividades con paginación.
 * Filtros opcionales: ?user=username, ?entity=noticia, ?action=crear
 */
exports.getActivityLog = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
  const offset = (page - 1) * limit;

  const { user, entity, action } = req.query;

  const conditions = [];
  const params = [];
  let paramIndex = 1;

  if (user) {
    conditions.push(`username ILIKE $${paramIndex++}`);
    params.push(`%${user}%`);
  }
  if (entity) {
    conditions.push(`entity_type = $${paramIndex++}`);
    params.push(entity);
  }
  if (action) {
    conditions.push(`action = $${paramIndex++}`);
    params.push(action);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const { rows: countRows } = await db.query(
      `SELECT COUNT(*)::int AS total FROM activity_log ${whereClause}`,
      params
    );
    const total = countRows[0]?.total || 0;

    const { rows } = await db.query(
      `SELECT id, user_id, username, action, entity_type, entity_id, entity_title, details, created_at
       FROM activity_log ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      [...params, limit, offset]
    );

    res.json({
      data: rows,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener el log de actividad' });
  }
};
