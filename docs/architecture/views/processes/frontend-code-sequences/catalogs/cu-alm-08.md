<a id="cu-alm-08"></a>
# `CU-ALM-08` — Generar reporte de movimientos de materiales

**Patrones:** `FE-P08`.

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Administrador del sistema
    participant Browser as Navegador
    participant View@{ "type": "boundary" } as src/public/js/plugins/datatable/admin/movements/movementDatatable.js
    participant Dialog@{ "type": "boundary" } as src/public/js/ui/reportExportDialog.js
    participant Application@{ "type": "control" } as src/public/js/application/admin/report.js
    participant Request as src/public/js/services/admin/reportService.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant Transport@{ "type": "control" } as src/routes/api/admin/reportApiRoute.js<br/>src/controllers/api/admin/reportController.js

    Initiator->>Browser: inicia CU-ALM-08 — Generar reporte de movimientos de materiales
    Browser->>View: Botón Excel de movimientos en contexto material
    View->>Dialog: showReportExportDialog(currentMonth)
    Dialog-->>View: showReportExportDialog(): Promise[boolean]
    View->>Application: exportMovementReport({ params, type: materials })
    activate Application
    Application->>Request: exportMovementReportRequest({ params, type: materials })
    Request->>HTTP: apiRequest({ method: 'get', url, params })
    HTTP->>Transport: descarga GET /api/admin/reports/movements/materials/excel
    alt Respuesta exitosa
        Transport-->>HTTP: HTTP 2xx — respuesta del endpoint
        HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
        Request-->>Application: exportMovementReportRequest(): Promise[AxiosResponse]
        Application-->>View: exportMovementReport(): Promise[Blob]
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

