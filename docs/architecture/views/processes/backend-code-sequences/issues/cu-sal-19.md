<a id="cu-sal-19"></a>
# `CU-SAL-19` — Surtir consumible

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
| `Route` | boundary | [`consumableGoodsIssueApiRoute.js`](../../../../../../src/routes/api/warehouse/goodsIssues/consumables/consumableGoodsIssueApiRoute.js) |
| `Auth` | control | [`authMiddleware.js`](../../../../../../src/middleware/authMiddleware.js) |
| `Validator` | control | [`validatorMiddleware.js`](../../../../../../src/middleware/validatorMiddleware.js) |
| `Controller` | control | [`goodsIssueHandlers.js`](../../../../../../src/controllers/api/warehouse/goodsIssues/shared/goodsIssueHandlers.js) |
| `Facade` | control | [`consumableGoodsIssueService.js`](../../../../../../src/services/warehouse/goodsIssues/consumables/consumableGoodsIssueService.js) |
| `Core` | control | [`goodsIssueService.js`](../../../../../../src/services/warehouse/goodsIssues/goodsIssueService.js) |
| `Inventory` | control | [`movementService.js`](../../../../../../src/services/inventory/movementService.js) |
| `Socket` | control | [`socketUtils.js`](../../../../../../src/utils/socketUtils.js) |
| `DTO` | control | [`goodsIssueDTO.js`](../../../../../../src/dtos/goodsIssueDTO.js) |
| `ErrorHandler` | control | [`app.js`](../../../../../../src/app.js) |
| `Fulfillment` | control | [`fulfillmentStatusService.js`](../../../../../../src/services/warehouse/fulfillmentStatusService.js) |
| `ValidationRules` | control | [`goodsIssueValidations.js`](../../../../../../src/validators/forms/goodsIssueValidations.js) |
| `Formatter` | control | [`formattersUtils.js`](../../../../../../src/utils/formattersUtils.js) |
| `FileBaseRepository` | control | [`baseRepository.js`](../../../../../../src/repository/baseRepository.js) |
| `FileConsumableGoodsIssueController` | control | [`consumableGoodsIssueController.js`](../../../../../../src/controllers/api/warehouse/goodsIssues/consumables/consumableGoodsIssueController.js) |
| `FileDatabaseUrl` | control | [`databaseUrl.js`](../../../../../../src/lib/databaseUrl.js) |
| `FilePrisma` | control | [`prisma.js`](../../../../../../src/lib/prisma.js) |
| `MovementHelpers` | control | [`movementHelpers.js`](../../../../../../src/services/inventory/movementHelpers.js) |
| `SupplierMaterial` | control | [`supplierMaterialService.js`](../../../../../../src/services/warehouse/materials/supplierMaterialService.js) |
| `StockChecks` | control | [`stockHelpers.js`](../../../../../../src/services/inventory/stockHelpers.js) |

### Configuración y construcción

El módulo específico configura y exporta el handler generado en el archivo de la línea `Controller`: [`consumableGoodsIssueController.js`](../../../../../../src/controllers/api/warehouse/goodsIssues/consumables/consumableGoodsIssueController.js).

## Composición de archivos

Los archivos que construyen, configuran o reexportan funciones aparecen como componentes
individuales. Las flechas representan imports reales, resueltos al cargar los módulos;
las llamadas durante la operación se muestran en las secuencias siguientes. Cada nombre
identifica un archivo y la tabla conserva su ruta completa.

```mermaid
flowchart TB
    subgraph Component0["Backend"]
        FileConsumableGoodsIssueController["consumableGoodsIssueController.js"]
        Controller["goodsIssueHandlers.js"]
        FileDatabaseUrl["databaseUrl.js"]
        FilePrisma["prisma.js"]
        FileBaseRepository["baseRepository.js"]
        Route["consumableGoodsIssueApiRoute.js"]
        Facade["consumableGoodsIssueService.js"]
    end
    FileConsumableGoodsIssueController -->|import| Facade
    FileConsumableGoodsIssueController -->|import| Controller
    FilePrisma -->|import| FileDatabaseUrl
    FileBaseRepository -->|import| FilePrisma
    Route -->|import| FileConsumableGoodsIssueController
```

