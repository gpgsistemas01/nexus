<a id="cu-ida-02"></a>
# `CU-IDA-02` — Crear persona

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`.

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Route@{ "type": "boundary" } as src/routes/api/admin/personApiRoute.js
    participant Auth@{ "type": "control" } as src/middleware/authMiddleware.js
    participant Validator@{ "type": "control" } as src/validators/forms/personValidations.js<br/>src/middleware/validatorMiddleware.js
    participant Controller@{ "type": "control" } as src/controllers/api/admin/personController.js
    participant PersonDto@{ "type": "entity" } as personDto: Object<br/>src/dtos/personDTO.js
    participant Domain@{ "type": "control" } as src/services/admin/person/personService.js
    participant ErrorHandler as src/app.js

    Client->>Route: POST /api/admin/persons
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    Route->>Validator: personValidation[] y validate(req, res, next)
    break Validación rechazada
        Validator-->>Client: HTTP 400 { errors }
    end
    Route->>Auth: authorizeUserApi(PERMISSIONS.PERSONS_WRITE)(req, res, next)
    break Identidad no vigente o permiso denegado
        Auth-->>Client: HTTP 401 INVALID_AUTH o HTTP 403 FORBIDDEN
    end
    Route->>Controller: registerPerson(req, res)
    activate Controller
    Controller->>PersonDto: createPersonDtoForRegister(req.body)
    PersonDto-->>Controller: createPersonDtoForRegister(): Object (personDto)
    Controller->>Domain: personService.createPerson({ personDto }) valida y crea persona/asignaciones
    activate Domain
    alt Servicio resuelto
        Domain-->>Controller: personService.createPerson(): Promise[Person]
        Controller-->>Client: HTTP 2xx { code, data }
    else AppError propagado
        Domain-->>Controller: throw AppError { code, message, meta, statusCode }
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
    end
    deactivate Domain
    deactivate Controller
```
