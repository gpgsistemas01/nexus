<a id="cu-sal-09"></a>
# `CU-SAL-09` — Crear salida de merma

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`.

## Participantes y trazabilidad

Los nombres breves del diagrama corresponden a los archivos vinculados siguientes.
La ruta completa se conserva en cada enlace, fuera de la cabecera visual. Un participante
puede agrupar colaboradores del mismo rol; esa agrupación no implica una clase ni un
proceso independiente. Los retornos representan el resultado o error propagado.

| Alias | Rol visual | Archivos de implementación |
| --- | --- | --- |
| `Route` | boundary | [`wasteIssueApiRoute.js`](../../../../../../src/routes/api/warehouse/wasteIssueApiRoute.js) |
| `Auth` | control | [`authMiddleware.js`](../../../../../../src/middleware/authMiddleware.js) |
| `Validator` | control | [`wasteIssueValidations.js`](../../../../../../src/validators/forms/wasteIssueValidations.js)<br/>[`validatorMiddleware.js`](../../../../../../src/middleware/validatorMiddleware.js) |
| `Controller` | control | [`wasteIssueController.js`](../../../../../../src/controllers/api/warehouse/wasteIssueController.js) |
| `IssueDto` | control | [`wasteIssueDTO.js`](../../../../../../src/dtos/wasteIssueDTO.js) |
| `Domain` | control | [`wasteIssueService.js`](../../../../../../src/services/warehouse/wasteIssues/wasteIssueService.js) |
| `Operation` | control | [`serviceErrorHandler.js`](../../../../../../src/services/serviceErrorHandler.js) |
| `Fulfillment` | control | [`wasteIssueFulfillmentService.js`](../../../../../../src/services/warehouse/wasteIssues/wasteIssueFulfillmentService.js) |
| `Header` | control | [`issueHeaderService.js`](../../../../../../src/services/warehouse/issues/issueHeaderService.js) |
| `Stock` | control | [`stockHelpers.js`](../../../../../../src/services/inventory/stockHelpers.js) |
| `Reference` | control | [`referenceNumberService.js`](../../../../../../src/services/document/referenceNumberService.js) |
| `ErrorHandler` | control | [`app.js`](../../../../../../src/app.js) |

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Route@{ "type": "boundary" } as Router API
    participant Auth@{ "type": "control" } as Acceso
    participant Validator@{ "type": "control" } as Validación HTTP
    participant Controller@{ "type": "control" } as Controller
    participant IssueDto@{ "type": "control" } as DTO funcional
    participant Domain@{ "type": "control" } as Servicio de dominio
    participant Operation@{ "type": "control" } as Operación
    participant Fulfillment@{ "type": "control" } as Cumplimiento
    participant Header@{ "type": "control" } as Encabezado
    participant Stock@{ "type": "control" } as Existencias
    participant Reference@{ "type": "control" } as Folio documental
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant ErrorHandler@{ "type": "control" } as Errores Express

    Client->>Route: POST /api/warehouse/waste-issues
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    Route->>Validator: wasteIssueValidation[] y validate(req, res, next)
    break Validación rechazada
        Validator-->>Client: HTTP 400 { errors }
    end
    Route->>Auth: authorizeUserApi(PERMISSIONS.WASTE_ISSUES_MANAGE)(req, res, next)
    break Identidad no vigente o permiso denegado
        Auth-->>Client: HTTP 401 INVALID_AUTH o HTTP 403 FORBIDDEN
    end
    Route->>Controller: registerWasteIssue(req, res)
    activate Controller
    Controller->>IssueDto: createWasteIssueDtoForRegister(req.body)
    activate IssueDto
    IssueDto-->>Controller: createWasteIssueDtoForRegister(): Object (wasteIssueDto)
    deactivate IssueDto
    Controller->>Controller: sanitizeEmptyStrings(wasteIssueDto)
    Controller->>Domain: createWasteIssue({ wasteIssueDto: sanitizedWasteIssueDto, userId: req.user.id })
    activate Domain
    Domain->>Operation: executeServiceOperation({ action: createWasteIssueTransaction, fallbackError })
    Operation->>Domain: createWasteIssueTransaction({ wasteIssueDto, userId })
    Domain->>Prisma: getDb().$transaction(async tx => ...)
    alt Datos relacionados, detalles y persistencia válidos
        Domain->>Fulfillment: findWasteIssueFulfillmentStatusIds(tx)
        Fulfillment->>Prisma: tx.fulfillmentStatus.findMany(...)
        activate Prisma
        Prisma-->>Fulfillment: findMany(): Promise[FulfillmentStatus[]]
        deactivate Prisma
        Fulfillment-->>Domain: findWasteIssueFulfillmentStatusIds(): Promise[Map]
        Domain->>Domain: buildWasteIssueDetails({ tx, details: requestedDetails, fulfillmentStatusId: pendingStatusId })
        Domain->>Prisma: tx.waste.findMany({ id: uniqueIds, isActive: true })
        activate Prisma
        Prisma-->>Domain: findMany(): Promise[Waste[]]
        deactivate Prisma
        loop Cada detalle solicitado
            Domain->>Stock: calculateConvertedQuantity({ quantity, base, height })
            activate Stock
            Stock-->>Domain: calculateConvertedQuantity(): number
            deactivate Stock
        end
        Domain->>Header: resolveIssueHeaderData({ tx, requesterId, advisorId, departmentId, clientId, issueData, statusName: APPROVED })
        activate Header
        Header-->>Domain: resolveIssueHeaderData(): Promise[Object]
        deactivate Header
        Domain->>Reference: generateYearlyReferenceNumber({ type: WASTE_ISSUE, tx })
        Reference->>Prisma: tx.referenceNumberCounter.upsert(...)
        activate Prisma
        Prisma-->>Reference: upsert(): Promise[ReferenceNumberCounter]
        deactivate Prisma
        Reference-->>Domain: generateYearlyReferenceNumber(): Promise[string]
        Domain->>Prisma: tx.wasteIssue.create({ headerData, referenceNumber, createdBy, fulfillmentStatus: PENDING, details })
        activate Prisma
        Prisma-->>Domain: create(): Promise[WasteIssue]
        deactivate Prisma
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
```
