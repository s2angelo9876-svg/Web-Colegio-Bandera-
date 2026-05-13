const express = require('express');
const router = express.Router();
const { getDocentes, createDocente, deleteDocente } = require('../controllers/docenteController');
const { verificarToken, soloAdmin } = require('../middleware/authMiddleware');

router.get('/', getDocentes);
router.post('/', verificarToken, soloAdmin, createDocente);
router.delete('/:id', verificarToken, soloAdmin, deleteDocente);

module.exports = router;