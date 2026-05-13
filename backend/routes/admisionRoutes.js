const express = require('express');
const router = express.Router();
const admisionController = require('../controllers/admisionController');
const { verificarToken, soloAdmin } = require('../middleware/authMiddleware');

// Ruta pública para que los padres se registren
router.post('/', admisionController.crearSolicitud);

// Ruta protegida para que el admin vea y elimine
router.get('/', verificarToken, soloAdmin, admisionController.obtenerSolicitudes);
router.delete('/:id', verificarToken, soloAdmin, admisionController.eliminarSolicitud);

module.exports = router;