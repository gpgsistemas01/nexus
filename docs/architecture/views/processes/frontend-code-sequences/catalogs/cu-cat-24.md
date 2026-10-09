<a id="cu-cat-24"></a>
# `CU-CAT-24` — Consultar estado de cumplimiento

**Patrones:** `FE-P03`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `View` | boundary | [`catalogDatatable.js`](../../../../../../src/public/js/plugins/datatable/admin/catalogs/catalogDatatable.js) |
| `Application` | control | [`createCrudApplication.js`](../../../../../../src/public/js/application/createCrudApplication.js) |
| `Request` | boundary | [`catalogService.js`](../../../../../../src/public/js/services/admin/catalogService.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `Transport` | control | [`catalogApiRoute.js`](../../../../../../src/routes/api/admin/catalogApiRoute.js) |

### Configuración y archivos de contexto

El endpoint queda representado por su router. El controller asociado se desarrolla en la [secuencia backend `CU-CAT-24`](../../backend-code-sequences/catalogs/cu-cat-24.md#cu-cat-24): [`catalogController.js`](../../../../../../src/controllers/api/admin/catalogController.js).

La línea `Application` ejecuta la función generada en `createCrudApplication.js`. Su nombre público y la configuración de requests/contratos provienen de [`catalogs.js`](../../../../../../src/public/js/application/admin/catalogs/catalogs.js); exportar esa función no crea otra llamada durante cada petición.

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Administrador del sistema
    participant Browser as Navegador
    participant View@{ "type": "boundary" } as Pantalla JS
    participant Application@{ "type": "control" } as Application
    participant Request@{ "type": "boundary" } as Requests del recurso
    participant HTTP@{ "type": "boundary" } as Cliente HTTP
    participant Transport@{ "type": "control" } as Endpoint API

    Initiator->>Browser: inicia CU-CAT-24 — Consultar estado de cumplimiento
    Browser->>View: abrir y cargar la tabla del catálogo
    View->>Application: getCatalogEntries({ ...params, catalog })
    activate Application
    Application->>Request: getCatalogEntriesRequest({ params: { ...params, catalog } })
    Request->>HTTP: apiRequest({ method: 'get', url, params })
    HTTP->>Transport: consume GET /api/admin/catalogs/fulfillment-statuses
    alt Respuesta exitosa
        Transport-->>HTTP: HTTP 200 { data, recordsTotal, recordsFiltered }
        HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
        Request-->>Application: getCatalogEntriesRequest(): Promise[AxiosResponse]
        Application-->>View: getCatalogEntries(): Promise[AxiosResponse]
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

