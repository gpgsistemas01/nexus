<a id="cu-cat-02"></a>
# `CU-CAT-02` — Crear proveedor

**Patrones:** `BE-P01`.

El origen visual no altera el contrato backend: tanto el listado de Sistemas como el selector de una
compra llaman al mismo `POST`. `suppliers:manage` autoriza el alta de Almacén, mientras
`suppliers:page-view` se comprueba únicamente al intentar abrir la vista web `/proveedores`.

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

    Client->>Route: POST /api/warehouse/suppliers
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    Route->>Validator: supplierValidation[] y validate(req, res, next)
    break Validación rechazada
        Validator-->>Client: HTTP 400 { errors }
    end
    Route->>Auth: authorizeUserApi(PERMISSIONS.SUPPLIERS_MANAGE)(req, res, next)
    break Identidad no vigente o permiso denegado
        Auth-->>Client: HTTP 401 INVALID_AUTH o HTTP 403 FORBIDDEN
    end
    Route->>Controller: registerSupplier(req, res)
    activate Controller
    Controller->>SupplierDto: createSupplierDtoForRegister(req.body)
    SupplierDto-->>Controller: createSupplierDtoForRegister(): Object (supplierDto)
    Controller->>Domain: supplierService.createSupplier({ supplierDto }) persiste el proveedor
    activate Domain
    alt Servicio resuelto
        Domain-->>Controller: supplierService.createSupplier(): Promise[Supplier]
        Controller-->>Client: HTTP 2xx { code, data }
    else AppError propagado
        Domain-->>Controller: throw AppError { code, message, meta, statusCode }
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
    end
    deactivate Domain
    deactivate Controller
```
