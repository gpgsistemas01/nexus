<a id="cu-cat-30"></a>
# `CU-CAT-30` — Consultar estados de cumplimiento

**Patrones:** `BE-P02`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/warehouse/fulfillmentStatusApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/fulfillmentStatusController.js
    participant Domain as src/services/warehouse/fulfillmentStatusService.js
    Note over Controller,Domain: Variables de frontera: req.query/params

    Client->>Route: GET /api/warehouse/fulfillment-statuses
    Route->>Route: ejecutar en orden el middleware configurado para la ruta
    Route->>Controller: getAllFulfillmentStatuses(req, res)
    activate Controller
    Controller->>Domain: fulfillmentStatusService.findAllFulfillmentStatuses({ query: req.query }) sirve estados de sólo lectura
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




<a id="cu-cat-31"></a>
