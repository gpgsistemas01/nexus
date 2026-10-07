<a id="cu-sal-04"></a>
# `CU-SAL-04` — Editar detalles de material de una salida

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`, `BE-P05`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/warehouse/goodsIssues/materials/materialGoodsIssueApiRoute.js
    participant Auth as src/middleware/authMiddleware.js
    participant Validator as src/validators/forms/goodsIssueValidations.js<br/>src/middleware/validatorMiddleware.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/goodsIssues/materials/materialGoodsIssueController.js<br/>src/controllers/api/warehouse/goodsIssues/shared/goodsIssueHandlers.js
    participant Facade as src/services/warehouse/goodsIssues/materials/materialGoodsIssueService.js
    participant Core as src/services/warehouse/goodsIssues/goodsIssueService.js
    participant Helpers as src/services/warehouse/goodsIssues/goodsIssueHelpers.js
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant Inventory as src/services/inventory/movementService.js
    participant DTO as goodsIssueDto: Object<br/>src/dtos/goodsIssueDTO.js
    participant Header as src/services/warehouse/issues/issueHeaderService.js
    participant ErrorHandler as src/app.js

    Client->>Route: PATCH /api/warehouse/goods-issues/materials/:id
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    Route->>Validator: goodsIssueUpdateValidation[] y validate(req, res, next)
    Route->>Auth: authorizeUserApi(PERMISSIONS.GOODS_ISSUES_MANAGE)(req, res, next)
    alt Token, validación o permiso rechazados
        Route-->>Client: HTTP 401, 400 o 403 — error de middleware
    else Pipeline aceptado
        Route->>Controller: editMaterialGoodsIssue(req, res)
        Controller->>DTO: createGoodsIssueDtoForEdit(req.body)
        DTO-->>Controller: createGoodsIssueDtoForEdit(): Object — DTO normalizado
        Controller->>Controller: sanitizeEmptyStrings(dto)
        Controller->>Facade: updateMaterialGoodsIssue(options con DTO, identificadores y actor cuando corresponde)
        Facade->>Core: updateGoodsIssue({ ...options, type: MATERIAL })
        alt Servicio resuelto
            Core->>Helpers: buildGoodsIssueContextWhere(type)
            Core->>Prisma: goodsIssue.findUnique({ where: { id, ...contextWhere }, include: estados y detalles })
            Core->>Core: updateGoodsIssue() — exigir pendiente y sin cantidades surtidas
            Core->>Header: resolveIssueHeaderData(options)
            Core->>Helpers: buildGoodsIssueDetails({ details, initialFulfillmentStatusId, type })
            critical getDb().$transaction(async tx => ...)
                Core->>Prisma: tx.goodsIssue.findUnique({ where: { id, ...contextWhere }, select: { id: true } })
                Core->>Prisma: tx.goodsIssueDetail.deleteMany({ where: { goodsIssueId: id } })
                Core->>Prisma: tx.goodsIssueDetail.createMany({ data: processedDetails })
                Core->>Prisma: tx.goodsIssue.update({ where: { id, ...contextWhere }, data: encabezado y cumplimiento pendiente })
            end
            Prisma-->>Core: commit de encabezado y detalles
            Core-->>Facade: updateGoodsIssue(): Promise[GoodsIssue]
            Facade-->>Controller: updateMaterialGoodsIssue(): Promise[GoodsIssue]
            Controller-->>Client: HTTP 200 { goodsIssue, code }
        else Error de dominio o persistencia
            Core-->>Facade: error — rollback si falló la transacción
            Facade-->>Controller: error propagado
            Controller->>ErrorHandler: next(error) — propagación de Express
            ErrorHandler-->>Client: HTTP de error { code, message }
        end
    end
```
