const db = require('../config/db');

// Listar todos los tags con conteo de noticias asociadas
exports.getTags = async (_req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT t.id, t.nombre, t.slug,
              COUNT(nt.noticia_id)::int AS total_noticias
       FROM tags t
       LEFT JOIN noticias_tags nt ON t.id = nt.tag_id
       GROUP BY t.id, t.nombre, t.slug
       ORDER BY t.nombre ASC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener tags' });
  }
};

// Crear tag nueva (admin o editor)
exports.createTag = async (req, res) => {
  const { nombre } = req.body;
  if (!nombre || !nombre.trim()) {
    return res.status(400).json({ error: 'El nombre del tag es obligatorio' });
  }

  const limpio = nombre.trim();
  const slug = limpio
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  try {
    const { rows } = await db.query(
      `INSERT INTO tags (nombre, slug) VALUES ($1, $2)
       ON CONFLICT (nombre) DO UPDATE SET nombre = EXCLUDED.nombre
       RETURNING id, nombre, slug`,
      [limpio, slug]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear o asociar el tag' });
  }
};
