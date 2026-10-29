# Salida: lectura y adaptación del documento

La apertura de `SEQ-015` configura el callback de lectura en `useIssueActions`.
El lector compartido protege la vigencia; el servicio comprueba la identidad recibida.

## Documento solicitado y documento recibido

**Identificador:** `DIA-VUE-SEQ-042`. **Pregunta:** ¿Qué colaboradores convierten una respuesta HTTP en IssueDocument?

**Lectura visual:** [roles y callbacks](../00-reading-and-roles.md).

```mermaid
sequenceDiagram
    autonumber
    box Coordinación
    participant Actions@{ "type": "control" } as useIssue<br/>Actions.ts
    participant Reader@{ "type": "control" } as useDocument<br/>Read.ts
    end
    box Reglas y datos
    participant Mapper@{ "type": "control" } as issue<br/>Response<br/>Mapper.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as issue<br/>Service.ts
    participant HTTP@{ "type": "boundary" } as apiClient.ts
    end
    box Sistema externo
    participant API@{ "type": "boundary" } as API del sistema
    end
    Reader->>Actions: request(id, signal) configurado por open
    Actions->>Service: get(resource, id, signal)
    Service->>HTTP: request por ID
    HTTP->>API: GET goods-issues/resource/id o waste-issues/id
    API-->>HTTP: goodsIssue o wasteIssue
    HTTP-->>Service: cuerpo JSON
    Service->>Mapper: normalizeIssueDocument(registro, resource)
    Mapper-->>Service: IssueDocument o error de contrato
    Service->>Service: comprobar document.id === id
    Service-->>Actions: documento o error
    Actions-->>Reader: resolver o rechazar callback
    Reader->>Reader: comprobar intento y señal
    Reader-->>Actions: documento vigente o undefined con error
```

## Fuentes de los participantes

[useIssueActions.ts](../../../../../src/modules/issues/composables/useIssueActions.ts),
[useDocumentRead.ts](../../../../../src/shared/composables/useDocumentRead.ts),
[issueResponseMapper.ts](../../../../../src/modules/issues/mappers/issueResponseMapper.ts),
[issueService.ts](../../../../../src/modules/issues/services/issueService.ts),
[apiClient.ts](../../../../../src/shared/http/apiClient.ts).
