<a id="cu-ida-02"></a>
# `CU-IDA-02` — Crear persona

**Patrones:** `FE-P02`.

```mermaid
sequenceDiagram
    participant Browser as Navegador
    participant View as src/public/js/pages/admin/persons/personModal.js<br/>src/public/js/pages/admin/persons/personForm.js
    participant Application as src/public/js/application/admin/persons/persons.js
    participant Request as src/public/js/services/admin/personService.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant Transport@{ "type": "control" } as src/routes/api/admin/personApiRoute.js<br/>src/controllers/api/admin/personController.js

    Browser->>View: personModal.js abre personForm.js en modo alta
    View->>Application: registerPerson({ formData })
    Application->>Request: registerPersonRequest({ formData })
    activate Application
    Request->>HTTP: apiRequest({ method: 'post', url, data })
    HTTP->>Transport: envía POST /api/admin/persons
    Transport-->>HTTP: HTTP 2xx { code, data }
    HTTP-->>Request: apiRequest() resuelve response.data
    Request-->>Application: registerPersonRequest() resuelve response.data
    alt Respuesta exitosa
        Application-->>View: registerPerson() resuelve response.data
        View-->>Browser: DOM o DataTable actualizado con response.data
    else Respuesta rechazada
        Application-->>View: error Axios normalizado { code, message, meta }
        View-->>Browser: formulario o filtros conservados, mensaje visible
    end
    deactivate Application
```

