const db = require('../config/db');

// Obtener noticias con paginación
exports.getNoticias = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
        // Obtenemos total para el frontend
        const [[{ total }]] = await db.query('SELECT COUNT(*) as total FROM noticias');
        
        const [rows] = await db.query(
            'SELECT * FROM noticias ORDER BY fecha DESC LIMIT ? OFFSET ?',
            [limit, offset]
        );

        res.json({
            data: rows,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Crear noticia
exports.crearNoticia = async (req, res) => {
    const { titulo, contenido, fecha } = req.body;
    const imagen = req.file ? req.file.filename : null;

    try {
        const sql = "INSERT INTO noticias (titulo, contenido, fecha, imagen) VALUES (?, ?, ?, ?)";
        const fechaActual = fecha || new Date().toISOString().slice(0, 19).replace('T', ' ');
        const [result] = await db.query(sql, [titulo, contenido, fechaActual, imagen]);
        res.status(201).json({ mensaje: "Noticia publicada con éxito", id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al guardar en la BD" });
    }
};

const fs = require('fs');
const path = require('path');

// Eliminar noticia
exports.eliminarNoticia = async (req, res) => {
    const { id } = req.params;
    try {
        // 1. Obtener la información de la imagen antes de borrarla
        const [rows] = await db.query('SELECT imagen FROM noticias WHERE id = ?', [id]);
        
        if (rows.length > 0 && rows[0].imagen) {
            const filePath = path.join(__dirname, '../uploads', rows[0].imagen);
            // 2. Borrar archivo físico si existe
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`Imagen de noticia borrada: ${rows[0].imagen}`);
            }
        }

        await db.query("DELETE FROM noticias WHERE id = ?", [id]);
        res.json({ mensaje: "Noticia eliminada correctamente" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Actualizar noticia
exports.actualizarNoticia = async (req, res) => {
    const { id } = req.params;
    const { titulo, contenido } = req.body;
    const imagen = req.file ? req.file.filename : null;

    try {
        let sql, params;
        if (imagen) {
            sql = "UPDATE noticias SET titulo = ?, contenido = ?, imagen = ? WHERE id = ?";
            params = [titulo, contenido, imagen, id];
        } else {
            sql = "UPDATE noticias SET titulo = ?, contenido = ? WHERE id = ?";
            params = [titulo, contenido, id];
        }
        await db.query(sql, params);
        res.json({ mensaje: "Noticia actualizada con éxito" });
    } catch (err) {
        res.status(500).json({ error: "Error al actualizar en la BD" });
    }
};