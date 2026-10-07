<a id="cu-sal-01"></a>
# `CU-SAL-01` — Consultar salidas de material

**Patrones:** `BE-P01`.

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Route@{ "type": "boundary" } as src/routes/api/warehouse/goodsIssueApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/goodsIssueController.js
    participant Domain@{ "type": "control" } as src/services/warehouse/goodsIssues/goodsIssueService.js
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant ErrorHandler as src/app.js

    Client->>Route: GET /api/warehouse/goods-issues
    Route->>Controller: getAllGoodsIssues(req, res)
    activate Controller
    Controller->>Domain: goodsIssueService.findAllGoodsIssues({ ...query, accesses: req.user?.accesses })
    activate Domain
    Domain->>Prisma: goodsIssue.findMany({ where, include, skip, take, orderBy })
    Prisma-->>Domain: findMany(): Promise[GoodsIssue[]]
    Domain->>Prisma: goodsIssue.count({ where })
    Prisma-->>Domain: count(): Promise[number]
    alt Servicio resuelto
        Domain-->>Controller: goodsIssueService.findAllGoodsIssues(): Promise[{ data: GoodsIssue[], recordsTotal: number, recordsFiltered: number }]
        Controller-->>Client: HTTP 2xx { code, data }
    else AppError propagado
        Domain-->>Controller: throw AppError { code, message, meta, statusCode }
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
    end
    deactivate Domain
    deactivate Controller
```

