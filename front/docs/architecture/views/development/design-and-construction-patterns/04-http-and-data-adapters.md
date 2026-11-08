# 4. Adaptadores HTTP y de datos

## Propósito y funcionamiento

El servicio prepara la solicitud y valida la respuesta; el mapper transforma el JSON al
modelo de tabla o formulario. `apiClient` transporta HTTP y recupera la sesión. Cada
responsabilidad tiene un propietario.

| Colaborador compartido | Responsabilidad |
| --- | --- |
| `API_PATHS` | Rutas de recursos y reportes. Las mismas direcciones sirven a listados, formularios y selectores. |
| `pageParams`, `lookupParams`, `recordParams` | Paginación, búsqueda y orden; el servicio añade los filtros de su operación. |
| `apiClient` | Única instancia Axios, timeout, cancelación, recuperación de conexión, renovación y normalización de errores. |
| `requestPage`, `requestExcel` | Validar el sobre paginado o el archivo descargado antes de entregarlo al servicio. |

Los métodos, payloads y mappers siguen en su dominio: una devolución y una edición
de compra tienen contratos distintos. La API de Express/OpenAPI define esos contratos;
el catálogo de rutas sólo localiza lo que consume Vue.

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
