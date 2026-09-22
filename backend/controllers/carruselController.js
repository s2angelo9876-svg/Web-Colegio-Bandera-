const db = require('../config/db');
const { logActivity } = require('../utils/activityLogger');

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

    await logActivity({
      userId: req.usuario?.id,
      username: req.usuario?.username,
      action: 'crear',
      entityType: 'carrusel',
      entityId: insertId,
      entityTitle: titulo || 'Slide',
    });

    res.status(201).json({ id: insertId, titulo, subtitulo, imagen_url, orden });
  } catch (err) {
    res.status(500).json({ message: 'Error al crear slide' });
  }
};

exports.deleteSlide = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows: prevRows } = await db.query('SELECT titulo FROM carrusel WHERE id = $1', [id]);
    const titulo = prevRows[0]?.titulo;

    await db.query('DELETE FROM carrusel WHERE id = $1', [id]);

    await logActivity({
      userId: req.usuario?.id,
      username: req.usuario?.username,
      action: 'eliminar',
      entityType: 'carrusel',
      entityId: id,
      entityTitle: titulo || 'Slide',
    });

    res.json({ message: 'Slide eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar slide' });
  }
};

exports.reordenarSlides = async (req, res) => {
  const { ordenIds } = req.body;
  if (!Array.isArray(ordenIds) || ordenIds.length === 0) {
    return res.status(400).json({ error: 'ordenIds debe ser un array con los IDs en el nuevo orden' });
  }

  try {
    for (let i = 0; i < ordenIds.length; i++) {
      await db.query('UPDATE carrusel SET orden = $1 WHERE id = $2', [i + 1, ordenIds[i]]);
    }

    await logActivity({
      userId: req.usuario?.id,
      username: req.usuario?.username,
      action: 'reordenar',
      entityType: 'carrusel',
      details: `${ordenIds.length} slides reordenados`,
    });

    res.json({ mensaje: 'Carrusel reordenado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'Error al reordenar slides' });
  }
};
