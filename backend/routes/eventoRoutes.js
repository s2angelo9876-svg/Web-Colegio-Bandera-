const express = require('express');
const router = express.Router();
const eventoController = require('../controllers/eventoController');
const { verificarToken, soloAdmin } = require('../middleware/authMiddleware');

router.get('/', eventoController.obtenerEventos);
router.post('/', verificarToken, soloAdmin, eventoController.crearEvento);
router.delete('/:id', verificarToken, soloAdmin, eventoController.eliminarEvento);

module.exports = router;
