<a id="cu-ida-05"></a>
# `CU-IDA-05` — Consultar usuarios

**Patrones:** `BE-P01`.

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Route@{ "type": "boundary" } as src/routes/api/admin/userApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/admin/userController.js
    participant Domain@{ "type": "control" } as src/services/admin/userService.js
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant ErrorHandler as src/app.js

    Client->>Route: GET /api/admin/users
    Route->>Controller: getAllUsers(req, res)
    activate Controller
    Controller->>Domain: userService.findAllUsers({ skip, take, search, orderBy, orderDir })
    activate Domain
    Domain->>Prisma: user.findMany({ where, include, skip, take, orderBy })
    Prisma-->>Domain: findMany(): Promise[User[]]
    Domain->>Prisma: user.count({ where })
    Prisma-->>Domain: count(): Promise[number]
    alt Servicio resuelto
        Domain-->>Controller: userService.findAllUsers(): Promise[{ data: User[], recordsTotal: number, recordsFiltered: number }]
        Controller-->>Client: HTTP 2xx { code, data }
    else AppError propagado
        Domain-->>Controller: throw AppError { code, message, meta, statusCode }
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
    end
    deactivate Domain
    deactivate Controller
```

