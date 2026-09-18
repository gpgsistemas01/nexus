<a id="cu-ida-01"></a>
# `CU-IDA-01` — Consultar personas

**Patrones:** `BE-P01`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/admin/personApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/admin/personController.js
    participant Domain as src/services/admin/person/personService.js
    Note over Controller,Domain: Variables de frontera: req.query/params

    Client->>Route: GET /api/admin/persons
    Route->>Route: ejecutar en orden el middleware configurado para la ruta
    Route->>Controller: getAllPersons(req, res)
    activate Controller
    Controller->>Domain: personService.findAllPersons({ query: req.query }) consulta Person y asignaciones
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

