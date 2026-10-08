<a id="cu-sal-12"></a>
# `CU-SAL-12` — Surtir merma

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`, `BE-P05`.

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Router@{ "type": "boundary" } as src/routes/api/warehouse/wasteIssueApiRoute.js
    participant Auth@{ "type": "control" } as src/middleware/authMiddleware.js
    participant Validator@{ "type": "control" } as src/validators/forms/wasteIssueValidations.js<br/>src/middleware/validatorMiddleware.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/wasteIssueController.js
    participant IssueDto@{ "type": "entity" } as wasteIssueDto: Object<br/>src/dtos/wasteIssueDTO.js
    participant Service@{ "type": "control" } as src/services/warehouse/wasteIssues/wasteIssueService.js
    participant Rules@{ "type": "control" } as src/services/warehouse/issues/issueFulfillmentRules.js
    participant Movement@{ "type": "control" } as src/services/warehouse/wastes/wasteMovementService.js
    participant Stock@{ "type": "control" } as src/services/warehouse/wastes/wasteInventoryService.js
    participant Status@{ "type": "control" } as src/services/warehouse/wasteIssues/wasteIssueFulfillmentService.js
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant Socket as src/utils/socketUtils.js

    Client->>Router: PATCH /api/warehouse/waste-issues/:id/details + accessToken
    Router->>Auth: verifyApiTokenRequired(req, res, next)
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    Router->>Validator: wasteIssueDetailsValidation[] y validate(req, res, next)
    break Validación rechazada
        Validator-->>Client: HTTP 400 { errors }
    end
    Router->>Auth: authorizeUserApi(PERMISSIONS.WASTE_ISSUES_SUPPLY)(req, res, next)
    break Identidad no vigente o permiso denegado
        Auth-->>Client: HTTP 401 INVALID_AUTH o HTTP 403 FORBIDDEN
    end
    Router->>Controller: editWasteIssueDetails(req, res)
    Controller->>IssueDto: createWasteIssueDetailsDtoForEdit(req.body)
    IssueDto-->>Controller: createWasteIssueDetailsDtoForEdit(): Object (wasteIssueDto)
    Controller->>Service: updateWasteIssueDetails({ id, wasteIssueDto: sanitizedWasteIssueDto })
    Service->>Prisma: updateWasteIssueDetailsTransaction({ id, wasteIssueDto }) abre getDb().$transaction()
    Service->>Service: updateWasteIssueDetailsTransaction() valida estado, ids y snapshots
    Service->>Status: findWasteIssueFulfillmentStatusIds(tx)
    loop Cada detalle nuevo con isSupplied
        Service->>Rules: resolveIssueDetailFulfillmentStatus(detail)
        Service->>Prisma: tx.wasteIssueDetail.update({ where, data })
        Service->>Service: supplyDetails.push({ wasteIssueDetailId, quantity })
    end
    Service->>Movement: applyWasteMovement({ tx, reference: { wasteIssueId }, movementType: ISSUE, details })
    Movement->>Stock: applyWasteStockChange({ tx, id: wasteId, quantityChange, convertedQuantityChange })
    Movement->>Prisma: createWasteMovement({ tx, reference, movementType: ISSUE, details })
    Service->>Prisma: tx.wasteIssueDetail.findMany({ where: { wasteIssueId: id } })
    Service->>Rules: resolveIssueFulfillmentStatus(details)
    Service->>Prisma: tx.wasteIssue.update({ where, data })
    alt Commit confirmado
        Service-->>Controller: updateWasteIssueDetails(): Promise[WasteIssue]
        Controller->>Socket: emitInventoryUpdated({ context: 'waste', source: 'waste-issue-supplied' })
        Controller-->>Client: 200 { wasteIssue, code }
    else Stock insuficiente, estado inválido o error Prisma
        Prisma-->>Service: error de dominio o persistencia
        Service-->>Controller: error tipado y rollback
        Controller-->>Client: status HTTP { code, message }
    end
```

