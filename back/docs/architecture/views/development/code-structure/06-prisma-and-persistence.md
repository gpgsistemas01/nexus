# 6. Prisma: cliente, consultas, transacciones y migraciones

Prisma es el ORM que Nexus utiliza para consultar PostgreSQL y mantener su
historial de migraciones. El proyecto usa **Prisma 7**, el generador `prisma-client`
y el adaptador `@prisma/adapter-pg`. Las reglas de negocio y los permisos se
implementan en los servicios y middleware de Nexus.

## Cómo se implementa en Nexus

| Pieza | Responsabilidad |
| --- | --- |
| `prisma/schema.prisma` | Define modelos, campos, relaciones e índices. |
| `prisma/migrations/*/migration.sql` | Conserva el SQL versionado que modifica estructura o datos históricos. |
| `prisma.config.ts` | Configura el esquema, las migraciones y la conexión del CLI. |
| `generated/prisma/client.ts` | Cliente generado desde el esquema; está excluido de Git y no se edita. |
| `src/lib/prisma.js` | Construye el cliente compartido con `PrismaPg`. |
| `src/repository/baseRepository.js` | `getDb(tx)` selecciona el cliente transaccional o el compartido. |

**Identificador:** `DIA-COD-PRISMA-001`. **Pregunta:** ¿cómo llega el modelo Prisma a las
consultas de los servicios? **Fuente:** `prisma/schema.prisma`, `prisma.config.ts`,
`src/lib/{prisma,databaseUrl}.js` y `src/repository/baseRepository.js`.
**Leyenda:** flechas rotuladas por generación, import o uso; no son pasos de una petición.

```mermaid
flowchart TB
    schema["prisma/schema.prisma<br/>modelos · relaciones · generator"] -->|prisma generate| generated["generated/prisma/client.ts<br/>cliente generado"]
    generated -->|importado por| shared["src/lib/prisma.js<br/>export const prisma = new PrismaClient"]
    url["src/lib/databaseUrl.js<br/>getDatabaseUrl()"] -->|connectionString| adapter["PrismaPg<br/>@prisma/adapter-pg"]
    shared -->|recibe adapter| adapter
    adapter -->|consultas PostgreSQL| postgres[("PostgreSQL")]
    selector["src/repository/baseRepository.js<br/>getDb(tx) = tx || prisma"] -->|importa| shared
    services["src/services<br/>findMany · create · update · count"] -->|seleccionan contexto| selector
    config["prisma.config.ts<br/>schema + migrations + URL directa"] -->|configura| cli["Prisma CLI<br/>generate · migrate deploy"]
    cli -->|lee| schema
    cli -->|aplica SQL versionado| postgres
```

Los servicios reutilizan `getDb(tx)` para consultar y escribir; no crean un
cliente por petición. En una operación compuesta, el coordinador abre
`$transaction`, propaga `tx` a sus colaboradores y retorna el resultado del
callback. Un fallo dentro del callback revierte sus escrituras, incluido el
contador del folio; una operación posterior al commit tiene otra frontera.
Los detalles se explican en [contexto transaccional](../design-and-construction-patterns/09-context-transactional-and-consistency-atomic.md).

## Consultas e índices

Los índices de fecha de compras y salidas se declaran con `@@index` en Prisma y
se aplican mediante una migración SQL incremental. El tipo y la fecha forman el
prefijo de compras y salidas de materiales/consumibles; `id` añade el desempate del
orden por fecha. En merma se conserva el índice existente de fecha sola, porque
el reemplazo por fecha/id no demostró una ventaja suficiente en las mediciones.
La consulta mantiene rangos sobre la columna original, sin convertirla a texto ni
envolverla en funciones de fecha que impidan aprovechar ese prefijo.

