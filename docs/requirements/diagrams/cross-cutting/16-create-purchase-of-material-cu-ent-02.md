# 16. Crear compra de material — `CU-ENT-02`

```mermaid
sequenceDiagram
    participant Browser as Navegador
    participant MaterialController as src/controllers/api/warehouse/materialController.js
    participant Material as src/services/warehouse/materials/materialService.js
    participant ReceiptController as src/controllers/api/warehouse/goodsReceiptController.js
    participant Receipt as src/services/warehouse/goodsReceipts/goodsReceiptService.js
    participant DetailBuilder as src/services/warehouse/goodsReceipts/goodsReceiptHelpers.js
    participant Reference as src/services/document/referenceNumberService.js
    participant Inventory as src/services/inventory/movementService.js
    participant Cost as src/services/warehouse/materials/supplierMaterialService.js
    participant Prisma as Prisma / PostgreSQL

    opt Material no catalogado
        Browser->>MaterialController: POST /api/warehouse/materials { creationContext: goodsReceipt }
        MaterialController->>Material: createMaterial({ materialDto sin newStock/maxUnitCost })
        Material->>Prisma: getDb().$transaction(async tx => identidad y oferta)
        Prisma-->>Material: commit sin createStockAdjustment(...)
        Material-->>MaterialController: supplierMaterial con currentStock=0 y maxUnitCost=null
        MaterialController-->>Browser: HTTP 200 { material: supplierMaterial, code }
    end
    Browser->>ReceiptController: POST /api/warehouse/goods-receipts { req.body }
    ReceiptController->>Receipt: createGoodsReceipt({ goodsReceiptDto })
    Receipt->>DetailBuilder: buildGoodsReceiptDetails(details, { supplierId })
    Receipt->>DetailBuilder: calculateGoodsReceiptTotals(processedDetails)
    Receipt->>Prisma: getDb().$transaction(async tx => ...)
    Receipt->>Reference: generateYearlyReferenceNumber({ type, tx })
    Receipt->>Prisma: tx.goodsReceipt.create({ encabezado, totals, processedDetails })
    Receipt->>Inventory: applyInventoryMovement({ tx, reference, details, movementType: ENTRY })
    Inventory->>Prisma: tx.supplierMaterial.update(...) y tx.movement.create(...)
    Prisma-->>Receipt: commit de entrada, stock y movimientos
    Receipt->>Cost: updateMaterialUnitCostIfHigher({ supplierId, details })
    Receipt-->>ReceiptController: goodsReceipt confirmado
    ReceiptController-->>Browser: HTTP 200 { goodsReceipt, code }
```

El alta opcional de catálogo termina antes de confirmar la compra y no genera un ajuste de
existencia. El ajuste posterior del costo no se presenta como parte del límite atómico de
documento, stock y movimiento. Estas diferencias deben permanecer visibles en pruebas y
documentación.
