# Cierre de sesión y acceso posterior

## Escenario y contratos

**Casos relacionados:** CU-AUT-02.

## Secuencia aplicada

**Identificador:** `DIA-VUE-SEQ-020`.

**Lectura visual:** [líneas de vida, números y mensajes](../../diagram-reading.md#secuencias).

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario autorizado
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
    U->>Menu: Cerrar sesión
    Menu->>API: formulario POST /cerrar-sesion
    API-->>U: cookies eliminadas y redirección al login
    Note over Menu,API: Envío HTML completo, no usa apiClient para cerrar sesión
    U->>Route: abrir otra URL protegida
    Route->>Session: load() de la nueva instancia
    Session->>HTTP: request /api/auth/me
    HTTP->>API: GET /api/auth/me
    API-->>HTTP: 401
    HTTP->>API: POST /api/auth/refresh
    API-->>HTTP: 401 definitivo
    HTTP-->>Session: ApiError 401
    Session-->>Route: error, user vacío
    Route-->>U: login con destino interno conservado
```

## Reglas y recuperación

El cierre elimina el acceso de ese navegador. No se afirma revocación central de cualquier copia previa del token. Una navegación completa recrea la instancia de sesión del cliente.

## Evidencia

sessionRecovery.spec.ts y application.spec.ts. La [matriz por caso](../../../../testing/04-use-case-coverage.md) identifica alcance y límites, y el [registro CP](../../../../testing/03-test-cases.md) concreta datos y oráculos críticos.

## Fuentes de los participantes

[AppNavigation.vue](../../../../../src/app/components/AppNavigation.vue),
[index.ts](../../../../../src/app/router/index.ts),
[session.ts](../../../../../src/modules/auth/session.ts),
[apiClient.ts](../../../../../src/shared/http/apiClient.ts).
