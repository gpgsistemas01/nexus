# `CU-SAL-02` — Crear salida de material

```mermaid
flowchart TD
    accTitle: CU-SAL-02 — Crear salida de material
    request["Actor solicita crear salida de material"] --> validate["Nexus valida permiso, datos y relaciones"]
    validate --> active{"¿Materiales y proveedores activos?"}
    active -->|No| reject["Rechazar salida<br/>sin crear detalles ni descontar stock"]
    active -->|Sí| result["Crear salida pendiente<br/>sin descontar existencias"]
```
