const express = require('express');
const router = express.Router();
const {
  getTags, createTag, deleteTag,
  setNoticiaTags, setComunicadoTags, setEventoTags,
  getContenidoByTag, getNubeTags,
} = require('../controllers/tagsController');
const { verificarToken, adminOEditor, soloAdmin } = require('../middleware/authMiddleware');
const { handleValidation } = require('../middleware/validate');
const { body } = require('express-validator');
const { sanitizeBody } = require('../utils/sanitize');

const createTagValidation = [
  body('nombre').trim().isLength({ min: 2, max: 50 }).withMessage('El nombre debe tener 2-50 caracteres'),
];

// Publico: lista de tags
router.get('/', getTags);
router.get('/nube', getNubeTags);
router.get('/:slug/contenido', getContenidoByTag);

// Admin/editor: crear, eliminar
router.post('/',
  verificarToken, adminOEditor,
  ...createTagValidation, sanitizeBody(['nombre']), handleValidation,
  createTag
);
router.delete('/:id',
  verificarToken, soloAdmin,
  deleteTag
);

// Asignar tags a entidades (PUT)
router.put('/noticias/:id/tags',
  verificarToken, adminOEditor,
  body('tagIds').isArray(),
  handleValidation,
  setNoticiaTags
);
router.put('/comunicados/:id/tags',
  verificarToken, adminOEditor,
  body('tagIds').isArray(),
  handleValidation,
  setComunicadoTags
);
router.put('/eventos/:id/tags',
  verificarToken, adminOEditor,
  body('tagIds').isArray(),
  handleValidation,
  setEventoTags
);

module.exports = router;
