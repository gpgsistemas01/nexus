<a id="cu-cat-03"></a>
# `CU-CAT-03` — Editar proveedor

**Patrones:** `BE-P01`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/warehouse/supplierApiRoute.js
    participant Auth as src/middleware/authMiddleware.js
    participant Validator as src/validators/forms/supplierValidations.js<br/>src/middleware/validatorMiddleware.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/supplierController.js
    participant SupplierDto as <u>supplierDto: Object</u><br/>src/dtos/supplierDTO.js
    participant Domain as src/services/warehouse/supplierService.js
    participant ErrorHandler as src/app.js

    Client->>Route: PUT /api/warehouse/suppliers/:id
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    Auth->>Validator: supplierValidation[] y validate(req, res, next)
    Validator->>Auth: authorizeUserApi(PERMISSIONS.SUPPLIERS_UPDATE)(req, res, next)
    alt Token ausente o inválido
        Auth-->>Client: HTTP 401 { code, message }
    else supplierValidation rechaza req.body/req.params
        Validator-->>Client: HTTP 400 { errors }
    else PERMISSIONS.SUPPLIERS_UPDATE denegado
        Auth-->>Client: HTTP 403 { code, message }
    else Pipeline aceptado
        Route->>Controller: editSupplier(req, res)
        activate Controller
        Controller->>SupplierDto: createSupplierDtoForEdit(req.body)
        SupplierDto-->>Controller: supplierDto normalizado
        Controller->>Domain: supplierService.updateSupplier({ id: req.params.id, supplierDto }) actualiza datos del proveedor
        activate Domain
        alt Servicio resuelto
            Domain-->>Controller: supplierService.updateSupplier() devuelve supplier actualizado y persistido
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

