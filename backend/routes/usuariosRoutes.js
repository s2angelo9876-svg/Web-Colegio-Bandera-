const express = require('express');
const router = express.Router();
const {
  getUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario,
} = require('../controllers/usuariosController');
const { verificarToken, soloAdmin } = require('../middleware/authMiddleware');
const { handleValidation } = require('../middleware/validate');
const { body, param } = require('express-validator');
const { sanitizeBody } = require('../utils/sanitize');

const createUserValidation = [
  body('username').trim().isLength({ min: 3, max: 50 })
    .withMessage('El usuario debe tener 3-50 caracteres'),
  body('password').isLength({ min: 6, max: 100 })
    .withMessage('La contrasena debe tener al menos 6 caracteres'),
  body('email').optional({ checkFalsy: true }).isEmail()
    .withMessage('Email invalido'),
  body('rol').optional().isIn(['admin', 'editor', 'user'])
    .withMessage('Rol invalido'),
];

const updateUserValidation = [
  param('id').isInt({ min: 1 }).withMessage('ID invalido').toInt(),
  body('email').optional({ checkFalsy: true }).isEmail()
    .withMessage('Email invalido'),
  body('rol').optional().isIn(['admin', 'editor', 'user'])
    .withMessage('Rol invalido'),
  body('password').optional({ checkFalsy: true }).isLength({ min: 6 })
    .withMessage('Contrasena debe tener al menos 6 caracteres'),
];

router.get('/', verificarToken, soloAdmin, getUsuarios);

router.post(
  '/',
  verificarToken, soloAdmin,
  sanitizeBody(['username']),
  ...createUserValidation, handleValidation,
  createUsuario
);

router.put(
  '/:id',
  verificarToken, soloAdmin,
  ...updateUserValidation, handleValidation,
  updateUsuario
);

router.delete(
  '/:id',
  verificarToken, soloAdmin,
  param('id').isInt({ min: 1 }).toInt(),
  handleValidation,
  deleteUsuario
);

module.exports = router;
