<a id="cu-cat-02"></a>
# `CU-CAT-02` — Crear proveedor

**Patrones:** `BE-P01`.

El origen visual no altera el contrato backend: tanto el listado de Sistemas como el selector de una
compra llaman al mismo `POST`. `suppliers:manage` autoriza el alta de Almacén, mientras
`suppliers:page-view` se comprueba únicamente al intentar abrir la vista web `/proveedores`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.

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
    participant Route@{ "type": "boundary" } as Router API
    participant Auth@{ "type": "control" } as Acceso
    participant ValidationRules@{ "type": "control" } as Reglas de entrada
    participant Validator@{ "type": "control" } as Validación HTTP
    participant Controller@{ "type": "control" } as Controller
    participant SupplierDto@{ "type": "control" } as DTO funcional
    participant Domain@{ "type": "control" } as Servicio de dominio
    participant ErrorHandler@{ "type": "control" } as Errores Express

    Client->>Route: POST /api/warehouse/suppliers
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    Route->>ValidationRules: supplierValidation[] — cadena ejecutada por Express
    Route->>Validator: validate(req, res, next)
    break Validación rechazada
        Validator-->>Client: HTTP 400 { errors }
    end
    Route->>Auth: authorizeUserApi(PERMISSIONS.SUPPLIERS_MANAGE)(req, res, next)
    break Identidad no vigente o permiso denegado
        Auth-->>Client: HTTP 401 INVALID_AUTH o HTTP 403 FORBIDDEN
    end
    Route->>Controller: registerSupplier(req, res)
    activate Controller
    Controller->>SupplierDto: createSupplierDtoForRegister(req.body)
    activate SupplierDto
    SupplierDto-->>Controller: createSupplierDtoForRegister(): Object (supplierDto)
    deactivate SupplierDto
    Controller->>Domain: supplierService.createSupplier({ supplierDto }) persiste el proveedor
    activate Domain
    alt Servicio resuelto
        Domain-->>Controller: supplierService.createSupplier(): Promise[Supplier]
        Controller-->>Client: HTTP 200 { supplier, code }
    else AppError propagado
        Domain-->>Controller: throw AppError { code, message, meta, statusCode }
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
    end
    deactivate Domain
    deactivate Controller
```
