# `CU-IDA-10` — Consultar roles

```mermaid
flowchart LR
    request["Actor solicita consultar roles"] --> validate["Nexus valida permiso, datos y relaciones"]
    validate --> result["Nexus responde: Catálogo de acceso de sólo lectura."]
```
