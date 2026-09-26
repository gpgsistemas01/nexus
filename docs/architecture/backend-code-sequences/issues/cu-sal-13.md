<a id="cu-sal-13"></a>
# `CU-SAL-13` — Devolver merma surtida

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`, `BE-P05`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Router as src/routes/api/warehouse/wasteIssueApiRoute.js
    participant Auth as src/middleware/authMiddleware.js
    participant Validator as src/validators/forms/issueReturnValidations.js<br/>src/middleware/validatorMiddleware.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/wasteIssueController.js
    participant ReturnDto as <u>returnDto: Object</u><br/>src/dtos/wasteIssueDTO.js
    participant Service as src/services/warehouse/wasteIssues/detailReturns/wasteIssueReturnService.js
    participant Movement as src/services/warehouse/wastes/wasteMovementService.js
    participant Status as src/services/warehouse/wasteIssues/wasteIssueFulfillmentService.js
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant Socket as src/utils/socketUtils.js

    Client->>Router: PATCH /api/warehouse/waste-issues/:id/details/:detailId/returns + accessToken
    Router->>Auth: verifyApiTokenRequired(req, res, next)
    Auth->>Validator: issueReturnValidation[] y validate(req, res, next)
    Validator->>Auth: authorizeUserApi(PERMISSIONS.WASTE_ISSUES_SUPPLY)(req, res, next)
    alt Token ausente o inválido
        Auth-->>Client: HTTP 401 { code, message }
    else issueReturnValidation rechaza req.body/req.params
        Validator-->>Client: HTTP 400 { errors }
    else PERMISSIONS.WASTE_ISSUES_SUPPLY denegado
        Auth-->>Client: HTTP 403 { code, message }
    else Pipeline aceptado
        Router->>Controller: registerWasteIssueDetailReturn(req, res)
        Controller->>ReturnDto: createWasteIssueDtoForReturn(req.body)
        ReturnDto-->>Controller: returnDto normalizado
        Controller->>Service: returnWasteIssueDetail({ id, detailId, returnDto, userId })
        Service->>Prisma: getDb().$transaction(async tx => ...)
        Service->>Prisma: tx.wasteIssueDetail.findFirst({ where: { id: detailId, wasteIssueId: id } })
        Service->>Service: returnWasteIssueDetailTransaction({ id, detailId, returnDto, userId }) valida estado y cantidad
        alt Cantidad de merma no retornable
            Service-->>Service: error de dominio
            Service-->>Controller: rollback y error
        else Cantidad válida
            Service->>Movement: applyWasteMovement({ tx, reference: { wasteIssueId: id }, movementType: ENTRY, details })
            Service->>Status: findWasteIssueFulfillmentStatusIds(tx)
            Service->>Prisma: tx.wasteIssueReturn.create({ data })
            Service->>Prisma: tx.wasteIssueDetail.findMany({ where: { wasteIssueId: id } })
            alt todos los detalles quedan Cancelado
                Service->>Prisma: tx.wasteIssue.update({ where: { id }, data })
            end
            Prisma-->>Service: salida de merma actualizada y commit
            Service-->>Controller: wasteIssueReturn
            Controller->>Socket: emitInventoryUpdated({ context: 'waste', source: 'waste-issue-return-created' })
            Controller-->>Client: 200 devolución registrada
        end
    end
```
