<a id="cu-sal-09"></a>
# `CU-SAL-09` — Crear salida de merma

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/warehouse/wasteIssueApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/wasteIssueController.js
    participant IssueDto as «object»<br/>wasteIssueDto<br/>src/dtos/wasteIssueDTO.js
    participant Domain as src/services/warehouse/wasteIssues/wasteIssueService.js
    participant ErrorHandler as src/app.js

    Client->>Route: POST /api/warehouse/waste-issues
    Route->>Controller: registerWasteIssue(req, res)
    activate Controller
    Controller->>IssueDto: createWasteIssueDtoForRegister(req.body)
    IssueDto-->>Controller: wasteIssueDto normalizado
    Controller->>Domain: wasteIssueService.createWasteIssue({ wasteIssueDto }) crea encabezado y detalles de merma
    activate Domain
    alt Hay una merma repetida o inactiva
        Domain-->>Controller: WASTE_ISSUE_STATE_CONFLICT sin crear la salida
    else Las mermas son únicas
    end
    alt Servicio resuelto
        Domain-->>Controller: wasteIssueService.createWasteIssue() resuelve datos de dominio
        Controller-->>Client: HTTP 2xx { code, data }
    else AppError propagado
        Domain-->>Controller: throw AppError { code, message, meta, statusCode }
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
    end
    deactivate Domain
    deactivate Controller
```

