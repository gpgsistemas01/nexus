<a id="cu-sal-21"></a>
# `CU-SAL-21` — Generar reporte de salidas de consumible

**Patrones:** `BE-P07`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `Route` | boundary | [`consumableGoodsIssueReportApiRoute.js`](../../../../../../src/routes/api/warehouse/goodsIssues/consumables/consumableGoodsIssueReportApiRoute.js) |
| `Auth` | control | [`authMiddleware.js`](../../../../../../src/middleware/authMiddleware.js) |
| `Controller` | control | [`reportController.js`](../../../../../../src/controllers/api/warehouse/reportController.js) |
| `Facade` | control | [`consumableGoodsIssueService.js`](../../../../../../src/services/warehouse/goodsIssues/consumables/consumableGoodsIssueService.js) |
| `Query` | control | [`reportService.js`](../../../../../../src/services/warehouse/reportService.js) |
| `List` | control | [`goodsIssueService.js`](../../../../../../src/services/warehouse/goodsIssues/goodsIssueService.js) |
| `Excel` | control | [`reportExcelUtils.js`](../../../../../../src/utils/reportExcelUtils.js) |
| `ErrorHandler` | control | [`app.js`](../../../../../../src/app.js) |

### Configuración y archivos de contexto

El módulo específico configura y exporta el handler generado en el archivo de la línea `Controller`: [`consumableGoodsIssueReportController.js`](../../../../../../src/controllers/api/warehouse/goodsIssues/consumables/consumableGoodsIssueReportController.js).

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Route@{ "type": "boundary" } as Router API
    participant Auth@{ "type": "control" } as Acceso
    participant Controller@{ "type": "control" } as Controller
    participant Facade@{ "type": "control" } as Adaptador del tipo
    participant Query@{ "type": "control" } as Consulta de dominio
    participant List@{ "type": "control" } as Listado
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant Excel@{ "type": "control" } as Reporte Excel
    participant ErrorHandler@{ "type": "control" } as Errores Express

    Note over Controller: Handler generado

    Client->>Route: GET /api/warehouse/reports/goods-issues/consumables/excel
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    Route->>Auth: authorizeUserApi(PERMISSIONS.WAREHOUSE_REPORTS_READ)(req, res, next)
    break Identidad no vigente o permiso denegado
        Auth-->>Client: HTTP 401 INVALID_AUTH o HTTP 403 FORBIDDEN
    end
    Route->>Controller: exportConsumableGoodsIssueReportExcel(req, res)
    alt Exportación resuelta
        Controller->>Controller: buildIssueReportQuery(req) — periodo mensual cuando corresponde
        Controller->>Facade: findConsumableGoodsIssueReportRows(options)
        Facade->>Query: findGoodsIssueReportRows({ ...options, type: CONSUMABLE })
        Query->>List: findAllGoodsIssues({ ...filtros, type, includeCounts: false, skip: 0, take: 100000 })
        List->>Prisma: goodsIssue.findMany({ where: contexto y filtros })
        activate Prisma
        Prisma-->>List: findMany(): Promise[GoodsIssue[]]
        deactivate Prisma
        List-->>Query: findAllGoodsIssues(): Promise[{ data }] — sin conteos
        Query-->>Facade: findGoodsIssueReportRows(): Promise[Object[]]
        Facade-->>Controller: findConsumableGoodsIssueReportRows(): Promise[Object[]]
        Controller->>Controller: buildIssueReportData(rows)
        Controller->>Excel: sendExcelReport({ res, data, sheetName, filename })
        Excel-->>Client: HTTP 200 archivo XLSX
    else Error de lectura o exportación
        Controller-->>ErrorHandler: error propagado por Express
        ErrorHandler-->>Client: HTTP de error { code, message }
    end
```
