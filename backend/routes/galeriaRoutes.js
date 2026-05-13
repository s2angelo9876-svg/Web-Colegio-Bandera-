const express = require('express');
const router = express.Router();
const { getGaleria, createFoto, deleteFoto } = require('../controllers/galeriaController');
const { verificarToken, soloAdmin } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Configuración de Multer
const { body, validationResult } = require('express-validator');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({ storage: storage })

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