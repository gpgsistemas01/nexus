# Compra: alta y edición confirmadas

**Casos relacionados:** CU-ENT-02/03/08/09.

## Secuencia aplicada

**Identificador:** `DIA-VUE-SEQ-012`.

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    box Interfaz
    participant Form@{ "type": "boundary" } as Purchase<br/>Editor.vue
    end
    box Coordinación
    participant Page@{ "type": "control" } as Purchase<br/>Editor<br/>Page.vue
    participant Editor@{ "type": "control" } as usePurchase<br/>Editor.ts
    participant Save@{ "type": "control" } as useRecord<br/>Save.ts
    end
    box Reglas y datos
    participant Schema as purchase<br/>Form.ts
    participant Mapper as purchase<br/>Request<br/>Mapper.ts
    end
    Page->>Editor: nowrap: usePurchaseEditor({ resource, target, has,<br/>onSaved, onDenied })
    Editor->>Schema: nowrap: createPurchaseValidationSchema(() =><br/>form.values, document)
    Schema-->>Editor: nowrap: validationSchema
    Editor->>Schema: nowrap: createInitialPurchaseValues(document)
    Schema-->>Editor: nowrap: PurchaseValues
    U->>Form: nowrap: submit
    Form->>Page: nowrap: emit('submit')
    Page->>Editor: nowrap: editor.submit()
    opt nowrap: !isReadOnly && !isSubmitting.value &&<br/>!save.isConflicted.value && !save.isDisposed()
        Editor->>Editor: nowrap: submitValidated()
        Editor->>Save: nowrap: save.execute(operation)
        Save->>Editor: nowrap: operation(controller.signal)
        Editor->>Mapper: nowrap: mapPurchaseFormToRequest(values, document)
        Mapper-->>Editor: nowrap: payload
    end
```

## Envío y resultado de la operación

**Identificador:** `DIA-VUE-SEQ-031`.

```mermaid
sequenceDiagram
    autonumber
    box Coordinación
    participant Editor@{ "type": "control" } as usePurchase<br/>Editor.ts
    participant Save@{ "type": "control" } as useRecord<br/>Save.ts
    end
    box Reglas y datos
    participant Contract as record<br/>Contract.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as purchase<br/>Service.ts
    participant HTTP@{ "type": "boundary" } as apiClient.ts
    end
    box Sistema externo
    participant API@{ "type": "boundary" } as API del sistema
    end
    Editor->>Service: nowrap: purchaseService.save({ resource, target,<br/>payload, signal })
    Service->>HTTP: nowrap: apiClient.request(url, { method, data:<br/>payload, signal })
    HTTP->>API: nowrap: {method}<br/>/api/warehouse/goods-receipts/{resource}[/{id}]
    alt nowrap: try
        API-->>HTTP: nowrap: { code }
        HTTP-->>Service: nowrap: response
        Service->>Contract: nowrap: confirmMutation(response, expected)
        alt nowrap: value.code !== expected
            Contract-->>Service: nowrap: throw ApiError
            Service-->>Editor: nowrap: throw ApiError
            Editor-->>Save: nowrap: throw ApiError
        else
            Contract-->>Service: nowrap: MutationConfirmation
            Service-->>Editor: nowrap: MutationConfirmation
            Editor-->>Save: nowrap: result
        end
    else nowrap: catch(cause)
        API-->>HTTP: nowrap: cause
        HTTP-->>Service: nowrap: throw ApiError
        Service-->>Editor: nowrap: throw ApiError
        Editor-->>Save: nowrap: throw ApiError
    end
```

## Entrega del evento y actualización del listado

**Identificador:** `DIA-VUE-SEQ-041`.

```mermaid
sequenceDiagram
    autonumber
    box Interfaz
    participant Feedback@{ "type": "boundary" } as feedback.ts
    end
    box Coordinación
    participant EditorPage@{ "type": "control" } as Purchase<br/>Editor<br/>Page.vue
    participant Page@{ "type": "control" } as Purchase<br/>Page.vue
    participant Save@{ "type": "control" } as useRecord<br/>Save.ts
    participant Actions@{ "type": "control" } as usePurchase<br/>Actions.ts
    participant State@{ "type": "control" } as useList<br/>Editor.ts
    end
    opt nowrap: !controller.signal.aborted
        Save->>EditorPage: nowrap: options.onSaved(result)
        EditorPage->>Page: nowrap: emit('saved', confirmation)
        Page->>Actions: nowrap: actions.handleSaved(confirmation)
        Actions->>Actions: nowrap: close()
        Actions->>State: nowrap: editorState.onSaved()
        State->>State: nowrap: reloadEditor()
        State->>Page: nowrap: options.reload()
        Actions->>Feedback: nowrap: showSuccess(confirmation.message)
    end
```

## Fuentes de los participantes

[PurchaseEditor.vue](../../../../../src/modules/purchases/components/PurchaseEditor.vue),
[PurchaseEditorPage.vue](../../../../../src/modules/purchases/pages/PurchaseEditorPage.vue),
[usePurchaseEditor.ts](../../../../../src/modules/purchases/composables/usePurchaseEditor.ts),
[useRecordSave.ts](../../../../../src/shared/composables/useRecordSave.ts),
[purchaseForm.ts](../../../../../src/modules/purchases/purchaseForm.ts),
[purchaseRequestMapper.ts](../../../../../src/modules/purchases/mappers/purchaseRequestMapper.ts),
[recordContract.ts](../../../../../src/shared/http/recordContract.ts),
[purchaseService.ts](../../../../../src/modules/purchases/services/purchaseService.ts),
[apiClient.ts](../../../../../src/shared/http/apiClient.ts),
[PurchasePage.vue](../../../../../src/modules/purchases/pages/PurchasePage.vue),
[feedback.ts](../../../../../src/shared/ui/feedback.ts),
[usePurchaseActions.ts](../../../../../src/modules/purchases/composables/usePurchaseActions.ts),
[useListEditor.ts](../../../../../src/shared/composables/useListEditor.ts).

## Secuencias relacionadas

[DIA-VUE-SEQ-051](../02-shared-runtime/08-record-save.md).
