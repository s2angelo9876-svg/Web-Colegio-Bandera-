const db = require('../config/db');

exports.getSlides = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM carrusel ORDER BY orden ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener el carrusel' });
  }
};

exports.createSlide = async (req, res) => {
  const { titulo, subtitulo, orden } = req.body;
  const imagen_url = req.file ? req.file.url_public : null;

  try {
    const { insertId } = await db.query(
      'INSERT INTO carrusel (titulo, subtitulo, imagen_url, orden) VALUES ($1, $2, $3, $4) RETURNING id',
      [titulo, subtitulo, imagen_url, orden || 0]
    );
    res.status(201).json({ id: insertId, titulo, subtitulo, imagen_url, orden });
  } catch (err) {
    res.status(500).json({ message: 'Error al crear slide' });
  }
};

exports.deleteSlide = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM carrusel WHERE id = $1', [id]);
    res.json({ message: 'Slide eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar slide' });
  }
};
