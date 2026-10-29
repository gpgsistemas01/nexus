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
    actor U as Usuario autorizado
    box Interfaz
    participant View@{ "type": "boundary" } as Movement<br/>Filters.vue
    participant Page@{ "type": "boundary" } as Movement<br/>Page.vue
    end
    box Coordinación
    participant Filters@{ "type": "control" } as useMovement<br/>Filters.ts
    participant Lookup@{ "type": "control" } as useRemote<br/>Lookup.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as movement<br/>Service.ts
    end
    U->>View: cambiar proveedor
    View->>Page: update(supplierId, value)
    Page->>Filters: update(field, value)
    Filters->>Filters: limpiar itemId por dependencia
    Lookup->>Lookup: invalidar y reiniciar búsqueda dependiente
    opt permiso y proveedor presentes
        Lookup->>Filters: request(search, page, signal)
        Filters->>Service: lookup(resource, search, page, supplierId, signal)
        Service-->>Filters: opciones paginadas
        Filters-->>Lookup: resultado del callback
    end
    Lookup-->>Page: state de opciones
    Page-->>View: props de opciones y errores
```

El tipo de movimiento se limita a la lista admitida. La identidad del material y de
la merma no se intercambian. Exportar utiliza los filtros aplicados, no una captura
incompleta del panel. Las [descargas](02-reports.md) conservan su proceso separado.
Evidencia: `movementFiltersTest.ts`, `movementServiceTest.ts` y `movements.spec.ts`.

## Aplicación de criterios y consulta

**Identificador:** `DIA-VUE-SEQ-050`. La consulta utiliza filtros aplicados, después de comprobar el intervalo de fechas.

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario autorizado
    box Interfaz
    participant Page@{ "type": "boundary" } as Movement<br/>Page.vue
    end
    box Coordinación
    participant Search@{ "type": "control" } as useList<br/>Search.ts
    participant List@{ "type": "control" } as usePaged<br/>List.ts
    end
    box Reglas y datos
    participant Rules@{ "type": "control" } as report.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as movement<br/>Service.ts
    end
    U->>Page: aplicar búsqueda y filtros
    Page->>Rules: dateRangeError(filters.values)
    Rules-->>Page: error o intervalo admitido
    opt sin error de fechas
        Page->>Search: applySearch()
        Search->>Page: readFilters() configurado
        Page-->>Search: copia de filters.values
        Search->>List: applyQuery(changes) o load()
        List->>Page: request(query, signal) configurado
        Page->>Service: list(resource, query, signal)
        Service-->>Page: PageResult normalizado o error
        Page-->>List: resultado del callback
        List-->>Page: filas, conteos o error vigente
    end
```

## Fuentes de los participantes

[MovementFilters.vue](../../../../../src/modules/movements/components/MovementFilters.vue),
[MovementPage.vue](../../../../../src/modules/movements/pages/MovementPage.vue),
[useMovementFilters.ts](../../../../../src/modules/movements/composables/useMovementFilters.ts),
[useListSearch.ts](../../../../../src/shared/composables/useListSearch.ts),
[useRemoteLookup.ts](../../../../../src/shared/composables/useRemoteLookup.ts),
[usePagedList.ts](../../../../../src/shared/composables/usePagedList.ts),
[report.ts](../../../../../src/shared/report.ts),
[movementService.ts](../../../../../src/modules/movements/services/movementService.ts).
