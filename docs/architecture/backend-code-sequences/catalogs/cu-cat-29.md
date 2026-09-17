<a id="cu-cat-29"></a>
# `CU-CAT-29` — Consultar motivos de ajuste

**Patrones:** `BE-P02`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/warehouse/reasonApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/reasonController.js
    participant Domain as src/services/warehouse/reasonService.js
    Note over Controller,Domain: Variables de frontera: req.query/params

    Client->>Route: GET /api/warehouse/reasons
    Route->>Route: ejecutar en orden el middleware configurado para la ruta
    Route->>Controller: getAllReasons(req, res)
    activate Controller
    Controller->>Domain: reasonService.findAllReasons({ query: req.query }) sirve motivos, helpers resuelven motivos internos
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

<a id="cu-cat-30"></a>
