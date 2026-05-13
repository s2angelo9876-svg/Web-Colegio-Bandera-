const db = require('../config/db'); // Asegúrate de que la ruta a tu config de DB sea correcta

// Obtener todo el personal administrativo
const getAdministrativos = async (req, res) => {
    try {
        const sql = 'SELECT * FROM administrativos ORDER BY id DESC';
        const [results] = await db.query(sql);
        res.json(results);
    } catch (err) {
        console.error("Error en getAdministrativos:", err.message);
        return res.status(500).json({ error: err.message });
    }
};

// Registrar nuevo administrativo
const createAdministrativo = async (req, res) => {
    const { nombre, cargo, area, imagen_url } = req.body;
    try {
        const sql = 'INSERT INTO administrativos (nombre, cargo, area, imagen_url) VALUES (?, ?, ?, ?)';
        const [result] = await db.query(sql, [nombre, cargo, area, imagen_url]);
        res.status(201).json({ message: 'Personal registrado con éxito', id: result.insertId });
    } catch (err) {
        console.error("Error en createAdministrativo:", err.message);
        return res.status(500).json({ error: err.message });
    }
};

// Eliminar administrativo
const deleteAdministrativo = async (req, res) => {
    const { id } = req.params;
    try {
        const sql = 'DELETE FROM administrativos WHERE id = ?';
        await db.query(sql, [id]);
        res.json({ message: 'Registro eliminado correctamente' });
    } catch (err) {
        console.error("Error en deleteAdministrativo:", err.message);
        return res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getAdministrativos,
    createAdministrativo,
    deleteAdministrativo
};