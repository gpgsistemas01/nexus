# Merma duplicada: apertura de una entrada

**Casos relacionados:** CU-ALM-10 A2 y CU-ALM-13.

## Secuencia aplicada

**Identificador:** `DIA-VUE-SEQ-009`.

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    box Interfaz
    participant Feedback@{ "type": "boundary" } as feedback.ts
    end
    box Coordinación
    participant Editor@{ "type": "control" } as useInventory<br/>Editor.ts
    participant Recovery@{ "type": "control" } as useWaste<br/>Duplicate<br/>Recovery.ts
    end
    box Reglas y datos
    participant Mapper as wasteStock<br/>Addition<br/>Mapper.ts
    end
    Editor->>Recovery: nowrap: duplicateRecovery.recover(cause, payload)
    alt nowrap: !options.canAddStock || !options.onAddStock ||<br/>options.signal.aborted || isConfirming.value
        Recovery-->>Editor: nowrap: false
    else nowrap: !(cause instanceof ApiError) || cause.code !==<br/>'WASTE_ALREADY_EXISTS' ||<br/>cause.meta.operationRejected !== true
        Recovery-->>Editor: nowrap: false
    else
        Recovery->>Mapper: nowrap: mapWasteStockAddition(cause.meta.waste,<br/>capture)
        Mapper-->>Recovery: nowrap: target
        opt nowrap: target
            Recovery->>Recovery: nowrap: isConfirming.value = true
            Recovery->>Feedback: nowrap: confirmAction({ signal: options.signal,<br/>confirmLabel: 'Abrir Agregar stock', ...<br/>})
            Feedback-->>U: nowrap: Abrir Agregar stock / Cancelar
            U->>Feedback: nowrap: confirm
            Feedback-->>Recovery: nowrap: confirmed
            opt nowrap: confirmed && !options.signal.aborted
                Recovery->>Recovery: nowrap: options.onAddStock(target)
            end
            Recovery->>Recovery: nowrap: isConfirming.value = false
        end
    end
```

## Entrega del destino de entrada

**Identificador:** `DIA-VUE-SEQ-048`.

```mermaid
sequenceDiagram
    autonumber
    box Coordinación
    participant Page@{ "type": "control" } as Inventory<br/>Editor<br/>Page.vue
    participant Parent@{ "type": "control" } as Inventory<br/>Page.vue
    participant Recovery@{ "type": "control" } as useWaste<br/>Duplicate<br/>Recovery.ts
    participant Inventory@{ "type": "control" } as use<br/>Inventory.ts
    end
    Recovery->>Page: nowrap: options.onAddStock(target)
    Page->>Parent: nowrap: emit('addStock', target)
    Parent->>Inventory: nowrap: inventory.openEditor(target)
    Inventory->>Inventory: nowrap: editor.value = target
    Inventory-->>Parent: nowrap: editor
    Parent->>Page: nowrap: { target: editor, resource, userId }
```

## Fuentes de los participantes

[InventoryPage.vue](../../../../../src/modules/warehouse/pages/InventoryPage.vue),
[InventoryEditorPage.vue](../../../../../src/modules/warehouse/pages/InventoryEditorPage.vue),
[feedback.ts](../../../../../src/shared/ui/feedback.ts),
[useInventoryEditor.ts](../../../../../src/modules/warehouse/composables/useInventoryEditor.ts),
[useWasteDuplicateRecovery.ts](../../../../../src/modules/warehouse/composables/useWasteDuplicateRecovery.ts),
[useInventory.ts](../../../../../src/modules/warehouse/composables/useInventory.ts),
[wasteStockAdditionMapper.ts](../../../../../src/modules/warehouse/mappers/wasteStockAdditionMapper.ts).
