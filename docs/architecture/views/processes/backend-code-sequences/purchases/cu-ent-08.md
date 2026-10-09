<a id="cu-ent-08"></a>
# `CU-ENT-08` — Crear compra de consumible

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`, `BE-P05`.

Si el selector crea un proveedor, antes de esta secuencia el navegador completa el `POST
/api/warehouse/suppliers` de [`CU-CAT-02`](../catalogs/cu-cat-02.md#cu-cat-02). La compra recibe el
`supplierId` resultante — el alta no se integra en la transacción de la compra ni habilita la ruta web
independiente de proveedores.

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
| `Reference` | control | [`referenceNumberService.js`](../../../../../../src/services/document/referenceNumberService.js) |
| `ValidationRules` | control | [`goodsReceiptValidations.js`](../../../../../../src/validators/forms/goodsReceiptValidations.js) |
| `Supplier` | control | [`supplierService.js`](../../../../../../src/services/warehouse/supplierService.js) |
| `Person` | control | [`personService.js`](../../../../../../src/services/admin/person/personService.js) |
| `Formatter` | control | [`formattersUtils.js`](../../../../../../src/utils/formattersUtils.js) |
| `FileBaseRepository` | control | [`baseRepository.js`](../../../../../../src/repository/baseRepository.js) |
| `FileConsumableGoodsReceiptController` | control | [`consumableGoodsReceiptController.js`](../../../../../../src/controllers/api/warehouse/goodsReceipts/consumables/consumableGoodsReceiptController.js) |
| `FileDatabaseUrl` | control | [`databaseUrl.js`](../../../../../../src/lib/databaseUrl.js) |
| `FilePrisma` | control | [`prisma.js`](../../../../../../src/lib/prisma.js) |
| `Materials` | control | [`materialService.js`](../../../../../../src/services/warehouse/materials/materialService.js) |
| `Conversion` | control | [`stockHelpers.js`](../../../../../../src/services/inventory/stockHelpers.js) |
| `MovementHelpers` | control | [`movementHelpers.js`](../../../../../../src/services/inventory/movementHelpers.js) |

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
| `registerConsumableGoodsReceipt` | `FileConsumableGoodsReceiptController` | `Controller` · `buildRegisterHandler(...)` |

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
    Client->>Route: POST /api/warehouse/goods-receipts/consumables
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    Route->>ValidationRules: goodsReceiptValidation[] — cadena ejecutada por Express
    Route->>Validator: validate(req, res, next)
    break Validación rechazada
        Validator-->>Client: HTTP 400 { errors }
    end
    Route->>Auth: authorizeUserApi(PERMISSIONS.GOODS_RECEIPTS_MANAGE)(req, res, next)
    break Identidad no vigente o permiso denegado
        Auth-->>Client: HTTP 401 INVALID_AUTH o HTTP 403 FORBIDDEN
    end
    Route->>Controller: registerConsumableGoodsReceipt(req, res)
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
    Controller->>DTO: createGoodsReceiptDtoForRegister(req.body)
    activate DTO
    DTO-->>Controller: createGoodsReceiptDtoForRegister(): Object — DTO normalizado
    deactivate DTO
    Controller->>Formatter: sanitizeEmptyStrings(dto)
    Controller->>Facade: createConsumableGoodsReceipt(options con DTO, identificadores y actor cuando corresponde)
    Facade->>Core: createGoodsReceipt({ ...options, type: CONSUMABLE })
    Note over Facade,Core: Realización detallada en la colaboración de dominio
    alt Servicio resuelto
        Core-->>Facade: createGoodsReceipt(): Promise[GoodsReceipt]
        Facade-->>Controller: createConsumableGoodsReceipt(): Promise[GoodsReceipt]
        Controller->>Socket: emitInventoryUpdated({ context: 'consumable', source: 'goods-receipt-created' })
        Controller-->>Client: HTTP 200 { goodsReceipt, code }
    else Error de dominio o persistencia
        Core-->>Facade: error — rollback si falló el callback transaccional
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
    participant Supplier@{ "type": "control" } as supplierService.js
    participant Person@{ "type": "control" } as personService.js
    participant Invoice@{ "type": "control" } as goodsReceiptInvoiceService.js

    participant FileBaseRepository@{ "type": "control" } as baseRepository.js

    Facade->>Core: createGoodsReceipt({ ...options, type: CONSUMABLE })
    activate Core
        Core->>Supplier: findUniqueSupplier({ id: supplierId })
        Supplier-->>Core: findUniqueSupplier(): Promise[Supplier]
        Note over Core: SupplierInactiveConflict si el proveedor está inactivo
        Core->>Invoice: assertGoodsReceiptInvoiceAvailable({ supplierId, invoice })
        Invoice-->>Core: assertGoodsReceiptInvoiceAvailable(): Promise[void]
        Core->>Person: findPersonById({ id: receivedById })
        Person-->>Core: findPersonById(): Promise[Person | null]
        Note over Core: PersonReceivedByNotFound si falta el receptor
        Core->>Helpers: buildGoodsReceiptDetails(details, { supplierId, type })
        Helpers-->>Core: buildGoodsReceiptDetails(): Promise[Object[]]
        Core->>Helpers: calculateGoodsReceiptTotals(processedDetails)
        Helpers-->>Core: calculateGoodsReceiptTotals(): Object
        Core->>FileBaseRepository: getDb()
        FileBaseRepository-->>Core: getDb(): PrismaClient | TransactionClient — tx si se recibió
    deactivate Core
```

