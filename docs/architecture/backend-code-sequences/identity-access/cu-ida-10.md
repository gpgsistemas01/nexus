<a id="cu-ida-10"></a>
# `CU-IDA-10` — Consultar roles

**Patrones:** `BE-P02`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/admin/roleApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/admin/roleController.js
    participant Domain as src/services/admin/roleService.js
    Note over Controller,Domain: Variables de frontera: req.query/params

    Client->>Route: GET /api/admin/roles
    Route->>Route: ejecutar en orden el middleware configurado para la ruta
    Route->>Controller: roleController.getAllRoles(req, res)
    activate Controller
    Controller->>Domain: roleService.findAllRoles({ query: req.query }) lee Role, no existe mutación publicada
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

<a id="cu-ida-11"></a>
