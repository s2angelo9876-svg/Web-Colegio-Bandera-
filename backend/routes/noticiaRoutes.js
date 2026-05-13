const express = require('express')
const router = express.Router()
const noticiaController = require('../controllers/noticiaController')
const { verificarToken, soloAdmin } = require('../middleware/authMiddleware')
const multer = require('multer')
const path = require('path')

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

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

const validateNoticia = [
    body('titulo').trim().notEmpty().withMessage('El título es requerido').isLength({ max: 255 }),
    body('contenido').trim().notEmpty().withMessage('El contenido es requerido'),
    handleValidationErrors
];

// Rutas
router.get('/', noticiaController.getNoticias)
router.post('/', verificarToken, soloAdmin, upload.single('imagen'), validateNoticia, noticiaController.crearNoticia)
router.put('/:id', verificarToken, soloAdmin, upload.single('imagen'), validateNoticia, noticiaController.actualizarNoticia)
router.delete('/:id', verificarToken, soloAdmin, noticiaController.eliminarNoticia)

module.exports = router
