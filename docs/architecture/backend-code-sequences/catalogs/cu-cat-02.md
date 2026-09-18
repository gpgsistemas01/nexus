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
    Note over Controller,Domain: Variables de frontera: req.body/DTO

    Client->>Route: POST /api/warehouse/suppliers
    Route->>Route: ejecutar en orden el middleware configurado para la ruta
    Route->>Controller: registerSupplier(req, res)
    activate Controller
    Controller->>SupplierDto: createSupplierDtoForRegister(req.body) → sanitizeEmptyStrings(...)
    SupplierDto-->>Controller: supplierDto normalizado
    Controller->>Domain: supplierService.createSupplier({ supplierDto }) persiste el proveedor
    activate Domain
    Domain->>Domain: comprobar datos de frontera y reglas propias de la operación
    Domain-->>Controller: resultado del servicio o error de dominio tipado
    deactivate Domain
    alt El servicio devuelve el resultado
        Controller-->>Client: status HTTP y cuerpo concretos del controller
    else El servicio propaga un error de dominio
        Controller-->>Client: error entregado al middleware final para su respuesta HTTP
    end
    deactivate Controller
```

<a id="cu-cat-03"></a>
