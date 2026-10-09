<a id="cu-alm-19"></a>
# `CU-ALM-19` — Editar consumible

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
| `ErrorHandler` | control | [`app.js`](../../../../../../src/app.js) |
| `ValidationRules` | control | [`materialValidations.js`](../../../../../../src/validators/forms/materialValidations.js) |

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
    participant MaterialDto@{ "type": "control" } as DTO funcional
    participant Domain@{ "type": "control" } as Servicio de dominio
    participant MaterialService@{ "type": "control" } as Servicio de material
    participant ErrorHandler@{ "type": "control" } as Errores Express

    Client->>Route: PATCH /api/warehouse/consumables/:id
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    Route->>ValidationRules: materialEditValidation[] — cadena ejecutada por Express
    Route->>Validator: validate(req, res, next)
    break Validación rechazada
        Validator-->>Client: HTTP 400 { errors }
    end
    Route->>Auth: authorizeUserApi(PERMISSIONS.MATERIALS_WRITE)(req, res, next)
    break Identidad no vigente o permiso denegado
        Auth-->>Client: HTTP 401 INVALID_AUTH o HTTP 403 FORBIDDEN
    end
    Route->>Controller: editConsumable(req, res)
    activate Controller
    Controller->>MaterialDto: createMaterialDtoForEdit(req.body)
    activate MaterialDto
    MaterialDto-->>Controller: createMaterialDtoForEdit(): Object (materialDto)
    deactivate MaterialDto
    Controller->>Domain: updateConsumable(materialDto, req.params.id) sincroniza datos y relación
    activate Domain
    Domain->>MaterialService: updateMaterial(materialDto, id, { type: CONSUMABLE })
    alt Servicio resuelto
        MaterialService-->>Domain: updateMaterial(): Promise[SupplierMaterial]
        Domain-->>Controller: updateConsumable(): Promise[SupplierMaterial]
        Controller-->>Client: HTTP 200 { material: supplierMaterial, code }
    else AppError propagado
        Domain-->>Controller: throw AppError { code, message, meta, statusCode }
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
    end
    deactivate Domain
    deactivate Controller
```
