<a id="cu-alm-10"></a>
# `CU-ALM-10` — Registrar merma

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`, `BE-P05`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.

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
| `Templates` | control | [`wasteMaterialService.js`](../../../../../../src/services/warehouse/wastes/wasteMaterialService.js) |

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
    participant WasteDto@{ "type": "control" } as DTO funcional
    participant Formatter@{ "type": "control" } as Formato
    participant Domain@{ "type": "control" } as Servicio de dominio
    participant Templates@{ "type": "control" } as Plantillas de merma
    participant Socket@{ "type": "control" } as Eventos Socket.IO
    participant ErrorHandler@{ "type": "control" } as Errores Express

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
    Controller->>Templates: findWasteMaterialTemplates({ search, skip, take, supplierId })
    Templates-->>Controller: findWasteMaterialTemplates(): Promise[Object[]]
    Controller-->>Client: HTTP 200 { code, data: templates }

    Client->>Route: POST /api/warehouse/wastes
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    Route->>ValidationRules: wasteValidation[] — cadena ejecutada por Express
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
    Domain->>Domain: findWasteByIdentity({ tx, supplierId, name, base, height })
    alt La merma ya existe
        Domain-->>Controller: WASTE_ALREADY_EXISTS sin incrementar stock
    else La merma no existe
        Domain->>Domain: createWasteWithInitialStockAdjustment({ wasteDto, userId }) crea merma, ajuste y movimiento inicial
    end
    alt Registro confirmado
        Domain-->>Controller: createWasteWithInitialStockAdjustment(): Promise[Waste]
        Controller->>Socket: emitInventoryUpdated({ context: 'waste', source: 'waste-created' })
        Controller-->>Client: HTTP 200 { data, recordsTotal, recordsFiltered }
    else AppError propagado
        Domain-->>Controller: throw AppError { code, message, meta, statusCode }
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
    end
    deactivate Domain
    deactivate Controller
```
