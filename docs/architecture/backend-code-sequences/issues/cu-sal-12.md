<a id="cu-sal-12"></a>
# `CU-SAL-12` — Surtir merma

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`, `BE-P05`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Router as src/routes/api/warehouse/wasteIssueApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/wasteIssueController.js
    participant IssueDto as «object»<br/>wasteIssueDto<br/>src/dtos/wasteIssueDTO.js
    participant Service as src/services/warehouse/wasteIssues/wasteIssueService.js
    participant Rules as src/services/warehouse/issues/issueFulfillmentRules.js
    participant Movement as src/services/warehouse/wastes/wasteMovementService.js
    participant Stock as src/services/warehouse/wastes/wasteInventoryService.js
    participant Status as src/services/warehouse/wasteIssues/wasteIssueFulfillmentService.js
    participant Prisma as Prisma / PostgreSQL
    participant Socket as src/utils/socketUtils.js

    Client->>Router: PATCH /api/warehouse/waste-issues/:id/details + accessToken
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
    Movement->>Prisma: createWasteMovement({ tx, type: ISSUE, details })
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
```

