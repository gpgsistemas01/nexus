# Movimientos: filtros dependientes e historial

## Escenario y fuente

CU-ALM-07/15/23 y reportes asociados. Fuentes: `useMovementFilters`, `MovementPage`,
`movementService` y `useRemoteLookup`. Se consulta el historial del recurso fijo;
esta pantalla no escribe movimientos.

## Secuencia aplicada

**Identificador:** `DIA-VUE-SEQ-023`. Las dependencias de proveedor y artículo se
resuelven antes de aplicar la consulta. Mensajes numerados; no implica escritura.

**Lectura visual:** [líneas de vida, números y mensajes](../../diagram-reading.md#secuencias).

```mermaid
sequenceDiagram
    autonumber
    actor Usuario
    participant Page@{ "type": "boundary" } as MovementPage
    participant Filters@{ "type": "control" } as useMovementFilters
    participant Lookup@{ "type": "control" } as useRemoteLookup de artículos
    participant List@{ "type": "control" } as usePagedList
    participant Service@{ "type": "boundary" } as movementService
    Usuario->>Page: cambiar proveedor en filtros
    Page->>Filters: update supplierId
    Filters->>Filters: watch síncrono limpia itemId
    Filters->>Lookup: cambio de dependency supplierId
    Lookup->>Lookup: reiniciar búsqueda, abortar e invalidar
    alt permiso y proveedor presentes
        Lookup->>Service: lookup del recurso y proveedor
        Service-->>Lookup: opciones paginadas
    else no habilitado
        Lookup->>Lookup: vaciar opciones sin request
    end
    Usuario->>Page: elegir artículo y aplicar filtros
    Page->>Filters: obtener valores admitidos
    Page->>List: applyQuery con página inicial
    List->>Service: list por recurso y filtros aplicados
    Service-->>List: filas/conteos normalizados
    List-->>Page: historial o error recuperable
    Page-->>Usuario: tabla de movimientos del recurso
```

El tipo de movimiento se limita a la lista admitida. La identidad del material y de
la merma no se intercambian. Exportar utiliza los filtros aplicados, no una captura
incompleta del panel. Las [descargas](02-reports.md) conservan su proceso separado.
Evidencia: `movementFiltersTest.ts`, `movementServiceTest.ts` y `movements.spec.ts`.
