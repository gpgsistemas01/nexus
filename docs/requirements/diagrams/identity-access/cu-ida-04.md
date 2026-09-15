# `CU-IDA-04` — Generar reporte de personas

```mermaid
flowchart LR
    request["Actor selecciona exportar desde CU-IDA-01: personas"] --> modal["Nexus abre el modal Exportar reporte"]
    modal --> validate["Nexus valida permiso, datos y relaciones"]
    validate --> result["Nexus responde: Archivo Excel con filtros, columnas y cálculos propios del reporte."]
```
