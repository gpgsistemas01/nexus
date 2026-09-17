# `CU-CAT-47` — Crear estado de cumplimiento

```mermaid
flowchart LR
    request["Administrador selecciona Nuevo estado de cumplimiento<br/>y confirma Guardar"] --> authorize["Nexus valida catalogs:manage y fulfillment-statuses"]
    authorize --> persist["Validar campos y crear estado de cumplimiento"]
    persist --> result["Confirmar y refrescar Estados de cumplimiento"]
```
