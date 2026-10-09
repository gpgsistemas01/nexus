<a id="cu-cat-03"></a>
# `CU-CAT-03` — Editar proveedor

**Patrones:** `BE-P01`.

## Participantes y trazabilidad

Los nombres breves del diagrama corresponden a los archivos vinculados siguientes.
La ruta completa se conserva en cada enlace, fuera de la cabecera visual. Un participante
puede agrupar colaboradores del mismo rol; esa agrupación no implica una clase ni un
proceso independiente. Los retornos representan el resultado o error propagado.

| Alias | Rol visual | Archivos de implementación |
| --- | --- | --- |
| `Route` | boundary | [`supplierApiRoute.js`](../../../../../../src/routes/api/warehouse/supplierApiRoute.js) |
| `Auth` | control | [`authMiddleware.js`](../../../../../../src/middleware/authMiddleware.js) |
| `Validator` | control | [`supplierValidations.js`](../../../../../../src/validators/forms/supplierValidations.js)<br/>[`validatorMiddleware.js`](../../../../../../src/middleware/validatorMiddleware.js) |
| `Controller` | control | [`supplierController.js`](../../../../../../src/controllers/api/warehouse/supplierController.js) |
| `SupplierDto` | control | [`supplierDTO.js`](../../../../../../src/dtos/supplierDTO.js) |
| `Domain` | control | [`supplierService.js`](../../../../../../src/services/warehouse/supplierService.js) |
| `ErrorHandler` | control | [`app.js`](../../../../../../src/app.js) |

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Route@{ "type": "boundary" } as Router API
    participant Auth@{ "type": "control" } as Acceso
    participant Validator@{ "type": "control" } as Validación HTTP
    participant Controller@{ "type": "control" } as Controller
    participant SupplierDto@{ "type": "control" } as DTO funcional
    participant Domain@{ "type": "control" } as Servicio de dominio
    participant ErrorHandler@{ "type": "control" } as Errores Express

    Client->>Route: PUT /api/warehouse/suppliers/:id
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    Route->>Validator: supplierValidation[] y validate(req, res, next)
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

