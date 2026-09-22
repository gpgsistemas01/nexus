<a id="cu-ent-03"></a>
# `CU-ENT-03` — Editar compra de material

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`, `BE-P05`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/warehouse/goodsReceiptApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/goodsReceiptController.js
    participant ReceiptDto as «object»<br/>goodsReceiptDto<br/>src/dtos/goodsReceiptDTO.js
    participant Domain as src/services/warehouse/goodsReceipts/goodsReceiptService.js
    participant ErrorHandler as src/app.js

    Client->>Route: PATCH /api/warehouse/goods-receipts/:id
    Route->>Controller: editGoodsReceiptHeader(req, res)
    activate Controller
    Controller->>ReceiptDto: createGoodsReceiptDtoForEdit(req.body)
    ReceiptDto-->>Controller: goodsReceiptDto normalizado
    Controller->>Domain: goodsReceiptService.updateGoodsReceipt({ id: req.params.id, goodsReceiptDto }) conserva detalles persistidos y actualiza encabezado permitido
    activate Domain
    alt Servicio resuelto
        Domain-->>Controller: goodsReceiptService.updateGoodsReceipt() resuelve datos de dominio
        Controller-->>Client: HTTP 2xx { code, data }
    else AppError propagado
        Domain-->>Controller: throw AppError { code, message, meta, statusCode }
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
    end
    deactivate Domain
    deactivate Controller
```

