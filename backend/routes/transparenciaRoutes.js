const express = require('express');
const router = express.Router();
const { getDocumentos, createDocumento, deleteDocumento } = require('../controllers/transparenciaController');
const { verificarToken, soloAdmin } = require('../middleware/authMiddleware');

router.get('/', getDocumentos);
router.post('/', verificarToken, soloAdmin, createDocumento);
router.delete('/:id', verificarToken, soloAdmin, deleteDocumento);

module.exports = router;