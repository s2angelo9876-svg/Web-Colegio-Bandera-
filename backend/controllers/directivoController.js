const db = require('../config/db');

exports.getDirectivos = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM equipo_directivo ORDER BY orden ASC, id ASC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

exports.createDirectivo = async (req, res) => {
  const { nombres, cargo, frase, correo, orden } = req.body;
  const imagen_url = req.file ? req.file.url_public : null;

  try {
    const { insertId } = await db.query(
      'INSERT INTO equipo_directivo (nombres, cargo, frase, correo, imagen_url, orden) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [nombres, cargo, frase, correo, imagen_url, orden || 0]
    );
    res.status(201).json({ id: insertId, mensaje: 'Directivo creado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear directivo' });
  }
};

exports.updateDirectivo = async (req, res) => {
  const { id } = req.params;
  const { nombres, cargo, frase, correo, orden } = req.body;
  const nuevaImagen = req.file ? req.file.url_public : null;

  try {
    if (nuevaImagen) {
      await db.query(
        'UPDATE equipo_directivo SET nombres=$1, cargo=$2, frase=$3, correo=$4, imagen_url=$5, orden=$6 WHERE id=$7',
        [nombres, cargo, frase, correo, nuevaImagen, orden || 0, id]
      );
    } else {
      await db.query(
        'UPDATE equipo_directivo SET nombres=$1, cargo=$2, frase=$3, correo=$4, orden=$5 WHERE id=$6',
        [nombres, cargo, frase, correo, orden || 0, id]
      );
    }
    res.json({ mensaje: 'Directivo actualizado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar directivo' });
  }
};

exports.deleteDirectivo = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM equipo_directivo WHERE id = $1', [id]);
    res.json({ mensaje: 'Directivo eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar directivo' });
  }
};
