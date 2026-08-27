# Nexus

Nexus es una plataforma de control operativo para administrar inventario, compras, salidas de almacén, mermas, proveedores, clientes, usuarios, reportes y KPIs. El proyecto expone vistas web renderizadas con EJS y una API REST sobre Express, con persistencia en PostgreSQL mediante Prisma.

## Tabla de contenido

- [Características principales](#características-principales)
- [Visión, alcance y requisitos](#visión-alcance-y-requisitos)
- [Stack técnico](#stack-técnico)
- [Arquitectura del proyecto](#arquitectura-del-proyecto)
- [Requisitos](#requisitos)
- [Configuración inicial](#configuración-inicial)
- [Variables de entorno](#variables-de-entorno)
- [Base de datos y Prisma](#base-de-datos-y-prisma)
- [Usuarios, auditoría y permisos](#usuarios-auditoría-y-permisos)
- [Ejecución](#ejecución)
- [Scripts disponibles](#scripts-disponibles)
- [Rutas principales](#rutas-principales)
- [Pruebas automatizadas](#pruebas-automatizadas)
- [Convenciones de desarrollo](#convenciones-de-desarrollo)
- [Docker](#docker)

## Características principales

- Autenticación y manejo de sesión con cookies y JWT.
- Administración de usuarios, roles, personas, departamentos y movimientos.
- Gestión de almacén: materiales, proveedores, entradas de compra, salidas de almacén, requisiciones, mermas, motivos, presentaciones, unidades de medida y estados de cumplimiento.
- Gestión de clientes del área de ventas.
- Reportes administrativos, de almacén e inventario.
- Notificaciones en tiempo real con Socket.IO.
- Validación de contenido para API JSON, cargas de archivo y texto plano.
- Pruebas unitarias e integrales con Vitest y Supertest.

## Visión, alcance y requisitos

La visión del producto, sus usuarios, el alcance vigente, los criterios para redactar
requisitos verificables, los requisitos funcionales y de datos, los atributos de
calidad y las brechas encontradas al contrastar documentación, código y Prisma se mantienen en
[`docs/vision-scope-and-requirements.md`](docs/vision-scope-and-requirements.md).

Ese documento describe el comportamiento implementado, no una promesa de funciones
futuras. En particular, distingue las capacidades expuestas de los modelos o servicios
que aún no tienen un flujo accesible completo.

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
   npm run db:migrate
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

## Base de datos y Prisma

La conexión se resuelve desde `src/lib/databaseUrl.js`:

- Cuando `NODE_ENV` es `test`, se usa `DATABASE_TEST_URL`.
- La aplicación usa `DATABASE_URL` en cualquier otro entorno.
- Prisma CLI usa `DIRECT_URL` automáticamente en producción cuando existe, por ejemplo para `migrate deploy`; si no existe, usa `DATABASE_URL`.
- Prisma CLI usa `DIRECT_TEST_URL` automáticamente en pruebas cuando existe; si no existe, usa `DATABASE_TEST_URL`.
- Si falta la variable requerida, el resolver falla indicando el `NODE_ENV` activo.

`DATABASE_URL` y `DIRECT_URL` deben usar credenciales distintas para que la separación
sea efectiva: la primera corresponde a la cuenta DML de ejecución y la segunda a la
cuenta que aplica DDL durante las migraciones. La guía de aprovisionamiento, propiedad
de objetos, `GRANT` y verificación está en
[`docs/postgresql-runtime-and-migration-roles.md`](docs/postgresql-runtime-and-migration-roles.md).
La creación de roles es un bootstrap administrativo previo y no forma parte de
`prisma/migrations`; los roles y permisos deben existir antes de ejecutar Prisma.

Comandos útiles:

```bash
npm run db:migrate         # Aplica migraciones pendientes usando DIRECT_URL si está definida
npx prisma generate          # Genera el cliente Prisma
npm exec prisma db seed      # Ejecuta prisma/seed.js
npx prisma studio            # Abre Prisma Studio para inspección local
```

El seed lee archivos XLSX ubicados en `prisma/` para cargar catálogos y datos iniciales. Verifica que los archivos requeridos existan antes de ejecutar `npm exec prisma db seed`.

## Usuarios, auditoría y permisos

El análisis del modelo actual, las brechas detectadas y la propuesta para distinguir
identidades de acceso (`User`), personas participantes del negocio (`Person`), auditoría de
escrituras y privilegios PostgreSQL están documentados en
[`docs/database-users-and-permissions-analysis.md`](docs/database-users-and-permissions-analysis.md).

La recomendación principal es no agregar un usuario indiscriminadamente a cada tabla:
se debe conservar el actor `User` en operaciones auditables, mantener `Person` para
los papeles del proceso y centralizar los permisos por acción, rol y departamento.

### Impacto del cambio a «Personas» en la base de datos

El cambio se aplica de forma integral para que «Persona» sea congruente en la interfaz,
la API, el código y la persistencia. La migración renombra `Profile` a `Person`,
`ProfileRoleDepartment` a `PersonRoleDepartment` y los campos `profileId` a `personId`.
Los modelos, servicios, DTO, permisos y payloads utilizan igualmente `Person`/`person`.

Esto **no afecta la trazabilidad de los datos**: cada persona conserva el mismo UUID y
las operaciones históricas siguen relacionadas mediante sus claves foráneas. La
trazabilidad de quién ejecutó una acción se mantiene en `User`, mientras que `Person`
identifica a la persona que desempeñó un papel dentro del flujo. PostgreSQL realiza los
renombres sobre los mismos objetos, sin copiar ni recrear registros.

En la implementación actual, las **definiciones** de permisos y su matriz se versionan
en `src/constants/permissions.js`; no existen tablas `Permission` o `RolePermission`
administrables desde la interfaz. La base de datos conserva las **asignaciones** de
cada cuenta en `UserRoleDepartment`. El backend cruza esas asignaciones con la matriz,
autoriza la petición y deriva las capacidades que entrega al frontend. Convertir la
matriz en configuración administrable requeriría un cambio de modelo, migración,
pantalla administrativa y auditoría; no es el comportamiento actual.

La concesión efectiva sí es automática en tiempo de ejecución: el administrador solo
guarda la asignación rol/departamento; en cada login, renovación o carga de sesión el
backend vuelve a leer `UserRoleDepartment`, cruza esas filas con
`AUTHORIZATION_POLICIES` y calcula `user.permissions`. No existe un proceso manual para
copiar permisos al usuario ni se persiste ese arreglo derivado. Si cambia una
asignación, la siguiente carga autenticada recalcula las capacidades; si cambia la
matriz en código, el cambio entra en vigor al desplegar la nueva versión.

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
| `npm test` | Ejecuta la suite de Vitest con `vitestConfig.js`. |
| `npm run test:watch` | Ejecuta Vitest en modo observación. |
| `npm run test:db:verify` | Valida que `DATABASE_TEST_URL` exista y no sea igual a `DATABASE_URL`. |
| `npm run test:db:migrate` | Verifica variables y aplica migraciones en la base de pruebas; usa `DIRECT_TEST_URL` automáticamente cuando está definida. |
| `npm run test:db` | Verifica variables, migra la base de pruebas y ejecuta pruebas. |

## Rutas principales

### Vistas web

- `/` página de inicio.
- `/inicio-sesion`, `/revocar-sesion`, `/cerrar-sesion` para autenticación web.
- `/materiales`, `/mermas`, `/requisiciones`, `/compras`, `/salidas-almacen`, `/proveedores` para almacén.
- `/usuarios-sistemas`, `/personas`, `/movimientos` para administración.
- `/clientes` para ventas.

Las tablas de detalle son responsivas. En compras se prioriza la columna de acciones y,
en salidas, se conservan con la misma prioridad la cantidad convertida y el control para
surtir; las columnas menos operativas pasan primero al detalle desplegable cuando se
reduce el ancho disponible.

### API REST

Todas las rutas API cuelgan de `/api` y esperan `Content-Type: application/json` salvo endpoints especializados:

- `/api/auth`
- `/api/sales/clients`
- `/api/sales/reports`
- `/api/warehouse/materials`
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
- `/api/admin/persons` (`/api/admin/profiles` se conserva como alias de compatibilidad)
- `/api/admin/movements`
- `/api/admin/reports`

## Pruebas automatizadas

Se mantiene un solo punto de creación de cliente Prisma en `src/lib/prisma.js`. En pruebas, Vitest ejecuta con `NODE_ENV=test`, por lo que el mismo resolver usa `DATABASE_TEST_URL` sin crear un segundo cliente.

Las pruebas que escriben datos usan exclusivamente la base indicada por
`DATABASE_TEST_URL` y limpian sus registros identificables antes y después de la suite.
Cuando un flujo acepta el cliente transaccional sin sustituir el comportamiento que se
quiere probar, puede reutilizarse `tests/helpers/rollbackTransaction.js` para forzar
rollback. La estrategia y ubicación de cada tipo de prueba están detalladas en
[`docs/service-test-coverage.md`](docs/service-test-coverage.md).

Flujo recomendado para automatización independiente:

```bash
npm run test:db:migrate
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
