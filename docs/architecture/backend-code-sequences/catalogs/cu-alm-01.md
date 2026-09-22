<a id="cu-alm-01"></a>
# `CU-ALM-01` — Consultar materiales

**Patrones:** `BE-P01`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/warehouse/materialApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/materialController.js
    participant Domain as src/services/warehouse/materials/materialService.js
    participant ErrorHandler as src/app.js

    Client->>Route: GET /api/warehouse/materials
    Route->>Controller: getAllMaterials(req, res)
    activate Controller
    Controller->>Domain: materialService.findAllMaterials({ query: req.query }) consulta material, proveedor y existencia
    activate Domain
    alt Servicio resuelto
        Domain-->>Controller: materialService.findAllMaterials() resuelve datos de dominio
        Controller-->>Client: HTTP 2xx { code, data }
    else AppError propagado
        Domain-->>Controller: throw AppError { code, message, meta, statusCode }
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
    end
    deactivate Domain
    deactivate Controller
```

