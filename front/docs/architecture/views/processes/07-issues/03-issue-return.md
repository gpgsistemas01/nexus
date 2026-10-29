# Salida: devolución por saldo leído

**Casos relacionados:** CU-SAL-06/13/20.

## Secuencia aplicada

**Identificador:** `DIA-VUE-SEQ-017`.

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    box Interfaz
    participant Form@{ "type": "boundary" } as IssueReturn<br/>Form.vue
    end
    box Coordinación
    participant Page@{ "type": "control" } as IssueReturn<br/>Page.vue
    participant Return@{ "type": "control" } as useIssue<br/>Return.ts
    participant Save@{ "type": "control" } as useRecord<br/>Save.ts
    end
    box Reglas y datos
    participant Rules as issue<br/>Rules.ts
    end
    Page->>Return: nowrap: useIssueReturn({ resource, document,<br/>detail, onSaved, onDenied })
    Return->>Rules: nowrap: getIssueReturnableQuantity(options.detail)
    Rules-->>Return: nowrap: availableQuantity
    U->>Form: nowrap: submit
    Form->>Page: nowrap: emit('submit')
    Page->>Return: nowrap: form.submit()
    opt nowrap: !isDisabled()
        Return->>Return: nowrap: validated()
        Return->>Save: nowrap: save.execute(operation)
    end
```

## Ejecución del callback y resultado

**Identificador:** `DIA-VUE-SEQ-032`.

```mermaid
sequenceDiagram
    autonumber
    box Coordinación
    participant Page@{ "type": "control" } as IssueReturn<br/>Page.vue
    participant Parent@{ "type": "control" } as IssueEditor<br/>Page.vue
    participant Return@{ "type": "control" } as useIssue<br/>Return.ts
    participant Save@{ "type": "control" } as useRecord<br/>Save.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as issue<br/>Service.ts
    end
    Save->>Return: nowrap: operation(controller.signal)
    Return->>Service: nowrap: issueService.returnDetail({ resource:<br/>options.resource, documentId:<br/>options.document.id, detailId:<br/>options.detail.id, payload: {<br/>returnQuantity: Number(<br/>values.returnQuantity), observations:<br/>values.observations.trim() }, signal })
    alt nowrap: try
        Service-->>Return: nowrap: MutationConfirmation
        Return-->>Save: nowrap: result
        opt nowrap: !controller.signal.aborted
            Save->>Page: nowrap: options.onSaved(result)
            Page->>Parent: nowrap: emit('saved', result)
            Parent->>Parent: nowrap: emit('saved', $event)
        end
    else nowrap: catch(cause)
        Service-->>Return: nowrap: throw ApiError
        Return-->>Save: nowrap: throw cause
        opt nowrap: !controller.signal.aborted && cause instanceof<br/>ApiError
            Save->>Return: nowrap: options.setErrors(cause.fieldErrors)
            Return-->>Page: nowrap: { errors, message, isConflicted }
        end
    end
```

## Fuentes de los participantes

[IssueReturnForm.vue](../../../../../src/modules/issues/components/IssueReturnForm.vue),
[IssueReturnPage.vue](../../../../../src/modules/issues/pages/IssueReturnPage.vue),
[useIssueReturn.ts](../../../../../src/modules/issues/composables/useIssueReturn.ts),
[useRecordSave.ts](../../../../../src/shared/composables/useRecordSave.ts),
[issueRules.ts](../../../../../src/modules/issues/issueRules.ts),
[IssueEditorPage.vue](../../../../../src/modules/issues/pages/IssueEditorPage.vue),
[issueService.ts](../../../../../src/modules/issues/services/issueService.ts).

## Secuencias relacionadas

[DIA-VUE-SEQ-051](../02-shared-runtime/08-record-save.md), [DIA-VUE-SEQ-052](07-issue-save-transport.md#returndetailoptions), [DIA-VUE-DOC-002](../../development/design-and-construction-patterns/08-document-responsibilities.md#secuencia-de-guardado-confirmado).
