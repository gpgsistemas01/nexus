# Mapa de datos, persistencia y acceso

## Datos generales del documento

| Versión documental | Versión del sistema | Estado | Fecha | Responsable |
| --- | --- | --- | --- | --- |
| 1.0 | 1.0.0 | En revisión | 2026-09-10 | Equipo Nexus |

## Propósito

Esta página es la entrada única a la documentación relacionada con datos. No vuelve a
definir requisitos, decisiones de diseño ni detalles del esquema: indica qué artefacto
es propietario de cada afirmación y cómo recorrerla hasta su evidencia.


### Documentos y movimientos de merma

Cada adición incremental se conserva como un documento individual `WasteStockEntry`, con
folio, merma, nombre capturado, cantidad, saldo anterior, saldo resultante, actor y
observaciones opcionales. Su estructura sigue el criterio de trazabilidad de
`GoodsReceiptDetailChange`: la operación de negocio conserva sus datos y referencia un
movimiento inmutable, en vez de trasladar esos metadatos al historial común.

El documento se vincula uno a uno con un `WasteMovement` de tipo `ENTRY`; su
`WasteMovementDetail` registra el efecto sobre inventario. Las salidas y ajustes mantienen
sus propios documentos de origen (`WasteIssue` y `WasteStockAdjustment`). Todos los efectos
convergen en `WasteMovement` y se aplican mediante `applyWasteMovement`; `createWasteMovement`
persiste el encabezado y los detalles comunes. Las observaciones pertenecen a
`WasteStockEntry`, no a `reference` ni al movimiento, y no sustituyen el motivo obligatorio
de un ajuste administrativo.

La trazabilidad vigente es **documental y por saldo**, no por lote. Cada entrada puede
recorrerse desde `WasteStockEntry` hasta su movimiento `ENTRY`; cada surtimiento puede
recorrerse desde `WasteIssue` y `WasteIssueDetail` hasta su movimiento `ISSUE`. Ambos
movimientos comparten la merma y conservan sus saldos anterior y resultante, por lo que el
historial cronológico explica cómo cambió la existencia. No existe una relación directa que
asigne una salida a una entrada específica, porque la existencia de una misma merma se
administra como un saldo fungible. Esa relación sólo sería válida si el dominio incorporara
lotes o partidas y una regla explícita de consumo —por ejemplo FIFO—; inferirla únicamente
por fecha produciría una trazabilidad que el sistema no garantiza.

## Propiedad de la información

| Pregunta | Artefacto propietario | Evidencia o vista complementaria |
| --- | --- | --- |
| ¿Qué comportamiento o restricción debe cumplir Nexus? | [Especificación de requisitos](../requirements/requirements-specification/index.md) y [políticas transversales](../requirements/requirements-specification/04-unified-catalog-by-scope/05-policies-cross-cutting-of-the-business.md#45-políticas-transversales-del-negocio). | Los [casos de uso](../requirements/use-cases/index.md) organizan la interacción; no redefinen columnas. |
| ¿Qué significa un concepto para el negocio? | [Glosario](../requirements/business-glossary.md) y [modelo de dominio](../requirements/domain-and-use-cases/index.md). | El diccionario técnico enlaza estos artefactos, pero no infiere significado desde nombres de tablas. |
| ¿Cómo se separan cuenta, persona, asignación y autorización? | [Análisis de usuarios y permisos](database-users-and-permissions-analysis.md), como decisión de diseño de acceso. | `prisma/schema.prisma`, políticas del servidor y el [diagrama ER](../generated/database-schema.md) son evidencia. |
| ¿Qué estructura persistente existe? | `prisma/schema.prisma` y las migraciones de `prisma/migrations`. | El [diagrama ER](../generated/database-schema.md) y el [diccionario técnico](../generated/data-dictionary.md) se generan desde Prisma. |
| ¿Qué cuenta de PostgreSQL ejecuta la aplicación o las migraciones? | [Roles PostgreSQL](postgresql-runtime-and-migration-roles.md), como decisión operativa de infraestructura. | `DATABASE_URL`, `DIRECT_URL`, `prisma.config.ts` y `docker-entrypoint.sh` prueban el enrutamiento; el proveedor administra los privilegios reales. |
| ¿Cuál es el contrato HTTP de un dato? | [Contrato de la API](../architecture/api-contract/index.md) y [OpenAPI 3.1](../architecture/openapi/openapi.json). | Rutas, validadores, DTO, controladores y pruebas de integración aportan la evidencia que debe conservarse sincronizada con el contrato procesable. |

## Recorrido de trazabilidad

Para revisar un dato o una relación se sigue este orden, sin buscar una segunda fuente
normativa:

1. partir del `RF-*`, `RN-*` o `CU-*` que justifica el comportamiento;
2. confirmar el significado en el glosario y el modelo de dominio;
3. revisar la decisión de diseño de acceso o persistencia cuando corresponda;
4. comprobar campos, claves y relaciones en Prisma y sus migraciones;
5. usar el diccionario y el diagrama ER sólo como vistas generadas;
6. localizar ruta, validación, servicio y prueba desde la evidencia del requisito.

La obligatoriedad de una columna no sustituye una precondición del caso de uso; una
restricción Prisma no sustituye una regla de negocio; y una decisión de privilegios de
PostgreSQL no concede permisos funcionales a un usuario de Nexus.
