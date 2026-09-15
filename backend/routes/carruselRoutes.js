const express = require('express');
const router = express.Router();
const carruselController = require('../controllers/carruselController');
const { verificarToken, soloAdmin } = require('../middleware/authMiddleware');
const { upload, verifyMagicBytes, processAndUpload } = require('../middleware/uploadMiddleware');
const { handleValidation } = require('../middleware/validate');
const { carrusel: validateCarrusel, idParam } = require('../validators/schemas');
const { sanitizeBody } = require('../utils/sanitize');

router.get('/', carruselController.getSlides);

router.post(
  '/',
  verificarToken, soloAdmin,
  upload.single('imagen'),
  verifyMagicBytes,
  processAndUpload('carrusel'),
  sanitizeBody(['titulo', 'subtitulo']),
  ...validateCarrusel, handleValidation,
  carruselController.createSlide
);

router.delete('/:id', verificarToken, soloAdmin, ...idParam, handleValidation, carruselController.deleteSlide);

module.exports = router;

