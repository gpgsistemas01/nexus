# Nexus

Nexus es una plataforma de control operativo para administrar inventario, compras, salidas de almacén, mermas, proveedores, clientes, usuarios, reportes y KPIs. El proyecto expone vistas web renderizadas con EJS y una API REST sobre Express, con persistencia en PostgreSQL mediante Prisma.

## Tabla de contenido

- [Características principales](#características-principales)
- [Stack técnico](#stack-técnico)
- [Arquitectura del proyecto](#arquitectura-del-proyecto)
- [Requisitos](#requisitos)
- [Configuración inicial](#configuración-inicial)
- [Variables de entorno](#variables-de-entorno)
- [Base de datos y Prisma](#base-de-datos-y-prisma)
- [Ejecución](#ejecución)
- [Scripts disponibles](#scripts-disponibles)
- [Rutas principales](#rutas-principales)
- [Pruebas automatizadas](#pruebas-automatizadas)
- [Convenciones de desarrollo](#convenciones-de-desarrollo)
- [Docker](#docker)

## Características principales

- Autenticación y manejo de sesión con cookies y JWT.
- Administración de usuarios, roles, perfiles, departamentos y movimientos.
- Gestión de almacén: productos, proveedores, entradas de compra, salidas de almacén, requisiciones, mermas, motivos, presentaciones, unidades de medida y estados de cumplimiento.
- Gestión de clientes del área de ventas.
- Reportes administrativos, de almacén e inventario.
- Notificaciones en tiempo real con Socket.IO.
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
├── migrations/             # Migraciones versionadas
└── seed.js                 # Carga inicial desde archivos XLSX

tests/                      # Pruebas unitarias, integración y helpers
scripts/                    # Scripts auxiliares de verificación
```

La aplicación usa una separación por capas: las rutas delegan en controladores, los controladores coordinan validación/entrada y los servicios concentran la lógica de negocio. Prisma se crea desde `src/lib/prisma.js`, usando la URL resuelta por `src/lib/databaseUrl.js`.

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

3. Preparar la base de datos de desarrollo:

   ```bash
   npx prisma migrate deploy
   npx prisma generate
   npm exec prisma db seed
   ```

4. Iniciar la aplicación:

   ```bash
   npm run dev
   ```

## Variables de entorno

La aplicación carga variables con `dotenv/config.js`. Como mínimo se requiere una URL de PostgreSQL para el entorno en ejecución.

```env
# Aplicación
PORT=3000
NODE_ENV=development

# Base de datos
DATABASE_URL="postgresql://usuario:password@localhost:5432/nexus"
DIRECT_URL="postgresql://usuario:password@localhost:5432/nexus"
DATABASE_TEST_URL="postgresql://usuario:password@localhost:5432/nexus_test"
DIRECT_TEST_URL="postgresql://usuario:password@localhost:5432/nexus_test"

# Autenticación / seguridad
JWT_SECRET_ACCESS="cambiar-en-produccion"
JWT_SECRET_REFRESH="cambiar-en-produccion"
JWT_SECRET_ONE_TIME="cambiar-en-produccion"

# Logs
LOG_LEVEL="info"
```

> Ajusta los nombres/secretos según el ambiente real. No subas archivos `.env` con credenciales al repositorio.

## Base de datos y Prisma

La conexión se resuelve desde `src/lib/databaseUrl.js`:

- Los servicios de la aplicación usan `DATABASE_URL`; cuando `NODE_ENV` es `test`, usan `DATABASE_TEST_URL`.
- Las migraciones de Prisma usan `DIRECT_URL`; cuando `NODE_ENV` es `test`, usan `DIRECT_TEST_URL`.
- Si falta `DATABASE_URL`/`DATABASE_TEST_URL` en servicios o `DIRECT_URL`/`DIRECT_TEST_URL` en migraciones, el resolver falla indicando el `NODE_ENV` activo.

Comandos útiles:

```bash
npx prisma migrate deploy    # Aplica migraciones pendientes usando DIRECT_URL
npx prisma generate          # Genera el cliente Prisma
npm exec prisma db seed      # Ejecuta prisma/seed.js
npx prisma studio            # Abre Prisma Studio para inspección local
```

En CI/CD no es necesario validar las URLs de migración durante `npm test`. La validación debe ejecutarse sólo en los jobs que aplican migraciones: `npm run test:db:verify` valida `DIRECT_TEST_URL` para migraciones de prueba y `prisma migrate deploy` falla explícitamente si falta `DIRECT_URL` en despliegues.

El seed lee archivos XLSX ubicados en `prisma/` para cargar catálogos y datos iniciales. Verifica que los archivos requeridos existan antes de ejecutar `npm exec prisma db seed`.

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
| `npm test` | Ejecuta la suite de Vitest con `vitestConfig.js`. |
| `npm run test:watch` | Ejecuta Vitest en modo observación. |
| `npm run test:db:verify` | Valida que `DATABASE_TEST_URL` y `DIRECT_TEST_URL` existan, que las URLs de prueba no sean iguales a las URLs principales y que cada una apunte al uso correcto. |
| `npm run test:db:migrate` | Verifica variables y aplica migraciones en la base de pruebas. |
| `npm run test:db` | Verifica variables, migra la base de pruebas y ejecuta pruebas. |

## Rutas principales

### Vistas web

- `/` página de inicio.
- `/inicio-sesion`, `/revocar-sesion`, `/cerrar-sesion` para autenticación web.
- `/productos`, `/mermas`, `/requisiciones`, `/compras`, `/salidas-almacen`, `/proveedores` para almacén.
- `/usuarios-sistemas`, `/perfiles`, `/movimientos` para administración.
- `/clientes` para ventas.

### API REST

Todas las rutas API cuelgan de `/api` y esperan `Content-Type: application/json` salvo endpoints especializados:

- `/api/auth`
- `/api/sales/clients`
- `/api/warehouse/products`
- `/api/warehouse/wastes`
- `/api/warehouse/suppliers`
- `/api/warehouse/goods-receipts`
- `/api/warehouse/goods-issues`
- `/api/warehouse/notifications`
- `/api/warehouse/reports`
- `/api/warehouse/unit-measures`
- `/api/warehouse/presentations`
- `/api/warehouse/reasons`
- `/api/warehouse/fulfillment-statuses`
- `/api/admin/users`
- `/api/admin/roles`
- `/api/admin/departments`
- `/api/admin/profiles`
- `/api/admin/movements`
- `/api/admin/reports`

## Pruebas automatizadas

Se mantiene un solo punto de creación de cliente Prisma en `src/lib/prisma.js`. En pruebas, Vitest ejecuta con `NODE_ENV=test`, por lo que el resolver de servicios usa `DATABASE_TEST_URL` sin crear un segundo cliente. Las migraciones se resuelven aparte desde `prisma.config.ts` con `DIRECT_URL` o `DIRECT_TEST_URL`.

Las pruebas que escriban datos en la base deben ejecutarse dentro de una transacción y forzar rollback al terminar. Para esos casos existe `tests/helpers/rollbackTransaction.js`, que recibe el cliente Prisma y ejecuta el cuerpo de la prueba con el `tx` transaccional, revirtiendo los cambios al finalizar para no persistir datos de prueba.

Flujo recomendado para automatización independiente:

```bash
npm run test:db:migrate
npm run test:db
```

Los scripts de prueba validan primero que exista `DATABASE_TEST_URL` y que no sea la misma URL que `DATABASE_URL`. Para migraciones de prueba, ejecutan Prisma con `NODE_ENV=test`; `prisma.config.ts` usa `DIRECT_TEST_URL` para migraciones; los servicios siguen usando `DATABASE_TEST_URL`.

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
- Para nuevas funcionalidades con persistencia, agrega migraciones Prisma y pruebas asociadas.
- No reutilices la base de desarrollo como base de pruebas.

## Docker

El repositorio incluye `Dockerfile` y `docker-compose.yml`. Para levantar el entorno con Docker Compose:

```bash
docker compose up --build
```

Asegúrate de revisar y ajustar las variables de entorno del compose antes de usarlo en ambientes compartidos o productivos.
