const db = require('../config/db');
const logger = require('../config/logger');

/**
 * GET /api/activity-log
 * Devuelve las actividades con paginacion.
 * Filtros: ?user=username, ?entity=noticia, ?action=crear, ?from=YYYY-MM-DD, ?to=YYYY-MM-DD, ?q=texto
 */
exports.getActivityLog = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
  const offset = (page - 1) * limit;

  const { user, entity, action, from, to, q } = req.query;

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
  if (from) {
    conditions.push(`created_at >= $${paramIndex++}`);
    params.push(from);
  }
  if (to) {
    conditions.push(`created_at <= $${paramIndex++}`);
    params.push(to);
  }
  if (q) {
    conditions.push(`(entity_title ILIKE $${paramIndex} OR details::text ILIKE $${paramIndex} OR username ILIKE $${paramIndex})`);
    params.push(`%${q}%`);
    paramIndex++;
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
    logger.error('Error en getActivityLog', { message: err.message });
    res.status(500).json({ error: 'Error al obtener el log de actividad' });
  }
};

/**
 * GET /api/activity-log/:id
 * Devuelve el detalle de una actividad con su `details` parseado.
 */
exports.getActivityLogById = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await db.query(
      'SELECT id, user_id, username, action, entity_type, entity_id, entity_title, details, created_at FROM activity_log WHERE id = $1',
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Actividad no encontrada' });

    const log = rows[0];
    // Parsear details si es JSON valido
    let parsedDetails = log.details;
    if (typeof parsedDetails === 'string') {
      try {
        parsedDetails = JSON.parse(parsedDetails);
      } catch {
        // No es JSON, dejar como string
      }
    }
    res.json({ ...log, details: parsedDetails });
  } catch (err) {
    logger.error('Error en getActivityLogById', { message: err.message });
    res.status(500).json({ error: 'Error al obtener el detalle' });
  }
};

/**
 * GET /api/activity-log/export/csv
 * Devuelve el log completo en formato CSV (sin paginacion).
 */
exports.exportActivityLogCSV = async (req, res) => {
  const { user, entity, action, from, to, q } = req.query;

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
  if (from) {
    conditions.push(`created_at >= $${paramIndex++}`);
    params.push(from);
  }
  if (to) {
    conditions.push(`created_at <= $${paramIndex++}`);
    params.push(to);
  }
  if (q) {
    conditions.push(`(entity_title ILIKE $${paramIndex} OR details::text ILIKE $${paramIndex} OR username ILIKE $${paramIndex})`);
    params.push(`%${q}%`);
    paramIndex++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const { rows } = await db.query(
      `SELECT id, user_id, username, action, entity_type, entity_id, entity_title, details, created_at
       FROM activity_log ${whereClause}
       ORDER BY created_at DESC
       LIMIT 5000`,
      params
    );

    const header = ['ID', 'Fecha', 'Usuario', 'Accion', 'Tipo', 'Entidad ID', 'Titulo', 'Detalles'];
    const escape = (v) => {
      if (v === null || v === undefined) return '';
      const s = String(v).replace(/"/g, '""');
      return /[",\n;]/.test(s) ? `"${s}"` : s;
    };
    const lines = [header.join(',')];
    for (const r of rows) {
      lines.push([
        r.id,
        r.created_at ? new Date(r.created_at).toISOString() : '',
        r.username,
        r.action,
        r.entity_type,
        r.entity_id,
        r.entity_title,
        typeof r.details === 'string' ? r.details : JSON.stringify(r.details || ''),
      ].map(escape).join(','));
    }
    const csv = '\uFEFF' + lines.join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="activity-log.csv"');
    res.send(csv);
  } catch (err) {
    logger.error('Error en exportActivityLogCSV', { message: err.message });
    res.status(500).json({ error: 'Error al exportar el log' });
  }
};

/**
 * GET /api/activity-log/stats
 * Devuelve resumenes para el dashboard (por accion, por usuario, por dia).
 */
exports.getActivityLogStats = async (req, res) => {
  const days = Math.min(parseInt(req.query.days, 10) || 7, 90);
  try {
    const [
      { rows: porAccion },
      { rows: porUsuario },
      { rows: porDia },
    ] = await Promise.all([
      db.query(`SELECT action, COUNT(*)::int AS n FROM activity_log WHERE created_at >= NOW() - ($1 || ' days')::interval GROUP BY action ORDER BY n DESC`, [days]),
      db.query(`SELECT username, COUNT(*)::int AS n FROM activity_log WHERE created_at >= NOW() - ($1 || ' days')::interval GROUP BY username ORDER BY n DESC LIMIT 10`, [days]),
      db.query(`SELECT TO_CHAR(date_trunc('day', created_at), 'YYYY-MM-DD') AS dia, COUNT(*)::int AS n FROM activity_log WHERE created_at >= NOW() - ($1 || ' days')::interval GROUP BY dia ORDER BY dia ASC`, [days]),
    ]);

    res.json({
      porAccion,
      porUsuario,
      porDia,
      periodo_dias: days,
    });
  } catch (err) {
    logger.error('Error en getActivityLogStats', { message: err.message });
    res.status(500).json({ error: 'Error al obtener stats' });
  }
};
