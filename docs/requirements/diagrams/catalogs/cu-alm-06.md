# `CU-ALM-06` — Generar reporte de inventario de materiales

```mermaid
flowchart LR
    request["Actor selecciona exportar desde CU-ALM-01: materiales"] --> modal["Nexus abre el modal Exportar reporte"]
    modal --> validate["Nexus valida permiso, datos y relaciones"]
    validate --> result["Nexus responde: Archivo Excel con filtros, columnas y cálculos propios del reporte."]
```
