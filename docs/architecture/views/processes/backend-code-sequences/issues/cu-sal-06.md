<a id="cu-sal-06"></a>
# `CU-SAL-06` — Devolver material surtido

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`, `BE-P05`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route@{ "type": "boundary" } as src/routes/api/warehouse/goodsIssues/materials/materialGoodsIssueApiRoute.js
    participant Auth@{ "type": "control" } as src/middleware/authMiddleware.js
    participant Validator@{ "type": "control" } as src/validators/forms/goodsIssueValidations.js<br/>src/middleware/validatorMiddleware.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/goodsIssues/materials/materialGoodsIssueController.js<br/>src/controllers/api/warehouse/goodsIssues/shared/goodsIssueHandlers.js
    participant Facade@{ "type": "control" } as src/services/warehouse/goodsIssues/materials/materialGoodsIssueService.js
    participant Core@{ "type": "control" } as src/services/warehouse/goodsIssues/detailReturns/goodsIssueReturnService.js
    participant Helpers as src/services/warehouse/goodsIssues/goodsIssueHelpers.js
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant Inventory as src/services/inventory/movementService.js
    participant Socket as src/utils/socketUtils.js
    participant DTO@{ "type": "entity" } as goodsIssueDto: Object<br/>src/dtos/goodsIssueDTO.js
    participant Header as src/services/warehouse/issues/issueHeaderService.js
    participant ErrorHandler as src/app.js
    participant Fulfillment as src/services/warehouse/fulfillmentStatusService.js
    participant Status as src/services/warehouse/issues/issueFulfillmentRules.js

    Client->>Route: PATCH /api/warehouse/goods-issues/materials/:id/details/:detailId/returns
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    Route->>Validator: goodsIssueReturnValidation[] y validate(req, res, next)
    break Validación rechazada
        Validator-->>Client: HTTP 400 { errors }
    end
    Route->>Auth: authorizeUserApi(PERMISSIONS.GOODS_ISSUE_DETAILS_MANAGE)(req, res, next)
    break Identidad no vigente o permiso denegado
        Auth-->>Client: HTTP 401 INVALID_AUTH o HTTP 403 FORBIDDEN
    end
    Route->>Controller: registerMaterialGoodsIssueDetailReturn(req, res)
    Controller->>DTO: createGoodsIssueDtoForReturn(req.body)
    DTO-->>Controller: createGoodsIssueDtoForReturn(): Object — DTO normalizado
    Controller->>Controller: sanitizeEmptyStrings(dto)
    Controller->>Facade: returnMaterialGoodsIssueDetail(options con DTO, identificadores y actor cuando corresponde)
    Facade->>Core: returnGoodsIssueDetail({ ...options, type: MATERIAL })
    alt Servicio resuelto
        Core->>Prisma: getDb().$transaction(async tx => ...)
        rect rgb(245, 245, 245)
            Note over Core,Prisma: getDb().$transaction(async tx => ...)
            Core->>Fulfillment: findFulfillmentStatusIdsByName({ tx, names })
            Core->>Prisma: tx.goodsIssueDetail.findFirst({ where: { id: detailId, goodsIssueId: id, goodsIssue: contextWhere } })
            Core->>Core: normalizeDecimal(returnDto.returnQuantity) — validar salida surtida y saldo retornable
            Core->>Inventory: applyInventoryMovement({ tx, movementType: ENTRY, details })
            Core->>Prisma: tx.goodsIssueDetail.update({ where: { id: detailId }, data: devolución y cumplimiento })
            Core->>Prisma: tx.goodsIssueDetail.findMany({ where: { goodsIssueId: id } })
            Core->>Status: resolveIssueFulfillmentStatus(refreshedDetails) si no están todos cancelados
            Core->>Prisma: tx.goodsIssue.update({ where: { id, ...contextWhere }, data: estados derivados })
            Core->>Prisma: tx.goodsIssueReturn.create({ data: { returnedById: userId, movementDetailId, ... } })
        end
        Prisma-->>Core: commit de devolución
        Core-->>Facade: returnGoodsIssueDetail(): Promise[{ ...goodsIssueReturn, detail: updatedDetail }]
        Facade-->>Controller: returnMaterialGoodsIssueDetail(): Promise[{ ...goodsIssueReturn, detail: updatedDetail }]
        Controller->>Socket: emitInventoryUpdated({ context: 'material', source: 'goods-issue-return-created' })
        Controller-->>Client: HTTP 200 { goodsIssueReturn, code }
    else Error de dominio o persistencia
        Core-->>Facade: error — rollback si falló la transacción
        Facade-->>Controller: error propagado
        Controller->>ErrorHandler: next(error) — propagación de Express
        ErrorHandler-->>Client: HTTP de error { code, message }
    end
```
