const db = require('../config/db');

// 1. Obtener eventos con paginación opcional y filtros de estado
exports.obtenerEventos = async (req, res) => {
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
        `SELECT id, titulo, descripcion, fecha_evento, hora_evento, lugar, imagen_url,
                COALESCE(estado, 'publicado') AS estado,
                COALESCE(fecha_publicacion, NOW()) AS fecha_publicacion
         FROM eventos ${whereClause}
         ORDER BY fecha_evento ASC`,
        params
      );
      return res.json(rows);
    } catch (err) {
      return res.status(500).json({ error: 'Error al obtener eventos' });
    }
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
  const offset = (page - 1) * limit;

  try {
    const { rows: countRows } = await db.query(
      `SELECT COUNT(*)::int AS total FROM eventos ${whereClause}`,
      params
    );
    const total = countRows[0]?.total || 0;

    const { rows } = await db.query(
      `SELECT id, titulo, descripcion, fecha_evento, hora_evento, lugar, imagen_url,
              COALESCE(estado, 'publicado') AS estado,
              COALESCE(fecha_publicacion, NOW()) AS fecha_publicacion
       FROM eventos ${whereClause}
       ORDER BY fecha_evento ASC
       LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
      [...params, limit, offset]
    );

    res.json({
      data: rows,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) || 1 },
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener eventos' });
  }
};

// 2. Crear evento
exports.crearEvento = async (req, res) => {
  const { titulo, descripcion, fecha_evento, hora_evento, lugar, estado, fecha_publicacion } = req.body;
  const imagen_url = req.file ? req.file.url_public : null;

  if (!fecha_evento) {
    return res.status(400).json({ error: 'La fecha_evento es obligatoria' });
  }

  const estadoFinal = ['borrador', 'programado', 'publicado'].includes(estado) ? estado : 'publicado';
  const fechaPubFinal = fecha_publicacion || new Date().toISOString();

  try {
    const { rows } = await db.query(
      `INSERT INTO eventos (titulo, descripcion, fecha_evento, hora_evento, lugar, imagen_url, estado, fecha_publicacion)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
      [titulo, descripcion || null, fecha_evento, hora_evento || null, lugar || null, imagen_url, estadoFinal, fechaPubFinal]
    );
    res.status(201).json({ mensaje: 'Evento creado con éxito', id: rows[0]?.id });
  } catch (err) {
    res.status(500).json({ error: 'Error al insertar en la base de datos: ' + err.message });
  }
};

// 3. Eliminar evento
exports.eliminarEvento = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM eventos WHERE id = $1', [id]);
    res.json({ mensaje: 'Evento eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar el evento' });
  }
};

// 4. Actualizar evento
exports.actualizarEvento = async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, fecha_evento, hora_evento, lugar, estado, fecha_publicacion } = req.body;
  const nuevaImagen = req.file ? req.file.url_public : null;

  if (!fecha_evento) {
    return res.status(400).json({ error: 'La fecha_evento es obligatoria' });
  }

  try {
    const sets = [
      'titulo = $1',
      'descripcion = $2',
      'fecha_evento = $3',
      'hora_evento = $4',
      'lugar = $5',
    ];
    const params = [
      titulo,
      descripcion || null,
      fecha_evento,
      hora_evento || null,
      lugar || null,
    ];
    let i = 6;

    if (nuevaImagen) {
      sets.push(`imagen_url = $${i++}`);
      params.push(nuevaImagen);
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
      `UPDATE eventos SET ${sets.join(', ')} WHERE id = $${i}`,
      params
    );
    res.json({ mensaje: 'Evento actualizado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el evento: ' + err.message });
  }
};
