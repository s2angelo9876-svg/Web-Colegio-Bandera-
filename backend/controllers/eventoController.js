const db = require('../config/db');

// 1. Obtener eventos
exports.obtenerEventos = async (req, res) => {
    try {
        // En mysql2/promise, db.query devuelve [rows, fields]
        const [rows] = await db.query('SELECT * FROM eventos ORDER BY fecha_evento ASC'); 
        res.json(rows);
    } catch (err) {
        console.error("Error al obtener eventos:", err);
        res.status(500).json({ error: "Error al obtener eventos" });
    }
};

// 2. Crear evento (Sincronizado con AdminEventos.jsx)
exports.crearEvento = async (req, res) => {
    // Extraemos los nombres exactos que definiste en tu estado 'form' de React
    const { titulo, descripcion, fecha_evento, hora_evento, lugar, imagen_url } = req.body;

    // Log para confirmar en tu terminal de VS Code que los datos llegan bien
    console.log("--> Datos para insertar:", { titulo, fecha_evento, hora_evento });

    if (!fecha_evento) {
        return res.status(400).json({ error: "La fecha_evento es obligatoria" });
    }

    try {
        const sql = `INSERT INTO eventos 
            (titulo, descripcion, fecha_evento, hora_evento, lugar, imagen_url) 
            VALUES (?, ?, ?, ?, ?, ?)`;
        
        // Ejecutamos la consulta esperando la promesa
        const [result] = await db.query(sql, [
            titulo, 
            descripcion || null, 
            fecha_evento, 
            hora_evento || null, 
            lugar || null,
            imagen_url || null
        ]);

        res.status(201).json({ 
            mensaje: "Evento creado con éxito", 
            id: result.insertId 
        });
    } catch (err) {
        // Si hay un error de MySQL (como columna no encontrada), aparecerá aquí
        console.error("DETALLE DE ERROR EN DB:", err.sqlMessage || err);
        res.status(500).json({ 
            error: "Error al insertar en la base de datos", 
            detalle: err.sqlMessage 
        });
    }
};

// 3. Eliminar evento
exports.eliminarEvento = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query("DELETE FROM eventos WHERE id = ?", [id]);
        res.json({ mensaje: "Evento eliminado correctamente" });
    } catch (err) {
        console.error("Error al eliminar evento:", err);
        res.status(500).json({ error: "Error al eliminar el evento" });
    }
};