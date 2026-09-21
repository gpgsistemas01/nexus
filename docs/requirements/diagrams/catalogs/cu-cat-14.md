# `CU-CAT-14` — Editar rol

```mermaid
flowchart LR
    accTitle: CU-CAT-14 — Editar rol
    request["Administrador selecciona Editar registro<br/>y confirma Actualizar"] --> authorize["Nexus valida catalogs:manage y roles"]
    authorize --> persist["Validar campos y actualizar rol"]
    persist --> result["Confirmar y refrescar Roles"]
```
