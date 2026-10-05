<a id="cu-alm-21"></a>
# `CU-ALM-21` — Ajustar existencia de consumible

**Patrones:** `FE-P02`.

```mermaid
sequenceDiagram
    actor Initiator as Administrador del sistema
    participant Browser as Navegador
    participant EJS as src/views/pages/warehouse/consumables/consumablesPage.ejs
    participant Form as src/public/js/pages/warehouse/materials/materialForm.js
    participant App as src/public/js/application/warehouse/consumables/consumables.js
    participant Factory as src/public/js/application/createCrudApplication.js
    participant Request as src/public/js/services/warehouse/consumableService.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant API@{ "type": "control" } as src/controllers/api/warehouse/consumableController.js

    Initiator->>Browser: inicia CU-ALM-21 — Ajustar existencia de consumible
    Browser->>Form: confirma ajuste
    Form->>Form: validateFields(consumibleStockValidation, formData)
    alt consumibleStockValidation devuelve errores
        Form-->>Browser: useForm.getErrors() conserva datos y muestra errores por campo
    else Formulario válido
        Form->>App: editConsumableStock({ formData, id })
        App->>Factory: createApplicationMutation({ request: editConsumableStockRequest, dataKey: 'consumible' })({ formData, id })
        Factory->>Request: editConsumableStockRequest({ data: formData, id })
        Request->>HTTP: apiRequest({ method: 'patch', url, data })
        HTTP->>API: PATCH /api/warehouse/consumables/:id/stock
        alt Respuesta exitosa
            API-->>HTTP: 200 { consumible, code }
            HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
            Request-->>Factory: editConsumableStockRequest(): Promise[AxiosResponse]
            Factory-->>Form: editConsumableStock(): Promise[{ message: string }]
            Form->>Form: form.onSave?.(undefined)
        else Respuesta HTTP rechazada
            API-->>HTTP: status HTTP { code, message }
            HTTP-->>Request: apiRequest(): throw { status: number, data: Object | null, message: string, raw: Error }
            Request-->>Factory: editConsumableStockRequest(): throw { status: number, data: Object | null, message: string, raw: Error }
            Factory-->>Form: editConsumableStock(): throw { status: number, data: Object | null, message: string, raw: Error }
        end
    end
```
