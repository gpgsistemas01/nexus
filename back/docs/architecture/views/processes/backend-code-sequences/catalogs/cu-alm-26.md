<a id="cu-alm-26"></a>
# `CU-ALM-26` — Crear artículo

**Patrones:** `[BE-P01](../../../development/design-and-construction-patterns/03-patterns-in-code.md#pipeline-dto-y-políticas-declarativas)`, `[BE-P03](../../../development/design-and-construction-patterns/03-patterns-in-code.md#transacción-eventos-y-auditoría)`, `[BE-P04](../../../development/design-and-construction-patterns/03-patterns-in-code.md#transacción-eventos-y-auditoría)`.

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Route@{ "type": "boundary" } as catalogApiRoute.js
    participant Auth@{ "type": "control" } as authMiddleware.js
    participant Rules@{ "type": "control" } as catalogValidations.js
    participant Validator@{ "type": "control" } as validatorMiddleware.js
    participant Controller@{ "type": "control" } as catalogController.js
    participant Domain@{ "type": "control" } as catalogService.js
    participant Dto@{ "type": "control" } as DTO funcional<br/>catalogDTO.js
    participant Materials@{ "type": "control" } as materialService.js
    participant Helpers@{ "type": "control" } as materialHelpers.js
    participant Db@{ "type": "database" } as Prisma / PostgreSQL
    participant ErrorHandler@{ "type": "control" } as app.js
    Client->>Route: POST /api/admin/catalogs/materials
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    Route->>Auth: authorizeUserApi(PERMISSIONS.MATERIAL_CATALOGS_MANAGE)(req, res, next)
    Auth-->>Route: authorizeUserApi(): Promise[User]
    Route->>Rules: catalogEntryValidation[]
    Route->>Validator: validate(req, res, next)
    Validator-->>Route: validate(): Promise<void>
    Route->>Controller: registerCatalogEntry(req, res, next)
    Controller->>Domain: createCatalogEntry('materials', req.body)
    Domain->>Dto: createCatalogEntryDto(catalog, input)
    Dto-->>Domain: createCatalogEntryDto(): Object
    Domain->>Materials: createMaterialCatalogEntry(data)
    Materials->>Db: tx.$transaction(callback)
    Materials->>Db: tx.material.findFirst(where: identidad)
    Db-->>Materials: findFirst(): Promise[null]
    Materials->>Helpers: prepareMaterialData(tx, data, requireSupplier: false)
    Helpers-->>Materials: prepareMaterialData(): Object
    Materials->>Db: tx.material.create(data)
    Db-->>Materials: create(): Promise[Material]
    Materials-->>Domain: createMaterialCatalogEntry(): Promise[Material]
    Domain-->>Controller: createCatalogEntry(): Promise[Material]
    alt Identidad duplicada o datos inválidos
        Domain-->>Controller: throw MaterialAlreadyExists error
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: HTTP 409 duplicado o HTTP 400 inválido sin cambios parciales
    else Artículo creado
        Controller-->>Client: HTTP 201 {data, code}
    end
```

## Participantes y trazabilidad

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `Route` | boundary | [catalogApiRoute.js](../../../../../../src/routes/api/admin/catalogApiRoute.js) |
| `Auth` | control | [authMiddleware.js](../../../../../../src/middleware/authMiddleware.js) |
| `Rules` | control | [catalogValidations.js](../../../../../../src/validators/forms/catalogValidations.js) |
| `Validator` | control | [validatorMiddleware.js](../../../../../../src/middleware/validatorMiddleware.js) |
| `Controller` | control | [catalogController.js](../../../../../../src/controllers/api/admin/catalogController.js) |
| `Domain` | control | [catalogService.js](../../../../../../src/services/admin/catalogService.js) |
| `Dto` | control | [catalogDTO.js](../../../../../../src/dtos/catalogDTO.js) |
| `Materials` | control | [materialService.js](../../../../../../src/services/warehouse/materials/materialService.js) |
| `Helpers` | control | [materialHelpers.js](../../../../../../src/services/warehouse/materials/materialHelpers.js) |
| `ErrorHandler` | control | [app.js](../../../../../../src/app.js) |
