const express = require('express');
const router = express.Router();
const { listarTramites, enviarTramite, consultarTramite, actualizarEstado, eliminarTramite } = require('../controllers/mesaPartesController');
const { verificarToken, soloAdmin } = require('../middleware/authMiddleware');
const { upload, verifyMagicBytes, processAndUpload } = require('../middleware/uploadMiddleware');
const { handleValidation } = require('../middleware/validate');
const { mesaPartes: validateMP, estadoMesaPartes, idParam } = require('../validators/schemas');
const { sanitizeBody } = require('../utils/sanitize');

router.post(
  '/',
  upload.single('archivo_adjunto'),
  verifyMagicBytes,
  processAndUpload('mesa_partes'),
  sanitizeBody(['asunto', 'nombres_completos', 'direccion', 'fundamentacion']),
  ...validateMP, handleValidation,
  enviarTramite
);

router.get('/seguimiento', consultarTramite);

router.get('/', verificarToken, soloAdmin, listarTramites);
router.patch('/:id/estado', verificarToken, soloAdmin, ...idParam, handleValidation, ...estadoMesaPartes, handleValidation, actualizarEstado);
router.delete('/:id', verificarToken, soloAdmin, ...idParam, handleValidation, eliminarTramite);

module.exports = router;

