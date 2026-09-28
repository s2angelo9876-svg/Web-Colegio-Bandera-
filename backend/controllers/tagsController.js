const db = require('../config/db');
const logger = require('../config/logger');

// Helper: slugifica un nombre
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

// GET /api/tags?search=xxx
// Lista tags con conteo. Si viene search, filtra por nombre o slug.
exports.getTags = async (req, res) => {
  const { search } = req.query;
  const params = [];
  const conditions = [];

  if (search) {
    params.push(`%${search}%`);
    conditions.push(`(t.nombre ILIKE $1 OR t.slug ILIKE $1)`);
  }
  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  try {
    const { rows } = await db.query(
      `SELECT t.id, t.nombre, t.slug,
              COUNT(DISTINCT nt.noticia_id)::int    AS total_noticias,
              COUNT(DISTINCT ct.comunicado_id)::int AS total_comunicados,
              COUNT(DISTINCT et.evento_id)::int     AS total_eventos
       FROM tags t
       LEFT JOIN noticias_tags nt    ON t.id = nt.tag_id
       LEFT JOIN comunicado_tags ct ON t.id = ct.tag_id
       LEFT JOIN evento_tags et     ON t.id = et.tag_id
       ${where}
       GROUP BY t.id, t.nombre, t.slug
       ORDER BY t.nombre ASC
       LIMIT 100`,
      params
    );
    res.json(rows);
  } catch (err) {
    logger.error('Error en getTags', { message: err.message });
    res.status(500).json({ error: 'Error al obtener tags' });
  }
};

// POST /api/tags
// Crea un tag nuevo (o devuelve el existente si el nombre ya existe)
exports.createTag = async (req, res) => {
  const { nombre } = req.body;
  if (!nombre || !nombre.trim()) {
    return res.status(400).json({ error: 'El nombre del tag es obligatorio' });
  }
  const limpio = nombre.trim();
  const slug = slugify(limpio);

  try {
    const { rows } = await db.query(
      `INSERT INTO tags (nombre, slug) VALUES ($1, $2)
       ON CONFLICT (nombre) DO UPDATE SET slug = EXCLUDED.slug
       RETURNING id, nombre, slug`,
      [limpio, slug]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    logger.error('Error en createTag', { message: err.message });
    res.status(500).json({ error: 'Error al crear el tag' });
  }
};

// DELETE /api/tags/:id
exports.deleteTag = async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await db.query('DELETE FROM tags WHERE id = $1', [id]);
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Tag no encontrado' });
    }
    res.json({ mensaje: 'Tag eliminado' });
  } catch (err) {
    logger.error('Error en deleteTag', { message: err.message });
    res.status(500).json({ error: 'Error al eliminar el tag' });
  }
};

// PUT /api/noticias/:id/tags
// Reemplaza los tags asociados a una noticia
exports.setNoticiaTags = async (req, res) => {
  const { id } = req.params;
  const { tagIds } = req.body;
  if (!Array.isArray(tagIds)) {
    return res.status(400).json({ error: 'tagIds debe ser un array' });
  }
  try {
    await db.query('DELETE FROM noticias_tags WHERE noticia_id = $1', [id]);
    for (const tagId of tagIds) {
      await db.query(
        'INSERT INTO noticias_tags (noticia_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [id, tagId]
      );
    }
    res.json({ mensaje: 'Tags actualizados', total: tagIds.length });
  } catch (err) {
    logger.error('Error en setNoticiaTags', { message: err.message });
    res.status(500).json({ error: 'Error al asignar tags' });
  }
};

// PUT /api/comunicados/:id/tags
exports.setComunicadoTags = async (req, res) => {
  const { id } = req.params;
  const { tagIds } = req.body;
  if (!Array.isArray(tagIds)) {
    return res.status(400).json({ error: 'tagIds debe ser un array' });
  }
  try {
    await db.query('DELETE FROM comunicado_tags WHERE comunicado_id = $1', [id]);
    for (const tagId of tagIds) {
      await db.query(
        'INSERT INTO comunicado_tags (comunicado_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [id, tagId]
      );
    }
    res.json({ mensaje: 'Tags actualizados', total: tagIds.length });
  } catch (err) {
    logger.error('Error en setComunicadoTags', { message: err.message });
    res.status(500).json({ error: 'Error al asignar tags' });
  }
};

