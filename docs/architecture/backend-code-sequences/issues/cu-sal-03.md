<a id="cu-sal-03"></a>
# `CU-SAL-03` — Editar encabezado de salida de material

**Patrones:** `BE-P01`, `BE-P04`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/warehouse/goodsIssueApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/goodsIssueController.js
    participant IssueDto as «object»<br/>goodsIssueDto<br/>src/dtos/goodsIssueDTO.js
    participant Domain as src/services/warehouse/goodsIssues/goodsIssueService.js
    participant ErrorHandler as src/app.js

    Client->>Route: PATCH /api/warehouse/goods-issues/:id/header
    Route->>Controller: editGoodsIssueHeader(req, res)
    activate Controller
    Controller->>IssueDto: createGoodsIssueHeaderDtoForEdit(req.body)
    IssueDto-->>Controller: goodsIssueDto normalizado
    Controller->>Domain: goodsIssueService.updateGoodsIssueHeader({ id: req.params.id, goodsIssueDto }) aplica reglas del encabezado
    activate Domain
    alt Servicio resuelto
        Domain-->>Controller: goodsIssueService.updateGoodsIssueHeader() resuelve datos de dominio
        Controller-->>Client: HTTP 2xx { code, data }
    else AppError propagado
        Domain-->>Controller: throw AppError { code, message, meta, statusCode }
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
    end
    deactivate Domain
    deactivate Controller
```

