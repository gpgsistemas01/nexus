# API de Nexus

La especificación [OpenAPI 3.1](openapi.json) define el contrato HTTP.

| Necesidad | Fuente |
| --- | --- |
| Iniciar sesión y enviar una petición | [Inicio rápido](01-consumption.md). |
| Revisar rutas, parámetros y esquemas | [OpenAPI](openapi.json). |
| Explorar y probar en desarrollo | [Swagger UI](02-maintenance.md#swagger-ui-en-desarrollo). |
| Validar y publicar | [Mantenimiento](02-maintenance.md). |

Las rutas se agrupan en [sesión](paths/auth.json), [ventas](paths/sales.json),
[almacén](paths/warehouse.json), [administración](paths/admin.json),
[importaciones](paths/inventory-imports.json) y [entregas históricas](paths/historical-deliveries.json).
La [API de Vue](../../../../front/docs/architecture/contracts/index.md) y la
[implementación del servidor](../views/development/backend-technical-documentation/index.md)
se documentan por separado.
