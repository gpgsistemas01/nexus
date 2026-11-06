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
        Reader->>Reader: nowrap: canRetry.value = isReadRetryable(cause)
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

## Cancelación desde el diálogo de lectura

**Identificador:** `DIA-VUE-SEQ-057`. Consulta de compra en curso que el usuario
cancela antes de recibir la respuesta. Salidas compone el mismo lector y diálogo.

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    box Presentación
    participant Dialog@{ "type": "boundary" } as DocumentReadDialog.vue
    participant Page@{ "type": "control" } as PurchasePage.vue
    end
    box Coordinación
    participant Actions@{ "type": "control" } as usePurchaseActions.ts
    participant Reader@{ "type": "control" } as useDocumentRead.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as purchaseService.ts
    end
    U->>Dialog: nowrap: Cancelar consulta
    Dialog->>Page: nowrap: emit('cancel')
    Page->>Actions: nowrap: actions.cancelRead()
    Actions->>Reader: nowrap: reader.close()
    Reader->>Reader: nowrap: ++sequence<br/>controller?.abort()
    Reader->>Reader: nowrap: isReading.value = false<br/>document.value = undefined<br/>readError.value = ''
    Page->>Dialog: nowrap: v-if="isReading || readError" = false
    opt nowrap: respuesta recibida después de cancelar
        Service-->>Actions: nowrap: result
        Actions-->>Reader: nowrap: result
        Reader->>Reader: nowrap: attempt !== sequence || current.signal.aborted
        Reader-->>Actions: nowrap: undefined
    end
```

## Fuentes de los participantes

[usePurchaseActions.ts](../../../../../src/modules/purchases/composables/usePurchaseActions.ts),
[useDocumentRead.ts](../../../../../src/shared/composables/useDocumentRead.ts),
[purchaseResponseMapper.ts](../../../../../src/modules/purchases/mappers/purchaseResponseMapper.ts),
[purchaseService.ts](../../../../../src/modules/purchases/services/purchaseService.ts),
[apiClient.ts](../../../../../src/shared/http/apiClient.ts).

[DocumentReadDialog.vue](../../../../../src/shared/components/DocumentReadDialog.vue)
recibe el estado y emite `retry`/`cancel`; no consulta HTTP. La página conecta el
reintento y el aborto del lector. Los rechazos de escritura permanecen en su formulario.

## Secuencias relacionadas

[DIA-VUE-SEQ-042](../07-issues/05-issue-read-transport.md#documento-solicitado-y-documento-recibido).
