<a id="cu-ent-01"></a>
# `CU-ENT-01` — Consultar compras de material

**Patrones:** `BE-P01`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/warehouse/goodsReceiptApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/goodsReceiptController.js
    participant Domain as src/services/warehouse/goodsReceipts/goodsReceiptService.js
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant ErrorHandler as src/app.js

    Client->>Route: GET /api/warehouse/goods-receipts
    Route->>Controller: getAllGoodsReceipts(req, res)
    activate Controller
    Controller->>Domain: goodsReceiptService.findAllGoodsReceipts({ skip, take, search, startDate, endDate, supplierId, personId, orderBy, orderDir })
    activate Domain
    Domain->>Prisma: goodsReceipt.findMany({ where, include, skip, take, orderBy })
    Prisma-->>Domain: findMany(): Promise[GoodsReceipt[]]
    Domain->>Prisma: goodsReceipt.count({ where })
    Prisma-->>Domain: count(): Promise[number]
    alt Servicio resuelto
        Domain-->>Controller: goodsReceiptService.findAllGoodsReceipts(): Promise[{ data: GoodsReceipt[], recordsTotal: number, recordsFiltered: number }]
        Controller-->>Client: HTTP 2xx { code, data }
    else AppError propagado
        Domain-->>Controller: throw AppError { code, message, meta, statusCode }
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
    end
    deactivate Domain
    deactivate Controller
```

