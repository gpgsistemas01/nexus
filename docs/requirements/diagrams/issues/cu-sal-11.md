# `CU-SAL-11` — Editar detalles de merma de una salida

```mermaid
flowchart LR
    accTitle: CU-SAL-11 — Editar detalles de merma de una salida
    request["Actor selecciona Editar registro<br/>y después Actualizar"] --> validate["Nexus valida permiso, datos y relaciones"]
    validate --> result["Nexus responde: Actualización de detalles todavía modificables."]
```
