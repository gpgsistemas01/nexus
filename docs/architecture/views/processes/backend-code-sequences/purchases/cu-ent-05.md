<a id="cu-ent-05"></a>
# `CU-ENT-05` — Cancelar material de una compra

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`, `BE-P05`.

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Route@{ "type": "boundary" } as src/routes/api/warehouse/goodsReceiptApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/goodsReceiptController.js
    participant Domain@{ "type": "control" } as src/services/warehouse/goodsReceipts/materials/materialGoodsReceiptService.js
    participant ErrorHandler as src/app.js

    Client->>Route: PATCH /api/warehouse/goods-receipts/materials/:id/details/:detailId/cancel
    Route->>Controller: cancelMaterialGoodsReceiptDetail(req, res)
    activate Controller
    Controller->>Domain: cancelMaterialGoodsReceiptDetailLine({ id: req.params.id, detailId: req.params.detailId, userId: req.user.id }) revierte stock/movimiento y conserva historial
    activate Domain
    alt Servicio resuelto
        Domain-->>Controller: cancelMaterialGoodsReceiptDetailLine(): Promise[{ updatedDetail: GoodsReceiptDetail, updatedReceipt: GoodsReceipt, detailChange: GoodsReceiptDetailChange, movement: Object }]
        Controller-->>Client: HTTP 2xx { code, data }
    else AppError propagado
        Domain-->>Controller: throw AppError { code, message, meta, statusCode }
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
    end
    deactivate Domain
    deactivate Controller
```
