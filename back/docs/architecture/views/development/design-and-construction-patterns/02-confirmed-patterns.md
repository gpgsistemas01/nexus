# 2. Resumen de patrones confirmados

| Frontera | Decisión aplicada | Evidencia |
| --- | --- | --- |
| Arquitectura | Monolito modular y capas por dominio. | Rutas, controllers, servicios y repositories. |
| Entrada HTTP | Pipeline de autenticación, permisos, validación y adaptación. | `src/routes/api` y `src/middleware`. |
| Variación por contexto | Fachadas y handlers configurables de materiales y consumibles. | `goodsReceipts` y `goodsIssues`. |
| Datos | Cliente Prisma compartido y contexto transaccional. | `src/lib/prisma.js`, `baseRepository` y servicios. |
| Registro | Catálogos administrables mediante lista blanca. | `MANAGED_CATALOGS` y `catalogService`. |
| Integración | Eventos autenticados de inventario posteriores a la escritura. | Socket.IO y `emitInventoryUpdated`. |
| Auditoría | Registro transversal después de la respuesta. | `auditWrites`, `persistWriteAudit`. |
| Pruebas | Harness HTTP y fixtures de PostgreSQL aislado. | `createControllerTestApp` y `tests/helpers`. |

La [colección de Vue](../../../../../../front/docs/architecture/views/development/design-and-construction-patterns/index.md)
conserva componentes, composables, callbacks, adaptadores HTTP, sesión e incorporación
contextual. Las constantes públicas permanecen en `src/shared`; las reglas privadas,
en el servidor. La [evaluación SOLID](16-solid-principles.md)
explica principios y límites de estas decisiones.
