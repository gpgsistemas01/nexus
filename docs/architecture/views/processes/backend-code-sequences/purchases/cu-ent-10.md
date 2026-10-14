<a id="cu-ent-10"></a>
# `CU-ENT-10` — Corregir consumible de una compra

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
| `Core` | control | [`goodsReceiptCorrectionService.js`](../../../../../../src/services/warehouse/goodsReceipts/detailChanges/goodsReceiptCorrectionService.js) |
| `Helpers` | control | [`goodsReceiptHelpers.js`](../../../../../../src/services/warehouse/goodsReceipts/goodsReceiptHelpers.js) |
| `Inventory` | control | [`movementService.js`](../../../../../../src/services/inventory/movementService.js) |
| `Socket` | control | [`socketUtils.js`](../../../../../../src/utils/socketUtils.js) |
| `DTO` | control | [`goodsReceiptDTO.js`](../../../../../../src/dtos/goodsReceiptDTO.js) |
| `Change` | control | [`goodsReceiptDetailChangeService.js`](../../../../../../src/services/warehouse/goodsReceipts/detailChanges/goodsReceiptDetailChangeService.js) |
| `Reason` | control | [`reasonService.js`](../../../../../../src/services/warehouse/reasonService.js) |
| `Costs` | control | [`supplierMaterialService.js`](../../../../../../src/services/warehouse/materials/supplierMaterialService.js) |
| `ErrorHandler` | control | [`app.js`](../../../../../../src/app.js) |
| `ValidationRules` | control | [`goodsReceiptValidations.js`](../../../../../../src/validators/forms/goodsReceiptValidations.js) |
| `Formatter` | control | [`formattersUtils.js`](../../../../../../src/utils/formattersUtils.js) |
| `FileBaseRepository` | control | [`baseRepository.js`](../../../../../../src/repository/baseRepository.js) |
| `FileConsumableGoodsReceiptController` | control | [`consumableGoodsReceiptController.js`](../../../../../../src/controllers/api/warehouse/goodsReceipts/consumables/consumableGoodsReceiptController.js) |
| `FileDatabaseUrl` | control | [`databaseUrl.js`](../../../../../../src/lib/databaseUrl.js) |
| `FilePrisma` | control | [`prisma.js`](../../../../../../src/lib/prisma.js) |
| `Materials` | control | [`materialService.js`](../../../../../../src/services/warehouse/materials/materialService.js) |
| `Conversion` | control | [`stockHelpers.js`](../../../../../../src/services/inventory/stockHelpers.js) |

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
| `correctConsumableGoodsReceiptDetail` | `FileConsumableGoodsReceiptController` | `Controller` · `buildCorrectionHandler(...)` |

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
    Client->>Route: PATCH /api/warehouse/goods-receipts/consumables/:id/details/:detailId/corrections
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    Route->>ValidationRules: goodsReceiptCorrectionValidation[] — cadena ejecutada por Express
    Route->>Validator: validate(req, res, next)
    break Validación rechazada
        Validator-->>Client: HTTP 400 { errors }
    end
    Route->>Auth: authorizeUserApi(PERMISSIONS.GOODS_RECEIPTS_MANAGE)(req, res, next)
    break Identidad no vigente o permiso denegado
        Auth-->>Client: HTTP 401 INVALID_AUTH o HTTP 403 FORBIDDEN
    end
    Route->>Controller: correctConsumableGoodsReceiptDetail(req, res)
        Controller-->>Client: HTTP 200 { correction, code }
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
    participant Core@{ "type": "control" } as goodsReceiptCorrectionService.js
    participant Socket@{ "type": "control" } as socketUtils.js
    participant DTO@{ "type": "control" } as DTO funcional<br/>goodsReceiptDTO.js
    participant ErrorHandler@{ "type": "control" } as app.js

    participant Change@{ "type": "control" } as goodsReceiptDetailChangeService.js

    Note over Controller: Handler generado
    Controller->>DTO: createGoodsReceiptDtoForCorrection(req.body)
    activate DTO
    DTO-->>Controller: createGoodsReceiptDtoForCorrection(): Object — DTO normalizado
    deactivate DTO
    Controller->>Formatter: sanitizeEmptyStrings(dto)
    Controller->>Facade: correctConsumableGoodsReceiptDetailLine(options con DTO, identificadores y actor cuando corresponde)
    Facade->>Core: correctGoodsReceiptDetailLine({ ...options, type: CONSUMABLE })
    Note over Facade,Core: Realización detallada en la colaboración de dominio
    alt Servicio resuelto
        rect rgb(245, 245, 245)
            Core->>Change: findReceiptDetailForChange() — comprobar existencia y estado ACTIVE
            Change-->>Core: findReceiptDetailForChange(): Promise[Object]
            Core->>Formatter: normalizeDecimal(correctedDetail.quantity) — validar cantidad y cambios
            Formatter-->>Core: normalizeDecimal(): number
    end
        Core-->>Facade: correctGoodsReceiptDetailLine(): Promise[{ updatedDetail, updatedReceipt, detailChange, movement }]
        Facade-->>Controller: correctConsumableGoodsReceiptDetailLine(): Promise[{ updatedDetail, updatedReceipt, detailChange, movement }]
        Controller->>Socket: emitInventoryUpdated({ context: 'consumable', source: 'goods-receipt-detail-corrected' })
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
    participant Facade@{ "type": "control" } as consumableGoodsReceiptService.js
    participant Core@{ "type": "control" } as goodsReceiptCorrectionService.js
    participant Helpers@{ "type": "control" } as goodsReceiptHelpers.js
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant Inventory@{ "type": "control" } as movementService.js
    participant Change@{ "type": "control" } as goodsReceiptDetailChangeService.js
    participant Reason@{ "type": "control" } as reasonService.js
    participant Costs@{ "type": "control" } as supplierMaterialService.js

    participant Formatter@{ "type": "control" } as formattersUtils.js

    participant FileBaseRepository@{ "type": "control" } as baseRepository.js

    Facade->>Core: correctGoodsReceiptDetailLine({ ...options, type: CONSUMABLE })
    activate Core
    alt Servicio resuelto
        Core->>FileBaseRepository: getDb()
        FileBaseRepository-->>Core: getDb(): PrismaClient | TransactionClient — tx si se recibió
        Core->>Prisma: db.$transaction(async tx => ...)
        rect rgb(245, 245, 245)
            Note over Core,Prisma: getDb().$transaction(async tx => ...)
            Core->>Change: findReceiptDetailForChange({ tx, goodsReceiptId: id, detailId, type })
            Change->>Prisma: goodsReceiptDetail.findFirst({ where: { id: detailId, goodsReceiptId: id, goodsReceipt: contextWhere } })
            activate Prisma
            Prisma-->>Change: findFirst(): Promise[GoodsReceiptDetail|null]
            deactivate Prisma
            Change-->>Core: findReceiptDetailForChange(): Promise[GoodsReceiptDetail|null]
            Core->>Change: findReceiptDetailForChange() — comprobar existencia y estado ACTIVE
            Change-->>Core: findReceiptDetailForChange(): Promise[Object]
            Core->>Helpers: buildGoodsReceiptDetails([{ materialId, quantity, costPerUnitType }], { tx, requireActive: false })
            Core->>Formatter: normalizeDecimal(correctedDetail.quantity) — validar cantidad y cambios
            Formatter-->>Core: normalizeDecimal(): number
            Core->>Reason: findGoodsReceiptDetailChangeReason({ tx, changeType })
            Core->>Change: createGoodsReceiptDetailChangeMovementAndUpdateStock({ tx, currentDetail, quantityDifference, ... })
            opt Diferencia de cantidad distinta de cero
                Change->>Inventory: createInventoryMovement({ tx, movementType: ADJUSTMENT, ... })
                Change->>Costs: adjustSupplierMaterialStock({ tx, ... })
            end
            Core->>Helpers: correctGoodsReceiptDetailAndTotals({ tx, goodsReceiptId: id, detailId, ... })
            Core->>Change: createGoodsReceiptDetailChange({ tx, changedById: userId, ... })
        end
        Prisma-->>Core: commit de detalle, totales, trazabilidad y stock
        Core->>Costs: recalculateMaterialUnitCosts({ supplierId, materialIds })
        Core-->>Facade: correctGoodsReceiptDetailLine(): Promise[{ updatedDetail, updatedReceipt, detailChange, movement }]
    else Error de dominio o persistencia
        Core-->>Facade: error — rollback si falló la transacción
    end
    deactivate Core
