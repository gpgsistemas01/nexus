<a id="cu-ida-04"></a>
# `CU-IDA-04` — Generar reporte de personas

**Patrones:** `BE-P07`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/admin/reportApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/admin/reportController.js
    participant Domain as src/services/admin/person/personService.js<br/>src/utils/reportExcelUtils.js
    participant ErrorHandler as src/app.js

    Client->>Route: GET /api/admin/reports/persons/excel
    Route->>Controller: exportPersonReport(req, res)
    activate Controller
    Controller->>Domain: personService.findAllPersons({ query: req.query }) prepara filas y el controller llama sendExcelReport
    activate Domain
    alt Servicio resuelto
        Domain-->>Controller: personService.findAllPersons() devuelve { data, recordsTotal, recordsFiltered } para la tabla solicitada
        Controller-->>Client: HTTP 2xx { code, data }
    else AppError propagado
        Domain-->>Controller: throw AppError { code, message, meta, statusCode }
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
    end
    deactivate Domain
    deactivate Controller
```

