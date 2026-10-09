<a id="cu-alm-07"></a>
# `CU-ALM-07` — Consultar movimientos de materiales

**Patrones:** `FE-P07`.

## Participantes y trazabilidad

Los nombres breves del diagrama corresponden a los archivos vinculados siguientes.
La ruta completa se conserva en cada enlace, fuera de la cabecera visual. Un participante
puede agrupar colaboradores del mismo rol; esa agrupación no implica una clase ni un
proceso independiente. Los retornos representan el resultado o error propagado.

| Alias | Rol visual | Archivos de implementación |
| --- | --- | --- |
| `View` | boundary | [`movementsPage.js`](../../../../../../src/public/js/pages/admin/movements/movementsPage.js) |
| `Application` | control | [`movements.js`](../../../../../../src/public/js/application/admin/movements/movements.js) |
| `Request` | boundary | [`movementService.js`](../../../../../../src/public/js/services/admin/movementService.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `Transport` | control | [`movementApiRoute.js`](../../../../../../src/routes/api/admin/movementApiRoute.js)<br/>[`movementController.js`](../../../../../../src/controllers/api/admin/movementController.js) |

| `Table` | control | [`movementDatatable.js`](../../../../../../src/public/js/plugins/datatable/admin/movements/movementDatatable.js)<br/>[`createDataTable.js`](../../../../../../src/public/js/plugins/datatable/core/base/createDataTable.js) |

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

    Initiator->>Browser: inicia CU-ALM-07 — Consultar movimientos de materiales
    Browser->>View: movementsPage.js selecciona el contexto material
    View->>Table: createMovementDatatable()
    activate Table
    Table->>Table: createDataTable({ options: { ajax, columns } })
    Note over Table: DataTables invoca ajax.get(params) al cargar o filtrar
    Table->>Application: getAllMovements({ context: 'materials', params })
    activate Application
    Application->>Request: getAllMovementsRequest({ context, params })
    Request->>HTTP: apiRequest({ method: 'get', url, params })
    HTTP->>Transport: consultar GET /api/admin/movements/materials
    alt Respuesta exitosa
        Transport-->>HTTP: HTTP 2xx — respuesta del endpoint
        HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
        Request-->>Application: getAllMovementsRequest(): Promise[AxiosResponse]
        Application-->>Table: getAllMovements(): Promise[AxiosResponse]
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

