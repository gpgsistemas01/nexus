<a id="cu-sal-20"></a>
# `CU-SAL-20` — Devolver consumible surtido

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`, `BE-P05`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `Route` | boundary | [`consumableGoodsIssueApiRoute.js`](../../../../../../src/routes/api/warehouse/goodsIssues/consumables/consumableGoodsIssueApiRoute.js) |
| `Auth` | control | [`authMiddleware.js`](../../../../../../src/middleware/authMiddleware.js) |
| `Validator` | control | [`validatorMiddleware.js`](../../../../../../src/middleware/validatorMiddleware.js) |
| `Controller` | control | [`goodsIssueHandlers.js`](../../../../../../src/controllers/api/warehouse/goodsIssues/shared/goodsIssueHandlers.js) |
| `Facade` | control | [`consumableGoodsIssueService.js`](../../../../../../src/services/warehouse/goodsIssues/consumables/consumableGoodsIssueService.js) |
| `Core` | control | [`goodsIssueReturnService.js`](../../../../../../src/services/warehouse/goodsIssues/detailReturns/goodsIssueReturnService.js) |
| `Inventory` | control | [`movementService.js`](../../../../../../src/services/inventory/movementService.js) |
| `Socket` | control | [`socketUtils.js`](../../../../../../src/utils/socketUtils.js) |
| `DTO` | control | [`goodsIssueDTO.js`](../../../../../../src/dtos/goodsIssueDTO.js) |
| `ErrorHandler` | control | [`app.js`](../../../../../../src/app.js) |
| `Fulfillment` | control | [`fulfillmentStatusService.js`](../../../../../../src/services/warehouse/fulfillmentStatusService.js) |
| `Status` | control | [`issueFulfillmentRules.js`](../../../../../../src/services/warehouse/issues/issueFulfillmentRules.js) |
| `ValidationRules` | control | [`goodsIssueValidations.js`](../../../../../../src/validators/forms/goodsIssueValidations.js) |
| `Formatter` | control | [`formattersUtils.js`](../../../../../../src/utils/formattersUtils.js) |

### Configuración y archivos de contexto

El módulo específico configura y exporta el handler generado en el archivo de la línea `Controller`: [`consumableGoodsIssueController.js`](../../../../../../src/controllers/api/warehouse/goodsIssues/consumables/consumableGoodsIssueController.js).

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
    participant Socket@{ "type": "control" } as Eventos Socket.IO
    participant DTO@{ "type": "control" } as DTO funcional
    participant ErrorHandler@{ "type": "control" } as Errores Express

    Note over Controller: Handler generado

    Client->>Route: PATCH /api/warehouse/goods-issues/consumables/:id/details/:detailId/returns
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    Route->>ValidationRules: goodsIssueReturnValidation[] — cadena ejecutada por Express
    Route->>Validator: validate(req, res, next)
    break Validación rechazada
        Validator-->>Client: HTTP 400 { errors }
    end
    Route->>Auth: authorizeUserApi(PERMISSIONS.GOODS_ISSUE_DETAILS_MANAGE)(req, res, next)
    break Identidad no vigente o permiso denegado
        Auth-->>Client: HTTP 401 INVALID_AUTH o HTTP 403 FORBIDDEN
    end
    Route->>Controller: registerConsumableGoodsIssueDetailReturn(req, res)
    Controller->>DTO: createGoodsIssueDtoForReturn(req.body)
    activate DTO
    DTO-->>Controller: createGoodsIssueDtoForReturn(): Object — DTO normalizado
    deactivate DTO
    Controller->>Formatter: sanitizeEmptyStrings(dto)
    Controller->>Facade: returnConsumableGoodsIssueDetail(options con DTO, identificadores y actor cuando corresponde)
    Facade->>Core: returnGoodsIssueDetail({ ...options, type: CONSUMABLE })
    Note over Facade,Core: Realización detallada en la colaboración de dominio
    alt Servicio resuelto
        rect rgb(245, 245, 245)
            Core->>Formatter: normalizeDecimal(returnDto.returnQuantity) — validar salida surtida y saldo retornable
            Formatter-->>Core: normalizeDecimal(): number
        end
        Core-->>Facade: returnGoodsIssueDetail(): Promise[{ ...goodsIssueReturn, detail: updatedDetail }]
        Facade-->>Controller: returnConsumableGoodsIssueDetail(): Promise[{ ...goodsIssueReturn, detail: updatedDetail }]
        Controller->>Socket: emitInventoryUpdated({ context: 'consumable', source: 'goods-issue-return-created' })
        Controller-->>Client: HTTP 200 { goodsIssueReturn, code }
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
    participant Status@{ "type": "control" } as Estado

    participant Formatter@{ "type": "control" } as Formato

    Facade->>Core: returnGoodsIssueDetail({ ...options, type: CONSUMABLE })
    activate Core
    alt Servicio resuelto
        Core->>Prisma: getDb().$transaction(async tx => ...)
        rect rgb(245, 245, 245)
            Note over Core,Prisma: getDb().$transaction(async tx => ...)
            Core->>Fulfillment: findFulfillmentStatusIdsByName({ tx, names })
            Core->>Prisma: tx.goodsIssueDetail.findFirst({ where: { id: detailId, goodsIssueId: id, goodsIssue: contextWhere } })
            Core->>Formatter: normalizeDecimal(returnDto.returnQuantity) — validar salida surtida y saldo retornable
            Formatter-->>Core: normalizeDecimal(): number
            Core->>Inventory: applyInventoryMovement({ tx, movementType: ENTRY, details })
            Core->>Prisma: tx.goodsIssueDetail.update({ where: { id: detailId }, data: devolución y cumplimiento })
            Core->>Prisma: tx.goodsIssueDetail.findMany({ where: { goodsIssueId: id } })
            Core->>Status: resolveIssueFulfillmentStatus(refreshedDetails) si no están todos cancelados
            Core->>Prisma: tx.goodsIssue.update({ where: { id, ...contextWhere }, data: estados derivados })
            Core->>Prisma: tx.goodsIssueReturn.create({ data: { returnedById: userId, movementDetailId, ... } })
        end
        Prisma-->>Core: commit de devolución
        Core-->>Facade: returnGoodsIssueDetail(): Promise[{ ...goodsIssueReturn, detail: updatedDetail }]
    else Error de dominio o persistencia
        Core-->>Facade: error — rollback si falló la transacción
    end
    deactivate Core
```
