<a id="cu-alm-13"></a>
# `CU-ALM-13` — Agregar existencia de merma

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`, `BE-P05`.

## Participantes y trazabilidad

Los nombres breves del diagrama corresponden a los archivos vinculados siguientes.
La ruta completa se conserva en cada enlace, fuera de la cabecera visual. Un participante
puede agrupar colaboradores del mismo rol; esa agrupación no implica una clase ni un
proceso independiente. Los retornos representan el resultado o error propagado.

| Alias | Rol visual | Archivos de implementación |
| --- | --- | --- |
| `Router` | boundary | [`wasteApiRoute.js`](../../../../../../src/routes/api/warehouse/wasteApiRoute.js) |
| `Auth` | control | [`authMiddleware.js`](../../../../../../src/middleware/authMiddleware.js) |
| `Validator` | control | [`wasteValidations.js`](../../../../../../src/validators/forms/wasteValidations.js)<br/>[`validatorMiddleware.js`](../../../../../../src/middleware/validatorMiddleware.js) |
| `Controller` | control | [`wasteController.js`](../../../../../../src/controllers/api/warehouse/wasteController.js) |
| `StockDto` | control | [`wasteDTO.js`](../../../../../../src/dtos/wasteDTO.js) |
| `Service` | control | [`wasteService.js`](../../../../../../src/services/warehouse/wastes/wasteService.js) |
| `Entry` | control | [`wasteStockEntryService.js`](../../../../../../src/services/warehouse/wastes/wasteStockEntryService.js) |
| `Movement` | control | [`wasteMovementService.js`](../../../../../../src/services/warehouse/wastes/wasteMovementService.js) |
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
    participant Entry@{ "type": "control" } as Entrada de stock
    participant Movement@{ "type": "control" } as Movimiento
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant Socket@{ "type": "control" } as Eventos Socket.IO

    Client->>Router: POST /api/warehouse/wastes/:id/stock-additions + accessToken
    Router->>Auth: verifyApiTokenRequired(req, res, next)
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    Router->>Validator: wasteStockAdditionValidation[] y validate(req, res, next)
    break Validación rechazada
        Validator-->>Client: HTTP 400 { errors }
    end
    Router->>Auth: authorizeUserApi(PERMISSIONS.WASTES_ADD_STOCK)(req, res, next)
    break Identidad no vigente o permiso denegado
        Auth-->>Client: HTTP 401 INVALID_AUTH o HTTP 403 FORBIDDEN
    end
    Router->>Controller: registerWasteStockAddition(req, res)
    Controller->>StockDto: createWasteDtoForStockAddition(req.body)
    activate StockDto
    StockDto-->>Controller: createWasteDtoForStockAddition(): Object (entryDto)
    deactivate StockDto
    Controller->>Service: addWasteStock({ id, entryDto, userId })
    Service->>Prisma: getDb().$transaction(async tx => ...)
    Service->>Prisma: tx.waste.findUnique({ where: { id } })
    Service->>Entry: registerWasteStockEntry({ tx, waste, quantity, observations, userId })
    Entry->>Prisma: generateYearlyReferenceNumber({ type: WASTE_STOCK_ENTRY, tx })
    Entry->>Movement: applyWasteMovement({ tx, movementType: ENTRY, details })
    Movement->>Prisma: applyWasteStockChange({ tx, id, quantityChange, convertedQuantityChange })
    Movement->>Movement: createWasteMovement({ tx, movementType: ENTRY, details })
    Movement->>Prisma: tx.wasteMovement.create({ type: ENTRY, details })
    Entry->>Prisma: tx.wasteStockEntry.create({ folio, actor, captura, saldos, movementId })
    alt Commit confirmado
        Prisma-->>Service: $transaction(): Promise[Waste]
        Service-->>Controller: addWasteStock(): Promise[Waste]
        Controller->>Socket: emitInventoryUpdated()
        Controller-->>Client: 200 { waste, code }
    else Cantidad o persistencia rechazada
        Prisma-->>Service: error Prisma
        Service-->>Controller: error de dominio tipado y rollback
        Controller-->>Client: status HTTP { code, message }
    end
```
