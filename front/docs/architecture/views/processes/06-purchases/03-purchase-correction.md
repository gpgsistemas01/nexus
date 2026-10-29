# Compra: corrección de un detalle

**Casos relacionados:** CU-ENT-04/10.

## Secuencia aplicada

**Identificador:** `DIA-VUE-SEQ-013`.

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    box Interfaz
    participant Form@{ "type": "boundary" } as Purchase<br/>Correction<br/>Form.vue
    participant Feedback@{ "type": "boundary" } as feedback.ts
    end
    box Coordinación
    participant Page@{ "type": "control" } as Purchase<br/>Correction<br/>Page.vue
    participant Correction@{ "type": "control" } as usePurchase<br/>Correction.ts
    participant Save@{ "type": "control" } as useRecord<br/>Save.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as purchase<br/>Service.ts
    end
    U->>Form: nowrap: submit
    Form->>Page: nowrap: emit('submit')
    Page->>Correction: nowrap: editor.submit()
    opt nowrap: !isSubmitting.value && !save.isDisposed()
        Correction->>Correction: nowrap: validated()
        alt nowrap: Number(values.quantity) === Number(<br/>options.detail.quantity) && Number(<br/>values.costPerUnitType) === Number(<br/>options.detail.costPerUnitType)
            Correction-->>Page: nowrap: save.message
        else
            Correction->>Feedback: nowrap: confirmAction({ signal: save.signal,<br/>confirmLabel: 'Corregir detalle', ... })
            Feedback-->>U: nowrap: Confirmar / Cancelar
            U->>Feedback: nowrap: confirm
            Feedback-->>Correction: nowrap: confirmed
            opt nowrap: confirmed && !save.isDisposed()
                Correction->>Save: nowrap: save.execute(operation)
                Save->>Correction: nowrap: operation(controller.signal)
                Correction->>Service: nowrap: purchaseService.changeDetail({ resource,<br/>documentId, detailId, change: { action:<br/>'correct', quantity, costPerUnitType },<br/>signal })
                Service-->>Correction: nowrap: MutationConfirmation
                Correction-->>Save: nowrap: result
                opt nowrap: !controller.signal.aborted
                    Save->>Page: nowrap: options.onSaved(result)
                    Page->>Page: nowrap: emit('saved', confirmation)
                end
            end
        end
    end
```

## Fuentes de los participantes

[PurchaseCorrectionForm.vue](../../../../../src/modules/purchases/components/PurchaseCorrectionForm.vue),
[PurchaseCorrectionPage.vue](../../../../../src/modules/purchases/pages/PurchaseCorrectionPage.vue),
[feedback.ts](../../../../../src/shared/ui/feedback.ts),
[usePurchaseCorrection.ts](../../../../../src/modules/purchases/composables/usePurchaseCorrection.ts),
[useRecordSave.ts](../../../../../src/shared/composables/useRecordSave.ts),
[purchaseService.ts](../../../../../src/modules/purchases/services/purchaseService.ts).

## Secuencias relacionadas

[DIA-VUE-SEQ-051](../02-shared-runtime/08-record-save.md).
