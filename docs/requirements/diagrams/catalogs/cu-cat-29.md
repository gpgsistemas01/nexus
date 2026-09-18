# `CU-CAT-29` — Crear rol

```mermaid
flowchart LR
    request["Administrador selecciona Nuevo rol<br/>y confirma Guardar"] --> authorize["Nexus valida catalogs:manage y roles"]
    authorize --> persist["Validar campos y crear rol"]
    persist --> result["Confirmar y refrescar Roles"]
```
