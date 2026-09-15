# 🚀 Guía de despliegue

Esta guía asume el siguiente setup:
- **Frontend** → [Vercel](https://vercel.com)
- **Backend** → [Render](https://render.com)
- **Base de datos + Storage** → [Supabase](https://supabase.com)

---

## 1️⃣ Preparar Supabase

### 1.1 Crear proyecto
1. https://supabase.com/dashboard → **New project**
2. Anota la **contraseña de la BD** (la necesitarás para `DATABASE_URL`)
3. Espera a que el proyecto termine de provisionar (~2 min)

### 1.2 Obtener credenciales
- **Settings → Database → Connection string (URI)** → este es tu `DATABASE_URL`
  - Formato: `postgresql://postgres:CONTRASEÑA@db.PROYECTO.supabase.co:5432/postgres`
- **Settings → API**:
  - `Project URL` → `SUPABASE_URL`
  - `service_role` key (NO la `anon`) → `SUPABASE_SERVICE_KEY`

### 1.3 Crear bucket de Storage
1. Menú lateral → **Storage** → **New bucket**
2. Nombre: `colegio-archivos`
3. ✅ Marca **Public bucket** (para que las URLs sean accesibles)
4. Create

---

## 2️⃣ Desplegar Backend en Render

### 2.1 Crear servicio
1. https://dashboard.render.com → **New +** → **Web Service**
2. Conecta tu repo de GitHub
3. Configuración:
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Plan**: Free (suficiente para empezar)

### 2.2 Variables de entorno
En **Environment**, agrega:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `JWT_SECRET` | (hex de 64 bytes — genera con `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`) |
| `DATABASE_URL` | (la connection string de Supabase) |
| `FRONTEND_URL` | (la URL de Vercel, ver paso 3) |
| `EMAIL_USER` | tu Gmail |
| `EMAIL_PASS` | App Password de 16 chars |
| `EMAIL_FROM` | `"Mesa de Partes <tu_correo@gmail.com>"` |
| `SUPABASE_URL` | `https://PROYECTO.supabase.co` |
| `SUPABASE_SERVICE_KEY` | service_role key |
| `SUPABASE_BUCKET` | `colegio-archivos` |

### 2.3 Deploy
- Render redesplegará automáticamente en cada `git push` a `main`.
- Espera el primer build (~3-5 min).
- **Anota la URL pública**, formato: `https://TU-APP.onrender.com`

### 2.4 Verificar
Visita `https://TU-APP.onrender.com/api/health`. Debe devolver:
```json
{
  "status": "ok",
  "env": { "NODE_ENV": "production", "SUPABASE_URL": "✅", "JWT_SECRET": "✅" },
  "db": { "conectada": true }
}
```

Si ves `"db": { "conectada": false }`, revisa tu `DATABASE_URL`.

---

## 3️⃣ Desplegar Frontend en Vercel

### 3.1 Crear proyecto
1. https://vercel.com/new → importa el repo
2. Configuración:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 3.2 Variables de entorno
En **Settings → Environment Variables**:

| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://TU-APP.onrender.com/api` |
| `VITE_UPLOADS_URL` | `https://TU-APP.onrender.com/uploads` |

⚠️ **Solo `VITE_*` se exponen al bundle del navegador.**

### 3.3 Deploy
- Vercel detectará el push y redesplegará automáticamente.
- Tu URL será algo como `https://web-colegio-bandera.vercel.app`.

---

## 4️⃣ Vincular frontend ↔ backend

Ahora que tienes ambas URLs:

1. **Vuelve a Render** → edita `FRONTEND_URL` con la URL real de Vercel
2. Render detectará el cambio y redesplegará
3. **Listo**, ya puedes iniciar sesión en `/login`

---

## 5️⃣ Migrar archivos existentes (opcional)

Si tenías imágenes/PDFs en `backend/uploads/` antes de subir a Supabase Storage:

```bash
cd backend
# 1. Configurar SUPABASE_URL y SUPABASE_SERVICE_KEY en .env
# 2. Crear el bucket "colegio-archivos" en Supabase
# 3. Ejecutar:
node scripts/migrateUploadsToSupabase.js
```

El script sube los archivos locales al bucket y actualiza las URLs en la BD.

---

## 6️⃣ Primer login

1. Ve a `https://TU-FRONTEND.vercel.app/login`
2. Usuario: el que pusiste en `SEED_ADMIN_USER` (default `admin`)
3. Contraseña: el que pusiste en `SEED_ADMIN_PASS` (default `Cambiar123!`)
4. **Cámbiala inmediatamente** desde el panel.

---

## 🐛 Troubleshooting

| Problema | Solución |
|----------|----------|
| Backend no arranca | Revisa los logs en Render. Falta `JWT_SECRET` o `DATABASE_URL` |
| `db: { conectada: false }` | Password incorrecto en `DATABASE_URL` o el proyecto Supabase no está activo |
| CORS error en consola | `FRONTEND_URL` en Render no coincide con la URL de Vercel |
| Login devuelve 429 | Rate limit (5/15min). Espera o reinicia el servicio de Render |
| Imágenes no se ven | El bucket no está marcado como público en Supabase |
| Email no se envía | App Password incorrecta o 2FA no activado en Gmail |
| 401 en /auth/verificar | La cookie no viaja — asegúrate de que `withCredentials: true` esté en axios |

---

## 🔁 Workflow continuo

```bash
# Hacer cambios
git add .
git commit -m "feat: ..."
git push origin main

# Vercel detecta → redespliega frontend
# Render detecta → redespliega backend
# Migraciones corren solas al arrancar el backend
```
