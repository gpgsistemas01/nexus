<a id="cu-sal-01"></a>
# `CU-SAL-01` — Consultar salidas de material

**Patrones:** `BE-P01`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/warehouse/goodsIssueApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/goodsIssueController.js
    participant Domain as src/services/warehouse/goodsIssues/goodsIssueService.js
    Note over Controller,Domain: Variables de frontera: req.query/params

    Client->>Route: GET /api/warehouse/goods-issues
    Route->>Route: ejecutar en orden el middleware configurado para la ruta
    Route->>Controller: getAllGoodsIssues(req, res)
    activate Controller
    Controller->>Domain: goodsIssueService.findAllGoodsIssues({ query: req.query }) consulta documentos y estados
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

