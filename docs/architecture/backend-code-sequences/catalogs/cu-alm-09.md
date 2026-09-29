<a id="cu-alm-09"></a>
# `CU-ALM-09` — Consultar mermas

**Patrones:** `BE-P01`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/warehouse/wasteApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/wasteController.js
    participant Domain as src/services/warehouse/wastes/wasteService.js
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant ErrorHandler as src/app.js

    Client->>Route: GET /api/warehouse/wastes
    Route->>Controller: getAllWastes(req, res)
    activate Controller
    Controller->>Domain: wasteService.findAllWastes({ skip, take, search, supplierId, orderBy, orderDir, canReadCosts: req.user.permissions.includes(PERMISSIONS.INVENTORY_COSTS_READ) })
    activate Domain
    Domain->>Prisma: waste.findMany({ where, include, skip, take, orderBy })
    Prisma-->>Domain: findMany(): Promise[Waste[]]
    Domain->>Prisma: waste.count({ where })
    Prisma-->>Domain: count(): Promise[number]
    alt Servicio resuelto
        Domain-->>Controller: wasteService.findAllWastes(): Promise[{ data: Waste[], recordsTotal: number, recordsFiltered: number }]
        Controller-->>Client: HTTP 2xx { code, data }
    else AppError propagado
        Domain-->>Controller: throw AppError { code, message, meta, statusCode }
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
    end
    deactivate Domain
    deactivate Controller
```

