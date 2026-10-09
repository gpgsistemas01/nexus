<a id="cu-alm-02"></a>
# `CU-ALM-02` — Crear material

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `Route` | boundary | [`materialApiRoute.js`](../../../../../../src/routes/api/warehouse/materialApiRoute.js) |
| `Auth` | control | [`authMiddleware.js`](../../../../../../src/middleware/authMiddleware.js) |
| `Validator` | control | [`validatorMiddleware.js`](../../../../../../src/middleware/validatorMiddleware.js) |
| `Controller` | control | [`materialController.js`](../../../../../../src/controllers/api/warehouse/materialController.js) |
| `MaterialDto` | control | [`materialDTO.js`](../../../../../../src/dtos/materialDTO.js) |
| `Domain` | control | [`materialService.js`](../../../../../../src/services/warehouse/materials/materialService.js) |
| `Helpers` | control | [`materialHelpers.js`](../../../../../../src/services/warehouse/materials/materialHelpers.js) |
| `Relations` | control | [`materialRelations.js`](../../../../../../src/services/warehouse/materials/materialRelations.js) |
| `SupplierMaterial` | control | [`supplierMaterialService.js`](../../../../../../src/services/warehouse/materials/supplierMaterialService.js) |
| `Reason` | control | [`reasonService.js`](../../../../../../src/services/warehouse/reasonService.js) |
| `Adjustment` | control | [`adjustmentService.js`](../../../../../../src/services/warehouse/adjustmentService.js) |
| `ErrorHandler` | control | [`app.js`](../../../../../../src/app.js) |
| `ValidationRules` | control | [`materialValidations.js`](../../../../../../src/validators/forms/materialValidations.js) |
| `Formatter` | control | [`formattersUtils.js`](../../../../../../src/utils/formattersUtils.js) |

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
    participant Formatter@{ "type": "control" } as Formato
    participant MaterialDto@{ "type": "control" } as DTO funcional
    participant Domain@{ "type": "control" } as Servicio de dominio
    participant Helpers@{ "type": "control" } as Helpers del dominio
    participant Relations@{ "type": "control" } as Relaciones de acceso
    participant SupplierMaterial@{ "type": "control" } as Proveedor / material
    participant Reason@{ "type": "control" } as Motivo de ajuste
    participant Adjustment@{ "type": "control" } as Ajuste
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant ErrorHandler@{ "type": "control" } as Errores Express

    Client->>Route: POST /api/warehouse/materials { req.body }
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    Route->>ValidationRules: materialValidation[] — cadena ejecutada por Express
    Route->>Validator: validate(req, res, next)
    break Validación rechazada
        Validator-->>Client: HTTP 400 { errors }
    end
    Route->>Auth: authorizeUserApi(PERMISSIONS.MATERIALS_WRITE)(req, res, next)
    break Identidad no vigente o permiso denegado
        Auth-->>Client: HTTP 401 INVALID_AUTH o HTTP 403 FORBIDDEN
    end
    Route->>Controller: registerMaterial(req, res)
    Controller->>MaterialDto: createMaterialDtoForRegister(req.body)
    alt req.body.creationContext es goodsReceipt
        MaterialDto-->>Controller: createMaterialDtoForRegister(): Object (materialDto)
    else Alta directa de material
        MaterialDto-->>Controller: createMaterialDtoForRegister(): Object (materialDto)
    end
    Controller->>Formatter: sanitizeEmptyStrings(materialDto)
    Controller->>Domain: createMaterial({ materialDto: sanitizedMaterialDto, userId: req.user.id })
    activate Domain
    Domain->>Prisma: getDb().$transaction(async tx => ...)
    Domain->>Helpers: prepareMaterialData({ tx, materialDto: materialData })
    activate Helpers
    Helpers-->>Domain: prepareMaterialData(): Promise[Object ({ rest, relations })]
    deactivate Helpers
    Domain->>Prisma: tx.material.findFirst({ identidad })
    alt Identidad existente
        Domain->>Prisma: tx.supplierMaterial.findUnique({ supplierId_materialId })
        break Relación con el proveedor ya existente
            Domain-->>Controller: throw MaterialAlreadyExists
        end
    else Identidad nueva
        Domain->>Prisma: tx.material.create({ data: buildMaterialData(...) })
        activate Prisma
        Prisma-->>Domain: create(): Promise[{ id: number }]
        deactivate Prisma
    end
    Domain->>Relations: syncSupplierMaterial({ tx, supplierId, materialId, maxUnitCost, isActive })
    opt Alta directa con newStock
        Domain->>Reason: findInitialStockAdjustmentReason({ tx })
        activate Reason
        Reason-->>Domain: findInitialStockAdjustmentReason(): Promise[Object]
        deactivate Reason
        Domain->>Adjustment: createStockAdjustment({ tx, materialId, supplierId, reasonId, observations, newStock, userId })
    end
    Domain->>SupplierMaterial: findSupplierMaterialByIds({ tx, materialId, supplierId })
    activate SupplierMaterial
    SupplierMaterial-->>Domain: findSupplierMaterialByIds(): Promise[SupplierMaterial]
    deactivate SupplierMaterial
    Prisma-->>Domain: commit
    Domain-->>Controller: createMaterial(): Promise[SupplierMaterial]
    Controller-->>Client: HTTP 200 { material: supplierMaterial, code }
    opt AppError o error de persistencia
        Domain-->>Controller: throw AppError { code, message, meta, statusCode }
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: HTTP error { code, message, meta }
    end
    deactivate Domain
```
