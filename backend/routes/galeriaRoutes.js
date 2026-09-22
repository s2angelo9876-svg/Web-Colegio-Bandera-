const express = require('express');
const router = express.Router();
const { getGaleria, createFoto, deleteFoto, reordenarGaleria } = require('../controllers/galeriaController');
const { verificarToken, soloAdmin, adminOEditor } = require('../middleware/authMiddleware');
const { upload, verifyMagicBytes, processAndUpload } = require('../middleware/uploadMiddleware');
const { handleValidation } = require('../middleware/validate');
const { galeria: validateGaleria, idParam } = require('../validators/schemas');
const { sanitizeBody } = require('../utils/sanitize');

router.get('/', getGaleria);

router.put('/reordenar', verificarToken, adminOEditor, reordenarGaleria);

router.post(
  '/',
  verificarToken, adminOEditor,
  upload.single('imagen'),
  verifyMagicBytes,
  processAndUpload('galeria'),
  sanitizeBody(['titulo']),
  ...validateGaleria, handleValidation,
  createFoto
);

router.delete('/:id', verificarToken, soloAdmin, ...idParam, handleValidation, deleteFoto);

module.exports = router;

