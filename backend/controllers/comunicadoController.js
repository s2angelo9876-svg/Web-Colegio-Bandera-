const db = require('../config/db');

exports.getComunicados = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM comunicados ORDER BY fecha DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener comunicados' });
  }
};

exports.crearComunicado = async (req, res) => {
  const { titulo, descripcion, fecha, tipo } = req.body;

  try {
    await db.query(
      'INSERT INTO comunicados (titulo, descripcion, fecha, tipo) VALUES ($1, $2, $3, $4) RETURNING id',
      [titulo, descripcion, fecha || new Date().toISOString(), tipo || 'aviso']
    );
    res.status(201).json({ mensaje: 'Comunicado publicado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al publicar comunicado' });
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
