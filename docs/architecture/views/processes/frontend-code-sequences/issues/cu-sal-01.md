<a id="cu-sal-01"></a>
# `CU-SAL-01` — Consultar salidas de material

**Patrones:** `FE-P05`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.
La composición incluye también los archivos de configuración, construcción y reexport: cada
uno tiene un nodo propio, aunque no ejecute una delegación durante la petición.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `View` | boundary | [`goodsIssueDatatable.js`](../../../../../../src/public/js/plugins/datatable/warehouse/goodsIssues/goodsIssueDatatable.js) |
| `Application` | control | [`createCrudApplication.js`](../../../../../../src/public/js/application/createCrudApplication.js) |
| `Request` | boundary | [`createGoodsIssueRequests.js`](../../../../../../src/public/js/services/warehouse/goodsIssues/createGoodsIssueRequests.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `Transport` | control | [`materialGoodsIssueApiRoute.js`](../../../../../../src/routes/api/warehouse/goodsIssues/materials/materialGoodsIssueApiRoute.js) |
| `TableCore` | control | [`createDataTable.js`](../../../../../../src/public/js/plugins/datatable/core/base/createDataTable.js) |
| `FileErrorHandler` | control | [`errorHandler.js`](../../../../../../src/public/js/api/errorHandler.js) |
| `FileMaterialGoodsIssueController` | control | [`materialGoodsIssueController.js`](../../../../../../src/controllers/api/warehouse/goodsIssues/materials/materialGoodsIssueController.js) |
| `FileConsumableGoodsIssues` | control | [`consumableGoodsIssues.js`](../../../../../../src/public/js/application/warehouse/goodsIssues/consumables/consumableGoodsIssues.js) |
| `FileGoodsIssues` | control | [`goodsIssues.js`](../../../../../../src/public/js/application/warehouse/goodsIssues/goodsIssues.js) |
| `FileMaterialGoodsIssues` | control | [`materialGoodsIssues.js`](../../../../../../src/public/js/application/warehouse/goodsIssues/materials/materialGoodsIssues.js) |
| `FileCreateIssueApplication` | control | [`createIssueApplication.js`](../../../../../../src/public/js/application/warehouse/issues/createIssueApplication.js) |
| `FileConsumableGoodsIssueService` | control | [`consumableGoodsIssueService.js`](../../../../../../src/public/js/services/warehouse/goodsIssues/consumables/consumableGoodsIssueService.js) |
| `FileMaterialGoodsIssueService` | control | [`materialGoodsIssueService.js`](../../../../../../src/public/js/services/warehouse/goodsIssues/materials/materialGoodsIssueService.js) |
| `FileUtils` | control | [`utils.js`](../../../../../../src/public/js/api/utils.js) |
| `IssueTable` | control | [`issueDatatable.js`](../../../../../../src/public/js/plugins/datatable/shared/issues/issueDatatable.js) |
| `FileGoodsIssueContext` | control | [`goodsIssueContext.js`](../../../../../../src/public/js/pages/warehouse/goodsIssues/goodsIssueContext.js) |

### Configuración y construcción

Estos módulos seleccionan/configuran y exportan la función de aplicación. Su cuerpo se ejecuta en la fábrica de la línea `Application`, sin una llamada intermedia entre reexports: [`goodsIssues.js`](../../../../../../src/public/js/application/warehouse/goodsIssues/goodsIssues.js), [`materialGoodsIssues.js`](../../../../../../src/public/js/application/warehouse/goodsIssues/materials/materialGoodsIssues.js).

Estos módulos configuran o reexportan el request. La función que llama a `apiRequest` está definida en el archivo de la línea `Request`: [`materialGoodsIssueService.js`](../../../../../../src/public/js/services/warehouse/goodsIssues/materials/materialGoodsIssueService.js).

El endpoint queda representado por su router. El controller asociado se desarrolla en la [secuencia backend `CU-SAL-01`](../../backend-code-sequences/issues/cu-sal-01.md#cu-sal-01): [`materialGoodsIssueController.js`](../../../../../../src/controllers/api/warehouse/goodsIssues/materials/materialGoodsIssueController.js).

## Composición de archivos

Los archivos que construyen, configuran o reexportan funciones aparecen como componentes
individuales. Las flechas representan imports reales, resueltos al cargar los módulos;
las llamadas durante la operación se muestran en las secuencias siguientes. Cada nombre
identifica un archivo y la tabla conserva su ruta completa.

```mermaid
flowchart TB
    subgraph Component0["Backend"]
        FileMaterialGoodsIssueController["materialGoodsIssueController.js"]
        Transport["materialGoodsIssueApiRoute.js"]
    end
    subgraph Component1["Aplicación y requests"]
        Application["createCrudApplication.js"]
        FileConsumableGoodsIssues["consumableGoodsIssues.js"]
        FileGoodsIssues["goodsIssues.js"]
        FileMaterialGoodsIssues["materialGoodsIssues.js"]
        FileCreateIssueApplication["createIssueApplication.js"]
        FileConsumableGoodsIssueService["consumableGoodsIssueService.js"]
        Request["createGoodsIssueRequests.js"]
        FileMaterialGoodsIssueService["materialGoodsIssueService.js"]
    end
    subgraph Component2["Interfaz"]
        FileGoodsIssueContext["goodsIssueContext.js"]
        View["goodsIssueDatatable.js"]
    end
    FileConsumableGoodsIssues -->|import| FileConsumableGoodsIssueService
    FileConsumableGoodsIssues -->|import| FileCreateIssueApplication
    FileGoodsIssues -->|import| FileMaterialGoodsIssues
    FileGoodsIssues -->|import| FileConsumableGoodsIssues
    FileGoodsIssues -->|import| FileGoodsIssueContext
    FileMaterialGoodsIssues -->|import| FileMaterialGoodsIssueService
    FileMaterialGoodsIssues -->|import| FileCreateIssueApplication
    FileCreateIssueApplication -->|import| Application
    View -->|import| FileGoodsIssues
    View -->|import| FileGoodsIssueContext
    FileConsumableGoodsIssueService -->|import| Request
    FileMaterialGoodsIssueService -->|import| Request
    Transport -->|import| FileMaterialGoodsIssueController
```

## Construcción de funciones para esta operación

El configurador se ejecuta al evaluar su módulo. Después se invoca la función devuelta
por la fábrica, usando el nombre público mostrado en la secuencia.

| Nombre público | Archivo configurador (alias) | Archivo que construye el cuerpo (alias) |
| --- | --- | --- |
| `getAllMaterialGoodsIssuesRequest` | `FileMaterialGoodsIssueService` | `Request` · `createGoodsIssueRequests(...)` |

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant View@{ "type": "boundary" } as goodsIssueDatatable.js
    participant TableCore@{ "type": "control" } as createDataTable.js
    participant Application@{ "type": "control" } as createCrudApplication.js
    participant Request@{ "type": "boundary" } as createGoodsIssueRequests.js
    participant HTTP@{ "type": "boundary" } as axiosInstanceApi.js
    participant Transport@{ "type": "control" } as materialGoodsIssueApiRoute.js

    participant FileErrorHandler@{ "type": "control" } as errorHandler.js

    participant FileUtils@{ "type": "control" } as utils.js
    participant IssueTable@{ "type": "control" } as issueDatatable.js

    Note over Application: Closure configurada

    Note over Request: Request configurado

    Initiator->>Browser: inicia CU-SAL-01 — Consultar salidas de material
    Browser->>View: createGoodsIssueDatatable(...) y aplicar filtros
    View->>IssueTable: createIssueDatatable({ context, getIssues, permissions, actions })
    IssueTable->>TableCore: createDataTable({ options: { ajax: { get: callback }, columns } })
    TableCore-->>IssueTable: createDataTable(): DataTable.Api
    IssueTable-->>View: createIssueDatatable(): Promise[{ table, filters }]
    Note over TableCore: El callback ajax del núcleo ejecuta options.ajax.get(params)
    TableCore->>IssueTable: options.ajax.get(params) — callback configurado
    IssueTable->>Application: getAllGoodsIssues({ ...params, ...filters.getValues() })
    Application->>Request: getAllMaterialGoodsIssuesRequest({ params })
    Request->>HTTP: apiRequest({ method: 'get', url, params })
    HTTP->>Transport: GET /api/warehouse/goods-issues/materials
    alt Respuesta exitosa
        Transport-->>HTTP: HTTP 200 { data, recordsTotal, recordsFiltered }
        HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
        Request-->>Application: getAllMaterialGoodsIssuesRequest(): Promise[AxiosResponse]
        Application-->>IssueTable: getAllGoodsIssues(): Promise[AxiosResponse]
        IssueTable-->>TableCore: options.ajax.get(): Promise[AxiosResponse]
        TableCore->>Browser: callback(response.data) — filas y conteos de DataTable
    else Error HTTP o de dominio
        Transport-->>HTTP: HTTP de error { code, message }
        opt No se inicia renovación: status distinto de 401 o request._retry
            HTTP->>FileUtils: normalizeHttpError(err)
            FileUtils-->>HTTP: normalizeHttpError(): Object — status, data, message, raw
        end
        HTTP-->>Request: error normalizado
        Request-->>Application: error propagado
        Application-->>IssueTable: error propagado
        IssueTable-->>TableCore: error propagado
        TableCore->>FileErrorHandler: handleDataTableError(error)
        TableCore->>Browser: callback({ data: [], recordsTotal: 0, recordsFiltered: 0 })
    end
```
