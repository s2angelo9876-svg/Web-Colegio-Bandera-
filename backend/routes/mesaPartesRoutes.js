const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { listarTramites, enviarTramite, consultarTramite, actualizarEstado, eliminarTramite } = require('../controllers/mesaPartesController');
const { verificarToken, soloAdmin } = require('../middleware/authMiddleware');

// Configuración de Multer para archivos adjuntos de Mesa de Partes
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/mesa_partes')),
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB máximo
    fileFilter: (req, file, cb) => {
        const allowed = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) cb(null, true);
        else cb(new Error('Tipo de archivo no permitido'));
    }
});

// Rutas públicas
router.post('/', upload.single('archivo_adjunto'), enviarTramite);
router.get('/seguimiento', consultarTramite);

// Rutas protegidas (solo admin)
router.get('/', verificarToken, soloAdmin, listarTramites);
router.patch('/:id/estado', verificarToken, soloAdmin, actualizarEstado);
router.delete('/:id', verificarToken, soloAdmin, eliminarTramite);

module.exports = router;
