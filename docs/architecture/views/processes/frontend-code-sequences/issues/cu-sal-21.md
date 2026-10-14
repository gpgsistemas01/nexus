<a id="cu-sal-21"></a>
# `CU-SAL-21` — Generar reporte de salidas de consumible

**Patrones:** `FE-P08`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.
La composición incluye también los archivos de configuración, construcción y reexport: cada
uno tiene un nodo propio, aunque no ejecute una delegación durante la petición.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `View` | boundary | [`issueDatatable.js`](../../../../../../src/public/js/plugins/datatable/shared/issues/issueDatatable.js) |
| `Export` | control | [`tableUI.js`](../../../../../../src/public/js/ui/tableUI.js) |
| `Dialog` | boundary | [`reportExportDialog.js`](../../../../../../src/public/js/ui/reportExportDialog.js) |
| `Application` | control | [`createReportApplication.js`](../../../../../../src/public/js/application/createReportApplication.js) |
| `Request` | boundary | [`createGoodsIssueRequests.js`](../../../../../../src/public/js/services/warehouse/goodsIssues/createGoodsIssueRequests.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `Transport` | control | [`consumableGoodsIssueReportApiRoute.js`](../../../../../../src/routes/api/warehouse/goodsIssues/consumables/consumableGoodsIssueReportApiRoute.js) |
| `FileSwalComponent` | control | [`swalComponent.js`](../../../../../../src/public/js/plugins/swal/swalComponent.js) |
| `FileConsumableGoodsIssueReportController` | control | [`consumableGoodsIssueReportController.js`](../../../../../../src/controllers/api/warehouse/goodsIssues/consumables/consumableGoodsIssueReportController.js) |
| `FileReport` | control | [`report.js`](../../../../../../src/public/js/application/warehouse/report.js) |
| `FileConsumableGoodsIssueService` | control | [`consumableGoodsIssueService.js`](../../../../../../src/public/js/services/warehouse/goodsIssues/consumables/consumableGoodsIssueService.js) |
| `FileGoodsIssueService` | control | [`goodsIssueService.js`](../../../../../../src/public/js/services/warehouse/goodsIssues/goodsIssueService.js) |
| `FileMaterialGoodsIssueService` | control | [`materialGoodsIssueService.js`](../../../../../../src/public/js/services/warehouse/goodsIssues/materials/materialGoodsIssueService.js) |
| `FileReportService` | control | [`reportService.js`](../../../../../../src/public/js/services/warehouse/reportService.js) |
| `FileUtils` | control | [`utils.js`](../../../../../../src/public/js/api/utils.js) |
| `FileGoodsIssueContext` | control | [`goodsIssueContext.js`](../../../../../../src/public/js/pages/warehouse/goodsIssues/goodsIssueContext.js) |
| `TimeZone` | control | [`timeZone.js`](../../../../../../src/public/js/utils/timeZone.js) |
| `DatePicker` | control | [`dateTimePicker.js`](../../../../../../src/public/js/plugins/flatpickr/dateTimePicker.js) |
| `FileGoodsIssueDatatable` | control | [`goodsIssueDatatable.js`](../../../../../../src/public/js/plugins/datatable/warehouse/goodsIssues/goodsIssueDatatable.js) |

### Configuración y construcción

Estos módulos seleccionan/configuran y exportan la función de aplicación. Su cuerpo se ejecuta en la fábrica de la línea `Application`, sin una llamada intermedia entre reexports: [`report.js`](../../../../../../src/public/js/application/warehouse/report.js).

Estos módulos configuran o reexportan el request. La función que llama a `apiRequest` está definida en el archivo de la línea `Request`: [`reportService.js`](../../../../../../src/public/js/services/warehouse/reportService.js), [`consumableGoodsIssueService.js`](../../../../../../src/public/js/services/warehouse/goodsIssues/consumables/consumableGoodsIssueService.js).

El endpoint queda representado por su router. El controller asociado se desarrolla en la [secuencia backend `CU-SAL-21`](../../backend-code-sequences/issues/cu-sal-21.md#cu-sal-21): [`consumableGoodsIssueReportController.js`](../../../../../../src/controllers/api/warehouse/goodsIssues/consumables/consumableGoodsIssueReportController.js).

## Composición de archivos

Los archivos que construyen, configuran o reexportan funciones aparecen como componentes
individuales. Las flechas representan imports reales, resueltos al cargar los módulos;
las llamadas durante la operación se muestran en las secuencias siguientes. Cada nombre
identifica un archivo y la tabla conserva su ruta completa.

```mermaid
flowchart TB
    subgraph Component0["Backend"]
        FileConsumableGoodsIssueReportController["consumableGoodsIssueReportController.js"]
        Transport["consumableGoodsIssueReportApiRoute.js"]
    end
    subgraph Component1["Aplicación y requests"]
        Application["createReportApplication.js"]
        FileReport["report.js"]
        HTTP["axiosInstanceApi.js"]
        FileConsumableGoodsIssueService["consumableGoodsIssueService.js"]
        Request["createGoodsIssueRequests.js"]
        FileGoodsIssueService["goodsIssueService.js"]
        FileMaterialGoodsIssueService["materialGoodsIssueService.js"]
        FileReportService["reportService.js"]
    end
    subgraph Component2["Interfaz"]
        FileGoodsIssueContext["goodsIssueContext.js"]
        View["issueDatatable.js"]
        FileGoodsIssueDatatable["goodsIssueDatatable.js"]
    end
    FileReport -->|import| FileReportService
    FileReport -->|import| Application
    FileGoodsIssueDatatable -->|import| FileReport
    FileGoodsIssueDatatable -->|import| View
    FileGoodsIssueDatatable -->|import| FileGoodsIssueContext
    FileConsumableGoodsIssueService -->|import| Request
    FileGoodsIssueService -->|import| FileMaterialGoodsIssueService
    FileGoodsIssueService -->|import| FileConsumableGoodsIssueService
    FileGoodsIssueService -->|import| FileGoodsIssueContext
    FileMaterialGoodsIssueService -->|import| Request
    FileReportService -->|import| HTTP
    FileReportService -->|reexport| FileGoodsIssueService
    Transport -->|import| FileConsumableGoodsIssueReportController
```

## Construcción de funciones para esta operación

El configurador se ejecuta al evaluar su módulo. Después se invoca la función devuelta
por la fábrica, usando el nombre público mostrado en la secuencia.

| Nombre público | Archivo configurador (alias) | Archivo que construye el cuerpo (alias) |
| --- | --- | --- |
| `exportGoodsIssueReport` | `FileReport` | `Application` · `createReportApplication(...)` |
| `exportConsumableGoodsIssueReportRequest` | `FileConsumableGoodsIssueService` | `Request` · `createGoodsIssueRequests(...)` |

## Coordinación de la interfaz

El botón y la descarga se ejecutan en `tableUI.js`; `View` define el callback que arma
los parámetros del recurso. El diálogo devuelve un objeto SweetAlertResult; cancelar
termina la interacción. Un reporte descargado es un Blob, no una actualización del DOM
con `response.data`.
Para reportes por período, currentMonth se calcula en `tableUI.js` con `timeZone.js`.

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant Export@{ "type": "control" } as tableUI.js
    participant Dialog@{ "type": "boundary" } as reportExportDialog.js
    participant View@{ "type": "boundary" } as issueDatatable.js
    participant Application@{ "type": "control" } as createReportApplication.js
    participant FileSwalComponent@{ "type": "control" } as swalComponent.js

    Initiator->>Browser: inicia CU-SAL-21 — Generar reporte de salidas de consumible
    Browser->>Export: buildExcelButton(...).action()
    Export->>Dialog: showReportExportDialog(currentMonth)
    Dialog-->>Export: showReportExportDialog(): Promise[SweetAlertResult] — isConfirmed y value
    alt result.isConfirmed es false
        Export-->>Browser: selección cancelada, sin request
    else Selección confirmada
        Export->>View: request({ monthlyReport, reportMonth, inventoryScope }) — callback del archivo View
        View->>Export: buildTableExportParams(table, paramsDelRecurso)
        Export-->>View: buildTableExportParams(): Object — búsqueda, orden y filtros
        View->>Application: exportGoodsIssueReport(params)
        alt Reporte obtenido
            Application-->>View: exportGoodsIssueReport(): Promise[Blob]
            View-->>Export: request(): Promise[Blob]
            Export->>Browser: URL.createObjectURL(blob)
            Export->>Browser: document.createElement(a)
            Export->>Browser: document.body.appendChild(link)
            Export->>Browser: link.click()
            Export->>Browser: link.remove()
            Export->>Browser: URL.revokeObjectURL(url)
        else Error de reporte
            Application-->>View: error propagado
            View-->>Export: error propagado por request()
            Export->>FileSwalComponent: notifications.showError(message)
        end
    end
```

## Colaboración de aplicación y transporte

La factory de reporte reenvía los argumentos recibidos, sin agregar un objeto `params`.
Los reportes de movimientos reciben `{ context, params }`; los otros reciben `params`
directamente. El request configura `responseType: blob`.

```mermaid
sequenceDiagram
    autonumber
    participant View@{ "type": "boundary" } as issueDatatable.js
    participant Application@{ "type": "control" } as createReportApplication.js
    participant Request@{ "type": "boundary" } as createGoodsIssueRequests.js
    participant HTTP@{ "type": "boundary" } as axiosInstanceApi.js
    participant Transport@{ "type": "control" } as consumableGoodsIssueReportApiRoute.js
    participant FileUtils@{ "type": "control" } as utils.js

    View->>Application: exportGoodsIssueReport(params)
    Application->>Request: exportConsumableGoodsIssueReportRequest(params)
    Request->>HTTP: apiRequest({ method: 'get', url, params, responseType: 'blob' })
    HTTP->>Transport: GET /api/warehouse/reports/goods-issues/consumables/excel
    alt Reporte obtenido
        Transport-->>HTTP: HTTP 200 archivo XLSX
        HTTP-->>Request: apiRequest(): Promise[AxiosResponse] — data Blob
        Request-->>Application: exportConsumableGoodsIssueReportRequest(): Promise[AxiosResponse]
        Application-->>View: exportGoodsIssueReport(): Promise[Blob] — response.data
    else Error HTTP o de reporte
        Transport-->>HTTP: HTTP error
        opt No se inicia renovación: status distinto de 401 o request._retry
            HTTP->>FileUtils: normalizeHttpError(err)
            FileUtils-->>HTTP: normalizeHttpError(): Object
        end
        HTTP-->>Request: error propagado
        Request-->>Application: error propagado
        Application-->>View: error propagado
    end
```

## Detalle de selección del período de reporte

Amplía la preparación del mes y del diálogo. `didOpen` y `preConfirm` son callbacks
definidos en `reportExportDialog.js` y ejecutados por SweetAlert en el navegador.
Seleccionar Otro mes habilita el selector; si no hay mes, `preConfirm` impide confirmar.

```mermaid
sequenceDiagram
    autonumber
    participant Export@{ "type": "control" } as tableUI.js
    participant TimeZone@{ "type": "control" } as timeZone.js
    participant Dialog@{ "type": "boundary" } as reportExportDialog.js
    participant FileSwalComponent@{ "type": "control" } as swalComponent.js
    participant DatePicker@{ "type": "control" } as dateTimePicker.js
    participant Browser as Navegador

    Export->>Export: getCurrentMexicoMonth()
    Export->>TimeZone: getTimeZoneDateTimeParts(new Date())
    TimeZone-->>Export: getTimeZoneDateTimeParts(): Object — year y month
    Export-->>Export: getCurrentMexicoMonth(): string — YYYY-MM
    Export->>Dialog: showReportExportDialog(currentMonth)
    Dialog->>FileSwalComponent: notifications.showDialog({ html, didOpen, preConfirm })
    Browser->>Dialog: didOpen() — callback de SweetAlert
    Dialog->>DatePicker: initMonthPickers()
    opt Selección de un tipo de reporte
        Browser->>Dialog: change — listener de reportType
        Dialog->>DatePicker: setMonthPickerDisabled(monthInput, isDisabled)
    end
    Browser->>Dialog: preConfirm() — callback de SweetAlert
    alt Otro mes seleccionado sin valor
        Dialog->>Browser: Swal.showValidationMessage(message)
    else Selección válida
        Dialog-->>Browser: preConfirm(): Object — type y month
    end
    Dialog-->>Export: showReportExportDialog(): Promise[SweetAlertResult]
```
