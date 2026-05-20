const db = require('../config/db');
const path = require('path');

// 1. Listar todos los trámites (para el panel admin)
const listarTramites = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM mesa_partes ORDER BY fecha_registro DESC');
        res.json(rows);
    } catch (err) {
        console.error('Error en listarTramites:', err.message);
        res.status(500).json({ error: 'Error al obtener trámites' });
    }
};

// 2. Enviar un nuevo trámite (público)
const enviarTramite = async (req, res) => {
    const { asunto, nombres_completos, dni, direccion, telefono, correo, fundamentacion } = req.body;

    if (!asunto || !nombres_completos || !dni || !direccion || !telefono || !fundamentacion) {
        return res.status(400).json({ error: 'Los campos marcados son obligatorios' });
    }

    // El archivo adjunto es opcional
    const archivo_adjunto = req.file ? req.file.filename : null;
    // Generar código de seguimiento único: EXP-AÑO-RANDOM
    const codigo_seguimiento = `EXP-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    try {
        const sql = `INSERT INTO mesa_partes 
            (codigo_seguimiento, asunto, nombres_completos, dni, direccion, telefono, correo, fundamentacion, archivo_adjunto) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const [result] = await db.query(sql, [
            codigo_seguimiento,
            asunto,
            nombres_completos,
            dni,
            direccion,
            telefono,
            correo || null,
            fundamentacion,
            archivo_adjunto
        ]);
        res.status(201).json({
            mensaje: 'Trámite registrado exitosamente.',
            codigo_seguimiento: codigo_seguimiento,
            id: result.insertId
        });
    } catch (err) {
        console.error('Error SQL en enviarTramite:', err.sqlMessage || err.message);
        res.status(500).json({ error: 'Error al registrar el trámite', detalle: err.sqlMessage });
    }
};

// 2.5 Consultar estado del trámite (público)
const consultarTramite = async (req, res) => {
    const { codigo, dni } = req.query;
    if (!codigo || !dni) {
        return res.status(400).json({ error: 'Debe proporcionar el código de expediente y su DNI.' });
    }
    try {
        const [rows] = await db.query('SELECT asunto, estado, fecha_registro FROM mesa_partes WHERE codigo_seguimiento = ? AND dni = ?', [codigo, dni]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'No se encontró ningún trámite con esos datos.' });
        }
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Error al consultar trámite' });
    }
};

// 3. Actualizar estado de un trámite
const actualizarEstado = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    const estadosValidos = ['pendiente', 'en_proceso', 'resuelto'];
    if (!estadosValidos.includes(estado)) {
        return res.status(400).json({ error: 'Estado inválido' });
    }
    try {
        await db.query('UPDATE mesa_partes SET estado = ? WHERE id = ?', [estado, id]);
        res.json({ mensaje: 'Estado actualizado' });
    } catch (err) {
        res.status(500).json({ error: 'Error al actualizar estado' });
    }
};

// 4. Eliminar un trámite
const eliminarTramite = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM mesa_partes WHERE id = ?', [id]);
        res.json({ mensaje: 'Trámite eliminado' });
    } catch (err) {
        res.status(500).json({ error: 'Error al eliminar trámite' });
    }
};

module.exports = { listarTramites, enviarTramite, consultarTramite, actualizarEstado, eliminarTramite };
