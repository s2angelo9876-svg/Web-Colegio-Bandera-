const db = require('../config/db');

// 1. Obtener eventos
exports.obtenerEventos = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM eventos ORDER BY fecha_evento ASC');
    res.json(rows);
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
