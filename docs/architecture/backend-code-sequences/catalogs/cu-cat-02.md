<a id="cu-cat-02"></a>
# `CU-CAT-02` — Crear proveedor

**Patrones:** `BE-P01`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/warehouse/supplierApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/supplierController.js
    participant SupplierDto as «object»<br/>supplierDto<br/>src/dtos/supplierDTO.js
    participant Domain as src/services/warehouse/supplierService.js
    participant ErrorHandler as src/app.js

    Client->>Route: POST /api/warehouse/suppliers
    Route->>Controller: registerSupplier(req, res)
    activate Controller
    Controller->>SupplierDto: createSupplierDtoForRegister(req.body)
    SupplierDto-->>Controller: supplierDto normalizado
    Controller->>Domain: supplierService.createSupplier({ supplierDto }) persiste el proveedor
    activate Domain
    alt Servicio resuelto
        Domain-->>Controller: supplierService.createSupplier() resuelve datos de dominio
        Controller-->>Client: HTTP 2xx { code, data }
    else AppError propagado
        Domain-->>Controller: throw AppError { code, message, meta, statusCode }
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
    end
    deactivate Domain
    deactivate Controller
```

