# `CU-CAT-04` — Generar reporte de proveedores

```mermaid
flowchart LR
    accTitle: CU-CAT-04 — Generar reporte de proveedores
    request["Actor selecciona exportar desde CU-CAT-01: proveedores"] --> modal["Nexus abre el modal Exportar reporte"]
    modal --> validate["Nexus valida permiso, datos y relaciones"]
    validate --> result["Nexus responde: Archivo Excel con filtros, columnas y cálculos propios del reporte."]
```
