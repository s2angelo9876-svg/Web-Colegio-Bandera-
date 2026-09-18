const express = require('express');
const router = express.Router();
const eventoController = require('../controllers/eventoController');
const { verificarToken, soloAdmin } = require('../middleware/authMiddleware');
const { upload, verifyMagicBytes, processAndUpload } = require('../middleware/uploadMiddleware');
const { handleValidation } = require('../middleware/validate');
const { evento: validateEvento, idParam } = require('../validators/schemas');
const { sanitizeBody } = require('../utils/sanitize');

router.get('/', eventoController.obtenerEventos);

router.post(
  '/',
  verificarToken, soloAdmin,
  upload.single('imagen'),
  verifyMagicBytes,
  processAndUpload('eventos'),
  sanitizeBody(['titulo', 'descripcion', 'lugar']),
  ...validateEvento, handleValidation,
  eventoController.crearEvento
);

router.put(
  '/:id',
  verificarToken, soloAdmin,
  ...idParam, handleValidation,
  upload.single('imagen'),
  verifyMagicBytes,
  processAndUpload('eventos'),
  sanitizeBody(['titulo', 'descripcion', 'lugar']),
  ...validateEvento, handleValidation,
  eventoController.actualizarEvento
);

router.delete('/:id', verificarToken, soloAdmin, ...idParam, handleValidation, eventoController.eliminarEvento);

module.exports = router;

