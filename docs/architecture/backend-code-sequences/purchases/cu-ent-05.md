<a id="cu-ent-05"></a>
# `CU-ENT-05` — Cancelar material de una compra

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`, `BE-P05`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/warehouse/goodsReceiptApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/goodsReceiptController.js
    participant Domain as src/services/warehouse/goodsReceipts/detailChanges/goodsReceiptCancellationService.js
    participant ErrorHandler as src/app.js

    Client->>Route: PATCH /api/warehouse/goods-receipts/:id/details/:detailId/cancel
    Route->>Controller: cancelGoodsReceiptDetail(req, res)
    activate Controller
    Controller->>Domain: cancelGoodsReceiptDetailLine({ id: req.params.id, detailId: req.params.detailId, userId: req.user.id }) revierte stock/movimiento y conserva historial
    activate Domain
    alt Servicio resuelto
        Domain-->>Controller: cancelGoodsReceiptDetailLine() devuelve detalle cancelado, stock revertido y totales recalculados
        Controller-->>Client: HTTP 2xx { code, data }
    else AppError propagado
        Domain-->>Controller: throw AppError { code, message, meta, statusCode }
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
    end
    deactivate Domain
    deactivate Controller
```
