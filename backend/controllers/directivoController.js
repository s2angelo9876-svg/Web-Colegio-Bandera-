const db = require('../config/db');

// Obtener todos los directivos (Público)
const getDirectivos = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM equipo_directivo ORDER BY orden ASC, id ASC');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener directivos:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
};

// Crear directivo (Admin)
const createDirectivo = async (req, res) => {
    const { nombres, cargo, frase, correo, orden } = req.body;
    const imagen_url = req.file ? `/uploads/directivos/${req.file.filename}` : null;

    try {
        const [result] = await db.query(
            'INSERT INTO equipo_directivo (nombres, cargo, frase, correo, imagen_url, orden) VALUES (?, ?, ?, ?, ?, ?)',
            [nombres, cargo, frase, correo, imagen_url, orden || 0]
        );
        res.status(201).json({ id: result.insertId, mensaje: 'Directivo creado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al crear directivo' });
    }
};

// Actualizar directivo (Admin)
const updateDirectivo = async (req, res) => {
    const { id } = req.params;
    const { nombres, cargo, frase, correo, orden } = req.body;
    const imagen_url = req.file ? `/uploads/directivos/${req.file.filename}` : undefined;

    try {
        if (imagen_url) {
            await db.query(
                'UPDATE equipo_directivo SET nombres=?, cargo=?, frase=?, correo=?, imagen_url=?, orden=? WHERE id=?',
                [nombres, cargo, frase, correo, imagen_url, orden || 0, id]
            );
        } else {
            await db.query(
                'UPDATE equipo_directivo SET nombres=?, cargo=?, frase=?, correo=?, orden=? WHERE id=?',
                [nombres, cargo, frase, correo, orden || 0, id]
            );
        }
        res.json({ mensaje: 'Directivo actualizado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar directivo' });
    }
};

// Eliminar directivo (Admin)
const deleteDirectivo = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM equipo_directivo WHERE id=?', [id]);
        res.json({ mensaje: 'Directivo eliminado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar directivo' });
    }
};

module.exports = { getDirectivos, createDirectivo, updateDirectivo, deleteDirectivo };
