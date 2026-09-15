# `CU-CAT-30` — Consultar estados de cumplimiento

```mermaid
flowchart LR
    request["Actor solicita consultar estados de cumplimiento"] --> validate["Nexus valida permiso, datos y relaciones"]
    validate --> result["Nexus responde: Catálogo auxiliar de sólo lectura."]
```
