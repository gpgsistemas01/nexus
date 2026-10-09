<a id="cu-ent-09"></a>
# `CU-ENT-09` — Editar compra de consumible

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`, `BE-P05`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.
La composición incluye también los archivos de configuración, construcción y reexport: cada
uno tiene un nodo propio, aunque no ejecute una delegación durante la petición.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `Route` | boundary | [`consumableGoodsReceiptApiRoute.js`](../../../../../../src/routes/api/warehouse/goodsReceipts/consumables/consumableGoodsReceiptApiRoute.js) |
| `Auth` | control | [`authMiddleware.js`](../../../../../../src/middleware/authMiddleware.js) |
| `Validator` | control | [`validatorMiddleware.js`](../../../../../../src/middleware/validatorMiddleware.js) |
| `Controller` | control | [`goodsReceiptHandlers.js`](../../../../../../src/controllers/api/warehouse/goodsReceipts/shared/goodsReceiptHandlers.js) |
| `Facade` | control | [`consumableGoodsReceiptService.js`](../../../../../../src/services/warehouse/goodsReceipts/consumables/consumableGoodsReceiptService.js) |
| `Core` | control | [`goodsReceiptService.js`](../../../../../../src/services/warehouse/goodsReceipts/goodsReceiptService.js) |
| `Helpers` | control | [`goodsReceiptHelpers.js`](../../../../../../src/services/warehouse/goodsReceipts/goodsReceiptHelpers.js) |
| `Inventory` | control | [`movementService.js`](../../../../../../src/services/inventory/movementService.js) |
| `Socket` | control | [`socketUtils.js`](../../../../../../src/utils/socketUtils.js) |
| `DTO` | control | [`goodsReceiptDTO.js`](../../../../../../src/dtos/goodsReceiptDTO.js) |
| `ErrorHandler` | control | [`app.js`](../../../../../../src/app.js) |
| `Costs` | control | [`supplierMaterialService.js`](../../../../../../src/services/warehouse/materials/supplierMaterialService.js) |
| `Invoice` | control | [`goodsReceiptInvoiceService.js`](../../../../../../src/services/warehouse/goodsReceipts/goodsReceiptInvoiceService.js) |
| `ValidationRules` | control | [`goodsReceiptValidations.js`](../../../../../../src/validators/forms/goodsReceiptValidations.js) |
| `Formatter` | control | [`formattersUtils.js`](../../../../../../src/utils/formattersUtils.js) |
| `FileBaseRepository` | control | [`baseRepository.js`](../../../../../../src/repository/baseRepository.js) |
| `FileConsumableGoodsReceiptController` | control | [`consumableGoodsReceiptController.js`](../../../../../../src/controllers/api/warehouse/goodsReceipts/consumables/consumableGoodsReceiptController.js) |
| `FileDatabaseUrl` | control | [`databaseUrl.js`](../../../../../../src/lib/databaseUrl.js) |
| `FilePrisma` | control | [`prisma.js`](../../../../../../src/lib/prisma.js) |
| `MovementHelpers` | control | [`movementHelpers.js`](../../../../../../src/services/inventory/movementHelpers.js) |
| `StockChecks` | control | [`stockHelpers.js`](../../../../../../src/services/inventory/stockHelpers.js) |

### Configuración y construcción

El módulo específico configura y exporta el handler generado en el archivo de la línea `Controller`: [`consumableGoodsReceiptController.js`](../../../../../../src/controllers/api/warehouse/goodsReceipts/consumables/consumableGoodsReceiptController.js).

## Composición de archivos

Los archivos que construyen, configuran o reexportan funciones aparecen como componentes
individuales. Las flechas representan imports reales, resueltos al cargar los módulos;
las llamadas durante la operación se muestran en las secuencias siguientes. Cada nombre
identifica un archivo y la tabla conserva su ruta completa.

```mermaid
flowchart TB
    subgraph Component0["Backend"]
        FileConsumableGoodsReceiptController["consumableGoodsReceiptController.js"]
        Controller["goodsReceiptHandlers.js"]
        FileDatabaseUrl["databaseUrl.js"]
        FilePrisma["prisma.js"]
        FileBaseRepository["baseRepository.js"]
        Route["consumableGoodsReceiptApiRoute.js"]
        Facade["consumableGoodsReceiptService.js"]
    end
    FileConsumableGoodsReceiptController -->|import| Facade
    FileConsumableGoodsReceiptController -->|import| Controller
    FilePrisma -->|import| FileDatabaseUrl
    FileBaseRepository -->|import| FilePrisma
    Route -->|import| FileConsumableGoodsReceiptController
