# `CU-CAT-17` — Generar reporte de clientes

```mermaid
flowchart LR
    request["Actor selecciona exportar desde CU-CAT-14: clientes"] --> modal["Nexus abre el modal Exportar reporte"]
    modal --> validate["Nexus valida permiso, datos y relaciones"]
    validate --> result["Nexus responde: Archivo Excel con filtros, columnas y cálculos propios del reporte."]
```
