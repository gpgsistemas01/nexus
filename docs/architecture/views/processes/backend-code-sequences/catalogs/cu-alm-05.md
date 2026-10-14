<a id="cu-alm-05"></a>
# `CU-ALM-05` — Ajustar existencia de material

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`, `BE-P05`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.
La composición incluye también los archivos de configuración, construcción y reexport: cada
uno tiene un nodo propio, aunque no ejecute una delegación durante la petición.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `Router` | boundary | [`materialApiRoute.js`](../../../../../../src/routes/api/warehouse/materialApiRoute.js) |
| `Auth` | control | [`authMiddleware.js`](../../../../../../src/middleware/authMiddleware.js) |
| `Validator` | control | [`validatorMiddleware.js`](../../../../../../src/middleware/validatorMiddleware.js) |
| `Controller` | control | [`materialController.js`](../../../../../../src/controllers/api/warehouse/materialController.js) |
| `StockDto` | control | [`materialDTO.js`](../../../../../../src/dtos/materialDTO.js) |
| `Service` | control | [`materialService.js`](../../../../../../src/services/warehouse/materials/materialService.js) |
| `Adjustment` | control | [`adjustmentService.js`](../../../../../../src/services/warehouse/adjustmentService.js) |
| `Reference` | control | [`referenceNumberService.js`](../../../../../../src/services/document/referenceNumberService.js) |
| `Stock` | control | [`stockHelpers.js`](../../../../../../src/services/inventory/stockHelpers.js) |
| `Movement` | control | [`movementService.js`](../../../../../../src/services/inventory/movementService.js) |
| `SupplierMaterial` | control | [`supplierMaterialService.js`](../../../../../../src/services/warehouse/materials/supplierMaterialService.js) |
| `Socket` | control | [`socketUtils.js`](../../../../../../src/utils/socketUtils.js) |
| `ValidationRules` | control | [`materialValidations.js`](../../../../../../src/validators/forms/materialValidations.js) |
| `FileBaseRepository` | control | [`baseRepository.js`](../../../../../../src/repository/baseRepository.js) |
| `FileDatabaseUrl` | control | [`databaseUrl.js`](../../../../../../src/lib/databaseUrl.js) |
| `FilePrisma` | control | [`prisma.js`](../../../../../../src/lib/prisma.js) |
| `FileMovementHelpers` | control | [`movementHelpers.js`](../../../../../../src/services/inventory/movementHelpers.js) |
| `FileFormattersUtils` | control | [`formattersUtils.js`](../../../../../../src/utils/formattersUtils.js) |

## Composición de archivos

Los archivos que construyen, configuran o reexportan funciones aparecen como componentes
individuales. Las flechas representan imports reales, resueltos al cargar los módulos;
las llamadas durante la operación se muestran en las secuencias siguientes. Cada nombre
identifica un archivo y la tabla conserva su ruta completa.

```mermaid
flowchart TB
    subgraph Component0["Backend"]
        FileDatabaseUrl["databaseUrl.js"]
        FilePrisma["prisma.js"]
        FileBaseRepository["baseRepository.js"]
    end
    FilePrisma -->|import| FileDatabaseUrl
    FileBaseRepository -->|import| FilePrisma
```

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Router@{ "type": "boundary" } as materialApiRoute.js
    participant Auth@{ "type": "control" } as authMiddleware.js
    participant ValidationRules@{ "type": "control" } as materialValidations.js
    participant Validator@{ "type": "control" } as validatorMiddleware.js
    participant Controller@{ "type": "control" } as materialController.js

    Client->>Router: PATCH /api/warehouse/materials/:id/stock + accessToken
    Router->>Auth: verifyApiTokenRequired(req, res, next)
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    Router->>ValidationRules: materialStockValidation[] — cadena ejecutada por Express
    Router->>Validator: validate(req, res, next)
    break Validación rechazada
        Validator-->>Client: HTTP 400 { errors }
    end
    Router->>Auth: authorizeUserApi(PERMISSIONS.MATERIALS_ADJUST_STOCK)(req, res, next)
    break Identidad no vigente o permiso denegado
        Auth-->>Client: HTTP 401 INVALID_AUTH o HTTP 403 FORBIDDEN
    end
    Router->>Controller: editMaterialStock(req, res)
    alt Commit confirmado
        Controller-->>Client: 200 { material, code }
    else Regla de stock o persistencia rechazada
        Controller-->>Client: status HTTP { code, message }
    end
```

