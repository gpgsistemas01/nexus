# Merma: respuesta incierta y reintento

**Casos relacionados:** CU-ALM-10/13; RF-VUE-007/008.

## Secuencia aplicada

**Identificador:** `DIA-VUE-SEQ-008`.

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    box Coordinación
    participant Page@{ "type": "control" } as Inventory<br/>Editor<br/>Page.vue
    participant Editor@{ "type": "control" } as useInventory<br/>Editor.ts
    end
    box Integración
    participant Pending@{ "type": "boundary" } as pendingWaste<br/>Operation.ts
    participant Service@{ "type": "boundary" } as inventory<br/>Service.ts
    end
    Editor->>Pending: nowrap: createPendingWasteOperation(<br/>options.userId, action,<br/>target.row?.entityId)
    Editor->>Pending: nowrap: pending.read()
    Pending-->>Editor: nowrap: pendingData
    U->>Page: nowrap: submit
    Page->>Editor: nowrap: editor.submit()
    Editor->>Pending: nowrap: pending.save(payload)
    alt nowrap: catch(cause)
        Pending-->>Editor: nowrap: throw cause
        Editor->>Pending: nowrap: pending.reject(cause, wasPending)
        Editor->>Pending: nowrap: pending.read()
        Pending-->>Editor: nowrap: pendingData
        Editor-->>Page: nowrap: { isPending, message }
    else
        Pending-->>Editor: nowrap: pendingData
        Editor->>Editor: nowrap: payload = pendingData
        Editor->>Service: nowrap: inventoryService.mutate(resource,<br/>target.action, payload, id,<br/>controller.signal)
        alt nowrap: try
            Service-->>Editor: nowrap: result
            opt nowrap: !controller.signal.aborted
                Editor->>Pending: nowrap: pending.clear()
                Editor->>Page: nowrap: options.onSaved(created)
            end
        else nowrap: catch(cause)
            Service-->>Editor: nowrap: throw ApiError
            opt nowrap: !controller.signal.aborted
                Editor->>Pending: nowrap: pending.reject(cause, wasPending)
                Editor->>Pending: nowrap: pending.read()
                Pending-->>Editor: nowrap: pendingData
                Editor->>Editor: nowrap: isPending.value = !!pendingData
                Editor-->>Page: nowrap: { isPending, errors, message }
            end
        end
    end
```

## Fuentes de los participantes

[InventoryEditorPage.vue](../../../../../src/modules/warehouse/pages/InventoryEditorPage.vue),
[useInventoryEditor.ts](../../../../../src/modules/warehouse/composables/useInventoryEditor.ts),
[pendingWasteOperation.ts](../../../../../src/modules/warehouse/services/pendingWasteOperation.ts),
[inventoryService.ts](../../../../../src/modules/warehouse/services/inventoryService.ts).

## Secuencias relacionadas

[DIA-VUE-SEQ-040](06-inventory-transport.md#operación-y-código-del-recurso).
