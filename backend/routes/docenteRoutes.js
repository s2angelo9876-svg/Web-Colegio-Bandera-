const express = require('express');
const router = express.Router();
const { getDocentes, createDocente, deleteDocente } = require('../controllers/docenteController');
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
  ...validateDocente, handleValidation,
  createDocente
);

router.delete('/:id', verificarToken, soloAdmin, ...idParam, handleValidation, deleteDocente);

module.exports = router;

