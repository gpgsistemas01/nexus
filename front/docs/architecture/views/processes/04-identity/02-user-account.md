# Cuenta, edición y contraseña

**Casos relacionados:** CU-IDA-06/07/08.

## Secuencia aplicada

**Identificador:** `DIA-VUE-SEQ-006`.

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    box Interfaz
    participant Form@{ "type": "boundary" } as UserForm.vue
    end
    box Coordinación
    participant Page@{ "type": "control" } as UserEditor<br/>Page.vue
    participant Editor@{ "type": "control" } as useUser<br/>Editor.ts
    participant Save@{ "type": "control" } as useRecord<br/>Save.ts
    end
    box Reglas y datos
    participant Payload as identity.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as identity<br/>Service.ts
    end
    U->>Form: nowrap: submit
    Form->>Page: nowrap: emit('submit')
    Page->>Editor: nowrap: editor.submit()
    opt nowrap: !form.isSubmitting.value && !save.isConflicted.value
        Editor->>Editor: nowrap: validated()
        Editor->>Save: nowrap: save.execute(operation)
        Save->>Editor: nowrap: operation(controller.signal)
        Editor->>Payload: nowrap: userPayload(options.target, values)
        Payload-->>Editor: nowrap: payload
        Editor->>Service: nowrap: identityService.save('users',<br/>options.target, payload, signal)
        Service-->>Editor: nowrap: undefined
        Editor-->>Save: nowrap: undefined
        opt nowrap: !controller.signal.aborted
            Save->>Page: nowrap: options.onSaved(result)
            Page->>Page: nowrap: emit('saved')
        end
    end
```

## Fuentes de los participantes

[UserForm.vue](../../../../../src/modules/identity/components/UserForm.vue),
[UserEditorPage.vue](../../../../../src/modules/identity/pages/UserEditorPage.vue),
[useUserEditor.ts](../../../../../src/modules/identity/composables/useUserEditor.ts),
[useRecordSave.ts](../../../../../src/shared/composables/useRecordSave.ts),
[identity.ts](../../../../../src/modules/identity/identity.ts),
[identityService.ts](../../../../../src/modules/identity/services/identityService.ts).

## Secuencias relacionadas

[DIA-VUE-SEQ-038](03-save-transport.md#petición-y-confirmación-de-identidad), [DIA-VUE-SEQ-051](../02-shared-runtime/08-record-save.md).
