<a id="cu-ida-11"></a>
# `CU-IDA-11` — Consultar departamentos

**Patrones:** `BE-P02`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/admin/departmentApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/admin/departmentController.js
    participant Domain as src/services/admin/departmentService.js
    Note over Controller,Domain: Variables de frontera: req.query/params

    Client->>Route: GET /api/admin/departments
    Route->>Route: ejecutar en orden el middleware configurado para la ruta
    Route->>Controller: departmentController.getAllDepartments(req, res)
    activate Controller
    Controller->>Domain: departmentService.findAllDepartments({ query: req.query }) lee Department
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
