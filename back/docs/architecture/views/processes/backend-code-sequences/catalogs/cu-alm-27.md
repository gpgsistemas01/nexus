<a id="cu-alm-27"></a>
# `CU-ALM-27` — Editar artículo

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
    participant Lock@{ "type": "control" } as stockLockRepository.js
    participant Helpers@{ "type": "control" } as materialHelpers.js
    participant History@{ "type": "control" } as materialDocumentRepository.js
    participant Version@{ "type": "control" } as versionRepository.js
    participant Db@{ "type": "database" } as Prisma / PostgreSQL
    participant ErrorHandler@{ "type": "control" } as app.js
    Client->>Route: PUT /api/admin/catalogs/materials/:id con expectedVersion
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    Route->>Auth: authorizeUserApi(PERMISSIONS.MATERIAL_CATALOGS_MANAGE)(req, res, next)
    Auth-->>Route: authorizeUserApi(): Promise[User]
    Route->>Rules: catalogEntryEditValidation[]
    Route->>Validator: validate(req, res, next)
    Validator-->>Route: validate(): Promise<void>
    Route->>Controller: editCatalogEntry(req, res, next)
    Controller->>Domain: updateCatalogEntry('materials', id, req.body)
    Domain->>Dto: createCatalogEntryDto(catalog, input)
    Dto-->>Domain: createCatalogEntryDto(): Object
    Domain->>Materials: updateMaterialCatalogEntry(id, data + expectedVersion)
    Materials->>Lock: lockMaterialIdentity(tx, id, forEditing: true)
    Lock->>Db: tx.$queryRaw(query)
    Db-->>Lock: $queryRaw(): Promise<void>
    Materials->>Db: tx.material.findUnique({id, select})
    Db-->>Materials: findUnique(): Promise[Material]
    opt Sin proveedores vinculados y cambio de identidad
        Materials->>Helpers: prepareMaterialData(tx, data, requireSupplier: false)
        Helpers-->>Materials: prepareMaterialData(): Object
        Materials->>History: preserveMaterialSpecifications(tx, materialId, specification)
        History->>Db: tx.$executeRaw(actualiza las especificaciones de las partidas existentes)
    end
    Materials->>Version: updateVersionedRecord(model: material, expectedVersion)
    Version->>Db: material.update({where: {id, version: expectedVersion}, data})
    Version-->>Materials: updateVersionedRecord(): Promise[Material]
    Materials-->>Domain: updateMaterialCatalogEntry(): Promise[Material]
    Domain-->>Controller: updateCatalogEntry(): Promise[Material]
    alt Artículo inexistente, conflicto de versión o identidad vinculada
        Domain-->>Controller: throw error de dominio
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: HTTP 404/409 sin cambios parciales
    else Artículo actualizado
        Controller-->>Client: HTTP 200 {data, code}
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
| `Lock` | control | [stockLockRepository.js](../../../../../../src/repository/warehouse/stockLockRepository.js) |
| `Helpers` | control | [materialHelpers.js](../../../../../../src/services/warehouse/materials/materialHelpers.js) |
| `History` | control | [materialDocumentRepository.js](../../../../../../src/repository/warehouse/materialDocumentRepository.js) |
| `Version` | control | [versionRepository.js](../../../../../../src/repository/versionRepository.js) |
| `ErrorHandler` | control | [app.js](../../../../../../src/app.js) |
