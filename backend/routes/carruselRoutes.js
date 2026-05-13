const express = require('express');
const router = express.Router();
const carruselController = require('../controllers/carruselController');
const { verificarToken, soloAdmin } = require('../middleware/authMiddleware');
const { upload, processImage } = require('../middleware/uploadMiddleware');
const { body, validationResult } = require('express-validator');

// Middleware de validación
const handleValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
};

const validateCarrusel = [
    body('titulo').trim().notEmpty().withMessage('El título es requerido'),
    body('orden').optional().isInt().withMessage('El orden debe ser un número'),
    handleValidation
];

router.get('/', carruselController.getSlides);
router.post('/', verificarToken, soloAdmin, upload.single('imagen'), processImage, validateCarrusel, carruselController.createSlide);
router.delete('/:id', verificarToken, soloAdmin, carruselController.deleteSlide);

module.exports = router;
