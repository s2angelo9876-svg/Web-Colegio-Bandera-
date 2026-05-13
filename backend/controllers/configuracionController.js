const db = require('../config/db');

// Obtener todas las configuraciones
exports.getConfig = async (req, res) => {
    try {
        // Asegurar que la tabla existe con una sintaxis más compatible
        await db.query(`
            CREATE TABLE IF NOT EXISTS configuracion (
                clave VARCHAR(191) PRIMARY KEY,
                valor TEXT,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        const [rows] = await db.query('SELECT clave, valor FROM configuracion');
        
        // Convertir array de {clave, valor} a un objeto simple
        const config = {};
        if (Array.isArray(rows)) {
            rows.forEach(row => {
                config[row.clave] = row.valor;
            });
        }
        
        res.json(config);
    } catch (error) {
        console.error("Error en getConfig:", error.message);
        res.status(500).json({ 
            message: 'Error al obtener configuración', 
            details: error.message 
        });
    }
};

// Actualizar múltiples configuraciones
exports.updateConfig = async (req, res) => {
    const settings = req.body; 
    
    if (!settings || typeof settings !== 'object') {
        return res.status(400).json({ message: 'Datos de configuración inválidos' });
    }

    try {
        for (const [clave, valor] of Object.entries(settings)) {
            // Usar una versión de INSERT ... ON DUPLICATE KEY UPDATE robusta
            await db.query(
                'INSERT INTO configuracion (clave, valor) VALUES (?, ?) ON DUPLICATE KEY UPDATE valor = ?',
                [clave, String(valor), String(valor)]
            );
        }
        res.json({ message: 'Configuración actualizada correctamente' });
    } catch (error) {
        console.error("Error en updateConfig:", error.message);
        res.status(500).json({ 
            message: 'Error al actualizar configuración', 
            details: error.message 
        });
    }
};
