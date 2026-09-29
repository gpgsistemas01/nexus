<a id="cu-sal-09"></a>
# `CU-SAL-09` — Crear salida de merma

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`.

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
    participant Reference as src/services/document/referenceNumberService.js
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant ErrorHandler as src/app.js

    Client->>Route: POST /api/warehouse/waste-issues
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    Auth->>Validator: wasteIssueValidation[] y validate(req, res, next)
    Validator->>Auth: authorizeUserApi(PERMISSIONS.WASTE_ISSUES_MANAGE)(req, res, next)
    alt Token ausente o inválido
        Auth-->>Client: HTTP 401 { code, message }
    else wasteIssueValidation rechaza req.body/req.params
        Validator-->>Client: HTTP 400 { errors }
    else PERMISSIONS.WASTE_ISSUES_MANAGE denegado
        Auth-->>Client: HTTP 403 { code, message }
    else Pipeline aceptado
        Route->>Controller: registerWasteIssue(req, res)
        activate Controller
        Controller->>IssueDto: createWasteIssueDtoForRegister(req.body)
        IssueDto-->>Controller: createWasteIssueDtoForRegister(): Object (wasteIssueDto)
        Controller->>Controller: sanitizeEmptyStrings(wasteIssueDto)
        Controller->>Domain: createWasteIssue({ wasteIssueDto: sanitizedWasteIssueDto, userId: req.user.id })
        activate Domain
        Domain->>Operation: executeServiceOperation({ action: createWasteIssueTransaction, fallbackError })
        Operation->>Domain: createWasteIssueTransaction({ wasteIssueDto, userId })
        Domain->>Prisma: getDb().$transaction(async tx => ...)
        alt Datos relacionados, detalles y persistencia válidos
            Domain->>Fulfillment: findWasteIssueFulfillmentStatusIds(tx)
            Fulfillment->>Prisma: tx.fulfillmentStatus.findMany(...)
            Prisma-->>Fulfillment: findMany(): Promise[FulfillmentStatus[]]
            Fulfillment-->>Domain: findWasteIssueFulfillmentStatusIds(): Promise[Map]
            Domain->>Domain: buildWasteIssueDetails({ tx, details: requestedDetails, fulfillmentStatusId: pendingStatusId })
            Domain->>Prisma: tx.waste.findMany({ id: uniqueIds, isActive: true })
            Prisma-->>Domain: findMany(): Promise[Waste[]]
            loop Cada detalle solicitado
                Domain->>Stock: calculateConvertedQuantity({ quantity, base, height })
                Stock-->>Domain: calculateConvertedQuantity(): number
            end
            Domain->>Header: resolveIssueHeaderData({ tx, requesterId, advisorId, departmentId, clientId, issueData, statusName: APPROVED })
            Header-->>Domain: resolveIssueHeaderData(): Promise[Object]
            Domain->>Reference: generateYearlyReferenceNumber({ type: WASTE_ISSUE, tx })
            Reference->>Prisma: tx.referenceNumberCounter.upsert(...)
            Prisma-->>Reference: upsert(): Promise[ReferenceNumberCounter]
            Reference-->>Domain: generateYearlyReferenceNumber(): Promise[string]
            Domain->>Prisma: tx.wasteIssue.create({ headerData, referenceNumber, createdBy, fulfillmentStatus: PENDING, details })
            Prisma-->>Domain: create(): Promise[WasteIssue]
            Prisma-->>Domain: commit
            Domain-->>Operation: createWasteIssueTransaction(): Promise[WasteIssue]
            Operation-->>Domain: executeServiceOperation(): Promise[WasteIssue]
            Domain-->>Controller: createWasteIssue(): Promise[WasteIssue]
            Controller-->>Client: HTTP 201 { wasteIssue, code: CREATED_WASTE_ISSUE }
        else Merma repetida o inactiva, encabezado inválido, referencia o persistencia fallida
            Prisma-->>Domain: rollback
            Domain-->>Controller: throw AppError { code, message, meta, statusCode }
            Controller->>ErrorHandler: next(error)
            ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
        end
        deactivate Domain
        deactivate Controller
    end
```
