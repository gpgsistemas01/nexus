# `CU-CAT-08` — Generar reporte de clientes

```mermaid
flowchart LR
    accTitle: CU-CAT-08 — Generar reporte de clientes
    request["Actor selecciona exportar desde CU-CAT-05: clientes"] --> modal["Nexus abre el modal Exportar reporte"]
    modal --> validate["Nexus valida permiso, datos y relaciones"]
    validate --> result["Nexus responde: Archivo Excel con filtros, columnas y cálculos propios del reporte."]
```
