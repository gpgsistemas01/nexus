<a id="cu-sal-08"></a>
# `CU-SAL-08` — Consultar salidas de merma

**Patrones:** `FE-P05`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `View` | boundary | [`wasteIssuesPage.ejs`](../../../../../../src/views/pages/warehouse/wasteIssues/wasteIssuesPage.ejs) |
| `Application` | control | [`createCrudApplication.js`](../../../../../../src/public/js/application/createCrudApplication.js) |
| `Request` | boundary | [`wasteIssueService.js`](../../../../../../src/public/js/services/warehouse/wasteIssueService.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `Transport` | control | [`wasteIssueApiRoute.js`](../../../../../../src/routes/api/warehouse/wasteIssueApiRoute.js) |

### Configuración y archivos de contexto

El endpoint queda representado por su router. El controller asociado se desarrolla en la [secuencia backend `CU-SAL-08`](../../backend-code-sequences/issues/cu-sal-08.md#cu-sal-08): [`wasteIssueController.js`](../../../../../../src/controllers/api/warehouse/wasteIssueController.js).

La aplicación ejecuta closures de `createCrudApplication.js`, configuradas por [`wasteIssues.js`](../../../../../../src/public/js/application/warehouse/wasteIssues/wasteIssues.js) mediante [`createIssueApplication.js`](../../../../../../src/public/js/application/warehouse/issues/createIssueApplication.js). Estos archivos de construcción no añaden delegaciones por petición.

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant View@{ "type": "boundary" } as Pantalla JS
    participant Application@{ "type": "control" } as Application
    participant Request@{ "type": "boundary" } as Requests del recurso
    participant HTTP@{ "type": "boundary" } as Cliente HTTP
    participant Transport@{ "type": "control" } as Endpoint API

    Initiator->>Browser: inicia CU-SAL-08 — Consultar salidas de merma
    Browser->>View: wasteIssuesPage.ejs y su DataTable cargan salidas de merma
    View->>Application: getAllWasteIssues({ params })
    activate Application
    Application->>Request: getAllWasteIssuesRequest({ params })
    Request->>HTTP: apiRequest({ method: 'get', url, params })
    HTTP->>Transport: consulta GET /api/warehouse/waste-issues
    activate Transport
    Transport-->>HTTP: HTTP 200 { data, recordsTotal, recordsFiltered }
    deactivate Transport
    HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
    Request-->>Application: getAllWasteIssuesRequest(): Promise[AxiosResponse]
    alt Respuesta exitosa
        Application-->>View: getAllWasteIssues(): Promise[AxiosResponse]
        View-->>Browser: DOM o DataTable actualizado con response.data
    else Respuesta rechazada
        Application-->>View: throw { status: number, data: Object | null, message: string, raw: Error }
        View-->>Browser: formulario o filtros conservados, mensaje visible
    end
    deactivate Application
```

