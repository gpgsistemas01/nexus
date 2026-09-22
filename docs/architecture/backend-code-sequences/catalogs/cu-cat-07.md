<a id="cu-cat-07"></a>
# `CU-CAT-07` — Editar cliente

**Patrones:** `BE-P01`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/sales/clientApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/sales/clientController.js
    participant ClientDto as <u>clientDto: Object</u><br/>src/dtos/clientDTO.js
    participant Domain as src/services/sales/clientService.js
    participant ErrorHandler as src/app.js

    Client->>Route: PUT /api/sales/clients/:id
    Route->>Controller: editClient(req, res)
    activate Controller
    Controller->>ClientDto: createClientDtoForEdit(req.body)
    ClientDto-->>Controller: clientDto normalizado
    Controller->>Domain: clientService.updateClient({ id: req.params.id, clientDto }) actualiza Client
    activate Domain
    alt Servicio resuelto
        Domain-->>Controller: clientService.updateClient() devuelve client actualizado y persistido
        Controller-->>Client: HTTP 2xx { code, data }
    else AppError propagado
        Domain-->>Controller: throw AppError { code, message, meta, statusCode }
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
    end
    deactivate Domain
    deactivate Controller
```

