const express = require('express');
const router = express.Router();
const { getDocentes, createDocente, updateDocente, deleteDocente } = require('../controllers/docenteController');
const { verificarToken, soloAdmin } = require('../middleware/authMiddleware');
const { upload, verifyMagicBytes, processAndUpload } = require('../middleware/uploadMiddleware');
const { handleValidation } = require('../middleware/validate');
const { docente: validateDocente, idParam } = require('../validators/schemas');
const { sanitizeBody } = require('../utils/sanitize');

router.get('/', getDocentes);

router.post(
  '/',
  verificarToken, soloAdmin,
  upload.single('imagen'),
  verifyMagicBytes,
  processAndUpload('docentes'),
  sanitizeBody(['nombre', 'cargo', 'especialidad']),
  validateDocente, handleValidation,
  createDocente
);

router.put(
  '/:id',
  verificarToken, soloAdmin,
  ...idParam, handleValidation,
  upload.single('imagen'),
  verifyMagicBytes,
  processAndUpload('docentes'),
  sanitizeBody(['nombre', 'cargo', 'especialidad']),
  validateDocente, handleValidation,
  updateDocente
);

router.delete('/:id', verificarToken, soloAdmin, ...idParam, handleValidation, deleteDocente);

module.exports = router;

