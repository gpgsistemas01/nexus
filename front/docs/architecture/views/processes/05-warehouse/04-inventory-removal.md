# Baja confirmada de una relación de inventario

## Secuencia aplicada

**Identificador:** `DIA-VUE-SEQ-021`.

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    box Interfaz
    participant Feedback@{ "type": "boundary" } as feedback.ts
    end
    box Coordinación
    participant Page@{ "type": "control" } as Inventory<br/>Page.vue
    participant Inventory@{ "type": "control" } as use<br/>Inventory.ts
    participant Remove@{ "type": "control" } as useInventory<br/>Removal.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as inventory<br/>Service.ts
    end
    U->>Page: nowrap: action({ action: 'delete', row })
    Page->>Inventory: nowrap: inventory.openEditor(target)
    Inventory->>Remove: nowrap: removal.remove(target.row)
    opt nowrap: !isConfirming.value && !controller.signal.aborted
        Remove->>Remove: nowrap: isConfirming.value = true
        Remove->>Feedback: nowrap: confirmAction({ signal: controller.signal,<br/>submit, ... })
        Feedback-->>U: nowrap: Confirmar eliminación / Cancelar
        U->>Feedback: nowrap: confirm
        Feedback->>Remove: nowrap: options.submit?.()
        Remove->>Service: nowrap: inventoryService.mutate(options.resource,<br/>'delete', {}, row.id, controller.signal)
        alt nowrap: try
            Service-->>Remove: nowrap: result
            Remove-->>Feedback: nowrap: undefined
            Feedback-->>Remove: nowrap: confirmed
            opt nowrap: confirmed
                Remove->>Inventory: nowrap: options.onSaved()
                Inventory->>Inventory: nowrap: editor.value = null
                Inventory->>Inventory: nowrap: list.load()
            end
        else nowrap: catch(cause)
            Service-->>Remove: nowrap: throw ApiError
            opt nowrap: cause.status === 401
                Remove->>Page: nowrap: options.onUnauthorized()
            end
            Remove-->>Feedback: nowrap: throw cause
            Feedback-->>U: nowrap: cause.message
        end
        Remove->>Remove: nowrap: isConfirming.value = false
    end
```

## Fuentes de los participantes

[InventoryPage.vue](../../../../../src/modules/warehouse/pages/InventoryPage.vue),
[feedback.ts](../../../../../src/shared/ui/feedback.ts),
[useInventory.ts](../../../../../src/modules/warehouse/composables/useInventory.ts),
[useInventoryRemoval.ts](../../../../../src/modules/warehouse/composables/useInventoryRemoval.ts),
[inventoryService.ts](../../../../../src/modules/warehouse/services/inventoryService.ts).
