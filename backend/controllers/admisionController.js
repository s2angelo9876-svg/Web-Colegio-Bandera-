const db = require('../config/db');

// Guardar una nueva solicitud de admisión
exports.crearSolicitud = async (req, res) => {
    const { nombre_padre, nombre_estudiante, grado_interes, celular } = req.body;
    
    try {
        const query = 'INSERT INTO admisiones (nombre_padre, nombre_estudiante, grado_interes, celular) VALUES (?, ?, ?, ?)';
        await db.query(query, [nombre_padre, nombre_estudiante, grado_interes, celular]);
        res.status(201).json({ message: "Solicitud enviada con éxito" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al guardar la solicitud" });
    }
};

// Obtener todas las solicitudes (Para que lo veas en Admin.jsx después)
exports.obtenerSolicitudes = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM admisiones ORDER BY fecha_registro DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener solicitudes" });
    }
};