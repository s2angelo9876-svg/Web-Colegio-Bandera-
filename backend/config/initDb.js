const db = require('./db');

const initDb = async () => {
    try {
        console.log('--- Iniciando Verificación de Base de Datos ---');

        // 1. Tabla Usuarios
        await db.query(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                rol ENUM('admin', 'user') DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 2. Tabla Noticias
        await db.query(`
            CREATE TABLE IF NOT EXISTS noticias (
                id INT AUTO_INCREMENT PRIMARY KEY,
                titulo VARCHAR(255) NOT NULL,
                contenido TEXT NOT NULL,
                fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
                imagen VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 3. Tabla Galería (con soporte multimedia: fotos y videos)
        await db.query(`
            CREATE TABLE IF NOT EXISTS galeria (
                id INT AUTO_INCREMENT PRIMARY KEY,
                titulo VARCHAR(255),
                imagen_url VARCHAR(255),
                anio VARCHAR(10),
                dia VARCHAR(10),
                mes VARCHAR(20),
                fecha_publicacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                tipo ENUM('foto', 'video') DEFAULT 'foto',
                video_url VARCHAR(500) NULL
            )
        `);

        // Añadir columnas a galería si no existen (migración segura)
        await db.query(`ALTER TABLE galeria ADD COLUMN IF NOT EXISTS tipo ENUM('foto', 'video') DEFAULT 'foto'`).catch(() => {});
        await db.query(`ALTER TABLE galeria ADD COLUMN IF NOT EXISTS video_url VARCHAR(500) NULL`).catch(() => {});

        // 4. Tabla Carrusel
        await db.query(`
            CREATE TABLE IF NOT EXISTS carrusel (
                id INT AUTO_INCREMENT PRIMARY KEY,
                titulo VARCHAR(255),
                subtitulo TEXT,
                imagen_url VARCHAR(255),
                orden INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 5. Tabla Configuración
        await db.query(`
            CREATE TABLE IF NOT EXISTS configuracion (
                clave VARCHAR(191) PRIMARY KEY,
                valor TEXT,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 6. Tabla Comunicados
        await db.query(`
            CREATE TABLE IF NOT EXISTS comunicados (
                id INT AUTO_INCREMENT PRIMARY KEY,
                titulo VARCHAR(255),
                descripcion TEXT,
                fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
                tipo VARCHAR(50),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 7. Tabla Admisiones (mantenida por compatibilidad)
        await db.query(`
            CREATE TABLE IF NOT EXISTS admisiones (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre_padre VARCHAR(255) NOT NULL,
                nombre_estudiante VARCHAR(255) NOT NULL,
                grado_interes VARCHAR(100) NOT NULL,
                celular VARCHAR(20) NOT NULL,
                fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 8. Tabla Mesa de Partes (NUEVA con Código de Seguimiento)
        await db.query(`
            CREATE TABLE IF NOT EXISTS mesa_partes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                codigo_seguimiento VARCHAR(50) UNIQUE,
                asunto VARCHAR(255) NOT NULL,
                nombres_completos VARCHAR(255) NOT NULL,
                dni VARCHAR(20) NOT NULL,
                direccion VARCHAR(255) NOT NULL,
                telefono VARCHAR(20) NOT NULL,
                correo VARCHAR(255) NULL,
                fundamentacion TEXT NOT NULL,
                archivo_adjunto VARCHAR(255) NULL,
                estado ENUM('pendiente', 'en_proceso', 'resuelto') DEFAULT 'pendiente',
                fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Migración segura para código de seguimiento
        await db.query(`ALTER TABLE mesa_partes ADD COLUMN IF NOT EXISTS codigo_seguimiento VARCHAR(50) UNIQUE NULL`).catch(() => {});

        // 8.5 Tabla Equipo Directivo Dinámico
        await db.query(`
            CREATE TABLE IF NOT EXISTS equipo_directivo (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombres VARCHAR(255) NOT NULL,
                cargo VARCHAR(255) NOT NULL,
                frase TEXT NULL,
                correo VARCHAR(255) NULL,
                imagen_url VARCHAR(255) NULL,
                orden INT DEFAULT 0
            )
        `);

        // 9. Tabla Transparencia / Documentos Institucionales
        await db.query(`
            CREATE TABLE IF NOT EXISTS transparencia (
                id INT AUTO_INCREMENT PRIMARY KEY,
                titulo VARCHAR(255) NOT NULL,
                descripcion TEXT,
                archivo_pdf VARCHAR(255) NOT NULL,
                categoria VARCHAR(100) NOT NULL,
                fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // 10. Tabla Docentes (con columna de tutoría)
        await db.query(`
            CREATE TABLE IF NOT EXISTS docentes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(255) NOT NULL,
                cargo VARCHAR(255),
                especialidad VARCHAR(255),
                imagen_url VARCHAR(255),
                orden INT DEFAULT 0,
                tutoria VARCHAR(100) NULL
            )
        `);

        // Añadir columna tutoria si no existe (migración segura)
        await db.query(`ALTER TABLE docentes ADD COLUMN IF NOT EXISTS tutoria VARCHAR(100) NULL`).catch(() => {});

        // 11. Tabla Administrativos
        await db.query(`
            CREATE TABLE IF NOT EXISTS administrativos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(255) NOT NULL,
                cargo VARCHAR(255),
                area VARCHAR(255),
                imagen_url VARCHAR(255)
            )
        `);

        // 12. Tabla Eventos
        await db.query(`
            CREATE TABLE IF NOT EXISTS eventos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                titulo VARCHAR(255) NOT NULL,
                descripcion TEXT,
                fecha_evento DATE NOT NULL,
                hora_evento TIME,
                lugar VARCHAR(255),
                imagen_url VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('✅ Base de datos verificada y tablas aseguradas.');
    } catch (error) {
        console.error('❌ Error al inicializar la base de datos:', error.message);
        // No detenemos el proceso para permitir que el servidor intente arrancar
    }
};

module.exports = initDb;
