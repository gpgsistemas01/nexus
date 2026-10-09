<a id="cu-sal-21"></a>
# `CU-SAL-21` — Generar reporte de salidas de consumible

**Patrones:** `FE-P08`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `View` | boundary | [`goodsIssueDatatable.js`](../../../../../../src/public/js/plugins/datatable/warehouse/goodsIssues/goodsIssueDatatable.js) |
| `Export` | control | [`tableUI.js`](../../../../../../src/public/js/ui/tableUI.js) |
| `Dialog` | boundary | [`reportExportDialog.js`](../../../../../../src/public/js/ui/reportExportDialog.js) |
| `Application` | control | [`createReportApplication.js`](../../../../../../src/public/js/application/createReportApplication.js) |
| `Request` | boundary | [`createGoodsIssueRequests.js`](../../../../../../src/public/js/services/warehouse/goodsIssues/createGoodsIssueRequests.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `Transport` | control | [`consumableGoodsIssueReportApiRoute.js`](../../../../../../src/routes/api/warehouse/goodsIssues/consumables/consumableGoodsIssueReportApiRoute.js) |

### Configuración y archivos de contexto

Estos módulos seleccionan/configuran y exportan la función de aplicación. Su cuerpo se ejecuta en la fábrica de la línea `Application`, sin una llamada intermedia entre reexports: [`report.js`](../../../../../../src/public/js/application/warehouse/report.js).

Estos módulos configuran o reexportan el request. La función que llama a `apiRequest` está definida en el archivo de la línea `Request`: [`reportService.js`](../../../../../../src/public/js/services/warehouse/reportService.js), [`consumableGoodsIssueService.js`](../../../../../../src/public/js/services/warehouse/goodsIssues/consumables/consumableGoodsIssueService.js).

El endpoint queda representado por su router. El controller asociado se desarrolla en la [secuencia backend `CU-SAL-21`](../../backend-code-sequences/issues/cu-sal-21.md#cu-sal-21): [`consumableGoodsIssueReportController.js`](../../../../../../src/controllers/api/warehouse/goodsIssues/consumables/consumableGoodsIssueReportController.js).

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant View@{ "type": "boundary" } as Pantalla JS
    participant Export@{ "type": "control" } as Descarga
    participant Dialog@{ "type": "boundary" } as Diálogo
    participant Application@{ "type": "control" } as Application
    participant Request@{ "type": "boundary" } as Requests del recurso
    participant HTTP@{ "type": "boundary" } as Cliente HTTP
    participant Transport@{ "type": "control" } as Endpoint API

    Note over Application: Closure configurada

    Note over Request: Request configurado

    Initiator->>Browser: inicia CU-SAL-21 — Generar reporte de salidas de consumible
    Browser->>Export: buildExcelButton(...).action()
    Export->>Dialog: showReportExportDialog(getCurrentMexicoMonth())
    activate Dialog
    Dialog-->>Export: showReportExportDialog(): Promise[Object] con isConfirmed y value
    deactivate Dialog
    alt Selección cancelada
        Export-->>Browser: no se solicita el reporte
    else Selección confirmada
        Export->>View: request({ monthlyReport, reportMonth, inventoryScope })
        View->>Application: exportGoodsIssueReport(params)
        Application->>Request: exportConsumableGoodsIssueReportRequest(params)
        Request->>HTTP: apiRequest({ method: 'get', url, params, responseType: 'blob' })
        HTTP->>Transport: GET /api/warehouse/reports/goods-issues/consumables/excel
        alt Exportación exitosa
            Transport-->>HTTP: HTTP 200 archivo XLSX
            HTTP-->>Request: apiRequest(): Promise[AxiosResponse] con data Blob
            Request-->>Application: exportConsumableGoodsIssueReportRequest(): Promise[AxiosResponse]
            Application-->>View: exportGoodsIssueReport(): Promise[Blob]
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
