# Recarga visible sin solapamiento

**Casos relacionados:** RN-VUE-003/005/007; consultas de CU-ALM y listados.

## Secuencia aplicada

**Identificador:** `DIA-VUE-SEQ-019`.

```mermaid
sequenceDiagram
    autonumber
    box Coordinación
    participant Refresh@{ "type": "control" } as useVisible<br/>Refresh.ts
    participant Domain@{ "type": "control" } as useInventory<br/>List.ts
    participant List@{ "type": "control" } as usePaged<br/>List.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as inventory<br/>Service.ts
    end
    Refresh->>Refresh: nowrap: refreshVisible()
    opt nowrap: document.visibilityState === 'visible'
        Refresh->>Domain: nowrap: options.canRefresh()
        Domain-->>Refresh: nowrap: canRead && !isPaused.value &&<br/>!list.isLoading.value &&<br/>!list.isRefreshing.value
        opt nowrap: options.canRefresh() && Date.now() -<br/>options.lastAttemptAt() >= intervalMs
            Refresh->>List: nowrap: options.refresh()
            List->>List: nowrap: fetchPage(true)
            List->>Domain: nowrap: options.request({ ...query },<br/>requestController.signal)
            Domain->>Service: nowrap: inventoryService.list(resource, query,<br/>signal)
            Service-->>Domain: nowrap: result
            Domain-->>List: nowrap: result
            opt nowrap: requestId === sequence
                opt nowrap: JSON.stringify(rows.value) !== JSON.stringify(<br/>result.data)
                    List->>List: nowrap: rows.value = result.data
                end
                List->>List: nowrap: total.value = result.recordsFiltered
                List->>List: nowrap: isRefreshing.value = false
            end
        end
    end
```

## Fuentes de los participantes

[useVisibleRefresh.ts](../../../../../src/shared/composables/useVisibleRefresh.ts),
[useInventoryList.ts](../../../../../src/modules/warehouse/composables/useInventoryList.ts),
[usePagedList.ts](../../../../../src/shared/composables/usePagedList.ts),
[inventoryService.ts](../../../../../src/modules/warehouse/services/inventoryService.ts).
