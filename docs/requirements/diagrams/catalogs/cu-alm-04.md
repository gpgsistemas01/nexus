# `CU-ALM-04` — Retirar material

```mermaid
flowchart LR
    accTitle: CU-ALM-04 — Retirar material
    request["Actor solicita retirar material"] --> validate["Nexus valida permiso, datos y relaciones"]
    validate --> result["Nexus responde: Retiro condicionado por la historia operativa."]
```
