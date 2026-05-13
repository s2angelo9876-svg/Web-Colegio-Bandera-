const db = require('../config/db');

const getGaleria = async (req, res) => {
    try {
        const sql = 'SELECT * FROM galeria ORDER BY fecha_publicacion DESC';
        const [results] = await db.query(sql);
        res.json(results);
    } catch (err) {
        console.error("Error en getGaleria:", err.message);
        return res.status(500).json({ error: err.message });
    }
};

const createFoto = async (req, res) => {
    const { titulo, anio, dia, mes } = req.body;
    const imagen_url = req.file ? req.file.filename : null;

    // Valores por defecto seguros
    const finalAnio = anio || new Date().getFullYear().toString();
    const finalDia = dia || new Date().getDate().toString();
    const finalMes = mes || (new Date().getMonth() + 1).toString();

    try {
        const sql = 'INSERT INTO galeria (titulo, imagen_url, anio, dia, mes) VALUES (?, ?, ?, ?, ?)';
        const [result] = await db.query(sql, [titulo, imagen_url, finalAnio, finalDia, finalMes]);
        res.status(201).json({ message: 'Imagen añadida a la galería', id: result.insertId });
    } catch (err) {
        console.error("Error en createFoto:", err.message);
        return res.status(500).json({ 
            error: "Error al guardar en la base de datos",
            detalle: err.message 
        });
    }
};

const fs = require('fs');
const path = require('path');

const deleteFoto = async (req, res) => {
    const { id } = req.params;
    try {
        // 1. Obtener la información de la imagen antes de borrarla
        const [rows] = await db.query('SELECT imagen_url FROM galeria WHERE id = ?', [id]);
        
        if (rows.length > 0 && rows[0].imagen_url) {
            const filePath = path.join(__dirname, '../uploads', rows[0].imagen_url);
            // 2. Borrar archivo físico si existe
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`Archivo borrado: ${rows[0].imagen_url}`);
            }
        }

        const sql = 'DELETE FROM galeria WHERE id = ?';
        await db.query(sql, [id]);
        res.json({ message: 'Imagen eliminada correctamente' });
    } catch (err) {
        console.error("Error en deleteFoto:", err.message);
        return res.status(500).json({ error: err.message });
    }
};

module.exports = { getGaleria, createFoto, deleteFoto };