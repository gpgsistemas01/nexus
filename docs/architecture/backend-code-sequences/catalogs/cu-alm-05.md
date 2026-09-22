<a id="cu-alm-05"></a>
# `CU-ALM-05` — Ajustar existencia de material

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`, `BE-P05`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Router as src/routes/api/warehouse/materialApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/materialController.js
    participant StockDto as «object»<br/>materialDto<br/>src/dtos/materialDTO.js
    participant Service as src/services/warehouse/materials/materialService.js
    participant Adjustment as src/services/warehouse/adjustmentService.js
    participant Reference as src/services/document/referenceNumberService.js
    participant Stock as src/services/inventory/stockHelpers.js
    participant Movement as src/services/inventory/movementService.js
    participant SupplierMaterial as src/services/warehouse/materials/supplierMaterialService.js
    participant Prisma as Prisma / PostgreSQL
    participant Socket as src/utils/socketUtils.js

    Client->>Router: PATCH /api/warehouse/materials/:id/stock + accessToken
    Router->>Controller: editMaterialStock(req, res)
    Controller->>StockDto: createMaterialDtoForStockUpdate(req.body)
    StockDto-->>Controller: materialDto normalizado
    Controller->>Service: updateMaterialStock({ id, materialDto, userId })
    Service->>Adjustment: createStockAdjustment({ material, supplier, reason, newStock })
    Adjustment->>Prisma: getDb().$transaction(async tx => ...)
    Adjustment->>SupplierMaterial: findSupplierMaterialByIds({ tx, materialId, supplierId })
    Adjustment->>Reference: generateYearlyReferenceNumber({ type, tx })
    Adjustment->>Stock: calculateStockAdjustmentValues({ currentStock, newStock })
    Adjustment->>Prisma: tx.stockAdjustment.create({ data })
    Adjustment->>Movement: createInventoryMovement({ tx, type: ADJUSTMENT, details })
    Adjustment->>SupplierMaterial: updateSupplierMaterialStock({ tx, supplierMaterialId, quantity })
    alt Commit confirmado
        Prisma-->>Adjustment: relación actualizada
        Adjustment-->>Service: supplierMaterial actualizado
        Service-->>Controller: material
        Controller->>Socket: emitInventoryUpdated()
        Controller-->>Client: 200 { material, code }
    else Regla de stock o persistencia rechazada
        Prisma-->>Adjustment: error Prisma
        Adjustment-->>Service: error de dominio tipado y rollback
        Service-->>Controller: error propagado
        Controller-->>Client: status HTTP { code, message }
    end
```

