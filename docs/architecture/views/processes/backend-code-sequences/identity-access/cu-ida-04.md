<a id="cu-ida-04"></a>
# `CU-IDA-04` — Generar reporte de personas

**Patrones:** `BE-P07`.

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Route@{ "type": "boundary" } as src/routes/api/admin/reportApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/admin/reportController.js
    participant Query@{ "type": "control" } as src/services/admin/person/personService.js
    participant Excel as src/utils/reportExcelUtils.js
    participant ErrorHandler as src/app.js

    Client->>Route: GET /api/admin/reports/persons/excel
    Route->>Controller: exportPersonReport(req, res)
    activate Controller
    Controller->>Query: personService.findAllPersons({ departments, includeAccesses: true, skip: 0, take: 0, search: getDataTableSearch(req.query), orderBy, orderDir })
    activate Query
    alt Servicio resuelto
        Query-->>Controller: personService.findAllPersons(): Promise[{ data: Person[], recordsTotal: number, recordsFiltered: number }]
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

