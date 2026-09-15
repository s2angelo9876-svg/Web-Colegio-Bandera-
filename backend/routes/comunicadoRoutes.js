const express = require('express');
const router = express.Router();
const { getComunicados, crearComunicado, eliminarComunicado } = require('../controllers/comunicadoController');
const { verificarToken, soloAdmin } = require('../middleware/authMiddleware');
const { handleValidation } = require('../middleware/validate');
const { comunicado: validateComunicado, idParam } = require('../validators/schemas');
const { sanitizeBody } = require('../utils/sanitize');

router.get('/', getComunicados);

router.post(
  '/',
  verificarToken, soloAdmin,
  sanitizeBody(['titulo', 'descripcion']),
  ...validateComunicado, handleValidation,
  crearComunicado
);

router.delete('/:id', verificarToken, soloAdmin, ...idParam, handleValidation, eliminarComunicado);

module.exports = router;

