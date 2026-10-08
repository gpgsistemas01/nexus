<a id="cu-sal-13"></a>
# `CU-SAL-13` — Devolver merma surtida

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`, `BE-P05`.

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Router@{ "type": "boundary" } as src/routes/api/warehouse/wasteIssueApiRoute.js
    participant Auth@{ "type": "control" } as src/middleware/authMiddleware.js
    participant Validator@{ "type": "control" } as src/validators/forms/issueReturnValidations.js<br/>src/middleware/validatorMiddleware.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/wasteIssueController.js
    participant ReturnDto@{ "type": "entity" } as returnDto: Object<br/>src/dtos/wasteIssueDTO.js
    participant Service@{ "type": "control" } as src/services/warehouse/wasteIssues/detailReturns/wasteIssueReturnService.js
    participant Movement@{ "type": "control" } as src/services/warehouse/wastes/wasteMovementService.js
    participant Status@{ "type": "control" } as src/services/warehouse/wasteIssues/wasteIssueFulfillmentService.js
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant Socket as src/utils/socketUtils.js

    Client->>Router: PATCH /api/warehouse/waste-issues/:id/details/:detailId/returns + accessToken
    Router->>Auth: verifyApiTokenRequired(req, res, next)
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    Router->>Validator: issueReturnValidation[] y validate(req, res, next)
    break Validación rechazada
        Validator-->>Client: HTTP 400 { errors }
    end
    Router->>Auth: authorizeUserApi(PERMISSIONS.WASTE_ISSUES_SUPPLY)(req, res, next)
    break Identidad no vigente o permiso denegado
        Auth-->>Client: HTTP 401 INVALID_AUTH o HTTP 403 FORBIDDEN
    end
    Router->>Controller: registerWasteIssueDetailReturn(req, res)
    Controller->>ReturnDto: createWasteIssueDtoForReturn(req.body)
    ReturnDto-->>Controller: createWasteIssueDtoForReturn(): Object (returnDto)
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
        Service->>Prisma: tx.wasteIssueDetail.update({ where: { id: detailId }, data: devolución y cumplimiento })
        Service->>Prisma: tx.wasteIssueDetail.findMany({ where: { wasteIssueId: id } })
        alt todos los detalles quedan Cancelado
            Service->>Prisma: tx.wasteIssue.update({ where: { id }, data })
        end
        Service->>Prisma: tx.wasteIssueReturn.create({ data })
        Prisma-->>Service: salida de merma actualizada y commit
        Service-->>Controller: returnWasteIssueDetail(): Promise[{ ...wasteIssueReturn, detail: updatedDetail }]
        Controller->>Socket: emitInventoryUpdated({ context: 'waste', source: 'waste-issue-return-created' })
        Controller-->>Client: 200 { wasteIssueReturn, code }
    end
```
