<a id="cu-alm-22"></a>
# `CU-ALM-22` — Generar reporte de inventario de consumibles

**Patrones:** `FE-P08`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `View` | boundary | [`consumableDatatable.js`](../../../../../../src/public/js/plugins/datatable/warehouse/consumables/consumableDatatable.js) |
| `Dialog` | boundary | [`reportExportDialog.js`](../../../../../../src/public/js/ui/reportExportDialog.js) |
| `Application` | control | [`createReportApplication.js`](../../../../../../src/public/js/application/createReportApplication.js) |
| `Request` | boundary | [`reportService.js`](../../../../../../src/public/js/services/warehouse/reportService.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `Transport` | control | [`reportApiRoute.js`](../../../../../../src/routes/api/warehouse/reportApiRoute.js) |

### Configuración y archivos de contexto

El endpoint queda representado por su router. El controller asociado se desarrolla en la [secuencia backend `CU-ALM-22`](../../backend-code-sequences/catalogs/cu-alm-22.md#cu-alm-22): [`reportController.js`](../../../../../../src/controllers/api/warehouse/reportController.js).

La línea `Application` ejecuta la función generada en `createReportApplication.js`. Su nombre público y la configuración de requests/contratos provienen de [`report.js`](../../../../../../src/public/js/application/warehouse/report.js); exportar esa función no crea otra llamada durante cada petición.

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant View@{ "type": "boundary" } as Pantalla JS
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
