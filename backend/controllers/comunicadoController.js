const db = require('../config/db');

exports.getComunicados = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM comunicados ORDER BY fecha DESC');
        res.json(rows);
    } catch (err) {
        console.error("Error al obtener:", err);
        res.status(500).json({ error: "Error al obtener comunicados" });
    }
};

exports.crearComunicado = async (req, res) => {
    // 1. Extraemos con los nombres que vienen del Frontend (AdminComunicados.jsx)
    const { titulo, descripcion, fecha, tipo } = req.body;

    try {
        // 2. Usamos los nombres de columna correctos de tu DB
        // Según tus capturas previas: titulo, descripcion, fecha, tipo
        const sql = "INSERT INTO comunicados (titulo, descripcion, fecha, tipo) VALUES (?, ?, ?, ?)";
        
        await db.query(sql, [
            titulo, 
            descripcion, 
            fecha || new Date(), 
            tipo || 'aviso'
        ]);

        res.status(201).json({ mensaje: "Comunicado publicado correctamente" });
    } catch (err) {
        // Log para ver el error real en la terminal
        console.error("ERROR SQL DETALLADO:", err.sqlMessage || err);
        res.status(500).json({ 
            error: "Error al publicar comunicado", 
            detalle: err.sqlMessage 
        });
    }
};

exports.eliminarComunicado = async (req, res) => {
    try {
        await db.query("DELETE FROM comunicados WHERE id = ?", [req.params.id]);
        res.json({ mensaje: "Comunicado eliminado" });
    } catch (err) {
        console.error("Error al eliminar:", err);
        res.status(500).json({ error: "Error al eliminar" });
    }
};