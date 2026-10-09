<a id="cu-cat-16"></a>
# `CU-CAT-16` — Crear presentación

**Patrones:** `BE-P02`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `Route` | boundary | [`catalogApiRoute.js`](../../../../../../src/routes/api/admin/catalogApiRoute.js) |
| `Auth` | control | [`authMiddleware.js`](../../../../../../src/middleware/authMiddleware.js) |
| `Validator` | control | [`validatorMiddleware.js`](../../../../../../src/middleware/validatorMiddleware.js) |
| `Controller` | control | [`catalogController.js`](../../../../../../src/controllers/api/admin/catalogController.js) |
| `Domain` | control | [`catalogService.js`](../../../../../../src/services/admin/catalogService.js) |
| `ErrorHandler` | control | [`app.js`](../../../../../../src/app.js) |
| `ValidationRules` | control | [`catalogValidations.js`](../../../../../../src/validators/forms/catalogValidations.js) |

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
    participant Domain@{ "type": "control" } as Servicio de dominio
    participant ErrorHandler@{ "type": "control" } as Errores Express

    Client->>Route: POST /api/admin/catalogs/presentations
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    Route->>Auth: authorizeUserApi(PERMISSIONS.CATALOGS_MANAGE)(req, res, next)
    break Identidad no vigente o permiso denegado
        Auth-->>Client: HTTP 401 INVALID_AUTH o HTTP 403 FORBIDDEN
    end
    Route->>ValidationRules: catalogEntryValidation[] — cadena ejecutada por Express
    Route->>Validator: validate(req, res, next)
    break Validación rechazada
        Validator-->>Client: HTTP 400 { errors }
    end
    Route->>Controller: registerCatalogEntry(req, res)
    activate Controller
    Controller->>Domain: createCatalogEntry(req.params.catalog, req.body) normaliza y crea únicamente los campos permitidos
    activate Domain
    alt Servicio resuelto
        Domain-->>Controller: createCatalogEntry(): Promise[Object]
        Controller-->>Client: HTTP 201 { data, code }
    else AppError propagado
        Domain-->>Controller: throw AppError { code, message, meta, statusCode }
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
    end
    deactivate Domain
    deactivate Controller
```

