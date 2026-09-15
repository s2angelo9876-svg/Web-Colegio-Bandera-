const express = require('express');
const router = express.Router();
const admisionController = require('../controllers/admisionController');
const { verificarToken, soloAdmin } = require('../middleware/authMiddleware');
const { handleValidation } = require('../middleware/validate');
const { admision: validateAdmision, idParam } = require('../validators/schemas');
const { sanitizeBody } = require('../utils/sanitize');

router.post(
  '/',
  sanitizeBody(['nombre_padre', 'nombre_estudiante', 'grado_interes']),
  validateAdmision, handleValidation,
  admisionController.crearSolicitud
);

router.get('/', verificarToken, soloAdmin, admisionController.obtenerSolicitudes);
router.delete('/:id', verificarToken, soloAdmin, idParam, handleValidation, admisionController.eliminarSolicitud);

module.exports = router;
