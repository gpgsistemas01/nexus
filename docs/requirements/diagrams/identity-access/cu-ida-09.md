# `CU-IDA-09` — Generar reporte de usuarios

```mermaid
flowchart LR
    request["Actor selecciona exportar desde CU-IDA-05: usuarios"] --> modal["Nexus abre el modal Exportar reporte"]
    modal --> validate["Nexus valida permiso, datos y relaciones"]
    validate --> result["Nexus responde: Archivo Excel con filtros, columnas y cálculos propios del reporte."]
```