```

## Construcción de funciones para esta operación

El configurador se ejecuta al evaluar su módulo. Después se invoca la función devuelta
por la fábrica, usando el nombre público mostrado en la secuencia.

| Nombre público | Archivo configurador (alias) | Archivo que construye el cuerpo (alias) |
| --- | --- | --- |
| `editConsumableGoodsReceipt` | `FileConsumableGoodsReceiptController` | `Controller` · `buildEditHandler(...)` |

## Secuencia de entrada y coordinación

El primer nivel conserva método, controles HTTP, normalización, adaptación del tipo,
respuesta y publicación. La llamada del adaptador al núcleo es la frontera que amplía
el segundo nivel; ambas figuras realizan el mismo caso, sin añadir otra operación.

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Route@{ "type": "boundary" } as consumableGoodsReceiptApiRoute.js
    participant Auth@{ "type": "control" } as authMiddleware.js
    participant ValidationRules@{ "type": "control" } as goodsReceiptValidations.js
    participant Validator@{ "type": "control" } as validatorMiddleware.js
    participant Controller@{ "type": "control" } as goodsReceiptHandlers.js

    Note over Controller: Handler generado
    Client->>Route: PATCH /api/warehouse/goods-receipts/consumables/:id
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    Route->>ValidationRules: goodsReceiptHeaderValidation[] — cadena ejecutada por Express
    Route->>Validator: validate(req, res, next)
    break Validación rechazada
        Validator-->>Client: HTTP 400 { errors }
    end
    Route->>Auth: authorizeUserApi(PERMISSIONS.GOODS_RECEIPTS_MANAGE)(req, res, next)
    break Identidad no vigente o permiso denegado
        Auth-->>Client: HTTP 401 INVALID_AUTH o HTTP 403 FORBIDDEN
    end
    Route->>Controller: editConsumableGoodsReceipt(req, res)
        Controller-->>Client: HTTP 200 { goodsReceipt, code }
```

## Detalle de coordinación del controller

Continúa la colaboración anterior. Conserva el orden de los mensajes del código y
separa los archivos que ejecutan esta parte del recorrido; los otros detalles del caso
completan las llamadas a helpers y la propagación del resultado.

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Controller@{ "type": "control" } as goodsReceiptHandlers.js
    participant Formatter@{ "type": "control" } as formattersUtils.js
    participant Facade@{ "type": "control" } as consumableGoodsReceiptService.js
    participant Core@{ "type": "control" } as goodsReceiptService.js
    participant Socket@{ "type": "control" } as socketUtils.js
    participant DTO@{ "type": "control" } as DTO funcional<br/>goodsReceiptDTO.js
    participant ErrorHandler@{ "type": "control" } as app.js

    Note over Controller: Handler generado
    Controller->>DTO: createGoodsReceiptDtoForEdit(req.body)
    activate DTO
    DTO-->>Controller: createGoodsReceiptDtoForEdit(): Object — DTO normalizado
    deactivate DTO
    Controller->>Formatter: sanitizeEmptyStrings(dto)
    Controller->>Facade: updateConsumableGoodsReceipt(options con DTO, identificadores y actor cuando corresponde)
    Facade->>Core: updateGoodsReceipt({ ...options, type: CONSUMABLE })
    Note over Facade,Core: Realización detallada en la colaboración de dominio
    alt Servicio resuelto
        Core-->>Facade: updateGoodsReceipt(): Promise[GoodsReceipt]
        Facade-->>Controller: updateConsumableGoodsReceipt(): Promise[GoodsReceipt]
        Controller->>Socket: emitInventoryUpdated({ context: 'consumable', source: 'goods-receipt-updated' })
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
    participant Facade@{ "type": "control" } as consumableGoodsReceiptService.js
    participant Core@{ "type": "control" } as goodsReceiptService.js
    participant Helpers@{ "type": "control" } as goodsReceiptHelpers.js
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant Inventory@{ "type": "control" } as movementService.js
    participant Costs@{ "type": "control" } as supplierMaterialService.js
    participant Invoice@{ "type": "control" } as goodsReceiptInvoiceService.js

    participant FileBaseRepository@{ "type": "control" } as baseRepository.js

    Facade->>Core: updateGoodsReceipt({ ...options, type: CONSUMABLE })
    activate Core
    alt Servicio resuelto
        Core->>Helpers: buildGoodsReceiptContextWhere(type)
        Core->>Prisma: goodsReceipt.findUnique({ where: { id, ...contextWhere } })
        Core->>Invoice: assertGoodsReceiptInvoiceAvailable({ supplierId, invoice, excludeGoodsReceiptId: id }) tras validar estado, proveedor y receptor
        Core->>FileBaseRepository: getDb()
        FileBaseRepository-->>Core: getDb(): PrismaClient | TransactionClient — tx si se recibió
        Core->>Prisma: db.$transaction(async tx => ...)
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

