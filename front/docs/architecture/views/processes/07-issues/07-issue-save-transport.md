# Salida: transporte de escritura y devolución

Continúa `SEQ-027`, `SEQ-016` y `SEQ-032`. El guardado general y la devolución
comparten transporte y confirmación, con endpoints y payloads específicos.

## Endpoint y confirmación de la operación

**Identificador:** `DIA-VUE-SEQ-045`. **Pregunta:** ¿Cuándo confirma el servicio una creación, edición, surtido o devolución?

**Lectura visual:** [roles y callbacks](../00-reading-and-roles.md).

```mermaid
sequenceDiagram
    autonumber
    box Reglas y datos
    participant Contract@{ "type": "control" } as record<br/>Contract.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as issue<br/>Service.ts
    participant HTTP@{ "type": "boundary" } as apiClient.ts
    end
    box Sistema externo
    participant API@{ "type": "boundary" } as API del sistema
    end
    alt creación
        Service->>HTTP: POST endpoint de artículos o merma
    else edición completa
        Service->>HTTP: PATCH documento/id
    else encabezado o surtido
        Service->>HTTP: PATCH documento/id/header o /details
    else devolución
        Service->>HTTP: PATCH documento/id/details/detailId/returns
    end
    HTTP->>API: petición con payload y signal
    API-->>HTTP: respuesta
    alt rechazo HTTP o red
        HTTP-->>Service: ApiError
    else respuesta JSON
        HTTP-->>Service: resultado
        Service->>Contract: confirmMutation(response, código del recurso y modo)
        Contract-->>Service: MutationConfirmation o ApiError
        Note over Contract,HTTP: Sólo una promesa resuelta permite onSaved en el coordinador
    end
```

## Fuentes de los participantes

[issueService.ts](../../../../../src/modules/issues/services/issueService.ts),
[recordContract.ts](../../../../../src/shared/http/recordContract.ts),
[apiClient.ts](../../../../../src/shared/http/apiClient.ts).
