# API de Nexus

## Datos generales del documento

| Versión documental | Versión del sistema | Estado | Fecha | Responsable |
| --- | --- | --- | --- | --- |
| 1.14 | 1.0.0 | En revisión | 2026-11-17 | Equipo Nexus |

La especificación [OpenAPI 3.1](openapi.json) define el contrato HTTP.

| Necesidad | Fuente |
| --- | --- |
| Iniciar sesión y enviar una petición | [Inicio rápido](01-consumption.md). |
| Revisar rutas, parámetros y esquemas | [OpenAPI](openapi.json). |
| Explorar y probar en desarrollo | [Swagger UI](02-maintenance.md#probar-en-desarrollo). |
| Validar y publicar | [Mantenimiento](02-maintenance.md). |

Las rutas se agrupan en [sesión](paths/auth.json), [ventas](paths/sales.json),
[almacén](paths/warehouse.json), [administración](paths/admin.json),
[importaciones](paths/inventory-imports.json) y [entregas históricas](paths/historical-deliveries.json).
La [implementación de la API](../views/development/backend-technical-documentation/index.md)
se detalla por módulo. La [documentación del cliente Vue](../../../../front/docs/architecture/contracts/index.md)
explica el consumo del contrato y no sustituye esta especificación.
