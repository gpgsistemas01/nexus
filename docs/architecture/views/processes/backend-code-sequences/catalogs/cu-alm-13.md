<a id="cu-alm-13"></a>
# `CU-ALM-13` — Agregar existencia de merma

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
| `Router` | boundary | [`wasteApiRoute.js`](../../../../../../src/routes/api/warehouse/wasteApiRoute.js) |
| `Auth` | control | [`authMiddleware.js`](../../../../../../src/middleware/authMiddleware.js) |
| `Validator` | control | [`validatorMiddleware.js`](../../../../../../src/middleware/validatorMiddleware.js) |
| `Controller` | control | [`wasteController.js`](../../../../../../src/controllers/api/warehouse/wasteController.js) |
| `StockDto` | control | [`wasteDTO.js`](../../../../../../src/dtos/wasteDTO.js) |
| `Service` | control | [`wasteService.js`](../../../../../../src/services/warehouse/wastes/wasteService.js) |
| `Entry` | control | [`wasteStockEntryService.js`](../../../../../../src/services/warehouse/wastes/wasteStockEntryService.js) |
| `Movement` | control | [`wasteMovementService.js`](../../../../../../src/services/warehouse/wastes/wasteMovementService.js) |
| `Socket` | control | [`socketUtils.js`](../../../../../../src/utils/socketUtils.js) |
| `ValidationRules` | control | [`wasteValidations.js`](../../../../../../src/validators/forms/wasteValidations.js) |
| `Reference` | control | [`referenceNumberService.js`](../../../../../../src/services/document/referenceNumberService.js) |
| `Stock` | control | [`wasteInventoryService.js`](../../../../../../src/services/warehouse/wastes/wasteInventoryService.js) |
| `FileBaseRepository` | control | [`baseRepository.js`](../../../../../../src/repository/baseRepository.js) |
| `FileDatabaseUrl` | control | [`databaseUrl.js`](../../../../../../src/lib/databaseUrl.js) |
| `FilePrisma` | control | [`prisma.js`](../../../../../../src/lib/prisma.js) |

## Composición de archivos

Los archivos que construyen, configuran o reexportan funciones aparecen como componentes
individuales. Las flechas representan imports reales, resueltos al cargar los módulos;
las llamadas durante la operación se muestran en las secuencias siguientes. Cada nombre
identifica un archivo y la tabla conserva su ruta completa.

```mermaid
flowchart TB
    subgraph Component0["Backend"]
        FileDatabaseUrl["databaseUrl.js"]
        FilePrisma["prisma.js"]
        FileBaseRepository["baseRepository.js"]
    end
    FilePrisma -->|import| FileDatabaseUrl
    FileBaseRepository -->|import| FilePrisma
```

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Router@{ "type": "boundary" } as wasteApiRoute.js
    participant Auth@{ "type": "control" } as authMiddleware.js
    participant ValidationRules@{ "type": "control" } as wasteValidations.js
    participant Validator@{ "type": "control" } as validatorMiddleware.js
    participant Controller@{ "type": "control" } as wasteController.js

    Client->>Router: POST /api/warehouse/wastes/:id/stock-additions + accessToken
    Router->>Auth: verifyApiTokenRequired(req, res, next)
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    Router->>ValidationRules: wasteStockAdditionValidation[] — cadena ejecutada por Express
    Router->>Validator: validate(req, res, next)
    break Validación rechazada
        Validator-->>Client: HTTP 400 { errors }
    end
    Router->>Auth: authorizeUserApi(PERMISSIONS.WASTES_ADD_STOCK)(req, res, next)
    break Identidad no vigente o permiso denegado
        Auth-->>Client: HTTP 401 INVALID_AUTH o HTTP 403 FORBIDDEN
    end
    Router->>Controller: registerWasteStockAddition(req, res)
    alt Commit confirmado
        Controller-->>Client: 200 { waste, code }
    else Cantidad o persistencia rechazada
        Controller-->>Client: status HTTP { code, message }
    end
```

## Detalle de coordinación del controller

Continúa la colaboración anterior. Conserva el orden de los mensajes del código y
separa los archivos que ejecutan esta parte del recorrido; los otros detalles del caso
completan las llamadas a helpers y la propagación del resultado.

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Controller@{ "type": "control" } as wasteController.js
    participant StockDto@{ "type": "control" } as DTO funcional<br/>wasteDTO.js
    participant Service@{ "type": "control" } as wasteService.js
    participant Entry@{ "type": "control" } as wasteStockEntryService.js
    participant Movement@{ "type": "control" } as wasteMovementService.js
    participant Reference@{ "type": "control" } as referenceNumberService.js
    participant Stock@{ "type": "control" } as wasteInventoryService.js
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant Socket@{ "type": "control" } as socketUtils.js

    participant FileBaseRepository@{ "type": "control" } as baseRepository.js

    Controller->>StockDto: createWasteDtoForStockAddition(req.body)
    activate StockDto
    StockDto-->>Controller: createWasteDtoForStockAddition(): Object (entryDto)
    deactivate StockDto
    Controller->>Service: addWasteStock({ id, entryDto, userId })
    Service->>FileBaseRepository: getDb()
    FileBaseRepository-->>Service: getDb(): PrismaClient | TransactionClient — tx si se recibió
    Service->>Prisma: db.$transaction(async tx => ...)
    Service->>Prisma: tx.waste.findUnique({ where: { id } })
    Service->>Entry: registerWasteStockEntry({ tx, waste, quantity, observations, userId })
    Entry->>Reference: generateYearlyReferenceNumber({ type: WASTE_STOCK_ENTRY, tx })
    Reference->>Prisma: tx.referenceNumberCounter.upsert({ where, update, create })
    Reference-->>Entry: generateYearlyReferenceNumber(): Promise[string]
    Entry->>Movement: applyWasteMovement({ tx, movementType: ENTRY, details })
    Movement->>Stock: applyWasteStockChange({ tx, id, quantityChange, convertedQuantityChange })
    Stock->>FileBaseRepository: getDb(tx)
    FileBaseRepository-->>Stock: getDb(): PrismaClient | TransactionClient — tx si se recibió
    Stock->>Prisma: db.waste.findUnique({ where: { id } })
    Stock->>FileBaseRepository: getDb(tx)
    FileBaseRepository-->>Stock: getDb(): PrismaClient | TransactionClient — tx si se recibió
    Stock->>Prisma: db.waste.updateMany({ where, data })
    Stock-->>Movement: applyWasteStockChange(): Promise[Object]
    Movement->>Movement: createWasteMovement({ tx, movementType: ENTRY, details })
    Movement->>FileBaseRepository: getDb(tx)
    FileBaseRepository-->>Movement: getDb(): PrismaClient | TransactionClient — conserva tx
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
