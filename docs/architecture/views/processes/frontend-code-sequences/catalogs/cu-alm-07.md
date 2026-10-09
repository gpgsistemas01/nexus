<a id="cu-alm-07"></a>
# `CU-ALM-07` — Consultar movimientos de materiales

**Patrones:** `FE-P07`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `View` | boundary | [`movementsPage.js`](../../../../../../src/public/js/pages/admin/movements/movementsPage.js) |
| `Application` | control | [`movements.js`](../../../../../../src/public/js/application/admin/movements/movements.js) |
| `Request` | boundary | [`movementService.js`](../../../../../../src/public/js/services/admin/movementService.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `Transport` | control | [`movementApiRoute.js`](../../../../../../src/routes/api/admin/movementApiRoute.js) |
| `Table` | control | [`movementDatatable.js`](../../../../../../src/public/js/plugins/datatable/admin/movements/movementDatatable.js) |
| `TableCore` | control | [`createDataTable.js`](../../../../../../src/public/js/plugins/datatable/core/base/createDataTable.js) |

### Configuración y archivos de contexto

El endpoint queda representado por su router. El controller asociado se desarrolla en la [secuencia backend `CU-ALM-07`](../../backend-code-sequences/catalogs/cu-alm-07.md#cu-alm-07): [`movementController.js`](../../../../../../src/controllers/api/admin/movementController.js).

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

    Initiator->>Browser: inicia CU-ALM-07 — Consultar movimientos de materiales
    Browser->>View: movementsPage.js selecciona el contexto material
    View->>Table: createMovementDatatable()
    activate Table
    Table->>TableCore: createDataTable({ options: { ajax, columns } })
    TableCore-->>Table: createDataTable(): DataTable.Api
    Note over TableCore: El callback ajax del núcleo ejecuta options.ajax.get(params)
    Note over TableCore: DataTables invoca ajax.get(params) al cargar o filtrar
    TableCore->>Application: getAllMovements({ context: 'materials', params })
    activate Application
    Application->>Request: getAllMovementsRequest({ context, params })
    Request->>HTTP: apiRequest({ method: 'get', url, params })
    HTTP->>Transport: consultar GET /api/admin/movements/materials
    alt Respuesta exitosa
        Transport-->>HTTP: HTTP 2xx — respuesta del endpoint
        HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
        Request-->>Application: getAllMovementsRequest(): Promise[AxiosResponse]
        Application-->>TableCore: getAllMovements(): Promise[AxiosResponse]
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

