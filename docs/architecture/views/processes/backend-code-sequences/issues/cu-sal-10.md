<a id="cu-sal-10"></a>
# `CU-SAL-10` — Editar encabezado de salida de merma

**Patrones:** `BE-P01`, `BE-P04`.

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Route@{ "type": "boundary" } as src/routes/api/warehouse/wasteIssueApiRoute.js
    participant Auth@{ "type": "control" } as src/middleware/authMiddleware.js
    participant Validator@{ "type": "control" } as src/validators/forms/wasteIssueValidations.js<br/>src/middleware/validatorMiddleware.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/wasteIssueController.js
    participant IssueDto@{ "type": "entity" } as wasteIssueDto: Object<br/>src/dtos/wasteIssueDTO.js
    participant Domain@{ "type": "control" } as src/services/warehouse/wasteIssues/wasteIssueService.js
    participant ErrorHandler as src/app.js

    Client->>Route: PATCH /api/warehouse/waste-issues/:id/header
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    Auth->>Validator: wasteIssueHeaderValidation[] y validate(req, res, next)
    Validator->>Auth: authorizeUserApi(PERMISSIONS.WASTE_ISSUES_MANAGE)(req, res, next)
    alt Token ausente o inválido
        Auth-->>Client: HTTP 401 { code, message }
    else wasteIssueHeaderValidation rechaza req.body/req.params
        Validator-->>Client: HTTP 400 { errors }
    else PERMISSIONS.WASTE_ISSUES_MANAGE denegado
        Auth-->>Client: HTTP 403 { code, message }
    else Pipeline aceptado
        Route->>Controller: editWasteIssueHeader(req, res)
        activate Controller
        Controller->>IssueDto: createWasteIssueHeaderDtoForEdit(req.body)
        IssueDto-->>Controller: createWasteIssueHeaderDtoForEdit(): Object (wasteIssueDto)
        Controller->>Domain: wasteIssueService.updateWasteIssueHeader({ id: req.params.id, wasteIssueDto }) aplica reglas del encabezado
        activate Domain
        alt Servicio resuelto
            Domain-->>Controller: wasteIssueService.updateWasteIssueHeader(): Promise[WasteIssue]
            Controller-->>Client: HTTP 200 { wasteIssue, code }
        else AppError propagado
            Domain-->>Controller: throw AppError { code, message, meta, statusCode }
            Controller->>ErrorHandler: next(error)
            ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
        end
        deactivate Domain
        deactivate Controller
    end
```

