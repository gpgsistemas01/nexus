<a id="cu-cat-18"></a>
# `CU-CAT-18` — Consultar unidad de medida

**Patrones:** `BE-P02`.

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Route@{ "type": "boundary" } as src/routes/api/admin/catalogApiRoute.js
    participant Auth@{ "type": "control" } as src/middleware/authMiddleware.js
    participant Validator@{ "type": "control" } as src/validators/forms/catalogValidations.js<br/>src/middleware/validatorMiddleware.js
    participant Controller@{ "type": "control" } as src/controllers/api/admin/catalogController.js
    participant Domain@{ "type": "control" } as src/services/admin/catalogService.js
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant ErrorHandler as src/app.js

    Client->>Route: GET /api/admin/catalogs/unit-measures
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    Auth->>Auth: authorizeUserApi(PERMISSIONS.CATALOGS_MANAGE)(req, res, next)
    Auth->>Validator: catalogNameValidation[] y validate(req, res, next)
    alt Token ausente o inválido
        Auth-->>Client: HTTP 401 { code, message }
    else PERMISSIONS.CATALOGS_MANAGE denegado
        Auth-->>Client: HTTP 403 { code, message }
    else catalogNameValidation rechaza req.body/req.params
        Validator-->>Client: HTTP 400 { errors }
    else Pipeline aceptado
        Route->>Controller: getAllCatalogEntries(req, res)
        activate Controller
        Controller->>Domain: findAllCatalogEntries(req.params.catalog, { skip, take, search })
        activate Domain
        Domain->>Prisma: model.findMany({ where, skip, take, orderBy: { name: 'asc' } })
        Prisma-->>Domain: findMany(): Promise[Object[]]
        Domain->>Prisma: model.count()
        Prisma-->>Domain: count(): Promise[number]
        Domain->>Prisma: model.count({ where })
        Prisma-->>Domain: count(): Promise[number]
        alt Servicio resuelto
            Domain-->>Controller: findAllCatalogEntries(): Promise[{ data: Object[], recordsTotal: number, recordsFiltered: number }]
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