```

## Detalle de preparación de partidas de compra

Amplía `buildGoodsReceiptDetails`: la consulta usa `tx` cuando se proporciona. En el alta
la preparación ocurre antes de iniciar la transacción; no se atribuye esa lectura al
callback transaccional. Los conflictos se propagan al servicio que llamó al helper.

```mermaid
sequenceDiagram
    autonumber
    participant Helpers@{ "type": "control" } as goodsReceiptHelpers.js
    participant Materials@{ "type": "control" } as materialService.js
    participant FileBaseRepository@{ "type": "control" } as baseRepository.js
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant Conversion@{ "type": "control" } as stockHelpers.js
    participant Formatter@{ "type": "control" } as formattersUtils.js

    Helpers->>Materials: findMaterialsSnapshot({ tx, materialIds, supplierId })
    Materials->>FileBaseRepository: getDb(tx)
    FileBaseRepository-->>Materials: getDb(): PrismaClient | TransactionClient
    Materials->>Prisma: db.material.findMany({ where: { id: { in: materialIds } }, select })
    Prisma-->>Materials: findMany(): Promise[Object[]]
    Materials-->>Helpers: findMaterialsSnapshot(): Promise[Object[]]
    loop Cada partida de compra
        Helpers->>Helpers: details.map(callback) — material, tipo y estado activo
        break Material inexistente, tipo incompatible o proveedor-material inactivo
            Helpers-->>Helpers: throw MaterialNotFound | MaterialInactiveConflict
        end
        Helpers->>Formatter: roundTo(quantity * costPerUnitType)
        Formatter-->>Helpers: roundTo(): number — subtotal sin IVA
        Helpers->>Formatter: roundTo(netPurchaseAmount * 1.16)
        Helpers->>Conversion: calculateConvertedQuantity({ quantity, base, height })
        Conversion-->>Helpers: calculateConvertedQuantity(): number
        opt convertedQuantity mayor que cero
            Helpers->>Formatter: roundTo(netPurchaseAmount / convertedQuantity)
        end
    end
```
