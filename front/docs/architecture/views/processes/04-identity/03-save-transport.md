# Identidad: transporte de persona, cuenta y contraseña

## Petición y confirmación de identidad

**Identificador:** `DIA-VUE-SEQ-038`.

```mermaid
sequenceDiagram
    autonumber
    box Reglas y datos
    participant Contract as record<br/>Contract.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as identity<br/>Service.ts
    participant HTTP@{ "type": "boundary" } as apiClient.ts
    end
    box Sistema externo
    participant API@{ "type": "boundary" } as API del sistema
    end
    alt nowrap: target.action === 'create'
        Service->>HTTP: nowrap: apiClient.request('/api/admin/' +<br/>resource, { method: 'POST', data: payload,<br/>signal })
    else nowrap: resource === 'persons'
        Service->>HTTP: nowrap: apiClient.request('/api/admin/persons/' +<br/>target.row.id, { method: 'PUT', data:<br/>payload, signal })
    else nowrap: target.action === 'password'
        Service->>HTTP: nowrap: apiClient.request('/api/admin/users/' +<br/>target.row.id + '/password', { method:<br/>'PATCH', data: payload, signal })
    else
        Service->>HTTP: nowrap: apiClient.request('/api/admin/users/' +<br/>target.row.id, { method: 'PATCH', data:<br/>payload, signal })
    end
    HTTP->>API: nowrap: { method, url, data: payload }
    API-->>HTTP: nowrap: { code }
    HTTP-->>Service: nowrap: result
    Service->>Contract: nowrap: confirmMutation(result, expected)
    alt nowrap: value.code !== expected
        Contract-->>Service: nowrap: throw ApiError
    else
        Contract-->>Service: nowrap: MutationConfirmation
        Service-->>Service: nowrap: undefined
    end
```

## Fuentes de los participantes

[identityService.ts](../../../../../src/modules/identity/services/identityService.ts),
[recordContract.ts](../../../../../src/shared/http/recordContract.ts),
[apiClient.ts](../../../../../src/shared/http/apiClient.ts).
