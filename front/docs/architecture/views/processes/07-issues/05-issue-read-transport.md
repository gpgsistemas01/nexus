# Salida: lectura y adaptación del documento

## Documento solicitado y documento recibido

**Identificador:** `DIA-VUE-SEQ-042`.

```mermaid
sequenceDiagram
    autonumber
    box Coordinación
    participant Actions@{ "type": "control" } as useIssue<br/>Actions.ts
    participant Reader@{ "type": "control" } as useDocument<br/>Read.ts
    end
    box Reglas y datos
    participant Mapper as issue<br/>Response<br/>Mapper.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as issue<br/>Service.ts
    participant HTTP@{ "type": "boundary" } as apiClient.ts
    end
    box Sistema externo
    participant API@{ "type": "boundary" } as API del sistema
    end
    Reader->>Actions: nowrap: options.request(id, current.signal)
    Actions->>Service: nowrap: issueService.get(options.resource, id,<br/>signal)
    Service->>HTTP: nowrap: apiClient.request(getIssueEndpoint(<br/>resource) + '/' + encodeURIComponent(id),<br/>{ signal })
    HTTP->>API: nowrap: GET {url}
    API-->>HTTP: nowrap: { goodsIssue, wasteIssue }
    HTTP-->>Service: nowrap: result
    Service->>Mapper: nowrap: normalizeIssueDocument(result[resource<br/>=== 'wastes' ? 'wasteIssue' :<br/>'goodsIssue'], resource)
    Mapper-->>Service: nowrap: document
    alt nowrap: document.id !== id
        Service-->>Actions: nowrap: throw Error
        Actions-->>Reader: nowrap: throw Error
        Reader->>Reader: nowrap: readError.value = cause.message
        Reader->>Actions: nowrap: options.onError(cause)
    else
        Service-->>Actions: nowrap: document
        Actions-->>Reader: nowrap: document
        opt nowrap: attempt === sequence && !current.signal.aborted
            Reader->>Reader: nowrap: document.value = result
            Reader-->>Actions: nowrap: result
        end
    end
```

## Fuentes de los participantes

[useIssueActions.ts](../../../../../src/modules/issues/composables/useIssueActions.ts),
[useDocumentRead.ts](../../../../../src/shared/composables/useDocumentRead.ts),
[issueResponseMapper.ts](../../../../../src/modules/issues/mappers/issueResponseMapper.ts),
[issueService.ts](../../../../../src/modules/issues/services/issueService.ts),
[apiClient.ts](../../../../../src/shared/http/apiClient.ts).

## Secuencias relacionadas

[DIA-VUE-SEQ-015](01-issue-open-save.md#apertura-y-resolución-del-modo).
