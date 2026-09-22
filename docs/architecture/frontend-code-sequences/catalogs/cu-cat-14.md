<a id="cu-cat-14"></a>
# `CU-CAT-14` — Editar rol

**Patrones:** `FE-P03`.

```mermaid
sequenceDiagram
    participant Browser as Navegador
    participant View as src/public/js/pages/admin/catalogs/catalogForm.js
    participant Application as src/public/js/application/admin/catalogs/catalogs.js
    participant Request as src/public/js/services/admin/catalogService.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant Transport@{ "type": "control" } as src/routes/api/admin/catalogApiRoute.js<br/>src/controllers/api/admin/catalogController.js

    Browser->>View: confirmar el formulario de edición
    View->>Application: editCatalogEntry({ catalog, id, data })
    Application->>Request: editCatalogEntryRequest({ catalog, id, data })
    activate Application
    Request->>HTTP: apiRequest({ method: 'put', url, data })
    HTTP->>Transport: consume PUT /api/admin/catalogs/roles/:id
    Transport-->>HTTP: HTTP 2xx { code, data }
    HTTP-->>Request: apiRequest() resuelve response.data
    Request-->>Application: editCatalogEntryRequest() resuelve response.data
    alt Respuesta exitosa
        Application-->>View: editCatalogEntry() resuelve response.data
        View-->>Browser: DOM o DataTable actualizado con response.data
    else Respuesta rechazada
        Application-->>View: error Axios normalizado { code, message, meta }
        View-->>Browser: formulario o filtros conservados, mensaje visible
    end
    deactivate Application
```

