const db = require('../config/db');

const NOMBRES_MES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const NOMBRES_DIA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

/**
 * GET /api/stats
 * Devuelve contadores totales y series temporales reales:
 *  - tendencia_mensual: publicaciones por mes (últimos 6)
 *  - comunicados_por_dia: comunicados por día de la semana (últimas 4 semanas)
 *  - eventos_proximos: cantidad de eventos en los próximos 30 días
 *  - ultimas_actualizaciones: noticias más recientes
 */
exports.getStats = async (req, res) => {
  try {
    const [
      noticiasCount,
      eventosCount,
      comunicadosCount,
      docentesCount,
      administrativosCount,
      galeriaCount,
      directivosCount,
      admisionesCount,
      mesaPartesCount,
      transparenciaCount,
      carruselCount,
      ultimasNoticias,
      ultimosComunicados,
      eventosProximos,
    ] = await Promise.all([
      db.query('SELECT COUNT(*)::int AS n FROM noticias'),
      db.query('SELECT COUNT(*)::int AS n FROM eventos'),
      db.query('SELECT COUNT(*)::int AS n FROM comunicados'),
      db.query('SELECT COUNT(*)::int AS n FROM docentes'),
      db.query('SELECT COUNT(*)::int AS n FROM administrativos'),
      db.query('SELECT COUNT(*)::int AS n FROM galeria'),
      db.query('SELECT COUNT(*)::int AS n FROM equipo_directivo'),
      db.query('SELECT COUNT(*)::int AS n FROM admisiones'),
      db.query('SELECT COUNT(*)::int AS n FROM mesa_partes'),
      db.query('SELECT COUNT(*)::int AS n FROM transparencia'),
      db.query('SELECT COUNT(*)::int AS n FROM carrusel'),
      db.query('SELECT id, titulo, fecha FROM noticias ORDER BY fecha DESC LIMIT 5'),
      db.query('SELECT id, titulo, fecha, tipo FROM comunicados ORDER BY fecha DESC LIMIT 5'),
      db.query("SELECT COUNT(*)::int AS n FROM eventos WHERE fecha_evento BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'"),
    ]);

    // Tendencia mensual: publicaciones de los últimos 6 meses (noticias + comunicados)
    const { rows: tendenciaRows } = await db.query(`
      SELECT
        TO_CHAR(date_trunc('month', d), 'YYYY-MM') AS mes,
        COUNT(*)::int AS total
      FROM (
        SELECT fecha AS d FROM noticias WHERE fecha >= NOW() - INTERVAL '6 months'
        UNION ALL
        SELECT fecha AS d FROM comunicados WHERE fecha >= NOW() - INTERVAL '6 months'
      ) AS publicaciones
      GROUP BY mes
      ORDER BY mes ASC
    `);

    const tendencia_mensual = tendenciaRows.map((r) => ({
      name: NOMBRES_MES[parseInt(r.mes.split('-')[1], 10) - 1],
      valor: r.total,
    }));

    // Comunicados por día de la semana (últimas 4 semanas)
    const { rows: porDiaRows } = await db.query(`
      SELECT
        EXTRACT(DOW FROM fecha)::int AS dow,
        COUNT(*)::int AS total
      FROM comunicados
      WHERE fecha >= NOW() - INTERVAL '4 weeks'
      GROUP BY dow
      ORDER BY dow ASC
    `);

    // Inicializar todos los días en 0 para que el chart no tenga huecos
    const comunicados_por_dia = NOMBRES_DIA.map((name, idx) => ({
      name,
      valor: porDiaRows.find((r) => r.dow === idx)?.total || 0,
    }));

    res.json({
      contadores: {
        noticias: noticiasCount.rows[0].n,
        eventos: eventosCount.rows[0].n,
        comunicados: comunicadosCount.rows[0].n,
        docentes: docentesCount.rows[0].n,
        administrativos: administrativosCount.rows[0].n,
        galeria: galeriaCount.rows[0].n,
        directivos: directivosCount.rows[0].n,
        admisiones: admisionesCount.rows[0].n,
        mesa_partes: mesaPartesCount.rows[0].n,
        transparencia: transparenciaCount.rows[0].n,
        carrusel: carruselCount.rows[0].n,
        eventos_proximos_30d: eventosProximos.rows[0].n,
      },
      tendencia_mensual,
      comunicados_por_dia,
      ultimas_noticias: ultimasNoticias.rows,
      ultimos_comunicados: ultimosComunicados.rows,
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};
