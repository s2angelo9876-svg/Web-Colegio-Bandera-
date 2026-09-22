const db = require('../config/db');

exports.getComunicados = async (req, res) => {
  const wantsPagination = req.query.page !== undefined;
  const isAdmin = req.query.admin === 'true';
  const estado = req.query.estado;

  const conditions = [];
  const params = [];
  let paramIndex = 1;

  if (!isAdmin) {
    conditions.push("(COALESCE(estado, 'publicado') = 'publicado' AND (fecha_publicacion IS NULL OR fecha_publicacion <= NOW()))");
  } else if (estado && estado !== 'todos') {
    conditions.push(`estado = $${paramIndex++}`);
    params.push(estado);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  if (!wantsPagination) {
    try {
      const { rows } = await db.query(
        `SELECT id, titulo, descripcion, fecha, tipo,
                COALESCE(estado, 'publicado') AS estado,
                COALESCE(fecha_publicacion, fecha) AS fecha_publicacion
         FROM comunicados ${whereClause}
         ORDER BY fecha DESC`,
        params
      );
      return res.json(rows);
    } catch (err) {
      return res.status(500).json({ error: 'Error al obtener comunicados' });
    }
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
  const offset = (page - 1) * limit;

  try {
    const { rows: countRows } = await db.query(
      `SELECT COUNT(*)::int AS total FROM comunicados ${whereClause}`,
      params
    );
    const total = countRows[0]?.total || 0;

    const { rows } = await db.query(
      `SELECT id, titulo, descripcion, fecha, tipo,
              COALESCE(estado, 'publicado') AS estado,
              COALESCE(fecha_publicacion, fecha) AS fecha_publicacion
       FROM comunicados ${whereClause}
       ORDER BY fecha DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      [...params, limit, offset]
    );

    res.json({
      data: rows,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener comunicados' });
  }
};

exports.crearComunicado = async (req, res) => {
  const { titulo, descripcion, fecha, tipo, estado, fecha_publicacion } = req.body;

  const estadoFinal = ['borrador', 'programado', 'publicado'].includes(estado) ? estado : 'publicado';
  const fechaCreacion = fecha || new Date().toISOString();
  const fechaPubFinal = fecha_publicacion || fechaCreacion;

  try {
    const { rows } = await db.query(
      `INSERT INTO comunicados (titulo, descripcion, fecha, tipo, estado, fecha_publicacion)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [titulo, descripcion, fechaCreacion, tipo || 'aviso', estadoFinal, fechaPubFinal]
    );
    res.status(201).json({ mensaje: 'Comunicado publicado correctamente', id: rows[0]?.id });
  } catch (err) {
    res.status(500).json({ error: 'Error al publicar comunicado: ' + err.message });
  }
};

exports.eliminarComunicado = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM comunicados WHERE id = $1', [id]);
    res.json({ mensaje: 'Comunicado eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar' });
  }
};

exports.actualizarComunicado = async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, fecha, tipo, estado, fecha_publicacion } = req.body;

  try {
    const sets = ['titulo = $1', 'descripcion = $2', 'tipo = $3'];
    const params = [titulo, descripcion, tipo || 'aviso'];
    let i = 4;

    if (fecha) {
      sets.push(`fecha = $${i++}`);
      params.push(fecha);
    }
    if (estado && ['borrador', 'programado', 'publicado'].includes(estado)) {
      sets.push(`estado = $${i++}`);
      params.push(estado);
    }
    if (fecha_publicacion) {
      sets.push(`fecha_publicacion = $${i++}`);
      params.push(fecha_publicacion);
    }

    params.push(id);
    await db.query(
      `UPDATE comunicados SET ${sets.join(', ')} WHERE id = $${i}`,
      params
    );
    res.json({ mensaje: 'Comunicado actualizado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el comunicado: ' + err.message });
  }
};
