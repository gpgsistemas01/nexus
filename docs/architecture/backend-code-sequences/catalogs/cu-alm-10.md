<a id="cu-alm-10"></a>
# `CU-ALM-10` — Registrar merma

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`, `BE-P05`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/warehouse/wasteApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/wasteController.js
    participant WasteDto as «object»<br/>wasteDto<br/>src/dtos/wasteDTO.js
    participant Domain as src/services/warehouse/wastes/wasteMaterialService.js<br/>src/services/warehouse/wastes/wasteService.js
    Note over Controller,Domain: Variables de frontera: req.body/DTO, req.query/params, tx

    Client->>Route: GET /api/warehouse/wastes/material-templates y POST /api/warehouse/wastes
    Route->>Route: ejecutar en orden el middleware configurado para la ruta
    Route->>Controller: getWasteMaterialTemplates(req, res)/registerWaste
    activate Controller
    Controller->>WasteDto: createWasteDtoForRegister(req.body) → sanitizeEmptyStrings(...)
    WasteDto-->>Controller: wasteDto normalizado
    Controller->>Domain: findWasteMaterialTemplates({ wasteDto }) alimenta la selección y createWasteWithInitialStockAdjustment crea merma, ajuste y movimiento inicial
    activate Domain
    Domain->>Domain: buscar misma combinación de proveedor, nombre, base y altura
    alt La merma ya existe
        Domain-->>Controller: WASTE_ALREADY_EXISTS sin incrementar stock
    else La merma no existe
        Domain->>Domain: crear merma, ajuste y movimiento de existencia inicial
    end
    Domain-->>Controller: resultado del servicio o error de dominio tipado
    deactivate Domain
    alt El servicio devuelve el resultado
        Controller-->>Client: status HTTP y cuerpo concretos del controller
    else El servicio propaga un error de dominio
        Controller-->>Client: error entregado al middleware final para su respuesta HTTP
    end
    deactivate Controller
```

