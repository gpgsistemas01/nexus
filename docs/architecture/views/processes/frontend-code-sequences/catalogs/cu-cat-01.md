<a id="cu-cat-01"></a>
# `CU-CAT-01` — Consultar proveedores

**Patrones:** `FE-P02`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `View` | boundary | [`suppliersPage.js`](../../../../../../src/public/js/pages/warehouse/suppliers/suppliersPage.js) |
| `Application` | control | [`createCrudApplication.js`](../../../../../../src/public/js/application/createCrudApplication.js) |
| `Request` | boundary | [`supplierService.js`](../../../../../../src/public/js/services/warehouse/supplierService.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `Transport` | control | [`supplierApiRoute.js`](../../../../../../src/routes/api/warehouse/supplierApiRoute.js) |
| `Table` | control | [`supplierDatatable.js`](../../../../../../src/public/js/plugins/datatable/warehouse/suppliers/supplierDatatable.js) |
| `TableCore` | control | [`createDataTable.js`](../../../../../../src/public/js/plugins/datatable/core/base/createDataTable.js) |

### Configuración y archivos de contexto

La plantilla aporta el HTML previo a esta interacción; no ejecuta las llamadas JavaScript de la línea `View`: [`suppliersPage.ejs`](../../../../../../src/views/pages/warehouse/suppliers/suppliersPage.ejs).

El endpoint queda representado por su router. El controller asociado se desarrolla en la [secuencia backend `CU-CAT-01`](../../backend-code-sequences/catalogs/cu-cat-01.md#cu-cat-01): [`supplierController.js`](../../../../../../src/controllers/api/warehouse/supplierController.js).

La línea `Application` ejecuta la función generada en `createCrudApplication.js`. Su nombre público y la configuración de requests/contratos provienen de [`suppliers.js`](../../../../../../src/public/js/application/warehouse/suppliers/suppliers.js); exportar esa función no crea otra llamada durante cada petición.

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

    Initiator->>Browser: inicia CU-CAT-01 — Consultar proveedores
    Browser->>View: ejecuta el módulo de entrada de la pantalla
    View->>Table: createSupplierDatatable()
    activate Table
    Table->>TableCore: createDataTable({ options: { ajax, columns } })
    TableCore-->>Table: createDataTable(): DataTable.Api
    Note over TableCore: El callback ajax del núcleo ejecuta options.ajax.get(params)
    Note over TableCore: DataTables invoca ajax.get(params) al cargar o filtrar
    TableCore->>Application: getAllSuppliers({ params })
    activate Application
    Application->>Request: getAllSuppliersRequest({ params })
    Request->>HTTP: apiRequest({ method: 'get', url, params })
    HTTP->>Transport: consulta GET /api/warehouse/suppliers
    alt Respuesta exitosa
        Transport-->>HTTP: HTTP 200 { data, recordsTotal, recordsFiltered }
        HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
        Request-->>Application: getAllSuppliersRequest(): Promise[AxiosResponse]
        Application-->>TableCore: getAllSuppliers(): Promise[AxiosResponse]
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

