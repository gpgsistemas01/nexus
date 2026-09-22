<a id="cu-sal-01"></a>
# `CU-SAL-01` — Consultar salidas de material

**Patrones:** `BE-P01`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/warehouse/goodsIssueApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/goodsIssueController.js
    participant Domain as src/services/warehouse/goodsIssues/goodsIssueService.js
    participant ErrorHandler as src/app.js

    Client->>Route: GET /api/warehouse/goods-issues
    Route->>Controller: getAllGoodsIssues(req, res)
    activate Controller
    Controller->>Domain: goodsIssueService.findAllGoodsIssues({ query: req.query }) consulta documentos y estados
    activate Domain
    alt Servicio resuelto
        Domain-->>Controller: goodsIssueService.findAllGoodsIssues() resuelve datos de dominio
        Controller-->>Client: HTTP 2xx { code, data }
    else AppError propagado
        Domain-->>Controller: throw AppError { code, message, meta, statusCode }
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
    end
    deactivate Domain
    deactivate Controller
```

