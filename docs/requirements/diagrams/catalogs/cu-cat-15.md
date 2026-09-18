# `CU-CAT-15` — Consultar presentación

```mermaid
flowchart LR
    request["Administrador solicita consultar Presentaciones"] --> authorize["Nexus valida catalogs:manage y presentations"]
    authorize --> result["Mostrar exclusivamente la tabla de Presentaciones"]
```
