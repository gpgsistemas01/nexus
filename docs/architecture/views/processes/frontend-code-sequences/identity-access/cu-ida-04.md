<a id="cu-ida-04"></a>
# `CU-IDA-04` — Generar reporte de personas

**Patrones:** `FE-P08`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `View` | boundary | [`personDatatable.js`](../../../../../../src/public/js/plugins/datatable/admin/persons/personDatatable.js) |
| `Dialog` | boundary | [`reportExportDialog.js`](../../../../../../src/public/js/ui/reportExportDialog.js) |
| `Application` | control | [`createReportApplication.js`](../../../../../../src/public/js/application/createReportApplication.js) |
| `Request` | boundary | [`reportService.js`](../../../../../../src/public/js/services/admin/reportService.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `Transport` | control | [`reportController.js`](../../../../../../src/controllers/api/admin/reportController.js) |

La línea `Application` ejecuta la función generada en `createReportApplication.js`. Su nombre público y la configuración de requests/contratos provienen de [`report.js`](../../../../../../src/public/js/application/admin/report.js); exportar esa función no crea otra llamada durante cada petición.

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

    Initiator->>Browser: inicia CU-IDA-04 — Generar reporte de personas
    Browser->>View: Botón Excel de personDatatable.js
    View->>Dialog: showFilteredExportDialog()
    activate Dialog
    Dialog-->>View: showFilteredExportDialog(): Promise[boolean]
    deactivate Dialog
    View->>Application: exportPersonReport({ params })
    activate Application
    Application->>Request: exportPersonReportRequest({ params })
    Request->>HTTP: apiRequest({ method: 'get', url, params })
    HTTP->>Transport: descarga GET /api/admin/reports/persons/excel
    alt Respuesta exitosa
        Transport-->>HTTP: HTTP 2xx — respuesta del endpoint
        HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
        Request-->>Application: exportPersonReportRequest(): Promise[AxiosResponse]
        Application-->>View: exportPersonReport(): Promise[Blob]
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

