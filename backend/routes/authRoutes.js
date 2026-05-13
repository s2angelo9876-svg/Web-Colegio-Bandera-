const express = require('express')
const router = express.Router()
const { login, verificar } = require('../controllers/authController')
const { verificarToken } = require('../middleware/authMiddleware')

const { body, validationResult } = require('express-validator');

// Middleware de validación para Login
const validarLogin = [
    body('username').trim().notEmpty().withMessage('El usuario es requerido'),
    body('password').isLength({ min: 4 }).withMessage('La contraseña es requerida'),
    (req, res, next) => {
        const errores = validationResult(req);
        if (!errores.isEmpty()) {
            return res.status(400).json({ errores: errores.array() });
        }
        next();
    }
];

router.post('/login', validarLogin, login)
router.get('/verificar', verificarToken, verificar)

console.log('Login es:', typeof login); // Debería ser function
console.log('Verificar es:', typeof verificar); // Si dice undefined, arréglalo en el controller
console.log('VerificarToken es:', typeof verificarToken); // Debería ser function

module.exports = router
