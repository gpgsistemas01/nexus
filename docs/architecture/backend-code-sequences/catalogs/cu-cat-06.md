<a id="cu-cat-06"></a>
# `CU-CAT-06` — Crear cliente

**Patrones:** `BE-P01`.

El listado de Sistemas y el selector de una salida reutilizan el mismo `POST`. El permiso
`clients:create` autoriza el alta contextual de Almacén; `clients:page-view` continúa siendo un
permiso distinto exigido sólo por la ruta web independiente `/clientes`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/sales/clientApiRoute.js
    participant Auth as src/middleware/authMiddleware.js
    participant Controller@{ "type": "control" } as src/controllers/api/sales/clientController.js
    participant ClientDto as <u>clientDto: Object</u><br/>src/dtos/clientDTO.js
    participant Domain as src/services/sales/clientService.js
    participant ErrorHandler as src/app.js

    Client->>Route: POST /api/sales/clients
    Route->>Auth: verifyApiTokenRequired(req, res, next)
    Auth->>Auth: authorizeUserApi(PERMISSIONS.CLIENTS_CREATE)(req, res, next)
    alt Token ausente o inválido
        Auth-->>Client: HTTP 401 { code, message }
    else PERMISSIONS.CLIENTS_CREATE denegado
        Auth-->>Client: HTTP 403 { code, message }
    else Pipeline aceptado
        Route->>Controller: registerClient(req, res)
        activate Controller
        Controller->>ClientDto: createClientDtoForRegister(req.body)
        ClientDto-->>Controller: clientDto normalizado
        Controller->>Domain: clientService.createClient({ clientDto }) persiste Client
        activate Domain
        alt Servicio resuelto
            Domain-->>Controller: clientService.createClient() devuelve client creado y persistido
            Controller-->>Client: HTTP 2xx { code, data }
        else AppError propagado
            Domain-->>Controller: throw AppError { code, message, meta, statusCode }
            Controller->>ErrorHandler: next(error)
            ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
        end
        deactivate Domain
        deactivate Controller
    end
```