## Detalle de coordinación del controller

Continúa la colaboración anterior. Conserva el orden de los mensajes del código y
separa los archivos que ejecutan esta parte del recorrido; los otros detalles del caso
completan las llamadas a helpers y la propagación del resultado.

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Controller@{ "type": "control" } as materialController.js
    participant StockDto@{ "type": "control" } as DTO funcional<br/>materialDTO.js
    participant Service@{ "type": "control" } as materialService.js
    participant Adjustment@{ "type": "control" } as adjustmentService.js
    participant Reference@{ "type": "control" } as referenceNumberService.js
    participant Stock@{ "type": "control" } as stockHelpers.js
    participant Movement@{ "type": "control" } as movementService.js
    participant SupplierMaterial@{ "type": "control" } as supplierMaterialService.js
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant Socket@{ "type": "control" } as socketUtils.js

    participant FileBaseRepository@{ "type": "control" } as baseRepository.js

    participant FileFormattersUtils@{ "type": "control" } as formattersUtils.js
    participant FileMovementHelpers@{ "type": "control" } as movementHelpers.js

    Controller->>StockDto: createMaterialDtoForStockUpdate(req.body)
    activate StockDto
    StockDto-->>Controller: createMaterialDtoForStockUpdate(): Object (materialDto)
    deactivate StockDto
    Controller->>Service: updateMaterialStock({ id, materialDto, userId })
    Service->>Adjustment: createStockAdjustment({ materialId: id, supplierId, reasonId, observations, newStock, userId })
    Adjustment->>FileBaseRepository: getDb()
    FileBaseRepository-->>Adjustment: getDb(): PrismaClient | TransactionClient — tx si se recibió
    Adjustment->>Prisma: db.$transaction(async tx => ...)
    Adjustment->>SupplierMaterial: findSupplierMaterialByIds({ tx, materialId, supplierId })
    Adjustment->>Reference: generateYearlyReferenceNumber({ type, tx })
    Adjustment->>Adjustment: calculateStockAdjustmentValues({ supplierMaterial, newStock, base, height })
    Adjustment->>FileFormattersUtils: normalizeDecimal(newStock - previousStock)
    FileFormattersUtils-->>Adjustment: normalizeDecimal(): number
    Adjustment->>Stock: calculateConvertedQuantity({ currentStock: newStock, base, height })
    Adjustment->>Stock: assertSufficientStock({ material: supplierMaterial, newStock, newConvertedQuantity })
    Adjustment->>Prisma: tx.stockAdjustment.create({ data })
    Adjustment->>Adjustment: createStockAdjustmentMovement({ tx, adjustment, previousStock, newStock, difference })
    Adjustment->>FileMovementHelpers: buildInventoryMovementDetail({ materialId, supplierId, quantity: difference, previousStock, newStock })
    FileMovementHelpers-->>Adjustment: buildInventoryMovementDetail(): Object
    Adjustment->>Movement: createInventoryMovement({ tx, movementType: ADJUSTMENT, reference, details })
    Adjustment->>SupplierMaterial: adjustSupplierMaterialStock({ tx, materialId, supplierId, newStock, newConvertedQuantity })
    alt Commit confirmado
        Prisma-->>Adjustment: $transaction(): Promise[SupplierMaterial]
        Adjustment-->>Service: createStockAdjustment(): Promise[SupplierMaterial]
        Service-->>Controller: updateMaterialStock(): Promise[SupplierMaterial]
        Controller->>Socket: emitInventoryUpdated()
        Controller-->>Client: 200 { material, code }
    else Regla de stock o persistencia rechazada
        Prisma-->>Adjustment: error Prisma
        Adjustment-->>Service: error de dominio tipado y rollback
        Service-->>Controller: error propagado
        Controller-->>Client: status HTTP { code, message }
    end
```

