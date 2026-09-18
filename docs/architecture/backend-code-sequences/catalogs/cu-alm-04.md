<a id="cu-alm-04"></a>
# `CU-ALM-04` — Retirar material

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/warehouse/materialApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/materialController.js
    participant Domain as src/services/warehouse/materials/materialService.js
    Note over Controller,Domain: Variables de frontera: req.params.id

    Client->>Route: DELETE /api/warehouse/materials/:id
    Route->>Route: ejecutar en orden el middleware configurado para la ruta
    Route->>Controller: removeMaterial(req, res)
    activate Controller
    Controller->>Domain: materialService.deleteMaterial(req.params.id) protege referencias antes de eliminar relación
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

