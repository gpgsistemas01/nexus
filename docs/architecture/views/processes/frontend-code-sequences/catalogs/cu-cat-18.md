<a id="cu-cat-18"></a>
# `CU-CAT-18` — Consultar unidad de medida

**Patrones:** `FE-P03`.

## Participantes y trazabilidad

Los nombres breves del diagrama corresponden a los archivos vinculados siguientes.
La ruta completa se conserva en cada enlace, fuera de la cabecera visual. Un participante
puede agrupar colaboradores del mismo rol; esa agrupación no implica una clase ni un
proceso independiente. Los retornos representan el resultado o error propagado.

| Alias | Rol visual | Archivos de implementación |
| --- | --- | --- |
| `View` | boundary | [`catalogDatatable.js`](../../../../../../src/public/js/plugins/datatable/admin/catalogs/catalogDatatable.js) |
| `Application` | control | [`catalogs.js`](../../../../../../src/public/js/application/admin/catalogs/catalogs.js) |
| `Request` | boundary | [`catalogService.js`](../../../../../../src/public/js/services/admin/catalogService.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `Transport` | control | [`catalogApiRoute.js`](../../../../../../src/routes/api/admin/catalogApiRoute.js)<br/>[`catalogController.js`](../../../../../../src/controllers/api/admin/catalogController.js) |

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Administrador del sistema
    participant Browser as Navegador
    participant View@{ "type": "boundary" } as Pantalla / formulario
    participant Application@{ "type": "control" } as Application
    participant Request@{ "type": "boundary" } as Requests del recurso
    participant HTTP@{ "type": "boundary" } as Cliente HTTP
    participant Transport@{ "type": "control" } as Endpoint API

    Initiator->>Browser: inicia CU-CAT-18 — Consultar unidad de medida
    Browser->>View: abrir y cargar la tabla del catálogo
    View->>Application: getAllCatalogEntries({ params, catalog })
    activate Application
    Application->>Request: getCatalogEntriesRequest({ params, catalog })
    Request->>HTTP: apiRequest({ method: 'get', url, params })
    HTTP->>Transport: consume GET /api/admin/catalogs/unit-measures
    alt Respuesta exitosa
        Transport-->>HTTP: HTTP 200 { data, recordsTotal, recordsFiltered }
        HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
        Request-->>Application: getCatalogEntriesRequest(): Promise[AxiosResponse]
        Application-->>View: getAllCatalogEntries(): Promise[AxiosResponse]
        View-->>Browser: DOM o DataTable actualizado con response.data
    else Respuesta rechazada
        Transport-->>HTTP: HTTP de error — respuesta del endpoint
        HTTP-->>Request: apiRequest(): throw { status: number, data: Object | null, message: string, raw: Error }
        Request-->>Application: throw { status: number, data: Object | null, message: string, raw: Error }
        Application-->>View: throw { status: number, data: Object | null, message: string, raw: Error }
        View-->>Browser: formulario o filtros conservados, mensaje visible
    end
    deactivate Application
```

