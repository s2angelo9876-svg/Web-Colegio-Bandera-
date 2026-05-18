# ⚙️ Colegio Bandera del Perú — Backend API

Este directorio contiene el código fuente del servidor de API REST y la configuración de la base de datos para la plataforma web del Colegio Bandera del Perú. 

Este servidor está construido sobre **Node.js**, **Express.js** y **MySQL** (`mysql2/promise`).

---

### 📖 Guía Completa de la Plataforma
Para ver el detalle completo del proyecto, incluyendo:
*   🌟 Características Generales.
*   🔐 Funcionalidades del Portal Público y Panel de Administración.
*   📊 Esquemas detallados de la Base de Datos (MySQL).
*   🛡️ Arquitectura, Seguridad y Optimizaciones del Servidor.
*   🚀 Guía paso a paso de Instalación y Despliegue de Frontend y Backend.

Por favor, consulta el **README principal** del proyecto en la raíz del repositorio:
👉 **[Ir al README.md Principal](../README.md)**

---

### 🚀 Comandos Rápidos del Backend

1. **Instalar Dependencias**:
   ```bash
   npm install
   ```

2. **Iniciar Servidor en Desarrollo** (usa Nodemon):
   ```bash
   npm run dev
   ```

3. **Iniciar Servidor en Producción**:
   ```bash
   node index.js
   ```

---

### 🔑 Variables del Archivo `.env` Requeridas

Crea un archivo `.env` en este directorio con la siguiente estructura:

```env
PORT=3000
JWT_SECRET=tu_secreto_seguro_para_tokens

# Base de Datos MySQL
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_contrasena_de_mysql
DB_NAME=colegio_db
```
