<a id="cu-alm-04"></a>
# `CU-ALM-04` — Retirar material

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/warehouse/materialApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/materialController.js
    participant Domain as src/services/warehouse/materials/materialService.js
    participant ErrorHandler as src/app.js

    Client->>Route: DELETE /api/warehouse/materials/:id
    Route->>Controller: removeMaterial(req, res)
    activate Controller
    Controller->>Domain: materialService.deleteMaterial(req.params.id) protege referencias antes de eliminar relación
    activate Domain
    alt Servicio resuelto
        Domain-->>Controller: materialService.deleteMaterial() devuelve material eliminado o relación con proveedor desactivada según sus referencias
        Controller-->>Client: HTTP 2xx { code, data }
    else AppError propagado
        Domain-->>Controller: throw AppError { code, message, meta, statusCode }
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
    end
    deactivate Domain
    deactivate Controller
```

