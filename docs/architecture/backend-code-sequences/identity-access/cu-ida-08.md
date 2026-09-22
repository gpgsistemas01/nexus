<a id="cu-ida-08"></a>
# `CU-IDA-08` — Cambiar contraseña de usuario

**Patrones:** `BE-P01`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/admin/userApiRoute.js
    participant Auth as src/middleware/authMiddleware.js
    participant Validator as src/validators/forms/userValidations.js<br/>src/middleware/validatorMiddleware.js
    participant Controller@{ "type": "control" } as src/controllers/api/admin/userController.js
    participant PasswordDto as <u>userPasswordDto: Object</u><br/>src/dtos/userDTO.js
    participant Domain as src/services/admin/userService.js
    participant ErrorHandler as src/app.js

    Client->>Route: PATCH /api/admin/users/:id/password
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    Auth->>Validator: userPasswordValidation[] y validate(req, res, next)
    Validator->>Auth: authorizeUserApi(PERMISSIONS.USERS_MANAGE)(req, res, next)
    alt Token ausente o inválido
        Auth-->>Client: HTTP 401 { code, message }
    else userPasswordValidation rechaza req.body/req.params
        Validator-->>Client: HTTP 400 { errors }
    else PERMISSIONS.USERS_MANAGE denegado
        Auth-->>Client: HTTP 403 { code, message }
    else Pipeline aceptado
        Route->>Controller: editUserPassword(req, res)
        activate Controller
        Controller->>PasswordDto: createUserPasswordDtoForEdit(req.body)
        PasswordDto-->>Controller: userPasswordDto normalizado
        Controller->>Domain: userService.updateUserPassword({ id: req.params.id, userPasswordDto }) cifra y sustituye la contraseña
        activate Domain
        alt Servicio resuelto
            Domain-->>Controller: userService.updateUserPassword() devuelve userPassword actualizado y persistido
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
