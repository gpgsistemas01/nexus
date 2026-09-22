<a id="cu-alm-10"></a>
# `CU-ALM-10` — Registrar merma

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`, `BE-P05`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/warehouse/wasteApiRoute.js
    participant Auth as src/middleware/authMiddleware.js
    participant Validator as src/validators/forms/wasteValidations.js<br/>src/middleware/validatorMiddleware.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/wasteController.js
    participant WasteDto as <u>wasteDto: Object</u><br/>src/dtos/wasteDTO.js
    participant Formatter as src/utils/formattersUtils.js
    participant Domain as src/services/warehouse/wastes/wasteMaterialService.js<br/>src/services/warehouse/wastes/wasteService.js
    participant Socket as src/utils/socketUtils.js
    participant ErrorHandler as src/app.js

    Client->>Route: GET /api/warehouse/wastes/material-templates
    Route->>Auth: verifyApiTokenRequired(req, res, next) y authorizeUserApi(PERMISSIONS.WASTES_READ)
    Route->>Controller: getWasteMaterialTemplates(req, res)
    Controller->>Domain: findWasteMaterialTemplates({ search, skip, take, supplierId })
    Domain-->>Controller: plantillas activas de material, presentación y unidad
    Controller-->>Client: HTTP 200 { code, data: templates }

    Client->>Route: POST /api/warehouse/wastes
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    Auth->>Validator: wasteValidation[] y validate(req, res, next)
    Validator->>Auth: authorizeUserApi(PERMISSIONS.WASTES_WRITE)(req, res, next)
    alt Token ausente o inválido
        Auth-->>Client: HTTP 401 { code, message }
    else wasteValidation rechaza req.body
        Validator-->>Client: HTTP 400 { errors }
    else PERMISSIONS.WASTES_WRITE denegado
        Auth-->>Client: HTTP 403 { code, message }
    else Pipeline aceptado
        Route->>Controller: registerWaste(req, res)
        activate Controller
        Controller->>WasteDto: createWasteDtoForRegister(req.body)
        WasteDto-->>Controller: wasteDto normalizado
        Controller->>Formatter: sanitizeEmptyStrings(wasteDto)
        Formatter-->>Controller: sanitizedWasteDto
        Controller->>Domain: createWasteWithInitialStockAdjustment({ wasteDto: sanitizedWasteDto, userId: req.user.id })
        activate Domain
        Domain->>Domain: findWasteByIdentity({ tx, supplierId, name, base, height })
        alt La merma ya existe
            Domain-->>Controller: WASTE_ALREADY_EXISTS sin incrementar stock
        else La merma no existe
            Domain->>Domain: createWasteWithInitialStockAdjustment({ wasteDto, userId }) crea merma, ajuste y movimiento inicial
        end
        alt Registro confirmado
            Domain-->>Controller: merma con existencia inicial y relaciones persistidas
            Controller->>Socket: emitInventoryUpdated({ context: 'waste', source: 'waste-created' })
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
