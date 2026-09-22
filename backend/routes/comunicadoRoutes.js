const express = require('express');
const router = express.Router();
const { getComunicados, crearComunicado, actualizarComunicado, eliminarComunicado } = require('../controllers/comunicadoController');
const { verificarToken, soloAdmin, adminOEditor } = require('../middleware/authMiddleware');
const { handleValidation } = require('../middleware/validate');
const { comunicado: validateComunicado, idParam } = require('../validators/schemas');
const { sanitizeBody } = require('../utils/sanitize');

router.get('/', getComunicados);

router.post(
  '/',
  verificarToken, adminOEditor,
  sanitizeBody(['titulo', 'descripcion']),
  ...validateComunicado, handleValidation,
  crearComunicado
);

router.put(
  '/:id',
  verificarToken, adminOEditor,
  ...idParam, handleValidation,
  sanitizeBody(['titulo', 'descripcion']),
  ...validateComunicado, handleValidation,
  actualizarComunicado
);

router.delete('/:id', verificarToken, soloAdmin, ...idParam, handleValidation, eliminarComunicado);

module.exports = router;

