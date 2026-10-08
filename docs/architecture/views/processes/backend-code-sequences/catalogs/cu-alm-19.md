<a id="cu-alm-19"></a>
# `CU-ALM-19` — Editar consumible

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`.

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Route@{ "type": "boundary" } as src/routes/api/warehouse/consumableApiRoute.js
    participant Auth@{ "type": "control" } as src/middleware/authMiddleware.js
    participant Validator@{ "type": "control" } as src/validators/forms/materialValidations.js<br/>src/middleware/validatorMiddleware.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/consumableController.js
    participant MaterialDto@{ "type": "entity" } as materialDto: Object<br/>src/dtos/materialDTO.js
    participant Domain@{ "type": "control" } as src/services/warehouse/consumables/consumableService.js
    participant MaterialService@{ "type": "control" } as src/services/warehouse/materials/materialService.js
    participant ErrorHandler as src/app.js

    Client->>Route: PATCH /api/warehouse/consumables/:id
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    Route->>Validator: materialEditValidation[] y validate(req, res, next)
    break Validación rechazada
        Validator-->>Client: HTTP 400 { errors }
    end
    Route->>Auth: authorizeUserApi(PERMISSIONS.MATERIALS_WRITE)(req, res, next)
    break Identidad no vigente o permiso denegado
        Auth-->>Client: HTTP 401 INVALID_AUTH o HTTP 403 FORBIDDEN
    end
    Route->>Controller: editConsumable(req, res)
    activate Controller
    Controller->>MaterialDto: createMaterialDtoForEdit(req.body)
    MaterialDto-->>Controller: createMaterialDtoForEdit(): Object (materialDto)
    Controller->>Domain: updateConsumable(materialDto, req.params.id) sincroniza datos y relación
    activate Domain
    Domain->>MaterialService: updateMaterial(materialDto, id, { type: CONSUMABLE })
    alt Servicio resuelto
        MaterialService-->>Domain: updateMaterial(): Promise[SupplierMaterial]
        Domain-->>Controller: updateConsumable(): Promise[SupplierMaterial]
        Controller-->>Client: HTTP 200 { material: supplierMaterial, code }
    else AppError propagado
        Domain-->>Controller: throw AppError { code, message, meta, statusCode }
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
    end
    deactivate Domain
    deactivate Controller
```
