const express = require('express');
const router = express.Router();
const { getGaleria, createFoto, deleteFoto } = require('../controllers/galeriaController');
const { verificarToken, soloAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { body, validationResult } = require('express-validator');

// Middleware de validación
const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
};

const validateGaleria = [
    body('titulo').trim().notEmpty().withMessage('El título es requerido'),
    handleValidation
];

router.get('/', getGaleria);
router.post('/', verificarToken, soloAdmin, upload.single('imagen'), validateGaleria, createFoto);
router.delete('/:id', verificarToken, soloAdmin, deleteFoto);

module.exports = router;