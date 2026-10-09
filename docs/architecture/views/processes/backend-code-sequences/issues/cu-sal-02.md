<a id="cu-sal-02"></a>
# `CU-SAL-02` — Crear salida de material

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`.

Si el selector crea un cliente, antes de esta secuencia el navegador completa el `POST
/api/sales/clients` de [`CU-CAT-06`](../catalogs/cu-cat-06.md#cu-cat-06). La salida recibe el
`clientId` resultante — ambas escrituras permanecen separadas y el alta no concede acceso a la ruta
web independiente de clientes.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `Route` | boundary | [`materialGoodsIssueApiRoute.js`](../../../../../../src/routes/api/warehouse/goodsIssues/materials/materialGoodsIssueApiRoute.js) |
| `Auth` | control | [`authMiddleware.js`](../../../../../../src/middleware/authMiddleware.js) |
| `Validator` | control | [`validatorMiddleware.js`](../../../../../../src/middleware/validatorMiddleware.js) |
| `Controller` | control | [`goodsIssueHandlers.js`](../../../../../../src/controllers/api/warehouse/goodsIssues/shared/goodsIssueHandlers.js) |
| `Facade` | control | [`materialGoodsIssueService.js`](../../../../../../src/services/warehouse/goodsIssues/materials/materialGoodsIssueService.js) |
| `Core` | control | [`goodsIssueService.js`](../../../../../../src/services/warehouse/goodsIssues/goodsIssueService.js) |
| `Helpers` | control | [`goodsIssueHelpers.js`](../../../../../../src/services/warehouse/goodsIssues/goodsIssueHelpers.js) |
| `Inventory` | control | [`movementService.js`](../../../../../../src/services/inventory/movementService.js) |
| `DTO` | control | [`goodsIssueDTO.js`](../../../../../../src/dtos/goodsIssueDTO.js) |
| `Header` | control | [`issueHeaderService.js`](../../../../../../src/services/warehouse/issues/issueHeaderService.js) |
| `ErrorHandler` | control | [`app.js`](../../../../../../src/app.js) |
| `Reference` | control | [`referenceNumberService.js`](../../../../../../src/services/document/referenceNumberService.js) |
| `Fulfillment` | control | [`fulfillmentStatusService.js`](../../../../../../src/services/warehouse/fulfillmentStatusService.js) |
| `ValidationRules` | control | [`goodsIssueValidations.js`](../../../../../../src/validators/forms/goodsIssueValidations.js) |
| `Formatter` | control | [`formattersUtils.js`](../../../../../../src/utils/formattersUtils.js) |

### Configuración y archivos de contexto

El módulo específico configura y exporta el handler generado en el archivo de la línea `Controller`: [`materialGoodsIssueController.js`](../../../../../../src/controllers/api/warehouse/goodsIssues/materials/materialGoodsIssueController.js).

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
    participant ValidationRules@{ "type": "control" } as Reglas de entrada
    participant Validator@{ "type": "control" } as Validación HTTP
    participant Controller@{ "type": "control" } as Controller
    participant Formatter@{ "type": "control" } as Formato
    participant Facade@{ "type": "control" } as Adaptador del tipo
    participant Core@{ "type": "control" } as Núcleo del dominio
    participant DTO@{ "type": "control" } as DTO funcional
    participant ErrorHandler@{ "type": "control" } as Errores Express

    Note over Controller: Handler generado

    Client->>Route: POST /api/warehouse/goods-issues/materials
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    Route->>ValidationRules: goodsIssueValidation[] — cadena ejecutada por Express
    Route->>Validator: validate(req, res, next)
    break Validación rechazada
        Validator-->>Client: HTTP 400 { errors }
    end
    Route->>Auth: authorizeUserApi(PERMISSIONS.GOODS_ISSUES_MANAGE)(req, res, next)
    break Identidad no vigente o permiso denegado
        Auth-->>Client: HTTP 401 INVALID_AUTH o HTTP 403 FORBIDDEN
    end
    Route->>Controller: registerMaterialGoodsIssue(req, res)
    Controller->>DTO: createGoodsIssueDtoForRegister(req.body)
    activate DTO
    DTO-->>Controller: createGoodsIssueDtoForRegister(): Object — DTO normalizado
    deactivate DTO
    Controller->>Formatter: sanitizeEmptyStrings(dto)
    Controller->>Facade: createMaterialGoodsIssue(options con DTO, identificadores y actor cuando corresponde)
    Facade->>Core: createGoodsIssue({ ...options, type: MATERIAL })
    Note over Facade,Core: Realización detallada en la colaboración de dominio
    alt Servicio resuelto
        Core-->>Facade: createGoodsIssue(): Promise[GoodsIssue]
        Facade-->>Controller: createMaterialGoodsIssue(): Promise[GoodsIssue]
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
    participant Helpers@{ "type": "control" } as Helpers del dominio
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant Header@{ "type": "control" } as Encabezado
    participant Reference@{ "type": "control" } as Folio documental
    participant Fulfillment@{ "type": "control" } as Cumplimiento

    Facade->>Core: createGoodsIssue({ ...options, type: MATERIAL })
    activate Core
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
    else Error de dominio o persistencia
        Core-->>Facade: error — rollback si falló la transacción
    end
    deactivate Core
```
