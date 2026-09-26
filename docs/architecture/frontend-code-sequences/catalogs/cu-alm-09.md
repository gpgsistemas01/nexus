<a id="cu-alm-09"></a>
# `CU-ALM-09` — Consultar mermas

**Patrones:** `FE-P02`.

```mermaid
sequenceDiagram
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant View as src/views/pages/warehouse/wastes/wastesPage.ejs<br/>src/public/js/pages/warehouse/wastes/wastesPage.js
    participant Application as src/public/js/application/warehouse/wastes/wastes.js
    participant Request as src/public/js/services/warehouse/wasteService.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant Transport@{ "type": "control" } as src/routes/api/warehouse/wasteApiRoute.js<br/>src/controllers/api/warehouse/wasteController.js

    Initiator->>Browser: inicia CU-ALM-09 — Consultar mermas
    Browser->>View: wastesPage.ejs y wastesPage.js cargan mermas
    View->>Application: getAllWastes({ params })
    Application->>Request: getAllWastesRequest({ params })
    activate Application
    Request->>HTTP: apiRequest({ method: 'get', url, params })
    HTTP->>Transport: consulta GET /api/warehouse/wastes
    Transport-->>HTTP: HTTP 2xx { code, data }
    HTTP-->>Request: apiRequest() resuelve response.data
    Request-->>Application: getAllWastesRequest() resuelve response.data
    alt Respuesta exitosa
        Application-->>View: getAllWastes() resuelve response.data
        View-->>Browser: DOM o DataTable actualizado con response.data
    else Respuesta rechazada
        Application-->>View: error Axios normalizado { code, message, meta }
        View-->>Browser: formulario o filtros conservados, mensaje visible
    end
    deactivate Application
```

