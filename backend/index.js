const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const db = require('./config/db');
const initDb = require('./config/initDb');
const logger = require('./config/logger');

const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Lista blanca de orígenes permitidos para CORS
const ALLOWED_ORIGINS = [
  FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

// Ejecutar migraciones / verificación de esquema al arrancar
initDb();

// ── Rutas ───────────────────────────────────────────────────────────────
const noticiaRoutes        = require('./routes/noticiaRoutes');
const docenteRoutes        = require('./routes/docenteRoutes');
const eventoRoutes         = require('./routes/eventoRoutes');
const galeriaRoutes        = require('./routes/galeriaRoutes');
const authRoutes           = require('./routes/authRoutes');
const comunicadoRoutes     = require('./routes/comunicadoRoutes');
const transparenciaRoutes  = require('./routes/transparenciaRoutes');
const admisionRoutes       = require('./routes/admisionRoutes');
const administrativoRoutes = require('./routes/administrativoRoutes');
const carruselRoutes       = require('./routes/carruselRoutes');
const configuracionRoutes  = require('./routes/configuracionRoutes');
const mesaPartesRoutes     = require('./routes/mesaPartesRoutes');
const directivoRoutes      = require('./routes/directivoRoutes');
const statsRoutes          = require('./routes/statsRoutes');
const seoRoutes            = require('./routes/seoRoutes');

const app = express();

app.set('trust proxy', 1);

// ── CORS restringido ────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, cb) => {
    // Permitir requests sin origen (Postman, server-to-server) en desarrollo
    if (!origin && NODE_ENV !== 'production') return cb(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    return cb(new Error(`Origen no permitido por CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Seguridad ──────────────────────────────────────────────────────────
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));

// Rate limit general para toda la API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Demasiadas peticiones desde esta IP, por favor intenta más tarde.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit estricto para login (anti-fuerza bruta)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { error: 'Demasiados intentos de inicio de sesión. Intenta en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Middlewares base ───────────────────────────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());
app.use(compression());
if (NODE_ENV !== 'test') {
  app.use(morgan(NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Archivos estáticos locales (legacy / fallback). El flujo principal ahora es Supabase Storage.
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Endpoints base ─────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({ mensaje: 'Servidor Colegio Bandera del Perú ✅' });
});

// Health check
app.get('/api/health', async (_req, res) => {
  const info = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV,
      SUPABASE_URL: process.env.SUPABASE_URL ? '✅' : '❌',
      JWT_SECRET: process.env.JWT_SECRET ? '✅' : '❌',
    },
    db: null,
  };
  try {
    const result = await db.query('SELECT NOW() AS ahora');
    info.db = { conectada: true, hora_servidor: result.rows[0]?.ahora };
  } catch (err) {
    info.status = 'error';
    info.db = { conectada: false };
    if (NODE_ENV === 'development') info.error = err.message;
  }
  res.json(info);
});

// ── Rutas de la API ────────────────────────────────────────────────────
app.use('/api/noticias',        noticiaRoutes);
app.use('/api/docentes',        docenteRoutes);
app.use('/api/eventos',         eventoRoutes);
app.use('/api/galeria',         galeriaRoutes);
app.use('/api/comunicados',     comunicadoRoutes);
app.use('/api/transparencia',   transparenciaRoutes);
app.use('/api/admision',        admisionRoutes);
app.use('/api/administrativos', administrativoRoutes);
app.use('/api/carrusel',        carruselRoutes);
app.use('/api/configuracion',   configuracionRoutes);
app.use('/api/mesa-partes',     mesaPartesRoutes);
app.use('/api/directivos',      directivoRoutes);
app.use('/api/stats',           statsRoutes);
app.use('/',                    seoRoutes);
app.use('/api/auth',            authLimiter, authRoutes);

// Rate limit solo se aplica a partir de aquí (excepto /api/auth que ya tiene el suyo)
app.use('/api/', apiLimiter);

// Búsqueda global (navbar)
app.get('/api/buscar', async (req, res) => {
  const { q } = req.query;
  if (!q || String(q).trim().length < 2) return res.json({ resultados: [] });
  const term = `%${String(q).trim()}%`;
  try {
    const [noticias, comunicados, docentes] = await Promise.all([
      db.query(
        `SELECT id, titulo, 'noticia' AS tipo FROM noticias WHERE titulo ILIKE $1 OR contenido ILIKE $1 LIMIT 3`,
        [term]
      ),
      db.query(
        `SELECT id, titulo, 'comunicado' AS tipo FROM comunicados WHERE titulo ILIKE $1 OR descripcion ILIKE $1 LIMIT 3`,
        [term]
      ),
      db.query(
        `SELECT id, nombre AS titulo, 'docente' AS tipo FROM docentes WHERE nombre ILIKE $1 OR cargo ILIKE $1 LIMIT 3`,
        [term]
      ),
    ]);
    const resultados = [
      ...noticias.rows,
      ...comunicados.rows,
      ...docentes.rows,
    ];
    res.json({ resultados });
  } catch (err) {
    logger.error('Error en búsqueda global', { message: err.message });
    res.status(500).json({ resultados: [] });
  }
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint no encontrado' });
});

// ── Manejo global de errores ───────────────────────────────────────────
app.use((err, req, res, _next) => {
  logger.error('Error no manejado', { message: err.message, stack: err.stack, path: req.path });
  const payload = { error: 'Algo salió mal en el servidor' };
  if (NODE_ENV === 'development') payload.detalle = err.message;
  res.status(err.status || 500).json(payload);
});

app.listen(PORT, () => {
  logger.info(`Servidor corriendo en http://localhost:${PORT} (${NODE_ENV})`);
});
