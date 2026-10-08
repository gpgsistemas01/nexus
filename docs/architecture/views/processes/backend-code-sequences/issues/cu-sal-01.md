<a id="cu-sal-01"></a>
# `CU-SAL-01` — Consultar salidas de material

**Patrones:** `BE-P01`.

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Route@{ "type": "boundary" } as src/routes/api/warehouse/goodsIssues/materials/materialGoodsIssueApiRoute.js
    participant Auth@{ "type": "control" } as src/middleware/authMiddleware.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/goodsIssues/materials/materialGoodsIssueController.js<br/>src/controllers/api/warehouse/goodsIssues/shared/goodsIssueHandlers.js
    participant Facade@{ "type": "control" } as src/services/warehouse/goodsIssues/materials/materialGoodsIssueService.js
    participant Core@{ "type": "control" } as src/services/warehouse/goodsIssues/goodsIssueService.js
    participant Helpers as src/services/warehouse/goodsIssues/goodsIssueHelpers.js
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL

    Client->>Route: GET /api/warehouse/goods-issues/materials
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    Route->>Auth: authorizeUserApi(PERMISSIONS.GOODS_ISSUES_MANAGE)(req, res, next)
    break Identidad no vigente o permiso denegado
        Auth-->>Client: HTTP 401 INVALID_AUTH o HTTP 403 FORBIDDEN
    end
    Route->>Controller: getAllMaterialGoodsIssues(req, res)
    Controller->>Controller: getIssueDataTableQuery({ query, columns })
    Controller->>Facade: findAllMaterialGoodsIssues(query)
    Facade->>Core: findAllGoodsIssues({ ...options, type: MATERIAL })
    Core->>Helpers: buildGoodsIssueContextWhere(type)
    Helpers-->>Core: buildGoodsIssueContextWhere(): Object
    Core->>Prisma: goodsIssue.findMany({ where, skip, take, orderBy, include })
    Prisma-->>Core: findMany(): Promise[GoodsIssue[]]
    Core->>Prisma: goodsIssue.count({ where })
    Prisma-->>Core: count(): Promise[number] — total y filtered iguales
    Core-->>Facade: findAllGoodsIssues(): Promise[{ data, recordsTotal, recordsFiltered }]
    Facade-->>Controller: findAllMaterialGoodsIssues(): Promise[{ data, recordsTotal, recordsFiltered }]
    Controller-->>Client: HTTP 200 { data, recordsTotal, recordsFiltered }
```
