const express = require('express');
const router = express.Router();
const { getDirectivos, createDirectivo, updateDirectivo, deleteDirectivo } = require('../controllers/directivoController');
const { verificarToken, soloAdmin } = require('../middleware/authMiddleware');
const { upload, verifyMagicBytes, processAndUpload } = require('../middleware/uploadMiddleware');
const { handleValidation } = require('../middleware/validate');
const { directivo: validateDirectivo, idParam } = require('../validators/schemas');
const { sanitizeBody } = require('../utils/sanitize');

router.get('/', getDirectivos);

router.post(
  '/',
  verificarToken, soloAdmin,
  upload.single('imagen'),
  verifyMagicBytes,
  processAndUpload('directivos'),
  sanitizeBody(['nombres', 'cargo', 'frase', 'correo']),
  ...validateDirectivo, handleValidation,
  createDirectivo
);

router.put(
  '/:id',
  verificarToken, soloAdmin,
  ...idParam, handleValidation,
  upload.single('imagen'),
  verifyMagicBytes,
  processAndUpload('directivos'),
  sanitizeBody(['nombres', 'cargo', 'frase', 'correo']),
  ...validateDirectivo, handleValidation,
  updateDirectivo
);

router.delete('/:id', verificarToken, soloAdmin, ...idParam, handleValidation, deleteDirectivo);

module.exports = router;

