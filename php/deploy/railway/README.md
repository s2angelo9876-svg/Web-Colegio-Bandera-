# Vista temporal en Railway

Usa un proyecto nuevo para la prueba. Railway gestiona el dominio HTTPS del portal y el servicio PostgreSQL queda en su red privada. El primer despliegue carga el contenido de demostración en una base editorial vacía. Las ediciones del panel se guardan en el volumen de Railway. [Crear proyecto](https://railway.com/new)

## Crear los dos servicios

1. En el proyecto nuevo, agrega **Database → PostgreSQL** y llama `Postgres` al servicio. Quita su **TCP Proxy** en **Settings → Networking** si la plantilla lo agregó. La conexión del portal usa el dominio privado.
2. Agrega un servicio `portal` y conecta el repositorio `s2angelo9876-svg/Web-Colegio-Bandera-` en **Settings → Source**. Selecciona la rama `portal-railway` y deja la raíz del repositorio como directorio de compilación. Railway lee `railway.toml` desde esa raíz.
3. En la configuración de red de `portal`, usa **Generate Domain**. Si Railway solicita el puerto de destino, indica `8080`. Conserva el dominio HTTPS que genere.

## Configurar la conexión privada

Cuando `Postgres` esté activo, vincula el proyecto y abre su terminal desde WSL o con la CLI de Railway instalada.

```bash
npx -y @railway/cli login
npx -y @railway/cli link
npx -y @railway/cli ssh --service Postgres
```

Dentro del servicio PostgreSQL, copia la línea que devuelve este comando. Es el certificado público de su CA. [Plantilla PostgreSQL de Railway](https://github.com/railwayapp-templates/postgres-ssl)

```bash
openssl x509 -in /var/lib/postgresql/data/certs/root.crt -outform PEM | base64 -w0
printf '\n'
```

En tu terminal local, ejecuta `openssl rand -hex 32` por separado para generar la contraseña del rol de aplicación y la clave de cifrado de la verificación en dos pasos. En **Variables → Raw Editor** del servicio `portal`, pega el bloque y completa los valores. Guarda la clave de cifrado en el gestor de secretos del colegio.

```dotenv
PORT=8080
COLEGIO_DB_HOST=${{Postgres.RAILWAY_PRIVATE_DOMAIN}}
COLEGIO_DB_PORT=${{Postgres.PGPORT}}
COLEGIO_DB_NAME=${{Postgres.PGDATABASE}}
COLEGIO_MIGRATION_DB_USER=${{Postgres.PGUSER}}
COLEGIO_MIGRATION_DB_PASSWORD=${{Postgres.PGPASSWORD}}
COLEGIO_APP_PASSWORD=PEGA_LA_CONTRASENA_GENERADA
COLEGIO_MFA_KEY=PEGA_LA_CLAVE_DE_CIFRADO_GENERADA
COLEGIO_DB_CA_B64=PEGA_EL_CERTIFICADO_BASE64
```

Railway ejecuta las migraciones antes de iniciar el portal. La conexión a PostgreSQL verifica el certificado y el nombre del servidor con `sslmode=verify-full`. PHP-FPM y el proceso editorial utilizan el rol limitado `colegio_app`.

Para iniciar una base nueva con contenido propio, configura `COLEGIO_DEMO_DATA=0` antes del primer despliegue. La carga de muestra comprueba que la base esté vacía antes de insertar registros.

## Verificar y abrir el panel

Cuando el despliegue figure activo, abre el dominio HTTPS y comprueba que `/health/ready` devuelva `{"status":"ok"}`. Para habilitar el panel, abre `npx -y @railway/cli ssh --service portal` y crea la cuenta desde la terminal del servicio. La contraseña del CMS se escribe sin mostrarla en pantalla.

```bash
read -r -s -p 'Contraseña del CMS (al menos 16 caracteres) ' clave
printf '\n'
printf '%s\n' "$clave" | bash /app/deploy/railway/entrypoint.sh account admin admin
unset clave
bash /app/deploy/railway/entrypoint.sh mfa-enroll admin
```

Agrega la clave que muestra la terminal a tu app de autenticación y confirma con el código actual. Entra a `/admin/ingresar` con el usuario `admin`, la contraseña y un código nuevo. Para recuperar el acceso, repite el enrolamiento desde una sesión autorizada. Cuando termine la prueba, guarda los datos que quieras conservar antes de eliminar el proyecto temporal para detener su consumo.
