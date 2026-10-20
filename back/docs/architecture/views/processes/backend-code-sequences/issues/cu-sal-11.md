<a id="cu-sal-11"></a>
# `CU-SAL-11` — Editar detalles de merma de una salida

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`, `BE-P05`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.
La composición incluye también los archivos de configuración, construcción y reexport: cada
uno tiene un nodo propio, aunque no ejecute una delegación durante la petición.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `Route` | boundary | [`wasteIssueApiRoute.js`](../../../../../../src/routes/api/warehouse/wasteIssueApiRoute.js) |
| `Auth` | control | [`authMiddleware.js`](../../../../../../src/middleware/authMiddleware.js) |
| `Validator` | control | [`validatorMiddleware.js`](../../../../../../src/middleware/validatorMiddleware.js) |
| `Controller` | control | [`wasteIssueController.js`](../../../../../../src/controllers/api/warehouse/wasteIssueController.js) |
| `IssueDto` | control | [`wasteIssueDTO.js`](../../../../../../src/dtos/wasteIssueDTO.js) |
| `Domain` | control | [`wasteIssueService.js`](../../../../../../src/services/warehouse/wasteIssues/wasteIssueService.js) |
| `Operation` | control | [`serviceErrorHandler.js`](../../../../../../src/services/serviceErrorHandler.js) |
| `Fulfillment` | control | [`wasteIssueFulfillmentService.js`](../../../../../../src/services/warehouse/wasteIssues/wasteIssueFulfillmentService.js) |
| `Header` | control | [`issueHeaderService.js`](../../../../../../src/services/warehouse/issues/issueHeaderService.js) |
| `Stock` | control | [`stockHelpers.js`](../../../../../../src/services/inventory/stockHelpers.js) |
| `ErrorHandler` | control | [`app.js`](../../../../../../src/app.js) |
| `ValidationRules` | control | [`wasteIssueValidations.js`](../../../../../../src/validators/forms/wasteIssueValidations.js) |
| `Formatter` | control | [`formattersUtils.js`](../../../../../../src/utils/formattersUtils.js) |
| `FileBaseRepository` | control | [`baseRepository.js`](../../../../../../src/repository/baseRepository.js) |
| `FileDatabaseUrl` | control | [`databaseUrl.js`](../../../../../../src/lib/databaseUrl.js) |
| `FilePrisma` | control | [`prisma.js`](../../../../../../src/lib/prisma.js) |

## Composición de archivos

Los archivos que construyen, configuran o reexportan funciones aparecen como componentes
individuales. Las flechas representan imports reales, resueltos al cargar los módulos;
las llamadas durante la operación se muestran en las secuencias siguientes. Cada nombre
identifica un archivo y la tabla conserva su ruta completa.

```mermaid
flowchart TB
    subgraph Component0["Backend"]
        FileDatabaseUrl["databaseUrl.js"]
        FilePrisma["prisma.js"]
        FileBaseRepository["baseRepository.js"]
    end
    FilePrisma -->|import| FileDatabaseUrl
    FileBaseRepository -->|import| FilePrisma
```

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Route@{ "type": "boundary" } as wasteIssueApiRoute.js
    participant Auth@{ "type": "control" } as authMiddleware.js
    participant ValidationRules@{ "type": "control" } as wasteIssueValidations.js
    participant Validator@{ "type": "control" } as validatorMiddleware.js
    participant Controller@{ "type": "control" } as wasteIssueController.js

    Client->>Route: PATCH /api/warehouse/waste-issues/:id
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    Route->>ValidationRules: wasteIssueUpdateValidation[] — cadena ejecutada por Express
    Route->>Validator: validate(req, res, next)
    break Validación rechazada
        Validator-->>Client: HTTP 400 { errors }
    end
    Route->>Auth: authorizeUserApi(PERMISSIONS.WASTE_ISSUES_MANAGE)(req, res, next)
    break Identidad no vigente o permiso denegado
        Auth-->>Client: HTTP 401 INVALID_AUTH o HTTP 403 FORBIDDEN
    end
    Route->>Controller: editWasteIssue(req, res)
    activate Controller
        Controller-->>Client: HTTP 200 { wasteIssue, code: UPDATED_WASTE_ISSUE }
    deactivate Controller
```

