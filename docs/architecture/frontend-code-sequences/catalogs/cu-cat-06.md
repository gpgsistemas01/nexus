<a id="cu-cat-06"></a>
# `CU-CAT-06` — Crear cliente

**Patrones:** `FE-P02`.

```mermaid
sequenceDiagram
    participant Browser as Navegador
    participant Origin as src/public/js/pages/sales/clients/clientsPage.js<br/>src/public/js/pages/warehouse/goodsIssues/goodsIssueModal.js
    participant Select as src/public/js/plugins/select2/domains/client.js
    participant View as src/public/js/pages/sales/clients/clientModal.js<br/>src/public/js/pages/sales/clients/clientForm.js
    participant Application as src/public/js/application/sales/clients/clients.js
    participant Request as src/public/js/services/sales/clientService.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant Transport@{ "type": "control" } as src/routes/api/sales/clientApiRoute.js<br/>src/controllers/api/sales/clientController.js

    alt Sistemas inicia desde el listado independiente
        Browser->>Origin: seleccionar Nuevo cliente
        Origin->>View: openClientModal({ mode: create })
    else Almacén inicia desde una salida autorizada
        Browser->>Select: escribir cliente inexistente y seleccionar Nuevo cliente
        Select->>Select: runAfterSelect2Close(...)
        Select->>View: openClientModal({ data: { name }, onSave })
    end
    View->>View: validateFields(clientValidation, formData)
    alt Formulario inválido
        View-->>Browser: conservar datos y mostrar errores por campo
    else Formulario válido
        View->>Application: registerClient({ formData })
        Application->>Request: createClientRequest({ formData })
        Request->>HTTP: apiRequest({ method: 'post', url, data })
        HTTP->>Transport: POST /api/sales/clients
        alt Alta resuelta
            Transport-->>HTTP: HTTP 200 { code, data: { client } }
            HTTP-->>Request: apiRequest() resuelve response.data
            Request-->>Application: createClientRequest() resuelve response.data
            Application-->>View: registerClient() devuelve { message, data: client }
            View->>View: handleSubmit(...) ejecuta notifications.showSuccess,<br/>closeModal(form) y reloadMainTable({ resetPaging: true })
            opt form.onSave definido por el selector de salida
                View->>Select: form.onSave(client)
                Select->>Select: toggleClientOption(...) agrega y selecciona
                Select-->>Browser: continuar en la salida sin abrir /clientes
            end
        else Alta rechazada
            Transport-->>HTTP: HTTP error { code, message, meta }
            HTTP-->>Request: apiRequest() rechaza error normalizado
            Request-->>Application: createClientRequest() propaga error
            Application-->>View: registerClient() rechaza
            View-->>Browser: useForm conserva clientForm y handleApiError muestra el error
        end
    end
```
