<a id="cu-sal-02"></a>
# `CU-SAL-02` — Crear salida de material

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`.

Si el selector crea un cliente, antes de esta secuencia el navegador completa el `POST
/api/sales/clients` de [`CU-CAT-06`](../catalogs/cu-cat-06.md#cu-cat-06). La salida recibe el
`clientId` resultante; ambas escrituras permanecen separadas y el alta no concede acceso a la ruta
web independiente de clientes.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/warehouse/goodsIssueApiRoute.js
    participant Auth as src/middleware/authMiddleware.js
    participant Validator as src/validators/forms/goodsIssueValidations.js<br/>src/middleware/validatorMiddleware.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/goodsIssueController.js
    participant IssueDto as goodsIssueDto: Object<br/>src/dtos/goodsIssueDTO.js
    participant Domain as src/services/warehouse/goodsIssues/goodsIssueService.js
    participant Header as src/services/warehouse/issues/issueHeaderService.js
    participant Person as src/services/admin/person/personService.js
    participant ClientData as src/services/sales/clientService.js
    participant Department as src/services/admin/departmentService.js
    participant AdvisorRule as src/services/admin/person/personRules.js
    participant Fulfillment as src/services/warehouse/fulfillmentStatusService.js
    participant DetailBuilder as src/services/warehouse/goodsIssues/goodsIssueHelpers.js
    participant SupplierMaterial as src/services/warehouse/materials/supplierMaterialService.js
    participant Stock as src/services/inventory/stockHelpers.js
    participant Reference as src/services/document/referenceNumberService.js
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant ErrorHandler as src/app.js

    Client->>Route: POST /api/warehouse/goods-issues
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    Auth->>Validator: goodsIssueValidation[] y validate(req, res, next)
    Validator->>Auth: authorizeUserApi(PERMISSIONS.GOODS_ISSUES_MANAGE)(req, res, next)
    alt Token ausente o inválido
        Auth-->>Client: HTTP 401 { code, message }
    else goodsIssueValidation rechaza req.body/req.params
        Validator-->>Client: HTTP 400 { errors }
    else PERMISSIONS.GOODS_ISSUES_MANAGE denegado
        Auth-->>Client: HTTP 403 { code, message }
    else Pipeline aceptado
        Route->>Controller: registerGoodsIssue(req, res)
        activate Controller
        Controller->>IssueDto: createGoodsIssueDtoForRegister(req.body)
        IssueDto-->>Controller: createGoodsIssueDtoForRegister(): Object (goodsIssueDto)
        Controller->>Controller: sanitizeEmptyStrings(goodsIssueDto)
        Controller->>Domain: createGoodsIssue({ goodsIssueDto: sanitizedGoodsIssueDto })
        activate Domain
        alt Datos relacionados, detalles y persistencia válidos
            Domain->>Header: resolveIssueHeaderData({ requesterId, advisorId, departmentId, clientId, issueData, errorTypes, statusName: APPROVED })
            Header->>Person: findPersonById({ id: requesterId })
            Person-->>Header: findPersonById(): Promise[Person|null]
            Header->>Person: findPersonById({ id: advisorId, includeAccesses: true })
            Person-->>Header: findPersonById(): Promise[Person|null]
            Header->>ClientData: findClientById({ id: clientId })
            ClientData-->>Header: findClientById(): Promise[Client|null]
            Header->>Department: findDepartmentById({ id: departmentId })
            Department-->>Header: findDepartmentById(): Promise[Department|null]
            Header->>AdvisorRule: isValidInternalClientAdvisor({ client, advisor })
            AdvisorRule-->>Header: isValidInternalClientAdvisor(): boolean
            Header->>Header: isValidProjectNumber({ client, department, projectNumber })
            Header-->>Domain: resolveIssueHeaderData(): Promise[Object]
            Domain->>Fulfillment: findFulfillmentStatusIdByName({ name: PENDING })
            Fulfillment-->>Domain: findFulfillmentStatusIdByName(): Promise[string|null]
            Domain->>DetailBuilder: buildGoodsIssueDetails({ details, initialFulfillmentStatusId })
            DetailBuilder->>SupplierMaterial: findSupplierMaterialsSnapshot({ pairs })
            SupplierMaterial-->>DetailBuilder: findSupplierMaterialsSnapshot(): Promise[SupplierMaterial[]]
            DetailBuilder->>Stock: calculateConvertedQuantity({ quantity, base, height })
            Stock-->>DetailBuilder: calculateConvertedQuantity(): number
            DetailBuilder-->>Domain: buildGoodsIssueDetails(): Promise[Object[]]
            Domain->>Prisma: getDb().$transaction(async tx => ...)
            Domain->>Reference: generateYearlyReferenceNumber({ type: GOODS_ISSUE, tx })
            Reference->>Prisma: tx.referenceNumberCounter.upsert(...)
            Prisma-->>Reference: upsert(): Promise[ReferenceNumberCounter]
            Reference-->>Domain: generateYearlyReferenceNumber(): Promise[string]
            Domain->>Prisma: tx.goodsIssue.create({ headerData, referenceNumber, fulfillmentStatus: PENDING, processedDetails })
            Prisma-->>Domain: create(): Promise[GoodsIssue]
            Prisma-->>Domain: commit
            Domain-->>Controller: createGoodsIssue(): Promise[GoodsIssue]
            Controller-->>Client: HTTP 200 { goodsIssue, code: CREATED_GOODS_ISSUE }
        else AppError de encabezado, detalle, referencia o persistencia
            Domain-->>Controller: throw AppError { code, message, meta, statusCode }
            Controller->>ErrorHandler: next(error)
            ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
        end
        deactivate Domain
        deactivate Controller
    end
```
