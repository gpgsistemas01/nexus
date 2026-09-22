<a id="cu-alm-11"></a>
# `CU-ALM-11` — Editar merma

**Patrones:** `BE-P01`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/warehouse/wasteApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/wasteController.js
    participant WasteDto as «object»<br/>wasteDto<br/>src/dtos/wasteDTO.js
    participant Domain as src/services/warehouse/wastes/wasteService.js
    participant ErrorHandler as src/app.js

    Client->>Route: PATCH /api/warehouse/wastes/:id
    Route->>Controller: editWaste(req, res)
    activate Controller
    Controller->>WasteDto: createWasteDtoForEdit(req.body)
    WasteDto-->>Controller: wasteDto normalizado
    Controller->>Domain: wasteService.updateWaste({ id: req.params.id, wasteDto }) actualiza datos sin tratar stock como edición
    activate Domain
    alt Servicio resuelto
        Domain-->>Controller: wasteService.updateWaste() resuelve datos de dominio
        Controller-->>Client: HTTP 2xx { code, data }
    else AppError propagado
        Domain-->>Controller: throw AppError { code, message, meta, statusCode }
        Controller->>ErrorHandler: next(error)
        ErrorHandler-->>Client: res.status(error.statusCode).json({ code, message, meta })
    end
    deactivate Domain
    deactivate Controller
```

