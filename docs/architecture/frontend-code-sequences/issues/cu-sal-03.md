<a id="cu-sal-03"></a>
# `CU-SAL-03` — Editar encabezado de salida de material

**Patrones:** `FE-P05`.

```mermaid
sequenceDiagram
    participant Browser as Navegador
    participant View as src/public/js/pages/warehouse/goodsIssues/goodsIssueModal.js
    participant Application as src/public/js/application/warehouse/goodsIssues/goodsIssues.js
    participant Request as src/public/js/services/warehouse/goodsIssueService.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant Transport@{ "type": "control" } as src/routes/api/warehouse/goodsIssueApiRoute.js<br/>src/controllers/api/warehouse/goodsIssueController.js

    Browser->>View: Modo encabezado de goodsIssueModal.js
    View->>Application: editGoodsIssueHeader({ id, formData })
    Application->>Request: editGoodsIssueHeaderRequest({ id, formData })
    activate Application
    Request->>HTTP: apiRequest({ method: 'patch', url, data })
    HTTP->>Transport: envía PATCH /api/warehouse/goods-issues/:id/header
    Transport-->>HTTP: HTTP 2xx { code, data }
    HTTP-->>Request: apiRequest() resuelve response.data
    Request-->>Application: editGoodsIssueHeaderRequest() resuelve response.data
    alt Respuesta exitosa
        Application-->>View: editGoodsIssueHeader() resuelve response.data
        View-->>Browser: DOM o DataTable actualizado con response.data
    else Respuesta rechazada
        Application-->>View: error Axios normalizado { code, message, meta }
        View-->>Browser: formulario o filtros conservados, mensaje visible
    end
    deactivate Application
```

