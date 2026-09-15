const db = require('../config/db');

// Obtener noticias con paginación
exports.getNoticias = async (req, res) => {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const offset = (page - 1) * limit;

    try {
        const { rows: countRows } = await db.query('SELECT COUNT(*)::int AS total FROM noticias');
        const total = countRows[0].total;

        const { rows } = await db.query(
            'SELECT * FROM noticias ORDER BY fecha DESC LIMIT $1 OFFSET $2',
            [limit, offset]
        );

        res.json({
            data: rows,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Crear noticia
exports.crearNoticia = async (req, res) => {
    const { titulo, contenido, fecha } = req.body;
    const imagen = req.file ? req.file.url_public : null; // URL pública de Supabase

    try {
        const fechaActual = fecha || new Date().toISOString();
        const { insertId } = await db.query(
            'INSERT INTO noticias (titulo, contenido, fecha, imagen) VALUES ($1, $2, $3, $4) RETURNING id',
            [titulo, contenido, fechaActual, imagen]
        );
        res.status(201).json({ mensaje: 'Noticia publicada con éxito', id: insertId });
    } catch (err) {
        res.status(500).json({ error: 'Error al guardar en la BD' });
    }
};

// Actualizar noticia
exports.actualizarNoticia = async (req, res) => {
    const { id } = req.params;
    const { titulo, contenido } = req.body;
    const nuevaImagen = req.file ? req.file.url_public : null;

    try {
        if (nuevaImagen) {
            await db.query(
                'UPDATE noticias SET titulo = $1, contenido = $2, imagen = $3 WHERE id = $4',
                [titulo, contenido, nuevaImagen, id]
            );
        } else {
            await db.query(
                'UPDATE noticias SET titulo = $1, contenido = $2 WHERE id = $3',
                [titulo, contenido, id]
            );
        }
        res.json({ mensaje: 'Noticia actualizada con éxito' });
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar en la BD' });
    }
};

// Eliminar noticia (la imagen se borra en el middleware de storage)
exports.eliminarNoticia = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM noticias WHERE id = $1', [id]);
        res.json({ mensaje: 'Noticia eliminada correctamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
