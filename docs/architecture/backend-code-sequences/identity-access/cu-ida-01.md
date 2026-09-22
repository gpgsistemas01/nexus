<a id="cu-ida-01"></a>
# `CU-IDA-01` — Consultar personas

**Patrones:** `BE-P01`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/admin/personApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/admin/personController.js
    participant Domain as src/services/admin/person/personService.js
    participant ErrorHandler as src/app.js

    Client->>Route: GET /api/admin/persons
    Route->>Controller: getAllPersons(req, res)
    activate Controller
    Controller->>Domain: personService.findAllPersons({ query: req.query }) consulta Person y asignaciones
    activate Domain
    alt Servicio resuelto
        Domain-->>Controller: personService.findAllPersons() resuelve datos de dominio
        Controller-->>Client: HTTP 2xx { code, data }
    else AppError propagado
        Domain-->>Controller: throw AppError { code, message, meta, statusCode }
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
    end
    deactivate Domain
    deactivate Controller
```

