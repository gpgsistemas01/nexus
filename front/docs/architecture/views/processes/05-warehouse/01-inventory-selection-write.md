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
    participant Catalog@{ "type": "boundary" } as materialCatalog<br/>Service.ts
    Page->>Editor: nowrap: useInventoryEditor(options)
    Editor->>Selection: nowrap: useInventorySelection({ resource, target,<br/>values, isPending, setValue, clearError,<br/>... })
    alt Alta de material o consumible en Almacén
        Selection->>Catalog: list(resource, { search, page }, signal)
        Catalog-->>Selection: artículos paginados de todo el catálogo
        U->>Form: seleccionar proveedor y materialId
        Form->>Page: emit(update, materialId, id)
        Page->>Editor: update(materialId, id)
        Editor-->>Selection: identidad seleccionada
        opt Artículo faltante con proveedor seleccionado
            Page->>Page: emit(createArticle, búsqueda y callback)
            Note over Page,Service: InventoryWorkspace abre el mismo editor con creationContext goodsReceipt.
            Service-->>Editor: artículo nuevo sin stock ni vínculo
            Editor->>Selection: selectCreatedArticle(artículo)
        end
    else Modal de identidad o alta de merma
        U->>Form: capturar identidad o material de origen
        Form->>Page: emit(update, campo, valor)
        Page->>Editor: update(campo, valor)
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
[inventoryService.ts](../../../../../src/modules/warehouse/services/inventoryService.ts),
[materialCatalogService.ts](../../../../../src/shared/services/materialCatalogService.ts).

## Secuencias relacionadas

[DIA-VUE-SEQ-040](06-inventory-transport.md#operación-y-código-del-recurso).
