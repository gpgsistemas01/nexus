<a id="cu-ida-05"></a>
# `CU-IDA-05` — Consultar usuarios

**Patrones:** `FE-P02`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `View` | boundary | [`usersPage.js`](../../../../../../src/public/js/pages/admin/users/usersPage.js) |
| `Application` | control | [`createCrudApplication.js`](../../../../../../src/public/js/application/createCrudApplication.js) |
| `Request` | boundary | [`userService.js`](../../../../../../src/public/js/services/admin/userService.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `Transport` | control | [`userApiRoute.js`](../../../../../../src/routes/api/admin/userApiRoute.js) |
| `Table` | control | [`userDatatable.js`](../../../../../../src/public/js/plugins/datatable/admin/users/userDatatable.js) |
| `TableCore` | control | [`createDataTable.js`](../../../../../../src/public/js/plugins/datatable/core/base/createDataTable.js) |

### Configuración y archivos de contexto

La plantilla aporta el HTML previo a esta interacción; no ejecuta las llamadas JavaScript de la línea `View`: [`usersPage.ejs`](../../../../../../src/views/pages/admin/users/usersPage.ejs).

El endpoint queda representado por su router. El controller asociado se desarrolla en la [secuencia backend `CU-IDA-05`](../../backend-code-sequences/identity-access/cu-ida-05.md#cu-ida-05): [`userController.js`](../../../../../../src/controllers/api/admin/userController.js).

La línea `Application` ejecuta la función generada en `createCrudApplication.js`. Su nombre público y la configuración de requests/contratos provienen de [`users.js`](../../../../../../src/public/js/application/admin/users/users.js); exportar esa función no crea otra llamada durante cada petición.

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

    Initiator->>Browser: inicia CU-IDA-05 — Consultar usuarios
    Browser->>View: ejecuta el módulo de entrada de la pantalla
    View->>Table: createUserDatatable()
    activate Table
    Table->>TableCore: createDataTable({ options: { ajax, columns } })
    TableCore-->>Table: createDataTable(): DataTable.Api
    Note over TableCore: El callback ajax del núcleo ejecuta options.ajax.get(params)
    Note over TableCore: DataTables invoca ajax.get(params) al cargar o filtrar
    TableCore->>Application: getAllUsers({ params })
    activate Application
    Application->>Request: getAllUsersRequest({ params })
    Request->>HTTP: apiRequest({ method: 'get', url, params })
    HTTP->>Transport: consulta GET /api/admin/users
    alt Respuesta exitosa
        Transport-->>HTTP: HTTP 200 { data, recordsTotal, recordsFiltered }
        HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
        Request-->>Application: getAllUsersRequest(): Promise[AxiosResponse]
        Application-->>TableCore: getAllUsers(): Promise[AxiosResponse]
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

