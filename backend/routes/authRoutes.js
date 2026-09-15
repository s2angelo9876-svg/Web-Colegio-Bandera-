const express = require('express');
const router = express.Router();
const { login, verificar, logout } = require('../controllers/authController');
const { verificarToken } = require('../middleware/authMiddleware');
const { handleValidation } = require('../middleware/validate');
const { login: validateLogin } = require('../validators/schemas');

router.post('/login', ...validateLogin, handleValidation, login);
router.post('/logout', logout);
router.get('/verificar', verificarToken, verificar);

module.exports = router;

