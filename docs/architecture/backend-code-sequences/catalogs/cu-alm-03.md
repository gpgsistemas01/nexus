<a id="cu-alm-03"></a>
# `CU-ALM-03` — Editar material

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
    participant ErrorHandler as src/app.js

    Client->>Route: PATCH /api/warehouse/materials/:id
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    Auth->>Validator: materialEditValidation[] y validate(req, res, next)
    Validator->>Auth: authorizeUserApi(PERMISSIONS.MATERIALS_WRITE)(req, res, next)
    alt Token ausente o inválido
        Auth-->>Client: HTTP 401 { code, message }
    else materialEditValidation rechaza req.body/req.params
        Validator-->>Client: HTTP 400 { errors }
    else PERMISSIONS.MATERIALS_WRITE denegado
        Auth-->>Client: HTTP 403 { code, message }
    else Pipeline aceptado
        Route->>Controller: editMaterial(req, res)
        activate Controller
        Controller->>MaterialDto: createMaterialDtoForEdit(req.body)
        MaterialDto-->>Controller: materialDto normalizado
        Controller->>Domain: materialService.updateMaterial({ id: req.params.id, materialDto }) sincroniza datos y relación
        activate Domain
        alt Servicio resuelto
            Domain-->>Controller: materialService.updateMaterial() devuelve material actualizado y persistido
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

