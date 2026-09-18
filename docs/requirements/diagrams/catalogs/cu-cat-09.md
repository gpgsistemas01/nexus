# `CU-CAT-09` — Generar reporte de clientes

```mermaid
flowchart LR
    request["Actor selecciona exportar desde CU-CAT-06: clientes"] --> modal["Nexus abre el modal Exportar reporte"]
    modal --> validate["Nexus valida permiso, datos y relaciones"]
    validate --> result["Nexus responde: Archivo Excel con filtros, columnas y cálculos propios del reporte."]
```
