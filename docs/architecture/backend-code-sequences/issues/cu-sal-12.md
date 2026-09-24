<a id="cu-sal-12"></a>
# `CU-SAL-12` — Surtir merma

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`, `BE-P05`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Router as src/routes/api/warehouse/wasteIssueApiRoute.js
    participant Auth as src/middleware/authMiddleware.js
    participant Validator as src/validators/forms/wasteIssueValidations.js<br/>src/middleware/validatorMiddleware.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/wasteIssueController.js
    participant IssueDto as <u>wasteIssueDto: Object</u><br/>src/dtos/wasteIssueDTO.js
    participant Service as src/services/warehouse/wasteIssues/wasteIssueService.js
    participant Rules as src/services/warehouse/issues/issueFulfillmentRules.js
    participant Movement as src/services/warehouse/wastes/wasteMovementService.js
    participant Stock as src/services/warehouse/wastes/wasteInventoryService.js
    participant Status as src/services/warehouse/wasteIssues/wasteIssueFulfillmentService.js
    participant Prisma as Prisma / PostgreSQL
    participant Socket as src/utils/socketUtils.js

    Client->>Router: PATCH /api/warehouse/waste-issues/:id/details + accessToken
    Router->>Auth: verifyApiTokenRequired(req, res, next)
    Auth->>Validator: wasteIssueDetailsValidation[] y validate(req, res, next)
    Validator->>Auth: authorizeUserApi(PERMISSIONS.WASTE_ISSUES_SUPPLY)(req, res, next)
    alt Token ausente o inválido
        Auth-->>Client: HTTP 401 { code, message }
    else wasteIssueDetailsValidation rechaza req.body/req.params
        Validator-->>Client: HTTP 400 { errors }
    else PERMISSIONS.WASTE_ISSUES_SUPPLY denegado
        Auth-->>Client: HTTP 403 { code, message }
    else Pipeline aceptado
        Router->>Controller: editWasteIssueDetails(req, res)
        Controller->>IssueDto: createWasteIssueDetailsDtoForEdit(req.body)
        IssueDto-->>Controller: wasteIssueDto normalizado
        Controller->>Service: updateWasteIssueDetails({ id, details: wasteIssueDto.details })
        Service->>Prisma: updateWasteIssueDetailsTransaction({ id, wasteIssueDto }) abre getDb().$transaction()
        Service->>Service: updateWasteIssueDetailsTransaction() valida estado, ids y snapshots
        Service->>Status: findWasteIssueFulfillmentStatusIds(tx)
        loop Cada detalle nuevo con isSupplied
            Service->>Rules: resolveIssueDetailFulfillmentStatus(detail)
            Service->>Prisma: tx.wasteIssueDetail.update({ where, data })
            Service->>Movement: movementDetails.push({ wasteIssueDetailId, quantity })
            Movement->>Stock: applyWasteStockChange({ tx, wasteId, quantityDelta })
        end
        Service->>Movement: applyWasteMovement({ tx, reference: { wasteIssueId }, movementType: ISSUE, details })
        Movement->>Prisma: createWasteMovement({ tx, reference, movementType: ISSUE, details })
        Service->>Rules: resolveIssueFulfillmentStatus(details)
        Service->>Prisma: tx.wasteIssue.update({ where, data })
        alt Commit confirmado
            Service-->>Controller: wasteIssue actualizado
            Controller->>Socket: emitInventoryUpdated()
            Controller-->>Client: 200 { wasteIssue, code }
        else Stock insuficiente, estado inválido o error Prisma
            Prisma-->>Service: error de dominio o persistencia
            Service-->>Controller: error tipado y rollback
            Controller-->>Client: status HTTP { code, message }
        end
    end
```

