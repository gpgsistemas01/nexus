<a id="cu-ent-01"></a>
# `CU-ENT-01` — Consultar compras de material

**Patrones:** `BE-P01`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/warehouse/goodsReceiptApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/goodsReceiptController.js
    participant Domain as src/services/warehouse/goodsReceipts/goodsReceiptService.js
    participant ErrorHandler as src/app.js

    Client->>Route: GET /api/warehouse/goods-receipts
    Route->>Controller: getAllGoodsReceipts(req, res)
    activate Controller
    Controller->>Domain: goodsReceiptService.findAllGoodsReceipts({ query: req.query }) consulta entradas y totales
    activate Domain
    alt Servicio resuelto
        Domain-->>Controller: goodsReceiptService.findAllGoodsReceipts() devuelve { data, recordsTotal, recordsFiltered } para la tabla solicitada
        Controller-->>Client: HTTP 2xx { code, data }
    else AppError propagado
        Domain-->>Controller: throw AppError { code, message, meta, statusCode }
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
    end
    deactivate Domain
    deactivate Controller
```

