# Salida: apertura, modos y escritura

**Casos relacionados:** CU-SAL-02/03/04/09/10/11/16/17/18.

## Apertura y resolución del modo

**Identificador:** `DIA-VUE-SEQ-015`.

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    box Coordinación
    participant Page@{ "type": "control" } as Issue<br/>Page.vue
    participant Actions@{ "type": "control" } as useIssue<br/>Actions.ts
    participant Reader@{ "type": "control" } as useDocument<br/>Read.ts
    participant State@{ "type": "control" } as useList<br/>Editor.ts
    end
    box Reglas y datos
    participant Rules as issue<br/>Rules.ts
    end
    U->>Page: nowrap: open(row, mode)
    Page->>Actions: nowrap: actions.open(row, mode)
    opt nowrap: options.canRead()
        Actions->>Actions: nowrap: lastRequestedEditor = { row, mode }
        Actions->>Reader: nowrap: reader.load(row.id)
        Reader-->>Actions: nowrap: document
        opt nowrap: document
            alt nowrap: mode === 'edit' && options.canManage()
                Actions->>Rules: nowrap: resolveIssueEditMode(document)
                Rules-->>Actions: nowrap: resolved
            else nowrap: mode === 'edit'
                Actions->>Actions: nowrap: resolved = 'view'
            else
                Actions->>Actions: nowrap: resolved = mode
            end
            alt nowrap: resolved === 'supply' && (!options.canSupply() ||<br/>!canSupplyIssue(document))
                Actions->>Reader: nowrap: reader.readError.value = 'La salida<br/>cambió de estado. Actualiza el listado.'
            else nowrap: resolved === 'return' && (!options.canSupply() ||<br/>!canReturnIssue(document))
                Actions->>Reader: nowrap: reader.readError.value = 'La salida<br/>cambió de estado. Actualiza el listado.'
            else
                Actions->>Actions: nowrap: ++editorKey.value
                Actions->>State: nowrap: editorState.openEditor({ mode: resolved,<br/>document })
                State-->>Page: nowrap: editor
            end
        end
    end
```

## Escritura de creación, edición y encabezado

**Identificador:** `DIA-VUE-SEQ-027`.

```mermaid
sequenceDiagram
    autonumber
    box Coordinación
    participant Page@{ "type": "control" } as IssueEditor<br/>Page.vue
    participant Editor@{ "type": "control" } as useIssue<br/>Editor.ts
    participant Save@{ "type": "control" } as useRecord<br/>Save.ts
    end
    box Reglas y datos
    participant Mapper as issueRequest<br/>Mapper.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as issue<br/>Service.ts
    end
    Page->>Editor: nowrap: editor.submit()
    opt nowrap: !isDisabled()
        Editor->>Editor: nowrap: submitValidated()
        opt nowrap: isIssueWriteTarget(options.target)
            Editor->>Save: nowrap: save.execute(operation)
            Save->>Editor: nowrap: operation(controller.signal)
            Editor->>Mapper: nowrap: mapIssueFormToRequest(values,<br/>options.resource, target.mode)
            Mapper-->>Editor: nowrap: payload
            Editor->>Service: nowrap: issueService.save({ resource:<br/>options.resource, target, payload, signal<br/>})
            Service-->>Editor: nowrap: MutationConfirmation
            Editor-->>Save: nowrap: result
            opt nowrap: !controller.signal.aborted
                Save->>Page: nowrap: options.onSaved(result)
                Page->>Page: nowrap: emit('saved', result)
            end
        end
    end
```

## Fuentes de los participantes

[IssuePage.vue](../../../../../src/modules/issues/pages/IssuePage.vue),
[useIssueActions.ts](../../../../../src/modules/issues/composables/useIssueActions.ts),
[useDocumentRead.ts](../../../../../src/shared/composables/useDocumentRead.ts),
[useListEditor.ts](../../../../../src/shared/composables/useListEditor.ts),
[issueRules.ts](../../../../../src/modules/issues/issueRules.ts),
[IssueEditorPage.vue](../../../../../src/modules/issues/pages/IssueEditorPage.vue),
[useIssueEditor.ts](../../../../../src/modules/issues/composables/useIssueEditor.ts),
[useRecordSave.ts](../../../../../src/shared/composables/useRecordSave.ts),
[issueRequestMapper.ts](../../../../../src/modules/issues/mappers/issueRequestMapper.ts),
[issueService.ts](../../../../../src/modules/issues/services/issueService.ts).

## Secuencias relacionadas

[DIA-VUE-SEQ-042](05-issue-read-transport.md#documento-solicitado-y-documento-recibido), [DIA-VUE-SEQ-045](07-issue-save-transport.md#endpoint-y-confirmación-de-la-operación), [DIA-VUE-DOC-002](../../development/design-and-construction-patterns/08-document-responsibilities.md#secuencia-de-guardado-confirmado), [DIA-VUE-SEQ-051](../02-shared-runtime/08-record-save.md).
