<a id="cu-ent-03"></a>
# `CU-ENT-03` — Editar compra de material

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
    participant Core@{ "type": "control" } as src/services/warehouse/goodsReceipts/goodsReceiptService.js
    participant Helpers as src/services/warehouse/goodsReceipts/goodsReceiptHelpers.js
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant Inventory as src/services/inventory/movementService.js
    participant Socket as src/utils/socketUtils.js
    participant DTO@{ "type": "entity" } as goodsReceiptDto: Object<br/>src/dtos/goodsReceiptDTO.js
    participant ErrorHandler as src/app.js
    participant Costs as src/services/warehouse/materials/supplierMaterialService.js
    participant Invoice as src/services/warehouse/goodsReceipts/goodsReceiptInvoiceService.js

    Client->>Route: PATCH /api/warehouse/goods-receipts/materials/:id
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    Route->>Validator: goodsReceiptHeaderValidation[] y validate(req, res, next)
    break Validación rechazada
        Validator-->>Client: HTTP 400 { errors }
    end
    Route->>Auth: authorizeUserApi(PERMISSIONS.GOODS_RECEIPTS_MANAGE)(req, res, next)
    break Identidad no vigente o permiso denegado
        Auth-->>Client: HTTP 401 INVALID_AUTH o HTTP 403 FORBIDDEN
    end
    Route->>Controller: editMaterialGoodsReceipt(req, res)
    Controller->>DTO: createGoodsReceiptDtoForEdit(req.body)
    DTO-->>Controller: createGoodsReceiptDtoForEdit(): Object — DTO normalizado
    Controller->>Controller: sanitizeEmptyStrings(dto)
    Controller->>Facade: updateMaterialGoodsReceipt(options con DTO, identificadores y actor cuando corresponde)
    Facade->>Core: updateGoodsReceipt({ ...options, type: MATERIAL })
    alt Servicio resuelto
        Core->>Helpers: buildGoodsReceiptContextWhere(type)
        Core->>Prisma: goodsReceipt.findUnique({ where: { id, ...contextWhere } })
        Core->>Invoice: assertGoodsReceiptInvoiceAvailable({ supplierId, invoice, excludeGoodsReceiptId: id }) tras validar estado, proveedor y receptor
        Core->>Prisma: getDb().$transaction(async tx => ...)
        rect rgb(245, 245, 245)
            Note over Core,Prisma: getDb().$transaction(async tx => ...)
            Core->>Prisma: tx.goodsReceipt.findUnique({ where: { id, ...contextWhere }, select: { id: true } })
            Core->>Prisma: tx.goodsReceipt.update({ where: { id, ...contextWhere }, data: headerData })
            opt Hay detalles nuevos
                Core->>Helpers: createGoodsReceiptDetailsAndUpdateTotals({ tx, details: newDetails, type, ... })
                Core->>Inventory: applyInventoryMovement({ tx, movementType: ENTRY, details: createdDetails })
            end
        end
        Prisma-->>Core: commit y compra actualizada
        opt Se agregaron detalles
            Core->>Costs: updateMaterialUnitCostIfHigher({ supplierId, materialId, conversionUnitCost })
        end
        Core-->>Facade: updateGoodsReceipt(): Promise[GoodsReceipt]
        Facade-->>Controller: updateMaterialGoodsReceipt(): Promise[GoodsReceipt]
        Controller->>Socket: emitInventoryUpdated({ context: 'material', source: 'goods-receipt-updated' })
        Controller-->>Client: HTTP 200 { goodsReceipt, code }
    else Error de dominio o persistencia
        Core-->>Facade: error — rollback si falló la transacción
        Facade-->>Controller: error propagado
        Controller->>ErrorHandler: next(error) — propagación de Express
        ErrorHandler-->>Client: HTTP de error { code, message }
    end
```
