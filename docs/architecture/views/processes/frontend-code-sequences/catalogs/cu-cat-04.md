<a id="cu-cat-04"></a>
# `CU-CAT-04` — Generar reporte de proveedores

**Patrones:** `FE-P08`.

```mermaid
sequenceDiagram
    actor Initiator as Administrador del sistema
    participant Browser as Navegador
    participant View as src/public/js/plugins/datatable/warehouse/suppliers/supplierDatatable.js
    participant Dialog as src/public/js/ui/reportExportDialog.js
    participant Application as src/public/js/application/warehouse/report.js
    participant Request as src/public/js/services/warehouse/reportService.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant Transport@{ "type": "control" } as src/routes/api/warehouse/reportApiRoute.js<br/>src/controllers/api/warehouse/reportController.js

    Initiator->>Browser: inicia CU-CAT-04 — Generar reporte de proveedores
    Browser->>View: Botón Excel de supplierDatatable.js
    View->>Dialog: showFilteredExportDialog()
    Dialog-->>View: showFilteredExportDialog(): Promise[boolean]
    View->>Application: exportSupplierReport({ params })
    Application->>Request: exportSupplierReportRequest({ params })
    activate Application
    Request->>HTTP: apiRequest({ method: 'get', url, params })
    HTTP->>Transport: descarga GET /api/warehouse/reports/suppliers/excel
    Transport-->>HTTP: HTTP 2xx { code, data }
    HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
    Request-->>Application: exportSupplierReportRequest(): Promise[AxiosResponse]
    alt Respuesta exitosa
        Application-->>View: exportSupplierReport(): Promise[Blob]
        View-->>Browser: DOM o DataTable actualizado con response.data
    else Respuesta rechazada
        Application-->>View: throw { status: number, data: Object | null, message: string, raw: Error }
        View-->>Browser: formulario o filtros conservados, mensaje visible
    end
    deactivate Application
```

