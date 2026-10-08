<a id="cu-alm-13"></a>
# `CU-ALM-13` — Agregar existencia de merma

**Patrones:** `FE-P02`.

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant EJS@{ "type": "boundary" } as src/views/pages/warehouse/wastes/wastesPage.ejs
    participant Page@{ "type": "boundary" } as src/public/js/pages/warehouse/wastes/wastesPage.js
    participant Table@{ "type": "boundary" } as src/public/js/plugins/datatable/warehouse/wastes/wasteDatatable.js
    participant Modal@{ "type": "boundary" } as src/public/js/pages/warehouse/wastes/wasteStockAdditionModal.js
    participant Form@{ "type": "boundary" } as src/public/js/pages/warehouse/wastes/wasteStockAdditionForm.js
    participant Application@{ "type": "control" } as src/public/js/application/warehouse/wastes/wastes.js
    participant Request as src/public/js/services/warehouse/wasteService.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant Transport@{ "type": "control" } as src/routes/api/warehouse/wasteApiRoute.js<br/>src/controllers/api/warehouse/wasteController.js

    Initiator->>Browser: inicia CU-ALM-13 — Agregar existencia de merma
    EJS->>Page: import wastesPage.js mediante script type=module
    Page->>Modal: import openWasteStockAdditionModal
    Page->>Form: import wasteStockAdditionForm.js y registra useForm
    Page->>Table: createWasteDatatable({ context, openWasteModal, openWasteStockAdditionModal })
    Browser->>Table: selecciona Agregar stock en una merma
    Table->>Modal: openWasteStockAdditionModal({ data })
    Modal-->>Browser: muestra identidad, existencia actual, quantity y observations
    Browser->>Form: confirma wasteStockAdditionForm
    Form->>Form: validateFields(wasteStockAdditionValidation, { quantity, observations })
    alt wasteStockAdditionValidation devuelve errores
        Form-->>Browser: useForm.getErrors() conserva datos y muestra errores por campo
    else Formulario válido
        Form->>Application: addWasteStock({ id, formData })
        activate Application
        Application->>Request: addWasteStockRequest({ id, formData })
        Request->>HTTP: apiRequest({ method: 'post', url, data })
        HTTP->>Transport: envía POST /api/warehouse/wastes/:id/stock-additions
        alt Respuesta exitosa
            Transport-->>HTTP: HTTP 2xx — respuesta del endpoint
            HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
            Request-->>Application: addWasteStockRequest(): Promise[AxiosResponse]
            Application-->>Form: addWasteStock(): Promise[{ message: string, data: Waste }]
            Form-->>Browser: DOM o DataTable actualizado con response.data
        else Respuesta rechazada
            Transport-->>HTTP: HTTP de error — respuesta del endpoint
            HTTP-->>Request: apiRequest(): throw { status: number, data: Object | null, message: string, raw: Error }
            Request-->>Application: throw { status: number, data: Object | null, message: string, raw: Error }
            Application-->>Form: throw { status: number, data: Object | null, message: string, raw: Error }
            Form-->>Browser: formulario o filtros conservados, mensaje visible
        end
        deactivate Application
    end
```
