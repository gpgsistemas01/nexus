<a id="cu-ent-08"></a>
# `CU-ENT-08` — Crear compra de consumible

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`, `BE-P05`.

Si el selector crea un proveedor, antes de esta secuencia el navegador completa el `POST
/api/warehouse/suppliers` de [`CU-CAT-02`](../catalogs/cu-cat-02.md#cu-cat-02). La compra recibe el
`supplierId` resultante — el alta no se integra en la transacción de la compra ni habilita la ruta web
independiente de proveedores.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `Route` | boundary | [`consumableGoodsReceiptApiRoute.js`](../../../../../../src/routes/api/warehouse/goodsReceipts/consumables/consumableGoodsReceiptApiRoute.js) |
| `Auth` | control | [`authMiddleware.js`](../../../../../../src/middleware/authMiddleware.js) |
| `Validator` | control | [`validatorMiddleware.js`](../../../../../../src/middleware/validatorMiddleware.js) |
| `Controller` | control | [`goodsReceiptHandlers.js`](../../../../../../src/controllers/api/warehouse/goodsReceipts/shared/goodsReceiptHandlers.js) |
| `Facade` | control | [`consumableGoodsReceiptService.js`](../../../../../../src/services/warehouse/goodsReceipts/consumables/consumableGoodsReceiptService.js) |
| `Core` | control | [`goodsReceiptService.js`](../../../../../../src/services/warehouse/goodsReceipts/goodsReceiptService.js) |
| `Helpers` | control | [`goodsReceiptHelpers.js`](../../../../../../src/services/warehouse/goodsReceipts/goodsReceiptHelpers.js) |
| `Inventory` | control | [`movementService.js`](../../../../../../src/services/inventory/movementService.js) |
| `Socket` | control | [`socketUtils.js`](../../../../../../src/utils/socketUtils.js) |
| `DTO` | control | [`goodsReceiptDTO.js`](../../../../../../src/dtos/goodsReceiptDTO.js) |
| `ErrorHandler` | control | [`app.js`](../../../../../../src/app.js) |
| `Costs` | control | [`supplierMaterialService.js`](../../../../../../src/services/warehouse/materials/supplierMaterialService.js) |
| `Invoice` | control | [`goodsReceiptInvoiceService.js`](../../../../../../src/services/warehouse/goodsReceipts/goodsReceiptInvoiceService.js) |
| `Reference` | control | [`referenceNumberService.js`](../../../../../../src/services/document/referenceNumberService.js) |
| `ValidationRules` | control | [`goodsReceiptValidations.js`](../../../../../../src/validators/forms/goodsReceiptValidations.js) |
| `Supplier` | control | [`supplierService.js`](../../../../../../src/services/warehouse/supplierService.js) |
| `Person` | control | [`personService.js`](../../../../../../src/services/admin/person/personService.js) |
| `Formatter` | control | [`formattersUtils.js`](../../../../../../src/utils/formattersUtils.js) |

### Configuración y archivos de contexto

El módulo específico configura y exporta el handler generado en el archivo de la línea `Controller`: [`consumableGoodsReceiptController.js`](../../../../../../src/controllers/api/warehouse/goodsReceipts/consumables/consumableGoodsReceiptController.js).

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

    Client->>Route: POST /api/warehouse/goods-receipts/consumables
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    Route->>ValidationRules: goodsReceiptValidation[] — cadena ejecutada por Express
    Route->>Validator: validate(req, res, next)
    break Validación rechazada
        Validator-->>Client: HTTP 400 { errors }
    end
    Route->>Auth: authorizeUserApi(PERMISSIONS.GOODS_RECEIPTS_MANAGE)(req, res, next)
    break Identidad no vigente o permiso denegado
        Auth-->>Client: HTTP 401 INVALID_AUTH o HTTP 403 FORBIDDEN
    end
    Route->>Controller: registerConsumableGoodsReceipt(req, res)
    Controller->>DTO: createGoodsReceiptDtoForRegister(req.body)
    activate DTO
    DTO-->>Controller: createGoodsReceiptDtoForRegister(): Object — DTO normalizado
    deactivate DTO
    Controller->>Formatter: sanitizeEmptyStrings(dto)
    Controller->>Facade: createConsumableGoodsReceipt(options con DTO, identificadores y actor cuando corresponde)
    Facade->>Core: createGoodsReceipt({ ...options, type: CONSUMABLE })
    Note over Facade,Core: Realización detallada en la colaboración de dominio
    alt Servicio resuelto
        Core-->>Facade: createGoodsReceipt(): Promise[GoodsReceipt]
        Facade-->>Controller: createConsumableGoodsReceipt(): Promise[GoodsReceipt]
        Controller->>Socket: emitInventoryUpdated({ context: 'consumable', source: 'goods-receipt-created' })
        Controller-->>Client: HTTP 200 { goodsReceipt, code }
    else Error de dominio o persistencia
        Core-->>Facade: error — rollback si falló el callback transaccional
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
    participant Supplier@{ "type": "control" } as Proveedor
    participant Person@{ "type": "control" } as Persona
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant Inventory@{ "type": "control" } as Inventario
    participant Costs@{ "type": "control" } as Costo del material
    participant Invoice@{ "type": "control" } as Factura
    participant Reference@{ "type": "control" } as Folio documental

    Facade->>Core: createGoodsReceipt({ ...options, type: CONSUMABLE })
    activate Core
    alt Servicio resuelto
        Core->>Supplier: findUniqueSupplier({ id: supplierId })
        Supplier-->>Core: findUniqueSupplier(): Promise[Supplier]
        Note over Core: SupplierInactiveConflict si el proveedor está inactivo
        Core->>Invoice: assertGoodsReceiptInvoiceAvailable({ supplierId, invoice })
        Invoice-->>Core: assertGoodsReceiptInvoiceAvailable(): Promise[void]
        Core->>Person: findPersonById({ id: receivedById })
        Person-->>Core: findPersonById(): Promise[Person | null]
        Note over Core: PersonReceivedByNotFound si falta el receptor
        Core->>Helpers: buildGoodsReceiptDetails(details, { supplierId, type })
        Helpers-->>Core: buildGoodsReceiptDetails(): Promise[Object[]]
        Core->>Helpers: calculateGoodsReceiptTotals(processedDetails)
        Helpers-->>Core: calculateGoodsReceiptTotals(): Object
        Core->>Prisma: getDb().$transaction(async tx => ...)
        rect rgb(245, 245, 245)
            Note over Core,Prisma: getDb().$transaction(async tx => ...)
            Core->>Reference: generateYearlyReferenceNumber({ tx, ... })
            Core->>Prisma: tx.goodsReceipt.create({ data: { type, referenceNumber, ... } })
            Core->>Inventory: applyInventoryMovement({ tx, movementType: ENTRY, details })
            Inventory->>Inventory: createInventoryMovement({ tx, ... })
            Inventory->>Prisma: db.inventoryMovement.create({ data, include: { details: true } })
            Note over Inventory,Prisma: applyInventoryMovement también actualiza stock con el mismo tx
        end
        Prisma-->>Core: commit y compra creada
        Core->>Costs: updateMaterialUnitCostIfHigher({ supplierId: result.supplierId, details: result.details }) tras commit
        Core-->>Facade: createGoodsReceipt(): Promise[GoodsReceipt]
    else Error de dominio o persistencia
        Note over Core,Prisma: Un error al actualizar costo después del commit no revierte la compra
        Core-->>Facade: error — rollback si falló el callback transaccional
    end
    deactivate Core
```
