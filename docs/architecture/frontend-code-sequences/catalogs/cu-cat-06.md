<a id="cu-cat-06"></a>
# `CU-CAT-06` — Crear cliente

**Patrones:** `FE-P02`.

```mermaid
sequenceDiagram
    participant Browser as Navegador
    participant View as src/public/js/pages/sales/clients/clientModal.js<br/>src/public/js/pages/sales/clients/clientForm.js
    participant Application as src/public/js/application/sales/clients/clients.js
    participant Request as src/public/js/services/sales/clientService.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant Transport@{ "type": "control" } as src/routes/api/sales/clientApiRoute.js<br/>src/controllers/api/sales/clientController.js

    Browser->>View: clientModal.js abre clientForm.js en alta
    View->>View: validateFields(clientValidation, formData)
    alt clientValidation devuelve errores
        View-->>Browser: useForm.getErrors() conserva datos y muestra errores por campo
    else Formulario válido
        View->>Application: registerClient({ formData })
        Application->>Request: createClientRequest({ formData })
        activate Application
        Request->>HTTP: apiRequest({ method: 'post', url, data })
        HTTP->>Transport: envía POST /api/sales/clients
        Transport-->>HTTP: HTTP 2xx { code, data }
        HTTP-->>Request: apiRequest() resuelve response.data
        Request-->>Application: createClientRequest() resuelve response.data
        alt Respuesta exitosa
            Application-->>View: registerClient() resuelve response.data
            View-->>Browser: DOM o DataTable actualizado con response.data
        else Respuesta rechazada
            Application-->>View: error Axios normalizado { code, message, meta }
            View-->>Browser: formulario o filtros conservados, mensaje visible
        end
        deactivate Application
    end
```

