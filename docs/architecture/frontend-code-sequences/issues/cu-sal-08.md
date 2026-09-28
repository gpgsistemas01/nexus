<a id="cu-sal-08"></a>
# `CU-SAL-08` — Consultar salidas de merma

**Patrones:** `FE-P05`.

```mermaid
sequenceDiagram
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant View as src/views/pages/warehouse/wasteIssues/wasteIssuesPage.ejs
    participant Application as src/public/js/application/warehouse/wasteIssues/wasteIssues.js
    participant Request as src/public/js/services/warehouse/wasteIssueService.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant Transport@{ "type": "control" } as src/routes/api/warehouse/wasteIssueApiRoute.js<br/>src/controllers/api/warehouse/wasteIssueController.js

    Initiator->>Browser: inicia CU-SAL-08 — Consultar salidas de merma
    Browser->>View: wasteIssuesPage.ejs y su DataTable cargan salidas de merma
    View->>Application: getAllWasteIssues({ params })
    Application->>Request: getAllWasteIssuesRequest({ params })
    activate Application
    Request->>HTTP: apiRequest({ method: 'get', url, params })
    HTTP->>Transport: consulta GET /api/warehouse/waste-issues
    Transport-->>HTTP: HTTP 2xx { code, data }
    HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
    Request-->>Application: getAllWasteIssuesRequest(): Promise[AxiosResponse]
    alt Respuesta exitosa
        Application-->>View: getAllWasteIssues(): Promise[AxiosResponse]
        View-->>Browser: DOM o DataTable actualizado con response.data
    else Respuesta rechazada
        Application-->>View: throw { status: number, data: Object | null, message: string, raw: Error }
        View-->>Browser: formulario o filtros conservados, mensaje visible
    end
    deactivate Application
```

