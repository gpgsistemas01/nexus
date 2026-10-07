<a id="cu-ent-01"></a>
# `CU-ENT-01` — Consultar compras de material

**Patrones:** `BE-P01`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/warehouse/goodsReceipts/materials/materialGoodsReceiptApiRoute.js
    participant Auth as src/middleware/authMiddleware.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/goodsReceipts/materials/materialGoodsReceiptController.js<br/>src/controllers/api/warehouse/goodsReceipts/shared/goodsReceiptHandlers.js
    participant Facade as src/services/warehouse/goodsReceipts/materials/materialGoodsReceiptService.js
    participant Core as src/services/warehouse/goodsReceipts/goodsReceiptService.js
    participant Helpers as src/services/warehouse/goodsReceipts/goodsReceiptHelpers.js
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL

    Client->>Route: GET /api/warehouse/goods-receipts/materials
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    Route->>Auth: authorizeUserApi(PERMISSIONS.GOODS_RECEIPTS_MANAGE)(req, res, next)
    alt Token o permiso rechazados
        Route-->>Client: HTTP 401 o 403 — error de middleware
    else Pipeline aceptado
        Route->>Controller: getAllMaterialGoodsReceipts(req, res)
        Controller->>Controller: getDataTablePaging(req.query) — filtros, búsqueda y orden de compras
        Controller->>Facade: findAllMaterialGoodsReceipts(query)
        Facade->>Core: findAllGoodsReceipts({ ...options, type: MATERIAL })
        Core->>Helpers: buildGoodsReceiptContextWhere(type)
        Helpers-->>Core: buildGoodsReceiptContextWhere(): Object
        Core->>Prisma: goodsReceipt.findMany({ where, skip, take, orderBy, select })
        Prisma-->>Core: findMany(): Promise[GoodsReceipt[]]
        Core->>Prisma: goodsReceipt.count({ where: contextWhere })
        Prisma-->>Core: count(): Promise[number] — total
        opt Hay filtros adicionales
            Core->>Prisma: goodsReceipt.count({ where })
            Prisma-->>Core: count(): Promise[number] — filtered
        end
        Core-->>Facade: findAllGoodsReceipts(): Promise[{ data, recordsTotal, recordsFiltered }]
        Facade-->>Controller: findAllMaterialGoodsReceipts(): Promise[{ data, recordsTotal, recordsFiltered }]
        Controller-->>Client: HTTP 200 { data, recordsTotal, recordsFiltered }
    end
```
