<a id="cu-sal-13"></a>
# `CU-SAL-13` — Devolver merma surtida

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
| `ReturnDto` | control | [`wasteIssueDTO.js`](../../../../../../src/dtos/wasteIssueDTO.js) |
| `Service` | control | [`wasteIssueReturnService.js`](../../../../../../src/services/warehouse/wasteIssues/detailReturns/wasteIssueReturnService.js) |
| `Movement` | control | [`wasteMovementService.js`](../../../../../../src/services/warehouse/wastes/wasteMovementService.js) |
| `Status` | control | [`wasteIssueFulfillmentService.js`](../../../../../../src/services/warehouse/wasteIssues/wasteIssueFulfillmentService.js) |
| `Socket` | control | [`socketUtils.js`](../../../../../../src/utils/socketUtils.js) |
| `ValidationRules` | control | [`issueReturnValidations.js`](../../../../../../src/validators/forms/issueReturnValidations.js) |
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
    participant ValidationRules@{ "type": "control" } as issueReturnValidations.js
    participant Validator@{ "type": "control" } as validatorMiddleware.js
    participant Controller@{ "type": "control" } as wasteIssueController.js

    Client->>Router: PATCH /api/warehouse/waste-issues/:id/details/:detailId/returns + accessToken
    Router->>Auth: verifyApiTokenRequired(req, res, next)
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    Router->>ValidationRules: issueReturnValidation[] — cadena ejecutada por Express
    Router->>Validator: validate(req, res, next)
    break Validación rechazada
        Validator-->>Client: HTTP 400 { errors }
    end
    Router->>Auth: authorizeUserApi(PERMISSIONS.WASTE_ISSUES_SUPPLY)(req, res, next)
    break Identidad no vigente o permiso denegado
        Auth-->>Client: HTTP 401 INVALID_AUTH o HTTP 403 FORBIDDEN
    end
    Router->>Controller: registerWasteIssueDetailReturn(req, res)
        Controller-->>Client: 200 { wasteIssueReturn, code }
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
    participant ReturnDto@{ "type": "control" } as DTO funcional<br/>wasteIssueDTO.js
    participant Service@{ "type": "control" } as wasteIssueReturnService.js
    participant Movement@{ "type": "control" } as wasteMovementService.js
    participant Status@{ "type": "control" } as wasteIssueFulfillmentService.js
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant Socket@{ "type": "control" } as socketUtils.js

    participant FileBaseRepository@{ "type": "control" } as baseRepository.js

    Controller->>ReturnDto: createWasteIssueDtoForReturn(req.body)
    activate ReturnDto
    ReturnDto-->>Controller: createWasteIssueDtoForReturn(): Object (returnDto)
    deactivate ReturnDto
    Controller->>Service: returnWasteIssueDetail({ id, detailId, returnDto, userId })
    Service->>FileBaseRepository: getDb()
    FileBaseRepository-->>Service: getDb(): PrismaClient | TransactionClient — tx si se recibió
    Service->>Prisma: db.$transaction(async tx => ...)
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
            Service->>Prisma: tx.wasteIssue.update({ where: { id }, data })
        Service->>Prisma: tx.wasteIssueReturn.create({ data })
        activate Prisma
        Prisma-->>Service: salida de merma actualizada y commit
        deactivate Prisma
        Service-->>Controller: returnWasteIssueDetail(): Promise[{ ...wasteIssueReturn, detail: updatedDetail }]
        Controller->>Socket: emitInventoryUpdated({ context: 'waste', source: 'waste-issue-return-created' })
        Controller-->>Client: 200 { wasteIssueReturn, code }
    end
```
