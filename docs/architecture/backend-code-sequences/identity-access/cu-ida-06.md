<a id="cu-ida-06"></a>
# `CU-IDA-06` — Crear usuario y asignar acceso

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/admin/userApiRoute.js
    participant Auth as src/middleware/authMiddleware.js
    participant Validator as src/validators/forms/userValidations.js<br/>src/middleware/validatorMiddleware.js
    participant Controller@{ "type": "control" } as src/controllers/api/admin/userController.js
    participant UserDto as <u>userDto: Object</u><br/>src/dtos/userDTO.js
    participant Domain as src/services/admin/userService.js
    participant ErrorHandler as src/app.js

    Client->>Route: POST /api/admin/users
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    Auth->>Validator: userValidation[] y validate(req, res, next)
    Validator->>Auth: authorizeUserApi(PERMISSIONS.USERS_MANAGE)(req, res, next)
    alt Token ausente o inválido
        Auth-->>Client: HTTP 401 { code, message }
    else userValidation rechaza req.body/req.params
        Validator-->>Client: HTTP 400 { errors }
    else PERMISSIONS.USERS_MANAGE denegado
        Auth-->>Client: HTTP 403 { code, message }
    else Pipeline aceptado
        Route->>Controller: registerUser(req, res)
        activate Controller
        Controller->>UserDto: createUserDtoForRegister(req.body)
        UserDto-->>Controller: userDto normalizado
        Controller->>Domain: userService.createUser({ userDto }) crea cuenta, contraseña cifrada y acceso
        activate Domain
        alt Servicio resuelto
            Domain-->>Controller: userService.createUser() devuelve user creado y persistido
            Controller-->>Client: HTTP 2xx { code, data }
        else AppError propagado
            Domain-->>Controller: throw AppError { code, message, meta, statusCode }
            Controller->>ErrorHandler: next(error)
            ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
        end
        deactivate Domain
        deactivate Controller
    end
```

