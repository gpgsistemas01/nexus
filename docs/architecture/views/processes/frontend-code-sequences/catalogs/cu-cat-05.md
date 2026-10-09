<a id="cu-cat-05"></a>
# `CU-CAT-05` — Consultar clientes

**Patrones:** `FE-P02`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `View` | boundary | [`clientsPage.js`](../../../../../../src/public/js/pages/sales/clients/clientsPage.js) |
| `Application` | control | [`createCrudApplication.js`](../../../../../../src/public/js/application/createCrudApplication.js) |
| `Request` | boundary | [`clientService.js`](../../../../../../src/public/js/services/sales/clientService.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `Transport` | control | [`clientApiRoute.js`](../../../../../../src/routes/api/sales/clientApiRoute.js) |
| `Table` | control | [`clientDatatable.js`](../../../../../../src/public/js/plugins/datatable/sales/clients/clientDatatable.js) |
| `TableCore` | control | [`createDataTable.js`](../../../../../../src/public/js/plugins/datatable/core/base/createDataTable.js) |

### Configuración y archivos de contexto

La plantilla aporta el HTML previo a esta interacción; no ejecuta las llamadas JavaScript de la línea `View`: [`clientsPage.ejs`](../../../../../../src/views/pages/sales/clients/clientsPage.ejs).

El endpoint queda representado por su router. El controller asociado se desarrolla en la [secuencia backend `CU-CAT-05`](../../backend-code-sequences/catalogs/cu-cat-05.md#cu-cat-05): [`clientController.js`](../../../../../../src/controllers/api/sales/clientController.js).

La línea `Application` ejecuta la función generada en `createCrudApplication.js`. Su nombre público y la configuración de requests/contratos provienen de [`clients.js`](../../../../../../src/public/js/application/sales/clients/clients.js); exportar esa función no crea otra llamada durante cada petición.

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Administrador del sistema
    participant Browser as Navegador
    participant View@{ "type": "boundary" } as Pantalla JS
    participant Table@{ "type": "control" } as Adaptador DataTable
    participant TableCore@{ "type": "control" } as Núcleo DataTable
    participant Application@{ "type": "control" } as Application
    participant Request@{ "type": "boundary" } as Requests del recurso
    participant HTTP@{ "type": "boundary" } as Cliente HTTP
    participant Transport@{ "type": "control" } as Endpoint API

    Initiator->>Browser: inicia CU-CAT-05 — Consultar clientes
    Browser->>View: ejecuta el módulo de entrada de la pantalla
    View->>Table: createClientDatatable()
    activate Table
    Table->>TableCore: createDataTable({ options: { ajax, columns } })
    TableCore-->>Table: createDataTable(): DataTable.Api
    Note over TableCore: El callback ajax del núcleo ejecuta options.ajax.get(params)
    Note over TableCore: DataTables invoca ajax.get(params) al cargar o filtrar
    TableCore->>Application: getAllClients({ params })
    activate Application
    Application->>Request: getAllClientsRequest({ params })
    Request->>HTTP: apiRequest({ method: 'get', url, params })
    HTTP->>Transport: consulta GET /api/sales/clients
    alt Respuesta exitosa
        Transport-->>HTTP: HTTP 200 { data, recordsTotal, recordsFiltered }
        HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
        Request-->>Application: getAllClientsRequest(): Promise[AxiosResponse]
        Application-->>TableCore: getAllClients(): Promise[AxiosResponse]
        TableCore->>Browser: callback(response.data): filas y conteos
    else Respuesta rechazada
        Transport-->>HTTP: HTTP de error — respuesta del endpoint
        HTTP-->>Request: apiRequest(): throw { status: number, data: Object | null, message: string, raw: Error }
        Request-->>Application: throw { status: number, data: Object | null, message: string, raw: Error }
        Application-->>TableCore: throw { status: number, data: Object | null, message: string, raw: Error }
        TableCore->>Browser: handleDataTableError(error)
        TableCore->>Browser: callback({ data: [], recordsTotal: 0, recordsFiltered: 0 })
    end
    deactivate Application
    deactivate Table
```

