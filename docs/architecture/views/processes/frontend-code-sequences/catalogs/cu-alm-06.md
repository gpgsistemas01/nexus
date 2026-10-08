<a id="cu-alm-06"></a>
# `CU-ALM-06` — Generar reporte de inventario de materiales

**Patrones:** `FE-P08`.

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant View@{ "type": "boundary" } as src/public/js/plugins/datatable/warehouse/materials/materialDatatable.js
    participant Dialog@{ "type": "boundary" } as src/public/js/ui/reportExportDialog.js
    participant Application@{ "type": "control" } as src/public/js/application/warehouse/report.js
    participant Request as src/public/js/services/warehouse/reportService.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant Transport@{ "type": "control" } as src/routes/api/warehouse/reportApiRoute.js<br/>src/controllers/api/warehouse/reportController.js

    Initiator->>Browser: inicia CU-ALM-06 — Generar reporte de inventario de materiales
    Browser->>View: Botón Excel de materialDatatable.js
    View->>Dialog: showInventoryExportDialog()
    Dialog-->>View: showInventoryExportDialog(): Promise['active' | 'stock']
    View->>Application: exportWarehouseReport({ params })
    activate Application
    Application->>Request: exportWarehouseReportRequest({ params })
    Request->>HTTP: apiRequest({ method: 'get', url, params })
    HTTP->>Transport: descarga GET /api/warehouse/reports/inventory/excel
    alt Respuesta exitosa
        Transport-->>HTTP: HTTP 2xx — respuesta del endpoint
        HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
        Request-->>Application: exportWarehouseReportRequest(): Promise[AxiosResponse]
        Application-->>View: exportWarehouseReport(): Promise[Blob]
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

