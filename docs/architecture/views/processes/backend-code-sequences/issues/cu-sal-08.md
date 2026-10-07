<a id="cu-sal-08"></a>
# `CU-SAL-08` — Consultar salidas de merma

**Patrones:** `BE-P01`.

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Route@{ "type": "boundary" } as src/routes/api/warehouse/wasteIssueApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/wasteIssueController.js
    participant Domain@{ "type": "control" } as src/services/warehouse/wasteIssues/wasteIssueService.js
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant ErrorHandler as src/app.js

    Client->>Route: GET /api/warehouse/waste-issues
    Route->>Controller: getAllWasteIssues(req, res)
    activate Controller
    Controller->>Domain: wasteIssueService.findAllWasteIssues(query)
    activate Domain
    Domain->>Prisma: wasteIssue.findMany({ where, include, skip, take, orderBy })
    Prisma-->>Domain: findMany(): Promise[WasteIssue[]]
    Domain->>Prisma: wasteIssue.count({ where })
    Prisma-->>Domain: count(): Promise[number]
    alt Servicio resuelto
        Domain-->>Controller: wasteIssueService.findAllWasteIssues(): Promise[{ data: WasteIssue[], recordsTotal: number, recordsFiltered: number }]
        Controller-->>Client: HTTP 2xx { code, data }
    else AppError propagado
        Domain-->>Controller: throw AppError { code, message, meta, statusCode }
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
    end
    deactivate Domain
    deactivate Controller
```

