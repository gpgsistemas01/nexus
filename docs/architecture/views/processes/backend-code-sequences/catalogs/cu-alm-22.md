<a id="cu-alm-22"></a>
# `CU-ALM-22` — Generar reporte de inventario de consumibles

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

    Client->>Route: GET /api/warehouse/reports/inventory/excel?type=CONSUMABLE
    Route->>Controller: exportWarehouseReportExcel(req, res)
    activate Controller
    Controller->>Query: reportService.findWarehouseReportRows({ search: getDataTableSearch(req.query), inventoryScope: req.query.inventoryScope, type: CONSUMABLE, orderBy, orderDir })
    activate Query
    alt Servicio resuelto
        Query-->>Controller: reportService.findWarehouseReportRows(): Promise[Object[]]
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
