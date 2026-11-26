# Desarrollo local del backend

## Requisitos

- Node.js y npm compatibles con [`back/package.json`](../../package.json).
- PostgreSQL con una base de desarrollo creada.
- Una cuenta activa de Nexus en esa base para acceder a las rutas protegidas.

## Preparar el entorno

Desde la raíz del repositorio:

```bash
npm --prefix back ci --include=dev
```

Crea `back/.env` con las variables necesarias para el entorno local. No compartas
secretos ni los guardes en Git.

| Variable | Uso |
| --- | --- |
| `NODE_ENV` | Usa `development` para la ejecución local. |
| `DATABASE_URL` | Conexión de la aplicación a PostgreSQL. |
| `JWT_SECRET_ACCESS` | Firma independiente para tokens de acceso. |
| `JWT_SECRET_REFRESH` | Firma independiente para tokens de renovación. |
| `PORT` | Puerto HTTP; por defecto `3000`. |
| `DIRECT_URL` | Conexión directa opcional para migraciones Prisma. |

Consulta [resolución de conexión y persistencia](../architecture/views/development/code-structure/06-prisma-and-persistence.md)
para la selección de URL por entorno. No uses una base de producción para las
migraciones ni para las pruebas.

## Migraciones y cliente Prisma

Confirma que `DATABASE_URL` apunta a la base de desarrollo y aplica las migraciones:

```bash
npm --prefix back run db:migrate
```

El comando aplica migraciones pendientes y genera el cliente Prisma. Si sólo
necesitas generar el cliente:

```bash
npm --prefix back run db:generate
```

## Ejecutar la API

Desde la raíz del repositorio, inicia el backend:

```bash
npm --prefix back run dev
```

La API queda disponible por defecto en `http://localhost:3000`; la especificación
interactiva está en `http://localhost:3000/api-docs/`. Detén el proceso con Ctrl+C.
Para usar Vue con la API, sigue también los pasos de inicio de
[desarrollo frontend](../../../front/docs/development/01-getting-started.md).

## Validar cambios

| Objetivo | Comando |
| --- | --- |
| Pruebas unitarias | `npm --prefix back run test:unit` |
| Pruebas de integración con PostgreSQL | `npm --prefix back run test:integration` |
| Comprobar variables y separación de la base de prueba | `npm --prefix back run test:db:verify` |
| Regenerar documentación técnica derivada | `npm --prefix back run docs:architecture` |
| Comprobar documentos generados y contrato OpenAPI | `npm --prefix back run docs:check` |

Las pruebas con base de datos requieren `DATABASE_TEST_URL` aislada de
`DATABASE_URL`; `DIRECT_TEST_URL` permite usar una conexión directa para migrar.
El [plan de pruebas](../testing/test-plan.md) y la guía de
[rendimiento](../testing/backend-performance.md) explican alcance y medición.

## Scripts disponibles

Los scripts autoritativos están en [`package.json`](../../package.json). Para
exportar documentación técnica, usa `npm --prefix back run docs:export -- <familia>
<sección> <docx|pdf|ambos>`; la [guía de exportación](documentation.md)
describe formatos, herramientas y selecciones disponibles. Capturas y manuales de
usuario se generan desde la [guía de desarrollo Vue](../../../front/docs/development/index.md).

## Arrancar Node con logs en Grafana Cloud

El arranque opcional `npm run start:logs` desde `back/` carga `back/.env` y
ejecuta la API y Alloy en el equipo local. Requiere Alloy instalado y disponible
como `alloy` en el PATH. Si está en otra ubicación, indica la ruta del ejecutable
con `NEXUS_ALLOY_BIN`. Esta modalidad ejecuta Node directamente y conserva el
`NODE_ENV` del entorno. Con `NODE_ENV=test`, la API usa `DATABASE_TEST_URL`.
Arrancar la API con este comando no aplica migraciones de Prisma.

Agrega estos valores al `back/.env` existente y conserva la configuración de
base de datos de prueba:

```dotenv
NEXUS_LOG_ENVIRONMENT=local
LOG_LEVEL=info
LOG_HTTP_ROUTINE=false
GRAFANA_LOKI_HOST=host-publico-de-loki.grafana.net
GRAFANA_LOKI_USERNAME=id-numerico-de-loki
GRAFANA_LOKI_TOKEN_FILE=/ruta/privada/nexus-loki-token
```

Guarda en el último archivo sólo el valor de un token de Grafana Cloud con
`logs:write`, fuera del repositorio. Si la ruta contiene espacios, escríbela
entre comillas en `.env`. En Grafana Explore, selecciona Loki y consulta
`{job="nexus-api",environment="local"} | json | event="server_started"`.
El nivel `info` permite ver ese evento con `NODE_ENV=test`. Si Alloy no puede
arrancar, la API sigue emitiendo logs a stdout.
