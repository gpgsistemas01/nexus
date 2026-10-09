<a id="cu-cat-24"></a>
# `CU-CAT-24` — Consultar estado de cumplimiento

**Patrones:** `BE-P02`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `Route` | boundary | [`catalogApiRoute.js`](../../../../../../src/routes/api/admin/catalogApiRoute.js) |
| `Auth` | control | [`authMiddleware.js`](../../../../../../src/middleware/authMiddleware.js) |
| `Validator` | control | [`validatorMiddleware.js`](../../../../../../src/middleware/validatorMiddleware.js) |
| `Controller` | control | [`catalogController.js`](../../../../../../src/controllers/api/admin/catalogController.js) |
| `Domain` | control | [`catalogService.js`](../../../../../../src/services/admin/catalogService.js) |
| `ErrorHandler` | control | [`app.js`](../../../../../../src/app.js) |
| `ValidationRules` | control | [`catalogValidations.js`](../../../../../../src/validators/forms/catalogValidations.js) |

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Route@{ "type": "boundary" } as Router API
    participant Auth@{ "type": "control" } as Acceso
    participant ValidationRules@{ "type": "control" } as Reglas de entrada
    participant Validator@{ "type": "control" } as Validación HTTP
    participant Controller@{ "type": "control" } as Controller
    participant Domain@{ "type": "control" } as Servicio de dominio
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant ErrorHandler@{ "type": "control" } as Errores Express

    Client->>Route: GET /api/admin/catalogs/fulfillment-statuses
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    Route->>Auth: authorizeUserApi(PERMISSIONS.CATALOGS_MANAGE)(req, res, next)
    break Identidad no vigente o permiso denegado
        Auth-->>Client: HTTP 401 INVALID_AUTH o HTTP 403 FORBIDDEN
    end
    Route->>ValidationRules: catalogNameValidation[] — cadena ejecutada por Express
    Route->>Validator: validate(req, res, next)
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

