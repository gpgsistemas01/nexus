<a id="cu-sal-04"></a>
# `CU-SAL-04` — Editar detalles de material de una salida

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`, `BE-P05`.

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Route@{ "type": "boundary" } as src/routes/api/warehouse/goodsIssueApiRoute.js
    participant Auth@{ "type": "control" } as src/middleware/authMiddleware.js
    participant Validator@{ "type": "control" } as src/validators/forms/goodsIssueValidations.js<br/>src/middleware/validatorMiddleware.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/goodsIssueController.js
    participant IssueDto@{ "type": "entity" } as goodsIssueDto: Object<br/>src/dtos/goodsIssueDTO.js
    participant Domain@{ "type": "control" } as src/services/warehouse/goodsIssues/goodsIssueService.js
    participant Header@{ "type": "control" } as src/services/warehouse/issues/issueHeaderService.js
    participant Fulfillment@{ "type": "control" } as src/services/warehouse/fulfillmentStatusService.js
    participant DetailBuilder@{ "type": "control" } as src/services/warehouse/goodsIssues/goodsIssueHelpers.js
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant ErrorHandler as src/app.js

    Client->>Route: PATCH /api/warehouse/goods-issues/:id
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    Auth->>Validator: goodsIssueUpdateValidation[] y validate(req, res, next)
    Validator->>Auth: authorizeUserApi(PERMISSIONS.GOODS_ISSUES_MANAGE)(req, res, next)
    alt Token ausente o inválido
        Auth-->>Client: HTTP 401 { code, message }
    else goodsIssueUpdateValidation rechaza req.body/req.params
        Validator-->>Client: HTTP 400 { errors }
    else PERMISSIONS.GOODS_ISSUES_MANAGE denegado
        Auth-->>Client: HTTP 403 { code, message }
    else Pipeline aceptado
        Route->>Controller: editGoodsIssue(req, res)
        activate Controller
        Controller->>IssueDto: createGoodsIssueDtoForEdit(req.body)
        IssueDto-->>Controller: createGoodsIssueDtoForEdit(): Object (goodsIssueDto)
        Controller->>Controller: sanitizeEmptyStrings(goodsIssueDto)
        Controller->>Domain: updateGoodsIssue({ id: req.params.id, goodsIssueDto: sanitizedGoodsIssueDto })
        activate Domain
        Domain->>Prisma: getDb().goodsIssue.findUnique({ id, status, fulfillmentStatus, details })
        Prisma-->>Domain: findUnique(): Promise[GoodsIssue|null]
        alt Salida pendiente, sin cantidades surtidas y datos válidos
            Domain->>Header: resolveIssueHeaderData({ requesterId, advisorId, departmentId, clientId, issueData, errorTypes, statusName: APPROVED })
            Header-->>Domain: resolveIssueHeaderData(): Promise[Object]
            Domain->>Fulfillment: findFulfillmentStatusIdByName({ name: PENDING })
            Fulfillment-->>Domain: findFulfillmentStatusIdByName(): Promise[string|null]
            Domain->>DetailBuilder: buildGoodsIssueDetails({ details, initialFulfillmentStatusId })
            DetailBuilder-->>Domain: buildGoodsIssueDetails(): Promise[Object[]]
            Domain->>Prisma: getDb().$transaction(async tx => ...)
            Domain->>Prisma: tx.goodsIssueDetail.deleteMany({ goodsIssueId: id })
            Domain->>Prisma: tx.goodsIssueDetail.createMany({ processedDetails, goodsIssueId: id })
            Domain->>Prisma: tx.goodsIssue.update({ id, headerData, fulfillmentStatus: PENDING })
            Prisma-->>Domain: update(): Promise[GoodsIssue]
            Prisma-->>Domain: commit
            Domain-->>Controller: updateGoodsIssue(): Promise[GoodsIssue]
            Controller-->>Client: HTTP 200 { goodsIssue, code: UPDATED_GOODS_ISSUE }
        else Salida inexistente, no pendiente, ya surtida o datos relacionados inválidos
            Prisma-->>Domain: rollback si inició la transacción
            Domain-->>Controller: throw AppError { code, message, meta, statusCode }
            Controller->>ErrorHandler: next(error)
            ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
        end
        deactivate Domain
        deactivate Controller
    end
```
