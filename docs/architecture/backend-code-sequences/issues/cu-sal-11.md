<a id="cu-sal-11"></a>
# `CU-SAL-11` — Editar detalles de merma de una salida

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`, `BE-P05`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/warehouse/wasteIssueApiRoute.js
    participant Auth as src/middleware/authMiddleware.js
    participant Validator as src/validators/forms/wasteIssueValidations.js<br/>src/middleware/validatorMiddleware.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/wasteIssueController.js
    participant IssueDto as wasteIssueDto: Object<br/>src/dtos/wasteIssueDTO.js
    participant Domain as src/services/warehouse/wasteIssues/wasteIssueService.js
    participant Operation as src/services/serviceErrorHandler.js
    participant Fulfillment as src/services/warehouse/wasteIssues/wasteIssueFulfillmentService.js
    participant Header as src/services/warehouse/issues/issueHeaderService.js
    participant Stock as src/services/inventory/stockHelpers.js
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant ErrorHandler as src/app.js

    Client->>Route: PATCH /api/warehouse/waste-issues/:id
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    Auth->>Validator: wasteIssueUpdateValidation[] y validate(req, res, next)
    Validator->>Auth: authorizeUserApi(PERMISSIONS.WASTE_ISSUES_MANAGE)(req, res, next)
    alt Token ausente o inválido
        Auth-->>Client: HTTP 401 { code, message }
    else wasteIssueUpdateValidation rechaza req.body/req.params
        Validator-->>Client: HTTP 400 { errors }
    else PERMISSIONS.WASTE_ISSUES_MANAGE denegado
        Auth-->>Client: HTTP 403 { code, message }
    else Pipeline aceptado
        Route->>Controller: editWasteIssue(req, res)
        activate Controller
        Controller->>IssueDto: createWasteIssueDtoForEdit(req.body)
        IssueDto-->>Controller: createWasteIssueDtoForEdit(): Object (wasteIssueDto)
        Controller->>Controller: sanitizeEmptyStrings(wasteIssueDto)
        Controller->>Domain: updateWasteIssue({ id: req.params.id, wasteIssueDto: sanitizedWasteIssueDto })
        activate Domain
        Domain->>Operation: executeServiceOperation({ action: updateWasteIssueTransaction, fallbackError })
        Operation->>Domain: updateWasteIssueTransaction({ id, wasteIssueDto })
        Domain->>Prisma: getDb().$transaction(async tx => ...)
        Domain->>Prisma: tx.wasteIssue.findUnique({ id, details })
        Prisma-->>Domain: findUnique(): Promise[WasteIssue|null]
        alt Salida existente, sin cantidades surtidas y datos válidos
            Domain->>Fulfillment: findWasteIssueFulfillmentStatusIds(tx)
            Fulfillment-->>Domain: findWasteIssueFulfillmentStatusIds(): Promise[Map]
            Domain->>Domain: buildWasteIssueDetails({ tx, details: requestedDetails, fulfillmentStatusId: pendingStatusId })
            Domain->>Prisma: tx.waste.findMany({ id: uniqueIds, isActive: true })
            Prisma-->>Domain: findMany(): Promise[Waste[]]
            loop Cada detalle solicitado
                Domain->>Stock: calculateConvertedQuantity({ quantity, base, height })
                Stock-->>Domain: calculateConvertedQuantity(): number
            end
            Domain->>Header: resolveIssueHeaderData({ tx, dto: headerDto })
            Header-->>Domain: resolveIssueHeaderData(): Promise[Object]
            Domain->>Prisma: tx.wasteIssueDetail.deleteMany({ wasteIssueId: id })
            Domain->>Prisma: tx.wasteIssue.update({ id, headerData, fulfillmentStatus: PENDING, details })
            Prisma-->>Domain: update(): Promise[WasteIssue]
            Prisma-->>Domain: commit
            Domain-->>Operation: updateWasteIssueTransaction(): Promise[WasteIssue]
            Operation-->>Domain: executeServiceOperation(): Promise[WasteIssue]
            Domain-->>Controller: updateWasteIssue(): Promise[WasteIssue]
            Controller-->>Client: HTTP 200 { wasteIssue, code: UPDATED_WASTE_ISSUE }
        else Salida inexistente, ya surtida, merma inválida o error de persistencia
            Prisma-->>Domain: rollback
            Domain-->>Controller: throw AppError { code, message, meta, statusCode }
            Controller->>ErrorHandler: next(error)
            ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
        end
        deactivate Domain
        deactivate Controller
    end
```
