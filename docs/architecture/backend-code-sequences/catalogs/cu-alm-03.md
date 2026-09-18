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
    Note over Controller,Domain: Variables de frontera: req.params.id, req.body/DTO, tx

    Client->>Route: PATCH /api/warehouse/materials/:id
    Route->>Route: ejecutar en orden el middleware configurado para la ruta
    Route->>Controller: editMaterial(req, res)
    activate Controller
    Controller->>MaterialDto: createMaterialDtoForEdit(req.body) → sanitizeEmptyStrings(...)
    MaterialDto-->>Controller: materialDto normalizado
    Controller->>Domain: materialService.updateMaterial({ id: req.params.id, materialDto }) sincroniza datos y relación
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

