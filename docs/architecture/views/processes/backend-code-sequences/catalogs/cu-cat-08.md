<a id="cu-cat-08"></a>
# `CU-CAT-08` — Generar reporte de clientes

**Patrones:** `BE-P07`.

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Route@{ "type": "boundary" } as src/routes/api/sales/reportApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/sales/reportController.js
    participant Query@{ "type": "control" } as src/services/sales/clientService.js
    participant Excel as src/utils/reportExcelUtils.js
    participant ErrorHandler as src/app.js

    Client->>Route: GET /api/sales/reports/clients/excel
    Route->>Controller: exportClientReport(req, res)
    activate Controller
    Controller->>Query: clientService.findAllClients({ advisorId: req.query.advisorId || null, skip: 0, take: 0, search: getDataTableSearch(req.query), orderBy, orderDir })
    activate Query
    alt Servicio resuelto
        Query-->>Controller: clientService.findAllClients(): Promise[{ data: Client[], recordsTotal: number, recordsFiltered: number }]
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

