<a id="cu-sal-18"></a>
# `CU-SAL-18` — Editar detalles de consumible de una salida

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`, `BE-P05`.

## Participantes y trazabilidad

Los nombres breves del diagrama corresponden a los archivos vinculados siguientes.
La ruta completa se conserva en cada enlace, fuera de la cabecera visual. Un participante
puede agrupar colaboradores del mismo rol; esa agrupación no implica una clase ni un
proceso independiente. Los retornos representan el resultado o error propagado.

| Alias | Rol visual | Archivos de implementación |
| --- | --- | --- |
| `Route` | boundary | [`consumableGoodsIssueApiRoute.js`](../../../../../../src/routes/api/warehouse/goodsIssues/consumables/consumableGoodsIssueApiRoute.js) |
| `Auth` | control | [`authMiddleware.js`](../../../../../../src/middleware/authMiddleware.js) |
| `Validator` | control | [`goodsIssueValidations.js`](../../../../../../src/validators/forms/goodsIssueValidations.js)<br/>[`validatorMiddleware.js`](../../../../../../src/middleware/validatorMiddleware.js) |
| `Controller` | control | [`consumableGoodsIssueController.js`](../../../../../../src/controllers/api/warehouse/goodsIssues/consumables/consumableGoodsIssueController.js)<br/>[`goodsIssueHandlers.js`](../../../../../../src/controllers/api/warehouse/goodsIssues/shared/goodsIssueHandlers.js) |
| `Facade` | control | [`consumableGoodsIssueService.js`](../../../../../../src/services/warehouse/goodsIssues/consumables/consumableGoodsIssueService.js) |
| `Core` | control | [`goodsIssueService.js`](../../../../../../src/services/warehouse/goodsIssues/goodsIssueService.js) |
| `Helpers` | control | [`goodsIssueHelpers.js`](../../../../../../src/services/warehouse/goodsIssues/goodsIssueHelpers.js) |
| `DTO` | control | [`goodsIssueDTO.js`](../../../../../../src/dtos/goodsIssueDTO.js) |
| `Header` | control | [`issueHeaderService.js`](../../../../../../src/services/warehouse/issues/issueHeaderService.js) |
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
    participant Facade@{ "type": "control" } as Adaptador del tipo
    participant Core@{ "type": "control" } as Núcleo del dominio
    participant Helpers@{ "type": "control" } as Helpers del dominio
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant DTO@{ "type": "control" } as DTO funcional
    participant Header@{ "type": "control" } as Encabezado
    participant ErrorHandler@{ "type": "control" } as Errores Express

    Client->>Route: PATCH /api/warehouse/goods-issues/consumables/:id
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    Route->>Validator: goodsIssueUpdateValidation[] y validate(req, res, next)
    break Validación rechazada
        Validator-->>Client: HTTP 400 { errors }
    end
    Route->>Auth: authorizeUserApi(PERMISSIONS.GOODS_ISSUES_MANAGE)(req, res, next)
    break Identidad no vigente o permiso denegado
        Auth-->>Client: HTTP 401 INVALID_AUTH o HTTP 403 FORBIDDEN
    end
    Route->>Controller: editConsumableGoodsIssue(req, res)
    Controller->>DTO: createGoodsIssueDtoForEdit(req.body)
    activate DTO
    DTO-->>Controller: createGoodsIssueDtoForEdit(): Object — DTO normalizado
    deactivate DTO
    Controller->>Controller: sanitizeEmptyStrings(dto)
    Controller->>Facade: updateConsumableGoodsIssue(options con DTO, identificadores y actor cuando corresponde)
    Facade->>Core: updateGoodsIssue({ ...options, type: CONSUMABLE })
    alt Servicio resuelto
        Core->>Helpers: buildGoodsIssueContextWhere(type)
        Core->>Prisma: goodsIssue.findUnique({ where: { id, ...contextWhere }, include: estados y detalles })
        Core->>Core: updateGoodsIssue() — exigir pendiente y sin cantidades surtidas
        Core->>Header: resolveIssueHeaderData(options)
        Core->>Helpers: buildGoodsIssueDetails({ details, initialFulfillmentStatusId, type })
        Core->>Prisma: getDb().$transaction(async tx => ...)
        rect rgb(245, 245, 245)
            Note over Core,Prisma: getDb().$transaction(async tx => ...)
            Core->>Prisma: tx.goodsIssue.findUnique({ where: { id, ...contextWhere }, select: { id: true } })
            Core->>Prisma: tx.goodsIssueDetail.deleteMany({ where: { goodsIssueId: id } })
            Core->>Prisma: tx.goodsIssueDetail.createMany({ data: processedDetails })
            Core->>Prisma: tx.goodsIssue.update({ where: { id, ...contextWhere }, data: encabezado y cumplimiento pendiente })
        end
        Prisma-->>Core: commit de encabezado y detalles
        Core-->>Facade: updateGoodsIssue(): Promise[GoodsIssue]
        Facade-->>Controller: updateConsumableGoodsIssue(): Promise[GoodsIssue]
        Controller-->>Client: HTTP 200 { goodsIssue, code }
    else Error de dominio o persistencia
        Core-->>Facade: error — rollback si falló la transacción
        Facade-->>Controller: error propagado
        Controller->>ErrorHandler: next(error) — propagación de Express
        ErrorHandler-->>Client: HTTP de error { code, message }
    end
```
