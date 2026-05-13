const express = require('express');
const router = express.Router();
const carruselController = require('../controllers/carruselController');
const { verificarToken, soloAdmin } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

const { body, validationResult } = require('express-validator');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({ storage });

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
router.post('/', verificarToken, soloAdmin, upload.single('imagen'), validateCarrusel, carruselController.createSlide);
router.delete('/:id', verificarToken, soloAdmin, carruselController.deleteSlide);

module.exports = router;
