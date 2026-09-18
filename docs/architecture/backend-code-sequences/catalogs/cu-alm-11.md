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
    Note over Controller,Domain: Variables de frontera: req.params.id, req.body/DTO

    Client->>Route: PATCH /api/warehouse/wastes/:id
    Route->>Route: ejecutar en orden el middleware configurado para la ruta
    Route->>Controller: editWaste(req, res)
    activate Controller
    Controller->>WasteDto: createWasteDtoForEdit(req.body) → sanitizeEmptyStrings(...)
    WasteDto-->>Controller: wasteDto normalizado
    Controller->>Domain: wasteService.updateWaste({ id: req.params.id, wasteDto }) actualiza datos sin tratar stock como edición
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

