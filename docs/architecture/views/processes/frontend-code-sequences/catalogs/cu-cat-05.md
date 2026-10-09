<a id="cu-cat-05"></a>
# `CU-CAT-05` — Consultar clientes

**Patrones:** `FE-P02`.

## Participantes y trazabilidad

Los nombres breves del diagrama corresponden a los archivos vinculados siguientes.
La ruta completa se conserva en cada enlace, fuera de la cabecera visual. Un participante
puede agrupar colaboradores del mismo rol; esa agrupación no implica una clase ni un
proceso independiente. Los retornos representan el resultado o error propagado.

| Alias | Rol visual | Archivos de implementación |
| --- | --- | --- |
| `View` | boundary | [`clientsPage.ejs`](../../../../../../src/views/pages/sales/clients/clientsPage.ejs)<br/>[`clientsPage.js`](../../../../../../src/public/js/pages/sales/clients/clientsPage.js) |
| `Application` | control | [`clients.js`](../../../../../../src/public/js/application/sales/clients/clients.js) |
| `Request` | boundary | [`clientService.js`](../../../../../../src/public/js/services/sales/clientService.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `Transport` | control | [`clientApiRoute.js`](../../../../../../src/routes/api/sales/clientApiRoute.js)<br/>[`clientController.js`](../../../../../../src/controllers/api/sales/clientController.js) |

| `Table` | control | [`clientDatatable.js`](../../../../../../src/public/js/plugins/datatable/sales/clients/clientDatatable.js)<br/>[`createDataTable.js`](../../../../../../src/public/js/plugins/datatable/core/base/createDataTable.js) |

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Administrador del sistema
    participant Browser as Navegador
    participant View@{ "type": "boundary" } as Pantalla / formulario
    participant Table@{ "type": "control" } as Adaptador DataTable
    participant Application@{ "type": "control" } as Application
    participant Request@{ "type": "boundary" } as Requests del recurso
    participant HTTP@{ "type": "boundary" } as Cliente HTTP
    participant Transport@{ "type": "control" } as Endpoint API

    Initiator->>Browser: inicia CU-CAT-05 — Consultar clientes
    Browser->>View: clientsPage.ejs y clientsPage.js cargan clientes
    View->>Table: createClientDatatable()
    activate Table
    Table->>Table: createDataTable({ options: { ajax, columns } })
    Note over Table: DataTables invoca ajax.get(params) al cargar o filtrar
    Table->>Application: getAllClients({ params })
    activate Application
    Application->>Request: getAllClientsRequest({ params })
    Request->>HTTP: apiRequest({ method: 'get', url, params })
    HTTP->>Transport: consulta GET /api/sales/clients
    alt Respuesta exitosa
        Transport-->>HTTP: HTTP 200 { data, recordsTotal, recordsFiltered }
        HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
        Request-->>Application: getAllClientsRequest(): Promise[AxiosResponse]
        Application-->>Table: getAllClients(): Promise[AxiosResponse]
        Table->>Browser: callback(response.data): filas y conteos
    else Respuesta rechazada
        Transport-->>HTTP: HTTP de error — respuesta del endpoint
        HTTP-->>Request: apiRequest(): throw { status: number, data: Object | null, message: string, raw: Error }
        Request-->>Application: throw { status: number, data: Object | null, message: string, raw: Error }
        Application-->>Table: throw { status: number, data: Object | null, message: string, raw: Error }
        Table->>Browser: handleDataTableError(error)
        Table->>Browser: callback({ data: [], recordsTotal: 0, recordsFiltered: 0 })
    end
    deactivate Application
    deactivate Table
```

