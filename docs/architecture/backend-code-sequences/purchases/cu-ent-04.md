<a id="cu-ent-04"></a>
# `CU-ENT-04` — Corregir material de una compra

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`, `BE-P05`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Router as src/routes/api/warehouse/goodsReceiptApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/goodsReceiptController.js
    participant CorrectionDto as «object»<br/>correctionDto<br/>src/dtos/goodsReceiptDTO.js
    participant Service as src/services/warehouse/goodsReceipts/detailChanges/goodsReceiptCorrectionService.js
    participant Change as src/services/warehouse/goodsReceipts/detailChanges/goodsReceiptDetailChangeService.js
    participant Reason as src/services/warehouse/reasonService.js
    participant Inventory as src/services/inventory/movementService.js
    participant Prisma as Prisma / PostgreSQL
    participant Socket as src/utils/socketUtils.js

    Client->>Router: PATCH /api/warehouse/goods-receipts/:id/details/:detailId/corrections + accessToken
    Router->>Controller: correctGoodsReceiptDetail(req, res)
    Controller->>CorrectionDto: createGoodsReceiptDtoForCorrection(req.body)
    CorrectionDto-->>Controller: correctionDto normalizado
    Controller->>Service: correctGoodsReceiptDetailLine({ id, detailId, correctionDto, userId })
    Service->>Prisma: getDb().$transaction(async tx => ...)
    Service->>Change: findReceiptDetailForChange({ tx, goodsReceiptId, detailId })
    Service->>Reason: findGoodsReceiptDetailChangeReason({ changeType, tx })
    Service->>Change: correctGoodsReceiptDetailAndTotals({ tx, goodsReceiptId, detailId, correctedDetail })
    Change->>Inventory: createGoodsReceiptDetailChangeMovementAndUpdateStock({ tx, detail, quantityDifference })
    Service->>Change: createGoodsReceiptDetailChange({ tx, previousDetail, correctedDetail, userId })
    alt Commit confirmado
        Prisma-->>Service: entrada corregida
        Service-->>Controller: goodsReceipt y correction
        Controller->>Socket: emitInventoryUpdated()
        Controller-->>Client: 200 { goodsReceipt, correction, code }
    else Detalle, motivo o persistencia rechazados
        Prisma-->>Service: error de dominio o persistencia
        Service-->>Controller: error tipado y rollback
        Controller-->>Client: status HTTP { code, message }
    end
```

