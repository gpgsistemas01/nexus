<a id="cu-sal-10"></a>
# `CU-SAL-10` — Editar encabezado de salida de merma

**Patrones:** `BE-P01`, `BE-P04`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/warehouse/wasteIssueApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/wasteIssueController.js
    participant IssueDto as «object»<br/>wasteIssueDto<br/>src/dtos/wasteIssueDTO.js
    participant Domain as src/services/warehouse/wasteIssues/wasteIssueService.js
    participant ErrorHandler as src/app.js

    Client->>Route: PATCH /api/warehouse/waste-issues/:id/header
    Route->>Controller: editWasteIssueHeader(req, res)
    activate Controller
    Controller->>IssueDto: createWasteIssueHeaderDtoForEdit(req.body)
    IssueDto-->>Controller: wasteIssueDto normalizado
    Controller->>Domain: wasteIssueService.updateWasteIssueHeader({ id: req.params.id, wasteIssueDto }) aplica reglas del encabezado
    activate Domain
    alt Servicio resuelto
        Domain-->>Controller: wasteIssueService.updateWasteIssueHeader() resuelve datos de dominio
        Controller-->>Client: HTTP 2xx { code, data }
    else AppError propagado
        Domain-->>Controller: throw AppError { code, message, meta, statusCode }
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
    end
    deactivate Domain
    deactivate Controller
```

