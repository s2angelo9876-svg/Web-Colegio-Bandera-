const express = require('express')
const cors = require('cors')
const path = require('path')
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config()

const db = require('./config/db') 

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

const app = express()
const PORT = process.env.PORT || 3000

// Configuración de Seguridad
app.use(helmet());
// Permitir carga de imágenes locales desde el frontend
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

// Limitación de peticiones (Protección DoS y Fuerza Bruta)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200, // Límite de 200 peticiones por IP (ajustado para ser más permisivo en desarrollo)
  message: { error: "Demasiadas peticiones desde esta IP, por favor intenta más tarde." },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

app.use(cors())
app.use(express.json())

// Servir imágenes subidas como archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Ruta base
app.get('/', (req, res) => {
  res.json({ mensaje: 'Servidor Colegio Bandera del Perú ✅' })
})

// Rutas públicas
app.use('/api/noticias', noticiaRoutes)
app.use('/api/docentes', docenteRoutes)
app.use('/api/eventos', eventoRoutes)
app.use('/api/galeria', galeriaRoutes)
app.use('/api/comunicados', comunicadoRoutes)
app.use('/api/transparencia', require('./routes/transparenciaRoutes'));
app.use('/api/admision', admisionRoutes)
app.use('/api/administrativos', administrativoRoutes);
app.use('/api/carrusel', carruselRoutes);
app.use('/api/configuracion', configuracionRoutes);

// Autenticación
app.use('/api/auth', authRoutes)

// Middleware global de manejo de errores (Captura errores no manejados)
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err.stack);
  res.status(500).json({ 
    error: 'Algo salió mal en el servidor',
    detalle: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})
console.log('¿DB usa promesas?:', typeof db.query === 'function');