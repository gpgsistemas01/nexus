<a id="cu-sal-08"></a>
# `CU-SAL-08` — Consultar salidas de merma

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
| `View` | boundary | [`wasteIssuesPage.ejs`](../../../../../../src/views/pages/warehouse/wasteIssues/wasteIssuesPage.ejs) |
| `Application` | control | [`createCrudApplication.js`](../../../../../../src/public/js/application/createCrudApplication.js) |
| `Request` | boundary | [`wasteIssueService.js`](../../../../../../src/public/js/services/warehouse/wasteIssueService.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `Transport` | control | [`wasteIssueApiRoute.js`](../../../../../../src/routes/api/warehouse/wasteIssueApiRoute.js) |
| `FileWasteIssueController` | control | [`wasteIssueController.js`](../../../../../../src/controllers/api/warehouse/wasteIssueController.js) |
| `FileCreateIssueApplication` | control | [`createIssueApplication.js`](../../../../../../src/public/js/application/warehouse/issues/createIssueApplication.js) |
| `FileWasteIssues` | control | [`wasteIssues.js`](../../../../../../src/public/js/application/warehouse/wasteIssues/wasteIssues.js) |
| `Page` | boundary | [`wasteIssuesPage.js`](../../../../../../src/public/js/pages/warehouse/wasteIssues/wasteIssuesPage.js) |
| `Table` | control | [`wasteIssueDatatable.js`](../../../../../../src/public/js/plugins/datatable/warehouse/wasteIssues/wasteIssueDatatable.js) |
| `IssueTable` | control | [`issueDatatable.js`](../../../../../../src/public/js/plugins/datatable/shared/issues/issueDatatable.js) |
| `TableCore` | control | [`createDataTable.js`](../../../../../../src/public/js/plugins/datatable/core/base/createDataTable.js) |
| `IssueUI` | boundary | [`issueFormUI.js`](../../../../../../src/public/js/ui/issues/issueFormUI.js) |
| `Filters` | control | [`tableFilter.js`](../../../../../../src/public/js/plugins/datatable/core/filters/tableFilter.js) |
| `FilterState` | control | [`tableFilterState.js`](../../../../../../src/public/js/plugins/datatable/core/filters/tableFilterState.js) |
| `Errors` | control | [`errorHandler.js`](../../../../../../src/public/js/api/errorHandler.js) |
| `Normalize` | control | [`utils.js`](../../../../../../src/public/js/api/utils.js) |
| `FileWasteIssueForm` | control | [`wasteIssueForm.js`](../../../../../../src/public/js/pages/warehouse/wasteIssues/wasteIssueForm.js) |
| `FileWasteIssueModal` | control | [`wasteIssueModal.js`](../../../../../../src/public/js/pages/warehouse/wasteIssues/wasteIssueModal.js) |

### Configuración y construcción

El endpoint queda representado por su router. El controller asociado se desarrolla en la [secuencia backend `CU-SAL-08`](../../backend-code-sequences/issues/cu-sal-08.md#cu-sal-08): [`wasteIssueController.js`](../../../../../../src/controllers/api/warehouse/wasteIssueController.js).

La aplicación ejecuta closures de `createCrudApplication.js`, configuradas por [`wasteIssues.js`](../../../../../../src/public/js/application/warehouse/wasteIssues/wasteIssues.js) mediante [`createIssueApplication.js`](../../../../../../src/public/js/application/warehouse/issues/createIssueApplication.js). Estos archivos de construcción no añaden delegaciones por petición.

## Composición de archivos

Los archivos que construyen, configuran o reexportan funciones aparecen como componentes
individuales. Las flechas representan imports reales, resueltos al cargar los módulos;
las llamadas durante la operación se muestran en las secuencias siguientes. Cada nombre
identifica un archivo y la tabla conserva su ruta completa.

```mermaid
flowchart TB
    subgraph Component0["Backend"]
        FileWasteIssueController["wasteIssueController.js"]
        Transport["wasteIssueApiRoute.js"]
    end
    subgraph Component1["Aplicación y requests"]
        Application["createCrudApplication.js"]
        FileCreateIssueApplication["createIssueApplication.js"]
        FileWasteIssues["wasteIssues.js"]
        Request["wasteIssueService.js"]
    end
    subgraph Component2["Interfaz"]
        FileWasteIssueForm["wasteIssueForm.js"]
        FileWasteIssueModal["wasteIssueModal.js"]
        Page["wasteIssuesPage.js"]
        Table["wasteIssueDatatable.js"]
        IssueUI["issueFormUI.js"]
        View["wasteIssuesPage.ejs"]
    end
    FileCreateIssueApplication -->|import| Application
    FileWasteIssues -->|import| Request
    FileWasteIssues -->|import| FileCreateIssueApplication
    FileWasteIssueForm -->|import| FileWasteIssues
    FileWasteIssueForm -->|import| IssueUI
    FileWasteIssueForm -->|import| FileWasteIssueModal
    FileWasteIssueModal -->|import| IssueUI
    Page -->|import| FileWasteIssueModal
    Page -->|import| FileWasteIssueForm
    Table -->|import| FileWasteIssues
    Transport -->|import| FileWasteIssueController
```

## Construcción de funciones para esta operación

El configurador se ejecuta al evaluar su módulo. Después se invoca la función devuelta
por la fábrica, usando el nombre público mostrado en la secuencia.

| Nombre público | Archivo configurador (alias) | Archivo que construye el cuerpo (alias) |
| --- | --- | --- |
| `getAllWasteIssues` | `FileWasteIssues` | `FileCreateIssueApplication` · `createIssueApplication(...)` |

## Preparación de la interfaz

La plantilla EJS declara el módulo de la página; no consulta la API. La página configura
acciones y la tabla específica, que delega en el adaptador compartido. Este inicializa
los filtros antes de construir DataTables. La carga de opciones de filtros es preparación
de controles y no reemplaza la consulta del listado.

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant Page@{ "type": "boundary" } as wasteIssuesPage.js
    participant IssueUI@{ "type": "boundary" } as issueFormUI.js
    participant Table@{ "type": "control" } as wasteIssueDatatable.js
    participant IssueTable@{ "type": "control" } as issueDatatable.js
    participant Filters@{ "type": "control" } as tableFilter.js
    participant TableCore@{ "type": "control" } as createDataTable.js

    Initiator->>Browser: inicia CU-SAL-08 — Consultar salidas de merma
    Browser->>Page: cargar módulo declarado en wasteIssuesPage.ejs
    Page->>IssueUI: createIssueTableActions({ openIssueModal })
    IssueUI-->>Page: createIssueTableActions(): Object — callbacks onCreate, onEdit, onEditDetails, onReturnDetails
    Page->>Table: createWasteIssueDatatable({ context, ...actions })
    Table->>IssueTable: createIssueDatatable({ getIssues: getAllWasteIssues, context, permissions, actions, ... })
    IssueTable->>Filters: setupTableFilters({ fields: ISSUE_FILTER_FIELDS })
    Filters-->>IssueTable: setupTableFilters(): Promise[Object] — filtros inicializados
    IssueTable->>TableCore: createDataTable({ options: { ajax: { get: callback }, columns, ... } })
    TableCore-->>IssueTable: createDataTable(): DataTable.Api — callback Ajax registrado
    IssueTable->>IssueTable: bindIssueTableActions({ table, ...actions })
    IssueTable-->>Table: createIssueDatatable(): Promise[{ table, filters }]
    Table-->>Page: createWasteIssueDatatable(): Promise[void] — el wrapper no retorna la tabla
```

## Coordinación de la interfaz

DataTables invoca el callback Ajax durante su ciclo de carga o recarga; esta figura
amplía ese callback y no presupone que espere al retorno del constructor. El callback
`get` pertenece a `issueDatatable.js`; `getValues` pertenece a `tableFilterState.js`.
El objeto de filtros se pasa directamente a la aplicación, sin envolverlo en `{ params }`.

```mermaid
sequenceDiagram
    autonumber
    participant Browser as Navegador
    participant TableCore@{ "type": "control" } as createDataTable.js
    participant IssueTable@{ "type": "control" } as issueDatatable.js
    participant FilterState@{ "type": "control" } as tableFilterState.js
    participant Application@{ "type": "control" } as createCrudApplication.js
    participant Errors@{ "type": "control" } as errorHandler.js

    Browser->>TableCore: callback Ajax de DataTables(data, callback)
    TableCore->>IssueTable: options.ajax.get(data) — closure definido en issueDatatable.js
    IssueTable->>FilterState: filters.getValues()
    FilterState-->>IssueTable: getValues(): Object — filtros aplicados
    IssueTable->>Application: getAllWasteIssues({ ...data, ...filters.getValues() })
    alt Respuesta exitosa
        Application-->>IssueTable: getAllWasteIssues(): Promise[AxiosResponse]
        IssueTable-->>TableCore: options.ajax.get(): Promise[AxiosResponse]
        TableCore-->>Browser: callback(response.data) — datos y contadores
    else Respuesta rechazada
        Application-->>IssueTable: error propagado
        IssueTable-->>TableCore: error propagado
        TableCore->>Errors: handleDataTableError(error)
        Errors-->>TableCore: void — tratamiento visual del error
        TableCore-->>Browser: callback({ data: [], recordsTotal: 0, recordsFiltered: 0 })
    end
```

## Colaboración de aplicación y transporte

La fábrica CRUD envuelve los parámetros para el request y conserva el `AxiosResponse`.
Solo el callback de DataTables extrae `response.data`. La renovación de sesión y el
reintento 401 se describen en el [comportamiento transversal de transporte](../../shared-runtime-behavior/02-browser-session-and-form-state.md).
El controller y la persistencia se desarrollan en la secuencia backend enlazada arriba.

```mermaid
sequenceDiagram
    autonumber
    participant IssueTable@{ "type": "control" } as issueDatatable.js
    participant Application@{ "type": "control" } as createCrudApplication.js
    participant Request@{ "type": "boundary" } as wasteIssueService.js
    participant HTTP@{ "type": "boundary" } as axiosInstanceApi.js
    participant Transport@{ "type": "control" } as wasteIssueApiRoute.js
    participant Normalize@{ "type": "control" } as utils.js

    IssueTable->>Application: getAllWasteIssues(params) — objeto plano de paginación y filtros
    Application->>Request: getAllWasteIssuesRequest({ params })
    Request->>HTTP: apiRequest({ method: "get", url, params })
    HTTP->>Transport: GET /api/warehouse/waste-issues
    alt HTTP 200
        Transport-->>HTTP: { data, recordsTotal, recordsFiltered }
        HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
        Request-->>Application: getAllWasteIssuesRequest(): Promise[AxiosResponse]
        Application-->>IssueTable: getAllWasteIssues(): Promise[AxiosResponse] — la consulta no adapta response.data
    else Error HTTP
        Transport-->>HTTP: respuesta de error
        opt No se inicia renovación: status distinto de 401 o request._retry
            HTTP->>Normalize: normalizeHttpError(err)
            Normalize-->>HTTP: { status, data, message, raw }
        end
        HTTP-->>Request: error normalizado o rechazo del reintento
        Request-->>Application: error propagado
        Application-->>IssueTable: error propagado
    end
```
