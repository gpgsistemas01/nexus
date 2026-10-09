<a id="cu-ent-07"></a>
# `CU-ENT-07` — Consultar compras de consumible

**Patrones:** `BE-P01`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `Route` | boundary | [`consumableGoodsReceiptApiRoute.js`](../../../../../../src/routes/api/warehouse/goodsReceipts/consumables/consumableGoodsReceiptApiRoute.js) |
| `Auth` | control | [`authMiddleware.js`](../../../../../../src/middleware/authMiddleware.js) |
| `Controller` | control | [`goodsReceiptHandlers.js`](../../../../../../src/controllers/api/warehouse/goodsReceipts/shared/goodsReceiptHandlers.js) |
| `Facade` | control | [`consumableGoodsReceiptService.js`](../../../../../../src/services/warehouse/goodsReceipts/consumables/consumableGoodsReceiptService.js) |
| `Core` | control | [`goodsReceiptService.js`](../../../../../../src/services/warehouse/goodsReceipts/goodsReceiptService.js) |
| `Helpers` | control | [`goodsReceiptHelpers.js`](../../../../../../src/services/warehouse/goodsReceipts/goodsReceiptHelpers.js) |
| `QueryUtils` | control | [`requestQueryUtils.js`](../../../../../../src/utils/requestQueryUtils.js) |

### Configuración y archivos de contexto

El módulo específico configura y exporta el handler generado en el archivo de la línea `Controller`: [`consumableGoodsReceiptController.js`](../../../../../../src/controllers/api/warehouse/goodsReceipts/consumables/consumableGoodsReceiptController.js).

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Route@{ "type": "boundary" } as Router API
    participant Auth@{ "type": "control" } as Acceso
    participant Controller@{ "type": "control" } as Controller
    participant Facade@{ "type": "control" } as Adaptador del tipo
    participant Core@{ "type": "control" } as Núcleo del dominio
    participant Helpers@{ "type": "control" } as Helpers del dominio
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL

    Note over Controller: Handler generado

    participant QueryUtils@{ "type": "control" } as Consulta HTTP

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
