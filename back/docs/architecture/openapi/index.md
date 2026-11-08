# Documentación de la API de Nexus

## Datos generales del documento

| Versión documental | Versión del sistema | Estado | Fecha | Responsable |
| --- | --- | --- | --- | --- |
| 1.1 | 1.0.0 | En revisión | 2026-10-31 | Equipo Nexus |

Referencia de las rutas `/api`: autenticación, consultas, escrituras y reportes.
Los comandos se ejecutan desde `back/`.

| Necesidad | Consultar |
| --- | --- |
| Iniciar sesión y hacer una petición | [Inicio rápido](01-consumption.md). |
| Revisar errores, límites y reintentos | [Contrato HTTP](api-contract.md). |
| Ver operaciones, parámetros y esquemas | [OpenAPI 3.1](openapi.json). |
| Explorar y probar la API en desarrollo | [Swagger UI](02-maintenance.md#swagger-ui-en-desarrollo). |
| Validar o publicar el contrato | [Mantenimiento](02-maintenance.md). |

OpenAPI conserva el detalle por operación en [Sesión](paths/auth.json),
[Clientes](paths/sales.json), [Almacén](paths/warehouse.json) y
[Administración](paths/admin.json). Las
[importaciones de inventario](paths/inventory-imports.json) documentan plantillas,
multipart, confirmación y recuperación. El contrato HTTP reúne las reglas comunes.

La [interfaz Vue](../../../../front/docs/architecture/views/development/code-structure.md)
y la [implementación del servidor](../views/development/backend-technical-documentation/index.md)
tienen referencias propias.
