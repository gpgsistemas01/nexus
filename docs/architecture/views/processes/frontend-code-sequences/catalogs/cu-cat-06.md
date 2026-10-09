<a id="cu-cat-06"></a>
# `CU-CAT-06` — Crear cliente

**Patrones:** `FE-P02`.

## Participantes y trazabilidad

Los nombres breves del diagrama corresponden a los archivos vinculados siguientes.
La ruta completa se conserva en cada enlace, fuera de la cabecera visual. Un participante
puede agrupar colaboradores del mismo rol; esa agrupación no implica una clase ni un
proceso independiente. Los retornos representan el resultado o error propagado.

| Alias | Rol visual | Archivos de implementación |
| --- | --- | --- |
| `Origin` | boundary | [`clientsPage.js`](../../../../../../src/public/js/pages/sales/clients/clientsPage.js)<br/>[`goodsIssueModal.js`](../../../../../../src/public/js/pages/warehouse/goodsIssues/goodsIssueModal.js) |
| `Select` | boundary | [`client.js`](../../../../../../src/public/js/plugins/select2/domains/client.js) |
| `View` | boundary | [`clientModal.js`](../../../../../../src/public/js/pages/sales/clients/clientModal.js)<br/>[`clientForm.js`](../../../../../../src/public/js/pages/sales/clients/clientForm.js) |
| `Application` | control | [`clients.js`](../../../../../../src/public/js/application/sales/clients/clients.js) |
| `Request` | boundary | [`clientService.js`](../../../../../../src/public/js/services/sales/clientService.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `Transport` | control | [`clientApiRoute.js`](../../../../../../src/routes/api/sales/clientApiRoute.js)<br/>[`clientController.js`](../../../../../../src/controllers/api/sales/clientController.js) |

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant Origin@{ "type": "boundary" } as Documento origen
    participant Select@{ "type": "boundary" } as Select2
    participant View@{ "type": "boundary" } as Pantalla / formulario
    participant Application@{ "type": "control" } as Application
    participant Request@{ "type": "boundary" } as Requests del recurso
    participant HTTP@{ "type": "boundary" } as Cliente HTTP
    participant Transport@{ "type": "control" } as Endpoint API

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
