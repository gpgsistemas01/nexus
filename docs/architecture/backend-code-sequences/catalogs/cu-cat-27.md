<a id="cu-cat-27"></a>
# `CU-CAT-27` — Consultar área

**Patrones:** `BE-P02`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/admin/catalogApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/admin/catalogController.js
    participant Domain as src/services/admin/catalogService.js
    Note over Controller,Domain: Variables de frontera: req.params.catalog

    Client->>Route: GET /api/admin/catalogs/departments
    Route->>Route: ejecutar en orden el middleware configurado para la ruta
    Route->>Controller: getAllCatalogEntries(req, res)
    activate Controller
    Controller->>Domain: findAllCatalogEntries(req.params.catalog) consulta el modelo permitido por la lista blanca
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

<a id="cu-cat-28"></a>
