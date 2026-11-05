# Compra: cancelación y reintento explícito

**Casos relacionados:** CU-ENT-05/11.

## Secuencia aplicada

**Identificador:** `DIA-VUE-SEQ-014`.

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    box Interfaz
    participant Feedback@{ "type": "boundary" } as feedback.ts
    end
    box Coordinación
    participant Page@{ "type": "control" } as Purchase<br/>Page.vue
    participant Actions@{ "type": "control" } as usePurchase<br/>Actions.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as purchase<br/>Service.ts
    end
    U->>Page: nowrap: cancel(line)
    Page->>Actions: nowrap: actions.cancel(line)
    Actions->>Actions: nowrap: editableDetailDocument(line)
    alt nowrap: !document
        Actions-->>Page: nowrap: undefined
    else
        Actions->>Actions: nowrap: isChanging.value = true
        Actions->>Feedback: nowrap: confirmAction({ signal: controller.signal,<br/>submit, ... })
        Feedback-->>U: nowrap: Confirmar / Cancelar
        U->>Feedback: nowrap: confirm
        Feedback->>Actions: nowrap: options.submit?.()
        Actions->>Service: nowrap: purchaseService.changeDetail({ resource,<br/>documentId, detailId, change: { action:<br/>'cancel' }, signal })
        alt nowrap: try
            Service-->>Actions: nowrap: confirmation
            Actions-->>Feedback: nowrap: undefined
            Feedback-->>Actions: nowrap: confirmed
            Actions->>Actions: nowrap: isChanging.value = false
            opt nowrap: confirmed && confirmation &&<br/>!controller.signal.aborted
                Actions->>Actions: nowrap: handleDetailSaved(confirmation)
                Actions->>Actions: nowrap: correction.value = undefined
                Actions->>Actions: nowrap: needsReload.value = true
                Actions->>Page: nowrap: options.reload()
                Actions->>Actions: nowrap: reload()
            end
        else nowrap: catch(cause)
            Service-->>Actions: nowrap: throw ApiError
            Actions->>Page: nowrap: options.onError(cause)
            Actions-->>Feedback: nowrap: throw cause
            Feedback-->>U: nowrap: cause.message
        end
        Actions->>Actions: nowrap: isChanging.value = false
    end
```

## Fuentes de los participantes

[PurchasePage.vue](../../../../../src/modules/purchases/pages/PurchasePage.vue),
[feedback.ts](../../../../../src/shared/ui/feedback.ts),
[usePurchaseActions.ts](../../../../../src/modules/purchases/composables/usePurchaseActions.ts),
[purchaseService.ts](../../../../../src/modules/purchases/services/purchaseService.ts).
