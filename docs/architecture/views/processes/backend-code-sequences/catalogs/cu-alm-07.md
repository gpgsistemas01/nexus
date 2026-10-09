<a id="cu-alm-07"></a>
# `CU-ALM-07` — Consultar movimientos de materiales

**Patrones:** `BE-P06`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `Route` | boundary | [`movementApiRoute.js`](../../../../../../src/routes/api/admin/movementApiRoute.js) |
| `Controller` | control | [`movementController.js`](../../../../../../src/controllers/api/admin/movementController.js) |
| `Domain` | control | [`movementQueryService.js`](../../../../../../src/services/inventory/movementQueryService.js) |
| `ErrorHandler` | control | [`app.js`](../../../../../../src/app.js) |
| `Auth` | control | [`authMiddleware.js`](../../../../../../src/middleware/authMiddleware.js) |

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Route@{ "type": "boundary" } as Router API
    participant Auth@{ "type": "control" } as Acceso
    participant Controller@{ "type": "control" } as Controller
    participant Domain@{ "type": "control" } as Servicio de dominio
    participant ErrorHandler@{ "type": "control" } as Errores Express

    Client->>Route: GET /api/admin/movements/materials

    Route->>Auth: verifyApiTokenRequired(req, res, next)
    activate Auth
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    deactivate Auth
    Route->>Auth: authorizeUserApi(PERMISSIONS.MOVEMENTS_READ)(req, res, next)
    activate Auth
    break Identidad no vigente o permiso denegado
        Auth-->>Client: HTTP 401 INVALID_AUTH o HTTP 403 FORBIDDEN
    end
    deactivate Auth
    Route->>Controller: getAllMaterialMovements(req, res)
    activate Controller
    Controller->>Domain: findAllMaterialMovements(getMovementListParams(req))
    activate Domain
    alt Servicio resuelto
        Domain-->>Controller: findAllMaterialMovements(): Promise[{ data: MaterialMovement[], recordsTotal: number, recordsFiltered: number }]
        Controller-->>Client: HTTP 2xx { code, data }
    else AppError propagado
        Domain-->>Controller: throw AppError { code, message, meta, statusCode }
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
    end
    deactivate Domain
    deactivate Controller
```

