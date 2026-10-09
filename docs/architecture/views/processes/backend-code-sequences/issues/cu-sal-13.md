<a id="cu-sal-13"></a>
# `CU-SAL-13` — Devolver merma surtida

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
| `Validator` | control | [`issueReturnValidations.js`](../../../../../../src/validators/forms/issueReturnValidations.js)<br/>[`validatorMiddleware.js`](../../../../../../src/middleware/validatorMiddleware.js) |
| `Controller` | control | [`wasteIssueController.js`](../../../../../../src/controllers/api/warehouse/wasteIssueController.js) |
| `ReturnDto` | control | [`wasteIssueDTO.js`](../../../../../../src/dtos/wasteIssueDTO.js) |
| `Service` | control | [`wasteIssueReturnService.js`](../../../../../../src/services/warehouse/wasteIssues/detailReturns/wasteIssueReturnService.js) |
| `Movement` | control | [`wasteMovementService.js`](../../../../../../src/services/warehouse/wastes/wasteMovementService.js) |
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
    participant ReturnDto@{ "type": "control" } as DTO funcional
    participant Service@{ "type": "control" } as Service
    participant Movement@{ "type": "control" } as Movimiento
    participant Status@{ "type": "control" } as Estado
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant Socket@{ "type": "control" } as Eventos Socket.IO

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
    activate ReturnDto
    ReturnDto-->>Controller: createWasteIssueDtoForReturn(): Object (returnDto)
    deactivate ReturnDto
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
        activate Prisma
        Prisma-->>Service: salida de merma actualizada y commit
        deactivate Prisma
        Service-->>Controller: returnWasteIssueDetail(): Promise[{ ...wasteIssueReturn, detail: updatedDetail }]
        Controller->>Socket: emitInventoryUpdated({ context: 'waste', source: 'waste-issue-return-created' })
        Controller-->>Client: 200 { wasteIssueReturn, code }
    end
```
