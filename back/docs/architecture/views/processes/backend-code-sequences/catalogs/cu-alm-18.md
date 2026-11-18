<a id="cu-alm-18"></a>
# `CU-ALM-18` — Crear consumible

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`.

```mermaid
sequenceDiagram
    autonumber
    participant Client@{ "type": "boundary" } as Cliente HTTP / web
    participant Controller@{ "type": "boundary" } as consumableController.js
    participant Dto@{ "type": "control" } as DTO funcional<br/>materialDTO.js
    participant Consumable@{ "type": "control" } as consumableService.js
    participant Domain@{ "type": "control" } as materialService.js
    participant Lock@{ "type": "control" } as stockLockRepository.js
    participant Helpers@{ "type": "control" } as materialHelpers.js
    participant Offer@{ "type": "control" } as supplierMaterialService.js
    participant Reason@{ "type": "control" } as reasonService.js
    participant Adjustment@{ "type": "control" } as adjustmentService.js
    participant Db@{ "type": "database" } as Prisma / PostgreSQL
    Client->>Controller: POST autorizado y validado
    Controller->>Dto: createMaterialDtoForRegister(body)
    Dto-->>Controller: createMaterialDtoForRegister(): Object
    Controller->>Consumable: createConsumable(consumableDto, actor)
    Consumable->>Domain: createMaterial(materialDto, CONSUMABLE, actor)
    Domain->>Db: db.$transaction(async tx)
    opt materialId seleccionado
        Domain->>Lock: lockMaterialIdentity(tx, materialId)
        Lock->>Db: tx.$queryRaw(SELECT FOR KEY SHARE)
        Domain->>Db: findUnique(id, tipo)
        Db-->>Domain: findUnique(): Promise[Material]
    end
    Domain->>Helpers: prepareMaterialData(tx, identidad, proveedor)
    Helpers-->>Domain: prepareMaterialData(): Promise[Object]
    opt Captura de identidad sin materialId
        Domain->>Domain: findMaterialByIdentity(tx, rest, relations)
        Domain->>Db: tx.material.findFirst(where: identidad)
        Db-->>Domain: findFirst(): Promise[Material|null]
        opt Identidad nueva
            Domain->>Db: tx.material.create(data)
        end
    end
    alt creationContext = goodsReceipt
        Domain->>Db: tx.material.findUniqueOrThrow(id)
        Note over Domain: Resultado: identidad sin oferta ni stock
    else Alta de Almacén
        Domain->>Db: tx.supplierMaterial.findUnique(supplierId_materialId)
        Domain->>Offer: createSupplierMaterial(tx, proveedor, materialId)
        opt newStock definido
            Domain->>Reason: findInitialStockAdjustmentReason(tx)
            Reason-->>Domain: findInitialStockAdjustmentReason(): Promise[StockAdjustmentReason]
            Domain->>Adjustment: createStockAdjustment(tx, cantidad inicial, actor)
        end
        Domain->>Offer: findSupplierMaterialByIds(tx)
        Offer-->>Domain: findSupplierMaterialByIds(): Promise[SupplierMaterial]
        Note over Domain: Resultado: oferta creada
    end
    Db-->>Domain: commit
    Domain-->>Consumable: createMaterial(): Promise[Material|SupplierMaterial]
    Consumable-->>Controller: createConsumable(): Promise[Material|SupplierMaterial]
    Controller-->>Client: HTTP 200
    opt Error de validación o persistencia
        Domain-->>Controller: throw error y rollback
        Controller-->>Client: HTTP 4xx/5xx sin cambios parciales
    end
```

## Participantes y trazabilidad

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `Controller` | control | [API](../../../../../../src/controllers/api/warehouse/consumableController.js) |
| `Dto` | control | [materialDTO.js](../../../../../../src/dtos/materialDTO.js) |
| `Domain` | control | [materialService.js](../../../../../../src/services/warehouse/materials/materialService.js) |
| `Lock` | control | [stockLockRepository.js](../../../../../../src/repository/warehouse/stockLockRepository.js) |
| `Helpers` | control | [materialHelpers.js](../../../../../../src/services/warehouse/materials/materialHelpers.js) |
| `Offer` | control | [supplierMaterialService.js](../../../../../../src/services/warehouse/materials/supplierMaterialService.js) |
| `Reason` | control | [reasonService.js](../../../../../../src/services/warehouse/reasonService.js) |
| `Adjustment` | control | [adjustmentService.js](../../../../../../src/services/warehouse/adjustmentService.js) |
| `Consumable` | control | [consumableService.js](../../../../../../src/services/warehouse/consumables/consumableService.js) |
