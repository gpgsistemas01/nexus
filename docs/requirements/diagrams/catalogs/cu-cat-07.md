# `CU-CAT-07` — Generar reporte de inventario de materiales

```mermaid
flowchart LR
    request["Actor selecciona exportar desde CU-CAT-06: inventario de materiales"] --> modal["Nexus abre el modal Exportar reporte"]
    modal --> validate["Nexus valida permiso, datos y relaciones"]
    validate --> result["Nexus responde: Archivo Excel con filtros, columnas y cálculos propios del reporte."]
```
