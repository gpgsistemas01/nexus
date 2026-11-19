# 2. Resumen de patrones confirmados de la API

| Frontera | Implementación | Código |
| --- | --- | --- |
| Arquitectura | Monolito modular y capas por dominio. | Rutas, controllers, servicios y repositories. |
| Entrada HTTP | Pipeline de autenticación, permisos, validación y adaptación. | `src/routes/api` y `src/middleware`. |
| Variación por contexto | Fachadas y handlers configurables de materiales y consumibles. | `goodsReceipts` y `goodsIssues`. |
| Datos | Cliente Prisma compartido y contexto transaccional. | `src/lib/prisma.js`, `baseRepository` y servicios. |
| Registro | Catálogos administrables mediante lista blanca. | `MANAGED_CATALOGS` y `catalogService`. |
| Integración | Eventos autenticados de inventario posteriores a la escritura. | Socket.IO y `emitInventoryUpdated`. |
| Auditoría | Registro transversal después de la respuesta. | `auditWrites`, `persistWriteAudit`. |
| Pruebas | Harness HTTP y fixtures de PostgreSQL aislado. | `createControllerTestApp` y `tests/helpers`. |

El cliente Vue queda fuera de estos patrones; consume el contrato HTTP y los módulos
públicos de `src/shared`, mientras la API conserva validación y autorización.
La [evaluación SOLID](15-solid-principles.md) relaciona estos principios con las
responsabilidades actuales del código.
