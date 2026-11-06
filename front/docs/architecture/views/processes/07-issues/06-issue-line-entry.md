# Salida: selección y agregado de detalles al borrador

## Construcción del detalle

**Identificador:** `DIA-VUE-SEQ-043`.

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    box Interfaz
    participant Form@{ "type": "boundary" } as IssueLine<br/>Entry<br/>Form.vue
    end
    box Coordinación
    participant Page@{ "type": "control" } as IssueLine<br/>Entry<br/>Page.vue
    participant Parent@{ "type": "control" } as IssueEditor<br/>Page.vue
    participant Line@{ "type": "control" } as useIssueLine<br/>Entry.ts
    participant Editor@{ "type": "control" } as useIssue<br/>Editor.ts
    end
    box Reglas y datos
    participant Details as issue<br/>Details.ts
    end
    U->>Form: nowrap: add
    Form->>Page: nowrap: emit('add')
    Page->>Line: nowrap: entry.add()
    opt nowrap: isEnabled.value
        Line->>Line: nowrap: validated()
        opt nowrap: selected.value && !selected.value.isDisabled
            Line->>Details: nowrap: createIssueDetailDraft(selected.value,<br/>Number(values.quantity), options.resource)
            Details-->>Line: nowrap: IssueDetail
            Line->>Page: nowrap: options.onAdd(line)
            Page->>Parent: nowrap: emit('add', line)
            Parent->>Editor: nowrap: editor.addDetail(line)
            Editor->>Details: nowrap: addIssueDetail(form.values.details, line)
            Details-->>Editor: nowrap: IssueDetail[]
            Editor->>Editor: nowrap: interaction.update('details', details)
            Line->>Line: nowrap: form.resetForm()
            Line->>Line: nowrap: items.updateSearch('')
        end
    end
```

## Fuentes de los participantes

[IssueLineEntryForm.vue](../../../../../src/modules/issues/components/IssueLineEntryForm.vue),
[IssueLineEntryPage.vue](../../../../../src/modules/issues/pages/IssueLineEntryPage.vue),
[IssueEditorPage.vue](../../../../../src/modules/issues/pages/IssueEditorPage.vue),
[useIssueLineEntry.ts](../../../../../src/modules/issues/composables/useIssueLineEntry.ts),
[useIssueEditor.ts](../../../../../src/modules/issues/composables/useIssueEditor.ts),
[issueDetails.ts](../../../../../src/modules/issues/issueDetails.ts).

## Secuencias relacionadas

[DIA-VUE-SEQ-010](../02-shared-runtime/03-remote-lookup.md#secuencia-aplicada).
