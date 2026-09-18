# `CU-CAT-08` — Generar reporte de movimientos de materiales

```mermaid
flowchart LR
    request["Actor selecciona exportar desde CU-CAT-07: movimientos de materiales"] --> modal["Nexus abre el modal Exportar reporte"]
    modal --> validate["Nexus valida permiso, datos y relaciones"]
    validate --> result["Nexus responde: Archivo Excel con filtros, columnas y cálculos propios del reporte."]
```
