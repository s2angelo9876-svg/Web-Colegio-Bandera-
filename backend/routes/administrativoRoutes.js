const express = require('express');
const router = express.Router();
const { 
    getAdministrativos, 
    createAdministrativo, 
    deleteAdministrativo 
} = require('../controllers/administrativoController');
const { verificarToken, soloAdmin } = require('../middleware/authMiddleware');

// Definir los endpoints
router.get('/', getAdministrativos);
router.post('/', verificarToken, soloAdmin, createAdministrativo);
router.delete('/:id', verificarToken, soloAdmin, deleteAdministrativo);

module.exports = router;