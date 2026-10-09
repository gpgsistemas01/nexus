<a id="cu-cat-03"></a>
# `CU-CAT-03` — Editar proveedor

**Patrones:** `BE-P01`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.
La composición incluye también los archivos de configuración, construcción y reexport: cada
uno tiene un nodo propio, aunque no ejecute una delegación durante la petición.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `Route` | boundary | [`supplierApiRoute.js`](../../../../../../src/routes/api/warehouse/supplierApiRoute.js) |
| `Auth` | control | [`authMiddleware.js`](../../../../../../src/middleware/authMiddleware.js) |
| `Validator` | control | [`validatorMiddleware.js`](../../../../../../src/middleware/validatorMiddleware.js) |
| `Controller` | control | [`supplierController.js`](../../../../../../src/controllers/api/warehouse/supplierController.js) |
| `SupplierDto` | control | [`supplierDTO.js`](../../../../../../src/dtos/supplierDTO.js) |
| `Domain` | control | [`supplierService.js`](../../../../../../src/services/warehouse/supplierService.js) |
| `ErrorHandler` | control | [`app.js`](../../../../../../src/app.js) |
| `ValidationRules` | control | [`supplierValidations.js`](../../../../../../src/validators/forms/supplierValidations.js) |

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Route@{ "type": "boundary" } as supplierApiRoute.js
    participant Auth@{ "type": "control" } as authMiddleware.js
    participant ValidationRules@{ "type": "control" } as supplierValidations.js
    participant Validator@{ "type": "control" } as validatorMiddleware.js
    participant Controller@{ "type": "control" } as supplierController.js
    participant SupplierDto@{ "type": "control" } as DTO funcional<br/>supplierDTO.js
    participant Domain@{ "type": "control" } as supplierService.js
    participant ErrorHandler@{ "type": "control" } as app.js

    Client->>Route: PUT /api/warehouse/suppliers/:id
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    Route->>ValidationRules: supplierValidation[] — cadena ejecutada por Express
    Route->>Validator: validate(req, res, next)
    break Validación rechazada
        Validator-->>Client: HTTP 400 { errors }
    end
    Route->>Auth: authorizeUserApi(PERMISSIONS.SUPPLIERS_UPDATE)(req, res, next)
    break Identidad no vigente o permiso denegado
        Auth-->>Client: HTTP 401 INVALID_AUTH o HTTP 403 FORBIDDEN
    end
    Route->>Controller: editSupplier(req, res)
    activate Controller
    Controller->>SupplierDto: createSupplierDtoForEdit(req.body)
    activate SupplierDto
    SupplierDto-->>Controller: createSupplierDtoForEdit(): Object (supplierDto)
    deactivate SupplierDto
    Controller->>Domain: supplierService.updateSupplier({ id: req.params.id, supplierDto }) actualiza datos del proveedor
    activate Domain
    alt Servicio resuelto
        Domain-->>Controller: supplierService.updateSupplier(): Promise[Supplier]
        Controller-->>Client: HTTP 200 { supplier, code }
    else AppError propagado
        Domain-->>Controller: throw AppError { code, message, meta, statusCode }
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
    end
    deactivate Domain
    deactivate Controller
```

