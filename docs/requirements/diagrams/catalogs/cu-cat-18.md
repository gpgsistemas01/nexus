# `CU-CAT-18` — Consultar unidad de medida

```mermaid
flowchart LR
    accTitle: CU-CAT-18 — Consultar unidad de medida
    request["Administrador solicita consultar Unidades de medida"] --> authorize["Nexus valida catalogs:manage y unit-measures"]
    authorize --> result["Mostrar exclusivamente la tabla de Unidades de medida"]
    result --> create["Administrador elige crear y dispara CU-CAT-19"]
    result --> edit["Administrador elige editar y puede iniciar CU-CAT-20"]
```
