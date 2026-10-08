<a id="cu-alm-11"></a>
# `CU-ALM-11` — Editar merma

**Patrones:** `FE-P02`.

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant View@{ "type": "boundary" } as src/public/js/pages/warehouse/wastes/wasteModal.js<br/>wasteForm.js
    participant Application@{ "type": "control" } as src/public/js/application/warehouse/wastes/wastes.js
    participant Request as src/public/js/services/warehouse/wasteService.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant Transport@{ "type": "control" } as src/routes/api/warehouse/wasteApiRoute.js<br/>src/controllers/api/warehouse/wasteController.js

    Initiator->>Browser: inicia CU-ALM-11 — Editar merma
    Browser->>View: wasteModal.js precarga la merma
    View->>View: validateFields(wasteEditValidation, formData)
    alt wasteEditValidation devuelve errores
        View-->>Browser: useForm.getErrors() conserva datos y muestra errores por campo
    else Formulario válido
        View->>Application: editWaste({ id, formData })
        Application->>Request: editWasteRequest({ id, formData })
        activate Application
        Request->>HTTP: apiRequest({ method: 'patch', url, data })
        HTTP->>Transport: envía PATCH /api/warehouse/wastes/:id
        Transport-->>HTTP: HTTP 2xx { code, data }
        HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
        Request-->>Application: editWasteRequest(): Promise[AxiosResponse]
        alt Respuesta exitosa
            Application-->>View: editWaste(): Promise[{ message: string, data: Waste }]
            View-->>Browser: DOM o DataTable actualizado con response.data
        else Respuesta rechazada
            Application-->>View: throw { status: number, data: Object | null, message: string, raw: Error }
            View-->>Browser: formulario o filtros conservados, mensaje visible
        end
        deactivate Application
    end
```

