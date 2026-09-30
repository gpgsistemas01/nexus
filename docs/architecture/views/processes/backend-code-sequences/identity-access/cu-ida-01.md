<a id="cu-ida-01"></a>
# `CU-IDA-01` — Consultar personas

**Patrones:** `BE-P01`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/admin/personApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/admin/personController.js
    participant Domain as src/services/admin/person/personService.js
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant ErrorHandler as src/app.js

    Client->>Route: GET /api/admin/persons
    Route->>Controller: getAllPersons(req, res)
    activate Controller
    Controller->>Domain: personService.findAllPersons({ departments, roles: roleFilters, skip, take, search, orderBy, orderDir, includeAccesses })
    activate Domain
    Domain->>Prisma: person.findMany({ where, include, skip, take, orderBy })
    Prisma-->>Domain: findMany(): Promise[Person[]]
    Domain->>Prisma: person.count({ where })
    Prisma-->>Domain: count(): Promise[number]
    alt Servicio resuelto
        Domain-->>Controller: personService.findAllPersons(): Promise[{ data: Person[], recordsTotal: number, recordsFiltered: number }]
        Controller-->>Client: HTTP 2xx { code, data }
    else AppError propagado
        Domain-->>Controller: throw AppError { code, message, meta, statusCode }
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
    end
    deactivate Domain
    deactivate Controller
```

