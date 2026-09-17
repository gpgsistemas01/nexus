<a id="cu-cat-31"></a>
# `CU-CAT-31` — Crear rol

**Patrones:** `BE-P02`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/admin/catalogApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/admin/catalogController.js
    participant Domain as src/services/admin/catalogService.js
    Note over Controller,Domain: Variables de frontera: req.params.catalog/req.body

    Client->>Route: POST /api/admin/catalogs/roles
    Route->>Route: ejecutar en orden el middleware configurado para la ruta
    Route->>Controller: registerCatalogEntry(req, res)
    activate Controller
    Controller->>Domain: createCatalogEntry(req.params.catalog/req.body) normaliza y crea únicamente los campos permitidos
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

<a id="cu-cat-32"></a>
