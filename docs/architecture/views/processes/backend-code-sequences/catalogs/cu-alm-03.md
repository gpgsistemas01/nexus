<a id="cu-alm-03"></a>
# `CU-ALM-03` — Editar material

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`.

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Route@{ "type": "boundary" } as src/routes/api/warehouse/materialApiRoute.js
    participant Auth@{ "type": "control" } as src/middleware/authMiddleware.js
    participant Validator@{ "type": "control" } as src/validators/forms/materialValidations.js<br/>src/middleware/validatorMiddleware.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/materialController.js
    participant MaterialDto@{ "type": "entity" } as materialDto: Object<br/>src/dtos/materialDTO.js
    participant Domain@{ "type": "control" } as src/services/warehouse/materials/materialService.js
    participant ErrorHandler as src/app.js

    Client->>Route: PATCH /api/warehouse/materials/:id
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    Route->>Validator: materialEditValidation[] y validate(req, res, next)
    break Validación rechazada
        Validator-->>Client: HTTP 400 { errors }
    end
    Route->>Auth: authorizeUserApi(PERMISSIONS.MATERIALS_WRITE)(req, res, next)
    break Identidad no vigente o permiso denegado
        Auth-->>Client: HTTP 401 INVALID_AUTH o HTTP 403 FORBIDDEN
    end
    Route->>Controller: editMaterial(req, res)
    activate Controller
    Controller->>MaterialDto: createMaterialDtoForEdit(req.body)
    MaterialDto-->>Controller: createMaterialDtoForEdit(): Object (materialDto)
    Controller->>Domain: materialService.updateMaterial({ id: req.params.id, materialDto }) sincroniza datos y relación
    activate Domain
    alt Servicio resuelto
        Domain-->>Controller: materialService.updateMaterial(): Promise[Material]
        Controller-->>Client: HTTP 2xx { code, data }
    else AppError propagado
        Domain-->>Controller: throw AppError { code, message, meta, statusCode }
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
    end
    deactivate Domain
    deactivate Controller
```

