# Transporte y contratos compartidos

## Respuesta JSON y traducción de errores

**Identificador:** `DIA-VUE-SEQ-034`.

```mermaid
sequenceDiagram
    autonumber
    box Reglas y datos
    participant Error as apiError.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as purchase<br/>Service.ts
    participant HTTP@{ "type": "boundary" } as apiClient.ts
    end
    box Sistema externo
    participant API@{ "type": "boundary" } as API del sistema
    end
    Service->>HTTP: nowrap: apiClient.request(url, options)
    HTTP->>API: nowrap: http.request({ ...options, url })
    alt nowrap: try
        API-->>HTTP: nowrap: response
        alt nowrap: options.responseType === 'blob'
            HTTP-->>Service: nowrap: response.data
        else nowrap: !isRecord(response.data)
            HTTP-->>Service: nowrap: throw ApiError { status: response.status,<br/>code: 'INVALID_RESPONSE' }
        else
            HTTP-->>Service: nowrap: response.data
        end
    else nowrap: catch(cause)
        API-->>HTTP: nowrap: cause
        alt nowrap: axios.isCancel(cause)
            HTTP-->>Service: nowrap: throw cause
        else
            HTTP->>Error: nowrap: normalizeApiError(cause)
            Error-->>HTTP: nowrap: ApiError
            HTTP-->>Service: nowrap: throw ApiError
        end
    end
```

## Lectura paginada y adaptación de filas

**Identificador:** `DIA-VUE-SEQ-035`.

```mermaid
sequenceDiagram
    autonumber
    box Reglas y datos
    participant Contract as record<br/>Contract.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as directory<br/>Service.ts
    participant Paged@{ "type": "boundary" } as page<br/>Request.ts
    participant HTTP@{ "type": "boundary" } as apiClient.ts
    end
    box Sistema externo
    participant API@{ "type": "boundary" } as API del sistema
    end
    Service->>Paged: nowrap: requestPage(<br/>DIRECTORY_CONFIG[resource].path + '?' +<br/>recordParams(query), signal)
    Paged->>HTTP: nowrap: apiClient.request(url, { signal })
    HTTP->>API: nowrap: GET {url}
    API-->>HTTP: nowrap: { data, recordsFiltered, recordsTotal }
    HTTP-->>Paged: nowrap: page
    alt nowrap: !Array.isArray(page.data) || !page.data.every(<br/>isRecord)
        Paged-->>Service: nowrap: throw ApiError
    else nowrap: !Number.isSafeInteger(page.recordsFiltered) ||<br/>page.recordsFiltered < 0
        Paged-->>Service: nowrap: throw ApiError
    else nowrap: !Number.isSafeInteger(page.recordsTotal) ||<br/>page.recordsTotal < 0
        Paged-->>Service: nowrap: throw ApiError
    else
        Paged-->>Service: nowrap: page
        loop nowrap: value of result.data
            Service->>Service: nowrap: normalizeEntry(resource, value)
            Service->>Contract: nowrap: readRecord(value)
            Contract-->>Service: nowrap: row
            Service->>Contract: nowrap: readState(row)
            Contract-->>Service: nowrap: row.isActive
            Service->>Contract: nowrap: readText(row, field)
            Contract-->>Service: nowrap: row[field]
        end
    end
```

## Fuentes de los participantes

[purchaseService.ts](../../../../../src/modules/purchases/services/purchaseService.ts),
[apiClient.ts](../../../../../src/shared/http/apiClient.ts),
[apiError.ts](../../../../../src/shared/http/apiError.ts),
[directoryService.ts](../../../../../src/modules/directory/services/directoryService.ts),
[pageRequest.ts](../../../../../src/shared/http/pageRequest.ts),
[recordContract.ts](../../../../../src/shared/http/recordContract.ts).

## Secuencias relacionadas

[DIA-VUE-SEQ-024](../01-session/04-concurrent-renewal.md#escenario-y-contratos), [DIA-VUE-SEQ-028](../01-session/04-concurrent-renewal.md#continuación-de-cada-petición-original), [DIA-VUE-SEQ-002](01-list-and-record-save.md#consulta-remota).
