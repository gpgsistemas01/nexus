# Búsqueda, paginación y selección remota

**Casos relacionados:** RD-VUE-006; RN-VUE-003/005; soporte de captura.

## Primera apertura y reutilización

**Identificador:** `DIA-VUE-SEQ-058`. Apertura sin texto de búsqueda. La
[política de carga](../../../contracts/client-contracts.md#página-de-datos-y-selección-remota)
define la vida útil de las opciones y la precarga del área.

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    box Interfaz
    participant Select@{ "type": "boundary" } as RemoteSelect.vue
    end
    box Coordinación
    participant Page@{ "type": "control" } as PurchaseEditorPage.vue
    participant Lookup@{ "type": "control" } as useRemoteLookup.ts
    participant Editor@{ "type": "control" } as usePurchaseEditor.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as purchaseLookupService.ts
    end
    U->>Select: nowrap: update:menu = true
    Select->>Select: nowrap: updateMenu(true)
    Select->>Page: nowrap: emit('search', '')
    Page->>Lookup: nowrap: editor.suppliers.updateSearch('')
    alt nowrap: !hasRequested && !isLoading.value
        Lookup->>Lookup: nowrap: load(1)
        Lookup->>Editor: nowrap: request(search.value, nextPage, requestController.signal)
        Editor->>Service: nowrap: purchaseLookupService.list(query, signal)
        Service-->>Editor: nowrap: result
        Editor-->>Lookup: nowrap: result
        Lookup->>Lookup: nowrap: items.value = [...previous, ...additions]
        Lookup-->>Page: nowrap: suppliers.state
        Page-->>Select: nowrap: state
    else nowrap: hasRequested || isLoading.value
        Lookup-->>Page: nowrap: undefined
    end
```

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
    Lookup->>Lookup: nowrap: isLoading.value = isEnabled.value
    Lookup->>Lookup: nowrap: ++sequence
    Lookup->>Lookup: nowrap: controller?.abort()
    Lookup->>Lookup: nowrap: setTimeout(() => load(), 250)
    Lookup->>Editor: nowrap: request(search.value, nextPage,<br/>requestController.signal)
    Editor->>Service: nowrap: purchaseLookupService.list({<br/>kind: 'suppliers', resource: options.resource,<br/>search, page, capture: true }, signal)
    Service-->>Editor: nowrap: result
    Editor-->>Lookup: nowrap: result
    opt nowrap: requestId === sequence
        Lookup->>Lookup: nowrap: items.value = [...previous, ...additions]
        Lookup->>Lookup: nowrap: hasMore.value = result.data.length > 0 &&<br/>recordsRead < result.recordsFiltered
        Lookup-->>Page: nowrap: suppliers.state
        Page-->>Select: nowrap: state: LookupState
        Select->>Selection: nowrap: useSelectedOption(toRef(() =><br/>props.state.items), getId, getInitialOption)
        Selection-->>Select: nowrap: selected
    end
    U->>Select: nowrap: intersect
    Select->>Page: nowrap: emit('more')
    Page->>Lookup: nowrap: suppliers.loadMore()
    opt nowrap: !isLoading.value && !error.value && hasMore.value
        Lookup->>Lookup: nowrap: load(page.value + 1)
    end
```

Si la lectura falla, `useRemoteLookup` publica `error` y calcula `canRetry` mediante
`isReadRetryable`. `RemoteSelect` emite `retry` sólo cuando ofrece ese botón;
la página llama `retry()`, que repite `load(requestedPage)` sin saltar de página.
La [presentación del error](../../../interface-standards.md#carga-y-recuperación)
no bloquea los otros campos del formulario.

## Fuentes de los participantes

[RemoteSelect.vue](../../../../../src/shared/components/RemoteSelect.vue),
[PurchaseEditorPage.vue](../../../../../src/modules/purchases/pages/PurchaseEditorPage.vue),
[usePurchaseEditor.ts](../../../../../src/modules/purchases/composables/usePurchaseEditor.ts),
[useRemoteLookup.ts](../../../../../src/shared/composables/useRemoteLookup.ts),
[useSelectedOption.ts](../../../../../src/shared/composables/useSelectedOption.ts),
[purchaseLookupService.ts](../../../../../src/modules/purchases/services/purchaseLookupService.ts).
