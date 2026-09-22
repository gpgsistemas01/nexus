<a id="cu-ida-08"></a>
# `CU-IDA-08` — Cambiar contraseña de usuario

**Patrones:** `BE-P01`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/admin/userApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/admin/userController.js
    participant PasswordDto as «object»<br/>userPasswordDto<br/>src/dtos/userDTO.js
    participant Domain as src/services/admin/userService.js
    participant ErrorHandler as src/app.js

    Client->>Route: PATCH /api/admin/users/:id/password
    Route->>Controller: editUserPassword(req, res)
    activate Controller
    Controller->>PasswordDto: createUserPasswordDtoForEdit(req.body)
    PasswordDto-->>Controller: userPasswordDto normalizado
    Controller->>Domain: userService.updateUserPassword({ id: req.params.id, userPasswordDto }) cifra y sustituye la contraseña
    activate Domain
    alt Servicio resuelto
        Domain-->>Controller: userService.updateUserPassword() resuelve datos de dominio
        Controller-->>Client: HTTP 2xx { code, data }
    else AppError propagado
        Domain-->>Controller: throw AppError { code, message, meta, statusCode }
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
    end
    deactivate Domain
    deactivate Controller
```
