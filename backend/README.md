# ⚙️ Colegio Bandera del Perú — Backend API

API REST para el portal institucional y panel administrativo del Colegio Bandera del Perú.

Construido sobre **Node.js + Express + PostgreSQL (Supabase)**.

---

### 📖 Guía Completa de la Plataforma
Para ver el detalle completo del proyecto, incluyendo:
*   🌟 Características Generales
*   🔐 Funcionalidades del Portal Público y Panel de Administración
*   📊 Esquemas detallados de la Base de Datos
*   🛡️ Arquitectura, Seguridad y Optimizaciones
*   🚀 Guía paso a paso de Instalación y Despliegue

👉 **[Ir al README.md Principal](../README.md)**

---

### 🛠 Stack Real

| Componente       | Tecnología                          |
|------------------|-------------------------------------|
| Runtime          | Node.js 18+                         |
| Framework        | Express.js                          |
| Base de datos    | **PostgreSQL via Supabase** (`pg`)  |
| Storage archivos | **Supabase Storage**                |
| Auth             | JWT + Bcrypt                        |
| Validación       | express-validator                   |
| Sanitización     | xss (server-side) + DOMPurify (FE)  |
| Email            | Nodemailer (Gmail)                  |
| Imágenes         | Sharp + WebP                        |
| Logs             | logger propio (JSON en prod)        |

---

### 🚀 Comandos Rápidos

```bash
# Instalar dependencias
npm install

# Desarrollo (con nodemon)
npm run dev

# Producción
node index.js
```

En el primer arranque se ejecutan automáticamente las migraciones SQL de `migrations/` y se crea un usuario admin por defecto (credenciales en `.env` con `SEED_ADMIN_USER` / `SEED_ADMIN_PASS`).

---

### 🔑 Variables del Archivo `.env`

Copia `.env.example` a `.env` y completa los valores.

```env
NODE_ENV=development
PORT=3000
JWT_SECRET=<secreto_aleatorio_largo>

# Base de datos (Supabase)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROYECTO].supabase.co:5432/postgres

# Frontend público (CORS)
FRONTEND_URL=http://localhost:5173

# Email (Mesa de Partes)
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASS=tu_app_password_de_16_caracteres
EMAIL_FROM="Mesa de Partes <tu_correo@gmail.com>"

# Supabase Storage
SUPABASE_URL=https://[PROYECTO].supabase.co
SUPABASE_SERVICE_KEY=<service_role_key>
SUPABASE_BUCKET=colegio-archivos
```

---

### 📦 Migración de archivos existentes a Supabase Storage

Si tienes archivos en `backend/uploads/` y quieres moverlos a Supabase Storage:

```bash
# 1. Asegúrate de tener SUPABASE_URL y SUPABASE_SERVICE_KEY en .env
# 2. Crea el bucket "colegio-archivos" en Supabase y márcalo como público
# 3. Ejecuta:
node scripts/migrateUploadsToSupabase.js
```

El script:
1. Lee todas las filas con URLs tipo `/uploads/...`
2. Sube cada archivo al bucket configurado
3. Actualiza la columna correspondiente con la nueva URL pública
4. Deja log de cada operación

**Haz un backup de la BD antes de correrlo.**

---

### 📁 Estructura

```
backend/
├── config/              # DB pool, logger, Supabase Storage client
│   ├── db.js            # Pool PostgreSQL nativo
│   ├── initDb.js        # Ejecuta migraciones y seed
│   ├── logger.js        # Logger con niveles
│   └── storage.js       # Cliente Supabase Storage
├── controllers/         # Lógica de negocio por recurso
├── middleware/          # Auth, uploads, validación
├── migrations/          # Scripts SQL versionados (idempotentes)
├── routes/              # Endpoints REST
├── scripts/             # Scripts de mantenimiento
├── uploads/             # Fallback local (vacío si se usa Supabase)
├── utils/               # Helpers (sanitize)
├── validators/          # Schemas con express-validator
├── index.js             # Entry point
└── .env.example
```
