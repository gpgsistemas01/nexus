# Nexus

Nexus es una plataforma de control operativo para administrar inventario, compras, salidas de almacén, mermas, proveedores, clientes, usuarios, reportes y KPIs. El proyecto expone vistas web renderizadas con EJS y una API REST sobre Express, con persistencia en PostgreSQL mediante Prisma.

## Tabla de contenido

- [Características principales](#características-principales)
- [Stack técnico](#stack-técnico)
- [Arquitectura del proyecto](#arquitectura-del-proyecto)
- [Documentación](#documentación)
- [Requisitos](#requisitos)
- [Configuración inicial](#configuración-inicial)
- [Variables de entorno](#variables-de-entorno)
- [Base de datos, usuarios y permisos](#base-de-datos-usuarios-y-permisos)
- [Ejecución](#ejecución)
- [Scripts disponibles](#scripts-disponibles)
- [Rutas](#rutas)
- [Pruebas automatizadas](#pruebas-automatizadas)
- [Convenciones de desarrollo](#convenciones-de-desarrollo)
- [Docker](#docker)

## Características principales

- Autenticación y manejo de sesión con cookies y JWT.
- Administración de usuarios, roles, personas, departamentos y movimientos.
- Gestión de almacén: materiales, proveedores, entradas de compra, salidas de almacén, requisiciones, mermas, motivos, presentaciones, unidades de medida y estados de cumplimiento.
- Gestión de clientes del área de ventas.
- Reportes administrativos, de almacén e inventario.
- Actualización de inventario en tiempo real con Socket.IO.
- Validación de contenido para API JSON, cargas de archivo y texto plano.
- Pruebas unitarias e integrales con Vitest y Supertest.

## Stack técnico

- **Runtime:** Node.js con módulos ES (`type: module`).
- **Framework web:** Express 5.
- **Vistas:** EJS con `express-ejs-layouts`.
- **Base de datos:** PostgreSQL.
- **ORM:** Prisma.
- **Tiempo real:** Socket.IO.
- **Logs:** Pino y Pino HTTP.
- **Pruebas:** Vitest y Supertest.
- **Utilidades:** bcrypt, jsonwebtoken, cookie-parser, ioredis, xlsx.

## Arquitectura del proyecto

```text
src/
├── app.js                  # Punto de entrada, middlewares, rutas web/API y servidor HTTP
├── controllers/            # Controladores web y API por dominio
├── dtos/                   # Objetos de transferencia y normalización de datos
├── errors/                 # Errores de dominio y AppError
├── lib/                    # Prisma y resolución de URL de base de datos
├── messages/               # Catálogo de mensajes/códigos de respuesta
├── middleware/             # Autenticación, validaciones y content-type
├── public/                 # CSS y JavaScript del cliente
├── repository/             # Repositorio base
├── routes/                 # Definición de rutas web y API
├── services/               # Lógica de negocio por dominio
├── utils/                  # Utilidades compartidas
├── validators/             # Validadores de formularios y campos
└── views/                  # Vistas EJS y layouts

prisma/
├── schema.prisma           # Modelo de datos
└── migrations/             # Migraciones versionadas

tests/                      # Pruebas unitarias, integración y helpers
scripts/                    # Scripts auxiliares de verificación
```

La aplicación usa una separación por capas: las rutas delegan en controladores, los controladores coordinan validación/entrada y los servicios concentran la lógica de negocio. Prisma se crea desde `src/lib/prisma.js`, usando la URL resuelta por `src/lib/databaseUrl.js`.

Los registros centrales `src/routes/api/index.js` y `src/routes/web/index.js` componen
los routers por dominio y evitan que `src/app.js` mezcle el arranque de infraestructura
con el catálogo de endpoints. Las convenciones equivalentes entre backend y frontend,
incluyendo reutilización de componentes y ubicación de pruebas CRUD, se detallan en el
[mapa visual de arquitectura y vistas web](docs/architecture-and-web-views.md#5-organización-consistente-de-front-y-back).

## Documentación

El [índice de documentación](docs/README.md) enlaza arquitectura, API, pruebas y base de
datos. El mapa de rutas y dependencias se genera desde el código; los diagramas de diseño
se mantienen de forma curada. CI comprueba que el contenido generado esté actualizado.

## Requisitos

- Node.js `>=22 <25`.
- npm.
- PostgreSQL disponible para desarrollo y, opcionalmente, otra base aislada para pruebas.

## Configuración inicial

1. Instalar dependencias:

   ```bash
   npm install
   ```

2. Crear el archivo `.env` en la raíz del proyecto con las variables necesarias.
   Este archivo es local, está excluido por `.gitignore` y no debe versionarse.

3. Preparar la base de datos de desarrollo:

   ```bash
   npm run db:migrate
   ```

4. Iniciar la aplicación:

   ```bash
   npm run dev
   ```

## Variables de entorno

La aplicación carga variables con `dotenv/config.js`. En desarrollo, define la
configuración en un archivo `.env` local; en despliegues, utiliza el gestor de secretos
de la plataforma. El archivo `.env` está excluido por `.gitignore` y nunca debe contener
valores destinados a versionarse.

```env
# Aplicación
PORT=3000
NODE_ENV=development

# Base de datos
DATABASE_URL="postgresql://nexus_app:password@pooler.example.com:6543/nexus"
DIRECT_URL="postgresql://nexus_migrator:password@localhost:5432/nexus"
DATABASE_TEST_URL="postgresql://nexus_test_app:password@pooler.example.com:6543/nexus_test"
DIRECT_TEST_URL="postgresql://nexus_test_migrator:password@localhost:5432/nexus_test"

# Autenticación / seguridad
JWT_SECRET_ACCESS="cambiar-en-produccion"
JWT_SECRET_REFRESH="cambiar-en-produccion"
JWT_SECRET_ONE_TIME="cambiar-en-produccion"

# Logs
LOG_LEVEL="info"
```

> Ajusta los nombres/secretos según el ambiente real. No subas archivos `.env` con credenciales al repositorio.

| Variable | Obligatoria | Uso |
| --- | --- | --- |
| `DATABASE_URL` | Sí, excepto en pruebas | Conexión PostgreSQL del proceso de la aplicación. |
| `DIRECT_URL` | En Docker con `RUN_MIGRATIONS=true` | Conexión directa del CLI de Prisma para migraciones. |
| `DATABASE_TEST_URL` | Para pruebas de integración | Base aislada seleccionada cuando `NODE_ENV=test`. Debe ser distinta de `DATABASE_URL`. |
| `DIRECT_TEST_URL` | No | Conexión directa para migrar la base de pruebas; si falta se usa `DATABASE_TEST_URL`. |
| `JWT_SECRET_ACCESS` | Sí | Firma tokens de acceso con vigencia de una hora. |
| `JWT_SECRET_REFRESH` | Sí | Firma tokens de renovación con vigencia de siete días. |
| `JWT_SECRET_ONE_TIME` | Sí | Firma tokens de un solo uso con vigencia de quince minutos. |
| `PORT` | No | Puerto HTTP; el valor predeterminado es `3000`. |
| `NODE_ENV` | No en local | Selecciona la base de pruebas cuando vale `test`; la imagen Docker lo fija en `production`. |
| `LOG_LEVEL` | No | Nivel de Pino. Acepta `fatal`, `error`, `warn`, `info`, `debug`, `trace` o `silent`; el predeterminado es `warn`. |

## Base de datos, usuarios y permisos

Prisma selecciona la URL según el entorno: `DATABASE_URL` para la aplicación,
`DATABASE_TEST_URL` para pruebas y las variantes `DIRECT_*` para migraciones cuando
están definidas. Los comandos de base de datos se encuentran en la tabla de scripts.

Consulta las guías específicas para evitar duplicar aquí decisiones y procedimientos:

- [roles PostgreSQL de ejecución y migración](docs/postgresql-runtime-and-migration-roles.md);
- [usuarios, personas, auditoría y permisos](docs/database-users-and-permissions-analysis.md).

## Ejecución

### Desarrollo

```bash
npm run dev
```

El servidor escucha en `PORT` o en `3000` por defecto y se publica en `0.0.0.0`.

### Producción/local sin nodemon

```bash
npm start
```

## Scripts disponibles

| Script | Descripción |
| --- | --- |
| `npm start` | Ejecuta `node src/app.js`. |
| `npm run dev` | Ejecuta la aplicación con Nodemon. |
| `npm run db:migrate` | Aplica migraciones pendientes con Prisma; usa `DIRECT_URL` automáticamente cuando está definida. |
| `npm run db:generate` | Genera el cliente Prisma. |
| `npm test` | Ejecuta las pruebas unitarias y auxiliares; excluye `tests/integration`. |
| `npm run test:unit` | Alias explícito de la suite sin integraciones. |
| `npm run test:watch` | Ejecuta Vitest en modo observación. |
| `npm run test:db:verify` | Valida que `DATABASE_TEST_URL` exista y no sea igual a `DATABASE_URL`. |
| `npm run test:db:migrate` | Verifica variables y aplica migraciones en la base de pruebas; usa `DIRECT_TEST_URL` automáticamente cuando está definida. |
| `npm run test:integration` | Verifica y migra la base aislada, genera Prisma y ejecuta sólo `tests/integration`. |
| `npm run test:db` | Alias de `npm run test:integration`. |
| `npm run docs:architecture` | Regenera el mapa de rutas y dependencias desde `src`. |
| `npm run docs:check` | Comprueba que el mapa generado esté actualizado. |

## Rutas

El [mapa generado](docs/generated/code-map.md) es el catálogo actualizado de métodos y
rutas web/API. La [guía de arquitectura](docs/architecture-and-web-views.md) explica la
navegación, las pantallas y las redirecciones. Evitamos repetir aquí listas que pueden
quedar desactualizadas.

## Pruebas automatizadas

Se mantiene un solo punto de creación de cliente Prisma en `src/lib/prisma.js`. En pruebas, Vitest ejecuta con `NODE_ENV=test`, por lo que el mismo resolver usa `DATABASE_TEST_URL` sin crear un segundo cliente.

Las pruebas que escriban datos en la base deben ejecutarse dentro de una transacción y forzar rollback al terminar. Para esos casos existe `tests/helpers/rollbackTransaction.js`, que recibe el cliente Prisma y ejecuta el cuerpo de la prueba con el `tx` transaccional, revirtiendo los cambios al finalizar para no persistir datos de prueba.

Flujo recomendado para automatización independiente (el segundo comando ya vuelve a
verificar y migrar, por lo que normalmente basta con ejecutarlo solo):

```bash
npm run test:db
```

Los scripts de prueba validan primero que exista `DATABASE_TEST_URL` y que no sea la misma URL que `DATABASE_URL`. Para migraciones de prueba, los scripts ejecutan Prisma con `NODE_ENV=test`, por lo que el resolver usa `DIRECT_TEST_URL` si está definida y, si no existe, `DATABASE_TEST_URL`, sin sobrescribir manualmente `DATABASE_URL`.

Para pruebas que no requieren base de datos real, usa:

```bash
npm test
```

## Convenciones de desarrollo

- Mantén la lógica de negocio en `src/services` y evita duplicarla en controladores.
- Usa DTOs para normalizar entradas/salidas cuando aplique.
- Usa `AppError` y errores de dominio para respuestas controladas.
- Agrega validadores en `src/validators` para nuevas entradas de usuario.
- Mantén las rutas agrupadas por dominio en `src/routes/web` y `src/routes/api`.
- Registra cada router nuevo en el `index.js` web o API correspondiente; `src/app.js`
  sólo debe coordinar infraestructura y los registros principales.
- Reutiliza componentes y casos de uso existentes cuando un CRUD cambie únicamente de
  contexto, en vez de duplicar el flujo completo.
- Conserva el mismo orden CRUD en rutas, controllers, servicios de aplicación y
  servicios HTTP: lectura, creación, actualización general, actualizaciones
  especializadas y eliminación o acción terminal.
- Para nuevas funcionalidades con persistencia, agrega migraciones Prisma y pruebas asociadas.
- No reutilices la base de desarrollo como base de pruebas.

## Docker

El repositorio incluye `Dockerfile` y `docker-compose.yml`. Al iniciar el contenedor, el entrypoint ejecuta primero `prisma migrate deploy` y solamente arranca la aplicación si las migraciones terminan correctamente. El CLI de Prisma toma `DIRECT_URL` mediante `prisma.config.ts`; la aplicación continúa conectándose con `DATABASE_URL`.

La selección no depende de que ambas URLs tengan nombres o hosts parecidos:

1. El proceso de arranque exige que `DIRECT_URL` esté definida. Si falta, termina con código de error y **no** inicia la aplicación. El despliegue Docker no utiliza las variables de prueba.
2. El entrypoint fija `NODE_ENV=production` para todo el contenedor y `prisma.config.ts` llama al resolver con `preferDirectUrl: true`; por lo tanto, `prisma migrate deploy` siempre recibe `DIRECT_URL`, aunque el contenedor haya recibido accidentalmente otro valor de `NODE_ENV`.
3. La aplicación crea su cliente sin esa opción y, como el contenedor permanece en producción, recibe `DATABASE_URL`.

El entrypoint nunca imprime la URL ni sus credenciales. Los logs indican el **nombre de la variable** elegida y confirman el éxito únicamente cuando Prisma devuelve código `0`:

```text
Iniciando migraciones Prisma con DIRECT_URL (las credenciales no se muestran).
... salida de prisma migrate deploy ...
Migraciones Prisma verificadas correctamente.
```

Define ambas variables en el entorno de despliegue, sin incluirlas como argumentos de build ni guardarlas dentro de la imagen:

```env
DATABASE_URL="postgresql://usuario:password@pooler.example.com:6543/nexus"
DIRECT_URL="postgresql://usuario:password@db.example.com:5432/nexus"
```

Para levantar el entorno con Docker Compose:

```bash
docker compose up --build
```

Para comprobar el despliegue, revisa los logs y el estado de las migraciones:

```bash
docker compose logs app
docker compose exec app ./node_modules/.bin/prisma migrate status
```

`migrate status` usa igualmente `DIRECT_URL` a través de `prisma.config.ts`. Un despliegue correcto muestra el mensaje `Database schema is up to date!`; además, el proceso `node src/app.js` estará activo. Si la conexión directa o una migración falla, el entrypoint termina antes de ejecutar `npm start` y Docker registra el error de Prisma.

`RUN_MIGRATIONS` acepta únicamente `true` o `false` y su valor predeterminado es `true`. Se puede desactivar cuando la plataforma ejecuta las migraciones en un *release job* separado:

```bash
docker run --rm \
  -e DATABASE_URL \
  -e DIRECT_URL \
  -e RUN_MIGRATIONS=true \
  nexus true
```

En despliegues con varias réplicas se recomienda ejecutar una sola instancia como *release job* con `RUN_MIGRATIONS=true` y configurar las réplicas de la aplicación con `RUN_MIGRATIONS=false`. Nunca publiques el puerto directo de PostgreSQL en Internet; `DIRECT_URL` debe llegar al servidor por la red privada del proveedor.
