<a id="cu-sal-15"></a>
# `CU-SAL-15` — Consultar salidas de consumible

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
| `Route` | boundary | [`consumableGoodsIssueApiRoute.js`](../../../../../../src/routes/api/warehouse/goodsIssues/consumables/consumableGoodsIssueApiRoute.js) |
| `Auth` | control | [`authMiddleware.js`](../../../../../../src/middleware/authMiddleware.js) |
| `Controller` | control | [`goodsIssueHandlers.js`](../../../../../../src/controllers/api/warehouse/goodsIssues/shared/goodsIssueHandlers.js) |
| `Facade` | control | [`consumableGoodsIssueService.js`](../../../../../../src/services/warehouse/goodsIssues/consumables/consumableGoodsIssueService.js) |
| `Core` | control | [`goodsIssueService.js`](../../../../../../src/services/warehouse/goodsIssues/goodsIssueService.js) |
| `Helpers` | control | [`goodsIssueHelpers.js`](../../../../../../src/services/warehouse/goodsIssues/goodsIssueHelpers.js) |
| `IssueQueryUtils` | control | [`issueQueryUtils.js`](../../../../../../src/utils/issueQueryUtils.js) |
| `FileConsumableGoodsIssueController` | control | [`consumableGoodsIssueController.js`](../../../../../../src/controllers/api/warehouse/goodsIssues/consumables/consumableGoodsIssueController.js) |
| `FileBaseRepository` | control | [`baseRepository.js`](../../../../../../src/repository/baseRepository.js) |
| `FilePrisma` | control | [`prisma.js`](../../../../../../src/lib/prisma.js) |
| `FileDatabaseUrl` | control | [`databaseUrl.js`](../../../../../../src/lib/databaseUrl.js) |

### Configuración y construcción

El módulo específico configura y exporta el handler generado en el archivo de la línea `Controller`: [`consumableGoodsIssueController.js`](../../../../../../src/controllers/api/warehouse/goodsIssues/consumables/consumableGoodsIssueController.js).

## Construcción de funciones para esta operación

El configurador se ejecuta al evaluar su módulo. Después se invoca la función devuelta
por la fábrica, usando el nombre público mostrado en la secuencia.

| Nombre público | Archivo configurador (alias) | Archivo que construye el cuerpo (alias) |
| --- | --- | --- |
| `getAllConsumableGoodsIssues` | `FileConsumableGoodsIssueController` | `Controller` · `buildListHandler(...)` |

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

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Route@{ "type": "boundary" } as consumableGoodsIssueApiRoute.js
    participant Auth@{ "type": "control" } as authMiddleware.js
    participant Controller@{ "type": "control" } as goodsIssueHandlers.js
    participant Facade@{ "type": "control" } as consumableGoodsIssueService.js
    participant Core@{ "type": "control" } as goodsIssueService.js
    participant Helpers@{ "type": "control" } as goodsIssueHelpers.js
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL

    participant FileBaseRepository@{ "type": "control" } as baseRepository.js

    Note over Controller: Handler generado

    participant IssueQueryUtils@{ "type": "control" } as issueQueryUtils.js

    Client->>Route: GET /api/warehouse/goods-issues/consumables
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    Route->>Auth: authorizeUserApi(PERMISSIONS.GOODS_ISSUES_MANAGE)(req, res, next)
    break Identidad no vigente o permiso denegado
        Auth-->>Client: HTTP 401 INVALID_AUTH o HTTP 403 FORBIDDEN
    end
    Route->>Controller: getAllConsumableGoodsIssues(req, res)
    Controller->>IssueQueryUtils: getIssueDataTableQuery({ query, columns })
    IssueQueryUtils-->>Controller: getIssueDataTableQuery(): Object
    Controller->>Facade: findAllConsumableGoodsIssues(query)
    Facade->>Core: findAllGoodsIssues({ ...options, type: CONSUMABLE })
    Core->>Helpers: buildGoodsIssueContextWhere(type)
    activate Helpers
    Helpers-->>Core: buildGoodsIssueContextWhere(): Object
    deactivate Helpers
    Core->>FileBaseRepository: getDb()
    FileBaseRepository-->>Core: getDb(): PrismaClient | TransactionClient — conserva tx
    Core->>Prisma: goodsIssue.findMany({ where, skip, take, orderBy, include })
    activate Prisma
    Prisma-->>Core: findMany(): Promise[GoodsIssue[]]
    deactivate Prisma
    Core->>Prisma: goodsIssue.count({ where })
    activate Prisma
    Prisma-->>Core: count(): Promise[number] — total y filtered iguales
    deactivate Prisma
    Core-->>Facade: findAllGoodsIssues(): Promise[{ data, recordsTotal, recordsFiltered }]
    Facade-->>Controller: findAllConsumableGoodsIssues(): Promise[{ data, recordsTotal, recordsFiltered }]
    Controller-->>Client: HTTP 200 { data, recordsTotal, recordsFiltered }
```
