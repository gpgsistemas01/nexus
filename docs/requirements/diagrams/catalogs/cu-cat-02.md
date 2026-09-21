# `CU-CAT-02` — Crear proveedor

```mermaid
flowchart LR
    accTitle: CU-CAT-02 — Crear proveedor
    request["Actor solicita crear proveedor"] --> validate["Nexus valida permiso, datos y relaciones"]
    validate --> result["Nexus responde: Alta con código e identidad válidos."]
```
