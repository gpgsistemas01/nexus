<a id="cu-cat-06"></a>
# `CU-CAT-06` — Crear cliente

**Patrones:** `BE-P01`.

El listado de Sistemas y el selector de una salida reutilizan el mismo `POST`. El permiso
`clients:create` autoriza el alta contextual de Almacén; `clients:page-view` continúa siendo un
permiso distinto exigido sólo por la ruta web independiente `/clientes`.

## Participantes y trazabilidad

Los nombres breves del diagrama corresponden a los archivos vinculados siguientes.
La ruta completa se conserva en cada enlace, fuera de la cabecera visual. Un participante
puede agrupar colaboradores del mismo rol; esa agrupación no implica una clase ni un
proceso independiente. Los retornos representan el resultado o error propagado.

| Alias | Rol visual | Archivos de implementación |
| --- | --- | --- |
| `Route` | boundary | [`clientApiRoute.js`](../../../../../../src/routes/api/sales/clientApiRoute.js) |
| `Auth` | control | [`authMiddleware.js`](../../../../../../src/middleware/authMiddleware.js) |
| `Validator` | control | [`clientValidations.js`](../../../../../../src/validators/forms/clientValidations.js)<br/>[`validatorMiddleware.js`](../../../../../../src/middleware/validatorMiddleware.js) |
| `Controller` | control | [`clientController.js`](../../../../../../src/controllers/api/sales/clientController.js) |
| `ClientDto` | control | [`clientDTO.js`](../../../../../../src/dtos/clientDTO.js) |
| `Domain` | control | [`clientService.js`](../../../../../../src/services/sales/clientService.js) |
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
    participant ClientDto@{ "type": "control" } as DTO funcional
    participant Domain@{ "type": "control" } as Servicio de dominio
    participant ErrorHandler@{ "type": "control" } as Errores Express

    Client->>Route: POST /api/sales/clients
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    break Token ausente o inválido
        Auth-->>Client: HTTP 401 INVALID_AUTH
    end
    Route->>Validator: clientValidation[] y validate(req, res, next)
    break Validación rechazada
        Validator-->>Client: HTTP 400 { errors }
    end
    Route->>Auth: authorizeUserApi(PERMISSIONS.CLIENTS_CREATE)(req, res, next)
    break Identidad no vigente o permiso denegado
        Auth-->>Client: HTTP 401 INVALID_AUTH o HTTP 403 FORBIDDEN
    end
    Route->>Controller: registerClient(req, res)
    activate Controller
    Controller->>ClientDto: createClientDtoForRegister(req.body)
    activate ClientDto
    ClientDto-->>Controller: createClientDtoForRegister(): Object (clientDto)
    deactivate ClientDto
    Controller->>Domain: clientService.createClient({ clientDto }) persiste Client
    activate Domain
    alt Servicio resuelto
        Domain-->>Controller: clientService.createClient(): Promise[Client]
        Controller-->>Client: HTTP 200 { client, code }
    else AppError propagado
        Domain-->>Controller: throw AppError { code, message, meta, statusCode }
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
    end
    deactivate Domain
    deactivate Controller
```
