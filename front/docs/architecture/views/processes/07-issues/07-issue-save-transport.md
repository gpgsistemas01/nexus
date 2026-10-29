# Salida: transporte de escritura y devolución

## Endpoint y confirmación de la operación

**Identificador:** `DIA-VUE-SEQ-045`.

```mermaid
sequenceDiagram
    autonumber
    box Reglas y datos
    participant Contract as record<br/>Contract.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as issue<br/>Service.ts
    participant HTTP@{ "type": "boundary" } as apiClient.ts
    end
    box Sistema externo
    participant API@{ "type": "boundary" } as API del sistema
    end
    alt nowrap: target.mode === 'create'
        Service->>HTTP: nowrap: apiClient.request(url, { method: 'POST',<br/>data: payload, signal })
    else nowrap: target.mode === 'header'
        Service->>HTTP: nowrap: apiClient.request(url + '/header', {<br/>method: 'PATCH', data: payload, signal })
    else nowrap: target.mode === 'supply'
        Service->>HTTP: nowrap: apiClient.request(url + '/details', {<br/>method: 'PATCH', data: payload, signal })
    else
        Service->>HTTP: nowrap: apiClient.request(url, { method: 'PATCH',<br/>data: payload, signal })
    end
    HTTP->>API: nowrap: {method} {url}
    API-->>HTTP: nowrap: { code }
    HTTP-->>Service: nowrap: response
    Service->>Contract: nowrap: confirmMutation(response,<br/>ISSUE_SUCCESS_CODES[resource === 'wastes'<br/>? 'wastes' : 'goods'][isCreating ?<br/>'created' : 'updated'])
    alt nowrap: value.code !== expected
        Contract-->>Service: nowrap: throw ApiError
    else
        Contract-->>Service: nowrap: { code: value.code, message:<br/>getSuccessMessage(value.code) }
    end
```

## returnDetail(options)

**Identificador:** `DIA-VUE-SEQ-052`.

```mermaid
sequenceDiagram
    autonumber
    box Reglas y datos
    participant Contract as record<br/>Contract.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as issue<br/>Service.ts
    participant HTTP@{ "type": "boundary" } as apiClient.ts
    end
    box Sistema externo
    participant API@{ "type": "boundary" } as API del sistema
    end
    Service->>HTTP: nowrap: apiClient.request(url, { method: 'PATCH',<br/>data: payload, signal })
    HTTP->>API: nowrap: PATCH<br/>/{documentId}/details/{detailId}/returns
    API-->>HTTP: nowrap: { code }
    HTTP-->>Service: nowrap: response
    Service->>Contract: nowrap: confirmMutation(response,<br/>ISSUE_SUCCESS_CODES[resource === 'wastes'<br/>? 'wastes' : 'goods'].updated)
    alt nowrap: value.code !== expected
        Contract-->>Service: nowrap: throw ApiError
    else
        Contract-->>Service: nowrap: { code: value.code, message:<br/>getSuccessMessage(value.code) }
    end
```

## Fuentes de los participantes

[issueService.ts](../../../../../src/modules/issues/services/issueService.ts),
[recordContract.ts](../../../../../src/shared/http/recordContract.ts),
[apiClient.ts](../../../../../src/shared/http/apiClient.ts).

## Secuencias relacionadas

[DIA-VUE-SEQ-027](01-issue-open-save.md#escritura-de-creación-edición-y-encabezado), [DIA-VUE-SEQ-016](02-issue-supply.md#secuencia-aplicada), [DIA-VUE-SEQ-032](03-issue-return.md#ejecución-del-callback-y-resultado).
