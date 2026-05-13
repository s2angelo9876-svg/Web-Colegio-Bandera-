const db = require('../config/db');

// 1. Obtener documentos
const getDocumentos = async (req, res) => {
    try {
        // Ajustamos el ORDER BY a la columna 'fecha' que sí existe en tu DB
        const sql = 'SELECT * FROM transparencia ORDER BY fecha DESC';
        const [results] = await db.query(sql); 
        res.json(results);
    } catch (err) {
        console.error("Error en getDocumentos:", err.message);
        return res.status(500).json({ error: "Error al obtener documentos" });
    }
};

// 2. Crear documento
const createDocumento = async (req, res) => {
    // Extraemos los datos usando los nombres que deberían venir del Front
    const { titulo, descripcion, archivo_pdf, categoria } = req.body;

    try {
        // Usamos los nombres exactos de tu imagen: titulo, descripcion, archivo_pdf, categoria
        // La columna 'fecha' se llena sola por el DEFAULT CURRENT_TIMESTAMP de tu DB
        const sql = 'INSERT INTO transparencia (titulo, descripcion, archivo_pdf, categoria) VALUES (?, ?, ?, ?)';
        const [result] = await db.query(sql, [titulo, descripcion, archivo_pdf, categoria]);
        
        res.status(201).json({ message: 'Documento publicado con éxito', id: result.insertId });
    } catch (err) {
        console.error("Error SQL en createDocumento:", err.sqlMessage || err.message);
        return res.status(500).json({ error: "Error al publicar documento", detalle: err.sqlMessage });
    }
};

// 3. Eliminar documento
const deleteDocumento = async (req, res) => {
    const { id } = req.params;
    try {
        const sql = 'DELETE FROM transparencia WHERE id = ?';
        await db.query(sql, [id]);
        res.json({ message: 'Documento eliminado correctamente' });
    } catch (err) {
        console.error("Error en deleteDocumento:", err.message);
        return res.status(500).json({ error: "No se pudo eliminar el documento" });
    }
};

module.exports = { getDocumentos, createDocumento, deleteDocumento };