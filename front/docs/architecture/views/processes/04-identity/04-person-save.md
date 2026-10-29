# Persona: guardado del nombre y las responsabilidades

## Coordinación del guardado

**Identificador:** `DIA-VUE-SEQ-039`.

```mermaid
sequenceDiagram
    autonumber
    box Coordinación
    participant Page@{ "type": "control" } as PersonEditor<br/>Page.vue
    participant Editor@{ "type": "control" } as usePerson<br/>Editor.ts
    participant Save@{ "type": "control" } as useRecord<br/>Save.ts
    end
    box Reglas y datos
    participant Payload as identity.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as identity<br/>Service.ts
    end
    Page->>Editor: nowrap: editor.submit()
    opt nowrap: !form.isSubmitting.value && !save.isConflicted.value
        Editor->>Editor: nowrap: validated()
        Editor->>Save: nowrap: save.execute(operation)
        Save->>Editor: nowrap: operation(controller.signal)
        Editor->>Payload: nowrap: personPayload(options.target, values)
        Payload-->>Editor: nowrap: payload
        Editor->>Service: nowrap: identityService.save('persons',<br/>options.target, payload, signal)
        Service-->>Editor: nowrap: undefined
        Editor-->>Save: nowrap: undefined
        opt nowrap: !controller.signal.aborted
            Save->>Page: nowrap: options.onSaved(result)
            Page->>Page: nowrap: emit('saved')
        end
    end
```

## Fuentes de los participantes

[PersonEditorPage.vue](../../../../../src/modules/identity/pages/PersonEditorPage.vue),
[usePersonEditor.ts](../../../../../src/modules/identity/composables/usePersonEditor.ts),
[useRecordSave.ts](../../../../../src/shared/composables/useRecordSave.ts),
[identity.ts](../../../../../src/modules/identity/identity.ts),
[identityService.ts](../../../../../src/modules/identity/services/identityService.ts).

## Secuencias relacionadas

[DIA-VUE-SEQ-005](01-person-responsibilities.md#secuencia-aplicada), [DIA-VUE-SEQ-038](03-save-transport.md#petición-y-confirmación-de-identidad), [DIA-VUE-SEQ-051](../02-shared-runtime/08-record-save.md).
