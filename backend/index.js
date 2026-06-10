const express = require('express')
const cors = require('cors')
const path = require('path')
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config()

const db = require('./config/db') 
const initDb = require('./config/initDb')

// Inicializar esquemas de base de datos
initDb();

// Rutas
const noticiaRoutes = require('./routes/noticiaRoutes')
const docenteRoutes = require('./routes/docenteRoutes')
const eventoRoutes = require('./routes/eventoRoutes')
const galeriaRoutes = require('./routes/galeriaRoutes')
const authRoutes = require('./routes/authRoutes')
const comunicadoRoutes = require('./routes/comunicadoRoutes')
const transparenciaRoutes = require('./routes/transparenciaRoutes')
const admisionRoutes = require('./routes/admisionRoutes')
const administrativoRoutes = require('./routes/administrativoRoutes');
const carruselRoutes = require('./routes/carruselRoutes');
const configuracionRoutes = require('./routes/configuracionRoutes');
const mesaPartesRoutes = require('./routes/mesaPartesRoutes'); // NUEVO
const directivoRoutes = require('./routes/directivoRoutes'); // NUEVO V2

const app = express()
const PORT = process.env.PORT || 3000

// Habilitar CORS primero
app.use(cors())

// Configuración de Seguridad
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

// Limitación de peticiones
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: "Demasiadas peticiones desde esta IP, por favor intenta más tarde." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter)

app.use(express.json())
app.use(compression())
app.use(morgan('dev'))

// Servir archivos estáticos (imágenes, PDFs, etc.)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Ruta base
app.get('/', (req, res) => {
  res.json({ mensaje: 'Servidor Colegio Bandera del Perú ✅' })
})

// Endpoint de diagnóstico — TEMPORAL para depuración
app.get('/api/health', async (req, res) => {
  const info = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: {
      DATABASE_URL: process.env.DATABASE_URL ? '✅ Configurada' : '❌ NO DEFINIDA',
      NODE_ENV: process.env.NODE_ENV || 'no definido',
    },
    db: null,
    error: null
  };
  try {
    const [rows] = await db.query('SELECT NOW() as ahora');
    info.db = { conectada: true, hora_servidor: rows[0]?.ahora };
  } catch (err) {
    info.status = 'error';
    info.db = { conectada: false };
    info.error = err.message;
  }
  res.json(info);
});

// Rutas de la API
app.use('/api/noticias', noticiaRoutes)
app.use('/api/docentes', docenteRoutes)
app.use('/api/eventos', eventoRoutes)
app.use('/api/galeria', galeriaRoutes)
app.use('/api/comunicados', comunicadoRoutes)
app.use('/api/transparencia', transparenciaRoutes)
app.use('/api/admision', admisionRoutes)
app.use('/api/administrativos', administrativoRoutes)
app.use('/api/carrusel', carruselRoutes)
app.use('/api/configuracion', configuracionRoutes)
app.use('/api/mesa-partes', mesaPartesRoutes) // NUEVO
app.use('/api/directivos', directivoRoutes) // NUEVO V2

// Autenticación
app.use('/api/auth', authRoutes)

// Búsqueda global (endpoint para el buscador del Navbar)
app.get('/api/buscar', async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 2) return res.json({ resultados: [] });
  const term = `%${q.trim()}%`;
  try {
    const [noticias] = await db.query(
      `SELECT id, titulo, 'noticia' AS tipo FROM noticias WHERE titulo LIKE ? OR contenido LIKE ? LIMIT 3`,
      [term, term]
    );
    const [comunicados] = await db.query(
      `SELECT id, titulo, 'comunicado' AS tipo FROM comunicados WHERE titulo LIKE ? OR descripcion LIKE ? LIMIT 3`,
      [term, term]
    );
    const [docentes] = await db.query(
      `SELECT id, nombre AS titulo, 'docente' AS tipo FROM docentes WHERE nombre LIKE ? OR cargo LIKE ? LIMIT 3`,
      [term, term]
    );
    const resultados = [...noticias, ...comunicados, ...docentes];
    res.json({ resultados });
  } catch (err) {
    console.error('Error en búsqueda global:', err.message);
    res.status(500).json({ resultados: [] });
  }
});

// Middleware global de manejo de errores
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err.stack);
  res.status(500).json({ 
    error: 'Algo salió mal en el servidor',
    detalle: err.message  // Visible siempre para facilitar el diagnóstico
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})