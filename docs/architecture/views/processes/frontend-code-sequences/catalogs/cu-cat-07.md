<a id="cu-cat-07"></a>
# `CU-CAT-07` — Editar cliente

**Patrones:** `FE-P02`.

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Administrador del sistema
    participant Browser as Navegador
    participant View@{ "type": "boundary" } as src/public/js/pages/sales/clients/clientModal.js<br/>clientForm.js
    participant Application@{ "type": "control" } as src/public/js/application/sales/clients/clients.js
    participant Request as src/public/js/services/sales/clientService.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant Transport@{ "type": "control" } as src/routes/api/sales/clientApiRoute.js<br/>src/controllers/api/sales/clientController.js

    Initiator->>Browser: inicia CU-CAT-07 — Editar cliente
    Browser->>View: clientModal.js precarga el cliente
    View->>View: validateFields(clientValidation, formData)
    alt clientValidation devuelve errores
        View-->>Browser: useForm.getErrors() conserva datos y muestra errores por campo
    else Formulario válido
        View->>Application: editClient({ id, formData })
        Application->>Request: editClientRequest({ id, formData })
        activate Application
        Request->>HTTP: apiRequest({ method: 'put', url, data })
        HTTP->>Transport: envía PUT /api/sales/clients/:id
        Transport-->>HTTP: HTTP 2xx { code, data }
        HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
        Request-->>Application: editClientRequest(): Promise[AxiosResponse]
        alt Respuesta exitosa
            Application-->>View: editClient(): Promise[{ message: string, data: Client }]
            View-->>Browser: DOM o DataTable actualizado con response.data
        else Respuesta rechazada
            Application-->>View: throw { status: number, data: Object | null, message: string, raw: Error }
            View-->>Browser: formulario o filtros conservados, mensaje visible
        end
        deactivate Application
    end
```

