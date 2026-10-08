<a id="cu-ent-04"></a>
# `CU-ENT-04` — Corregir material de una compra

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`, `BE-P05`.

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Route@{ "type": "boundary" } as src/routes/api/warehouse/goodsReceipts/materials/materialGoodsReceiptApiRoute.js
    participant Auth@{ "type": "control" } as src/middleware/authMiddleware.js
    participant Validator@{ "type": "control" } as src/validators/forms/goodsReceiptValidations.js<br/>src/middleware/validatorMiddleware.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/goodsReceipts/materials/materialGoodsReceiptController.js<br/>src/controllers/api/warehouse/goodsReceipts/shared/goodsReceiptHandlers.js
    participant Facade@{ "type": "control" } as src/services/warehouse/goodsReceipts/materials/materialGoodsReceiptService.js
    participant Core@{ "type": "control" } as src/services/warehouse/goodsReceipts/detailChanges/goodsReceiptCorrectionService.js
    participant Helpers as src/services/warehouse/goodsReceipts/goodsReceiptHelpers.js
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant Inventory as src/services/inventory/movementService.js
    participant Socket as src/utils/socketUtils.js
    participant DTO@{ "type": "entity" } as goodsReceiptDto: Object<br/>src/dtos/goodsReceiptDTO.js
    participant Change as src/services/warehouse/goodsReceipts/detailChanges/goodsReceiptDetailChangeService.js
    participant Reason as src/services/warehouse/reasonService.js
    participant Costs as src/services/warehouse/materials/supplierMaterialService.js
    participant ErrorHandler as src/app.js

    Client->>Route: PATCH /api/warehouse/goods-receipts/materials/:id/details/:detailId/corrections
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    Route->>Validator: goodsReceiptCorrectionValidation[] y validate(req, res, next)
    break Validación rechazada
        Validator-->>Client: HTTP 400 { errors }
    end
    Route->>Auth: authorizeUserApi(PERMISSIONS.GOODS_RECEIPTS_MANAGE)(req, res, next)
    break Identidad no vigente o permiso denegado
        Auth-->>Client: HTTP 401 INVALID_AUTH o HTTP 403 FORBIDDEN
    end
    Route->>Controller: correctMaterialGoodsReceiptDetail(req, res)
    Controller->>DTO: createGoodsReceiptDtoForCorrection(req.body)
    DTO-->>Controller: createGoodsReceiptDtoForCorrection(): Object — DTO normalizado
    Controller->>Controller: sanitizeEmptyStrings(dto)
    Controller->>Facade: correctMaterialGoodsReceiptDetailLine(options con DTO, identificadores y actor cuando corresponde)
    Facade->>Core: correctGoodsReceiptDetailLine({ ...options, type: MATERIAL })
    alt Servicio resuelto
        Core->>Prisma: getDb().$transaction(async tx => ...)
        rect rgb(245, 245, 245)
            Note over Core,Prisma: getDb().$transaction(async tx => ...)
            Core->>Change: findReceiptDetailForChange({ tx, goodsReceiptId: id, detailId, type })
            Change->>Prisma: goodsReceiptDetail.findFirst({ where: { id: detailId, goodsReceiptId: id, goodsReceipt: contextWhere } })
            Prisma-->>Change: findFirst(): Promise[GoodsReceiptDetail|null]
            Change-->>Core: findReceiptDetailForChange(): Promise[GoodsReceiptDetail|null]
            Core->>Core: findReceiptDetailForChange() — comprobar existencia y estado ACTIVE
            Core->>Helpers: buildGoodsReceiptDetails([{ materialId, quantity, costPerUnitType }], { tx, requireActive: false })
            Core->>Core: normalizeDecimal(correctedDetail.quantity) — validar cantidad y cambios
            Core->>Reason: findGoodsReceiptDetailChangeReason({ tx, changeType })
            Core->>Change: createGoodsReceiptDetailChangeMovementAndUpdateStock({ tx, currentDetail, quantityDifference, ... })
            opt Diferencia de cantidad distinta de cero
                Change->>Inventory: createInventoryMovement({ tx, movementType: ADJUSTMENT, ... })
                Change->>Costs: adjustSupplierMaterialStock({ tx, ... })
            end
            Core->>Helpers: correctGoodsReceiptDetailAndTotals({ tx, goodsReceiptId: id, detailId, ... })
            Core->>Change: createGoodsReceiptDetailChange({ tx, changedById: userId, ... })
        end
        Prisma-->>Core: commit de detalle, totales, trazabilidad y stock
        Core->>Costs: recalculateMaterialUnitCosts({ supplierId, materialIds })
        Core-->>Facade: correctGoodsReceiptDetailLine(): Promise[{ updatedDetail, updatedReceipt, detailChange, movement }]
        Facade-->>Controller: correctMaterialGoodsReceiptDetailLine(): Promise[{ updatedDetail, updatedReceipt, detailChange, movement }]
        Controller->>Socket: emitInventoryUpdated({ context: 'material', source: 'goods-receipt-detail-corrected' })
        Controller-->>Client: HTTP 200 { correction, code }
    else Error de dominio o persistencia
        Core-->>Facade: error — rollback si falló la transacción
        Facade-->>Controller: error propagado
        Controller->>ErrorHandler: next(error) — propagación de Express
        ErrorHandler-->>Client: HTTP de error { code, message }
    end
```
