const db = require('../config/db');

exports.getDocentes = async (req, res) => {
  const wantsPagination = req.query.page !== undefined;
  if (!wantsPagination) {
    try {
      const { rows } = await db.query('SELECT * FROM docentes ORDER BY orden ASC, nombre ASC');
      return res.json(rows);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = Math.min(parseInt(req.query.limit, 10) || 12, 60);
  const offset = (page - 1) * limit;
  try {
    const { rows: countRows } = await db.query('SELECT COUNT(*)::int AS total FROM docentes');
    const total = countRows[0].total;
    const { rows } = await db.query(
      'SELECT * FROM docentes ORDER BY orden ASC, nombre ASC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    res.json({
      data: rows,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
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
