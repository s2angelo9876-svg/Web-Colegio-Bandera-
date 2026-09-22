const db = require('../config/db');

function parseTagIds(input) {
  if (!input) return [];
  if (Array.isArray(input)) return input.map(Number).filter(Boolean);
  if (typeof input === 'string') {
    try {
      const parsed = JSON.parse(input);
      if (Array.isArray(parsed)) return parsed.map(Number).filter(Boolean);
    } catch {
      return input.split(',').map(s => parseInt(s.trim(), 10)).filter(Boolean);
    }
  }
  return [];
}

// Obtener noticias con paginación, filtros de estado y tags
exports.getNoticias = async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
  const offset = (page - 1) * limit;

  const isAdmin = req.query.admin === 'true';
  const estado = req.query.estado; // 'publicado' | 'borrador' | 'programado' | 'todos'
  const tag = req.query.tag; // slug o nombre del tag

  try {
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    // Filtro por estado
    if (!isAdmin) {
      // Público solo ve publicados con fecha alcanzada
      conditions.push(`(COALESCE(n.estado, 'publicado') = 'publicado' AND (n.fecha_publicacion IS NULL OR n.fecha_publicacion <= NOW()))`);
    } else if (estado && estado !== 'todos') {
      conditions.push(`n.estado = $${paramIndex++}`);
      params.push(estado);
    }

    // Filtro por tag
    if (tag) {
      conditions.push(`EXISTS (
        SELECT 1 FROM noticias_tags nt2
        JOIN tags t2 ON nt2.tag_id = t2.id
        WHERE nt2.noticia_id = n.id AND (t2.slug = $${paramIndex} OR t2.nombre ILIKE $${paramIndex})
      )`);
      params.push(tag);
      paramIndex++;
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Contar total
    const countSql = `SELECT COUNT(DISTINCT n.id)::int AS total FROM noticias n ${whereClause}`;
    const { rows: countRows } = await db.query(countSql, params);
    const total = countRows[0]?.total || 0;

    // Obtener noticias con sus tags agregados
    const dataSql = `
      SELECT n.id, n.titulo, n.contenido, n.fecha, n.imagen,
             COALESCE(n.estado, 'publicado') AS estado,
             COALESCE(n.fecha_publicacion, n.fecha) AS fecha_publicacion,
             COALESCE(
               json_agg(
                 json_build_object('id', t.id, 'nombre', t.nombre, 'slug', t.slug)
               ) FILTER (WHERE t.id IS NOT NULL),
               '[]'
             ) AS tags
      FROM noticias n
      LEFT JOIN noticias_tags nt ON n.id = nt.noticia_id
      LEFT JOIN tags t ON nt.tag_id = t.id
      ${whereClause}
      GROUP BY n.id
      ORDER BY COALESCE(n.fecha_publicacion, n.fecha) DESC
      LIMIT $${paramIndex++} OFFSET $${paramIndex++}
    `;

    const { rows } = await db.query(dataSql, [...params, limit, offset]);

    res.json({
      data: rows,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Crear noticia
exports.crearNoticia = async (req, res) => {
  const { titulo, contenido, fecha, estado, fecha_publicacion, tags } = req.body;
  const imagen = req.file ? req.file.url_public : null;

  const estadoFinal = ['borrador', 'programado', 'publicado'].includes(estado) ? estado : 'publicado';
  const fechaPublicacionFinal = fecha_publicacion || fecha || new Date().toISOString();
  const fechaCreacion = fecha || new Date().toISOString();

  try {
    const { rows } = await db.query(
      `INSERT INTO noticias (titulo, contenido, fecha, imagen, estado, fecha_publicacion)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [titulo, contenido, fechaCreacion, imagen, estadoFinal, fechaPublicacionFinal]
    );

    const noticiaId = rows[0]?.id;

    // Asociar tags si se enviaron
    const tagIds = parseTagIds(tags);
    if (tagIds.length > 0 && noticiaId) {
      for (const tId of tagIds) {
        await db.query(
          'INSERT INTO noticias_tags (noticia_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [noticiaId, tId]
        );
      }
    }

    res.status(201).json({ mensaje: 'Noticia creada con éxito', id: noticiaId });
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar en la BD: ' + err.message });
  }
};

// Actualizar noticia
exports.actualizarNoticia = async (req, res) => {
  const { id } = req.params;
  const { titulo, contenido, estado, fecha_publicacion, tags } = req.body;
  const nuevaImagen = req.file ? req.file.url_public : null;

  try {
    const sets = ['titulo = $1', 'contenido = $2'];
    const params = [titulo, contenido];
    let i = 3;

    if (nuevaImagen) {
      sets.push(`imagen = $${i++}`);
      params.push(nuevaImagen);
    }
    if (estado && ['borrador', 'programado', 'publicado'].includes(estado)) {
      sets.push(`estado = $${i++}`);
      params.push(estado);
    }
    if (fecha_publicacion) {
      sets.push(`fecha_publicacion = $${i++}`);
      params.push(fecha_publicacion);
    }

    params.push(id);
    await db.query(
      `UPDATE noticias SET ${sets.join(', ')} WHERE id = $${i}`,
      params
    );

    // Actualizar tags si se enviaron
    if (tags !== undefined) {
      const tagIds = parseTagIds(tags);
      await db.query('DELETE FROM noticias_tags WHERE noticia_id = $1', [id]);
      for (const tId of tagIds) {
        await db.query(
          'INSERT INTO noticias_tags (noticia_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [id, tId]
        );
      }
    }

    res.json({ mensaje: 'Noticia actualizada con éxito' });
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar en la BD: ' + err.message });
  }
};

// Eliminar noticia
exports.eliminarNoticia = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM noticias WHERE id = $1', [id]);
    res.json({ mensaje: 'Noticia eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
