const express = require('express');
const router = express.Router();
const configuracionController = require('../controllers/configuracionController');
const { verificarToken, soloAdmin } = require('../middleware/authMiddleware');

router.get('/', configuracionController.getConfig);
router.post('/', verificarToken, soloAdmin, configuracionController.updateConfig);

module.exports = router;
