# `CU-IDA-02` — Crear persona

```mermaid
flowchart LR
    request["Actor solicita crear persona"] --> validate["Nexus valida permiso, datos y relaciones"]
    validate --> result["Nexus responde: Alta de persona sin crear cuenta."]
```
