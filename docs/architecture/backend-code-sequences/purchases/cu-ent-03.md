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
    Note over Controller,Domain: Variables de frontera: req.params.id, req.body/DTO, tx

    Client->>Route: PATCH /api/warehouse/goods-receipts/:id
    Route->>Route: ejecutar en orden el middleware configurado para la ruta
    Route->>Controller: editGoodsReceiptHeader(req, res)
    activate Controller
    Controller->>ReceiptDto: createGoodsReceiptDtoForEdit(req.body) → sanitizeEmptyStrings(...)
    ReceiptDto-->>Controller: goodsReceiptDto normalizado
    Controller->>Domain: goodsReceiptService.updateGoodsReceipt({ id: req.params.id, goodsReceiptDto }) conserva detalles persistidos y actualiza encabezado permitido
    activate Domain
    Domain->>Domain: comprobar datos de frontera y reglas propias de la operación
    Domain-->>Controller: resultado del servicio o error de dominio tipado
    deactivate Domain
    alt El servicio devuelve el resultado
        Controller-->>Client: status HTTP y cuerpo concretos del controller
    else El servicio propaga un error de dominio
        Controller-->>Client: error entregado al middleware final para su respuesta HTTP
    end
    deactivate Controller
```

