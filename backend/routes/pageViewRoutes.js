const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { trackPageView, getPageViewStats } = require('../controllers/pageViewController');
const { verificarToken } = require('../middleware/authMiddleware');

// Rate limit estricto para tracking: máx 30 por IP cada minuto
const trackLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Demasiadas solicitudes de tracking' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Público — registrar visita
router.post('/track', trackLimiter, trackPageView);

// Protegido — obtener estadísticas
router.get('/stats', verificarToken, getPageViewStats);

module.exports = router;
