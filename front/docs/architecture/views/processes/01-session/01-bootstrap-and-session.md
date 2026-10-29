# 1. Arranque y acceso protegido

## Secuencia de renovación

**Identificador:** `DIA-VUE-SEQ-001`.

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    box Coordinación
    participant Route@{ "type": "control" } as router/<br/>index.ts
    participant Session@{ "type": "control" } as session.ts
    end
    box Integración
    participant HTTP@{ "type": "boundary" } as apiClient.ts
    end
    box Sistema externo
    participant API@{ "type": "boundary" } as API del sistema
    end
    U->>Route: nowrap: to.fullPath
    Route->>Session: nowrap: session.load()
    Session->>HTTP: nowrap: request('/api/auth/me')
    HTTP->>API: nowrap: GET /api/auth/me
    API-->>HTTP: nowrap: status = 401
    HTTP->>API: nowrap: POST /api/auth/refresh
    alt nowrap: try
        API-->>HTTP: nowrap: response
        HTTP->>API: nowrap: GET /api/auth/me
        API-->>HTTP: nowrap: { user }
        HTTP-->>Session: nowrap: data
        Session->>Session: nowrap: user.value = { id, name, permissions }
        Session-->>Route: nowrap: user.value
        alt nowrap: typeof to.meta.permission === 'string' &&<br/>!user.permissions.includes(to.meta.permission)
            Route-->>U: nowrap: { name: 'forbidden', query: { returnTo:<br/>to.fullPath } }
        else
            Route-->>U: nowrap: to.fullPath
        end
    else nowrap: catch(cause), cause instanceof ApiError &&<br/>cause.status === 401
        API-->>HTTP: nowrap: status = 401
        HTTP-->>Session: nowrap: throw ApiError
        Session->>Session: nowrap: user.value = null
        Session-->>Route: nowrap: throw error
        Route-->>U: nowrap: { name: 'login', query: { returnTo:<br/>to.fullPath } }
    else nowrap: catch(cause)
        API-->>HTTP: nowrap: cause
        HTTP-->>Session: nowrap: throw ApiError
        Session->>Session: nowrap: user.value = null
        Session-->>Route: nowrap: throw error
        Route-->>U: nowrap: { name: 'session-unavailable', query: {<br/>returnTo: to.fullPath } }
    end
```

## Fuentes de los participantes

[index.ts](../../../../../src/app/router/index.ts),
[session.ts](../../../../../src/modules/auth/session.ts),
[apiClient.ts](../../../../../src/shared/http/apiClient.ts).
