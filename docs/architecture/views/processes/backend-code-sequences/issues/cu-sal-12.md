<a id="cu-sal-12"></a>
# `CU-SAL-12` — Surtir merma

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`, `BE-P05`.

## Participantes y trazabilidad

Los nombres breves del diagrama corresponden a los archivos vinculados siguientes.
La ruta completa se conserva en cada enlace, fuera de la cabecera visual. Un participante
puede agrupar colaboradores del mismo rol; esa agrupación no implica una clase ni un
proceso independiente. Los retornos representan el resultado o error propagado.

| Alias | Rol visual | Archivos de implementación |
| --- | --- | --- |
| `Router` | boundary | [`wasteIssueApiRoute.js`](../../../../../../src/routes/api/warehouse/wasteIssueApiRoute.js) |
| `Auth` | control | [`authMiddleware.js`](../../../../../../src/middleware/authMiddleware.js) |
| `Validator` | control | [`wasteIssueValidations.js`](../../../../../../src/validators/forms/wasteIssueValidations.js)<br/>[`validatorMiddleware.js`](../../../../../../src/middleware/validatorMiddleware.js) |
| `Controller` | control | [`wasteIssueController.js`](../../../../../../src/controllers/api/warehouse/wasteIssueController.js) |
| `IssueDto` | control | [`wasteIssueDTO.js`](../../../../../../src/dtos/wasteIssueDTO.js) |
| `Service` | control | [`wasteIssueService.js`](../../../../../../src/services/warehouse/wasteIssues/wasteIssueService.js) |
| `Rules` | control | [`issueFulfillmentRules.js`](../../../../../../src/services/warehouse/issues/issueFulfillmentRules.js) |
| `Movement` | control | [`wasteMovementService.js`](../../../../../../src/services/warehouse/wastes/wasteMovementService.js) |
| `Stock` | control | [`wasteInventoryService.js`](../../../../../../src/services/warehouse/wastes/wasteInventoryService.js) |
| `Status` | control | [`wasteIssueFulfillmentService.js`](../../../../../../src/services/warehouse/wasteIssues/wasteIssueFulfillmentService.js) |
| `Socket` | control | [`socketUtils.js`](../../../../../../src/utils/socketUtils.js) |

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Router@{ "type": "boundary" } as Router web
    participant Auth@{ "type": "control" } as Acceso
    participant Validator@{ "type": "control" } as Validación HTTP
    participant Controller@{ "type": "control" } as Controller
    participant IssueDto@{ "type": "control" } as DTO funcional
    participant Service@{ "type": "control" } as Service
    participant Rules@{ "type": "control" } as Reglas de dominio
    participant Movement@{ "type": "control" } as Movimiento
    participant Stock@{ "type": "control" } as Existencias
    participant Status@{ "type": "control" } as Estado
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant Socket@{ "type": "control" } as Eventos Socket.IO

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
    activate IssueDto
    IssueDto-->>Controller: createWasteIssueDetailsDtoForEdit(): Object (wasteIssueDto)
    deactivate IssueDto
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

