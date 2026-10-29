# Compra: lectura y preparación de detalles

**Casos relacionados:** CU-ENT-01/02/03/07/08/09.

## Secuencia aplicada

**Identificador:** `DIA-VUE-SEQ-011`.

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    box Coordinación
    participant Page@{ "type": "control" } as Purchase<br/>Page.vue
    participant EditorPage@{ "type": "control" } as Purchase<br/>Editor<br/>Page.vue
    participant Actions@{ "type": "control" } as usePurchase<br/>Actions.ts
    participant Reader@{ "type": "control" } as useDocument<br/>Read.ts
    participant State@{ "type": "control" } as useList<br/>Editor.ts
    end
    box Reglas y datos
    participant Rules as purchase<br/>Rules.ts
    end
    U->>Page: nowrap: open(row, action)
    Page->>Actions: nowrap: actions.open(row, action)
    opt nowrap: options.canManage() && !controller.signal.aborted &&<br/>!isChanging.value
        Actions->>Actions: nowrap: lastOpen = { row, action }
        Actions->>Reader: nowrap: reader.load(row.id)
        Reader-->>Actions: nowrap: document
        opt nowrap: document
            Actions->>Actions: nowrap: ++editorKey.value
            Actions->>Rules: nowrap: canEditPurchase(document)
            Rules-->>Actions: nowrap: row.status === 'Confirmada' || row.status<br/>=== 'Abierta'
            Actions->>State: nowrap: editorState.openEditor({ action, document<br/>})
            State-->>Page: nowrap: editor
            Page->>EditorPage: nowrap: { target: editor, resource }
        end
    end
```

## Fuentes de los participantes

[PurchasePage.vue](../../../../../src/modules/purchases/pages/PurchasePage.vue),
[PurchaseEditorPage.vue](../../../../../src/modules/purchases/pages/PurchaseEditorPage.vue),
[usePurchaseActions.ts](../../../../../src/modules/purchases/composables/usePurchaseActions.ts),
[useDocumentRead.ts](../../../../../src/shared/composables/useDocumentRead.ts),
[useListEditor.ts](../../../../../src/shared/composables/useListEditor.ts),
[purchaseRules.ts](../../../../../src/modules/purchases/purchaseRules.ts).

## Secuencias relacionadas

[DIA-VUE-SEQ-025](../02-shared-runtime/05-document-read.md#escenario-y-contratos).
