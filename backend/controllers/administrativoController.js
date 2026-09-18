const db = require('../config/db');

exports.getAdministrativos = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM administrativos ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createAdministrativo = async (req, res) => {
  const { nombre, cargo, area } = req.body;
  const imagen_url = req.file ? req.file.url_public : null;

  try {
    const { insertId } = await db.query(
      'INSERT INTO administrativos (nombre, cargo, area, imagen_url) VALUES ($1, $2, $3, $4) RETURNING id',
      [nombre, cargo, area, imagen_url]
    );
    res.status(201).json({ message: 'Personal registrado con éxito', id: insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteAdministrativo = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM administrativos WHERE id = $1', [id]);
    res.json({ message: 'Registro eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateAdministrativo = async (req, res) => {
  const { id } = req.params;
  const { nombre, cargo, area } = req.body;
  const nuevaImagen = req.file ? req.file.url_public : null;

  try {
    if (nuevaImagen) {
      await db.query(
        'UPDATE administrativos SET nombre=$1, cargo=$2, area=$3, imagen_url=$4 WHERE id=$5',
        [nombre, cargo, area, nuevaImagen, id]
      );
    } else {
      await db.query(
        'UPDATE administrativos SET nombre=$1, cargo=$2, area=$3 WHERE id=$4',
        [nombre, cargo, area, id]
      );
    }
    res.json({ message: 'Registro actualizado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
