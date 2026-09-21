# `CU-CAT-06` — Crear cliente

```mermaid
flowchart LR
    accTitle: CU-CAT-06 — Crear cliente
    request["Actor solicita crear cliente"] --> validate["Nexus valida permiso, datos y relaciones"]
    validate --> result["Nexus responde: Alta con asesor opcional válido."]
```
