<a id="cu-sal-07"></a>
# `CU-SAL-07` — Generar reporte de salidas de material

**Patrones:** `BE-P07`.

## Participantes y trazabilidad

Los nombres breves del diagrama corresponden a los archivos vinculados siguientes.
La ruta completa se conserva en cada enlace, fuera de la cabecera visual. Un participante
puede agrupar colaboradores del mismo rol; esa agrupación no implica una clase ni un
proceso independiente. Los retornos representan el resultado o error propagado.

| Alias | Rol visual | Archivos de implementación |
| --- | --- | --- |
| `Route` | boundary | [`materialGoodsIssueReportApiRoute.js`](../../../../../../src/routes/api/warehouse/goodsIssues/materials/materialGoodsIssueReportApiRoute.js) |
| `Auth` | control | [`authMiddleware.js`](../../../../../../src/middleware/authMiddleware.js) |
| `Controller` | control | [`materialGoodsIssueReportController.js`](../../../../../../src/controllers/api/warehouse/goodsIssues/materials/materialGoodsIssueReportController.js)<br/>[`reportController.js`](../../../../../../src/controllers/api/warehouse/reportController.js) |
| `Facade` | control | [`materialGoodsIssueService.js`](../../../../../../src/services/warehouse/goodsIssues/materials/materialGoodsIssueService.js) |
| `Query` | control | [`reportService.js`](../../../../../../src/services/warehouse/reportService.js) |
| `List` | control | [`goodsIssueService.js`](../../../../../../src/services/warehouse/goodsIssues/goodsIssueService.js) |
| `Excel` | control | [`reportExcelUtils.js`](../../../../../../src/utils/reportExcelUtils.js) |
| `ErrorHandler` | control | [`app.js`](../../../../../../src/app.js) |

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

    Client->>Route: GET /api/warehouse/reports/goods-issues/materials/excel
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    Route->>Auth: authorizeUserApi(PERMISSIONS.WAREHOUSE_REPORTS_READ)(req, res, next)
    break Identidad no vigente o permiso denegado
        Auth-->>Client: HTTP 401 INVALID_AUTH o HTTP 403 FORBIDDEN
    end
    Route->>Controller: exportMaterialGoodsIssueReportExcel(req, res)
    alt Exportación resuelta
        Controller->>Controller: buildIssueReportQuery(req) — periodo mensual cuando corresponde
        Controller->>Facade: findMaterialGoodsIssueReportRows(options)
        Facade->>Query: findGoodsIssueReportRows({ ...options, type: MATERIAL })
        Query->>List: findAllGoodsIssues({ ...filtros, type, includeCounts: false, skip: 0, take: 100000 })
        List->>Prisma: goodsIssue.findMany({ where: contexto y filtros })
        activate Prisma
        Prisma-->>List: findMany(): Promise[GoodsIssue[]]
        deactivate Prisma
        List-->>Query: findAllGoodsIssues(): Promise[{ data }] — sin conteos
        Query-->>Facade: findGoodsIssueReportRows(): Promise[Object[]]
        Facade-->>Controller: findMaterialGoodsIssueReportRows(): Promise[Object[]]
        Controller->>Controller: buildIssueReportData(rows)
        Controller->>Excel: sendExcelReport({ res, data, sheetName, filename })
        Excel-->>Client: HTTP 200 archivo XLSX
    else Error de lectura o exportación
        Controller-->>ErrorHandler: error propagado por Express
        ErrorHandler-->>Client: HTTP de error { code, message }
    end
```
