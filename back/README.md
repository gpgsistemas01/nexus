# Nexus

Nexus es una plataforma de control operativo para administrar inventario, compras, salidas de almacén, mermas, proveedores, clientes, usuarios, reportes y KPIs. El proyecto expone vistas web renderizadas con EJS y una API REST sobre Express, con persistencia en PostgreSQL mediante Prisma.

Los comandos npm, Prisma y Node de este documento se ejecutan desde `back/`.
Desde la raíz del repositorio usa `cd back`; para Docker Compose vuelve con
`cd ..`. También puedes ejecutar scripts npm desde la raíz con
`npm --prefix back run <script>` (por ejemplo, `npm --prefix back run docs:check`).
El archivo local de variables es `back/.env`; dentro del contenedor el directorio
correspondiente es `/app`.

## Tabla de contenido

- [Características principales](#características-principales)
- [Visión, alcance y requisitos](#visión-alcance-y-requisitos)
- [Stack técnico](#stack-técnico)
- [Arquitectura del proyecto](#arquitectura-del-proyecto)
- [Documentación](#documentación)
- [Requisitos](#requisitos)
- [Configuración inicial](#configuración-inicial)
- [Variables de entorno](#variables-de-entorno)
- [Base de datos, usuarios y permisos](#base-de-datos-usuarios-y-permisos)
- [Ejecución](#ejecución)
- [Scripts disponibles](#scripts-disponibles)
- [Publicación de documentos y capturas](#publicación-de-documentos-y-capturas)
- [Rutas principales](#rutas-principales)
- [Pruebas automatizadas](#pruebas-automatizadas)
- [Convenciones de desarrollo](#convenciones-de-desarrollo)
- [Docker](#docker)

## Características principales

- Autenticación y manejo de sesión con cookies y JWT.
- Administración de usuarios, roles, personas, departamentos y movimientos.
- Gestión de almacén: materiales, proveedores, entradas de compra, salidas de almacén, mermas, motivos, presentaciones, unidades de medida y estados de cumplimiento.
- Gestión administrativa de clientes como catálogo contextual.
- Reportes administrativos, de almacén e inventario.
- Actualización de inventario en tiempo real con Socket.IO.
- Validación de contenido para API JSON, cargas de archivo y texto plano.
- Pruebas unitarias e integrales con Vitest y Supertest.

## Visión, alcance y requisitos

La visión del producto, sus usuarios, el alcance vigente, los criterios para redactar
requisitos verificables, los requisitos funcionales y de datos, los atributos de
calidad y las brechas encontradas al contrastar documentación, código y Prisma se mantienen en
[`docs/requirements/vision-scope-and-requirements/index.md`](docs/requirements/vision-scope-and-requirements/index.md).

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
└── migrations/             # Migraciones versionadas

tests/                      # Pruebas unitarias, integración y helpers
scripts/                    # Scripts auxiliares de verificación
```

La aplicación usa una separación por capas: las rutas delegan en controladores, los controladores coordinan validación/entrada y los servicios concentran la lógica de negocio. Prisma se crea desde `src/lib/prisma.js`, usando la URL resuelta por `src/lib/databaseUrl.js`.

Los registros centrales `src/routes/api/index.js` y `src/routes/web/index.js` componen
los routers por dominio y evitan que `src/app.js` mezcle el arranque de infraestructura
con el catálogo de endpoints. Las convenciones equivalentes entre backend y frontend,
incluyendo reutilización de componentes y ubicación de pruebas CRUD, se detallan en la
[descripción de arquitectura y construcción](docs/architecture/views/index.md).

## Documentación

El [índice de documentación](docs/README.md#organización-de-los-artefactos) agrupa cada
artefacto por familia, distingue su documento principal de los complementos y declara su
fuente de verdad. El mapa de rutas y dependencias se genera desde el código; el esquema y
el diccionario técnico se derivan de Prisma; los diagramas de diseño se mantienen de
forma curada. CI comprueba que el contenido generado esté actualizado.

- Para consumir la API, consulta el [contrato HTTP](docs/architecture/openapi/api-contract.md)
  y la [especificación OpenAPI](docs/architecture/openapi/openapi.json).
- Para modificar el servidor, consulta la
  [documentación técnica del backend](docs/architecture/views/development/backend-technical-documentation/index.md)
  y sus [responsabilidades por capa](docs/architecture/views/development/code-structure/index.md).
- La [documentación de la interfaz EJS](docs/architecture/views/development/frontend-technical-documentation/index.md)
  describe sus pantallas y controles visuales.

## Requisitos

- Node.js `^22.13.0 || ^24.14.1 || ^26.12.1`; Node 26 se comprueba en CI junto con Node 24.
- npm.
- PostgreSQL disponible para desarrollo y, opcionalmente, otra base aislada para pruebas.

## Configuración inicial

Ejecuta los comandos npm desde `back/` (`cd back` desde la raíz del repositorio).
Si actualizas una copia anterior a la separación de carpetas, revisa primero
[archivos locales ignorados y cambio de estructura](../README.md#archivos-locales-ignorados-y-cambio-de-estructura):
Git no mueve el `.env`, las dependencias ni el cliente Prisma generado de tu equipo.

1. Instalar dependencias:

   ```bash
   npm ci
   ```

2. Crear el archivo `.env` en `back/` con las variables necesarias.
   Este archivo es local, está excluido por `.gitignore` y no debe versionarse.

3. Preparar la base de datos de desarrollo:

   ```bash
   npm run db:migrate
   ```

4. Iniciar la aplicación:

   ```bash
   npm run dev
   ```

### Dependencias y actualizaciones

Se actualizan dotenv 18, EJS 7, ioredis 6, rate-limit-redis 6 y Vitest 5 con su
proveedor V8 de la misma versión. Prisma conserva la versión estable 7.10.1 en
CLI, cliente y adaptador; una etiqueta `latest` con `8.0.0-rc` no representa una
versión estable para producción.

`npm run dev` usa el modo watch nativo de Node. Reinicia al cambiar módulos
importados y conserva la salida. Las vistas EJS se vuelven a leer en desarrollo;
modificar una plantilla no requiere reiniciar el proceso. Al cambiar el esquema
Prisma sigue siendo necesario ejecutar `npm run db:generate`. Se retira Nodemon
y su configuración, cuya cadena Chokidar/braces no tenía una actualización corregida.

ExcelJS conserva su última versión estable oficial, 4.4.0. Un override limitado a
`exceljs → uuid@11` evita la versión vulnerable 8 manteniendo la API CommonJS `v4`
que consume ExcelJS. Las pruebas de reportes comprueban las descargas y fórmulas.
No se aplica un override global de UUID ni `npm audit fix --force`.

El lector SheetJS `xlsx@0.18.5` se retira de las pruebas. `read-excel-file` verifica
los valores guardados con un lector independiente; ExcelJS permite inspeccionar
las fórmulas. Se mantienen las comprobaciones de ceros, decimales, filas, orden,
concurrencia y ausencia de cambios en BD. ExcelJS aún puede traer paquetes con
avisos de obsolescencia: actualizar las dependencias directas y pasar `npm audit`
no implica que todas sus dependencias transitivas estén mantenidas.

Vitest 5 limpia mocks por defecto. La configuración unitaria fija `clearMocks: false`
para conservar las llamadas observadas durante el registro de rutas; las suites
mantienen su limpieza explícita entre casos. Se conservan las mismas aserciones.

Después de descargar los cambios, detén el servidor y ejecuta desde la raíz
`npm --prefix back ci --include=dev`, `npm --prefix back run db:generate` y
`npm --prefix back run dev`. Las dependencias se instalan por aplicación; Git no
actualiza `node_modules` ni genera el cliente Prisma.

### Avisos al actualizar Node y npm

`EBADENGINE` con `package: nexus@1.0.0` y `required: >=22 <25` indica que la copia
local conserva el contrato anterior a Node 26. La configuración actual admite
Node 26 desde 26.12.1; sincroniza `package.json` y `package-lock.json` con la rama
actualizada. El rango declarado no instala Node ni cambia la imagen Docker.

npm 11.20 puede avisar de scripts de instalación aún no registrados en
`allowScripts`. El proyecto revisó y registró únicamente `bcrypt@6.0.0` (preparación
del módulo nativo), `prisma@7.10.1` (comprobación de requisitos) y
`@prisma/engines@7.10.1` (preparación de motores). La advertencia no prueba por sí
sola que los scripts hayan sido omitidos o que la instalación haya fallado.

Desde `back/`, para revisar la política con una versión de npm que la admita:

```bash
npm install-scripts ls
```

En una copia anterior que tenga esas mismas versiones, el registro selectivo se
realiza con `npm install-scripts approve bcrypt prisma @prisma/engines`. El comando
guarda las versiones instaladas en `package.json`; no ejecuta los scripts. Después
de revisar un cambio de versión, actualiza sus entradas con el mismo comando y
reinstala con `npm ci`, o usa `npm rebuild bcrypt prisma @prisma/engines` para volver
a ejecutar los scripts sobre una instalación existente. Genera finalmente el
cliente con `npm run db:generate`. No apruebes paquetes adicionales sin revisar su
procedencia, versión y scripts.

`npm update` respeta los rangos de versiones declarados y no garantiza corregir
todos los avisos de seguridad. Consulta `npm audit` para identificar el paquete
propietario; no uses `npm audit fix --force` como sustituto de una migración revisada.

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

- [Prisma: preparación, consultas, transacciones y creación de migraciones](docs/architecture/views/development/code-structure/06-prisma-and-persistence.md);
- [roles PostgreSQL de ejecución y migración](docs/architecture/views/physical/02-postgresql-runtime-and-migration-roles.md);
- [usuarios, personas, auditoría y permisos](docs/architecture/views/logical/02-identity-access-and-audit.md).

## Ejecución

### Desarrollo

```bash
npm run dev
```

El servidor escucha en `PORT` o en `3000` por defecto y se publica en `0.0.0.0`.

### Producción/local sin recarga automática

```bash
npm start
```

## Scripts disponibles

| Script | Descripción |
| --- | --- |
| `npm start` | Ejecuta `node src/app.js`. |
| `npm run dev` | Ejecuta `node --watch --watch-preserve-output src/app.js`. |
| `npm run db:migrate` | Aplica migraciones pendientes con Prisma; usa `DIRECT_URL` automáticamente cuando está definida. |
| `npm run db:generate` | Genera el cliente Prisma. |
| `npm test` | Ejecuta las pruebas unitarias y auxiliares; excluye `tests/integration`. |
| `npm run test:unit` | Alias explícito de la suite sin integraciones. |
| `npm run test:coverage` | Ejecuta la suite unitaria con cobertura V8; genera reportes en `coverage/unit`. |
| `npm run test:coverage:integration` | Ejecuta la integración con base aislada y cobertura V8; genera reportes en `coverage/integration`. |
| `npm run test:watch` | Ejecuta Vitest en modo observación. |
| `npm run test:db:verify` | Valida que `DATABASE_TEST_URL` exista y no sea igual a `DATABASE_URL`. |
| `npm run test:db:migrate` | Verifica variables y aplica migraciones en la base de pruebas; usa `DIRECT_TEST_URL` automáticamente cuando está definida. |
| `npm run test:integration` | Verifica variables, migra la base de pruebas, genera el cliente Prisma y ejecuta la suite de integración. |
| `npm run test:db` | Verifica variables, migra la base de pruebas y ejecuta pruebas. |
| `npm run docs:architecture` | Regenera el mapa de código, el esquema de base de datos y el diccionario técnico derivados del código y Prisma. |
| `npm run docs:check` | Comprueba sin modificar archivos que la documentación generada esté actualizada. |
| `npm run docs:export` | Genera todos los paquetes en DOCX y PDF; acepta opcionalmente `<paquete> <docx\|pdf\|ambos>` para limitar la ejecución. |
| `npm run docs:screenshots -- --area <almacen\|sistemas>` | Comprueba o inicia Nexus, genera en Chromium las capturas del área y detiene la instancia temporal al terminar. |

## Publicación de documentos y capturas

Estos procesos no forman parte del arranque normal de Nexus y requieren herramientas distintas:

- la **exportación** usa las dependencias instaladas por `npm ci` y Pandoc; prepara Mermaid CLI
  para los diagramas y LibreOffice para PDF cuando hacen falta;
- la **captura** usa Playwright y su navegador Chromium, además de Nexus en ejecución, una base de
  datos ficticia con estados específicos y una sesión autenticada con los permisos necesarios.

La guía completa y secuencial —instalación por sistema operativo, validación, nombres de paquetes,
creación y eliminación del estado de sesión, cierre de Playwright y detención de Nexus— está en
[Exportar la documentación](docs/governance/document-export-guide/index.md). No ejecute
`docs:screenshots` sólo para exportar: Pandoc reutiliza las imágenes ya revisadas.
La sintaxis admitida para ambos procesos se concentra en la sección
[Comandos](docs/governance/document-export-guide/04-commands.md).

## Rutas principales

### Vistas web

- `/` página de inicio.
- `/inicio-sesion`, `/revocar-sesion`, `/cerrar-sesion` para autenticación web.
- `/materiales`, `/almacen/consumibles`, `/mermas` y `/salidas-almacen` para inventario.
- `/compras/materiales` y `/compras/consumibles` para compras separadas por contexto;
  `/compras` redirige a `/compras/materiales`.
- `/proveedores` para el catálogo administrativo de proveedores.
- `/usuarios-sistemas`, `/personas`, `/movimientos` para administración.
- `/clientes` como catálogo contextual administrado por sistemas.

Las tablas de detalle son responsivas. En compras se prioriza la columna de acciones y,
en salidas, se conservan con la misma prioridad la cantidad convertida y el control para
surtir; las columnas menos operativas pasan primero al detalle desplegable cuando se
reduce el ancho disponible.

### API REST

Las operaciones bajo `/api` están documentadas en el
[contrato HTTP y OpenAPI](docs/architecture/openapi/api-contract.md).
Consulta esa referencia para métodos, rutas, permisos, cuerpos y respuestas;
los controles visuales de las páginas se explican en la documentación de la interfaz.

## Pruebas automatizadas

Se mantiene un solo punto de creación de cliente Prisma en `src/lib/prisma.js`. En pruebas, Vitest ejecuta con `NODE_ENV=test`, por lo que el mismo resolver usa `DATABASE_TEST_URL` sin crear un segundo cliente.

Las pruebas que escriben datos usan exclusivamente la base indicada por
`DATABASE_TEST_URL` y limpian sus registros identificables antes y después de la suite.
Cuando un flujo acepta el cliente transaccional sin sustituir el comportamiento que se
quiere probar, puede reutilizarse `tests/helpers/rollbackTransaction.js` para forzar
rollback. La estrategia y ubicación de cada tipo de prueba están detalladas en
[`docs/testing/test-plan.md`](docs/testing/test-plan.md).

Flujo recomendado para pruebas con base de datos (el comando valida la URL aislada, aplica las
migraciones, genera Prisma y ejecuta la integración):

```bash
npm run test:db
```

Los scripts de prueba validan primero que exista `DATABASE_TEST_URL` y que no sea la misma URL que `DATABASE_URL`. Para migraciones de prueba, los scripts ejecutan Prisma con `NODE_ENV=test`, por lo que el resolver usa `DIRECT_TEST_URL` si está definida y, si no existe, `DATABASE_TEST_URL`, sin sobrescribir manualmente `DATABASE_URL`.

Para pruebas que no requieren base de datos real, usa:

```bash
npm run test:unit
```

Para medir cobertura de la aplicación:

```bash
npm run test:coverage
```

Abre `coverage/unit/index.html` en el navegador para consultar archivos, funciones y
ramas pendientes de ejecutar. Para medir integración, prepara la misma base aislada de
`test:integration` y ejecuta `npm run test:coverage:integration`; su reporte queda en
`coverage/integration/index.html`. Los reportes incluyen también archivos no ejecutados
y no se versionan. El alcance y los límites de estas métricas están en el
[plan de pruebas](docs/testing/test-plan.md#medición-de-cobertura).

Los comandos que establecen `NODE_ENV=test` usan `cross-env` para funcionar en Windows
y sistemas POSIX. CI conserva los reportes de cobertura junto con los resultados JUnit.

`npm test` es un alias equivalente para la suite unitaria. Para una entrega ejecute primero
`npm run test:unit`, después `npm run test:integration` con `DATABASE_TEST_URL` aislada y finalmente
`npm run docs:check`; conserve en la evidencia el comando, el resultado y el commit. Las pruebas
son procesos de una sola ejecución y regresan al prompt automáticamente. Sólo `npm run test:watch`
permanece observando cambios y se cierra con `Ctrl+C`.

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
- Mantén en `plugins/select2/baseSelect.js` los comportamientos visuales compartidos por
  selects de distintos CRUD, como la sincronización de la presentación en compras y salidas.
- En los detalles responsivos se conserva la prioridad operativa de `Surtir` y
  `Cantidad de proyecto` en salidas, y de `Acciones` en compras, antes que las
  columnas informativas cuando se reduce el ancho disponible.
- Conserva el mismo orden CRUD en rutas, controllers, servicios de aplicación y
  servicios HTTP: lectura, creación, actualización general, actualizaciones
  especializadas y eliminación o acción terminal.
- Para nuevas funcionalidades con persistencia, agrega migraciones Prisma y pruebas asociadas.
- No reutilices la base de desarrollo como base de pruebas.

## Docker

La raíz del repositorio incluye `Dockerfile` y `docker-compose.yml`. Ejecuta
los comandos Docker Compose desde esa raíz; el archivo de entorno es `back/.env`. Al iniciar el contenedor,
el entrypoint ejecuta primero `prisma migrate deploy` y solamente arranca la
aplicación si las migraciones terminan correctamente. El CLI de Prisma toma
`DIRECT_URL` mediante `prisma.config.ts`; la aplicación continúa conectándose con
`DATABASE_URL`.

### Entorno vigente y evolución prevista

Actualmente el contenedor de la aplicación se ejecuta como servicio web en **Render**
y la base de datos PostgreSQL es administrada por **Supabase**. Render recibe `DATABASE_URL`
para las consultas de ejecución y `DIRECT_URL` para las migraciones sin incorporar
ninguna credencial a la imagen. `docker-compose.yml` permite reproducir el contenedor
en un host, pero no representa por sí mismo el entorno de producción ni crea un
servicio PostgreSQL.

El objetivo es mover la aplicación a un **VPS**. Hasta definir y versionar el proxy
inverso, TLS, automatización, respaldos y monitoreo, esa topología permanece propuesta.
También debe decidirse expresamente si el VPS conservará Supabase como base de datos
administrada o alojará una instancia propia de PostgreSQL. Consulta la
[vista de despliegue actual y objetivo](docs/architecture/views/physical/01-system-runtime-and-deployment.md).

La documentación (`README.md` y `docs/`) **se conserva y versiona en este
repositorio**. Las reglas de `.dockerignore` únicamente la excluyen del contexto de
construcción Docker para que no se envíe al servidor ni se incorpore a la imagen
desplegada; no afectan los archivos registrados por Git.

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
