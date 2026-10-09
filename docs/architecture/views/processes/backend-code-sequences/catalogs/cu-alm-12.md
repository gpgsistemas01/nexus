<a id="cu-alm-12"></a>
# `CU-ALM-12` — Ajustar existencia de merma

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`, `BE-P05`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `Router` | boundary | [`wasteApiRoute.js`](../../../../../../src/routes/api/warehouse/wasteApiRoute.js) |
| `Auth` | control | [`authMiddleware.js`](../../../../../../src/middleware/authMiddleware.js) |
| `Validator` | control | [`validatorMiddleware.js`](../../../../../../src/middleware/validatorMiddleware.js) |
| `Controller` | control | [`wasteController.js`](../../../../../../src/controllers/api/warehouse/wasteController.js) |
| `StockDto` | control | [`wasteDTO.js`](../../../../../../src/dtos/wasteDTO.js) |
| `Service` | control | [`wasteService.js`](../../../../../../src/services/warehouse/wastes/wasteService.js) |
| `Adjustment` | control | [`wasteStockAdjustmentService.js`](../../../../../../src/services/warehouse/wastes/wasteStockAdjustmentService.js) |
| `Reference` | control | [`referenceNumberService.js`](../../../../../../src/services/document/referenceNumberService.js) |
| `Stock` | control | [`stockHelpers.js`](../../../../../../src/services/inventory/stockHelpers.js) |
| `Movement` | control | [`wasteMovementService.js`](../../../../../../src/services/warehouse/wastes/wasteMovementService.js) |
| `Socket` | control | [`socketUtils.js`](../../../../../../src/utils/socketUtils.js) |
| `ValidationRules` | control | [`wasteValidations.js`](../../../../../../src/validators/forms/wasteValidations.js) |

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
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant Socket@{ "type": "control" } as Eventos Socket.IO

    Client->>Router: PATCH /api/warehouse/wastes/:id/stock + accessToken
    Router->>Auth: verifyApiTokenRequired(req, res, next)
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    Router->>ValidationRules: wasteStockValidation[] — cadena ejecutada por Express
    Router->>Validator: validate(req, res, next)
    break Validación rechazada
        Validator-->>Client: HTTP 400 { errors }
    end
    Router->>Auth: authorizeUserApi(PERMISSIONS.WASTES_ADJUST_STOCK)(req, res, next)
    break Identidad no vigente o permiso denegado
        Auth-->>Client: HTTP 401 INVALID_AUTH o HTTP 403 FORBIDDEN
    end
    Router->>Controller: editWasteStock(req, res)
    Controller->>StockDto: createWasteDtoForStockUpdate(req.body)
    activate StockDto
    StockDto-->>Controller: createWasteDtoForStockUpdate(): Object (wasteStockDto)
    deactivate StockDto
    Controller->>Service: updateWasteStock({ id, wasteStockDto, userId })
    Service->>Prisma: getDb().$transaction(async tx => ...)
    Service->>Prisma: tx.waste.findUnique({ where: { id } })
    Service->>Adjustment: registerWasteStockAdjustment({ tx, waste, wasteStockDto, userId })
    Adjustment->>Stock: calculateStockAdjustmentValues({ currentStock, newStock })
    Adjustment->>Reference: generateYearlyReferenceNumber({ type, tx })
    Adjustment->>Prisma: tx.wasteStockAdjustment.create({ data })
    Adjustment->>Movement: createWasteMovement({ tx, type: ADJUSTMENT, details })
    Adjustment->>Prisma: tx.waste.update({ where, data })
    alt Commit confirmado
        Prisma-->>Service: $transaction(): Promise[Waste]
        Service-->>Controller: updateWasteStock(): Promise[Waste]
        Controller->>Socket: emitInventoryUpdated()
        Controller-->>Client: 200 { waste, code }
    else Regla de stock o persistencia rechazada
        Prisma-->>Service: error Prisma
        Service-->>Controller: error de dominio tipado y rollback
        Controller-->>Client: status HTTP { code, message }
    end
```
