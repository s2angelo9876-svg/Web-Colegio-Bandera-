const express = require('express');
const router = express.Router();

console.log('noticiaRoutes: cargando controlador...');
const noticiaController = require('../controllers/noticiaController');
console.log('noticiaRoutes: crearNoticia es:', typeof noticiaController.crearNoticia);

const { verificarToken, soloAdmin } = require('../middleware/authMiddleware');
const { upload, verifyMagicBytes, processAndUpload } = require('../middleware/uploadMiddleware');
const { handleValidation } = require('../middleware/validate');
const { noticia: validateNoticia, idParam } = require('../validators/schemas');
const { sanitizeBody } = require('../utils/sanitize');

console.log('noticiaRoutes: validateNoticia es:', Array.isArray(validateNoticia) ? `array[${validateNoticia.length}]` : typeof validateNoticia);
console.log('noticiaRoutes: processAndUpload("noticias") es:', typeof processAndUpload('noticias'));

const uploadNoticia = [
  upload.single('imagen'),
  verifyMagicBytes,
  processAndUpload('noticias'),
];

router.get('/', noticiaController.getNoticias);

router.post(
  '/',
  verificarToken, soloAdmin,
  ...uploadNoticia,
  sanitizeBody(['titulo', 'contenido']),
  ...validateNoticia, handleValidation,
  noticiaController.crearNoticia
);

router.put(
  '/:id',
  verificarToken, soloAdmin,
  ...idParam, handleValidation,
  ...uploadNoticia,
  sanitizeBody(['titulo', 'contenido']),
  ...validateNoticia, handleValidation,
  noticiaController.actualizarNoticia
);

router.delete('/:id', verificarToken, soloAdmin, ...idParam, handleValidation, noticiaController.eliminarNoticia);

module.exports = router;