## Construcción de funciones para esta operación

El configurador se ejecuta al evaluar su módulo. Después se invoca la función devuelta
por la fábrica, usando el nombre público mostrado en la secuencia.

| Nombre público | Archivo configurador (alias) | Archivo que construye el cuerpo (alias) |
| --- | --- | --- |
| `editConsumableGoodsIssueDetails` | `FileConsumableGoodsIssueController` | `Controller` · `buildDetailsHandler(...)` |

## Secuencia de entrada y coordinación

El primer nivel conserva método, controles HTTP, normalización, adaptación del tipo,
respuesta y publicación. La llamada del adaptador al núcleo es la frontera que amplía
el segundo nivel; ambas figuras realizan el mismo caso, sin añadir otra operación.

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Route@{ "type": "boundary" } as consumableGoodsIssueApiRoute.js
    participant Auth@{ "type": "control" } as authMiddleware.js
    participant ValidationRules@{ "type": "control" } as goodsIssueValidations.js
    participant Validator@{ "type": "control" } as validatorMiddleware.js
    participant Controller@{ "type": "control" } as goodsIssueHandlers.js

    Note over Controller: Handler generado
    Client->>Route: PATCH /api/warehouse/goods-issues/consumables/:id/details
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    Route->>ValidationRules: goodsIssueDetailsValidation[] — cadena ejecutada por Express
    Route->>Validator: validate(req, res, next)
    break Validación rechazada
        Validator-->>Client: HTTP 400 { errors }
    end
    Route->>Auth: authorizeUserApi(PERMISSIONS.GOODS_ISSUE_DETAILS_MANAGE)(req, res, next)
    break Identidad no vigente o permiso denegado
        Auth-->>Client: HTTP 401 INVALID_AUTH o HTTP 403 FORBIDDEN
    end
    Route->>Controller: editConsumableGoodsIssueDetails(req, res)
        Controller-->>Client: HTTP 200 { goodsIssue, code }
