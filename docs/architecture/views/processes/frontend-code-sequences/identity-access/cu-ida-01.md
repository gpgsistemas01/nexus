<a id="cu-ida-01"></a>
# `CU-IDA-01` — Consultar personas

**Patrones:** `FE-P02`.

## Participantes y trazabilidad

Los nombres breves del diagrama corresponden a los archivos vinculados siguientes.
La ruta completa se conserva en cada enlace, fuera de la cabecera visual. Un participante
puede agrupar colaboradores del mismo rol; esa agrupación no implica una clase ni un
proceso independiente. Los retornos representan el resultado o error propagado.

| Alias | Rol visual | Archivos de implementación |
| --- | --- | --- |
| `View` | boundary | [`personsPage.ejs`](../../../../../../src/views/pages/admin/persons/personsPage.ejs)<br/>[`personsPage.js`](../../../../../../src/public/js/pages/admin/persons/personsPage.js) |
| `Application` | control | [`persons.js`](../../../../../../src/public/js/application/admin/persons/persons.js) |
| `Request` | boundary | [`personService.js`](../../../../../../src/public/js/services/admin/personService.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `Transport` | control | [`personApiRoute.js`](../../../../../../src/routes/api/admin/personApiRoute.js)<br/>[`personController.js`](../../../../../../src/controllers/api/admin/personController.js) |

| `Table` | control | [`personDatatable.js`](../../../../../../src/public/js/plugins/datatable/admin/persons/personDatatable.js)<br/>[`createDataTable.js`](../../../../../../src/public/js/plugins/datatable/core/base/createDataTable.js) |

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant View@{ "type": "boundary" } as Pantalla / formulario
    participant Table@{ "type": "control" } as Adaptador DataTable
    participant Application@{ "type": "control" } as Application
    participant Request@{ "type": "boundary" } as Requests del recurso
    participant HTTP@{ "type": "boundary" } as Cliente HTTP
    participant Transport@{ "type": "control" } as Endpoint API

    Initiator->>Browser: inicia CU-IDA-01 — Consultar personas
    Browser->>View: personsPage.ejs y personsPage.js cargan la tabla
    View->>Table: createPersonsDatatable()
    activate Table
    Table->>Table: createDataTable({ options: { ajax, columns } })
    Note over Table: DataTables invoca ajax.get(params) al cargar o filtrar
    Table->>Application: getAllPersons({ params })
    activate Application
    Application->>Request: getAllPersonsRequest({ params })
    Request->>HTTP: apiRequest({ method: 'get', url, params })
    HTTP->>Transport: consulta GET /api/admin/persons
    alt Respuesta exitosa
        Transport-->>HTTP: HTTP 200 { data, recordsTotal, recordsFiltered }
        HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
        Request-->>Application: getAllPersonsRequest(): Promise[AxiosResponse]
        Application-->>Table: getAllPersons(): Promise[AxiosResponse]
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

