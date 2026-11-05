# 2. Consulta y guardado de registros

## Consulta remota

**Identificador:** `DIA-VUE-SEQ-002`.

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    box Coordinación
    participant Page@{ "type": "control" } as Directory<br/>Page.vue
    participant Search@{ "type": "control" } as useList<br/>Search.ts
    participant List@{ "type": "control" } as usePaged<br/>List.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as directory<br/>Service.ts
    end
    U->>Page: nowrap: search
    Page->>Search: nowrap: applySearch()
    Search->>Search: nowrap: changes = { ...readFilters(), search:<br/>search.value }
    alt nowrap: unchanged && list.query.page === 1
        Search->>List: nowrap: list.load()
    else
        Search->>List: nowrap: list.applyQuery(changes)
        List->>List: nowrap: Object.assign(query, next)
        List->>List: nowrap: load()
    end
    List->>List: nowrap: fetchPage(false)
    List->>List: nowrap: ++sequence
    List->>List: nowrap: controller?.abort()
    List->>Page: nowrap: options.request({ ...query },<br/>requestController.signal)
    Page->>Service: nowrap: directoryService.list(props.resource,<br/>query, signal)
    Service-->>Page: nowrap: result
    Page-->>List: nowrap: result
    opt nowrap: requestId === sequence
        opt nowrap: JSON.stringify(rows.value) !== JSON.stringify(<br/>result.data)
            List->>List: nowrap: rows.value = result.data
        end
        List->>List: nowrap: total.value = result.recordsFiltered
        List-->>Page: nowrap: { query, rows, total, isLoading, error }
    end
```

## Fuentes de los participantes

[DirectoryPage.vue](../../../../../src/modules/directory/pages/DirectoryPage.vue),
[useListSearch.ts](../../../../../src/shared/composables/useListSearch.ts),
[usePagedList.ts](../../../../../src/shared/composables/usePagedList.ts),
[directoryService.ts](../../../../../src/modules/directory/services/directoryService.ts).

## Secuencias relacionadas

[DIA-VUE-SEQ-035](07-http-and-contracts.md#lectura-paginada-y-adaptación-de-filas).