## Detalle de escrituras y resultado del dominio

Continúa la colaboración anterior. Conserva el orden de los mensajes del código y
separa los archivos que ejecutan esta parte del recorrido; los otros detalles del caso
completan las llamadas a helpers y la propagación del resultado.

```mermaid
sequenceDiagram
    autonumber
    participant Facade@{ "type": "control" } as consumableGoodsReceiptService.js
    participant Core@{ "type": "control" } as goodsReceiptService.js
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant Inventory@{ "type": "control" } as movementService.js
    participant Costs@{ "type": "control" } as supplierMaterialService.js
    participant Reference@{ "type": "control" } as referenceNumberService.js

    activate Core
    alt Servicio resuelto

        Core->>Prisma: db.$transaction(async tx => ...)
        rect rgb(245, 245, 245)
            Note over Core,Prisma: getDb().$transaction(async tx => ...)
            Core->>Reference: generateYearlyReferenceNumber({ tx, ... })
            Core->>Prisma: tx.goodsReceipt.create({ data: { type, referenceNumber, ... } })
            Core->>Inventory: applyInventoryMovement({ tx, movementType: ENTRY, details })
    Note over Inventory: Preparación y escrituras ampliadas en los detalles de inventario
            Note over Inventory,Prisma: applyInventoryMovement también actualiza stock con el mismo tx
    end
        Prisma-->>Core: commit y compra creada
        Core->>Costs: updateMaterialUnitCostIfHigher({ supplierId: result.supplierId, details: result.details }) tras commit
        Core-->>Facade: createGoodsReceipt(): Promise[GoodsReceipt]
    else Error de dominio o persistencia
        Note over Core,Prisma: Un error al actualizar costo después del commit no revierte la compra
        Core-->>Facade: error — rollback si falló el callback transaccional
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
    participant Conversion@{ "type": "control" } as stockHelpers.js

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
        Inventory->>Conversion: calculateConvertedQuantity({ quantity, base, height })
        Conversion-->>Inventory: calculateConvertedQuantity(): number
        opt movementType es ISSUE
            Inventory->>Conversion: assertSufficientStock({ material, newStock, requestedQuantity })
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
    participant Conversion@{ "type": "control" } as stockHelpers.js

    Inventory->>Inventory: createInventoryMovement({ tx, reference, details: movementDetails, movementType })
    Inventory->>FileBaseRepository: getDb(tx)
    FileBaseRepository-->>Inventory: getDb(): TransactionClient — tx del caller
    Inventory->>Prisma: db.inventoryMovement.create({ data, include: { details: true } })
    Prisma-->>Inventory: create(): Promise[InventoryMovement]
    Inventory->>Costs: updateSupplierMaterialStock({ tx, grouped, movementType, supplierMaterials })
    Costs->>FileBaseRepository: getDb(tx)
    FileBaseRepository-->>Costs: getDb(): TransactionClient — mismo tx
    loop Cada relación agrupada material-proveedor
        Costs->>Conversion: calculateConvertedQuantity({ quantity, base, height })
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
