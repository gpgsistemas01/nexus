<a id="cu-sal-19"></a>
# `CU-SAL-19` — Surtir consumible

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`, `BE-P05`.

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Route@{ "type": "boundary" } as src/routes/api/warehouse/goodsIssues/consumables/consumableGoodsIssueApiRoute.js
    participant Auth@{ "type": "control" } as src/middleware/authMiddleware.js
    participant Validator@{ "type": "control" } as src/validators/forms/goodsIssueValidations.js<br/>src/middleware/validatorMiddleware.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/goodsIssues/consumables/consumableGoodsIssueController.js<br/>src/controllers/api/warehouse/goodsIssues/shared/goodsIssueHandlers.js
    participant Facade@{ "type": "control" } as src/services/warehouse/goodsIssues/consumables/consumableGoodsIssueService.js
    participant Core@{ "type": "control" } as src/services/warehouse/goodsIssues/goodsIssueService.js
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant Inventory as src/services/inventory/movementService.js
    participant Socket as src/utils/socketUtils.js
    participant DTO@{ "type": "entity" } as goodsIssueDto: Object<br/>src/dtos/goodsIssueDTO.js
    participant ErrorHandler as src/app.js
    participant Fulfillment as src/services/warehouse/fulfillmentStatusService.js

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
    DTO-->>Controller: createGoodsIssueDetailsDtoForEdit(): Object — DTO normalizado
    Controller->>Controller: sanitizeEmptyStrings(dto)
    Controller->>Facade: updateConsumableGoodsIssueDetails(options con DTO, identificadores y actor cuando corresponde)
    Facade->>Core: updateGoodsIssueDetails({ ...options, type: CONSUMABLE })
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
