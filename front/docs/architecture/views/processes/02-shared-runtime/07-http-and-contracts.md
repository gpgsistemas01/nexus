# Transporte y contratos compartidos

El cliente HTTP del sistema encapsula la biblioteca de transporte. Las figuras muestran
archivos propios; la tecnología utilizada se identifica en la guía de roles.

## Respuesta JSON y traducción de errores

**Identificador:** `DIA-VUE-SEQ-034`. **Pregunta:** ¿Qué comprueba el cliente antes de devolver una respuesta al servicio?

**Lectura visual:** [roles y callbacks](../00-reading-and-roles.md).

```mermaid
sequenceDiagram
    autonumber
    box Reglas y datos
    participant Error@{ "type": "control" } as apiError.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as purchase<br/>Service.ts
    participant HTTP@{ "type": "boundary" } as apiClient.ts
    end
    box Sistema externo
    participant API@{ "type": "boundary" } as API del sistema
    end
    Service->>HTTP: request(url, options)
    HTTP->>API: solicitud configurada con signal
    alt respuesta admitida
        API-->>HTTP: respuesta HTTP
        alt responseType blob
            HTTP-->>Service: Blob sin validación de contenido
        else JSON esperado
            HTTP->>HTTP: comprobar objeto de respuesta
            HTTP-->>Service: cuerpo o ApiError INVALID_RESPONSE
        end
    else rechazo de red o HTTP
        API-->>HTTP: fallo de transporte o estado rechazado
        alt cancelación
            HTTP-->>Service: propagar cancelación
        else error normalizable
            HTTP->>Error: normalizeApiError(cause)
            Error-->>HTTP: ApiError con status, code, fieldErrors y meta
            HTTP-->>Service: rechazar con ApiError
        end
    end
    Note over HTTP,API: La renovación de un 401 se desarrolla en SEQ-024 y SEQ-028
```

## Lectura paginada y adaptación de filas

**Identificador:** `DIA-VUE-SEQ-035`. **Pregunta:** ¿Quién comprueba los conteos y quién convierte cada registro de Directorio?

**Lectura visual:** [roles y callbacks](../00-reading-and-roles.md).

```mermaid
sequenceDiagram
    autonumber
    box Reglas y datos
    participant Contract@{ "type": "control" } as record<br/>Contract.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as directory<br/>Service.ts
    participant Paged@{ "type": "boundary" } as page<br/>Request.ts
    participant HTTP@{ "type": "boundary" } as apiClient.ts
    end
    box Sistema externo
    participant API@{ "type": "boundary" } as API del sistema
    end
    Note over Service: list(resource, query, signal) construye parámetros con recordParams
    Service->>Paged: requestPage(url, signal)
    Paged->>HTTP: request(url, signal)
    HTTP->>API: GET de clientes o proveedores
    API-->>HTTP: objeto con data y conteos
    HTTP-->>Paged: cuerpo JSON
    Paged->>Paged: validar array, filas y conteos enteros no negativos
    alt listado válido
        Paged-->>Service: PageResult
        loop por cada fila
            Service->>Service: normalizeEntry(resource, value)
            Service->>Contract: readRecord, readState y readText
            Contract-->>Service: campos comprobados o ApiError
        end
        Note over Service: Devuelve PageResult de DirectoryEntry al callback de SEQ-002
    else contrato de página inválido
        Paged-->>Service: ApiError, no sustituir por lista vacía
    end
```

## Aplicaciones del contrato paginado

`pageRequest.ts` comprueba la estructura de página. Cada servicio transforma sus
filas con el contrato del recurso; compartir paginación no vuelve intercambiables
los registros del negocio.

| Servicio | Propietario de la adaptación de filas |
| --- | --- |
| `catalogService.list` | `normalizeEntry` en `catalogService.ts`. |
| `directoryService.list` | `normalizeEntry` en `directoryService.ts`, con lectores de `recordContract.ts`. |
| `identityService.list` | `normalizeEntry` y `readAccesses` en `identityService.ts`. |
| `inventoryService.list` | `normalizeInventoryRow` en `inventoryMapper.ts`. |
| `purchaseService.list` | `normalizePurchaseRow` en `purchaseResponseMapper.ts`. |
| `issueService.list` | `normalizeIssueRow` en `issueResponseMapper.ts`. |
| `movementService.list` | Normalización del historial en `movementService.ts`. |

## Fuentes de los participantes

[purchaseService.ts](../../../../../src/modules/purchases/services/purchaseService.ts),
[apiClient.ts](../../../../../src/shared/http/apiClient.ts),
[apiError.ts](../../../../../src/shared/http/apiError.ts),
[directoryService.ts](../../../../../src/modules/directory/services/directoryService.ts),
[pageRequest.ts](../../../../../src/shared/http/pageRequest.ts),
[recordContract.ts](../../../../../src/shared/http/recordContract.ts).
