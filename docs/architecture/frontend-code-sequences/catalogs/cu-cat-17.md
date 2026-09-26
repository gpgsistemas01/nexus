<a id="cu-cat-17"></a>
# `CU-CAT-17` — Editar presentación

**Patrones:** `FE-P03`.

```mermaid
sequenceDiagram
    actor Initiator as Administrador del sistema
    participant Browser as Navegador
    participant View as src/public/js/pages/admin/catalogs/catalogForm.js
    participant Application as src/public/js/application/admin/catalogs/catalogs.js
    participant Request as src/public/js/services/admin/catalogService.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant Transport@{ "type": "control" } as src/routes/api/admin/catalogApiRoute.js<br/>src/controllers/api/admin/catalogController.js

    Initiator->>Browser: inicia CU-CAT-17 — Editar presentación
    Browser->>View: confirmar el formulario de edición
    View->>View: validateFields(catalogValidation, formData)
    alt catalogValidation devuelve errores
        View-->>Browser: useForm.getErrors() conserva datos y muestra errores por campo
    else Formulario válido
        View->>Application: editCatalogEntry({ catalog, id, data })
        Application->>Request: editCatalogEntryRequest({ catalog, id, data })
        activate Application
        Request->>HTTP: apiRequest({ method: 'put', url, data })
        HTTP->>Transport: consume PUT /api/admin/catalogs/presentations/:id
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
    end
```

