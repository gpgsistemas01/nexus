# Reportes: alcance, archivo y error recuperable

## Escenario y contratos

**Casos relacionados:** CU de reporte de cada familia; RF-VUE-013.

**Fuente técnica:** useReportScope.ts, useFileExport.ts, servicio del recurso y requestExcel.ts.

## Secuencia aplicada

**Identificador:** `DIA-VUE-SEQ-018`.

**Lectura visual:** [líneas de vida, números y mensajes](../../diagram-reading.md#secuencias).

```mermaid
sequenceDiagram
    autonumber
    actor Usuario
    participant Scope@{ "type": "control" } as useReportScope
    participant Export@{ "type": "control" } as useFileExport
    participant Service@{ "type": "boundary" } as servicio export del recurso
    participant Excel@{ "type": "boundary" } as requestExcel
    participant API@{ "type": "boundary" } as API
    Usuario->>Scope: abrir y seleccionar alcance admitido
    Scope->>Scope: comprobar permiso y validar mes si corresponde
    Usuario->>Scope: Exportar
    Scope->>Export: exportReport con copia del alcance
    Export->>Service: query aplicada, scope y signal
    Service->>Service: construir filtros o mes y omitir paginación
    Service->>Excel: request del endpoint fijo
    Excel->>API: GET con responseType blob
    API-->>Excel: archivo o error
    alt archivo admitido
        Excel-->>Export: blob validado
        Export->>Export: crear URL, iniciar descarga y programar liberación
        Export-->>Scope: sin exportError
        Scope-->>Usuario: cerrar diálogo de alcance
    else error o respuesta HTML
        Excel-->>Export: ApiError
        Export-->>Scope: exportError
        Scope-->>Usuario: conservar diálogo y reintento explícito
    end
```

## Reglas y recuperación

Los módulos con descarga directa usan useFileExport sin diálogo de alcance. Personas bloquea el filtro de rol no admitido por su API de exportación. El contenido real de XLSX requiere sistema, no un blob simulado.

## Evidencia

reportScopeTest.ts, inventoryReportTest.ts, records.spec.ts y application.spec.ts. La [matriz por caso](../../../../testing/04-use-case-coverage.md) identifica alcance y límites, y el [registro CP](../../../../testing/03-test-cases.md) concreta datos y oráculos críticos.
