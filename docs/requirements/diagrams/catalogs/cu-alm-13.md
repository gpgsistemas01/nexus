# `CU-ALM-13` — Generar reporte de mermas

```mermaid
flowchart LR
    accTitle: CU-ALM-13 — Generar reporte de mermas
    request["Actor selecciona exportar desde CU-ALM-09: mermas"] --> modal["Nexus abre el modal Exportar reporte"]
    modal --> validate["Nexus valida permiso, datos y relaciones"]
    validate --> result["Nexus responde: Archivo Excel con filtros, columnas y cálculos propios del reporte."]
```
