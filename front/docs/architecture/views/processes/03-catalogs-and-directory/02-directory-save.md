# Directorio: alta, edición y retorno de opción

## Secuencia aplicada

**Identificador:** `DIA-VUE-SEQ-022`.

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    box Interfaz
    participant Form@{ "type": "boundary" } as Directory<br/>Form.vue
    end
    box Coordinación
    participant Page@{ "type": "control" } as Directory<br/>Editor<br/>Page.vue
    participant Editor@{ "type": "control" } as useDirectory<br/>Editor.ts
    participant Record@{ "type": "control" } as useRecord<br/>Form.ts
    participant Save@{ "type": "control" } as useRecord<br/>Save.ts
    end
    box Reglas y datos
    participant Payload as directory.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as directory<br/>Service.ts
    end
    U->>Form: nowrap: submit
    Form->>Page: nowrap: emit('submit')
    Page->>Record: nowrap: editor.submit()
    opt nowrap: !isDisabled()
        Record->>Record: nowrap: validated()
        Record->>Save: nowrap: save.execute(operation)
        Save->>Record: nowrap: operation(controller.signal)
        Record->>Editor: nowrap: operation(values, signal)
        Editor->>Payload: nowrap: directoryPayload(options.resource,<br/>options.target, values)
        Payload-->>Editor: nowrap: payload
        Editor->>Service: nowrap: directoryService.save(options.resource,<br/>options.target, payload, signal)
        Service-->>Editor: nowrap: DirectoryEntry
        Editor-->>Record: nowrap: DirectoryEntry
        Record-->>Save: nowrap: DirectoryEntry
        opt nowrap: !controller.signal.aborted
            Save->>Page: nowrap: options.onSaved(result)
            Page->>Page: nowrap: emit('saved', entry)
        end
    end
```

## Transporte y retorno del registro

**Identificador:** `DIA-VUE-SEQ-037`.

```mermaid
sequenceDiagram
    autonumber
    box Reglas y datos
    participant Contract as record<br/>Contract.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as directory<br/>Service.ts
    participant HTTP@{ "type": "boundary" } as apiClient.ts
    end
    box Sistema externo
    participant API@{ "type": "boundary" } as API del sistema
    end
    Service->>HTTP: nowrap: apiClient.request(url, { method:<br/>target.action === 'edit' ? 'PUT' : 'POST',<br/>data: payload, signal })
    HTTP->>API: nowrap: {method}<br/>{DIRECTORY_CONFIG[resource].path}[/{id}]
    API-->>HTTP: nowrap: { code, client, supplier }
    HTTP-->>Service: nowrap: result
    Service->>Contract: nowrap: confirmMutation(result,<br/>mutationCodes[resource][target.action])
    alt nowrap: value.code !== expected
        Contract-->>Service: nowrap: throw ApiError
    else
        Contract-->>Service: nowrap: MutationConfirmation
        Service->>Service: nowrap: normalizeEntry(resource, result[resource<br/>=== 'clients' ? 'client' : 'supplier'])
        Service->>Contract: nowrap: readRecord(value)
        Contract-->>Service: nowrap: row
        Service->>Contract: nowrap: readState(row)
        Contract-->>Service: nowrap: row.isActive
        Service->>Contract: nowrap: readText(row, resource === 'clients' ?<br/>'name' : 'tradeName')
        Contract-->>Service: nowrap: row[field]
    end
```

## Fuentes de los participantes

[DirectoryForm.vue](../../../../../src/modules/directory/components/DirectoryForm.vue),
[DirectoryEditorPage.vue](../../../../../src/modules/directory/pages/DirectoryEditorPage.vue),
[useDirectoryEditor.ts](../../../../../src/modules/directory/composables/useDirectoryEditor.ts),
[useRecordForm.ts](../../../../../src/shared/composables/useRecordForm.ts),
[useRecordSave.ts](../../../../../src/shared/composables/useRecordSave.ts),
[directory.ts](../../../../../src/modules/directory/directory.ts),
[directoryService.ts](../../../../../src/modules/directory/services/directoryService.ts),
[recordContract.ts](../../../../../src/shared/http/recordContract.ts),
[apiClient.ts](../../../../../src/shared/http/apiClient.ts).

## Secuencias relacionadas

[DIA-VUE-SEQ-051](../02-shared-runtime/08-record-save.md).
