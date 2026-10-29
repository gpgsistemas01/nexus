# Identidad: transporte de persona, cuenta y contraseña

Continúa las operaciones de `usePersonEditor` y `useUserEditor`. La selección del
payload ocurre en `identity.ts`; el servicio decide el endpoint y el código esperado.

## Petición y confirmación de identidad

**Identificador:** `DIA-VUE-SEQ-038`. **Pregunta:** ¿Qué cambia en HTTP al crear persona, editar cuenta o cambiar contraseña?

**Lectura visual:** [roles y callbacks](../00-reading-and-roles.md).

```mermaid
sequenceDiagram
    autonumber
    box Reglas y datos
    participant Contract@{ "type": "control" } as record<br/>Contract.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as identity<br/>Service.ts
    participant HTTP@{ "type": "boundary" } as apiClient.ts
    end
    box Sistema externo
    participant API@{ "type": "boundary" } as API del sistema
    end
    alt alta de persona o cuenta
        Service->>HTTP: request /api/admin/resource con POST
    else edición de persona
        Service->>HTTP: request /api/admin/persons/id con PUT
    else edición de cuenta
        Service->>HTTP: request /api/admin/users/id con PATCH
    else cambio de contraseña
        Service->>HTTP: request /api/admin/users/id/password con PATCH
    end
    HTTP->>API: petición con payload y signal recibidos
    API-->>HTTP: respuesta
    alt rechazo
        HTTP-->>Service: ApiError, save rechazada
    else respuesta JSON
        HTTP-->>Service: resultado
        Service->>Contract: confirmMutation(result, expected)
        Contract-->>Service: confirmación o ApiError
        Note over Service: save termina sin devolver una entidad de lectura
    end
```

## Fuentes de los participantes

[identityService.ts](../../../../../src/modules/identity/services/identityService.ts),
[recordContract.ts](../../../../../src/shared/http/recordContract.ts),
[apiClient.ts](../../../../../src/shared/http/apiClient.ts).
