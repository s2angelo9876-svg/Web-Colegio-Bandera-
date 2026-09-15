const db = require('../config/db');

exports.getDocentes = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM docentes ORDER BY orden ASC, nombre ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createDocente = async (req, res) => {
  const { nombre, cargo, especialidad, orden } = req.body;
  const imagen_url = req.file ? req.file.url_public : null;

  try {
    const { insertId } = await db.query(
      'INSERT INTO docentes (nombre, cargo, especialidad, imagen_url, orden) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [nombre, cargo, especialidad, imagen_url, orden || 0]
    );
    res.status(201).json({ message: 'Docente registrado correctamente', id: insertId });
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar docente' });
  }
};

exports.deleteDocente = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM docentes WHERE id = $1', [id]);
    res.json({ message: 'Docente eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'No se pudo eliminar el docente' });
  }
};
