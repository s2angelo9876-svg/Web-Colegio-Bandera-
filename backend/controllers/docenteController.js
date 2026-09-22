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

exports.updateDocente = async (req, res) => {
  const { id } = req.params;
  const { nombre, cargo, especialidad, orden } = req.body;
  const nuevaImagen = req.file ? req.file.url_public : null;

  try {
    if (nuevaImagen) {
      await db.query(
        'UPDATE docentes SET nombre=$1, cargo=$2, especialidad=$3, imagen_url=$4, orden=$5 WHERE id=$6',
        [nombre, cargo, especialidad, nuevaImagen, orden || 0, id]
      );
    } else {
      await db.query(
        'UPDATE docentes SET nombre=$1, cargo=$2, especialidad=$3, orden=$4 WHERE id=$5',
        [nombre, cargo, especialidad, orden || 0, id]
      );
    }
    res.json({ message: 'Docente actualizado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el docente' });
  }
};

exports.reordenarDocentes = async (req, res) => {
  const { ordenIds } = req.body;
  if (!Array.isArray(ordenIds) || ordenIds.length === 0) {
    return res.status(400).json({ error: 'ordenIds debe ser un array con los IDs en el nuevo orden' });
  }

  try {
    for (let i = 0; i < ordenIds.length; i++) {
      await db.query('UPDATE docentes SET orden = $1 WHERE id = $2', [i + 1, ordenIds[i]]);
    }
    res.json({ message: 'Docentes reordenados correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al reordenar docentes' });
  }
};
