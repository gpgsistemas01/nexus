# Movimientos: filtros dependientes e historial

## Secuencia aplicada

**Identificador:** `DIA-VUE-SEQ-023`.

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    box Interfaz
    participant View@{ "type": "boundary" } as Movement<br/>Filters.vue
    end
    box Coordinación
    participant Page@{ "type": "control" } as Movement<br/>Page.vue
    participant Filters@{ "type": "control" } as useMovement<br/>Filters.ts
    participant Lookup@{ "type": "control" } as useRemote<br/>Lookup.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as movement<br/>Service.ts
    end
    U->>View: nowrap: update('supplierId', value)
    View->>Page: nowrap: emit('update', 'supplierId', value)
    Page->>Filters: nowrap: filters.update(field, value)
    Filters->>Filters: nowrap: values.supplierId = value
    Filters->>Filters: nowrap: values.itemId = ''
    Lookup->>Lookup: nowrap: resetOptions()
    opt nowrap: isEnabled.value
        Lookup->>Filters: nowrap: request(search.value, nextPage,<br/>requestController.signal)
        Filters->>Service: nowrap: movementService.lookup(resource, search,<br/>page, supplierId.value, signal)
        Service-->>Filters: nowrap: PageResult
        Filters-->>Lookup: nowrap: result
        Lookup-->>Page: nowrap: filters.itemState
        Page-->>View: nowrap: { itemState, supplierState }
    end
```

## Aplicación de criterios y consulta

**Identificador:** `DIA-VUE-SEQ-050`.

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    box Coordinación
    participant Page@{ "type": "control" } as Movement<br/>Page.vue
    participant Search@{ "type": "control" } as useList<br/>Search.ts
    participant List@{ "type": "control" } as usePaged<br/>List.ts
    end
    box Reglas y datos
    participant Rules as report.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as movement<br/>Service.ts
    end
    U->>Page: nowrap: apply
    Page->>Rules: nowrap: dateRangeError(filters.values)
    Rules-->>Page: nowrap: filterError
    opt nowrap: !filterError.value
        Page->>Search: nowrap: searchForm.applySearch()
        Search->>Page: nowrap: readFilters()
        Page-->>Search: nowrap: { ...filters.values }
        alt nowrap: unchanged && list.query.page === 1
            Search->>List: nowrap: list.load()
        else
            Search->>List: nowrap: list.applyQuery(changes)
        end
        List->>Page: nowrap: options.request({ ...query },<br/>requestController.signal)
        Page->>Service: nowrap: movementService.list(props.resource,<br/>query, signal)
        Service-->>Page: nowrap: result
        Page-->>List: nowrap: result
        opt nowrap: requestId === sequence
            opt nowrap: JSON.stringify(rows.value) !== JSON.stringify(<br/>result.data)
                List->>List: nowrap: rows.value = result.data
            end
            List->>List: nowrap: total.value = result.recordsFiltered
            List-->>Page: nowrap: { rows, total, isLoading, error }
        end
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
