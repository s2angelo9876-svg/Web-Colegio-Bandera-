const express = require('express');
const router = express.Router();
const admisionController = require('../controllers/admisionController');
const { verificarToken, soloAdmin } = require('../middleware/authMiddleware');

// Ruta pública para que los padres se registren
router.post('/', admisionController.crearSolicitud);

// Ruta que podrías proteger después con tu authMiddleware para ver los datos en el admin
router.get('/', verificarToken, soloAdmin, admisionController.obtenerSolicitudes);

module.exports = router;