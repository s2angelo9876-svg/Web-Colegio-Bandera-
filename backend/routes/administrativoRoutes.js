const express = require('express');
const router = express.Router();
const { getAdministrativos, createAdministrativo, deleteAdministrativo } = require('../controllers/administrativoController');
const { verificarToken, soloAdmin } = require('../middleware/authMiddleware');
const { upload, verifyMagicBytes, processAndUpload } = require('../middleware/uploadMiddleware');
const { handleValidation } = require('../middleware/validate');
const { administrativo: validateAdmin, idParam } = require('../validators/schemas');
const { sanitizeBody } = require('../utils/sanitize');

router.get('/', getAdministrativos);

router.post(
  '/',
  verificarToken, soloAdmin,
  upload.single('imagen'),
  verifyMagicBytes,
  processAndUpload('administrativos'),
  sanitizeBody(['nombre', 'cargo', 'area']),
  validateAdmin, handleValidation,
  createAdministrativo
);

router.delete('/:id', verificarToken, soloAdmin, idParam, handleValidation, deleteAdministrativo);

module.exports = router;
