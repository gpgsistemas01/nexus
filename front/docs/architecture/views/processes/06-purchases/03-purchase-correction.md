# Compra: corrección de un detalle

## Escenario y contratos

**Casos relacionados:** CU-ENT-04/10.

## Secuencia aplicada

**Identificador:** `DIA-VUE-SEQ-013`.

**Lectura visual:** [líneas de vida, números y mensajes](../../diagram-reading.md#secuencias).

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario autorizado
    box Interfaz
    participant Form@{ "type": "boundary" } as Purchase<br/>Correction<br/>Form.vue
    participant Page@{ "type": "boundary" } as Purchase<br/>Correction<br/>Page.vue
    participant Feedback@{ "type": "boundary" } as feedback.ts
    end
    box Coordinación
    participant Correction@{ "type": "control" } as usePurchase<br/>Correction.ts
    participant Save@{ "type": "control" } as useRecord<br/>Save.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as purchase<br/>Service.ts
    end
    Note over Page,Service: usePurchaseActions.correct ya seleccionó un detalle editable
    U->>Form: cambiar cantidad o costo, Guardar
    Form->>Page: submit
    Page->>Correction: submit()
    Correction->>Correction: validar y comparar con el detalle leído
    alt inválida o sin cambio
        Correction-->>Page: error sin petición
    else corrección válida
        Correction->>Feedback: confirmAction sin submit
        Feedback-->>U: revisar confirmación de corrección
        U->>Feedback: cancelar o confirmar
        Feedback-->>Correction: false o true
        opt confirmado y vigente
            Correction->>Save: execute(operation)
            Save->>Correction: operation(signal)
            Correction->>Service: changeDetail con action correct
            Note over Service: PATCH details/id/corrections, HTTP y código en purchaseService
            Service-->>Correction: MutationConfirmation o ApiError
            Correction-->>Save: resultado o rechazo
            opt confirmado y vigente
                Save->>Page: onSaved(confirmation): emitir saved
                Note over Page: PurchasePage conecta saved con handleDetailSaved
            end
        end
    end
```

## Reglas y recuperación

La API resuelve stock, totales e historia; el diagrama no atribuye esa transacción al navegador. Tras confirmación se relee el documento antes de permitir otra modificación del detalle.

## Evidencia

purchaseTest.ts, purchases.spec.ts y CP-VUE-COM-003-01. La [matriz por caso](../../../../testing/04-use-case-coverage.md) identifica alcance y límites, y el [registro CP](../../../../testing/03-test-cases.md) concreta datos y oráculos críticos.

## Fuentes de los participantes

[PurchaseCorrectionForm.vue](../../../../../src/modules/purchases/components/PurchaseCorrectionForm.vue),
[PurchaseCorrectionPage.vue](../../../../../src/modules/purchases/pages/PurchaseCorrectionPage.vue),
[feedback.ts](../../../../../src/shared/ui/feedback.ts),
[usePurchaseCorrection.ts](../../../../../src/modules/purchases/composables/usePurchaseCorrection.ts),
[useRecordSave.ts](../../../../../src/shared/composables/useRecordSave.ts),
[purchaseService.ts](../../../../../src/modules/purchases/services/purchaseService.ts).
