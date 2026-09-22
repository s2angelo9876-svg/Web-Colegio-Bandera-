const express = require('express');
const router = express.Router();
const { getActivityLog } = require('../controllers/activityLogController');
const { verificarToken, soloAdmin } = require('../middleware/authMiddleware');

// Solo admin puede ver el log de actividad
router.get('/', verificarToken, soloAdmin, getActivityLog);

module.exports = router;
