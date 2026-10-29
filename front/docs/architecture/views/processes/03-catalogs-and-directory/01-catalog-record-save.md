# Alta y edición de catálogos

**Casos relacionados:** CU-CAT-10/11/13/14/16/17/19/20/22/23/25/26; soporte de Directorio.

## Secuencia aplicada

**Identificador:** `DIA-VUE-SEQ-004`.

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    box Interfaz
    participant Form@{ "type": "boundary" } as Catalog<br/>Form.vue
    end
    box Coordinación
    participant Page@{ "type": "control" } as Catalog<br/>Editor<br/>Page.vue
    participant Editor@{ "type": "control" } as useCatalog<br/>Editor.ts
    participant Save@{ "type": "control" } as useRecord<br/>Save.ts
    end
    box Reglas y datos
    participant Payload as catalog.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as catalog<br/>Service.ts
    end
    U->>Form: nowrap: submit
    Form->>Page: nowrap: emit('submit')
    Page->>Editor: nowrap: editor.submit()
    opt nowrap: !form.isSubmitting.value && !save.isConflicted.value
        Editor->>Editor: nowrap: submitValidated()
        Editor->>Save: nowrap: save.execute(operation)
        Save->>Editor: nowrap: operation(controller.signal)
        Editor->>Payload: nowrap: buildCatalogPayload(catalog, target,<br/>values)
        Payload-->>Editor: nowrap: payload
        Editor->>Service: nowrap: catalogService.save(catalog, target,<br/>payload, signal)
        Service-->>Editor: nowrap: CatalogEntry
        Editor-->>Save: nowrap: result
        opt nowrap: !controller.signal.aborted
            Save->>Page: nowrap: options.onSaved(result)
            Page->>Page: nowrap: emit('saved')
        end
    end
```

## Transporte y registro confirmado

**Identificador:** `DIA-VUE-SEQ-036`.

```mermaid
sequenceDiagram
    autonumber
    box Reglas y datos
    participant Contract as record<br/>Contract.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as catalog<br/>Service.ts
    participant HTTP@{ "type": "boundary" } as apiClient.ts
    end
    box Sistema externo
    participant API@{ "type": "boundary" } as API del sistema
    end
    Service->>HTTP: nowrap: apiClient.request(url, { method:<br/>target.action === 'edit' ? 'PUT' : 'POST',<br/>data: payload, signal })
    HTTP->>API: nowrap: {method}<br/>/api/admin/catalogs/{catalog}[/{id}]
    API-->>HTTP: nowrap: { code, data }
    HTTP-->>Service: nowrap: result
    Service->>Contract: nowrap: confirmMutation(result, expected,<br/>errorMessage)
    alt nowrap: !isRecord(value) || value.code !== expected
        Contract-->>Service: nowrap: throw ApiError
    else
        Contract-->>Service: nowrap: { code: value.code, message:<br/>getSuccessMessage(value.code) }
        Service->>Service: nowrap: normalizeEntry(result.data, catalog)
        Service-->>Service: nowrap: { id, name, symbol, isActive, version }
    end
```

## Fuentes de los participantes

[CatalogForm.vue](../../../../../src/modules/catalogs/components/CatalogForm.vue),
[CatalogEditorPage.vue](../../../../../src/modules/catalogs/pages/CatalogEditorPage.vue),
[useCatalogEditor.ts](../../../../../src/modules/catalogs/composables/useCatalogEditor.ts),
[useRecordSave.ts](../../../../../src/shared/composables/useRecordSave.ts),
[catalog.ts](../../../../../src/modules/catalogs/catalog.ts),
[catalogService.ts](../../../../../src/modules/catalogs/services/catalogService.ts),
[recordContract.ts](../../../../../src/shared/http/recordContract.ts),
[apiClient.ts](../../../../../src/shared/http/apiClient.ts).

## Secuencias relacionadas

[DIA-VUE-SEQ-051](../02-shared-runtime/08-record-save.md).
