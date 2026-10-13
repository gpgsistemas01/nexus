<a id="cu-alm-10"></a>
# `CU-ALM-10` — Registrar merma

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
| `Route` | boundary | [`wasteApiRoute.js`](../../../../../../src/routes/api/warehouse/wasteApiRoute.js) |
| `Auth` | control | [`authMiddleware.js`](../../../../../../src/middleware/authMiddleware.js) |
| `Validator` | control | [`validatorMiddleware.js`](../../../../../../src/middleware/validatorMiddleware.js) |
| `Controller` | control | [`wasteController.js`](../../../../../../src/controllers/api/warehouse/wasteController.js) |
| `WasteDto` | control | [`wasteDTO.js`](../../../../../../src/dtos/wasteDTO.js) |
| `Formatter` | control | [`formattersUtils.js`](../../../../../../src/utils/formattersUtils.js) |
| `Domain` | control | [`wasteService.js`](../../../../../../src/services/warehouse/wastes/wasteService.js) |
| `Socket` | control | [`socketUtils.js`](../../../../../../src/utils/socketUtils.js) |
| `ErrorHandler` | control | [`app.js`](../../../../../../src/app.js) |
| `ValidationRules` | control | [`wasteValidations.js`](../../../../../../src/validators/forms/wasteValidations.js) |
| `ReferenceController` | control | [`wasteRollReferenceController.js`](../../../../../../src/controllers/api/warehouse/wasteRollReferenceController.js) |
| `ReferenceRules` | control | [`wasteRollReferenceValidations.js`](../../../../../../src/validators/forms/wasteRollReferenceValidations.js) |
| `ReferenceService` | control | [`wasteRollReferenceService.js`](../../../../../../src/services/warehouse/wastes/wasteRollReferenceService.js) |
| `Repository` | control | [`baseRepository.js`](../../../../../../src/repository/baseRepository.js) |
| `Templates` | control | [`wasteMaterialService.js`](../../../../../../src/services/warehouse/wastes/wasteMaterialService.js) |

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Route@{ "type": "boundary" } as wasteApiRoute.js
    participant Auth@{ "type": "control" } as authMiddleware.js
    participant ValidationRules@{ "type": "control" } as wasteValidations.js
    participant Validator@{ "type": "control" } as validatorMiddleware.js
    participant Controller@{ "type": "control" } as wasteController.js

    Client->>Route: GET /api/warehouse/wastes/material-templates
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    Route->>Auth: authorizeUserApi(PERMISSIONS.WASTES_READ)(req, res, next)
    break Identidad no vigente o permiso denegado
        Auth-->>Client: HTTP 401 INVALID_AUTH o HTTP 403 FORBIDDEN
    end
    Route->>Controller: getWasteMaterialTemplates(req, res)
    Controller-->>Client: HTTP 200 { code, data: templates }
    Client->>Route: POST /api/warehouse/wastes
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    Route->>ValidationRules: wasteValidation[] — cadena ejecutada por Express
    Note over ValidationRules: Validar cono y total: formato, precisión, rango y captura conjunta
    Route->>Validator: validate(req, res, next)
    break Validación rechazada
        Validator-->>Client: HTTP 400 { errors }
    end
    Route->>Auth: authorizeUserApi(PERMISSIONS.WASTES_WRITE)(req, res, next)
    break Identidad no vigente o permiso denegado
        Auth-->>Client: HTTP 401 INVALID_AUTH o HTTP 403 FORBIDDEN
    end
    Route->>Controller: registerWaste(req, res)
    activate Controller
        Controller-->>Client: HTTP 200 { waste, code: CREATED_WASTE }
    deactivate Controller
