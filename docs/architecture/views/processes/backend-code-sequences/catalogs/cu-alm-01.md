<a id="cu-alm-01"></a>
# `CU-ALM-01` — Consultar materiales

**Patrones:** `BE-P01`.

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Route@{ "type": "boundary" } as src/routes/api/warehouse/materialApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/materialController.js
    participant Domain@{ "type": "control" } as src/services/warehouse/materials/materialService.js
    participant SupplierMaterial@{ "type": "control" } as src/services/warehouse/materials/supplierMaterialService.js
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant ErrorHandler as src/app.js

    Client->>Route: GET /api/warehouse/materials
    Route->>Controller: getAllMaterials(req, res)
    activate Controller
    Controller->>Domain: findAllMaterials({ paginación, filtros, orden, canReadCosts })
    activate Domain
    Domain->>SupplierMaterial: findAllSupplierMaterials({ ... })
    SupplierMaterial->>Prisma: supplierMaterial.findMany({ select: { material, supplier, existencia } })
    Prisma-->>SupplierMaterial: findMany(): Promise[SupplierMaterial[]]
    SupplierMaterial->>Prisma: material.findMany({ relaciones históricas: none })
    Prisma-->>SupplierMaterial: findMany(): Promise[{ id: number }[]]
    SupplierMaterial->>Prisma: supplierMaterial.count({ where })
    Prisma-->>SupplierMaterial: count(): Promise[number]
    SupplierMaterial-->>Domain: findAllSupplierMaterials(): Promise[{ data: SupplierMaterial[], recordsTotal: number, recordsFiltered: number }]
    alt Servicio resuelto
        Domain-->>Controller: findAllMaterials(): Promise[{ data: SupplierMaterial[], recordsTotal: number, recordsFiltered: number }]
        Controller-->>Client: HTTP 200 { data: [{ id, material, supplier, ... }], recordsTotal, recordsFiltered }
    else AppError propagado
        Domain-->>Controller: throw AppError { code, message, meta, statusCode }
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
    end
    deactivate Domain
    deactivate Controller
```