## Detalle de coordinación del controller

Continúa la colaboración anterior. Conserva el orden de los mensajes del código y
separa los archivos que ejecutan esta parte del recorrido; los otros detalles del caso
completan las llamadas a helpers y la propagación del resultado.

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Controller@{ "type": "control" } as wasteIssueController.js
    participant Formatter@{ "type": "control" } as formattersUtils.js
    participant IssueDto@{ "type": "control" } as DTO funcional<br/>wasteIssueDTO.js
    participant Domain@{ "type": "control" } as wasteIssueService.js
    participant Operation@{ "type": "control" } as serviceErrorHandler.js
    participant Fulfillment@{ "type": "control" } as wasteIssueFulfillmentService.js
    participant Header@{ "type": "control" } as issueHeaderService.js
    participant Stock@{ "type": "control" } as stockHelpers.js
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant ErrorHandler@{ "type": "control" } as app.js

    participant FileBaseRepository@{ "type": "control" } as baseRepository.js

    activate Controller

    Controller->>IssueDto: createWasteIssueDtoForEdit(req.body)
    activate IssueDto
    IssueDto-->>Controller: createWasteIssueDtoForEdit(): Object (wasteIssueDto)
    deactivate IssueDto
    Controller->>Formatter: sanitizeEmptyStrings(wasteIssueDto)
    Controller->>Domain: updateWasteIssue({ id: req.params.id, wasteIssueDto: sanitizedWasteIssueDto })
    activate Domain
    Domain->>Operation: executeServiceOperation({ action: updateWasteIssueTransaction, fallbackError })
    Operation->>Domain: updateWasteIssueTransaction({ id, wasteIssueDto })
    Domain->>FileBaseRepository: getDb()
    FileBaseRepository-->>Domain: getDb(): PrismaClient | TransactionClient — tx si se recibió
    Domain->>Prisma: db.$transaction(async tx => ...)
    Domain->>Prisma: tx.wasteIssue.findUnique({ id, details })
    activate Prisma
    Prisma-->>Domain: findUnique(): Promise[WasteIssue|null]
    deactivate Prisma
    alt Salida existente, sin cantidades surtidas y datos válidos
        Domain->>Fulfillment: findWasteIssueFulfillmentStatusIds(tx)
        activate Fulfillment
        Fulfillment-->>Domain: findWasteIssueFulfillmentStatusIds(): Promise[Map]
        deactivate Fulfillment
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
        Domain->>Header: resolveIssueHeaderData({ tx, dto: headerDto })
        activate Header
        Header-->>Domain: resolveIssueHeaderData(): Promise[Object]
        deactivate Header
        Domain->>Prisma: tx.wasteIssueDetail.deleteMany({ wasteIssueId: id })
        Domain->>Prisma: tx.wasteIssue.update({ id, headerData, fulfillmentStatus: PENDING, details })
        activate Prisma
        Prisma-->>Domain: update(): Promise[WasteIssue]
        deactivate Prisma
        Prisma-->>Domain: commit
        Domain-->>Operation: updateWasteIssueTransaction(): Promise[WasteIssue]
        Operation-->>Domain: executeServiceOperation(): Promise[WasteIssue]
        Domain-->>Controller: updateWasteIssue(): Promise[WasteIssue]
        Controller-->>Client: HTTP 200 { wasteIssue, code: UPDATED_WASTE_ISSUE }
    else Salida inexistente, ya surtida, merma inválida o error de persistencia
        Prisma-->>Domain: rollback
        Domain-->>Controller: throw AppError { code, message, meta, statusCode }
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
    end
    deactivate Domain
    deactivate Controller
```
