<a id="cu-sal-10"></a>
# `CU-SAL-10` — Editar encabezado de salida de merma

**Patrones:** `FE-P05`.

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant View@{ "type": "boundary" } as src/public/js/pages/warehouse/wasteIssues/wasteIssueModal.js<br/>wasteIssueForm.js
    participant Application@{ "type": "control" } as src/public/js/application/warehouse/wasteIssues/wasteIssues.js
    participant Request as src/public/js/services/warehouse/wasteIssueService.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant Transport@{ "type": "control" } as src/routes/api/warehouse/wasteIssueApiRoute.js<br/>src/controllers/api/warehouse/wasteIssueController.js

    Initiator->>Browser: inicia CU-SAL-10 — Editar encabezado de salida de merma
    Browser->>View: Modo encabezado de wasteIssueModal.js
    View->>View: validateFields(wasteIssueValidation, formData)
    alt wasteIssueValidation devuelve errores
        View-->>Browser: useForm.getErrors() conserva datos y muestra errores por campo
    else Formulario válido
        View->>Application: editWasteIssueHeader({ id, formData })
        Application->>Request: editWasteIssueHeaderRequest({ id, data: formData })
        activate Application
        Request->>HTTP: apiRequest({ method: 'patch', url, data })
        HTTP->>Transport: envía PATCH /api/warehouse/waste-issues/:id/header
        Transport-->>HTTP: HTTP 200 { wasteIssue, code }
        HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
        Request-->>Application: editWasteIssueHeaderRequest(): Promise[AxiosResponse]
        alt Respuesta exitosa
            Application-->>View: editWasteIssueHeader(): Promise[{ message: string, data: WasteIssue }]
            View-->>Browser: DOM o DataTable actualizado con response.data
        else Respuesta rechazada
            Application-->>View: throw { status: number, data: Object | null, message: string, raw: Error }
            View-->>Browser: formulario o filtros conservados, mensaje visible
        end
        deactivate Application
    end
```

