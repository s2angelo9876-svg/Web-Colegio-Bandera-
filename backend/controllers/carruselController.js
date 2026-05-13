const db = require('../config/db');

exports.getSlides = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM carrusel ORDER BY orden ASC');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener el carrusel' });
    }
};

exports.createSlide = async (req, res) => {
    const { titulo, subtitulo, orden } = req.body;
    const imagen_url = req.file ? req.file.filename : null;

    try {
        const [result] = await db.query(
            'INSERT INTO carrusel (titulo, subtitulo, imagen_url, orden) VALUES (?, ?, ?, ?)',
            [titulo, subtitulo, imagen_url, orden || 0]
        );
        res.status(201).json({ id: result.insertId, titulo, subtitulo, imagen_url, orden });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al crear slide' });
    }
};

const fs = require('fs');
const path = require('path');

exports.deleteSlide = async (req, res) => {
    const { id } = req.params;
    try {
        // 1. Obtener información de la imagen
        const [rows] = await db.query('SELECT imagen_url FROM carrusel WHERE id = ?', [id]);
        
        if (rows.length > 0 && rows[0].imagen_url) {
            const filePath = path.join(__dirname, '../uploads', rows[0].imagen_url);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await db.query('DELETE FROM carrusel WHERE id = ?', [id]);
        res.json({ message: 'Slide eliminado correctamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar slide' });
    }
};
