const express = require('express');
const router = express.Router();
const { publishScheduled, cronHealth } = require('../controllers/cronController');

// Endpoints internos del cron (protegidos con CRON_SECRET)
router.get('/health', cronHealth);
router.get('/publish-scheduled', publishScheduled);

module.exports = router;
