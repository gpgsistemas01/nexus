# 1. Arranque y acceso protegido

## Participantes y preparación

`main.ts` crea aplicación, carga Vuetify, crea sesión/Router, proporciona sesión,
instala Router, espera su resolución inicial y monta. Un fallo del arranque presenta
`StartupErrorPage`. La guarda de una ruta protegida usa la misma sesión que las páginas.
`createAuthSession` deduplica una carga pendiente y valida identidad/permisos recibidos.

## Secuencia de renovación

**ID:** `DIA-VUE-SEQ-001`. **Pregunta:** ¿cómo se recupera una URL protegida con access
vencido? **Fuente:** `main.ts`, Router, `modules/auth/session.ts` y `apiClient.ts`.
Participantes funcionales del cliente y API externa; flechas continuas = petición,
discontinuas = respuesta. El escenario supone cookie de renovación disponible.

**Lectura visual:** [líneas de vida, números y mensajes](../../diagram-reading.md#secuencias).

```mermaid
sequenceDiagram
    autonumber
    actor Usuario
    participant Router@{ "type": "control" } as Router
    participant Sesion@{ "type": "control" } as createAuthSession
    participant HTTP@{ "type": "boundary" } as apiClient
    participant API@{ "type": "boundary" } as API del sistema
    Usuario->>Router: abrir URL protegida
    Router->>Sesion: load()
    Sesion->>HTTP: GET /api/auth/me
    HTTP->>API: solicitud con cookies del navegador
    API-->>HTTP: 401
    HTTP->>API: POST /api/auth/refresh
    alt renovación admitida
        API-->>HTTP: confirmación y cookie de acceso
        HTTP->>API: repetir una vez GET /api/auth/me
        API-->>HTTP: usuario y permisos
        HTTP-->>Sesion: contrato validable
        Sesion-->>Router: identidad readonly
        Router-->>Usuario: ruta autorizada o acceso no permitido
    else renovación rechazada
        API-->>HTTP: 401 definitivo
        HTTP-->>Router: error de acceso
        Router-->>Usuario: login con retorno interno
    else servicio no disponible
        API-->>HTTP: red o 5xx
        HTTP-->>Router: error recuperable
        Router-->>Usuario: sesión no disponible y reintento
    end
```

## Concurrencia y recuperación

El cliente mantiene una promesa de refresh para solicitudes protegidas concurrentes;
cada petición se reintenta como máximo una vez. Login y refresh desactivan esa
recuperación para evitar ciclos. La sesión descarta identidad al fallar la carga.
`AccessErrorPage` bloquea doble reintento, informa fallo/espera y vuelve al destino
preservado. La guarda vuelve a comprobar sus permisos.

## Evidencia

Casos `CU-AUT-01/02`, diseños de sesión, `apiClientTest.ts`, `routerTest.ts`,
`sessionRecovery.spec.ts` y el representante real de sistema. El registro de pruebas
separa renovación simulada de cookies/servidor reales.
