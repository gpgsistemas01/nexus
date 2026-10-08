<a id="cu-sal-16"></a>
# `CU-SAL-16` — Crear salida de consumible

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`.

Si el selector crea un cliente, antes de esta secuencia el navegador completa el `POST
/api/sales/clients` de [`CU-CAT-06`](../catalogs/cu-cat-06.md#cu-cat-06). La salida recibe el
`clientId` resultante — ambas escrituras permanecen separadas y el alta no concede acceso a la ruta
web independiente de clientes.

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
    participant Helpers as src/services/warehouse/goodsIssues/goodsIssueHelpers.js
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant DTO@{ "type": "entity" } as goodsIssueDto: Object<br/>src/dtos/goodsIssueDTO.js
    participant Header as src/services/warehouse/issues/issueHeaderService.js
    participant ErrorHandler as src/app.js
    participant Reference as src/services/document/referenceNumberService.js
    participant Fulfillment as src/services/warehouse/fulfillmentStatusService.js

    Client->>Route: POST /api/warehouse/goods-issues/consumables
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    Route->>Validator: goodsIssueValidation[] y validate(req, res, next)
    break Validación rechazada
        Validator-->>Client: HTTP 400 { errors }
    end
    Route->>Auth: authorizeUserApi(PERMISSIONS.GOODS_ISSUES_MANAGE)(req, res, next)
    break Identidad no vigente o permiso denegado
        Auth-->>Client: HTTP 401 INVALID_AUTH o HTTP 403 FORBIDDEN
    end
    Route->>Controller: registerConsumableGoodsIssue(req, res)
    Controller->>DTO: createGoodsIssueDtoForRegister(req.body)
    DTO-->>Controller: createGoodsIssueDtoForRegister(): Object — DTO normalizado
    Controller->>Controller: sanitizeEmptyStrings(dto)
    Controller->>Facade: createConsumableGoodsIssue(options con DTO, identificadores y actor cuando corresponde)
    Facade->>Core: createGoodsIssue({ ...options, type: CONSUMABLE })
    alt Servicio resuelto
        Core->>Header: resolveIssueHeaderData({ requesterId, advisorId, departmentId, clientId, ... })
        Core->>Fulfillment: findFulfillmentStatusIdByName({ name: PENDING })
        Core->>Helpers: buildGoodsIssueDetails({ details, initialFulfillmentStatusId, type })
        Core->>Prisma: getDb().$transaction(async tx => ...)
        rect rgb(245, 245, 245)
            Note over Core,Prisma: getDb().$transaction(async tx => ...)
            Core->>Reference: generateYearlyReferenceNumber({ tx, ... })
            Core->>Prisma: tx.goodsIssue.create({ data: { type, referenceNumber, ... } })
        end
        Prisma-->>Core: commit de salida pendiente
        Core-->>Facade: createGoodsIssue(): Promise[GoodsIssue]
        Facade-->>Controller: createConsumableGoodsIssue(): Promise[GoodsIssue]
        Controller-->>Client: HTTP 200 { goodsIssue, code }
    else Error de dominio o persistencia
        Core-->>Facade: error — rollback si falló la transacción
        Facade-->>Controller: error propagado
        Controller->>ErrorHandler: next(error) — propagación de Express
        ErrorHandler-->>Client: HTTP de error { code, message }
    end
```
