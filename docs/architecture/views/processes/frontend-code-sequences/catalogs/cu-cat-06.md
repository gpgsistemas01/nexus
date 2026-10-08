<a id="cu-cat-06"></a>
# `CU-CAT-06` — Crear cliente

**Patrones:** `FE-P02`.

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant Origin@{ "type": "boundary" } as src/public/js/pages/sales/clients/clientsPage.js<br/>src/public/js/pages/warehouse/goodsIssues/goodsIssueModal.js
    participant Select as src/public/js/plugins/select2/domains/client.js
    participant View@{ "type": "boundary" } as src/public/js/pages/sales/clients/clientModal.js<br/>src/public/js/pages/sales/clients/clientForm.js
    participant Application@{ "type": "control" } as src/public/js/application/sales/clients/clients.js
    participant Request as src/public/js/services/sales/clientService.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant Transport@{ "type": "control" } as src/routes/api/sales/clientApiRoute.js<br/>src/controllers/api/sales/clientController.js

    alt Sistemas inicia desde el listado independiente
    Initiator->>Browser: inicia CU-CAT-06 — Crear cliente
        Browser->>Origin: seleccionar Nuevo cliente
        Origin->>View: openClientModal({ mode: create })
    else Almacén inicia desde una salida autorizada
        Browser->>Select: escribir cliente inexistente y seleccionar Nuevo cliente
        Select->>Select: runAfterSelect2Close({ selector: baseSelector, action })
        Select->>View: openClientModal({ data: { name }, onSave })
    end
    View->>View: validateFields(clientValidation, formData)
    alt Formulario inválido
        View-->>Browser: conservar datos y mostrar errores por campo
    else Formulario válido
        View->>Application: registerClient({ formData })
        Application->>Request: createClientRequest({ data: formData })
        Request->>HTTP: apiRequest({ method: 'post',<br/>url: CLIENTS_API_ROUTE, data: formData })
        HTTP->>Transport: POST /api/sales/clients
        alt Alta resuelta
            Transport-->>HTTP: HTTP 200 { code, data: { client } }
            HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
            Request-->>Application: createClientRequest(): Promise[AxiosResponse]
            Application-->>View: registerClient(): Promise[{ message: string, data: Client }]
            View->>View: handleSubmit({ form, formData,<br/>create: registerClient, update: editClient })
            View->>View: notifications.showSuccess(response.message)
            View->>View: closeModal(form)
            View->>View: reloadMainTable({ resetPaging: true })
            opt form.onSave definido por el selector de salida
                View->>Select: form.onSave(client)
                Select->>Select: toggleClientOption({ selector: baseSelector,<br/>id: client.id, name: client.name })
                Select-->>Browser: continuar en la salida sin abrir /clientes
            end
        else Alta rechazada
            Transport-->>HTTP: HTTP error { code, message, meta }
            HTTP-->>Request: apiRequest(): throw { status: number, data: Object | null, message: string, raw: Error }
            Request-->>Application: createClientRequest(): throw { status: number, data: Object | null, message: string, raw: Error }
            Application-->>View: registerClient(): throw { status: number, data: Object | null, message: string, raw: Error }
            View-->>Browser: useForm conserva clientForm y handleApiError muestra el error
        end
    end
```
