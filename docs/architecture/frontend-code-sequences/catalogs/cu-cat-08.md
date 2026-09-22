<a id="cu-cat-08"></a>
# `CU-CAT-08` — Generar reporte de clientes

**Patrones:** `FE-P08`.

```mermaid
sequenceDiagram
    participant Browser as Navegador
    participant View as src/public/js/plugins/datatable/sales/clients/clientDatatable.js
    participant Dialog as src/public/js/ui/reportExportDialog.js
    participant Application as src/public/js/application/sales/report.js
    participant Request as src/public/js/services/sales/reportService.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant Transport@{ "type": "control" } as src/routes/api/sales/reportApiRoute.js<br/>src/controllers/api/sales/reportController.js

    Browser->>View: Botón Excel de clientDatatable.js
    View->>Dialog: showFilteredExportDialog()
    Dialog-->>View: Promise<boolean> con confirmación o cancelación
    View->>Application: exportClientReport({ params })
    Application->>Request: exportClientReportRequest({ params })
    activate Application
    Request->>HTTP: apiRequest({ method: 'get', url, params })
    HTTP->>Transport: descarga GET /api/sales/reports/clients/excel
    Transport-->>HTTP: HTTP 2xx { code, data }
    HTTP-->>Request: apiRequest() resuelve response.data
    Request-->>Application: exportClientReportRequest() resuelve response.data
    alt Respuesta exitosa
        Application-->>View: exportClientReport() resuelve response.data
        View-->>Browser: DOM o DataTable actualizado con response.data
    else Respuesta rechazada
        Application-->>View: error Axios normalizado { code, message, meta }
        View-->>Browser: formulario o filtros conservados, mensaje visible
    end
    deactivate Application
```

