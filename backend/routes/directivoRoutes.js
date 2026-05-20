const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getDirectivos, createDirectivo, updateDirectivo, deleteDirectivo } = require('../controllers/directivoController');
const { verificarToken, soloAdmin } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads/directivos')),
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});
const upload = multer({ storage });

router.get('/', getDirectivos);
router.post('/', verificarToken, soloAdmin, upload.single('imagen'), createDirectivo);
router.put('/:id', verificarToken, soloAdmin, upload.single('imagen'), updateDirectivo);
router.delete('/:id', verificarToken, soloAdmin, deleteDirectivo);

module.exports = router;
