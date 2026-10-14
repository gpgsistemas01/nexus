<a id="cu-ent-07"></a>
# `CU-ENT-07` — Consultar compras de consumible

**Patrones:** `BE-P01`.

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
| `Controller` | control | [`goodsReceiptHandlers.js`](../../../../../../src/controllers/api/warehouse/goodsReceipts/shared/goodsReceiptHandlers.js) |
| `Facade` | control | [`consumableGoodsReceiptService.js`](../../../../../../src/services/warehouse/goodsReceipts/consumables/consumableGoodsReceiptService.js) |
| `Core` | control | [`goodsReceiptService.js`](../../../../../../src/services/warehouse/goodsReceipts/goodsReceiptService.js) |
| `Helpers` | control | [`goodsReceiptHelpers.js`](../../../../../../src/services/warehouse/goodsReceipts/goodsReceiptHelpers.js) |
| `QueryUtils` | control | [`requestQueryUtils.js`](../../../../../../src/utils/requestQueryUtils.js) |
| `FileConsumableGoodsReceiptController` | control | [`consumableGoodsReceiptController.js`](../../../../../../src/controllers/api/warehouse/goodsReceipts/consumables/consumableGoodsReceiptController.js) |
| `FileBaseRepository` | control | [`baseRepository.js`](../../../../../../src/repository/baseRepository.js) |
| `FilePrisma` | control | [`prisma.js`](../../../../../../src/lib/prisma.js) |
| `FileDatabaseUrl` | control | [`databaseUrl.js`](../../../../../../src/lib/databaseUrl.js) |

### Configuración y construcción

El módulo específico configura y exporta el handler generado en el archivo de la línea `Controller`: [`consumableGoodsReceiptController.js`](../../../../../../src/controllers/api/warehouse/goodsReceipts/consumables/consumableGoodsReceiptController.js).

## Construcción de funciones para esta operación

El configurador se ejecuta al evaluar su módulo. Después se invoca la función devuelta
por la fábrica, usando el nombre público mostrado en la secuencia.

| Nombre público | Archivo configurador (alias) | Archivo que construye el cuerpo (alias) |
| --- | --- | --- |
| `getAllConsumableGoodsReceipts` | `FileConsumableGoodsReceiptController` | `Controller` · `buildListHandler(...)` |

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

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Route@{ "type": "boundary" } as consumableGoodsReceiptApiRoute.js
    participant Auth@{ "type": "control" } as authMiddleware.js
    participant Controller@{ "type": "control" } as goodsReceiptHandlers.js
    participant Facade@{ "type": "control" } as consumableGoodsReceiptService.js
    participant Core@{ "type": "control" } as goodsReceiptService.js
    participant Helpers@{ "type": "control" } as goodsReceiptHelpers.js
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL

    participant FileBaseRepository@{ "type": "control" } as baseRepository.js

    Note over Controller: Handler generado

    participant QueryUtils@{ "type": "control" } as requestQueryUtils.js

    Client->>Route: GET /api/warehouse/goods-receipts/consumables
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    Route->>Auth: authorizeUserApi(PERMISSIONS.GOODS_RECEIPTS_MANAGE)(req, res, next)
    break Identidad no vigente o permiso denegado
        Auth-->>Client: HTTP 401 INVALID_AUTH o HTTP 403 FORBIDDEN
    end
    Route->>Controller: getAllConsumableGoodsReceipts(req, res)
    Controller->>QueryUtils: getDataTablePaging(req.query) — filtros, búsqueda y orden de compras
    QueryUtils-->>Controller: getDataTablePaging(): Object
    Controller->>Facade: findAllConsumableGoodsReceipts(query)
    Facade->>Core: findAllGoodsReceipts({ ...options, type: CONSUMABLE })
    Core->>Helpers: buildGoodsReceiptContextWhere(type)
    activate Helpers
    Helpers-->>Core: buildGoodsReceiptContextWhere(): Object
    deactivate Helpers
    Core->>FileBaseRepository: getDb()
    FileBaseRepository-->>Core: getDb(): PrismaClient | TransactionClient — conserva tx
    Core->>Prisma: goodsReceipt.findMany({ where, skip, take, orderBy, select })
    activate Prisma
    Prisma-->>Core: findMany(): Promise[GoodsReceipt[]]
    deactivate Prisma
    Core->>Prisma: goodsReceipt.count({ where: contextWhere })
    activate Prisma
    Prisma-->>Core: count(): Promise[number] — total
    deactivate Prisma
    opt Hay filtros adicionales
        Core->>Prisma: goodsReceipt.count({ where })
        activate Prisma
        Prisma-->>Core: count(): Promise[number] — filtered
        deactivate Prisma
    end
    Core-->>Facade: findAllGoodsReceipts(): Promise[{ data, recordsTotal, recordsFiltered }]
    Facade-->>Controller: findAllConsumableGoodsReceipts(): Promise[{ data, recordsTotal, recordsFiltered }]
    Controller-->>Client: HTTP 200 { data, recordsTotal, recordsFiltered }
```
