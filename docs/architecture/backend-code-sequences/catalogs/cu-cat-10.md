<a id="cu-cat-10"></a>
# `CU-CAT-10` — Consultar proveedores

**Patrones:** `BE-P01`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/warehouse/supplierApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/supplierController.js
    participant Domain as src/services/warehouse/supplierService.js
    Note over Controller,Domain: Variables de frontera: req.query/params

    Client->>Route: GET /api/warehouse/suppliers
    Route->>Route: ejecutar en orden el middleware configurado para la ruta
    Route->>Controller: getAllSuppliers(req, res)
    activate Controller
    Controller->>Domain: supplierService.findAllSuppliers({ query: req.query }) consulta proveedores
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

<a id="cu-cat-11"></a>
