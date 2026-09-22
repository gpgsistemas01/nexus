<a id="cu-sal-02"></a>
# `CU-SAL-02` — Crear salida de material

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/warehouse/goodsIssueApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/goodsIssueController.js
    participant IssueDto as «object»<br/>goodsIssueDto<br/>src/dtos/goodsIssueDTO.js
    participant Domain as src/services/warehouse/goodsIssues/goodsIssueService.js
    participant ErrorHandler as src/app.js

    Client->>Route: POST /api/warehouse/goods-issues
    Route->>Controller: registerGoodsIssue(req, res)
    activate Controller
    Controller->>IssueDto: createGoodsIssueDtoForRegister(req.body)
    IssueDto-->>Controller: goodsIssueDto normalizado
    Controller->>Domain: goodsIssueService.createGoodsIssue({ goodsIssueDto }) crea encabezado y detalles solicitados
    activate Domain
    alt Servicio resuelto
        Domain-->>Controller: goodsIssueService.createGoodsIssue() resuelve datos de dominio
        Controller-->>Client: HTTP 2xx { code, data }
    else AppError propagado
        Domain-->>Controller: throw AppError { code, message, meta, statusCode }
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
    end
    deactivate Domain
    deactivate Controller
```

