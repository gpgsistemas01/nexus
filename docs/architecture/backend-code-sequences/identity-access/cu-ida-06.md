<a id="cu-ida-06"></a>
# `CU-IDA-06` — Crear usuario y asignar acceso

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/admin/userApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/admin/userController.js
    participant UserDto as «object»<br/>userDto<br/>src/dtos/userDTO.js
    participant Domain as src/services/admin/userService.js
    participant ErrorHandler as src/app.js

    Client->>Route: POST /api/admin/users
    Route->>Controller: registerUser(req, res)
    activate Controller
    Controller->>UserDto: createUserDtoForRegister(req.body)
    UserDto-->>Controller: userDto normalizado
    Controller->>Domain: userService.createUser({ userDto }) crea cuenta, contraseña cifrada y acceso
    activate Domain
    alt Servicio resuelto
        Domain-->>Controller: userService.createUser() resuelve datos de dominio
        Controller-->>Client: HTTP 2xx { code, data }
    else AppError propagado
        Domain-->>Controller: throw AppError { code, message, meta, statusCode }
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
    end
    deactivate Domain
    deactivate Controller
```

