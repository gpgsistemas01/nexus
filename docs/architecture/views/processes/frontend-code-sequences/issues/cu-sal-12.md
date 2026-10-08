<a id="cu-sal-12"></a>
# `CU-SAL-12` — Surtir merma

**Patrones:** `FE-P05`.

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant View@{ "type": "boundary" } as src/public/js/pages/warehouse/wasteIssues/wasteIssueForm.js
    participant Application@{ "type": "control" } as src/public/js/application/warehouse/wasteIssues/wasteIssues.js
    participant Request as src/public/js/services/warehouse/wasteIssueService.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant Transport@{ "type": "control" } as src/routes/api/warehouse/wasteIssueApiRoute.js<br/>src/controllers/api/warehouse/wasteIssueController.js

    Initiator->>Browser: inicia CU-SAL-12 — Surtir merma
    Browser->>View: Acción Surtir dentro de los detalles de merma
    View->>View: mapIssueDetailsToSupplyRequest(details)
    View->>View: validateDetailsFields(issueProjectQuantityDetailsValidation,<br/>mapIssueDetailsToSupplyRequest(details))
    loop Cada detalle seleccionado
        View->>View: validateFields(issueProjectQuantityDetailsValidation, detail)
    end
    alt No hay detalle seleccionado o alguna cantidad es inválida
        View-->>Browser: useForm.getErrors() conserva datos y muestra el error por detalle
    else Detalles de surtimiento válidos
        View->>Application: editWasteIssueDetails({ id, formData })
        activate Application
        Application->>Request: editWasteIssueDetailsRequest({ id, data: formData })
        Request->>HTTP: apiRequest({ method: 'patch', url, data })
        HTTP->>Transport: enviar PATCH /api/warehouse/waste-issues/:id/details
        Transport-->>HTTP: HTTP 200 { wasteIssue, code }
        HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
        Request-->>Application: editWasteIssueDetailsRequest(): Promise[AxiosResponse]
        alt Respuesta exitosa
            Application-->>View: editWasteIssueDetails(): Promise[{ message: string, data: WasteIssue }]
            View-->>Browser: DOM o DataTable actualizado con response.data
        else Respuesta rechazada
            Application-->>View: throw { status: number, data: Object | null, message: string, raw: Error }
            View-->>Browser: formulario o filtros conservados, mensaje visible
        end
        deactivate Application
    end
```
