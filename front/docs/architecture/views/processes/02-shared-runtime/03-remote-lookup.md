# Búsqueda, paginación y selección remota

**Casos relacionados:** RD-VUE-006; RN-VUE-003/005; soporte de captura.

## Secuencia aplicada

**Identificador:** `DIA-VUE-SEQ-010`.

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    box Interfaz
    participant Select@{ "type": "boundary" } as Remote<br/>Select.vue
    end
    box Coordinación
    participant Page@{ "type": "control" } as Purchase<br/>Editor<br/>Page.vue
    participant Editor@{ "type": "control" } as usePurchase<br/>Editor.ts
    participant Lookup@{ "type": "control" } as useRemote<br/>Lookup.ts
    participant Selection@{ "type": "control" } as useSelected<br/>Option.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as purchase<br/>Lookup<br/>Service.ts
    end
    U->>Select: nowrap: update:search
    Select->>Page: nowrap: emit('search', value)
    Page->>Lookup: nowrap: editor.suppliers.updateSearch(value)
    Lookup->>Lookup: nowrap: resetOptions()
    Lookup->>Lookup: nowrap: ++sequence
    Lookup->>Lookup: nowrap: controller?.abort()
    Lookup->>Lookup: nowrap: setTimeout(() => load(), 250)
    Lookup->>Editor: nowrap: request(search.value, nextPage,<br/>requestController.signal)
    Editor->>Service: nowrap: purchaseLookupService.list('suppliers',<br/>options.resource, search, page, signal, {<br/>capture: true })
    Service-->>Editor: nowrap: result
    Editor-->>Lookup: nowrap: result
    opt nowrap: requestId === sequence
        Lookup->>Lookup: nowrap: items.value = [...previous, ...additions]
        Lookup->>Lookup: nowrap: hasMore.value = result.data.length > 0 &&<br/>recordsRead < result.recordsFiltered
        Lookup-->>Page: nowrap: suppliers.state
        Page-->>Select: nowrap: { items, isLoading, hasMore, loadError }
        Select->>Selection: nowrap: useSelectedOption(toRef(props, 'items'),<br/>getId, getInitialOption)
        Selection-->>Select: nowrap: selected
    end
    U->>Select: nowrap: intersect
    Select->>Page: nowrap: emit('more')
    Page->>Lookup: nowrap: suppliers.loadMore()
    opt nowrap: !isLoading.value && !error.value && hasMore.value
        Lookup->>Lookup: nowrap: load(page.value + 1)
    end
```

## Fuentes de los participantes

[RemoteSelect.vue](../../../../../src/shared/components/RemoteSelect.vue),
[PurchaseEditorPage.vue](../../../../../src/modules/purchases/pages/PurchaseEditorPage.vue),
[usePurchaseEditor.ts](../../../../../src/modules/purchases/composables/usePurchaseEditor.ts),
[useRemoteLookup.ts](../../../../../src/shared/composables/useRemoteLookup.ts),
[useSelectedOption.ts](../../../../../src/shared/composables/useSelectedOption.ts),
[purchaseLookupService.ts](../../../../../src/modules/purchases/services/purchaseLookupService.ts).
