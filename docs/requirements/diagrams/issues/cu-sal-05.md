# `CU-SAL-05` — Surtir material

```mermaid
flowchart TD
    request["Actor solicita surtir material"] --> validate["Nexus valida permiso, datos y relaciones"]
    validate --> committed{"¿El detalle ya pertenece a la salida?"}
    committed -->|No| reject["Rechazar uso nuevo"]
    committed -->|Sí| stock{"¿Hay existencia suficiente?"}
    stock -->|No| conflict["Rechazar sin cambios"]
    stock -->|Sí aunque el catálogo esté inactivo| result["Surtir pendiente y registrar movimiento"]
```