```

## Detalle de coordinación del controller

Continúa la colaboración anterior. Conserva el orden de los mensajes del código y
separa los archivos que ejecutan esta parte del recorrido; los otros detalles del caso
completan las llamadas a helpers y la propagación del resultado.

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Controller@{ "type": "control" } as wasteController.js
    participant WasteDto@{ "type": "control" } as DTO funcional<br/>wasteDTO.js
    participant Formatter@{ "type": "control" } as formattersUtils.js
    participant Domain@{ "type": "control" } as wasteService.js
    participant Templates@{ "type": "control" } as wasteMaterialService.js
    participant Socket@{ "type": "control" } as socketUtils.js
    participant ErrorHandler@{ "type": "control" } as app.js

    Controller->>Templates: findWasteMaterialTemplates({ search, skip, take, supplierId })
    Templates-->>Controller: findWasteMaterialTemplates(): Promise[Object[]]
    Controller-->>Client: HTTP 200 { code, data: templates }
    activate Controller
    Controller->>WasteDto: createWasteDtoForRegister(req.body)
    activate WasteDto
    WasteDto-->>Controller: createWasteDtoForRegister(): Object (wasteDto)
    deactivate WasteDto
    Controller->>Formatter: sanitizeEmptyStrings(wasteDto)
    activate Formatter
    Formatter-->>Controller: sanitizeEmptyStrings(): Object (sanitizedWasteDto)
    deactivate Formatter
    Controller->>Domain: createWasteWithInitialStockAdjustment({ wasteDto: sanitizedWasteDto, userId: req.user.id })
    activate Domain
    Note over Domain: Resolver cono medido o de oferta persistida<br/>Calcular neto y largo estimado si se solicita<br/>Guardar copia de la referencia usada
    Domain->>Domain: findWasteByIdentity({ tx, supplierId, name, base, height, coneWeightKg, totalWeightKg })
    alt La merma ya existe
        Domain-->>Controller: WASTE_ALREADY_EXISTS con meta.waste, sin incrementar stock
    else La merma no existe
        Domain->>Domain: createWasteWithInitialStockAdjustment({ wasteDto, userId }) crea merma, ajuste y movimiento inicial
    end
    alt Registro confirmado
        Domain-->>Controller: createWasteWithInitialStockAdjustment(): Promise[Waste]
        Controller->>Socket: emitInventoryUpdated({ context: 'waste', source: 'waste-created' })
        Controller-->>Client: HTTP 200 { waste, code: CREATED_WASTE }
    else AppError propagado
        Domain-->>Controller: throw AppError { code, message, meta, statusCode }
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
    end
    deactivate Domain
    deactivate Controller
```

## Detalle de configuración de la muestra del rollo

Los participantes adicionales corresponden a `wasteRollReferenceController.js`,
`wasteRollReferenceService.js` y `wasteRollReferenceValidations.js`.

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Route@{ "type": "boundary" } as wasteApiRoute.js
    participant Auth@{ "type": "control" } as authMiddleware.js
    participant ReferenceRules@{ "type": "control" } as wasteRollReferenceValidations.js
    participant Validator@{ "type": "control" } as validatorMiddleware.js
    participant ReferenceController@{ "type": "control" } as wasteRollReferenceController.js
    participant WasteDto@{ "type": "control" } as DTO funcional<br/>wasteDTO.js
    participant ReferenceService@{ "type": "control" } as wasteRollReferenceService.js
    participant Repository@{ "type": "control" } as baseRepository.js
    participant DB@{ "type": "database" } as Prisma / PostgreSQL
    Client->>Route: PATCH /api/warehouse/wastes/roll-reference
    Route->>Auth: verifyApiTokenRequired + authorizeUserApi(MATERIALS_WRITE)
    Route->>ReferenceRules: wasteRollReferenceValidation[]
    Route->>Validator: validate(req, res, next)
    break Entrada inválida
        Validator-->>Client: HTTP 400 { errors }, sin escritura
    end
    Route->>ReferenceController: updateWasteRollReference(req, res)
    ReferenceController->>WasteDto: createWasteRollReferenceDto(req.body)
    WasteDto-->>ReferenceController: createWasteRollReferenceDto(): Object (referenceDto)
    ReferenceController->>ReferenceService: saveWasteRollReference({ referenceDto, userId })
    ReferenceService->>Repository: getDb()
    Repository-->>ReferenceService: getDb(): PrismaClient
    ReferenceService->>DB: db.$transaction(async tx => ...)
    ReferenceService->>ReferenceService: findOffer({ tx, ...referenceDto })
    ReferenceService->>DB: tx.supplierMaterial.findUnique({ where, include })
    ReferenceService->>DB: tx.supplierMaterial.update({ where, data, include })
    DB-->>ReferenceService: update(): Promise[SupplierMaterial]
    ReferenceService-->>ReferenceController: saveWasteRollReference(): Promise[Object] (referencia)
    ReferenceController-->>Client: HTTP 200 { reference, code }
    Note over ReferenceService,DB: No altera existencias ni copias históricas de Waste
```
