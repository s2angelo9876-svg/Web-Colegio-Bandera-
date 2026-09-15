# Changelog

Todos los cambios notables de este proyecto se documentan aquí.
El formato sigue [Keep a Changelog](https://keepachangelog.com/es/1.1.0/).

## [2.0.0] - 2026-09

### Seguridad (crítico)
- JWT ahora viaja en cookie `httpOnly` + `sameSite=lax` (antes: localStorage vulnerable a XSS).
- Eliminado fallback inseguro de `JWT_SECRET` (el servidor no arranca sin él).
- CORS restringido a whitelist por dominio.
- Detalles de errores ocultos en producción (solo se exponen en `NODE_ENV=development`).
- Verificación de magic bytes en archivos subidos (no solo extensión).
- Rate limit estricto: 5/15min en login, 200/15min general.
- Sanitización XSS server-side con la librería `xss`.

### Backend
- Reescritura completa con SQL nativo PostgreSQL (`$1, $2`…) — eliminado el wrapper regex que traducía MySQL → Postgres.
- 13 controllers con API consistente (`{ rows, rowCount, insertId }`).
- Logger con niveles (debug/info/warn/error) y JSON en producción.
- Migraciones SQL versionadas e idempotentes (`backend/migrations/`).
- Seed automático de admin en arranque.
- Sistema de uploads reescrito: multer en memoria → Sharp WebP → Supabase Storage.
- 13 schemas de validación con `express-validator` centralizados.
- Helpers compartidos (`deleteFileSafely`, `safeHandler`).
- Endpoint `/api/stats` con métricas reales y tendencias.
- Endpoints SEO (`/robots.txt`, `/sitemap.xml`).

### Frontend
- Sistema global de **Toast** para feedback de red y errores.
- 11 `catch` silenciosos reemplazados por notificaciones reales.
- Dashboard con **gráficos reales** (tendencias mensuales y comunicados por día).
- Hero del Inicio editable desde el panel admin.
- Paginación opcional en eventos, comunicados, galería y docentes.
- `AdminConfigInicio` ahora permite configurar `hero_imagen`.
- Axios configurado con `withCredentials: true` para enviar cookies.
- Tema dark/light con variables CSS nativas (Tailwind v4).

### Calidad
- Tests con Jest (backend) y Vitest (frontend).
- Scripts npm en raíz: `dev`, `build`, `test`, `migrate:storage`.
- README reescrito y completo.
- `backend/README.md` actualizado al stack real.

## [1.x] - 2024 a 2026

Funcionalidad base: portal público con noticias, comunicados, eventos,
galería, mesa de partes, panel administrativo, login con JWT.

---

## Roadmap (no implementado aún)

- [ ] PWA con `vite-plugin-pwa`
- [ ] Internacionalización (i18n) bilingüe
- [ ] OpenAPI / Swagger UI en `/api/docs`
- [ ] Husky + lint-staged
- [ ] GitHub Actions CI (lint + test + build)
- [ ] Modo claro/oscuro persistente antes del primer render (inline script en `index.html`)
