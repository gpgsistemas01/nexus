<a id="cu-ent-06"></a>
# `CU-ENT-06` — Generar reporte de compras de material

**Patrones:** `FE-P08`.

```mermaid
sequenceDiagram
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant View as src/public/js/plugins/datatable/warehouse/goodsReceipts/goodsReceiptDatatable.js
    participant Export as src/public/js/ui/tableUI.js
    participant Dialog as src/public/js/ui/reportExportDialog.js
    participant Application as src/public/js/application/warehouse/report.js<br/>src/public/js/application/createReportApplication.js
    participant Request as src/public/js/services/warehouse/reportService.js<br/>src/public/js/services/warehouse/goodsReceipts/materials/materialGoodsReceiptService.js<br/>src/public/js/services/warehouse/goodsReceipts/createGoodsReceiptRequests.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant Transport@{ "type": "control" } as src/routes/api/warehouse/goodsReceipts/materials/materialGoodsReceiptReportApiRoute.js<br/>src/controllers/api/warehouse/goodsReceipts/materials/materialGoodsReceiptReportController.js

    Initiator->>Browser: inicia CU-ENT-06 — Generar reporte de compras de material
    Browser->>Export: buildExcelButton(...).action()
    Export->>Dialog: showReportExportDialog(getCurrentMexicoMonth())
    Dialog-->>Export: showReportExportDialog(): Promise[Object] con isConfirmed y value
    alt Selección cancelada
        Export-->>Browser: no se solicita el reporte
    else Selección confirmada
        Export->>View: request({ monthlyReport, reportMonth, inventoryScope })
        View->>Application: exportGoodsReceiptReport(params)
        Application->>Request: exportMaterialGoodsReceiptReportRequest(params)
        Request->>HTTP: apiRequest({ method: 'get', url, params, responseType: 'blob' })
        HTTP->>Transport: GET /api/warehouse/reports/goods-receipts/materials/excel
        alt Exportación exitosa
            Transport-->>HTTP: HTTP 200 archivo XLSX
            HTTP-->>Request: apiRequest(): Promise[AxiosResponse] con data Blob
            Request-->>Application: exportMaterialGoodsReceiptReportRequest(): Promise[AxiosResponse]
            Application-->>View: exportGoodsReceiptReport(): Promise[Blob]
            View-->>Export: request(): Promise[Blob]
            Export->>Browser: URL.createObjectURL(blob), link.click(), link.remove(), URL.revokeObjectURL(url)
        else Error HTTP o de exportación
            Transport-->>HTTP: HTTP de error { code, message }
            HTTP-->>Request: error normalizado
            Request-->>Application: error propagado
            Application-->>Export: error propagado
            Export->>Browser: notifications.showError(message)
        end
    end
```
