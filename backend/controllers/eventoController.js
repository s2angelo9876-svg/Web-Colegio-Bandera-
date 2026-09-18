const db = require('../config/db');

// 1. Obtener eventos con paginación opcional
exports.obtenerEventos = async (req, res) => {
  const wantsPagination = req.query.page !== undefined;
  if (!wantsPagination) {
    try {
      const { rows } = await db.query('SELECT * FROM eventos ORDER BY fecha_evento ASC');
      return res.json(rows);
    } catch (err) {
      return res.status(500).json({ error: 'Error al obtener eventos' });
    }
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
  const offset = (page - 1) * limit;
  try {
    const { rows: countRows } = await db.query('SELECT COUNT(*)::int AS total FROM eventos');
    const total = countRows[0].total;
    const { rows } = await db.query(
      'SELECT * FROM eventos ORDER BY fecha_evento ASC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    res.json({
      data: rows,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener eventos' });
  }
};

// 2. Crear evento
exports.crearEvento = async (req, res) => {
  const { titulo, descripcion, fecha_evento, hora_evento, lugar } = req.body;
  const imagen_url = req.file ? req.file.url_public : null;

  if (!fecha_evento) {
    return res.status(400).json({ error: 'La fecha_evento es obligatoria' });
  }

  try {
    const { insertId } = await db.query(
      `INSERT INTO eventos (titulo, descripcion, fecha_evento, hora_evento, lugar, imagen_url)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [titulo, descripcion || null, fecha_evento, hora_evento || null, lugar || null, imagen_url]
    );
    res.status(201).json({ mensaje: 'Evento creado con éxito', id: insertId });
  } catch (err) {
    res.status(500).json({ error: 'Error al insertar en la base de datos' });
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
  const { titulo, descripcion, fecha_evento, hora_evento, lugar } = req.body;
  const nuevaImagen = req.file ? req.file.url_public : null;

  if (!fecha_evento) {
    return res.status(400).json({ error: 'La fecha_evento es obligatoria' });
  }

  try {
    if (nuevaImagen) {
      await db.query(
        'UPDATE eventos SET titulo=$1, descripcion=$2, fecha_evento=$3, hora_evento=$4, lugar=$5, imagen_url=$6 WHERE id=$7',
        [titulo, descripcion || null, fecha_evento, hora_evento || null, lugar || null, nuevaImagen, id]
      );
    } else {
      await db.query(
        'UPDATE eventos SET titulo=$1, descripcion=$2, fecha_evento=$3, hora_evento=$4, lugar=$5 WHERE id=$6',
        [titulo, descripcion || null, fecha_evento, hora_evento || null, lugar || null, id]
      );
    }
    res.json({ mensaje: 'Evento actualizado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el evento' });
  }
};
