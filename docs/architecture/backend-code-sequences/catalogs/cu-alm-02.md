<a id="cu-alm-02"></a>
# `CU-ALM-02` — Crear material

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/warehouse/materialApiRoute.js
    participant Auth as src/middleware/authMiddleware.js
    participant Validator as src/validators/forms/materialValidations.js<br/>src/middleware/validatorMiddleware.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/materialController.js
    participant MaterialDto as <u>materialDto: Object</u><br/>src/dtos/materialDTO.js
    participant Domain as src/services/warehouse/materials/materialService.js
    participant Helpers as src/services/warehouse/materials/materialHelpers.js
    participant Relations as src/services/warehouse/materials/materialRelations.js
    participant SupplierMaterial as src/services/warehouse/materials/supplierMaterialService.js
    participant Reason as src/services/warehouse/reasonService.js
    participant Adjustment as src/services/warehouse/adjustmentService.js
    participant Prisma as Prisma / PostgreSQL
    participant ErrorHandler as src/app.js

    Client->>Route: POST /api/warehouse/materials { req.body }
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    Auth->>Validator: materialValidation[] y validate(req, res, next)
    Validator->>Auth: authorizeUserApi(PERMISSIONS.MATERIALS_WRITE)(req, res, next)
    alt Token ausente o inválido
        Auth-->>Client: HTTP 401 { code, message }
    else materialValidation rechaza req.body según creationContext
        Validator-->>Client: HTTP 400 { errors }
    else PERMISSIONS.MATERIALS_WRITE denegado
        Auth-->>Client: HTTP 403 { code, message }
    else Pipeline aceptado
        Route->>Controller: registerMaterial(req, res)
        Controller->>MaterialDto: createMaterialDtoForRegister(req.body)
        alt req.body.creationContext es goodsReceipt
            MaterialDto-->>Controller: materialDto sin maxUnitCost, newStock ni observations
        else Alta directa de material
            MaterialDto-->>Controller: materialDto con maxUnitCost, newStock y observations
        end
        Controller->>Controller: sanitizeEmptyStrings(materialDto)
        Controller->>Domain: createMaterial({ materialDto: sanitizedMaterialDto, userId: req.user.id })
        activate Domain
        Domain->>Prisma: getDb().$transaction(async tx => ...)
        Domain->>Helpers: prepareMaterialData({ tx, materialDto: materialData })
        Helpers-->>Domain: { rest, relations }
        Domain->>Prisma: tx.material.findFirst({ identidad })
        alt Identidad existente
            Domain->>Prisma: tx.supplierMaterial.findUnique({ supplierId_materialId })
            break Relación con el proveedor ya existente
                Domain-->>Controller: throw MaterialAlreadyExists
            end
        else Identidad nueva
            Domain->>Prisma: tx.material.create({ data: buildMaterialData(...) })
            Prisma-->>Domain: { id: materialId }
        end
        Domain->>Relations: syncSupplierMaterial({ tx, supplierId, materialId, maxUnitCost, isActive })
        opt Alta directa con newStock
            Domain->>Reason: findInitialStockAdjustmentReason({ tx })
            Reason-->>Domain: initialStockReason
            Domain->>Adjustment: createStockAdjustment({ tx, materialId, supplierId, reasonId, observations, newStock, userId })
        end
        Domain->>SupplierMaterial: findSupplierMaterialByIds({ tx, materialId, supplierId })
        SupplierMaterial-->>Domain: supplierMaterial
        Prisma-->>Domain: commit
        Domain-->>Controller: supplierMaterial
        Controller-->>Client: HTTP 200 { material: supplierMaterial, code }
        opt AppError o error de persistencia
            Domain-->>Controller: throw AppError { code, message, meta, statusCode }
            Controller->>ErrorHandler: next(error)
            ErrorHandler-->>Client: HTTP error { code, message, meta }
        end
        deactivate Domain
    end
```
