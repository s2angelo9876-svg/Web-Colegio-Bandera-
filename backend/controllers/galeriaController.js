const db = require('../config/db');

exports.getGaleria = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM galeria ORDER BY fecha_publicacion DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createFoto = async (req, res) => {
  const { titulo, anio, dia, mes, tipo, video_url } = req.body;
  const imagen_url = req.file ? req.file.url_public : null;

  const tipoFinal = tipo || 'foto';
  const finalAnio = anio || new Date().getFullYear().toString();
  const finalDia = dia || new Date().getDate().toString();
  const finalMes = mes || (new Date().getMonth() + 1).toString();

  if (tipoFinal === 'foto' && !imagen_url) {
    return res.status(400).json({ error: 'Se requiere una imagen para fotos' });
  }
  if (tipoFinal === 'video' && !video_url && !imagen_url) {
    return res.status(400).json({ error: 'Se requiere URL de video o imagen para videos' });
  }

  try {
    const { insertId } = await db.query(
      `INSERT INTO galeria (titulo, imagen_url, anio, dia, mes, tipo, video_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [titulo, imagen_url, finalAnio, finalDia, finalMes, tipoFinal, video_url || null]
    );
    res.status(201).json({
      message: tipoFinal === 'video' ? 'Video añadido a la galería' : 'Imagen añadida a la galería',
      id: insertId,
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar en la base de datos' });
  }
};

exports.deleteFoto = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM galeria WHERE id = $1', [id]);
    res.json({ message: 'Elemento eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
