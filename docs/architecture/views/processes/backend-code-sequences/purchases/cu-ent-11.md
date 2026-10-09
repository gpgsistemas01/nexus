<a id="cu-ent-11"></a>
# `CU-ENT-11` — Cancelar consumible de una compra

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`, `BE-P05`.

## Participantes y trazabilidad

Los nombres breves del diagrama corresponden a los archivos vinculados siguientes.
La ruta completa se conserva en cada enlace, fuera de la cabecera visual. Un participante
puede agrupar colaboradores del mismo rol; esa agrupación no implica una clase ni un
proceso independiente. Los retornos representan el resultado o error propagado.

| Alias | Rol visual | Archivos de implementación |
| --- | --- | --- |
| `Route` | boundary | [`consumableGoodsReceiptApiRoute.js`](../../../../../../src/routes/api/warehouse/goodsReceipts/consumables/consumableGoodsReceiptApiRoute.js) |
| `Auth` | control | [`authMiddleware.js`](../../../../../../src/middleware/authMiddleware.js) |
| `Controller` | control | [`consumableGoodsReceiptController.js`](../../../../../../src/controllers/api/warehouse/goodsReceipts/consumables/consumableGoodsReceiptController.js)<br/>[`goodsReceiptHandlers.js`](../../../../../../src/controllers/api/warehouse/goodsReceipts/shared/goodsReceiptHandlers.js) |
| `Facade` | control | [`consumableGoodsReceiptService.js`](../../../../../../src/services/warehouse/goodsReceipts/consumables/consumableGoodsReceiptService.js) |
| `Core` | control | [`goodsReceiptCancellationService.js`](../../../../../../src/services/warehouse/goodsReceipts/detailChanges/goodsReceiptCancellationService.js) |
| `Helpers` | control | [`goodsReceiptHelpers.js`](../../../../../../src/services/warehouse/goodsReceipts/goodsReceiptHelpers.js) |
| `Inventory` | control | [`movementService.js`](../../../../../../src/services/inventory/movementService.js) |
| `Socket` | control | [`socketUtils.js`](../../../../../../src/utils/socketUtils.js) |
| `Change` | control | [`goodsReceiptDetailChangeService.js`](../../../../../../src/services/warehouse/goodsReceipts/detailChanges/goodsReceiptDetailChangeService.js) |
| `Reason` | control | [`reasonService.js`](../../../../../../src/services/warehouse/reasonService.js) |
| `Costs` | control | [`supplierMaterialService.js`](../../../../../../src/services/warehouse/materials/supplierMaterialService.js) |
| `ErrorHandler` | control | [`app.js`](../../../../../../src/app.js) |

## Secuencia de entrada y coordinación

El primer nivel conserva método, controles HTTP, normalización, adaptación del tipo,
respuesta y publicación. La llamada del adaptador al núcleo es la frontera que amplía
el segundo nivel; ambas figuras realizan el mismo caso, sin añadir otra operación.

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Route@{ "type": "boundary" } as Router API
    participant Auth@{ "type": "control" } as Acceso
    participant Controller@{ "type": "control" } as Controller
    participant Facade@{ "type": "control" } as Adaptador del tipo
    participant Core@{ "type": "control" } as Núcleo del dominio
    participant Socket@{ "type": "control" } as Eventos Socket.IO
    participant ErrorHandler@{ "type": "control" } as Errores Express

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
    Note over Facade,Core: Realización detallada en la colaboración de dominio
    alt Servicio resuelto
        rect rgb(245, 245, 245)
            Core->>Core: findReceiptDetailForChange() — comprobar existencia y estado ACTIVE
        end
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

## Colaboración interna del dominio

Este nivel amplía la invocación `Facade → Core` anterior. Conserva consultas, reglas,
helpers y contexto de persistencia. Su error retorna al adaptador y se propaga según
la primera figura; los mensajes se numeran de nuevo dentro de esta colaboración.

```mermaid
sequenceDiagram
    autonumber
    participant Facade@{ "type": "control" } as Adaptador del tipo
    participant Core@{ "type": "control" } as Núcleo del dominio
    participant Helpers@{ "type": "control" } as Helpers del dominio
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant Inventory@{ "type": "control" } as Inventario
    participant Change@{ "type": "control" } as Change
    participant Reason@{ "type": "control" } as Motivo de ajuste
    participant Costs@{ "type": "control" } as Costo del material

    Facade->>Core: cancelGoodsReceiptDetailLine({ ...options, type: CONSUMABLE })
    activate Core
    alt Servicio resuelto
        Core->>Prisma: getDb().$transaction(async tx => ...)
        rect rgb(245, 245, 245)
            Note over Core,Prisma: getDb().$transaction(async tx => ...)
            Core->>Change: findReceiptDetailForChange({ tx, goodsReceiptId: id, detailId, type })
            Change->>Prisma: goodsReceiptDetail.findFirst({ where: { id: detailId, goodsReceiptId: id, goodsReceipt: contextWhere } })
            activate Prisma
            Prisma-->>Change: findFirst(): Promise[GoodsReceiptDetail|null]
            deactivate Prisma
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
    else Error de dominio o persistencia
        Core-->>Facade: error — rollback si falló la transacción
    end
    deactivate Core
```
