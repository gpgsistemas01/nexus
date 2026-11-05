# Compra: selección y agregado de nuevos detalles

## Detalle nuevo y captura del encabezado

**Identificador:** `DIA-VUE-SEQ-044`.

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    box Interfaz
    participant Form@{ "type": "boundary" } as PurchaseLine<br/>Entry<br/>Form.vue
    end
    box Coordinación
    participant Page@{ "type": "control" } as PurchaseLine<br/>Entry<br/>Page.vue
    participant Parent@{ "type": "control" } as Purchase<br/>Editor<br/>Page.vue
    participant Line@{ "type": "control" } as usePurchase<br/>LineEntry.ts
    participant Editor@{ "type": "control" } as usePurchase<br/>Editor.ts
    end
    box Reglas y datos
    participant Details as purchase<br/>Details.ts
    end
    U->>Form: nowrap: add
    Form->>Page: nowrap: emit('add')
    Page->>Line: nowrap: line.add()
    opt nowrap: options.canRead && !options.isDisabled() &&<br/>!isDisposed && !form.isSubmitting.value
        Line->>Line: nowrap: validated()
        opt nowrap: item.value && !item.value.isDisabled
            Line->>Details: nowrap: createPurchaseDetailDraft(item.value,<br/>Number(values.quantity), Number(<br/>values.costPerUnitType))
            Details-->>Line: nowrap: PurchaseDetail
            Line->>Page: nowrap: options.onAdded(line)
            Page->>Parent: nowrap: emit('add', value)
            Parent->>Editor: nowrap: editor.addDetail(line)
            Editor->>Editor: nowrap: interaction.update('details',<br/>[...form.values.details, line])
            Line->>Line: nowrap: form.resetForm()
            Line->>Line: nowrap: items.updateSearch('')
        end
    end
```

## Fuentes de los participantes

[PurchaseLineEntryForm.vue](../../../../../src/modules/purchases/components/PurchaseLineEntryForm.vue),
[PurchaseLineEntryPage.vue](../../../../../src/modules/purchases/pages/PurchaseLineEntryPage.vue),
[PurchaseEditorPage.vue](../../../../../src/modules/purchases/pages/PurchaseEditorPage.vue),
[usePurchaseLineEntry.ts](../../../../../src/modules/purchases/composables/usePurchaseLineEntry.ts),
[usePurchaseEditor.ts](../../../../../src/modules/purchases/composables/usePurchaseEditor.ts),
[purchaseDetails.ts](../../../../../src/modules/purchases/purchaseDetails.ts).
