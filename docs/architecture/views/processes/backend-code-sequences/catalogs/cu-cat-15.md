<a id="cu-cat-15"></a>
# `CU-CAT-15` — Consultar presentación

**Patrones:** `BE-P02`.

## Participantes y trazabilidad

Los nombres breves del diagrama corresponden a los archivos vinculados siguientes.
La ruta completa se conserva en cada enlace, fuera de la cabecera visual. Un participante
puede agrupar colaboradores del mismo rol; esa agrupación no implica una clase ni un
proceso independiente. Los retornos representan el resultado o error propagado.

| Alias | Rol visual | Archivos de implementación |
| --- | --- | --- |
| `Route` | boundary | [`catalogApiRoute.js`](../../../../../../src/routes/api/admin/catalogApiRoute.js) |
| `Auth` | control | [`authMiddleware.js`](../../../../../../src/middleware/authMiddleware.js) |
| `Validator` | control | [`catalogValidations.js`](../../../../../../src/validators/forms/catalogValidations.js)<br/>[`validatorMiddleware.js`](../../../../../../src/middleware/validatorMiddleware.js) |
| `Controller` | control | [`catalogController.js`](../../../../../../src/controllers/api/admin/catalogController.js) |
| `Domain` | control | [`catalogService.js`](../../../../../../src/services/admin/catalogService.js) |
| `ErrorHandler` | control | [`app.js`](../../../../../../src/app.js) |

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Route@{ "type": "boundary" } as Router API
    participant Auth@{ "type": "control" } as Acceso
    participant Validator@{ "type": "control" } as Validación HTTP
    participant Controller@{ "type": "control" } as Controller
    participant Domain@{ "type": "control" } as Servicio de dominio
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant ErrorHandler@{ "type": "control" } as Errores Express

    Client->>Route: GET /api/admin/catalogs/presentations
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    Route->>Auth: authorizeUserApi(PERMISSIONS.CATALOGS_MANAGE)(req, res, next)
    break Identidad no vigente o permiso denegado
        Auth-->>Client: HTTP 401 INVALID_AUTH o HTTP 403 FORBIDDEN
    end
    Route->>Validator: catalogNameValidation[] y validate(req, res, next)
    break Validación rechazada
        Validator-->>Client: HTTP 400 { errors }
    end
    Route->>Controller: getAllCatalogEntries(req, res)
    activate Controller
    Controller->>Domain: findAllCatalogEntries(req.params.catalog, { skip, take, search })
    activate Domain
    Domain->>Prisma: model.findMany({ where, skip, take, orderBy: { name: 'asc' } })
    activate Prisma
    Prisma-->>Domain: findMany(): Promise[Object[]]
    deactivate Prisma
    Domain->>Prisma: model.count()
    activate Prisma
    Prisma-->>Domain: count(): Promise[number]
    deactivate Prisma
    Domain->>Prisma: model.count(): total del recurso
    activate Prisma
    Prisma-->>Domain: count(): Promise[number] — recordsTotal
    deactivate Prisma
    Domain->>Prisma: model.count({ where }): total filtrado
    activate Prisma
    Prisma-->>Domain: count(): Promise[number] — recordsFiltered
    deactivate Prisma
    alt Servicio resuelto
        Domain-->>Controller: findAllCatalogEntries(): Promise[{ data: Object[], recordsTotal: number, recordsFiltered: number }]
        Controller-->>Client: HTTP 200 { data, recordsTotal, recordsFiltered }
    else AppError propagado
        Domain-->>Controller: throw AppError { code, message, meta, statusCode }
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
    end
    deactivate Domain
    deactivate Controller
```

