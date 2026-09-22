const express = require('express');
const router = express.Router();
const { getTags, createTag } = require('../controllers/tagsController');
const { verificarToken, adminOEditor } = require('../middleware/authMiddleware');
const { handleValidation } = require('../middleware/validate');
const { body } = require('express-validator');
const { sanitizeBody } = require('../utils/sanitize');

router.get('/', getTags);

router.post(
  '/',
  verificarToken,
  adminOEditor,
  body('nombre').trim().isLength({ min: 2, max: 50 }).withMessage('El nombre debe tener 2-50 caracteres'),
  sanitizeBody(['nombre']),
  handleValidation,
  createTag
);

module.exports = router;