// PUT /api/eventos/:id/tags
exports.setEventoTags = async (req, res) => {
  const { id } = req.params;
  const { tagIds } = req.body;
  if (!Array.isArray(tagIds)) {
    return res.status(400).json({ error: 'tagIds debe ser un array' });
  }
  try {
    await db.query('DELETE FROM evento_tags WHERE evento_id = $1', [id]);
    for (const tagId of tagIds) {
      await db.query(
        'INSERT INTO evento_tags (evento_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [id, tagId]
      );
    }
    res.json({ mensaje: 'Tags actualizados', total: tagIds.length });
  } catch (err) {
    logger.error('Error en setEventoTags', { message: err.message });
    res.status(500).json({ error: 'Error al asignar tags' });
  }
};

// GET /api/tags/:slug/contenido
// Lista todas las entidades (noticias, comunicados, eventos) con esa tag
exports.getContenidoByTag = async (req, res) => {
  const { slug } = req.params;
  try {
    // Buscar el tag
    const { rows: tagRows } = await db.query('SELECT id, nombre FROM tags WHERE slug = $1', [slug]);
    if (tagRows.length === 0) {
      return res.status(404).json({ error: 'Tag no encontrado' });
    }
    const tag = tagRows[0];

    // Obtener contenido asociado
    const { rows: noticias } = await db.query(
      `SELECT n.id, n.titulo, n.contenido, n.fecha, n.imagen, n.estado
       FROM noticias n
       INNER JOIN noticias_tags nt ON n.id = nt.noticia_id
       WHERE nt.tag_id = $1 AND n.estado = 'publicado'
       ORDER BY n.fecha DESC`,
      [tag.id]
    );
    const { rows: comunicados } = await db.query(
      `SELECT c.id, c.titulo, c.descripcion, c.fecha, c.tipo
       FROM comunicados c
       INNER JOIN comunicado_tags ct ON c.id = ct.comunicado_id
       WHERE ct.tag_id = $1 AND c.estado = 'publicado'
       ORDER BY c.fecha DESC`,
      [tag.id]
    );
    const { rows: eventos } = await db.query(
      `SELECT e.id, e.titulo, e.descripcion, e.fecha_evento, e.hora_evento, e.lugar
       FROM eventos e
       INNER JOIN evento_tags et ON e.id = et.evento_id
       WHERE et.tag_id = $1 AND e.estado = 'publicado'
       ORDER BY e.fecha_evento ASC`,
      [tag.id]
    );

    res.json({ tag, contenido: { noticias, comunicados, eventos } });
  } catch (err) {
    logger.error('Error en getContenidoByTag', { message: err.message });
    res.status(500).json({ error: 'Error al obtener contenido' });
  }
};

// GET /api/tags/nube
// Devuelve la "nube de tags" con los más usados
exports.getNubeTags = async (_req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT t.id, t.nombre, t.slug,
             (COUNT(DISTINCT nt.noticia_id) + COUNT(DISTINCT ct.comunicado_id) + COUNT(DISTINCT et.evento_id))::int AS total
      FROM tags t
      LEFT JOIN noticias_tags nt    ON t.id = nt.tag_id
      LEFT JOIN comunicado_tags ct ON t.id = ct.tag_id
      LEFT JOIN evento_tags et     ON t.id = et.tag_id
      GROUP BY t.id, t.nombre, t.slug
      HAVING COUNT(DISTINCT nt.noticia_id) + COUNT(DISTINCT ct.comunicado_id) + COUNT(DISTINCT et.evento_id) > 0
      ORDER BY total DESC
      LIMIT 50
    `);
    res.json(rows);
  } catch (err) {
    logger.error('Error en getNubeTags', { message: err.message });
    res.status(500).json({ error: 'Error al obtener nube de tags' });
  }
};
