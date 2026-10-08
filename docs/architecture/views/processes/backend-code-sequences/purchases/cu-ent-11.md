<a id="cu-ent-11"></a>
# `CU-ENT-11` — Cancelar consumible de una compra

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`, `BE-P05`.

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Route@{ "type": "boundary" } as src/routes/api/warehouse/goodsReceipts/consumables/consumableGoodsReceiptApiRoute.js
    participant Auth@{ "type": "control" } as src/middleware/authMiddleware.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/goodsReceipts/consumables/consumableGoodsReceiptController.js<br/>src/controllers/api/warehouse/goodsReceipts/shared/goodsReceiptHandlers.js
    participant Facade@{ "type": "control" } as src/services/warehouse/goodsReceipts/consumables/consumableGoodsReceiptService.js
    participant Core@{ "type": "control" } as src/services/warehouse/goodsReceipts/detailChanges/goodsReceiptCancellationService.js
    participant Helpers as src/services/warehouse/goodsReceipts/goodsReceiptHelpers.js
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant Inventory as src/services/inventory/movementService.js
    participant Socket as src/utils/socketUtils.js
    participant Change as src/services/warehouse/goodsReceipts/detailChanges/goodsReceiptDetailChangeService.js
    participant Reason as src/services/warehouse/reasonService.js
    participant Costs as src/services/warehouse/materials/supplierMaterialService.js
    participant ErrorHandler as src/app.js

    Client->>Route: PATCH /api/warehouse/goods-receipts/consumables/:id/details/:detailId/cancel
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    Route->>Auth: authorizeUserApi(PERMISSIONS.GOODS_RECEIPTS_MANAGE)(req, res, next)
    break Identidad no vigente o permiso denegado
        Auth-->>Client: HTTP 401 INVALID_AUTH o HTTP 403 FORBIDDEN
    end
    Route->>Controller: cancelConsumableGoodsReceiptDetail(req, res)
    Controller->>Facade: cancelConsumableGoodsReceiptDetailLine({ id, detailId, userId })
    Facade->>Core: cancelGoodsReceiptDetailLine({ ...options, type: CONSUMABLE })
    alt Servicio resuelto
        Core->>Prisma: getDb().$transaction(async tx => ...)
        rect rgb(245, 245, 245)
            Note over Core,Prisma: getDb().$transaction(async tx => ...)
            Core->>Change: findReceiptDetailForChange({ tx, goodsReceiptId: id, detailId, type })
            Change->>Prisma: goodsReceiptDetail.findFirst({ where: { id: detailId, goodsReceiptId: id, goodsReceipt: contextWhere } })
            Prisma-->>Change: findFirst(): Promise[GoodsReceiptDetail|null]
            Change-->>Core: findReceiptDetailForChange(): Promise[GoodsReceiptDetail|null]
            Core->>Core: findReceiptDetailForChange() — comprobar existencia y estado ACTIVE
            Core->>Reason: findGoodsReceiptDetailChangeReason({ tx, changeType })
            Core->>Change: createGoodsReceiptDetailChangeMovementAndUpdateStock({ tx, currentDetail, quantityDifference, ... })
            opt Diferencia de cantidad distinta de cero
                Change->>Inventory: createInventoryMovement({ tx, movementType: ADJUSTMENT, ... })
                Change->>Costs: adjustSupplierMaterialStock({ tx, ... })
            end
            Core->>Helpers: cancelGoodsReceiptDetailAndTotals({ tx, goodsReceiptId: id, detailId, ... })
            Core->>Change: createGoodsReceiptDetailChange({ tx, changedById: userId, ... })
        end
        Prisma-->>Core: commit de detalle, totales, trazabilidad y stock
        Core->>Costs: recalculateMaterialUnitCosts({ supplierId, materialIds })
        Core-->>Facade: cancelGoodsReceiptDetailLine(): Promise[{ updatedDetail, updatedReceipt, detailChange, movement }]
        Facade-->>Controller: cancelConsumableGoodsReceiptDetailLine(): Promise[{ updatedDetail, updatedReceipt, detailChange, movement }]
        Controller->>Socket: emitInventoryUpdated({ context: 'consumable', source: 'goods-receipt-detail-cancelled' })
        Controller-->>Client: HTTP 200 { correction, code }
    else Error de dominio o persistencia
        Core-->>Facade: error — rollback si falló la transacción
        Facade-->>Controller: error propagado
        Controller->>ErrorHandler: next(error) — propagación de Express
        ErrorHandler-->>Client: HTTP de error { code, message }
    end
```
