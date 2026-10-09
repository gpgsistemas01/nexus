<a id="cu-alm-08"></a>
# `CU-ALM-08` — Generar reporte de movimientos de materiales

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
| `View` | boundary | [`movementDatatable.js`](../../../../../../src/public/js/plugins/datatable/admin/movements/movementDatatable.js) |
| `Dialog` | boundary | [`reportExportDialog.js`](../../../../../../src/public/js/ui/reportExportDialog.js) |
| `Application` | control | [`createReportApplication.js`](../../../../../../src/public/js/application/createReportApplication.js) |
| `Request` | boundary | [`reportService.js`](../../../../../../src/public/js/services/admin/reportService.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `Transport` | control | [`reportApiRoute.js`](../../../../../../src/routes/api/admin/reportApiRoute.js) |
| `FileReportController` | control | [`reportController.js`](../../../../../../src/controllers/api/admin/reportController.js) |
| `FileReport` | control | [`report.js`](../../../../../../src/public/js/application/admin/report.js) |
| `FileUtils` | control | [`utils.js`](../../../../../../src/public/js/api/utils.js) |
| `Export` | control | [`tableUI.js`](../../../../../../src/public/js/ui/tableUI.js) |
| `FileSwalComponent` | control | [`swalComponent.js`](../../../../../../src/public/js/plugins/swal/swalComponent.js) |
| `TimeZone` | control | [`timeZone.js`](../../../../../../src/public/js/utils/timeZone.js) |
| `DatePicker` | control | [`dateTimePicker.js`](../../../../../../src/public/js/plugins/flatpickr/dateTimePicker.js) |

### Configuración y construcción

El endpoint queda representado por su router. El controller asociado se desarrolla en la [secuencia backend `CU-ALM-08`](../../backend-code-sequences/catalogs/cu-alm-08.md#cu-alm-08): [`reportController.js`](../../../../../../src/controllers/api/admin/reportController.js).

La línea `Application` ejecuta la función generada en `createReportApplication.js`. Su nombre público y la configuración de requests/contratos provienen de [`report.js`](../../../../../../src/public/js/application/admin/report.js); exportar esa función no crea otra llamada durante cada petición.

## Composición de archivos

Los archivos que construyen, configuran o reexportan funciones aparecen como componentes
individuales. Las flechas representan imports reales, resueltos al cargar los módulos;
las llamadas durante la operación se muestran en las secuencias siguientes. Cada nombre
identifica un archivo y la tabla conserva su ruta completa.

```mermaid
flowchart TB
    subgraph Component0["Backend"]
        FileReportController["reportController.js"]
        Transport["reportApiRoute.js"]
    end
    subgraph Component1["Aplicación y requests"]
        FileReport["report.js"]
        Application["createReportApplication.js"]
        Request["reportService.js"]
    end
    subgraph Component2["Interfaz"]
        View["movementDatatable.js"]
    end
    FileReport -->|import| Request
    FileReport -->|import| Application
    View -->|import| FileReport
    Transport -->|import| FileReportController
```

## Construcción de funciones para esta operación

El configurador se ejecuta al evaluar su módulo. Después se invoca la función devuelta
por la fábrica, usando el nombre público mostrado en la secuencia.

| Nombre público | Archivo configurador (alias) | Archivo que construye el cuerpo (alias) |
| --- | --- | --- |
| `exportMovementReport` | `FileReport` | `Application` · `createReportApplication(...)` |

## Coordinación de la interfaz

El botón y la descarga se ejecutan en `tableUI.js`; `View` define el callback que arma
los parámetros del recurso. El diálogo devuelve un objeto SweetAlertResult; cancelar
termina la interacción. Un reporte descargado es un Blob, no una actualización del DOM
con `response.data`.
Para reportes por período, currentMonth se calcula en `tableUI.js` con `timeZone.js`.

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Administrador del sistema
    participant Browser as Navegador
    participant Export@{ "type": "control" } as tableUI.js
    participant Dialog@{ "type": "boundary" } as reportExportDialog.js
    participant View@{ "type": "boundary" } as movementDatatable.js
    participant Application@{ "type": "control" } as createReportApplication.js
    participant FileSwalComponent@{ "type": "control" } as swalComponent.js

    Initiator->>Browser: inicia CU-ALM-08 — Generar reporte de movimientos de materiales
    Browser->>Export: buildExcelButton(...).action()
    Export->>Dialog: showReportExportDialog(currentMonth)
    Dialog-->>Export: showReportExportDialog(): Promise[SweetAlertResult] — isConfirmed y value
    alt result.isConfirmed es false
        Export-->>Browser: selección cancelada, sin request
    else Selección confirmada
        Export->>View: request({ monthlyReport, reportMonth, inventoryScope }) — callback del archivo View
        View->>Export: buildTableExportParams(table, paramsDelRecurso)
        Export-->>View: buildTableExportParams(): Object — búsqueda, orden y filtros
        View->>Application: exportMovementReport({ context: materials, params })
        alt Reporte obtenido
            Application-->>View: exportMovementReport(): Promise[Blob]
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
    participant View@{ "type": "boundary" } as movementDatatable.js
    participant Application@{ "type": "control" } as createReportApplication.js
    participant Request@{ "type": "boundary" } as reportService.js
    participant HTTP@{ "type": "boundary" } as axiosInstanceApi.js
    participant Transport@{ "type": "control" } as reportApiRoute.js
    participant FileUtils@{ "type": "control" } as utils.js

    View->>Application: exportMovementReport({ context: materials, params })
    Application->>Request: exportMovementReportRequest({ context: materials, params })
    Request->>HTTP: apiRequest({ method: 'get', url, params, responseType: 'blob' })
    HTTP->>Transport: GET /api/admin/reports/movements/materials/excel
    alt Reporte obtenido
        Transport-->>HTTP: HTTP 200 archivo XLSX
        HTTP-->>Request: apiRequest(): Promise[AxiosResponse] — data Blob
        Request-->>Application: exportMovementReportRequest(): Promise[AxiosResponse]
        Application-->>View: exportMovementReport(): Promise[Blob] — response.data
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
