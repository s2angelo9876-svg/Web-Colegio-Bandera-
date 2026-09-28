const express = require('express');
const router = express.Router();
const {
  getActivityLog,
  getActivityLogById,
  exportActivityLogCSV,
  getActivityLogStats,
} = require('../controllers/activityLogController');
const { verificarToken, soloAdmin } = require('../middleware/authMiddleware');

router.get('/', verificarToken, soloAdmin, getActivityLog);
router.get('/stats', verificarToken, soloAdmin, getActivityLogStats);
router.get('/export/csv', verificarToken, soloAdmin, exportActivityLogCSV);
router.get('/:id', verificarToken, soloAdmin, getActivityLogById);

module.exports = router;
