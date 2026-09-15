const db = require('../config/db');

exports.getDocumentos = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM transparencia ORDER BY fecha DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener documentos' });
  }
};

exports.createDocumento = async (req, res) => {
  const { titulo, descripcion, categoria } = req.body;
  const archivo_pdf = req.file ? req.file.url_public : null;

  if (!archivo_pdf) {
    return res.status(400).json({ error: 'Se requiere un archivo PDF' });
  }

  try {
    const { insertId } = await db.query(
      'INSERT INTO transparencia (titulo, descripcion, archivo_pdf, categoria) VALUES ($1, $2, $3, $4) RETURNING id',
      [titulo, descripcion, archivo_pdf, categoria]
    );
    res.status(201).json({ message: 'Documento publicado con éxito', id: insertId });
  } catch (err) {
    res.status(500).json({ error: 'Error al publicar documento' });
  }
};

exports.deleteDocumento = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM transparencia WHERE id = $1', [id]);
    res.json({ message: 'Documento eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: 'No se pudo eliminar el documento' });
  }
};
