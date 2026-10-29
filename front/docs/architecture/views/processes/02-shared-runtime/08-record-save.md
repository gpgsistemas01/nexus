# execute(operation)

**Identificador:** `DIA-VUE-SEQ-051`.

```mermaid
sequenceDiagram
    autonumber
    box Coordinación
    participant Editor@{ "type": "control" } as useCatalog<br/>Editor.ts
    participant Save@{ "type": "control" } as useRecord<br/>Save.ts
    participant Page@{ "type": "control" } as Catalog<br/>Editor<br/>Page.vue
    end
    Editor->>Save: nowrap: save.execute(operation)
    alt nowrap: isSubmitting.value || isConflicted.value ||<br/>controller.signal.aborted
        Save-->>Editor: nowrap: undefined
    else
        Save->>Save: nowrap: isSubmitting.value = true
        Save->>Editor: nowrap: operation(controller.signal)
        Editor-->>Save: nowrap: result
        Save->>Save: nowrap: isSubmitting.value = false
        opt nowrap: !controller.signal.aborted
            Save->>Page: nowrap: options.onSaved(result)
            Page->>Page: nowrap: emit('saved')
        end
    end
```

## catch(cause)

**Identificador:** `DIA-VUE-SEQ-053`.

```mermaid
sequenceDiagram
    autonumber
    box Coordinación
    participant Editor@{ "type": "control" } as useCatalog<br/>Editor.ts
    participant Save@{ "type": "control" } as useRecord<br/>Save.ts
    participant Page@{ "type": "control" } as Catalog<br/>Editor<br/>Page.vue
    end
    Editor-->>Save: nowrap: throw cause
    opt nowrap: !controller.signal.aborted
        Save->>Save: nowrap: message.value = cause instanceof Error ?<br/>cause.message : (options.errorMessage ??<br/>'No se pudo guardar.')
        opt nowrap: cause instanceof ApiError
            Save->>Editor: nowrap: options.setErrors(cause.fieldErrors)
            Save->>Save: nowrap: isConflicted.value = cause.code ===<br/>'RECORD_VERSION_CONFLICT'
            opt nowrap: [401, 403].includes(cause.status)
                Save->>Page: nowrap: options.onDenied(cause.status)
                Page->>Page: nowrap: emit('denied', status)
            end
        end
    end
    Save->>Save: nowrap: isSubmitting.value = false
```

## Fuentes de los participantes

[useCatalogEditor.ts](../../../../../src/modules/catalogs/composables/useCatalogEditor.ts),
[useRecordSave.ts](../../../../../src/shared/composables/useRecordSave.ts),
[CatalogEditorPage.vue](../../../../../src/modules/catalogs/pages/CatalogEditorPage.vue).
