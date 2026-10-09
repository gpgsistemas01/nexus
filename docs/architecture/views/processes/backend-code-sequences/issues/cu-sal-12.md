<a id="cu-sal-12"></a>
# `CU-SAL-12` — Surtir merma

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
| `Router` | boundary | [`wasteIssueApiRoute.js`](../../../../../../src/routes/api/warehouse/wasteIssueApiRoute.js) |
| `Auth` | control | [`authMiddleware.js`](../../../../../../src/middleware/authMiddleware.js) |
| `Validator` | control | [`validatorMiddleware.js`](../../../../../../src/middleware/validatorMiddleware.js) |
| `Controller` | control | [`wasteIssueController.js`](../../../../../../src/controllers/api/warehouse/wasteIssueController.js) |
| `IssueDto` | control | [`wasteIssueDTO.js`](../../../../../../src/dtos/wasteIssueDTO.js) |
| `Service` | control | [`wasteIssueService.js`](../../../../../../src/services/warehouse/wasteIssues/wasteIssueService.js) |
| `Rules` | control | [`issueFulfillmentRules.js`](../../../../../../src/services/warehouse/issues/issueFulfillmentRules.js) |
| `Movement` | control | [`wasteMovementService.js`](../../../../../../src/services/warehouse/wastes/wasteMovementService.js) |
| `Stock` | control | [`wasteInventoryService.js`](../../../../../../src/services/warehouse/wastes/wasteInventoryService.js) |
| `Status` | control | [`wasteIssueFulfillmentService.js`](../../../../../../src/services/warehouse/wasteIssues/wasteIssueFulfillmentService.js) |
| `Socket` | control | [`socketUtils.js`](../../../../../../src/utils/socketUtils.js) |
| `ValidationRules` | control | [`wasteIssueValidations.js`](../../../../../../src/validators/forms/wasteIssueValidations.js) |
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
    participant Router@{ "type": "boundary" } as wasteIssueApiRoute.js
    participant Auth@{ "type": "control" } as authMiddleware.js
    participant ValidationRules@{ "type": "control" } as wasteIssueValidations.js
    participant Validator@{ "type": "control" } as validatorMiddleware.js
    participant Controller@{ "type": "control" } as wasteIssueController.js

    Client->>Router: PATCH /api/warehouse/waste-issues/:id/details + accessToken
    Router->>Auth: verifyApiTokenRequired(req, res, next)
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    Router->>ValidationRules: wasteIssueDetailsValidation[] — cadena ejecutada por Express
    Router->>Validator: validate(req, res, next)
    break Validación rechazada
        Validator-->>Client: HTTP 400 { errors }
    end
    Router->>Auth: authorizeUserApi(PERMISSIONS.WASTE_ISSUES_SUPPLY)(req, res, next)
    break Identidad no vigente o permiso denegado
        Auth-->>Client: HTTP 401 INVALID_AUTH o HTTP 403 FORBIDDEN
    end
    Router->>Controller: editWasteIssueDetails(req, res)
    alt Commit confirmado
        Controller-->>Client: 200 { wasteIssue, code }
    else Stock insuficiente, estado inválido o error Prisma
        Controller-->>Client: status HTTP { code, message }
    end
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
    participant IssueDto@{ "type": "control" } as DTO funcional<br/>wasteIssueDTO.js
    participant Service@{ "type": "control" } as wasteIssueService.js
    participant Rules@{ "type": "control" } as issueFulfillmentRules.js
    participant Movement@{ "type": "control" } as wasteMovementService.js
    participant Stock@{ "type": "control" } as wasteInventoryService.js
    participant Status@{ "type": "control" } as wasteIssueFulfillmentService.js
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant Socket@{ "type": "control" } as socketUtils.js

    participant FileBaseRepository@{ "type": "control" } as baseRepository.js

    Controller->>IssueDto: createWasteIssueDetailsDtoForEdit(req.body)
    activate IssueDto
    IssueDto-->>Controller: createWasteIssueDetailsDtoForEdit(): Object (wasteIssueDto)
    deactivate IssueDto
    Controller->>Service: updateWasteIssueDetails({ id, wasteIssueDto: sanitizedWasteIssueDto })
    Service->>Service: updateWasteIssueDetailsTransaction({ id, wasteIssueDto })
    Service->>FileBaseRepository: getDb()
    FileBaseRepository-->>Service: getDb(): PrismaClient | TransactionClient — tx si se recibió
    Service->>Prisma: db.$transaction(async tx => ...)
    Note over Service: El callback transaccional valida estado, ids y snapshots
    Service->>Status: findWasteIssueFulfillmentStatusIds(tx)
    loop Cada detalle nuevo con isSupplied
        Service->>Rules: resolveIssueDetailFulfillmentStatus(detail)
        Service->>Prisma: tx.wasteIssueDetail.update({ where, data })
        Service->>Service: supplyDetails.push({ wasteIssueDetailId, quantity })
    end
    Service->>Movement: applyWasteMovement({ tx, reference: { wasteIssueId }, movementType: ISSUE, details })
    Movement->>Stock: applyWasteStockChange({ tx, id: wasteId, quantityChange, convertedQuantityChange })
    Movement->>Movement: createWasteMovement({ tx, reference, movementType: ISSUE, details })
    Movement->>FileBaseRepository: getDb(tx)
    FileBaseRepository-->>Movement: getDb(): PrismaClient | TransactionClient — conserva tx
    Movement->>Prisma: db.wasteMovement.create({ data, include: { details: true } })
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

