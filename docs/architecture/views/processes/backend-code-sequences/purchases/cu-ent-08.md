<a id="cu-ent-08"></a>
# `CU-ENT-08` — Crear compra de consumible

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`, `BE-P05`.

Si el selector crea un proveedor, antes de esta secuencia el navegador completa el `POST
/api/warehouse/suppliers` de [`CU-CAT-02`](../catalogs/cu-cat-02.md#cu-cat-02). La compra recibe el
`supplierId` resultante — el alta no se integra en la transacción de la compra ni habilita la ruta web
independiente de proveedores.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route@{ "type": "boundary" } as src/routes/api/warehouse/goodsReceipts/consumables/consumableGoodsReceiptApiRoute.js
    participant Auth@{ "type": "control" } as src/middleware/authMiddleware.js
    participant Validator@{ "type": "control" } as src/validators/forms/goodsReceiptValidations.js<br/>src/middleware/validatorMiddleware.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/goodsReceipts/consumables/consumableGoodsReceiptController.js<br/>src/controllers/api/warehouse/goodsReceipts/shared/goodsReceiptHandlers.js
    participant Facade@{ "type": "control" } as src/services/warehouse/goodsReceipts/consumables/consumableGoodsReceiptService.js
    participant Core@{ "type": "control" } as src/services/warehouse/goodsReceipts/goodsReceiptService.js
    participant Helpers as src/services/warehouse/goodsReceipts/goodsReceiptHelpers.js
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant Inventory as src/services/inventory/movementService.js
    participant Socket as src/utils/socketUtils.js
    participant DTO@{ "type": "entity" } as goodsReceiptDto: Object<br/>src/dtos/goodsReceiptDTO.js
    participant ErrorHandler as src/app.js
    participant Costs as src/services/warehouse/materials/supplierMaterialService.js
    participant Invoice as src/services/warehouse/goodsReceipts/goodsReceiptInvoiceService.js
    participant Reference as src/services/document/referenceNumberService.js

    Client->>Route: POST /api/warehouse/goods-receipts/consumables
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    Route->>Validator: goodsReceiptValidation[] y validate(req, res, next)
    break Validación rechazada
        Validator-->>Client: HTTP 400 { errors }
    end
    Route->>Auth: authorizeUserApi(PERMISSIONS.GOODS_RECEIPTS_MANAGE)(req, res, next)
    break Identidad no vigente o permiso denegado
        Auth-->>Client: HTTP 401 INVALID_AUTH o HTTP 403 FORBIDDEN
    end
    Route->>Controller: registerConsumableGoodsReceipt(req, res)
    Controller->>DTO: createGoodsReceiptDtoForRegister(req.body)
    DTO-->>Controller: createGoodsReceiptDtoForRegister(): Object — DTO normalizado
    Controller->>Controller: sanitizeEmptyStrings(dto)
    Controller->>Facade: createConsumableGoodsReceipt(options con DTO, identificadores y actor cuando corresponde)
    Facade->>Core: createGoodsReceipt({ ...options, type: CONSUMABLE })
    alt Servicio resuelto
        Core->>Invoice: assertGoodsReceiptInvoiceAvailable({ supplierId, invoice }) tras consultar proveedor y receptor
        Core->>Helpers: buildGoodsReceiptDetails(details, { supplierId, type })
        Core->>Helpers: calculateGoodsReceiptTotals(processedDetails)
        Core->>Prisma: getDb().$transaction(async tx => ...)
        rect rgb(245, 245, 245)
            Note over Core,Prisma: getDb().$transaction(async tx => ...)
            Core->>Reference: generateYearlyReferenceNumber({ tx, ... })
            Core->>Prisma: tx.goodsReceipt.create({ data: { type, referenceNumber, ... } })
            Core->>Inventory: applyInventoryMovement({ tx, movementType: ENTRY, details })
            Inventory->>Prisma: createInventoryMovement({ tx, ... }) y actualización de existencias
        end
        Prisma-->>Core: commit y compra creada
        Core->>Costs: updateMaterialUnitCostIfHigher({ supplierId, materialId, conversionUnitCost }) tras commit
        Core-->>Facade: createGoodsReceipt(): Promise[GoodsReceipt]
        Facade-->>Controller: createConsumableGoodsReceipt(): Promise[GoodsReceipt]
        Controller->>Socket: emitInventoryUpdated({ context: 'consumable', source: 'goods-receipt-created' })
        Controller-->>Client: HTTP 200 { goodsReceipt, code }
    else Error de dominio o persistencia
        Core-->>Facade: error — rollback si falló la transacción
        Facade-->>Controller: error propagado
        Controller->>ErrorHandler: next(error) — propagación de Express
        ErrorHandler-->>Client: HTTP de error { code, message }
    end
```
