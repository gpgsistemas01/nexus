<a id="cu-sal-07"></a>
# `CU-SAL-07` — Generar reporte de salidas de material

**Patrones:** `BE-P07`.

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Route@{ "type": "boundary" } as src/routes/api/warehouse/reportApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/reportController.js
    participant Query@{ "type": "control" } as src/services/warehouse/reportService.js
    participant Excel as src/utils/reportExcelUtils.js
    participant ErrorHandler as src/app.js

    Client->>Route: GET /api/warehouse/reports/goods-issues/excel
    Route->>Controller: exportGoodsIssueReportExcel(req, res)
    activate Controller
    Controller->>Query: reportService.findGoodsIssueReportRows({ ...buildIssueReportQuery(req), accesses: req.user?.accesses || [] })
    activate Query
    alt Servicio resuelto
        Query-->>Controller: reportService.findGoodsIssueReportRows(): Promise[Object[]]
        Controller->>Excel: sendExcelReport({ res, data, sheetName, filename })
        Excel-->>Client: HTTP 200 archivo XLSX
    else AppError propagado
        Query-->>Controller: throw AppError { code, message, meta, statusCode }
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
    end
    deactivate Query
    deactivate Controller
```

