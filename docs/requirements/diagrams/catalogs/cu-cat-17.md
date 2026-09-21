# `CU-CAT-17` — Editar presentación

```mermaid
flowchart LR
    accTitle: CU-CAT-17 — Editar presentación
    request["Administrador selecciona Editar registro<br/>y confirma Actualizar"] --> authorize["Nexus valida catalogs:manage y presentations"]
    authorize --> persist["Validar campos y actualizar presentación"]
    persist --> result["Confirmar y refrescar Presentaciones"]
```
