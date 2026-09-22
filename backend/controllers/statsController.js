const db = require('../config/db');

const NOMBRES_MES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const NOMBRES_DIA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

/**
 * GET /api/stats
 * Devuelve contadores totales, series temporales y metricas contextuales
 * para el dashboard del admin (optimizado para no-tecnicos):
 *  - contadores: totales por recurso
 *  - pendientes: tramites que requieren accion (mesa_partes pendientes, etc.)
 *  - recientes: ultimas publicaciones
 *  - eventos_proximos: eventos en los proximos 30 dias
 *  - tendencias: graficos
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
      mesaPartesPendientes,
      mesaPartesTotal,
      transparenciaCount,
      carruselCount,
      ultimasNoticias,
      ultimosComunicados,
      eventosProximos,
      admisionesRecientes,
    ] = await Promise.all([
      db.query('SELECT COUNT(*)::int AS n FROM noticias'),
      db.query('SELECT COUNT(*)::int AS n FROM eventos'),
      db.query('SELECT COUNT(*)::int AS n FROM comunicados'),
      db.query('SELECT COUNT(*)::int AS n FROM docentes'),
      db.query('SELECT COUNT(*)::int AS n FROM administrativos'),
      db.query('SELECT COUNT(*)::int AS n FROM galeria'),
      db.query('SELECT COUNT(*)::int AS n FROM equipo_directivo'),
      db.query('SELECT COUNT(*)::int AS n FROM admisiones'),
      db.query("SELECT COUNT(*)::int AS n FROM mesa_partes WHERE estado = 'pendiente'"),
      db.query('SELECT COUNT(*)::int AS n FROM mesa_partes'),
      db.query('SELECT COUNT(*)::int AS n FROM transparencia'),
      db.query('SELECT COUNT(*)::int AS n FROM carrusel'),
      db.query('SELECT id, titulo, fecha FROM noticias ORDER BY fecha DESC LIMIT 5'),
      db.query('SELECT id, titulo, fecha, tipo FROM comunicados ORDER BY fecha DESC LIMIT 5'),
      db.query("SELECT COUNT(*)::int AS n FROM eventos WHERE fecha_evento BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'"),
      db.query("SELECT COUNT(*)::int AS n FROM admisiones WHERE fecha_registro >= NOW() - INTERVAL '7 days'"),
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

    const comunicados_por_dia = NOMBRES_DIA.map((name, idx) => ({
      name,
      valor: porDiaRows.find((r) => r.dow === idx)?.total || 0,
    }));

    // Lista plana para el dashboard
    const tramites_pendientes_detalle = mesaPartesPendientes.rows[0].n;
    const admisiones_recientes = admisionesRecientes.rows[0].n;

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
        transparencia: transparenciaCount.rows[0].n,
        carrusel: carruselCount.rows[0].n,
      },
      pendientes: {
        mesa_partes: tramites_pendientes_detalle,
        admisiones_esta_semana: admisiones_recientes,
      },
      mesa_partes_total: mesaPartesTotal.rows[0].n,
      eventos_proximos_30d: eventosProximos.rows[0].n,
      tendencia_mensual,
      comunicados_por_dia,
      ultimas_noticias: ultimasNoticias.rows,
      ultimos_comunicados: ultimosComunicados.rows,
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};
