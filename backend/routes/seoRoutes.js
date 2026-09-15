const express = require('express');
const router = express.Router();
const db = require('../config/db');

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://colegio-bandera.vercel.app';

// ── robots.txt ─────────────────────────────────────────────────────────
router.get('/robots.txt', (_req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Disallow: /admin/
Disallow: /login

Sitemap: ${FRONTEND_URL}/api/sitemap.xml
`);
});

// ── sitemap.xml dinámico ──────────────────────────────────────────────
router.get('/sitemap.xml', async (_req, res) => {
  try {
    const [noticias, eventos, comunicados] = await Promise.all([
      db.query('SELECT id, fecha FROM noticias ORDER BY fecha DESC'),
      db.query('SELECT id, fecha_evento FROM eventos ORDER BY fecha_evento DESC'),
      db.query('SELECT id, fecha FROM comunicados ORDER BY fecha DESC'),
    ]);

    const urls = [
      { loc: `${FRONTEND_URL}/`,             changefreq: 'weekly',  priority: '1.0' },
      { loc: `${FRONTEND_URL}/noticias`,     changefreq: 'weekly',  priority: '0.8' },
      { loc: `${FRONTEND_URL}/comunicados`,  changefreq: 'daily',   priority: '0.8' },
      { loc: `${FRONTEND_URL}/eventos`,      changefreq: 'weekly',  priority: '0.7' },
      { loc: `${FRONTEND_URL}/docentes`,     changefreq: 'monthly', priority: '0.6' },
      { loc: `${FRONTEND_URL}/administrativos`, changefreq: 'monthly', priority: '0.6' },
      { loc: `${FRONTEND_URL}/galeria`,      changefreq: 'weekly',  priority: '0.6' },
      { loc: `${FRONTEND_URL}/mesa-partes`,  changefreq: 'monthly', priority: '0.5' },
      { loc: `${FRONTEND_URL}/documentos-institucionales`, changefreq: 'monthly', priority: '0.7' },
    ];

    noticias.rows.forEach((n) => {
      const lastmod = n.fecha ? new Date(n.fecha).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
      urls.push({ loc: `${FRONTEND_URL}/noticias`, lastmod, changefreq: 'monthly', priority: '0.6' });
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    res.type('application/xml').send(xml);
  } catch (err) {
    res.status(500).type('text/plain').send('Error generando sitemap');
  }
});

module.exports = router;
