<a id="cu-sal-02"></a>
# `CU-SAL-02` — Crear salida de material

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`.

Si el selector crea un cliente, antes de esta secuencia el navegador completa el `POST
/api/sales/clients` de [`CU-CAT-06`](../catalogs/cu-cat-06.md#cu-cat-06). La salida recibe el
`clientId` resultante — ambas escrituras permanecen separadas y el alta no concede acceso a la ruta
web independiente de clientes.

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
    participant Reference as src/services/document/referenceNumberService.js
    participant Fulfillment as src/services/warehouse/fulfillmentStatusService.js

    Client->>Route: POST /api/warehouse/goods-issues/materials
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    Route->>Validator: goodsIssueValidation[] y validate(req, res, next)
    Route->>Auth: authorizeUserApi(PERMISSIONS.GOODS_ISSUES_MANAGE)(req, res, next)
    alt Token, validación o permiso rechazados
        Route-->>Client: HTTP 401, 400 o 403 — error de middleware
    else Pipeline aceptado
        Route->>Controller: registerMaterialGoodsIssue(req, res)
        Controller->>DTO: createGoodsIssueDtoForRegister(req.body)
        DTO-->>Controller: createGoodsIssueDtoForRegister(): Object — DTO normalizado
        Controller->>Controller: sanitizeEmptyStrings(dto)
        Controller->>Facade: createMaterialGoodsIssue(options con DTO, identificadores y actor cuando corresponde)
        Facade->>Core: createGoodsIssue({ ...options, type: MATERIAL })
        alt Servicio resuelto
            Core->>Header: resolveIssueHeaderData({ requesterId, advisorId, departmentId, clientId, ... })
            Core->>Fulfillment: findFulfillmentStatusIdByName({ name: PENDING })
            Core->>Helpers: buildGoodsIssueDetails({ details, initialFulfillmentStatusId, type })
            critical getDb().$transaction(async tx => ...)
                Core->>Reference: generateYearlyReferenceNumber({ tx, ... })
                Core->>Prisma: tx.goodsIssue.create({ data: { type, referenceNumber, ... } })
            end
            Prisma-->>Core: commit de salida pendiente
            Core-->>Facade: createGoodsIssue(): Promise[GoodsIssue]
            Facade-->>Controller: createMaterialGoodsIssue(): Promise[GoodsIssue]
            Controller-->>Client: HTTP 200 { goodsIssue, code }
        else Error de dominio o persistencia
            Core-->>Facade: error — rollback si falló la transacción
            Facade-->>Controller: error propagado
            Controller->>ErrorHandler: next(error) — propagación de Express
            ErrorHandler-->>Client: HTTP de error { code, message }
        end
    end
```
