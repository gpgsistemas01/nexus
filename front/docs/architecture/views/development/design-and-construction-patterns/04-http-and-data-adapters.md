# 4. Adaptadores HTTP y de datos

## Propósito y funcionamiento

El servicio del recurso prepara la solicitud HTTP y comprueba la respuesta de su
operación. Un mapper transforma el JSON recibido en un modelo que el editor o la
tabla pueden utilizar. `apiClient` aporta el transporte y la recuperación de sesión.
Estas tres responsabilidades permiten localizar un error de comunicación, un dato
inválido o una incompatibilidad de formato en su propietario.

## Modelo general de adaptación de una lectura

**Identificador:** `DIA-VUE-GEN-003`. **Pregunta:** ¿cómo convertir una respuesta
externa en un modelo del cliente? **Fuente:** servicios, mappers y transporte
existentes. Secuencia conceptual de lectura, transformación y aceptación.

**Lectura visual:** [llamadas, retornos y alternativas](../../diagram-reading.md#secuencias).

```mermaid
sequenceDiagram
    autonumber
    participant Consumer@{ "type": "control" } as Consumidor
    participant Service@{ "type": "boundary" } as Servicio del recurso
    participant Transport@{ "type": "boundary" } as Transporte compartido
    participant Mapper as Mapper de respuesta
    Consumer->>Service: nowrap: consultar recurso e identidad
    Service->>Transport: nowrap: solicitar respuesta con signal
    Transport-->>Service: nowrap: datos externos
    Service->>Mapper: nowrap: comprobar y transformar datos
    alt nowrap: estructura inválida
        Mapper-->>Service: nowrap: error de respuesta
        Service-->>Consumer: nowrap: rechazo
    else nowrap: estructura válida
        Mapper-->>Service: nowrap: modelo del cliente
        alt nowrap: identidad solicitada
            Service-->>Consumer: nowrap: modelo admitido
        else nowrap: identidad distinta
            Service-->>Consumer: nowrap: rechazo de identidad
        end
    end
```

## Aplicación al consultar una compra

**Identificador:** `DIA-VUE-APL-003`. **Pregunta:** ¿quién garantiza que se presenta
la compra solicitada? **Fuente:** `usePurchaseActions`, `purchaseService.get`,
`apiClient` y `normalizePurchaseDocument`. Secuencia del callback de lectura y sus
condiciones de aceptación. La renovación de sesión pertenece al transporte.

```mermaid
sequenceDiagram
    autonumber
    participant Actions@{ "type": "control" } as usePurchase<br/>Actions.ts
    participant Service@{ "type": "boundary" } as purchase<br/>Service.ts
    participant Http@{ "type": "boundary" } as apiClient.ts
    participant Mapper as purchaseResponse<br/>Mapper.ts
    Actions->>Service: nowrap: purchaseService.get(resource,<br/>id, signal)
    Service->>Http: nowrap: request(endpoint/id, { signal<br/>})
    Http-->>Service: nowrap: { goodsReceipt: unknown }
    Service->>Mapper: nowrap: normalizePurchaseDocument(result.goodsReceipt,<br/>resource)
    alt nowrap: estructura inválida
        Mapper-->>Service: nowrap: error
        Service-->>Actions: nowrap: rechazo de la lectura
    else nowrap: estructura válida
        Mapper-->>Service: nowrap: document: PurchaseDocument
        alt nowrap: document.id === id
            Service-->>Actions: nowrap: document
        else nowrap: document.id !== id
            Service-->>Actions: nowrap: Error de compra distinta a la<br/>solicitada
        end
    end
```

## Código, contrato y límites

Las [condiciones de aceptación HTTP](../../../contracts/client-contracts.md#escrituras-y-confirmación)
se definen en el contrato del cliente. La
[composición de documentos](08-document-responsibilities.md#propietarios-del-código)
ubica los adaptadores de lectura y escritura.

[purchaseTest](../../../../../tests/unit/modules/purchases/purchaseTest.ts) comprueba modelos
y solicitudes; [apiClientTest](../../../../../tests/unit/shared/http/apiClientTest.ts)
comprueba transporte/sesión.