```

## Detalle de coordinación del controller

Continúa la colaboración anterior. Conserva el orden de los mensajes del código y
separa los archivos que ejecutan esta parte del recorrido; los otros detalles del caso
completan las llamadas a helpers y la propagación del resultado.

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Controller@{ "type": "control" } as goodsIssueHandlers.js
    participant Formatter@{ "type": "control" } as formattersUtils.js
    participant Facade@{ "type": "control" } as consumableGoodsIssueService.js
    participant Core@{ "type": "control" } as goodsIssueService.js
    participant Socket@{ "type": "control" } as socketUtils.js
    participant DTO@{ "type": "control" } as DTO funcional<br/>goodsIssueDTO.js
    participant ErrorHandler@{ "type": "control" } as app.js

    Note over Controller: Handler generado
    Controller->>DTO: createGoodsIssueDetailsDtoForEdit(req.body)
    activate DTO
    DTO-->>Controller: createGoodsIssueDetailsDtoForEdit(): Object — DTO normalizado
    deactivate DTO
    Controller->>Formatter: sanitizeEmptyStrings(dto)
    Controller->>Facade: updateConsumableGoodsIssueDetails(options con DTO, identificadores y actor cuando corresponde)
    Facade->>Core: updateGoodsIssueDetails({ ...options, type: CONSUMABLE })
    Note over Facade,Core: Realización detallada en la colaboración de dominio
    alt Servicio resuelto
        Core->>Core: updateGoodsIssueDetails() — calcular cantidades pendientes tras validar estado
        Core-->>Facade: updateGoodsIssueDetails(): Promise[GoodsIssue]
        Facade-->>Controller: updateConsumableGoodsIssueDetails(): Promise[GoodsIssue]
        Controller->>Socket: emitInventoryUpdated({ context: 'consumable', source: 'goods-issue-supplied' })
        Controller-->>Client: HTTP 200 { goodsIssue, code }
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
    participant Facade@{ "type": "control" } as consumableGoodsIssueService.js
    participant Core@{ "type": "control" } as goodsIssueService.js
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant Inventory@{ "type": "control" } as movementService.js
    participant Fulfillment@{ "type": "control" } as fulfillmentStatusService.js

    participant FileBaseRepository@{ "type": "control" } as baseRepository.js

    Facade->>Core: updateGoodsIssueDetails({ ...options, type: CONSUMABLE })
    activate Core
    alt Servicio resuelto
        Core->>Prisma: goodsIssue.findUnique({ where: { id, ...contextWhere }, include: detalles })
        Core->>Core: updateGoodsIssueDetails() — calcular cantidades pendientes tras validar estado
        Core->>FileBaseRepository: getDb()
        FileBaseRepository-->>Core: getDb(): PrismaClient | TransactionClient — tx si se recibió
        Core->>Prisma: db.$transaction(async tx => ...)
        rect rgb(245, 245, 245)
            Note over Core,Prisma: getDb().$transaction(async tx => ...)
            Core->>Prisma: tx.goodsIssue.findUnique({ where: { id, ...contextWhere }, select: { id: true } })
            Core->>Fulfillment: findFulfillmentStatusIdsByName({ tx, names })
            opt Hay cantidades pendientes por surtir
                Core->>Inventory: applyInventoryMovement({ tx, movementType: ISSUE, details })
            end
            Core->>Prisma: tx.goodsIssueDetail.update({ where: { id: detailId }, data: cantidades y cumplimiento })
            Core->>Prisma: tx.goodsIssueDetail.findMany({ where: { goodsIssueId: id } })
            Core->>Prisma: tx.goodsIssue.update({ where: { id, ...contextWhere }, data: cumplimiento })
        end
        Prisma-->>Core: commit de surtido
        Core-->>Facade: updateGoodsIssueDetails(): Promise[GoodsIssue]
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
    participant SupplierMaterial@{ "type": "control" } as supplierMaterialService.js
    participant Formatter@{ "type": "control" } as formattersUtils.js
    participant StockChecks@{ "type": "control" } as stockHelpers.js

    Note over Inventory: Recorre details y comprueba materialId y supplierId antes de agrupar
    Inventory->>MovementHelpers: buildStockUpdateSummary({ details })
    MovementHelpers->>Formatter: buildStockKey(materialId, supplierId)
    MovementHelpers->>Formatter: normalizeDecimal(quantity)
    MovementHelpers-->>Inventory: buildStockUpdateSummary(): Object — stockKeys y grouped
    opt supplierMaterials no proporcionado
        Inventory->>SupplierMaterial: findSupplierMaterialsForStockMovement({ tx, where })
        SupplierMaterial-->>Inventory: findSupplierMaterialsForStockMovement(): Promise[SupplierMaterial[]]
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
    participant SupplierMaterial@{ "type": "control" } as supplierMaterialService.js
    participant FileBaseRepository@{ "type": "control" } as baseRepository.js
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant StockChecks@{ "type": "control" } as stockHelpers.js

    Inventory->>Inventory: createInventoryMovement({ tx, reference, details: movementDetails, movementType })
    Inventory->>FileBaseRepository: getDb(tx)
    FileBaseRepository-->>Inventory: getDb(): TransactionClient — tx del caller
    Inventory->>Prisma: db.inventoryMovement.create({ data, include: { details: true } })
    Prisma-->>Inventory: create(): Promise[InventoryMovement]
    Inventory->>SupplierMaterial: updateSupplierMaterialStock({ tx, grouped, movementType, supplierMaterials })
    SupplierMaterial->>FileBaseRepository: getDb(tx)
    FileBaseRepository-->>SupplierMaterial: getDb(): TransactionClient — mismo tx
    loop Cada relación agrupada material-proveedor
        SupplierMaterial->>StockChecks: calculateConvertedQuantity({ quantity, base, height })
        alt movementType es ENTRY
            SupplierMaterial->>Prisma: db.supplierMaterial.update({ where, data: { currentStock: { increment: quantity } } })
        else Movimiento de salida
            SupplierMaterial->>Prisma: db.supplierMaterial.updateMany({ where: { currentStock: { gte: quantity } }, data })
            break result.count menor que 1
                SupplierMaterial-->>Inventory: throw GoodsIssueInsufficientStock
            end
        end
    end
    SupplierMaterial-->>Inventory: updateSupplierMaterialStock(): Promise[void]
```
