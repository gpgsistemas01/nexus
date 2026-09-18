<a id="cu-ent-02"></a>
# `CU-ENT-02` — Crear compra de material

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`, `BE-P05`.

```mermaid
sequenceDiagram
    Note over Router,Controller: Variables de frontera: goodsReceiptDto y tx
    participant Browser as Navegador
    participant Router as src/routes/api/warehouse/goodsReceiptApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/goodsReceiptController.js
    participant ReceiptDto as «object»<br/>goodsReceiptDto<br/>src/dtos/goodsReceiptDTO.js
    participant Service as src/services/warehouse/goodsReceipts/goodsReceiptService.js
    participant Reference as src/services/document/referenceNumberService.js
    participant DetailBuilder as src/services/warehouse/goodsReceipts/goodsReceiptHelpers.js
    participant Inventory as src/services/inventory/movementService.js
    participant Prisma as Prisma / PostgreSQL
    participant Socket as src/utils/socketUtils.js

    Browser->>Router: POST /api/warehouse/goods-receipts
    Router->>Router: autenticar, validar y autorizar
    Router->>Controller: req, res
    Controller->>ReceiptDto: createGoodsReceiptDtoForRegister(req.body) → sanitizeEmptyStrings(...)
    ReceiptDto-->>Controller: goodsReceiptDto
    Controller->>Service: { goodsReceiptDto }
    Service->>Prisma: validar proveedor, factura y persona receptora
    alt Proveedor o material inactivo
        Service-->>Controller: SUPPLIER_INACTIVE_CONFLICT o MATERIAL_INACTIVE_CONFLICT sin crear entrada ni movimiento
    end
    alt La factura ya existe para el proveedor
        Service-->>Controller: GOODS_RECEIPT_INVOICE_ALREADY_EXISTS con folio existente
    else La factura está disponible o es remisión
        Service->>DetailBuilder: conservar y calcular cada renglón, incluso materiales repetidos
    end
    Service->>DetailBuilder: construir detalles y calcular totales
    Service->>Prisma: iniciar $transaction
    Service->>Reference: generar referencia anual con tx
    Service->>Prisma: crear encabezado, detalles y totales
    Service->>Inventory: applyInventoryMovement({ tx, ENTRY, details })
    Inventory->>Prisma: incrementar existencias y crear movimiento
    Prisma-->>Service: entrada confirmada y commit
    Service-->>Controller: goodsReceipt
    Controller->>Socket: emitInventoryUpdated(...)
    Controller-->>Browser: 200 { goodsReceipt, code }
```

