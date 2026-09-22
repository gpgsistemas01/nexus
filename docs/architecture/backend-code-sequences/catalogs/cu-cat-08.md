<a id="cu-cat-08"></a>
# `CU-CAT-08` — Generar reporte de clientes

**Patrones:** `BE-P07`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/sales/reportApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/sales/reportController.js
    participant Domain as src/services/sales/clientService.js<br/>src/utils/reportExcelUtils.js
    participant ErrorHandler as src/app.js

    Client->>Route: GET /api/sales/reports/clients/excel
    Route->>Controller: exportClientReport(req, res)
    activate Controller
    Controller->>Domain: clientService.findAllClients({ query: req.query }) prepara filas y el controller llama sendExcelReport
    activate Domain
    alt Servicio resuelto
        Domain-->>Controller: clientService.findAllClients() devuelve { data, recordsTotal, recordsFiltered } para la tabla solicitada
        Controller-->>Client: HTTP 2xx { code, data }
    else AppError propagado
        Domain-->>Controller: throw AppError { code, message, meta, statusCode }
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
    end
    deactivate Domain
    deactivate Controller
```

