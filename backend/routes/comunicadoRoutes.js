const express = require('express')
const router = express.Router()
const { getComunicados, crearComunicado, eliminarComunicado } = require('../controllers/comunicadoController')
const { verificarToken, soloAdmin } = require('../middleware/authMiddleware')

router.get('/', getComunicados)
router.post('/', verificarToken, crearComunicado)
router.delete('/:id', verificarToken, soloAdmin, eliminarComunicado)

module.exports = router