<a id="cu-sal-08"></a>
# `CU-SAL-08` — Consultar salidas de merma

**Patrones:** `BE-P01`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/warehouse/wasteIssueApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/wasteIssueController.js
    participant Domain as src/services/warehouse/wasteIssues/wasteIssueService.js
    Note over Controller,Domain: Variables de frontera: req.query/params

    Client->>Route: GET /api/warehouse/waste-issues
    Route->>Route: ejecutar en orden el middleware configurado para la ruta
    Route->>Controller: getAllWasteIssues(req, res)
    activate Controller
    Controller->>Domain: wasteIssueService.findAllWasteIssues({ query: req.query }) consulta salidas de merma
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

