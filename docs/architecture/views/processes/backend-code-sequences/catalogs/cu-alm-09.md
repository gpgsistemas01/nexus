<a id="cu-alm-09"></a>
# `CU-ALM-09` — Consultar mermas

**Patrones:** `BE-P01`.

## Participantes y trazabilidad

Los nombres breves del diagrama corresponden a los archivos vinculados siguientes.
La ruta completa se conserva en cada enlace, fuera de la cabecera visual. Un participante
puede agrupar colaboradores del mismo rol; esa agrupación no implica una clase ni un
proceso independiente. Los retornos representan el resultado o error propagado.

| Alias | Rol visual | Archivos de implementación |
| --- | --- | --- |
| `Route` | boundary | [`wasteApiRoute.js`](../../../../../../src/routes/api/warehouse/wasteApiRoute.js) |
| `Controller` | control | [`wasteController.js`](../../../../../../src/controllers/api/warehouse/wasteController.js) |
| `Domain` | control | [`wasteService.js`](../../../../../../src/services/warehouse/wastes/wasteService.js) |
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

    Client->>Route: GET /api/warehouse/wastes

    Route->>Auth: verifyApiTokenRequired(req, res, next)
    activate Auth
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    deactivate Auth
    Route->>Auth: authorizeUserApi(PERMISSIONS.WASTES_READ)(req, res, next)
    activate Auth
    break Identidad no vigente o permiso denegado
        Auth-->>Client: HTTP 401 INVALID_AUTH o HTTP 403 FORBIDDEN
    end
    deactivate Auth
    Route->>Controller: getAllWastes(req, res)
    activate Controller
    Controller->>Domain: wasteService.findAllWastes({ skip, take, search, supplierId, orderBy, orderDir, canReadCosts: req.user.permissions.includes(PERMISSIONS.INVENTORY_COSTS_READ) })
    activate Domain
    Domain->>Prisma: waste.findMany({ where, include, skip, take, orderBy })
    activate Prisma
    Prisma-->>Domain: findMany(): Promise[Waste[]]
    deactivate Prisma
    Domain->>Prisma: waste.count(): total del recurso
    activate Prisma
    Prisma-->>Domain: count(): Promise[number] — recordsTotal
    deactivate Prisma
    Domain->>Prisma: waste.count({ where }): total filtrado
    activate Prisma
    Prisma-->>Domain: count(): Promise[number] — recordsFiltered
    deactivate Prisma
    alt Servicio resuelto
        Domain-->>Controller: wasteService.findAllWastes(): Promise[{ data: Waste[], recordsTotal: number, recordsFiltered: number }]
        Controller-->>Client: HTTP 200 { data, recordsTotal, recordsFiltered }
    else AppError propagado
        Domain-->>Controller: throw AppError { code, message, meta, statusCode }
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
    end
    deactivate Domain
    deactivate Controller
```

