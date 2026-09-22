<a id="cu-cat-03"></a>
# `CU-CAT-03` — Editar proveedor

**Patrones:** `BE-P01`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/warehouse/supplierApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/supplierController.js
    participant SupplierDto as «object»<br/>supplierDto<br/>src/dtos/supplierDTO.js
    participant Domain as src/services/warehouse/supplierService.js
    participant ErrorHandler as src/app.js

    Client->>Route: PUT /api/warehouse/suppliers/:id
    Route->>Controller: editSupplier(req, res)
    activate Controller
    Controller->>SupplierDto: createSupplierDtoForEdit(req.body)
    SupplierDto-->>Controller: supplierDto normalizado
    Controller->>Domain: supplierService.updateSupplier({ id: req.params.id, supplierDto }) actualiza datos del proveedor
    activate Domain
    alt Servicio resuelto
        Domain-->>Controller: supplierService.updateSupplier() resuelve datos de dominio
        Controller-->>Client: HTTP 2xx { code, data }
    else AppError propagado
        Domain-->>Controller: throw AppError { code, message, meta, statusCode }
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
    end
    deactivate Domain
    deactivate Controller
```

