<a id="cu-alm-05"></a>
# `CU-ALM-05` — Ajustar existencia de material

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`, `BE-P05`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `Router` | boundary | [`materialApiRoute.js`](../../../../../../src/routes/api/warehouse/materialApiRoute.js) |
| `Auth` | control | [`authMiddleware.js`](../../../../../../src/middleware/authMiddleware.js) |
| `Validator` | control | [`validatorMiddleware.js`](../../../../../../src/middleware/validatorMiddleware.js) |
| `Controller` | control | [`materialController.js`](../../../../../../src/controllers/api/warehouse/materialController.js) |
| `StockDto` | control | [`materialDTO.js`](../../../../../../src/dtos/materialDTO.js) |
| `Service` | control | [`materialService.js`](../../../../../../src/services/warehouse/materials/materialService.js) |
| `Adjustment` | control | [`adjustmentService.js`](../../../../../../src/services/warehouse/adjustmentService.js) |
| `Reference` | control | [`referenceNumberService.js`](../../../../../../src/services/document/referenceNumberService.js) |
| `Stock` | control | [`stockHelpers.js`](../../../../../../src/services/inventory/stockHelpers.js) |
| `Movement` | control | [`movementService.js`](../../../../../../src/services/inventory/movementService.js) |
| `SupplierMaterial` | control | [`supplierMaterialService.js`](../../../../../../src/services/warehouse/materials/supplierMaterialService.js) |
| `Socket` | control | [`socketUtils.js`](../../../../../../src/utils/socketUtils.js) |
| `ValidationRules` | control | [`materialValidations.js`](../../../../../../src/validators/forms/materialValidations.js) |

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Router@{ "type": "boundary" } as Router web
    participant Auth@{ "type": "control" } as Acceso
    participant ValidationRules@{ "type": "control" } as Reglas de entrada
    participant Validator@{ "type": "control" } as Validación HTTP
    participant Controller@{ "type": "control" } as Controller
    participant StockDto@{ "type": "control" } as DTO funcional
    participant Service@{ "type": "control" } as Service
    participant Adjustment@{ "type": "control" } as Ajuste
    participant Reference@{ "type": "control" } as Folio documental
    participant Stock@{ "type": "control" } as Existencias
    participant Movement@{ "type": "control" } as Movimiento
    participant SupplierMaterial@{ "type": "control" } as Proveedor / material
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant Socket@{ "type": "control" } as Eventos Socket.IO

    Client->>Router: PATCH /api/warehouse/materials/:id/stock + accessToken
    Router->>Auth: verifyApiTokenRequired(req, res, next)
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    Router->>ValidationRules: materialStockValidation[] — cadena ejecutada por Express
    Router->>Validator: validate(req, res, next)
    break Validación rechazada
        Validator-->>Client: HTTP 400 { errors }
    end
    Router->>Auth: authorizeUserApi(PERMISSIONS.MATERIALS_ADJUST_STOCK)(req, res, next)
    break Identidad no vigente o permiso denegado
        Auth-->>Client: HTTP 401 INVALID_AUTH o HTTP 403 FORBIDDEN
    end
    Router->>Controller: editMaterialStock(req, res)
    Controller->>StockDto: createMaterialDtoForStockUpdate(req.body)
    activate StockDto
    StockDto-->>Controller: createMaterialDtoForStockUpdate(): Object (materialDto)
    deactivate StockDto
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
        Prisma-->>Adjustment: $transaction(): Promise[SupplierMaterial]
        Adjustment-->>Service: createStockAdjustment(): Promise[SupplierMaterial]
        Service-->>Controller: updateMaterialStock(): Promise[Material]
        Controller->>Socket: emitInventoryUpdated()
        Controller-->>Client: 200 { material, code }
    else Regla de stock o persistencia rechazada
        Prisma-->>Adjustment: error Prisma
        Adjustment-->>Service: error de dominio tipado y rollback
        Service-->>Controller: error propagado
        Controller-->>Client: status HTTP { code, message }
    end
```

