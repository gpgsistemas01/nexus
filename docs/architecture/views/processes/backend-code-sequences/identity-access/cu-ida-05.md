<a id="cu-ida-05"></a>
# `CU-IDA-05` — Consultar usuarios

**Patrones:** `BE-P01`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `Route` | boundary | [`userApiRoute.js`](../../../../../../src/routes/api/admin/userApiRoute.js) |
| `Controller` | control | [`userController.js`](../../../../../../src/controllers/api/admin/userController.js) |
| `Domain` | control | [`userService.js`](../../../../../../src/services/admin/userService.js) |
| `ErrorHandler` | control | [`app.js`](../../../../../../src/app.js) |
| `Auth` | control | [`authMiddleware.js`](../../../../../../src/middleware/authMiddleware.js) |

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Route@{ "type": "boundary" } as Router API
    participant Auth@{ "type": "control" } as Acceso
    participant Controller@{ "type": "control" } as Controller
    participant Domain@{ "type": "control" } as Servicio de dominio
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant ErrorHandler@{ "type": "control" } as Errores Express

    Client->>Route: GET /api/admin/users

    Route->>Auth: verifyApiTokenRequired(req, res, next)
    activate Auth
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    deactivate Auth
    Route->>Auth: authorizeUserApi(PERMISSIONS.USERS_MANAGE)(req, res, next)
    activate Auth
    break Identidad no vigente o permiso denegado
        Auth-->>Client: HTTP 401 INVALID_AUTH o HTTP 403 FORBIDDEN
    end
    deactivate Auth
    Route->>Controller: getAllUsers(req, res)
    activate Controller
    Controller->>Domain: userService.findAllUsers({ skip, take, search, orderBy, orderDir })
    activate Domain
    Domain->>Prisma: user.findMany({ where, include, skip, take, orderBy })
    activate Prisma
    Prisma-->>Domain: findMany(): Promise[User[]]
    deactivate Prisma
    Domain->>Prisma: user.count(): total del recurso
    activate Prisma
    Prisma-->>Domain: count(): Promise[number] — recordsTotal
    deactivate Prisma
    opt Filtros adicionales requieren conteo
        Domain->>Prisma: user.count({ where }): total filtrado
    activate Prisma
    Prisma-->>Domain: count(): Promise[number] — recordsFiltered
    deactivate Prisma
    end
    Note over Domain: Sin filtros adicionales reutiliza recordsTotal
    alt Servicio resuelto
        Domain-->>Controller: userService.findAllUsers(): Promise[{ data: User[], recordsTotal: number, recordsFiltered: number }]
        Controller-->>Client: HTTP 200 { data, recordsTotal, recordsFiltered }
    else AppError propagado
        Domain-->>Controller: throw AppError { code, message, meta, statusCode }
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
    end
    deactivate Domain
    deactivate Controller
```

