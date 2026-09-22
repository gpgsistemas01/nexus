<a id="cu-ida-09"></a>
# `CU-IDA-09` — Generar reporte de usuarios

**Patrones:** `FE-P08`.

```mermaid
sequenceDiagram
    participant Browser as Navegador
    participant View as src/public/js/plugins/datatable/admin/users/userDatatable.js
    participant Dialog as src/public/js/ui/reportExportDialog.js
    participant Application as src/public/js/application/admin/report.js
    participant Request as src/public/js/services/admin/reportService.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant Transport@{ "type": "control" } as src/routes/api/admin/reportApiRoute.js<br/>src/controllers/api/admin/reportController.js

    Browser->>View: Botón Excel de userDatatable.js
    View->>Dialog: showFilteredExportDialog()
    Dialog-->>View: Promise<boolean> con confirmación o cancelación
    View->>Application: exportUserReport({ params })
    Application->>Request: exportUserReportRequest({ params })
    activate Application
    Request->>HTTP: apiRequest({ method: 'get', url, params })
    HTTP->>Transport: descarga GET /api/admin/reports/users/excel
    Transport-->>HTTP: HTTP 2xx { code, data }
    HTTP-->>Request: apiRequest() resuelve response.data
    Request-->>Application: exportUserReportRequest() resuelve response.data
    alt Respuesta exitosa
        Application-->>View: exportUserReport() resuelve response.data
        View-->>Browser: DOM o DataTable actualizado con response.data
    else Respuesta rechazada
        Application-->>View: error Axios normalizado { code, message, meta }
        View-->>Browser: formulario o filtros conservados, mensaje visible
    end
    deactivate Application
```
