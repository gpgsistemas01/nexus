<a id="cu-alm-02"></a>
# `CU-ALM-02` — Crear material

**Patrones:** `BE-P01`, `BE-P03`, `BE-P04`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/api/warehouse/materialApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/warehouse/materialController.js
    participant MaterialDto as «object»<br/>materialDto<br/>src/dtos/materialDTO.js
    participant Domain as src/services/warehouse/materials/materialService.js
    Note over Controller,Domain: Variables de frontera: req.body/DTO, tx

    Client->>Route: POST /api/warehouse/materials
    Route->>Route: ejecutar en orden el middleware configurado para la ruta
    Route->>Controller: registerMaterial(req, res)
    activate Controller
    Controller->>MaterialDto: createMaterialDtoForRegister(req.body) → sanitizeEmptyStrings(...)
    MaterialDto-->>Controller: materialDto normalizado
    Controller->>Domain: materialService.createMaterial({ materialDto }) crea identidad y relación de proveedor
    activate Domain
    Domain->>Domain: buscar identidad por nombre, presentación, unidad y dimensiones
    alt Identidad y proveedor ya relacionados
        Domain-->>Controller: MATERIAL_ALREADY_EXISTS sin modificar stock
    else Identidad existente con otro proveedor o identidad nueva
        Domain->>Domain: reutilizar o crear identidad y registrar relación y stock inicial
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

<a id="cu-alm-03"></a>
