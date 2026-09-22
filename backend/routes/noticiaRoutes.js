const express = require('express');
const router = express.Router();
const noticiaController = require('../controllers/noticiaController');
const { verificarToken, soloAdmin, adminOEditor } = require('../middleware/authMiddleware');
const { upload, verifyMagicBytes, processAndUpload } = require('../middleware/uploadMiddleware');
const { handleValidation } = require('../middleware/validate');
const { noticia: validateNoticia, idParam } = require('../validators/schemas');
const { sanitizeBody } = require('../utils/sanitize');

const uploadNoticia = [
  upload.single('imagen'),
  verifyMagicBytes,
  processAndUpload('noticias'),
];

router.get('/', noticiaController.getNoticias);

router.post(
  '/',
  verificarToken, adminOEditor,
  ...uploadNoticia,
  sanitizeBody(['titulo', 'contenido']),
  ...validateNoticia, handleValidation,
  noticiaController.crearNoticia
);

router.put(
  '/:id',
  verificarToken, adminOEditor,
  ...idParam, handleValidation,
  ...uploadNoticia,
  sanitizeBody(['titulo', 'contenido']),
  ...validateNoticia, handleValidation,
  noticiaController.actualizarNoticia
);

router.delete('/:id', verificarToken, soloAdmin, ...idParam, handleValidation, noticiaController.eliminarNoticia);

module.exports = router;
