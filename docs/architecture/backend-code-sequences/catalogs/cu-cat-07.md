<a id="cu-cat-07"></a>
# `CU-CAT-07` — Editar cliente

**Patrones:** `BE-P01`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/sales/clientApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/sales/clientController.js
    participant ClientDto as «object»<br/>clientDto<br/>src/dtos/clientDTO.js
    participant Domain as src/services/sales/clientService.js
    Note over Controller,Domain: Variables de frontera: req.params.id, req.body/DTO

    Client->>Route: PUT /api/sales/clients/:id
    Route->>Route: ejecutar en orden el middleware configurado para la ruta
    Route->>Controller: editClient(req, res)
    activate Controller
    Controller->>ClientDto: createClientDtoForEdit(req.body) → sanitizeEmptyStrings(...)
    ClientDto-->>Controller: clientDto normalizado
    Controller->>Domain: clientService.updateClient({ id: req.params.id, clientDto }) actualiza Client
    activate Domain
    Domain->>Domain: comprobar datos de frontera y reglas propias de la operación
    Domain-->>Controller: resultado del servicio o error de dominio tipado
    deactivate Domain
    alt El servicio devuelve el resultado
        Controller-->>Client: status HTTP y cuerpo concretos del controller
    else El servicio propaga un error de dominio
        Controller-->>Client: error entregado al middleware final para su respuesta HTTP
    end
    deactivate Controller
```

<a id="cu-alm-09"></a>
