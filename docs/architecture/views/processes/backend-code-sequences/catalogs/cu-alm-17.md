<a id="cu-alm-17"></a>
# `CU-ALM-17` — Consultar consumibles

**Patrones:** `BE-P01`.

## Participantes y trazabilidad

Los nombres breves del diagrama corresponden a los archivos vinculados siguientes.
La ruta completa se conserva en cada enlace, fuera de la cabecera visual. Un participante
puede agrupar colaboradores del mismo rol; esa agrupación no implica una clase ni un
proceso independiente. Los retornos representan el resultado o error propagado.

| Alias | Rol visual | Archivos de implementación |
| --- | --- | --- |
| `Route` | boundary | [`consumableApiRoute.js`](../../../../../../src/routes/api/warehouse/consumableApiRoute.js) |
| `Controller` | control | [`consumableController.js`](../../../../../../src/controllers/api/warehouse/consumableController.js) |
| `Domain` | control | [`consumableService.js`](../../../../../../src/services/warehouse/consumables/consumableService.js) |
| `SupplierMaterial` | control | [`supplierMaterialService.js`](../../../../../../src/services/warehouse/materials/supplierMaterialService.js) |
| `ErrorHandler` | control | [`app.js`](../../../../../../src/app.js) |

| `Auth` | control | [`authMiddleware.js`](../../../../../../src/middleware/authMiddleware.js) |

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Route@{ "type": "boundary" } as Router API
    participant Auth@{ "type": "control" } as Acceso
    participant Controller@{ "type": "control" } as Controller
    participant Domain@{ "type": "control" } as Servicio de dominio
    participant SupplierMaterial@{ "type": "control" } as Proveedor / material
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant ErrorHandler@{ "type": "control" } as Errores Express

    Client->>Route: GET /api/warehouse/consumables

    Route->>Auth: verifyApiTokenRequired(req, res, next)
    activate Auth
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    deactivate Auth
    Route->>Auth: authorizeUserApi(PERMISSIONS.MATERIALS_READ)(req, res, next)
    activate Auth
    break Identidad no vigente o permiso denegado
        Auth-->>Client: HTTP 401 INVALID_AUTH o HTTP 403 FORBIDDEN
    end
    deactivate Auth
    Route->>Controller: getAllConsumables(req, res)
    activate Controller
    Controller->>Domain: findAllConsumables({ paginación, filtros, orden, canReadCosts })
    activate Domain
    Domain->>SupplierMaterial: findAllSupplierMaterials({ ... })
    SupplierMaterial->>Prisma: supplierMaterial.findMany({ select: { material, supplier, existencia } })
    activate Prisma
    Prisma-->>SupplierMaterial: findMany(): Promise[SupplierMaterial[]]
    deactivate Prisma
    SupplierMaterial->>Prisma: material.findMany({ relaciones históricas: none })
    activate Prisma
    Prisma-->>SupplierMaterial: findMany(): Promise[{ id: number }[]]
    deactivate Prisma
    SupplierMaterial->>Prisma: supplierMaterial.count({ where })
    activate Prisma
    Prisma-->>SupplierMaterial: count(): Promise[number]
    deactivate Prisma
    SupplierMaterial-->>Domain: findAllSupplierMaterials(): Promise[{ data: SupplierMaterial[], recordsTotal: number, recordsFiltered: number }]
    alt Servicio resuelto
        Domain-->>Controller: findAllConsumables(): Promise[{ data: SupplierMaterial[], recordsTotal: number, recordsFiltered: number }]
        Controller-->>Client: HTTP 200 { data: [{ id, material, supplier, ... }], recordsTotal, recordsFiltered }
    else AppError propagado
        Domain-->>Controller: throw AppError { code, message, meta, statusCode }
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
    end
    deactivate Domain
    deactivate Controller
```
