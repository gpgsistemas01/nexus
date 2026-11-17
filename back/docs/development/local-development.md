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
<sección> <docx|pdf|ambos>`; la [guía de exportación](../governance/document-export-guide/index.md)
describe formatos, herramientas y selecciones disponibles. Capturas y manuales de
usuario se generan desde la [guía de desarrollo Vue](../../../front/docs/development/index.md).
