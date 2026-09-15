const db = require('../config/db');

exports.getComunicados = async (req, res) => {
  const wantsPagination = req.query.page !== undefined;
  if (!wantsPagination) {
    try {
      const { rows } = await db.query('SELECT * FROM comunicados ORDER BY fecha DESC');
      return res.json(rows);
    } catch (err) {
      return res.status(500).json({ error: 'Error al obtener comunicados' });
    }
  }

  const page = parseInt(req.query.page, 10) || 1;
  const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
  const offset = (page - 1) * limit;
  try {
    const { rows: countRows } = await db.query('SELECT COUNT(*)::int AS total FROM comunicados');
    const total = countRows[0].total;
    const { rows } = await db.query(
      'SELECT * FROM comunicados ORDER BY fecha DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );
    res.json({
      data: rows,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
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
