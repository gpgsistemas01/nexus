<a id="cu-cat-03"></a>
# `CU-CAT-03` — Editar proveedor

**Patrones:** `BE-P01`.

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Route@{ "type": "boundary" } as src/routes/api/warehouse/supplierApiRoute.js
    participant Auth@{ "type": "control" } as src/middleware/authMiddleware.js
    participant Validator@{ "type": "control" } as src/validators/forms/supplierValidations.js<br/>src/middleware/validatorMiddleware.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/supplierController.js
    participant SupplierDto@{ "type": "entity" } as supplierDto: Object<br/>src/dtos/supplierDTO.js
    participant Domain@{ "type": "control" } as src/services/warehouse/supplierService.js
    participant ErrorHandler as src/app.js

    Client->>Route: PUT /api/warehouse/suppliers/:id
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    Route->>Validator: supplierValidation[] y validate(req, res, next)
    break Validación rechazada
        Validator-->>Client: HTTP 400 { errors }
    end
    Route->>Auth: authorizeUserApi(PERMISSIONS.SUPPLIERS_UPDATE)(req, res, next)
    break Identidad no vigente o permiso denegado
        Auth-->>Client: HTTP 401 INVALID_AUTH o HTTP 403 FORBIDDEN
    end
    Route->>Controller: editSupplier(req, res)
    activate Controller
    Controller->>SupplierDto: createSupplierDtoForEdit(req.body)
    SupplierDto-->>Controller: createSupplierDtoForEdit(): Object (supplierDto)
    Controller->>Domain: supplierService.updateSupplier({ id: req.params.id, supplierDto }) actualiza datos del proveedor
    activate Domain
    alt Servicio resuelto
        Domain-->>Controller: supplierService.updateSupplier(): Promise[Supplier]
        Controller-->>Client: HTTP 2xx { code, data }
    else AppError propagado
        Domain-->>Controller: throw AppError { code, message, meta, statusCode }
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
    end
    deactivate Domain
    deactivate Controller
```

