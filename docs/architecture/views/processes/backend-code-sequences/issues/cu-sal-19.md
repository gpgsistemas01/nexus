<a id="cu-sal-19"></a>
# `CU-SAL-19` — Surtir consumible

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
| `Inventory` | control | [`movementService.js`](../../../../../../src/services/inventory/movementService.js) |
| `Socket` | control | [`socketUtils.js`](../../../../../../src/utils/socketUtils.js) |
| `DTO` | control | [`goodsIssueDTO.js`](../../../../../../src/dtos/goodsIssueDTO.js) |
| `ErrorHandler` | control | [`app.js`](../../../../../../src/app.js) |
| `Fulfillment` | control | [`fulfillmentStatusService.js`](../../../../../../src/services/warehouse/fulfillmentStatusService.js) |

## Secuencia de entrada y coordinación

El primer nivel conserva método, controles HTTP, normalización, adaptación del tipo,
respuesta y publicación. La llamada del adaptador al núcleo es la frontera que amplía
el segundo nivel; ambas figuras realizan el mismo caso, sin añadir otra operación.

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
    participant Socket@{ "type": "control" } as Eventos Socket.IO
    participant DTO@{ "type": "control" } as DTO funcional
    participant ErrorHandler@{ "type": "control" } as Errores Express

    Client->>Route: PATCH /api/warehouse/goods-issues/consumables/:id/details
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    Route->>Validator: goodsIssueDetailsValidation[] y validate(req, res, next)
    break Validación rechazada
        Validator-->>Client: HTTP 400 { errors }
    end
    Route->>Auth: authorizeUserApi(PERMISSIONS.GOODS_ISSUE_DETAILS_MANAGE)(req, res, next)
    break Identidad no vigente o permiso denegado
        Auth-->>Client: HTTP 401 INVALID_AUTH o HTTP 403 FORBIDDEN
    end
    Route->>Controller: editConsumableGoodsIssueDetails(req, res)
    Controller->>DTO: createGoodsIssueDetailsDtoForEdit(req.body)
    activate DTO
    DTO-->>Controller: createGoodsIssueDetailsDtoForEdit(): Object — DTO normalizado
    deactivate DTO
    Controller->>Controller: sanitizeEmptyStrings(dto)
    Controller->>Facade: updateConsumableGoodsIssueDetails(options con DTO, identificadores y actor cuando corresponde)
    Facade->>Core: updateGoodsIssueDetails({ ...options, type: CONSUMABLE })
    Note over Facade,Core: Realización detallada en la colaboración de dominio
    alt Servicio resuelto
        Core->>Core: updateGoodsIssueDetails() — calcular cantidades pendientes tras validar estado
        Core-->>Facade: updateGoodsIssueDetails(): Promise[GoodsIssue]
        Facade-->>Controller: updateConsumableGoodsIssueDetails(): Promise[GoodsIssue]
        Controller->>Socket: emitInventoryUpdated({ context: 'consumable', source: 'goods-issue-supplied' })
        Controller-->>Client: HTTP 200 { goodsIssue, code }
    else Error de dominio o persistencia
        Core-->>Facade: error — rollback si falló la transacción
        Facade-->>Controller: error propagado
        Controller->>ErrorHandler: next(error) — propagación de Express
        ErrorHandler-->>Client: HTTP de error { code, message }
    end
```

## Colaboración interna del dominio

Este nivel amplía la invocación `Facade → Core` anterior. Conserva consultas, reglas,
helpers y contexto de persistencia. Su error retorna al adaptador y se propaga según
la primera figura; los mensajes se numeran de nuevo dentro de esta colaboración.

```mermaid
sequenceDiagram
    autonumber
    participant Facade@{ "type": "control" } as Adaptador del tipo
    participant Core@{ "type": "control" } as Núcleo del dominio
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant Inventory@{ "type": "control" } as Inventario
    participant Fulfillment@{ "type": "control" } as Cumplimiento

    Facade->>Core: updateGoodsIssueDetails({ ...options, type: CONSUMABLE })
    activate Core
    alt Servicio resuelto
        Core->>Prisma: goodsIssue.findUnique({ where: { id, ...contextWhere }, include: detalles })
        Core->>Core: updateGoodsIssueDetails() — calcular cantidades pendientes tras validar estado
        Core->>Prisma: getDb().$transaction(async tx => ...)
        rect rgb(245, 245, 245)
            Note over Core,Prisma: getDb().$transaction(async tx => ...)
            Core->>Prisma: tx.goodsIssue.findUnique({ where: { id, ...contextWhere }, select: { id: true } })
            Core->>Fulfillment: findFulfillmentStatusIdsByName({ tx, names })
            opt Hay cantidades pendientes por surtir
                Core->>Inventory: applyInventoryMovement({ tx, movementType: ISSUE, details })
            end
            Core->>Prisma: tx.goodsIssueDetail.update({ where: { id: detailId }, data: cantidades y cumplimiento })
            Core->>Prisma: tx.goodsIssueDetail.findMany({ where: { goodsIssueId: id } })
            Core->>Prisma: tx.goodsIssue.update({ where: { id, ...contextWhere }, data: cumplimiento })
        end
        Prisma-->>Core: commit de surtido
        Core-->>Facade: updateGoodsIssueDetails(): Promise[GoodsIssue]
    else Error de dominio o persistencia
        Core-->>Facade: error — rollback si falló la transacción
    end
    deactivate Core
```
