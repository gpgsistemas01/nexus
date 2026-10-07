<a id="cu-sal-01"></a>
# `CU-SAL-01` — Consultar salidas de material

**Patrones:** `BE-P01`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/warehouse/goodsIssues/materials/materialGoodsIssueApiRoute.js
    participant Auth as src/middleware/authMiddleware.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/goodsIssues/materials/materialGoodsIssueController.js<br/>src/controllers/api/warehouse/goodsIssues/shared/goodsIssueHandlers.js
    participant Facade as src/services/warehouse/goodsIssues/materials/materialGoodsIssueService.js
    participant Core as src/services/warehouse/goodsIssues/goodsIssueService.js
    participant Helpers as src/services/warehouse/goodsIssues/goodsIssueHelpers.js
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL

    Client->>Route: GET /api/warehouse/goods-issues/materials
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    Route->>Auth: authorizeUserApi(PERMISSIONS.GOODS_ISSUES_MANAGE)(req, res, next)
    alt Token o permiso rechazados
        Route-->>Client: HTTP 401 o 403 — error de middleware
    else Pipeline aceptado
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
    end
```
