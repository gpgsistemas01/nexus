<a id="cu-alm-21"></a>
# `CU-ALM-21` — Ajustar existencia de consumible

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`, `BE-P05`.

## Participantes y trazabilidad

Los nombres breves del diagrama corresponden a los archivos vinculados siguientes.
La ruta completa se conserva en cada enlace, fuera de la cabecera visual. Un participante
puede agrupar colaboradores del mismo rol; esa agrupación no implica una clase ni un
proceso independiente. Los retornos representan el resultado o error propagado.

| Alias | Rol visual | Archivos de implementación |
| --- | --- | --- |
| `Router` | boundary | [`consumableApiRoute.js`](../../../../../../src/routes/api/warehouse/consumableApiRoute.js) |
| `Auth` | control | [`authMiddleware.js`](../../../../../../src/middleware/authMiddleware.js) |
| `Validator` | control | [`materialValidations.js`](../../../../../../src/validators/forms/materialValidations.js)<br/>[`validatorMiddleware.js`](../../../../../../src/middleware/validatorMiddleware.js) |
| `Controller` | control | [`consumableController.js`](../../../../../../src/controllers/api/warehouse/consumableController.js) |
| `StockDto` | control | [`materialDTO.js`](../../../../../../src/dtos/materialDTO.js) |
| `Service` | control | [`consumableService.js`](../../../../../../src/services/warehouse/consumables/consumableService.js) |
| `Adjustment` | control | [`adjustmentService.js`](../../../../../../src/services/warehouse/adjustmentService.js) |
| `Reference` | control | [`referenceNumberService.js`](../../../../../../src/services/document/referenceNumberService.js) |
| `Stock` | control | [`stockHelpers.js`](../../../../../../src/services/inventory/stockHelpers.js) |
| `Movement` | control | [`movementService.js`](../../../../../../src/services/inventory/movementService.js) |
| `SupplierMaterial` | control | [`supplierMaterialService.js`](../../../../../../src/services/warehouse/materials/supplierMaterialService.js) |
| `MaterialService` | control | [`materialService.js`](../../../../../../src/services/warehouse/materials/materialService.js) |
| `Socket` | control | [`socketUtils.js`](../../../../../../src/utils/socketUtils.js) |

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Router@{ "type": "boundary" } as Router web
    participant Auth@{ "type": "control" } as Acceso
    participant Validator@{ "type": "control" } as Validación HTTP
    participant Controller@{ "type": "control" } as Controller
    participant StockDto@{ "type": "control" } as DTO funcional
    participant Service@{ "type": "control" } as Service
    participant Adjustment@{ "type": "control" } as Ajuste
    participant Reference@{ "type": "control" } as Folio documental
    participant Stock@{ "type": "control" } as Existencias
    participant Movement@{ "type": "control" } as Movimiento
    participant SupplierMaterial@{ "type": "control" } as Proveedor / material
    participant MaterialService@{ "type": "control" } as Servicio de material
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant Socket@{ "type": "control" } as Eventos Socket.IO

    Client->>Router: PATCH /api/warehouse/consumables/:id/stock + accessToken
    Router->>Auth: verifyApiTokenRequired(req, res, next)
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    Router->>Validator: materialStockValidation[] y validate(req, res, next)
    break Validación rechazada
        Validator-->>Client: HTTP 400 { errors }
    end
    Router->>Auth: authorizeUserApi(PERMISSIONS.MATERIALS_ADJUST_STOCK)(req, res, next)
    break Identidad no vigente o permiso denegado
        Auth-->>Client: HTTP 401 INVALID_AUTH o HTTP 403 FORBIDDEN
    end
    Router->>Controller: editConsumableStock(req, res)
    Controller->>StockDto: createMaterialDtoForStockUpdate(req.body)
    activate StockDto
    StockDto-->>Controller: createMaterialDtoForStockUpdate(): Object (materialDto)
    deactivate StockDto
    Controller->>Service: updateConsumableStock({ id, consumableDto: materialDto, userId })
    Service->>MaterialService: updateMaterialStock({ id, materialDto, userId, type: CONSUMABLE })
    MaterialService->>MaterialService: existsMaterial({ id, type: CONSUMABLE })
    MaterialService->>Adjustment: createStockAdjustment({ material, supplier, reason, newStock })
    Adjustment->>Prisma: getDb().$transaction(async tx => ...)
    Adjustment->>SupplierMaterial: findSupplierMaterialByIds({ tx, materialId, supplierId })
    Adjustment->>Reference: generateYearlyReferenceNumber({ type, tx })
    Adjustment->>Stock: calculateConvertedQuantity({ quantity: newStock, unitMeasure, presentation, base, height })
    Adjustment->>Prisma: tx.stockAdjustment.create({ data })
    Adjustment->>Movement: createInventoryMovement({ tx, movementType: ADJUSTMENT, reference, details })
    Adjustment->>SupplierMaterial: adjustSupplierMaterialStock({ tx, materialId, supplierId, newStock, newConvertedQuantity })
    alt Commit confirmado
        Prisma-->>Adjustment: $transaction(): Promise[SupplierMaterial]
        Adjustment-->>MaterialService: createStockAdjustment(): Promise[SupplierMaterial]
        MaterialService-->>Service: updateMaterialStock(): Promise[SupplierMaterial]
        Service-->>Controller: updateConsumableStock(): Promise[SupplierMaterial]
        Controller->>Socket: emitInventoryUpdated()
        Controller-->>Client: 200 { material, code }
    else Regla de stock o persistencia rechazada
        Prisma-->>Adjustment: error Prisma
        Adjustment-->>MaterialService: error de dominio tipado y rollback
        MaterialService-->>Service: throw AppError
        Service-->>Controller: error propagado
        Controller-->>Client: status HTTP { code, message }
    end
```
