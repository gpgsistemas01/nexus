# `CU-CAT-20` — Registrar merma

```mermaid
flowchart TD
    request["Actor solicita registrar merma"] --> validate["Nexus valida permiso, datos y relaciones"]
    validate --> active{"¿Proveedor y material de plantilla activos?"}
    active -->|No| reject["Rechazar el alta<br/>sin crear merma ni stock"]
    active -->|Sí| result["Crear merma desde la plantilla<br/>y registrar stock inicial"]
```
