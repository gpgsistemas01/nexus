# `CU-CAT-13` — Generar reporte de proveedores

```mermaid
flowchart LR
    request["Actor selecciona exportar desde CU-CAT-09: proveedores"] --> modal["Nexus abre el modal Exportar reporte"]
    modal --> validate["Nexus valida permiso, datos y relaciones"]
    validate --> result["Nexus responde: Archivo Excel con filtros, columnas y cálculos propios del reporte."]
```
