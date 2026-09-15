const express = require('express');
const router = express.Router();
const { getDocumentos, createDocumento, deleteDocumento } = require('../controllers/transparenciaController');
const { verificarToken, soloAdmin } = require('../middleware/authMiddleware');
const { upload, verifyMagicBytes, processAndUpload } = require('../middleware/uploadMiddleware');
const { handleValidation } = require('../middleware/validate');
const { transparencia: validateTrans, idParam } = require('../validators/schemas');
const { sanitizeBody } = require('../utils/sanitize');

router.get('/', getDocumentos);

router.post(
  '/',
  verificarToken, soloAdmin,
  upload.single('archivo'),
  verifyMagicBytes,
  processAndUpload('transparencia'),
  sanitizeBody(['titulo', 'descripcion', 'categoria']),
  ...validateTrans, handleValidation,
  createDocumento
);

router.delete('/:id', verificarToken, soloAdmin, ...idParam, handleValidation, deleteDocumento);

module.exports = router;

