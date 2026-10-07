<a id="cu-sal-07"></a>
# `CU-SAL-07` — Generar reporte de salidas de material

**Patrones:** `BE-P07`.

    opt Error de lectura o exportación
        Controller-->>ErrorHandler: error propagado por Express
        ErrorHandler-->>Client: HTTP de error { code, message }
        end
    end
```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/warehouse/goodsIssues/materials/materialGoodsIssueReportApiRoute.js
    participant Auth as src/middleware/authMiddleware.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/goodsIssues/materials/materialGoodsIssueReportController.js<br/>src/controllers/api/warehouse/reportController.js
    participant Facade as src/services/warehouse/goodsIssues/materials/materialGoodsIssueService.js
    participant Query as src/services/warehouse/reportService.js
    participant List as src/services/warehouse/goodsIssues/goodsIssueService.js
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant Excel as src/utils/reportExcelUtils.js
    participant ErrorHandler as src/app.js

    Client->>Route: GET /api/warehouse/reports/goods-issues/materials/excel
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    Route->>Auth: authorizeUserApi(PERMISSIONS.WAREHOUSE_REPORTS_READ)(req, res, next)
    alt Token o permiso rechazados
        Route-->>Client: HTTP 401 o 403 — error de middleware
    else Pipeline aceptado
        Route->>Controller: exportMaterialGoodsIssueReportExcel(req, res)
        alt Exportación resuelta
            Controller->>Controller: buildIssueReportQuery(req) — periodo mensual cuando corresponde
            Controller->>Facade: findMaterialGoodsIssueReportRows(options)
            Facade->>Query: findGoodsIssueReportRows({ ...options, type: MATERIAL })
            Query->>List: findAllGoodsIssues({ ...filtros, type, includeCounts: false, skip: 0, take: 100000 })
            List->>Prisma: goodsIssue.findMany({ where: contexto y filtros })
            Prisma-->>List: findMany(): Promise[GoodsIssue[]]
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
    end
```
