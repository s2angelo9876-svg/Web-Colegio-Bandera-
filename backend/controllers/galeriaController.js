const db = require('../config/db');
const fs = require('fs');
const path = require('path');

// 1. Obtener toda la galería (fotos y videos)
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

// 2. Crear elemento (foto o video)
const createFoto = async (req, res) => {
    const { titulo, anio, dia, mes, tipo, video_url } = req.body;
    const imagen_url = req.file ? req.file.filename : null;

    const tipoFinal = tipo || 'foto';
    const finalAnio = anio || new Date().getFullYear().toString();
    const finalDia = dia || new Date().getDate().toString();
    const finalMes = mes || (new Date().getMonth() + 1).toString();

    // Validar: si es foto necesita imagen, si es video puede tener video_url o imagen
    if (tipoFinal === 'foto' && !imagen_url) {
        return res.status(400).json({ error: 'Se requiere una imagen para fotos' });
    }
    if (tipoFinal === 'video' && !video_url && !imagen_url) {
        return res.status(400).json({ error: 'Se requiere URL de video o imagen para videos' });
    }

    try {
        const sql = `INSERT INTO galeria 
            (titulo, imagen_url, anio, dia, mes, tipo, video_url) 
            VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const [result] = await db.query(sql, [
            titulo,
            imagen_url,
            finalAnio,
            finalDia,
            finalMes,
            tipoFinal,
            video_url || null
        ]);
        res.status(201).json({ 
            message: tipoFinal === 'video' ? 'Video añadido a la galería' : 'Imagen añadida a la galería', 
            id: result.insertId 
        });
    } catch (err) {
        console.error("Error en createFoto:", err.message);
        return res.status(500).json({ 
            error: "Error al guardar en la base de datos",
            detalle: err.message 
        });
    }
};

// 3. Eliminar elemento (foto o video)
const deleteFoto = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.query('SELECT imagen_url, tipo FROM galeria WHERE id = ?', [id]);
        
        if (rows.length > 0 && rows[0].imagen_url && rows[0].tipo === 'foto') {
            const filePath = path.join(__dirname, '../uploads', rows[0].imagen_url);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`Archivo borrado: ${rows[0].imagen_url}`);
            }
        }

        await db.query('DELETE FROM galeria WHERE id = ?', [id]);
        res.json({ message: 'Elemento eliminado correctamente' });
    } catch (err) {
        console.error("Error en deleteFoto:", err.message);
        return res.status(500).json({ error: err.message });
    }
};

module.exports = { getGaleria, createFoto, deleteFoto };