## Detalle de preparación del movimiento de inventario

Amplía `applyInventoryMovement`. La búsqueda de relaciones se omite cuando el caller
ya proporciona `supplierMaterials`. Las salidas comprueban suficiencia; las entradas
usan cantidades positivas. Todos los colaboradores reciben el mismo `tx`.

```mermaid
sequenceDiagram
    autonumber
    participant Inventory@{ "type": "control" } as movementService.js
    participant MovementHelpers@{ "type": "control" } as movementHelpers.js
    participant Costs@{ "type": "control" } as supplierMaterialService.js
    participant Formatter@{ "type": "control" } as formattersUtils.js
    participant StockChecks@{ "type": "control" } as stockHelpers.js

    Note over Inventory: Recorre details y comprueba materialId y supplierId antes de agrupar
    Inventory->>MovementHelpers: buildStockUpdateSummary({ details })
    MovementHelpers->>Formatter: buildStockKey(materialId, supplierId)
    MovementHelpers->>Formatter: normalizeDecimal(quantity)
    MovementHelpers-->>Inventory: buildStockUpdateSummary(): Object — stockKeys y grouped
    opt supplierMaterials no proporcionado
        Inventory->>Costs: findSupplierMaterialsForStockMovement({ tx, where })
        Costs-->>Inventory: findSupplierMaterialsForStockMovement(): Promise[SupplierMaterial[]]
    end
    loop Cada detalle del movimiento
        Inventory->>Formatter: buildStockKey(detail.materialId, detail.supplierId)
        break Relación proveedor-material no encontrada
            Inventory-->>Inventory: throw GoodsIssueInexistentStock
        end
        Inventory->>Formatter: hasMaterialDimensions(ps.material)
        Inventory->>Formatter: normalizeDecimal(detail.quantity)
        Inventory->>StockChecks: calculateConvertedQuantity({ quantity, base, height })
        StockChecks-->>Inventory: calculateConvertedQuantity(): number
        opt movementType es ISSUE
            Inventory->>StockChecks: assertSufficientStock({ material, newStock, requestedQuantity })
        end
        Inventory->>MovementHelpers: buildInventoryMovementDetail({ quantity: signedQuantity, previousStock, newStock, materialId, supplierId })
        MovementHelpers-->>Inventory: buildInventoryMovementDetail(): Object
    end
```

## Detalle de escritura del movimiento y las existencias

Continúa con `movementDetails` y el resumen anterior. Primero se registra el movimiento;
después se actualizan las existencias agrupadas. Un fallo revierte ambas escrituras
cuando el caller las ejecuta dentro de su transacción.

```mermaid
sequenceDiagram
    autonumber
    participant Inventory@{ "type": "control" } as movementService.js
    participant Costs@{ "type": "control" } as supplierMaterialService.js
    participant FileBaseRepository@{ "type": "control" } as baseRepository.js
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant StockChecks@{ "type": "control" } as stockHelpers.js

    Inventory->>Inventory: createInventoryMovement({ tx, reference, details: movementDetails, movementType })
    Inventory->>FileBaseRepository: getDb(tx)
    FileBaseRepository-->>Inventory: getDb(): TransactionClient — tx del caller
    Inventory->>Prisma: db.inventoryMovement.create({ data, include: { details: true } })
    Prisma-->>Inventory: create(): Promise[InventoryMovement]
    Inventory->>Costs: updateSupplierMaterialStock({ tx, grouped, movementType, supplierMaterials })
    Costs->>FileBaseRepository: getDb(tx)
    FileBaseRepository-->>Costs: getDb(): TransactionClient — mismo tx
    loop Cada relación agrupada material-proveedor
        Costs->>StockChecks: calculateConvertedQuantity({ quantity, base, height })
        alt movementType es ENTRY
            Costs->>Prisma: db.supplierMaterial.update({ where, data: { currentStock: { increment: quantity } } })
        else Movimiento de salida
            Costs->>Prisma: db.supplierMaterial.updateMany({ where: { currentStock: { gte: quantity } }, data })
            break result.count menor que 1
                Costs-->>Inventory: throw GoodsIssueInsufficientStock
            end
        end
    end
    Costs-->>Inventory: updateSupplierMaterialStock(): Promise[void]
```
