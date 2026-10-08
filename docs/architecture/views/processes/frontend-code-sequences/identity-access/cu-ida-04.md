<a id="cu-ida-04"></a>
# `CU-IDA-04` — Generar reporte de personas

**Patrones:** `FE-P08`.

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant View@{ "type": "boundary" } as src/public/js/plugins/datatable/admin/persons/personDatatable.js
    participant Dialog@{ "type": "boundary" } as src/public/js/ui/reportExportDialog.js
    participant Application@{ "type": "control" } as src/public/js/application/admin/report.js
    participant Request as src/public/js/services/admin/reportService.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant Transport@{ "type": "control" } as src/controllers/api/admin/reportController.js

    Initiator->>Browser: inicia CU-IDA-04 — Generar reporte de personas
    Browser->>View: Botón Excel de personDatatable.js
    View->>Dialog: showFilteredExportDialog()
    Dialog-->>View: showFilteredExportDialog(): Promise[boolean]
    View->>Application: exportPersonReport({ params })
    activate Application
    Application->>Request: exportPersonReportRequest({ params })
    Request->>HTTP: apiRequest({ method: 'get', url, params })
    HTTP->>Transport: descarga GET /api/admin/reports/persons/excel
    alt Respuesta exitosa
        Transport-->>HTTP: HTTP 2xx — respuesta del endpoint
        HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
        Request-->>Application: exportPersonReportRequest(): Promise[AxiosResponse]
        Application-->>View: exportPersonReport(): Promise[Blob]
        View-->>Browser: DOM o DataTable actualizado con response.data
    else Respuesta rechazada
        Transport-->>HTTP: HTTP de error — respuesta del endpoint
        HTTP-->>Request: apiRequest(): throw { status: number, data: Object | null, message: string, raw: Error }
        Request-->>Application: throw { status: number, data: Object | null, message: string, raw: Error }
        Application-->>View: throw { status: number, data: Object | null, message: string, raw: Error }
        View-->>Browser: formulario o filtros conservados, mensaje visible
    end
    deactivate Application
```

