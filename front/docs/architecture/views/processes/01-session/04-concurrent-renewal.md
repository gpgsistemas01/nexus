# Renovación compartida ante respuestas 401

**Casos relacionados:** CU-AUT-01 y consultas autenticadas.

## Escenario y contratos

**Identificador:** `DIA-VUE-SEQ-024`.

```mermaid
sequenceDiagram
    autonumber
    box Integración
    participant HTTP@{ "type": "boundary" } as apiClient.ts
    end
    box Sistema externo
    participant API@{ "type": "boundary" } as API del sistema
    end
    API-->>HTTP: nowrap: cause.response.status = 401, original = A
    HTTP->>HTTP: nowrap: original.hasRetried = true
    opt nowrap: refresh === null
        HTTP->>API: nowrap: POST /api/auth/refresh { requiresAuth:<br/>false }
    end
    API-->>HTTP: nowrap: cause.response.status = 401, original = B
    HTTP->>HTTP: nowrap: original.hasRetried = true
    HTTP->>HTTP: nowrap: await refresh
    API-->>HTTP: nowrap: response
    HTTP->>HTTP: nowrap: refresh = null
```

## Continuación de cada petición original

**Identificador:** `DIA-VUE-SEQ-028`.

```mermaid
sequenceDiagram
    autonumber
    box Integración
    participant Owner@{ "type": "boundary" } as purchase<br/>Service.ts
    participant HTTP@{ "type": "boundary" } as apiClient.ts
    end
    box Sistema externo
    participant API@{ "type": "boundary" } as API del sistema
    end
    HTTP->>HTTP: nowrap: await refresh
    alt nowrap: catch(cause)
        HTTP-->>Owner: nowrap: throw ApiError
    else nowrap: await refresh
        alt nowrap: original.signal?.aborted
            HTTP-->>Owner: nowrap: throw CanceledError
        else
            HTTP->>API: nowrap: GET original.url
            API-->>HTTP: nowrap: response
            HTTP-->>Owner: nowrap: response.data
        end
    end
```

## Fuentes de los participantes

[apiClient.ts](../../../../../src/shared/http/apiClient.ts),
[purchaseService.ts](../../../../../src/modules/purchases/services/purchaseService.ts).
