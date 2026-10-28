# Cierre de sesión y acceso posterior

## Escenario y contratos

**Casos relacionados:** CU-AUT-02.

**Fuente técnica:** AppNavigation.vue, Router y sessionRecovery.spec.ts.

## Secuencia aplicada

**Identificador:** `DIA-VUE-SEQ-020`.

**Lectura visual:** [líneas de vida, números y mensajes](../../diagram-reading.md#secuencias).

```mermaid
sequenceDiagram
    autonumber
    actor Usuario
    participant Menu@{ "type": "boundary" } as AppNavigation
    participant Browser@{ "type": "boundary" } as Navegador
    participant API@{ "type": "boundary" } as API
    participant Router@{ "type": "control" } as Router
    Usuario->>Menu: Cerrar sesión
    Menu->>Browser: submit de formulario POST
    Browser->>API: POST /cerrar-sesion con cookies
    API-->>Browser: eliminar cookies y redirigir al login
    Browser->>Router: cargar cliente y resolver login
    Router-->>Usuario: formulario de acceso
    Usuario->>Router: abrir otra URL protegida
    Router->>API: comprobar sesión mediante cliente HTTP
    API-->>Router: 401 tras renovación rechazada
    Router-->>Usuario: login con destino interno conservado
```

## Reglas y recuperación

El cierre elimina el acceso de ese navegador. No se afirma revocación central de cualquier copia previa del token. Una navegación completa recrea la instancia de sesión del cliente.

## Evidencia

sessionRecovery.spec.ts y application.spec.ts. La [matriz por caso](../../../../testing/04-use-case-coverage.md) identifica alcance y límites, y el [registro CP](../../../../testing/03-test-cases.md) concreta datos y oráculos críticos.
