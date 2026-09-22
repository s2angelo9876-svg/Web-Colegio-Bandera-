const db = require('../config/db');

/**
 * POST /api/page-views/track
 * Endpoint público. Incrementa el contador de la página para el día actual.
 */
exports.trackPageView = async (req, res) => {
  const { page } = req.body;
  if (!page || typeof page !== 'string') {
    return res.status(400).json({ error: 'Se requiere el campo "page"' });
  }

  // Normalizar: solo rutas válidas, max 100 chars
  const cleanPage = page.trim().toLowerCase().slice(0, 100);
  if (!cleanPage.startsWith('/')) {
    return res.status(400).json({ error: 'La página debe empezar con /' });
  }

  try {
    await db.query(
      `INSERT INTO page_views (page, date, count)
       VALUES ($1, CURRENT_DATE, 1)
       ON CONFLICT (page, date) DO UPDATE SET count = page_views.count + 1`,
      [cleanPage]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar visita' });
  }
};

/**
 * GET /api/page-views/stats
 * Protegido. Devuelve estadísticas de visitas para el dashboard.
 */
exports.getPageViewStats = async (_req, res) => {
  try {
    // Total hoy
    const { rows: todayRows } = await db.query(
      `SELECT COALESCE(SUM(count), 0)::int AS total FROM page_views WHERE date = CURRENT_DATE`
    );

    // Total últimos 7 días
    const { rows: weekRows } = await db.query(
      `SELECT COALESCE(SUM(count), 0)::int AS total FROM page_views WHERE date >= CURRENT_DATE - INTERVAL '6 days'`
    );

    // Total últimos 30 días
    const { rows: monthRows } = await db.query(
      `SELECT COALESCE(SUM(count), 0)::int AS total FROM page_views WHERE date >= CURRENT_DATE - INTERVAL '29 days'`
    );

    // Desglose por página hoy (top 10)
    const { rows: porPagina } = await db.query(
      `SELECT page, count FROM page_views WHERE date = CURRENT_DATE ORDER BY count DESC LIMIT 10`
    );

    // Tendencia últimos 7 días (para gráfico)
    const { rows: tendencia } = await db.query(
      `SELECT date::text AS fecha, COALESCE(SUM(count), 0)::int AS total
       FROM page_views
       WHERE date >= CURRENT_DATE - INTERVAL '6 days'
       GROUP BY date
       ORDER BY date ASC`
    );

    const NOMBRES_DIA_CORTO = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    const tendencia_7d = tendencia.map((r) => {
      const d = new Date(r.fecha + 'T12:00:00');
      return {
        name: NOMBRES_DIA_CORTO[d.getDay()],
        valor: r.total,
      };
    });

    res.json({
      total_hoy: todayRows[0].total,
      total_7d: weekRows[0].total,
      total_30d: monthRows[0].total,
      por_pagina_hoy: porPagina,
      tendencia_7d,
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener estadísticas de visitas' });
  }
};
