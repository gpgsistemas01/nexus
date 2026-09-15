# `CU-SAL-14` — Generar reporte de salidas de merma

```mermaid
flowchart LR
    request["Actor selecciona exportar desde CU-SAL-08: salidas de merma"] --> modal["Nexus abre el modal Exportar reporte"]
    modal --> validate["Nexus valida permiso, datos y relaciones"]
    validate --> result["Nexus responde: Archivo Excel con filtros, columnas y cálculos propios del reporte."]
```
