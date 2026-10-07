<a id="cu-sal-03"></a>
# `CU-SAL-03` — Editar encabezado de salida de material

**Patrones:** `BE-P01`, `BE-P04`.

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

    Client->>Route: PATCH /api/warehouse/goods-issues/materials/:id/header
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    Route->>Validator: goodsIssueHeaderValidation[] y validate(req, res, next)
    Route->>Auth: authorizeUserApi(PERMISSIONS.GOODS_ISSUES_MANAGE)(req, res, next)
    alt Token, validación o permiso rechazados
        Route-->>Client: HTTP 401, 400 o 403 — error de middleware
    else Pipeline aceptado
        Route->>Controller: editMaterialGoodsIssueHeader(req, res)
        Controller->>DTO: createGoodsIssueHeaderDtoForEdit(req.body)
        DTO-->>Controller: createGoodsIssueHeaderDtoForEdit(): Object — DTO normalizado
        Controller->>Controller: sanitizeEmptyStrings(dto)
        Controller->>Facade: updateMaterialGoodsIssueHeader(options con DTO, identificadores y actor cuando corresponde)
        Facade->>Core: updateGoodsIssueHeader({ ...options, type: MATERIAL })
        alt Servicio resuelto
            Core->>Helpers: buildGoodsIssueContextWhere(type)
            Core->>Prisma: goodsIssue.findUnique({ where: { id, ...contextWhere }, include: estados y detalles })
            Core->>Header: resolveIssueHeaderData(options)
            Core->>Prisma: goodsIssue.update({ where: { id, ...contextWhere }, data: headerData })
            Core-->>Facade: updateGoodsIssueHeader(): Promise[GoodsIssue]
            Facade-->>Controller: updateMaterialGoodsIssueHeader(): Promise[GoodsIssue]
            Controller-->>Client: HTTP 200 { goodsIssue, code }
        else Error de dominio o persistencia
            Core-->>Facade: error — rollback si falló la transacción
            Facade-->>Controller: error propagado
            Controller->>ErrorHandler: next(error) — propagación de Express
            ErrorHandler-->>Client: HTTP de error { code, message }
        end
    end
```
