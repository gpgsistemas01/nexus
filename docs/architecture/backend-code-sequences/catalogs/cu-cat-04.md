<a id="cu-cat-04"></a>
# `CU-CAT-04` — Generar reporte de proveedores

**Patrones:** `BE-P07`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/warehouse/reportApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/reportController.js
    participant Domain as src/services/warehouse/reportService.js<br/>src/utils/reportExcelUtils.js
    participant ErrorHandler as src/app.js

    Client->>Route: GET /api/warehouse/reports/suppliers/excel
    Route->>Controller: exportSupplierReportExcel(req, res)
    activate Controller
    Controller->>Domain: reportService.findSupplierReportRows({ query: req.query }) y sendExcelReport
    activate Domain
    alt Servicio resuelto
        Domain-->>Controller: reportService.findSupplierReportRows() resuelve datos de dominio
        Controller-->>Client: HTTP 2xx { code, data }
    else AppError propagado
        Domain-->>Controller: throw AppError { code, message, meta, statusCode }
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
    end
    deactivate Domain
    deactivate Controller
```

