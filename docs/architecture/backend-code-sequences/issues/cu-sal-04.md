<a id="cu-sal-04"></a>
# `CU-SAL-04` — Editar detalles de material de una salida

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`, `BE-P05`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/warehouse/goodsIssueApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/goodsIssueController.js
    participant IssueDto as «object»<br/>goodsIssueDto<br/>src/dtos/goodsIssueDTO.js
    participant Domain as src/services/warehouse/goodsIssues/goodsIssueService.js
    participant ErrorHandler as src/app.js

    Client->>Route: PATCH /api/warehouse/goods-issues/:id/details
    Route->>Controller: editGoodsIssueDetails(req, res)
    activate Controller
    Controller->>IssueDto: createGoodsIssueDetailsDtoForEdit(req.body)
    IssueDto-->>Controller: goodsIssueDto normalizado
    Controller->>Domain: goodsIssueService.updateGoodsIssueDetails({ id: req.params.id, goodsIssueDto }) modifica cantidades todavía editables
    activate Domain
    alt Servicio resuelto
        Domain-->>Controller: goodsIssueService.updateGoodsIssueDetails() resuelve datos de dominio
        Controller-->>Client: HTTP 2xx { code, data }
    else AppError propagado
        Domain-->>Controller: throw AppError { code, message, meta, statusCode }
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
    end
    deactivate Domain
    deactivate Controller
```

