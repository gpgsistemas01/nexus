# Búsqueda, paginación y selección remota

## Escenario y contratos

**Casos relacionados:** RD-VUE-006; RN-VUE-003/005; soporte de captura.

## Secuencia aplicada

**Identificador:** `DIA-VUE-SEQ-010`.

**Lectura visual:** [líneas de vida, números y mensajes](../../diagram-reading.md#secuencias).

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario autorizado
    box Interfaz
    participant Select@{ "type": "boundary" } as Remote<br/>Select.vue
    participant Page@{ "type": "boundary" } as Purchase<br/>Editor<br/>Page.vue
    end
    box Coordinación
    participant Editor@{ "type": "control" } as usePurchase<br/>Editor.ts
    participant Lookup@{ "type": "control" } as useRemote<br/>Lookup.ts
    participant Selection@{ "type": "control" } as useSelected<br/>Option.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as purchase<br/>Lookup<br/>Service.ts
    end
    U->>Select: escribir búsqueda de proveedor
    Select->>Page: search(value)
    Page->>Lookup: editor.suppliers.updateSearch(value)
    Lookup->>Lookup: invalidar, reiniciar y aplicar debounce
    Lookup->>Editor: request(search, page, signal)
    Editor->>Service: list(suppliers, resource, search, page, signal)
    Service-->>Editor: PageResult de LookupItem
    Editor-->>Lookup: resultado del callback
    Lookup-->>Page: estado de opciones
    Page-->>Select: items y hasMore por props
    Select->>Selection: ID, items e initialOption actualizados
    Selection-->>Select: opción conservada por identidad
    U->>Select: alcanzar final de opciones
    Select->>Page: more
    Page->>Lookup: suppliers.loadMore()
    alt siguiente página disponible y sin petición pendiente
        Lookup->>Editor: request con siguiente página
        Editor->>Service: list con página y signal
        Service-->>Editor: resultado o error
        Editor-->>Lookup: resolver o rechazar callback
        Lookup-->>Page: opciones únicas o error recuperable
        Page-->>Select: estado por props
    end
```

## Reglas y recuperación

Cambiar dependencia reinicia búsqueda/opciones; desmontar limpia timer y aborta/invalida. La selección pertenece al consumidor y no autoriza el registro ni fabrica su ID.

## Evidencia

remoteLookupTest.ts, selectedOptionTest.ts y selectCreation.spec.ts. La [matriz por caso](../../../../testing/04-use-case-coverage.md) identifica alcance y límites, y el [registro CP](../../../../testing/03-test-cases.md) concreta datos y oráculos críticos.

## Fuentes de los participantes

[RemoteSelect.vue](../../../../../src/shared/components/RemoteSelect.vue),
[PurchaseEditorPage.vue](../../../../../src/modules/purchases/pages/PurchaseEditorPage.vue),
[usePurchaseEditor.ts](../../../../../src/modules/purchases/composables/usePurchaseEditor.ts),
[useRemoteLookup.ts](../../../../../src/shared/composables/useRemoteLookup.ts),
[useSelectedOption.ts](../../../../../src/shared/composables/useSelectedOption.ts),
[purchaseLookupService.ts](../../../../../src/modules/purchases/services/purchaseLookupService.ts).
