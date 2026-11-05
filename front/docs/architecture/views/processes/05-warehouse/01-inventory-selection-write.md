# Selección dependiente y escritura de inventario

**Casos relacionados:** CU-ALM-02/03/05/10/11/12/13/18/19/21.

## Secuencia aplicada

**Identificador:** `DIA-VUE-SEQ-007`.

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    box Interfaz
    participant Form@{ "type": "boundary" } as Inventory<br/>Editor.vue
    end
    box Coordinación
    participant Page@{ "type": "control" } as Inventory<br/>Editor<br/>Page.vue
    participant Editor@{ "type": "control" } as useInventory<br/>Editor.ts
    participant Selection@{ "type": "control" } as useInventory<br/>Selection.ts
    end
    box Reglas y datos
    participant Model as formModel.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as inventory<br/>Service.ts
    end
    Page->>Editor: nowrap: useInventoryEditor(options)
    Editor->>Selection: nowrap: useInventorySelection({ resource, target,<br/>values, isPending, setValue, clearError,<br/>... })
    U->>Form: nowrap: update('unitMeasureId', value)
    Form->>Page: nowrap: emit('update', 'unitMeasureId', value)
    Page->>Editor: nowrap: editor.update('unitMeasureId', value)
    Editor-->>Selection: nowrap: values.unitMeasureId
    opt nowrap: resource === 'materials' && isCreating && unit &&<br/>!unitUsesMeasurements(unit.data)
        loop nowrap: field of ['base', 'height']
            Selection->>Editor: nowrap: options.setValue(field, '')
            Selection->>Editor: nowrap: options.clearError(field)
        end
    end
    Editor-->>Page: nowrap: { values: form.values, lookups, preview }
    Page-->>Form: nowrap: { values, lookups, preview }
    U->>Form: nowrap: submit
    Form->>Page: nowrap: emit('submit')
    Page->>Editor: nowrap: editor.submit()
    alt nowrap: pendingData
        Editor->>Editor: nowrap: execute(pendingData)
    else
        Editor->>Editor: nowrap: submitValidated()
        Editor->>Model: nowrap: buildInventoryPayload(resource, target,<br/>values, preview.value,<br/>options.creationContext)
        Model-->>Editor: nowrap: InventoryPayload
        Editor->>Editor: nowrap: execute(payload)
    end
    alt nowrap: options.creationContext === 'goodsReceipt' &&<br/>resource !== 'wastes' && isCreating.value
        Editor->>Service: nowrap: inventoryService.createForPurchase(<br/>resource, payload, controller.signal)
        Service-->>Editor: nowrap: created
    else
        Editor->>Service: nowrap: inventoryService.mutate(resource,<br/>target.action, payload, id,<br/>controller.signal)
        Service-->>Editor: nowrap: result
    end
    opt nowrap: !controller.signal.aborted
        Editor->>Page: nowrap: options.onSaved(created)
        Page->>Page: nowrap: emit('saved', created)
    end
```

## Fuentes de los participantes

[InventoryEditor.vue](../../../../../src/modules/warehouse/components/InventoryEditor.vue),
[InventoryEditorPage.vue](../../../../../src/modules/warehouse/pages/InventoryEditorPage.vue),
[useInventoryEditor.ts](../../../../../src/modules/warehouse/composables/useInventoryEditor.ts),
[useInventorySelection.ts](../../../../../src/modules/warehouse/composables/useInventorySelection.ts),
[formModel.ts](../../../../../src/modules/warehouse/formModel.ts),
[inventoryService.ts](../../../../../src/modules/warehouse/services/inventoryService.ts).

## Secuencias relacionadas

[DIA-VUE-SEQ-040](06-inventory-transport.md#operación-y-código-del-recurso).
