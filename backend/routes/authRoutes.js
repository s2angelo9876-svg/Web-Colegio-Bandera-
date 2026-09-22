const express = require('express');
const router = express.Router();
const { login, verificar, logout, cambiarPassword, actualizarPerfil } = require('../controllers/authController');
const { verificarToken } = require('../middleware/authMiddleware');
const { handleValidation } = require('../middleware/validate');
const { body } = require('express-validator');
const { login: validateLogin } = require('../validators/schemas');

router.post('/login', validateLogin, handleValidation, login);
router.post('/logout', logout);
router.get('/verificar', verificarToken, verificar);

// Cambiar contrasena del usuario autenticado
router.post(
  '/cambiar-password',
  verificarToken,
  body('passwordActual').notEmpty().withMessage('Contrasena actual requerida'),
  body('passwordNueva').isLength({ min: 6 }).withMessage('La nueva contrasena debe tener al menos 6 caracteres'),
  handleValidation,
  cambiarPassword
);

// Actualizar perfil del usuario autenticado (username, email)
router.put(
  '/perfil',
  verificarToken,
  body('username').trim().isLength({ min: 3, max: 100 }).withMessage('Usuario debe tener 3-100 caracteres'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Email invalido'),
  handleValidation,
  actualizarPerfil
);

module.exports = router;

