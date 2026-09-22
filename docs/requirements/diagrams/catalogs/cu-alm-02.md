# `CU-ALM-02` — Crear material

```mermaid
flowchart TD
    accTitle: CU-ALM-02 — Crear material
    request["Actor solicita crear material"] --> validate["Nexus valida permiso, identidad y relaciones"]
    validate --> active{"¿Proveedor activo?"}
    active -->|No| reject["Rechazar el alta<br/>sin crear relación ni stock"]
    active -->|Sí| result["Crear o reutilizar identidad<br/>y registrar relación"]
```
