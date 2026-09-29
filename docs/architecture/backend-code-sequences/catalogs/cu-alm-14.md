<a id="cu-alm-14"></a>
# `CU-ALM-14` — Generar reporte de mermas

**Patrones:** `BE-P07`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/warehouse/reportApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/reportController.js
    participant Query as src/services/warehouse/reportService.js
    participant Excel as src/utils/reportExcelUtils.js
    participant ErrorHandler as src/app.js

    Client->>Route: GET /api/warehouse/reports/wastes/excel
    Route->>Controller: exportWasteReportExcel(req, res)
    activate Controller
    Controller->>Query: reportService.findWasteReportRows({ search: getDataTableSearch(req.query), supplierId: req.query.supplierId || null, inventoryScope: req.query.inventoryScope, orderBy, orderDir })
    activate Query
    alt Servicio resuelto
        Query-->>Controller: reportService.findWasteReportRows(): Promise[Object[]]
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

