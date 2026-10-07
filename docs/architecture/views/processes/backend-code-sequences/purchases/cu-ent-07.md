<a id="cu-ent-07"></a>
# `CU-ENT-07` — Consultar compras de consumible

> Esta secuencia usa la ruta y la fachada específicas de consumibles; los componentes con nombres históricos de material pertenecen al núcleo compartido de inventario.

**Patrones:** `BE-P01`.

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Route@{ "type": "boundary" } as src/routes/api/warehouse/goodsReceiptApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/goodsReceiptController.js
    participant Domain@{ "type": "control" } as src/services/warehouse/goodsReceipts/consumables/consumableGoodsReceiptService.js
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant ErrorHandler as src/app.js

    Client->>Route: GET /api/warehouse/goods-receipts/consumables
    Route->>Controller: getAllConsumableGoodsReceipts(req, res)
    activate Controller
    Controller->>Domain: consumableGoodsReceiptService.findAllConsumableGoodsReceipts({ skip, take, search, startDate, endDate, supplierId, personId, orderBy, orderDir })
    activate Domain
    Domain->>Prisma: goodsReceipt.findMany({ where, include, skip, take, orderBy })
    Prisma-->>Domain: findMany(): Promise[GoodsReceipt[]]
    Domain->>Prisma: goodsReceipt.count({ where })
    Prisma-->>Domain: count(): Promise[number]
    alt Servicio resuelto
        Domain-->>Controller: consumableGoodsReceiptService.findAllConsumableGoodsReceipts(): Promise[{ data: GoodsReceipt[], recordsTotal: number, recordsFiltered: number }]
        Controller-->>Client: HTTP 2xx { code, data }
    else AppError propagado
        Domain-->>Controller: throw AppError { code, message, meta, statusCode }
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
    end
    deactivate Domain
    deactivate Controller
```

