# Lectura de documento y descarte de respuestas sustituidas

**Casos relacionados:** aperturas de compra y salida, CU-ENT y CU-SAL.

## Escenario y contratos

**Identificador:** `DIA-VUE-SEQ-025`.

```mermaid
sequenceDiagram
    autonumber
    box Coordinación
    participant Actions@{ "type": "control" } as usePurchase<br/>Actions.ts
    participant Reader@{ "type": "control" } as useDocument<br/>Read.ts
    end
    box Reglas y datos
    participant Mapper as purchase<br/>Response<br/>Mapper.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as purchase<br/>Service.ts
    participant HTTP@{ "type": "boundary" } as apiClient.ts
    end
    box Sistema externo
    participant API@{ "type": "boundary" } as API del sistema
    end
    Actions->>Reader: nowrap: reader.load(row.id)
    Reader->>Reader: nowrap: attempt = ++sequence
    Reader->>Reader: nowrap: controller?.abort()
    Reader->>Actions: nowrap: options.request(id, current.signal)
    Actions->>Service: nowrap: purchaseService.get(options.resource, id,<br/>signal)
    Service->>HTTP: nowrap: apiClient.request(getPurchaseEndpoint(<br/>resource) + '/' + encodeURIComponent(id),<br/>{ signal })
    HTTP->>API: nowrap: GET<br/>/api/warehouse/goods-receipts/{resource}/{id}
    API-->>HTTP: nowrap: { goodsReceipt }
    HTTP-->>Service: nowrap: result
    Service->>Mapper: nowrap: normalizePurchaseDocument(<br/>result.goodsReceipt, resource)
    Mapper-->>Service: nowrap: document
    alt nowrap: document.id !== id
        Service-->>Actions: nowrap: throw Error
        Actions-->>Reader: nowrap: throw Error
        Reader->>Reader: nowrap: readError.value = cause.message
        Reader->>Actions: nowrap: options.onError(cause)
    else
        Service-->>Actions: nowrap: document
        Actions-->>Reader: nowrap: document
        opt nowrap: attempt === sequence && !current.signal.aborted
            Reader->>Reader: nowrap: document.value = result
            Reader-->>Actions: nowrap: result
        end
    end
```

## Lectura sustituida y recuperación

**Identificador:** `DIA-VUE-SEQ-029`.

```mermaid
sequenceDiagram
    autonumber
    box Coordinación
    participant Actions@{ "type": "control" } as usePurchase<br/>Actions.ts
    participant Reader@{ "type": "control" } as useDocument<br/>Read.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as purchase<br/>Service.ts
    end
    Actions->>Reader: nowrap: load(Y)
    Reader->>Reader: nowrap: requestedId = Y
    Reader->>Reader: nowrap: attempt = ++sequence
    Reader->>Reader: nowrap: controller?.abort()
    Service-->>Actions: nowrap: result_X
    Actions-->>Reader: nowrap: result_X
    alt nowrap: attempt_X !== sequence || current_X.signal.aborted
        Reader-->>Actions: nowrap: undefined
    end
```

## Fuentes de los participantes

[usePurchaseActions.ts](../../../../../src/modules/purchases/composables/usePurchaseActions.ts),
[useDocumentRead.ts](../../../../../src/shared/composables/useDocumentRead.ts),
[purchaseResponseMapper.ts](../../../../../src/modules/purchases/mappers/purchaseResponseMapper.ts),
[purchaseService.ts](../../../../../src/modules/purchases/services/purchaseService.ts),
[apiClient.ts](../../../../../src/shared/http/apiClient.ts).

## Secuencias relacionadas

[DIA-VUE-SEQ-042](../07-issues/05-issue-read-transport.md#documento-solicitado-y-documento-recibido).
