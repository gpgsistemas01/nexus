<a id="cu-cat-14"></a>
# `CU-CAT-14` — Editar rol

**Patrones:** `BE-P02`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/admin/catalogApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/admin/catalogController.js
    participant Domain as src/services/admin/catalogService.js
    participant ErrorHandler as src/app.js

    Client->>Route: PUT /api/admin/catalogs/roles/:id
    Route->>Controller: editCatalogEntry(req, res)
    activate Controller
    Controller->>Domain: updateCatalogEntry(req.params.catalog/req.params.id/req.body) normaliza y actualiza únicamente los campos permitidos
    activate Domain
    alt Servicio resuelto
        Domain-->>Controller: updateCatalogEntry() resuelve datos de dominio
        Controller-->>Client: HTTP 2xx { code, data }
    else AppError propagado
        Domain-->>Controller: throw AppError { code, message, meta, statusCode }
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
    end
    deactivate Domain
    deactivate Controller
```

