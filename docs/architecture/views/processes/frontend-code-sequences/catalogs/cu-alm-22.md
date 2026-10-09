<a id="cu-alm-22"></a>
# `CU-ALM-22` — Generar reporte de inventario de consumibles

**Patrones:** `FE-P08`.

## Participantes y trazabilidad

Los nombres breves del diagrama corresponden a los archivos vinculados siguientes.
La ruta completa se conserva en cada enlace, fuera de la cabecera visual. Un participante
puede agrupar colaboradores del mismo rol; esa agrupación no implica una clase ni un
proceso independiente. Los retornos representan el resultado o error propagado.

| Alias | Rol visual | Archivos de implementación |
| --- | --- | --- |
| `View` | boundary | [`consumableDatatable.js`](../../../../../../src/public/js/plugins/datatable/warehouse/consumables/consumableDatatable.js) |
| `Dialog` | boundary | [`reportExportDialog.js`](../../../../../../src/public/js/ui/reportExportDialog.js) |
| `Application` | control | [`report.js`](../../../../../../src/public/js/application/warehouse/report.js) |
| `Request` | boundary | [`reportService.js`](../../../../../../src/public/js/services/warehouse/reportService.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `Transport` | control | [`reportApiRoute.js`](../../../../../../src/routes/api/warehouse/reportApiRoute.js)<br/>[`reportController.js`](../../../../../../src/controllers/api/warehouse/reportController.js) |

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant View@{ "type": "boundary" } as Pantalla / formulario
    participant Dialog@{ "type": "boundary" } as Diálogo
    participant Application@{ "type": "control" } as Application
    participant Request@{ "type": "boundary" } as Requests del recurso
    participant HTTP@{ "type": "boundary" } as Cliente HTTP
    participant Transport@{ "type": "control" } as Endpoint API

    Initiator->>Browser: inicia CU-ALM-22 — Generar reporte de inventario de consumibles
    Browser->>View: Botón Excel de consumableDatatable.js
    View->>Dialog: showInventoryExportDialog()
    activate Dialog
    Dialog-->>View: showInventoryExportDialog(): Promise[SweetAlertResult ({ inventoryScope: activeOrStock | active | inStock })]
    deactivate Dialog
    View->>Application: exportWarehouseReport({ ...params, type: CONSUMABLE, inventoryScope })
    activate Application
    Application->>Request: exportWarehouseReportRequest(params)
    Request->>HTTP: apiRequest({ method: 'get', url, params, responseType: 'blob' })
    HTTP->>Transport: descarga GET /api/warehouse/reports/inventory/excel
    activate Transport
    Transport-->>HTTP: HTTP 200 archivo XLSX
    deactivate Transport
    HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
    Request-->>Application: exportWarehouseReportRequest(): Promise[AxiosResponse]
    alt Respuesta exitosa
        Application-->>View: exportWarehouseReport(): Promise[Blob]
        View-->>Browser: descarga del Blob devuelto
    else Respuesta rechazada
        Application-->>View: throw { status: number, data: Object | null, message: string, raw: Error }
        View-->>Browser: formulario o filtros conservados, mensaje visible
    end
    deactivate Application
```