`findPage` reutiliza un único conteo cuando el filtro de filas es igual al alcance
total, comparando valores y fechas; filtros distintos conservan conteos distintos.
Las exportaciones siguen omitiendo los conteos. Las estrategias de carga de
relaciones y los índices se evalúan con SQL y planes reales conforme a la
[guía de rendimiento](../../../../testing/backend-performance.md), sin cambiar
el contrato de respuesta ni trasladar permisos fuera del servidor.

El nombre de material utiliza un índice GIN de trigramas para las búsquedas
parciales de Materiales y Consumibles. `ops: raw("gin_trgm_ops")` declara la clase
de operadores en el esquema y la migración SQL mantiene `pg_trgm`. No se cambia
la comparación `contains`, la identidad única ni el cliente compartido. Las
decisiones sobre diagnóstico, caché y carga de relaciones están en la misma guía
de rendimiento; añadir una extensión de cliente no optimiza por sí solo el SQL.

La selección retira índices simples de proveedor y tipo cuando otro índice
conserva su prefijo y los planes comprobados mantienen el acceso. Los recibos de
importación e histórico conservan la PK y el único por usuario/operación, junto con
el índice de vencimiento de importaciones; no mantienen un índice de orden
usuario/fecha sin consulta que lo aproveche. La tabla de decisiones y sus límites
se mantiene en la guía de rendimiento. Las retiradas se aplican con una migración
incremental, conservando los índices de integridad y el historial anterior.

## Comandos habituales

Desde `back/`, use Node.js 24 y `npm ci` para instalar las versiones del lockfile.
Configure las [variables de desarrollo](../../../../development/local-development.md#preparar-el-entorno):
la aplicación usa `DATABASE_URL`; el CLI prefiere `DIRECT_URL`. Ambas deben
apuntar a la misma base del entorno. En pruebas se seleccionan
`DATABASE_TEST_URL` y, si existe, `DIRECT_TEST_URL`, para una base aislada.

| Necesidad | Comando |
| --- | --- |
| Validar el esquema e inspeccionar migraciones aplicadas | `npx prisma validate` y `npx prisma migrate status` |
| Aplicar migraciones pendientes y generar el cliente | `npm run db:migrate` |
| Regenerar sólo el cliente, por ejemplo tras cambiar de rama | `npm run db:generate` |
| Preparar SQL de un cambio de esquema en desarrollo | `npx prisma migrate dev --name describir_cambio --create-only` |
| Comprobar persistencia con la base de pruebas | `npm run test:integration` |
| Actualizar y comprobar documentación generada | `npm run docs:architecture` y `npm run docs:check` |

Revise el SQL nuevo antes de aplicarlo. Un cambio sólo de datos, como convertir
folios, también se versiona en una **migración incremental**; no se modifica SQL
ya aplicado. `migrate dev` requiere una base sombra y una cuenta de desarrollo
con capacidad para crearla en la configuración actual. Los roles, el despliegue
y la conversión de folios pertenecen a la [vista física de PostgreSQL](../../physical/02-postgresql-runtime-and-migration-roles.md).

Generar el cliente no migra la base. Si faltan tablas o columnas, compruebe el
historial antes de regenerarlo. El proyecto no configura un comando de seed;
las integraciones preparan sus propios datos. El modelo y las series anuales
`SMA`, `SCO`, `SME`, `CMA` y `CCO` se describen en la
[vista de datos](../../logical/data-and-persistence/index.md).

## Documentación oficial

Consulte las páginas de **Prisma ORM 7**, correspondientes a la versión del
proyecto. Mantenga las dependencias del repositorio al seguir sus ejemplos.

- [Resumen de Prisma ORM 7](https://www.prisma.io/docs/orm/v7).
- [Prisma Client: consultas y relaciones](https://www.prisma.io/docs/orm/v7/prisma-client).
- [Prisma Migrate: historial y evolución de la base](https://www.prisma.io/docs/orm/v7/prisma-migrate).
- [Transacciones](https://www.prisma.io/docs/orm/v7/prisma-client/queries/transactions).
