# Reportes: alcance, archivo y error recuperable

## Escenario y contratos

**Casos relacionados:** CU de reporte de cada familia; RF-VUE-013.

**Fuente técnica:** useReportScope.ts, useFileExport.ts, servicio del recurso y requestExcel.ts.

## Selección del alcance y resultado visible

**Identificador:** `DIA-VUE-SEQ-018`. La descarga compartida se detalla en la figura siguiente.

**Lectura visual:** [líneas de vida, números y mensajes](../../diagram-reading.md#secuencias).

```mermaid
sequenceDiagram
    autonumber
    actor Usuario
    participant Page@{ "type": "boundary" } as página del recurso
    participant Scope@{ "type": "control" } as useReportScope
    participant Export@{ "type": "control" } as useFileExport
    alt Compras, Salidas o Movimientos
        Usuario->>Scope: abrir y seleccionar alcance
        Usuario->>Scope: Descargar Excel
        Scope->>Scope: comprobar permiso y mes válido
        Scope->>Export: exportReport(copia del alcance)
        Export-->>Scope: termina con exportError o sin error
        alt sin error
            Scope-->>Usuario: cerrar diálogo
        else error de descarga
            Scope-->>Usuario: conservar diálogo para reintento
        end
    else Inventario, Directorio o Identidad
        Usuario->>Page: revisar criterios y descargar
        Page->>Export: exportReport(criterios admitidos)
        Export-->>Page: termina con exportError o sin error
        opt error de descarga
            Page-->>Usuario: mostrar fallo y permitir reintento
        end
    end
```

Un mes inválido detiene la operación antes de llamar al exportador; el usuario puede
corregirlo sin abandonar el diálogo. Cada descarga utiliza los criterios admitidos
por ese reporte, no necesariamente todos los filtros que aparecen en la tabla.

## Petición y descarga compartida

**Identificador:** `DIA-VUE-SEQ-033`. Amplía la llamada a `useFileExport` de ambas ramas anteriores.

```mermaid
sequenceDiagram
    autonumber
    participant Export@{ "type": "control" } as useFileExport
    participant Service@{ "type": "boundary" } as servicio del recurso
    participant Excel@{ "type": "boundary" } as requestExcel
    participant API@{ "type": "boundary" } as API
    Export->>Service: export(criterios, signal)
    Service->>Service: construir filtros o mes y omitir paginación
    Service->>Excel: endpoint fijo y parámetros
    Excel->>API: GET con responseType blob
    API-->>Excel: archivo o error
    alt archivo admitido
        Excel-->>Service: blob validado
        Service-->>Export: archivo
        Export->>Export: crear URL e iniciar descarga
        Export->>Export: programar liberación de URL
    else fallo o respuesta HTML
        Excel-->>Service: ApiError
        Service-->>Export: propagar error
        Export->>Export: conservar exportError para la vista
    end
```

## Reglas y recuperación

Los módulos con descarga directa usan useFileExport sin diálogo de alcance. Personas bloquea el filtro de rol no admitido por su API de exportación. El contenido real de XLSX requiere sistema, no un blob simulado.

## Evidencia

reportScopeTest.ts, inventoryReportTest.ts, records.spec.ts y application.spec.ts. La [matriz por caso](../../../../testing/04-use-case-coverage.md) identifica alcance y límites, y el [registro CP](../../../../testing/03-test-cases.md) concreta datos y oráculos críticos.
