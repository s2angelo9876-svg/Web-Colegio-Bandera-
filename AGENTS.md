# Instrucciones para el portal del Colegio Bandera del Perú

Para cada petición que cambie este proyecto, consulta primero `.agents/skills/using-agent-skills/SKILL.md`. Abre las skills pertinentes en `.agents/skills/` y usa sus pautas para implementar y verificar el cambio. Si el usuario pide una skill por nombre, consulta esa skill. Ajusta el proceso al alcance de la petición.

| Trabajo | Skills de partida |
| --- | --- |
| Diseño, accesibilidad y responsive | `frontend-ui-engineering`, `modern-web-guidance`, `web-design-guidelines` |
| Implementación, depuración y revisión | `incremental-implementation`, `debugging-and-error-recovery`, `code-review-and-quality` |
| Verificación visual y animaciones | `browser-testing-with-devtools`, `break-ui`, `review-animations` |
| Seguridad, rendimiento y despliegue | `security-and-hardening`, `performance-optimization`, `shipping-and-launch` |
| Planificación y revisión de diseños | `spec-driven-development`, `planning-and-task-breakdown` y las skills de EGM que correspondan |

El inventario de skills y las revisiones de origen están en `agent-skills.lock.json`. Si faltan skills al abrir una copia nueva, instala las versiones del proyecto y comprueba el resultado con Python 3 y Git.

```bash
python3 scripts/install-agent-skills.py
python3 scripts/install-agent-skills.py --check
```

Para instalar también el CLI local de `agent-browser`, añade `--with-browser-cli` al comando de instalación con Node.js 22 o posterior y npm. Su ejecutable queda en `.agents/tools/node_modules/.bin/`. En el entorno en la nube, asigna un directorio temporal a `AGENT_BROWSER_SOCKET_DIR` y usa el mismo valor en todos los comandos de esa sesión de navegador. Consulta los comandos de prueba del portal PHP en `php/README.md`.
