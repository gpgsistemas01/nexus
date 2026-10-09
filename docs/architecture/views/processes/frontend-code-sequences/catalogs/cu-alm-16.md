<a id="cu-alm-16"></a>
# `CU-ALM-16` — Generar reporte de movimientos de mermas

**Patrones:** `FE-P08`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `View` | boundary | [`movementDatatable.js`](../../../../../../src/public/js/plugins/datatable/admin/movements/movementDatatable.js) |
| `Dialog` | boundary | [`reportExportDialog.js`](../../../../../../src/public/js/ui/reportExportDialog.js) |
| `Application` | control | [`createReportApplication.js`](../../../../../../src/public/js/application/createReportApplication.js) |
| `Request` | boundary | [`reportService.js`](../../../../../../src/public/js/services/admin/reportService.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `Transport` | control | [`reportApiRoute.js`](../../../../../../src/routes/api/admin/reportApiRoute.js) |

### Configuración y archivos de contexto

El endpoint queda representado por su router. El controller asociado se desarrolla en la [secuencia backend `CU-ALM-16`](../../backend-code-sequences/catalogs/cu-alm-16.md#cu-alm-16): [`reportController.js`](../../../../../../src/controllers/api/admin/reportController.js).

La línea `Application` ejecuta la función generada en `createReportApplication.js`. Su nombre público y la configuración de requests/contratos provienen de [`report.js`](../../../../../../src/public/js/application/admin/report.js); exportar esa función no crea otra llamada durante cada petición.

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Administrador del sistema
    participant Browser as Navegador
    participant View@{ "type": "boundary" } as Pantalla JS
    participant Dialog@{ "type": "boundary" } as Diálogo
    participant Application@{ "type": "control" } as Application
    participant Request@{ "type": "boundary" } as Requests del recurso
    participant HTTP@{ "type": "boundary" } as Cliente HTTP
    participant Transport@{ "type": "control" } as Endpoint API

    Initiator->>Browser: inicia CU-ALM-16 — Generar reporte de movimientos de mermas
    Browser->>View: Botón Excel de movimientos en contexto merma
    View->>Dialog: showReportExportDialog(currentMonth)
    activate Dialog
    Dialog-->>View: showReportExportDialog(): Promise[boolean]
    deactivate Dialog
    View->>Application: exportMovementReport({ params, type: wastes })
    activate Application
    Application->>Request: exportMovementReportRequest({ params, type: wastes })
    Request->>HTTP: apiRequest({ method: 'get', url, params })
    HTTP->>Transport: descarga GET /api/admin/reports/movements/wastes/excel
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
