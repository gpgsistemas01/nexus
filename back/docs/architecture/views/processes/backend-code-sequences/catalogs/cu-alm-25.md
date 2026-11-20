<a id="cu-alm-25"></a>
# `CU-ALM-25` — Consultar artículos

**Patrones:** `[BE-P01](../../../development/design-and-construction-patterns/03-patterns-in-code.md#pipeline-dto-y-políticas-declarativas)`, `[BE-P06](../../../development/design-and-construction-patterns/03-patterns-in-code.md#estructura-por-dominio-capas-y-fronteras)`.

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Route@{ "type": "boundary" } as catalogApiRoute.js
    participant Auth@{ "type": "control" } as authMiddleware.js
    participant Controller@{ "type": "control" } as catalogController.js
    participant Domain@{ "type": "control" } as catalogService.js
    participant Materials@{ "type": "control" } as materialCatalogService.js
    participant Page@{ "type": "control" } as paginationRepository.js
    participant Db@{ "type": "database" } as Prisma / PostgreSQL
    participant ErrorHandler@{ "type": "control" } as app.js
    Client->>Route: GET /api/admin/catalogs/materials?search[value]=tornillo&start=0&length=10
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    Auth-->>Route: verifyApiTokenRequired(): Promise[User]
    Route->>Controller: getAllCatalogEntries(req, res, next)
    Controller->>Controller: getDataTablePaging(req.query)
    Controller->>Controller: getDataTableSearch(req.query)
    Controller->>Domain: findAllCatalogEntries('materials', {skip, take, search})
    Domain->>Materials: findMaterialCatalogEntries({skip, take, search})
    Materials->>Page: findPage({model, query, hasFilters})
    Page->>Db: model.findMany(query)
    Page->>Db: model.count({where})
    Db-->>Page: findMany(): Promise[Material[]]
    Page-->>Materials: findPage(): Promise[Page]
    Materials-->>Domain: findMaterialCatalogEntries(): Promise[Page]
    Domain-->>Controller: findAllCatalogEntries(): Promise[Page]
    alt Catálogo inexistente
        Domain-->>Controller: throw CatalogNotFound error
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: HTTP 404 {code, message}
    else Consulta disponible
        Controller-->>Client: HTTP 200 {data, recordsTotal, recordsFiltered}
    end
```

## Participantes y trazabilidad

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `Route` | boundary | [catalogApiRoute.js](../../../../../../src/routes/api/admin/catalogApiRoute.js) |
| `Auth` | control | [authMiddleware.js](../../../../../../src/middleware/authMiddleware.js) |
| `Controller` | control | [catalogController.js](../../../../../../src/controllers/api/admin/catalogController.js) |
| `Domain` | control | [catalogService.js](../../../../../../src/services/admin/catalogService.js) |
| `Materials` | control | [materialCatalogService.js](../../../../../../src/services/warehouse/materials/materialCatalogService.js) |
| `Page` | control | [paginationRepository.js](../../../../../../src/repository/paginationRepository.js) |
| `ErrorHandler` | control | [app.js](../../../../../../src/app.js) |
