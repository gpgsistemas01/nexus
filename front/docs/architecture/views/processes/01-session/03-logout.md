# Cierre de sesión y acceso posterior

**Casos relacionados:** CU-AUT-02.

## Secuencia aplicada

**Identificador:** `DIA-VUE-SEQ-020`.

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    box Interfaz
    participant Menu@{ "type": "boundary" } as App<br/>Navigation.vue
    end
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
    U->>Menu: nowrap: submit
    Menu->>API: nowrap: POST /cerrar-sesion
    API-->>U: nowrap: Set-Cookie, Location
    U->>Route: nowrap: to.fullPath
    Route->>Session: nowrap: session.load()
    Session->>HTTP: nowrap: request('/api/auth/me')
    HTTP->>API: nowrap: GET /api/auth/me
    API-->>HTTP: nowrap: status = 401
    HTTP->>API: nowrap: POST /api/auth/refresh
    API-->>HTTP: nowrap: status = 401
    HTTP-->>Session: nowrap: throw ApiError
    Session->>Session: nowrap: user.value = null
    Session-->>Route: nowrap: throw error
    Route-->>U: nowrap: { name: 'login', query: { returnTo:<br/>to.fullPath } }
```

## Fuentes de los participantes

[AppNavigation.vue](../../../../../src/app/components/AppNavigation.vue),
[index.ts](../../../../../src/app/router/index.ts),
[session.ts](../../../../../src/modules/auth/session.ts),
[apiClient.ts](../../../../../src/shared/http/apiClient.ts).
