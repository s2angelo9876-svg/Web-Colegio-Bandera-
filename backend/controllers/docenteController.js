const db = require('../config/db');

// 1. Obtener docentes (Corregido a Promesas)
const getDocentes = async (req, res) => {
    try {
        const sql = 'SELECT * FROM docentes ORDER BY orden ASC, nombre ASC';
        const [results] = await db.query(sql); // Desestructuración de promesas
        res.json(results);
    } catch (err) {
        console.error("Error en getDocentes:", err.message);
        return res.status(500).json({ error: err.message });
    }
};

// 2. Crear docente (Corregido a Promesas)
const createDocente = async (req, res) => {
    const { nombre, cargo, especialidad, imagen_url, orden } = req.body;
    try {
        const sql = 'INSERT INTO docentes (nombre, cargo, especialidad, imagen_url, orden) VALUES (?, ?, ?, ?, ?)';
        const [result] = await db.query(sql, [
            nombre, 
            cargo, 
            especialidad, 
            imagen_url, 
            orden || 0
        ]);
        
        res.status(201).json({ 
            message: 'Docente registrado correctamente', 
            id: result.insertId 
        });
    } catch (err) {
        console.error("Error en createDocente:", err.sqlMessage || err.message);
        return res.status(500).json({ 
            error: "Error al registrar docente", 
            detalle: err.sqlMessage 
        });
    }
};

// 3. Eliminar docente (Corregido a Promesas)
const deleteDocente = async (req, res) => {
    const { id } = req.params;
    try {
        const sql = 'DELETE FROM docentes WHERE id = ?';
        await db.query(sql, [id]);
        res.json({ message: 'Docente eliminado' });
    } catch (err) {
        console.error("Error en deleteDocente:", err.message);
        return res.status(500).json({ error: "No se pudo eliminar el docente" });
    }
};

module.exports = { getDocentes, createDocente, deleteDocente };