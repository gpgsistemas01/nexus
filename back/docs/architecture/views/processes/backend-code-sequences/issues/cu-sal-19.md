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
| `Core` | control | [`goodsIssueDetailService.js`](../../../../../../src/services/warehouse/goodsIssues/goodsIssueDetailService.js) |
| `DetailRepository` | control | [`issueDetailRepository.js`](../../../../../../src/repository/warehouse/issueDetailRepository.js) |
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
| `StockChecks` | control | [`stockHelpers.js`](../../../../../../src/services/inventory/stockHelpers.js) |
| `DocumentLock` | control | [`documentLockRepository.js`](../../../../../../src/repository/warehouse/documentLockRepository.js) |
| `StockBalance` | control | [`supplierMaterialStockService.js`](../../../../../../src/services/warehouse/materials/supplierMaterialStockService.js) |
| `StockUpdateRepo` | control | [`stockUpdateRepository.js`](../../../../../../src/repository/warehouse/stockUpdateRepository.js) |

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
    participant Core@{ "type": "control" } as goodsIssueDetailService.js
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

El surtido consulta cantidades y estados después de bloquear la salida. El mismo tx
protege las líneas, existencias, movimiento y estado final.

```mermaid
sequenceDiagram
    autonumber
    participant Facade@{ "type": "control" } as consumableGoodsIssueService.js
    participant Core@{ "type": "control" } as goodsIssueDetailService.js
    participant DetailRepository@{ "type": "control" } as issueDetailRepository.js
    participant DocumentLock@{ "type": "control" } as documentLockRepository.js
    participant Fulfillment@{ "type": "control" } as fulfillmentStatusService.js
    participant Inventory@{ "type": "control" } as movementService.js
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    Facade->>Core: updateGoodsIssueDetails({ id, goodsIssueDto, type })
    Core->>Prisma: getDb().$transaction(async tx)
    Core->>DocumentLock: lockGoodsIssue({ tx, id })
    DocumentLock->>Prisma: tx.$queryRaw(SELECT GoodsIssue FOR UPDATE)
    Prisma-->>DocumentLock: bloqueo hasta commit o rollback
    Core->>Prisma: tx.goodsIssue.findUnique({ where, select })
    Prisma-->>Core: findUnique(): Promise[GoodsIssue]
    Core->>Fulfillment: findFulfillmentStatusIdsByName({ tx, names })
    Note over Core: Validar ids, preparar cambios y actualizar snapshot en un recorrido
    Core->>DetailRepository: updateGoodsIssueDetails({ tx, id, details: updates })
    DetailRepository->>Prisma: tx.$executeRaw(UPDATE GoodsIssueDetail FROM VALUES)
    Prisma-->>DetailRepository: $executeRaw(): Promise[number]
    DetailRepository-->>Core: updateGoodsIssueDetails(): Promise[number]
    opt Hay pendiente por surtir
        Core->>Inventory: applyInventoryMovement({ tx, reference, details, movementType })
    end
    Core->>Prisma: tx.goodsIssue.update({ where, data, select })
    Prisma-->>Core: commit y salida actualizada
    Core-->>Facade: updateGoodsIssueDetails(): Promise[GoodsIssue]
```

## Detalle de preparación del movimiento de inventario

Todos los colaboradores conservan el mismo `tx` de la operación.

```mermaid
sequenceDiagram
    autonumber
    participant Inventory@{ "type": "control" } as movementService.js
    participant MovementHelpers@{ "type": "control" } as movementHelpers.js
    participant StockBalance@{ "type": "control" } as supplierMaterialStockService.js
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    Inventory->>MovementHelpers: buildStockUpdateSummary({ details })
    MovementHelpers-->>Inventory: buildStockUpdateSummary(): Object — grouped
    opt El caller no proporcionó las ofertas
        Inventory->>StockBalance: findSupplierMaterialsForStockMovement({ tx, where })
        StockBalance->>Prisma: tx.supplierMaterial.findMany({ where, select })
        Prisma-->>StockBalance: findMany(): Promise[SupplierMaterial[]]
        StockBalance-->>Inventory: findSupplierMaterialsForStockMovement(): Promise[SupplierMaterial[]]
    end
    Inventory->>Inventory: Map(offers) — indexar identidades
```

## Detalle de escritura del movimiento y las existencias

Todos los colaboradores conservan el mismo `tx` de la operación.

```mermaid
sequenceDiagram
    autonumber
    participant Inventory@{ "type": "control" } as movementService.js
    participant StockUpdateRepo@{ "type": "control" } as stockUpdateRepository.js
    participant StockBalance@{ "type": "control" } as supplierMaterialStockService.js
    participant MovementHelpers@{ "type": "control" } as movementHelpers.js
    participant StockChecks@{ "type": "control" } as stockHelpers.js
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    Inventory->>StockBalance: updateSupplierMaterialStock({ tx, grouped, movementType, supplierMaterialsByKey })
    loop Preparar cambios por identidad
        StockBalance->>StockChecks: calculateConvertedQuantity({ quantity, base, height })
        StockChecks-->>StockBalance: calculateConvertedQuantity(): number
    end
    StockBalance->>StockUpdateRepo: updateSupplierMaterialStocks({ tx, changes })
    StockUpdateRepo->>Prisma: tx.$queryRaw(CTE de bloqueo ordenado y UPDATE RETURNING)
    Prisma-->>StockUpdateRepo: $queryRaw(): Promise[SupplierMaterial[]]
    StockUpdateRepo-->>StockBalance: updateSupplierMaterialStocks(): Promise[SupplierMaterial[]]
    StockBalance-->>Inventory: updateSupplierMaterialStock(): Promise[Map]
    loop Cada detalle conserva su relación e historial
        Inventory->>MovementHelpers: buildInventoryMovementDetail({ previousStock, newStock, quantity, ... })
        MovementHelpers-->>Inventory: buildInventoryMovementDetail(): Object
    end
    Inventory->>Inventory: createInventoryMovement({ tx, reference, details, movementType })
    Inventory->>Prisma: tx.inventoryMovement.create({ data, include })
    Prisma-->>Inventory: create(): Promise[InventoryMovement]
```
