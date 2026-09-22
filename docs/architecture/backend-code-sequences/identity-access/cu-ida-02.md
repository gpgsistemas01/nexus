<a id="cu-ida-02"></a>
# `CU-IDA-02` — Crear persona

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/admin/personApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/admin/personController.js
    participant PersonDto as «object»<br/>personDto<br/>src/dtos/personDTO.js
    participant Domain as src/services/admin/person/personService.js
    participant ErrorHandler as src/app.js

    Client->>Route: POST /api/admin/persons
    Route->>Controller: registerPerson(req, res)
    activate Controller
    Controller->>PersonDto: createPersonDtoForRegister(req.body)
    PersonDto-->>Controller: personDto normalizado
    Controller->>Domain: personService.createPerson({ personDto }) valida y crea persona/asignaciones
    activate Domain
    alt Servicio resuelto
        Domain-->>Controller: personService.createPerson() resuelve datos de dominio
        Controller-->>Client: HTTP 2xx { code, data }
    else AppError propagado
        Domain-->>Controller: throw AppError { code, message, meta, statusCode }
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
    end
    deactivate Domain
    deactivate Controller
```

