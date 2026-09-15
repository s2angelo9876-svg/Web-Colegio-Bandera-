# 🏫 Portal Web Institucional — Colegio Bandera del Perú

> Plataforma full-stack para el portal institucional y panel administrativo
> de la I.E. Emblemática Bandera del Perú. Conecta a la comunidad educativa
> con un CMS dinámico, formularios de admisión y mesa de partes virtual.

**Stack real:** React 19 + Vite · Express · PostgreSQL (Supabase) · Supabase Storage · JWT en cookies httpOnly.

---

## 📌 Tabla de contenidos

1. [Características](#-características)
2. [Stack técnico](#-stack-técnico)
3. [Estructura](#-estructura)
4. [Módulos del portal público](#-módulos-del-portal-público)
5. [Panel administrativo](#-panel-administrativo)
6. [Modelo de datos](#-modelo-de-datos)
7. [Seguridad](#-seguridad)
8. [Desarrollo local](#-desarrollo-local)
9. [Despliegue](#-despliegue)
10. [Tests](#-tests)
11. [API Reference](#-api-reference)
12. [Changelog](#-changelog)

---

## 🌟 Características

- **Portal público responsivo** con tema claro/oscuro y soporte completo de mobile.
- **CMS dinámico**: noticias, comunicados, eventos, galería, docentes y administración.
- **Mesa de Partes Virtual** con código de seguimiento y notificaciones por email.
- **Personalización del sitio en caliente** vía tabla `configuracion` (textos, hero, pilares, estadísticas).
- **Estadísticas reales en el dashboard**: contadores y tendencias calculados desde la BD.
- **Búsqueda global** (noticias + comunicados + docentes).
- **SEO**: `robots.txt` y `sitemap.xml` dinámicos.
- **Almacenamiento persistente en la nube** (Supabase Storage) — sobrevive a redeploys.
- **Procesamiento de imágenes** en el servidor: resize + WebP + verificación de magic bytes.

---

## 🛠 Stack técnico

### Frontend (cliente)
| Tecnología | Uso |
|------------|-----|
| React 19 + Vite 8 | SPA, code-splitting por rutas |
| Tailwind CSS 4 | Sistema de diseño utilitario |
| React Router DOM 7 | Enrutamiento SPA |
| Recharts | Gráficos analíticos |
| DOMPurify | Sanitización de HTML renderizado |
| Lucide React | Iconografía |
| SweetAlert2 | Modales de confirmación |
| Axios | Cliente HTTP con interceptors |
| Vitest + Testing Library | Tests unitarios |

### Backend (servidor)
| Tecnología | Uso |
|------------|-----|
| Node.js 18+ + Express 4 | API REST |
| PostgreSQL (Supabase) | Base de datos principal |
| `pg` con pool nativo | Conexiones con placeholders `$1, $2` |
| Supabase Storage | Imágenes y PDFs |
| JWT en cookie httpOnly | Autenticación sin XSS |
| BcryptJS | Hash de contraseñas |
| Express Validator | Validación de payloads |
| XSS | Sanitización server-side |
| Multer + Sharp + file-type | Upload + resize + verificación magic bytes |
| Helmet + Rate Limit | Seguridad HTTP |
| Nodemailer | Envío de emails |
| Jest + Supertest | Tests del backend |

---

## 📂 Estructura

```
Web-Colegio-Bandera-/
├── backend/
│   ├── config/
│   │   ├── db.js              # Pool PostgreSQL nativo
│   │   ├── initDb.js          # Ejecuta migraciones y seed
│   │   ├── logger.js          # Logger con niveles (JSON en prod)
│   │   └── storage.js         # Cliente Supabase Storage
│   ├── controllers/           # Lógica de negocio (14 recursos)
│   ├── middleware/            # auth, uploads, validate
│   ├── migrations/
│   │   └── 001_initial.sql    # Esquema completo idempotente
│   ├── routes/                # 14 routers REST + seo
│   ├── scripts/
│   │   └── migrateUploadsToSupabase.js
│   ├── uploads/               # Fallback local (.gitkeep)
│   ├── utils/                 # sanitize, helpers
│   ├── validators/            # schemas con express-validator
│   ├── __tests__/             # Tests Jest
│   ├── index.js
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   │   ├── authContext.jsx
│   │   │   ├── ThemeContext.jsx
│   │   │   └── ToastContext.jsx
│   │   ├── pages/             # Páginas públicas + admin/*
│   │   ├── routes/AdminRoutes.jsx
│   │   ├── services/api.js
│   │   ├── utils/
│   │   ├── __tests__/         # Tests Vitest
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vercel.json            # SPA routing + cache headers
│   ├── vitest.config.js
│   └── package.json
│
├── package.json               # Scripts raíz (dev, build, test)
├── .gitignore
├── README.md
├── DEPLOY.md                  # Guía de despliegue detallada
└── CHANGELOG.md               # Historial de versiones
```

---

## 🌐 Módulos del portal público

- **Inicio**: hero editable, estadísticas, pilares, últimas novedades, búsqueda.
- **Nuestro Colegio**: reseña, equipo directivo, misión/visión, propuesta, TIC.
- **Noticias**: listado paginado + detalle.
- **Comunicados**: filtros por tipo (Urgente, Académico, Administrativo, General).
- **Calendario de eventos**.
- **Galería de fotos y videos**.
- **Docentes y Administrativos** (mosaico).
- **Documentos Institucionales / Transparencia** (PEI, RI, PAT, etc.).
- **Mesa de Partes Virtual**: formulario público con código de seguimiento y notificación por email.

---

## 🔐 Panel administrativo (`/admin/*`)

Acceso con login + JWT en cookie httpOnly.

| Módulo | Función |
|--------|---------|
| Dashboard | Contadores reales + tendencias mensuales + comunicados por día + últimas publicaciones |
| Noticias | CRUD + upload de imagen |
| Eventos | CRUD + upload de imagen |
| Comunicados | CRUD con categorías |
| Mesa de Partes | Bandeja de entrada + cambio de estado con email |
| Documentos Institucionales | Subida de PDFs públicos |
| Docentes / Administrativos / Directivos | CRUD con foto y orden |
| Galería | CRUD de fotos y videos |
| Carrusel | CRUD de banners del home |
| Personalización | Textos del hero, estadísticas, pilares, imagen |

---

## 🗃 Modelo de datos

13 tablas en PostgreSQL (ver `backend/migrations/001_initial.sql`):

`usuarios`, `noticias`, `eventos`, `comunicados`, `admisiones`, `transparencia`,
`configuracion`, `docentes`, `administrativos`, `equipo_directivo`,
`galeria`, `carrusel`, `mesa_partes`.

Más tabla interna `_migrations` para tracking.

---

## 🔒 Seguridad

- ✅ JWT en cookie `httpOnly` + `sameSite=lax` + `secure` en producción.
- ✅ Bcrypt con salt adaptativo para contraseñas.
- ✅ Helmet (cabeceras HTTP seguras).
- ✅ CORS restringido a `FRONTEND_URL`.
- ✅ Rate limit: **5/15min en login**, **200/15min general**.
- ✅ Validación con `express-validator` en **todos** los endpoints.
- ✅ Sanitización XSS server-side con `xss` library.
- ✅ Verificación de magic bytes en uploads (no solo extensión).
- ✅ Imágenes procesadas y convertidas a WebP antes de almacenar.
- ✅ Detalles de errores ocultos en producción (solo en `NODE_ENV=development`).

---

## 💻 Desarrollo local

```bash
# 1. Clonar
git clone https://github.com/s2angelo9876-svg/Web-Colegio-Bandera-.git
cd Web-Colegio-Bandera-

# 2. Instalar dependencias (raíz + backend + frontend)
npm install
cd backend && npm install
cd ../frontend && npm install

# 3. Configurar variables de entorno
cp backend/.env.example backend/.env   # o copiar .env.example en cada carpeta
# Editar .env con tus valores de Supabase, JWT_SECRET y Gmail App Password

# 4. Levantar backend y frontend juntos
cd ..
npm run dev
# Backend: http://localhost:3000
# Frontend: http://localhost:5173
```

Las migraciones corren automáticamente al iniciar el backend.
Si no existe usuario admin, se crea uno con `SEED_ADMIN_USER`/`SEED_ADMIN_PASS`
(default: `admin` / `Cambiar123!`) — **cámbialo en el primer login**.

---

## 🚀 Despliegue

Ver [DEPLOY.md](./DEPLOY.md) para la guía completa paso a paso.

**Resumen:**
- **Frontend** → Vercel (auto-deploy desde `main`)
- **Backend** → Render (auto-deploy desde `main`)
- **BD + Storage** → Supabase (crear bucket `colegio-archivos` público)

---

## ✅ Tests

```bash
# Backend (Jest)
cd backend && npm test

# Frontend (Vitest)
cd frontend && npm test

# Ambos
npm test
```

Cobertura actual: middleware de auth, sanitización XSS, validadores y helpers de frontend.

---

## 📡 API Reference

### Endpoints públicos

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/noticias?page=1&limit=10` | Listado paginado de noticias |
| GET | `/api/eventos?page=1&limit=10` | Listado paginado de eventos |
| GET | `/api/comunicados?page=1&limit=10` | Listado paginado de comunicados |
| GET | `/api/galeria` | Galería completa (pagina si `?page=`) |
| GET | `/api/docentes` | Docentes (pagina si `?page=`) |
| GET | `/api/administrativos` | Personal administrativo |
| GET | `/api/directivos` | Equipo directivo |
| GET | `/api/carrusel` | Slides del home |
| GET | `/api/configuracion` | Variables dinámicas del sitio |
| GET | `/api/stats` | Métricas para dashboard |
| GET | `/api/buscar?q=texto` | Búsqueda global |
| POST | `/api/auth/login` | Login (devuelve token + cookie) |
| POST | `/api/auth/logout` | Cierra sesión |
| GET | `/api/auth/verificar` | Verifica sesión activa |
| POST | `/api/admision` | Crear solicitud de admisión |
| POST | `/api/mesa-partes` | Enviar trámite |
| GET | `/api/mesa-partes/seguimiento` | Consultar trámite por código + DNI |
| GET | `/robots.txt` | SEO |
| GET | `/api/sitemap.xml` | Sitemap dinámico |

### Endpoints protegidos (admin)

Todos requieren JWT (cookie o `Authorization: Bearer`).
Ver detalle en `backend/routes/*.js` y `backend/controllers/*.js`.

---

## 📜 Changelog

Ver [CHANGELOG.md](./CHANGELOG.md).
