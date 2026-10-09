<a id="cu-ent-03"></a>
# `CU-ENT-03` — Editar compra de material

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`, `BE-P05`.

## Participantes y trazabilidad

Los nombres breves del diagrama corresponden a los archivos vinculados siguientes.
La ruta completa se conserva en cada enlace, fuera de la cabecera visual. Un participante
puede agrupar colaboradores del mismo rol; esa agrupación no implica una clase ni un
proceso independiente. Los retornos representan el resultado o error propagado.

| Alias | Rol visual | Archivos de implementación |
| --- | --- | --- |
| `Route` | boundary | [`materialGoodsReceiptApiRoute.js`](../../../../../../src/routes/api/warehouse/goodsReceipts/materials/materialGoodsReceiptApiRoute.js) |
| `Auth` | control | [`authMiddleware.js`](../../../../../../src/middleware/authMiddleware.js) |
| `Validator` | control | [`goodsReceiptValidations.js`](../../../../../../src/validators/forms/goodsReceiptValidations.js)<br/>[`validatorMiddleware.js`](../../../../../../src/middleware/validatorMiddleware.js) |
| `Controller` | control | [`materialGoodsReceiptController.js`](../../../../../../src/controllers/api/warehouse/goodsReceipts/materials/materialGoodsReceiptController.js)<br/>[`goodsReceiptHandlers.js`](../../../../../../src/controllers/api/warehouse/goodsReceipts/shared/goodsReceiptHandlers.js) |
| `Facade` | control | [`materialGoodsReceiptService.js`](../../../../../../src/services/warehouse/goodsReceipts/materials/materialGoodsReceiptService.js) |
| `Core` | control | [`goodsReceiptService.js`](../../../../../../src/services/warehouse/goodsReceipts/goodsReceiptService.js) |
| `Helpers` | control | [`goodsReceiptHelpers.js`](../../../../../../src/services/warehouse/goodsReceipts/goodsReceiptHelpers.js) |
| `Inventory` | control | [`movementService.js`](../../../../../../src/services/inventory/movementService.js) |
| `Socket` | control | [`socketUtils.js`](../../../../../../src/utils/socketUtils.js) |
| `DTO` | control | [`goodsReceiptDTO.js`](../../../../../../src/dtos/goodsReceiptDTO.js) |
| `ErrorHandler` | control | [`app.js`](../../../../../../src/app.js) |
| `Costs` | control | [`supplierMaterialService.js`](../../../../../../src/services/warehouse/materials/supplierMaterialService.js) |
| `Invoice` | control | [`goodsReceiptInvoiceService.js`](../../../../../../src/services/warehouse/goodsReceipts/goodsReceiptInvoiceService.js) |

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
    participant Validator@{ "type": "control" } as Validación HTTP
    participant Controller@{ "type": "control" } as Controller
    participant Facade@{ "type": "control" } as Adaptador del tipo
    participant Core@{ "type": "control" } as Núcleo del dominio
    participant Socket@{ "type": "control" } as Eventos Socket.IO
    participant DTO@{ "type": "control" } as DTO funcional
    participant ErrorHandler@{ "type": "control" } as Errores Express

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
    activate DTO
    DTO-->>Controller: createGoodsReceiptDtoForEdit(): Object — DTO normalizado
    deactivate DTO
    Controller->>Controller: sanitizeEmptyStrings(dto)
    Controller->>Facade: updateMaterialGoodsReceipt(options con DTO, identificadores y actor cuando corresponde)
    Facade->>Core: updateGoodsReceipt({ ...options, type: MATERIAL })
    Note over Facade,Core: Realización detallada en la colaboración de dominio
    alt Servicio resuelto
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
    participant Costs@{ "type": "control" } as Costo del material
    participant Invoice@{ "type": "control" } as Factura

    Facade->>Core: updateGoodsReceipt({ ...options, type: MATERIAL })
    activate Core
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
    else Error de dominio o persistencia
        Core-->>Facade: error — rollback si falló la transacción
    end
    deactivate Core
```
