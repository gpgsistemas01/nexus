<a id="cu-alm-18"></a>
# `CU-ALM-18` — Crear consumible

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `Route` | boundary | [`consumableApiRoute.js`](../../../../../../src/routes/api/warehouse/consumableApiRoute.js) |
| `Auth` | control | [`authMiddleware.js`](../../../../../../src/middleware/authMiddleware.js) |
| `Validator` | control | [`validatorMiddleware.js`](../../../../../../src/middleware/validatorMiddleware.js) |
| `Controller` | control | [`consumableController.js`](../../../../../../src/controllers/api/warehouse/consumableController.js) |
| `MaterialDto` | control | [`materialDTO.js`](../../../../../../src/dtos/materialDTO.js) |
| `Domain` | control | [`consumableService.js`](../../../../../../src/services/warehouse/consumables/consumableService.js) |
| `MaterialService` | control | [`materialService.js`](../../../../../../src/services/warehouse/materials/materialService.js) |
| `Helpers` | control | [`materialHelpers.js`](../../../../../../src/services/warehouse/materials/materialHelpers.js) |
| `Relations` | control | [`materialRelations.js`](../../../../../../src/services/warehouse/materials/materialRelations.js) |
| `SupplierMaterial` | control | [`supplierMaterialService.js`](../../../../../../src/services/warehouse/materials/supplierMaterialService.js) |
| `Reason` | control | [`reasonService.js`](../../../../../../src/services/warehouse/reasonService.js) |
| `Adjustment` | control | [`adjustmentService.js`](../../../../../../src/services/warehouse/adjustmentService.js) |
| `ErrorHandler` | control | [`app.js`](../../../../../../src/app.js) |
| `ValidationRules` | control | [`materialValidations.js`](../../../../../../src/validators/forms/materialValidations.js) |
| `Formatter` | control | [`formattersUtils.js`](../../../../../../src/utils/formattersUtils.js) |

## Secuencia de implementación

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
    participant MaterialDto@{ "type": "control" } as DTO funcional
    participant Domain@{ "type": "control" } as Servicio de dominio
    participant MaterialService@{ "type": "control" } as Servicio de material
    participant Helpers@{ "type": "control" } as Helpers del dominio
    participant Relations@{ "type": "control" } as Relaciones de acceso
    participant SupplierMaterial@{ "type": "control" } as Proveedor / material
    participant Reason@{ "type": "control" } as Motivo de ajuste
    participant Adjustment@{ "type": "control" } as Ajuste
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant ErrorHandler@{ "type": "control" } as Errores Express

    Client->>Route: POST /api/warehouse/consumables
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    Route->>ValidationRules: materialValidation[] — cadena ejecutada por Express
    Route->>Validator: validate(req, res, next)
    break Validación rechazada
        Validator-->>Client: HTTP 400 { errors }
    end
    Route->>Auth: authorizeUserApi(PERMISSIONS.MATERIALS_WRITE)(req, res, next)
    break Identidad no vigente o permiso denegado
        Auth-->>Client: HTTP 401 INVALID_AUTH o HTTP 403 FORBIDDEN
    end
    alt [autenticación, validación o permiso rechazados]
        Auth-->>Client: HTTP 401/403 { code, message }
        Validator-->>Client: HTTP 400 { errors }
    else [pipeline aceptado]
        Route->>Controller: registerConsumable(req, res)
        Controller->>MaterialDto: createMaterialDtoForRegister(req.body)
        activate MaterialDto
        MaterialDto-->>Controller: createMaterialDtoForRegister(): Object (materialDto)
        deactivate MaterialDto
        Controller->>Formatter: sanitizeEmptyStrings(materialDto)
        Controller->>Domain: createConsumable({ consumableDto, userId })
        Domain->>MaterialService: createMaterial({ materialDto: dimensiones nulas, type: CONSUMABLE, userId })
        activate MaterialService
        MaterialService->>Prisma: getDb().$transaction(async tx => ...)
        MaterialService->>Helpers: prepareMaterialData({ tx, materialDto })
        activate Helpers
        Helpers-->>MaterialService: prepareMaterialData(): Promise[Object ({ rest, relations })]
        deactivate Helpers
        MaterialService->>MaterialService: findMaterialByIdentity({ tx, rest, relations })
        MaterialService->>Prisma: tx.material.findFirst({ where: identidad CONSUMABLE })
        alt [identidad existente]
            MaterialService->>Prisma: tx.supplierMaterial.findUnique({ where: supplierId_materialId })
            break [oferta duplicada]
                MaterialService-->>Domain: throw MaterialAlreadyExists y rollback
            end
        else [identidad nueva]
            MaterialService->>Prisma: tx.material.create({ data: buildMaterialData({ rest, relations }) })
            activate Prisma
            Prisma-->>MaterialService: create(): Promise[{ id: string }]
            deactivate Prisma
        end
        MaterialService->>Relations: syncSupplierMaterial({ tx, supplierId, materialId, maxUnitCost, isActive })
        opt [newStock definido]
            MaterialService->>Reason: findInitialStockAdjustmentReason({ tx })
            activate Reason
            Reason-->>MaterialService: findInitialStockAdjustmentReason(): Promise[Object]
            deactivate Reason
            MaterialService->>Adjustment: createStockAdjustment({ tx, materialId, supplierId, reasonId, observations, newStock, userId })
        end
        MaterialService->>SupplierMaterial: findSupplierMaterialByIds({ tx, materialId, supplierId })
        activate SupplierMaterial
        SupplierMaterial-->>MaterialService: findSupplierMaterialByIds(): Promise[SupplierMaterial]
        deactivate SupplierMaterial
        alt [transacción confirmada]
            Prisma-->>MaterialService: commit
            MaterialService-->>Domain: createMaterial(): Promise[SupplierMaterial]
            Domain-->>Controller: createConsumable(): Promise[SupplierMaterial]
            Controller-->>Client: HTTP 200 { material: supplierMaterial, code }
        else [error de dominio o persistencia]
            Prisma-->>MaterialService: rollback
            MaterialService-->>Domain: throw AppError
            Domain-->>Controller: throw AppError { code, message, meta, statusCode }
            Controller->>ErrorHandler: next(error)
            ErrorHandler-->>Client: HTTP error { code, message, meta }
        end
        deactivate MaterialService
    end
```
