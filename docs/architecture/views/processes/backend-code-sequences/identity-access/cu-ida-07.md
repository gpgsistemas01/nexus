<a id="cu-ida-07"></a>
# `CU-IDA-07` — Editar usuario y acceso

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`.

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Route@{ "type": "boundary" } as src/routes/api/admin/userApiRoute.js
    participant Auth@{ "type": "control" } as src/middleware/authMiddleware.js
    participant Validator@{ "type": "control" } as src/validators/forms/userValidations.js<br/>src/middleware/validatorMiddleware.js
    participant Controller@{ "type": "control" } as src/controllers/api/admin/userController.js
    participant UserDto@{ "type": "entity" } as userDto: Object<br/>src/dtos/userDTO.js
    participant Domain@{ "type": "control" } as src/services/admin/userService.js
    participant ErrorHandler as src/app.js

    Client->>Route: PATCH /api/admin/users/:id
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    Route->>Validator: userEditValidation[] y validate(req, res, next)
    break Validación rechazada
        Validator-->>Client: HTTP 400 { errors }
    end
    Route->>Auth: authorizeUserApi(PERMISSIONS.USERS_MANAGE)(req, res, next)
    break Identidad no vigente o permiso denegado
        Auth-->>Client: HTTP 401 INVALID_AUTH o HTTP 403 FORBIDDEN
    end
    Route->>Controller: editUser(req, res)
    activate Controller
    Controller->>UserDto: createUserDtoForEdit(req.body)
    UserDto-->>Controller: createUserDtoForEdit(): Object (userDto)
    Controller->>Domain: userService.updateUser({ id: req.params.id, userDto }) actualiza cuenta y asignación autorizada
    activate Domain
    alt Servicio resuelto
        Domain-->>Controller: userService.updateUser(): Promise[User]
        Controller-->>Client: HTTP 2xx { code, data }
    else AppError propagado
        Domain-->>Controller: throw AppError { code, message, meta, statusCode }
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
    end
    deactivate Domain
    deactivate Controller
```

