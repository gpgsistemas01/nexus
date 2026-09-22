<a id="cu-alm-03"></a>
# `CU-ALM-03` — Editar material

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/warehouse/materialApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/materialController.js
    participant MaterialDto as «object»<br/>materialDto<br/>src/dtos/materialDTO.js
    participant Domain as src/services/warehouse/materials/materialService.js
    participant ErrorHandler as src/app.js

    Client->>Route: PATCH /api/warehouse/materials/:id
    Route->>Controller: editMaterial(req, res)
    activate Controller
    Controller->>MaterialDto: createMaterialDtoForEdit(req.body)
    MaterialDto-->>Controller: materialDto normalizado
    Controller->>Domain: materialService.updateMaterial({ id: req.params.id, materialDto }) sincroniza datos y relación
    activate Domain
    alt Servicio resuelto
        Domain-->>Controller: materialService.updateMaterial() resuelve datos de dominio
        Controller-->>Client: HTTP 2xx { code, data }
    else AppError propagado
        Domain-->>Controller: throw AppError { code, message, meta, statusCode }
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
    end
    deactivate Domain
    deactivate Controller
```

