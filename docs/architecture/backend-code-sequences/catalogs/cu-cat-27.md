<a id="cu-cat-27"></a>
# `CU-CAT-27` — Consultar presentaciones

**Patrones:** `BE-P02`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/warehouse/presentationApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/presentationController.js
    participant Domain as src/services/warehouse/presentationService.js
    Note over Controller,Domain: Variables de frontera: req.query/params

    Client->>Route: GET /api/warehouse/presentations
    Route->>Route: ejecutar en orden el middleware configurado para la ruta
    Route->>Controller: getAllPresentations(req, res)
    activate Controller
    Controller->>Domain: presentationService.findAllPresentations({ query: req.query }) sirve el catálogo de sólo lectura
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

<a id="cu-cat-28"></a>
