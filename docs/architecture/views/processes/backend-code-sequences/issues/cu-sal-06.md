<a id="cu-sal-06"></a>
# `CU-SAL-06` — Devolver material surtido

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`, `BE-P05`.

```mermaid
sequenceDiagram
    autonumber
    participant Browser as Navegador
    participant Router@{ "type": "boundary" } as src/routes/api/warehouse/goodsIssueApiRoute.js
    participant Auth@{ "type": "control" } as src/middleware/authMiddleware.js
    participant Validator@{ "type": "control" } as src/validators/forms/goodsIssueValidations.js<br/>src/middleware/validatorMiddleware.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/goodsIssueController.js
    participant ReturnDto@{ "type": "entity" } as returnDto: Object<br/>src/dtos/goodsIssueDTO.js
    participant Service@{ "type": "control" } as src/services/warehouse/goodsIssues/detailReturns/goodsIssueReturnService.js
    participant Inventory@{ "type": "control" } as src/services/inventory/movementService.js
    participant Status@{ "type": "control" } as src/services/warehouse/issues/issueFulfillmentRules.js
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant Socket as src/utils/socketUtils.js

    Browser->>Router: PATCH /:id/details/:detailId/returns
    Router->>Auth: verifyApiTokenRequired(req, res, next)
    Auth->>Validator: goodsIssueReturnValidation[] y validate(req, res, next)
    Validator->>Auth: authorizeUserApi(PERMISSIONS.GOODS_ISSUE_DETAILS_MANAGE)(req, res, next)
    alt Token ausente o inválido
        Auth-->>Browser: HTTP 401 { code, message }
    else goodsIssueReturnValidation rechaza req.body/req.params
        Validator-->>Browser: HTTP 400 { errors }
    else PERMISSIONS.GOODS_ISSUE_DETAILS_MANAGE denegado
        Auth-->>Browser: HTTP 403 { code, message }
    else Pipeline aceptado
        Router->>Controller: registerGoodsIssueDetailReturn(req, res)
        Controller->>ReturnDto: createGoodsIssueDtoForReturn(req.body)
        ReturnDto-->>Controller: createGoodsIssueDtoForReturn(): Object (returnDto)
        Controller->>Service: returnGoodsIssueDetail({ id, detailId, returnDto, userId })
        Service->>Prisma: getDb().$transaction(async tx)
        Service->>Prisma: tx.goodsIssueDetail.findFirst({ where: { id: detailId, goodsIssueId: id } })
        Service->>Service: returnGoodsIssueDetail() valida estado, cantidad y devoluciones
        alt Cantidad no retornable
            Service-->>Service: error de dominio
            Service-->>Controller: rollback y error
        else Cantidad válida
            Service->>Inventory: applyInventoryMovement({ tx, movementType: ENTRY, details })
            Service->>Prisma: tx.goodsIssueReturn.create({ data })
            Service->>Prisma: tx.goodsIssueDetail.findMany({ where: { goodsIssueId: id } })
            alt todos los detalles quedan Cancelado
                Service->>Status: resolveIssueFulfillmentStatus(details)
            else existe algún detalle no cancelado
                Service->>Status: resolveIssueFulfillmentStatus(refreshedDetails) sin cancelar el encabezado
            end
            Prisma-->>Service: salida actualizada y commit
            Service-->>Controller: returnGoodsIssueDetail(): Promise[{ goodsIssue: GoodsIssue, goodsIssueReturn: GoodsIssueReturn }]
            Controller->>Socket: emitInventoryUpdated({ context: 'material', source: 'goods-issue-return-created' })
            Controller-->>Browser: 200 { goodsIssueReturn, code }
        end
    end
```
