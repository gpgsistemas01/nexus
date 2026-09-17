# `CU-SAL-07` — Generar reporte de salidas de material

```mermaid
flowchart LR
    request["Actor selecciona exportar desde CU-SAL-01: salidas de material"] --> modal["Nexus abre el modal Exportar reporte"]
    modal --> validate["Nexus valida permiso, datos y relaciones"]
    validate --> result["Nexus responde: Archivo Excel con filtros, columnas y cálculos propios del reporte."]
```
