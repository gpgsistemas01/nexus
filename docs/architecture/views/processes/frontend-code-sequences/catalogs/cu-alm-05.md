<a id="cu-alm-05"></a>
# `CU-ALM-05` — Ajustar existencia de material

**Patrones:** `FE-P02`.

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Administrador del sistema
    participant Browser as Navegador
    participant EJS@{ "type": "boundary" } as src/views/pages/warehouse/materials/materialsPage.ejs
    participant Form@{ "type": "boundary" } as src/public/js/pages/warehouse/materials/materialForm.js
    participant App@{ "type": "control" } as src/public/js/application/warehouse/materials/materials.js
    participant Factory@{ "type": "control" } as src/public/js/application/createCrudApplication.js
    participant Request as src/public/js/services/warehouse/materialService.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant API@{ "type": "control" } as src/controllers/api/warehouse/materialController.js

    Initiator->>Browser: inicia CU-ALM-05 — Ajustar existencia de material
    Browser->>Form: confirma ajuste
    Form->>Form: validateFields(materialStockValidation, formData)
    alt materialStockValidation devuelve errores
        Form-->>Browser: useForm.getErrors() conserva datos y muestra errores por campo
    else Formulario válido
        Form->>App: editMaterialStock({ formData, id })
        App->>Factory: createApplicationMutation({ request: editMaterialStockRequest, dataKey: 'material' })({ formData, id })
        Factory->>Request: editMaterialStockRequest({ data: formData, id })
        Request->>HTTP: apiRequest({ method: 'patch', url, data })
        HTTP->>API: PATCH /api/warehouse/materials/:id/stock
        alt Respuesta exitosa
            API-->>HTTP: 200 { material, code }
            HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
            Request-->>Factory: editMaterialStockRequest(): Promise[AxiosResponse]
            Factory-->>Form: editMaterialStock(): Promise[{ message: string }]
            Form->>Form: form.onSave?.(undefined)
        else Respuesta HTTP rechazada
            API-->>HTTP: status HTTP { code, message }
            HTTP-->>Request: apiRequest(): throw { status: number, data: Object | null, message: string, raw: Error }
            Request-->>Factory: editMaterialStockRequest(): throw { status: number, data: Object | null, message: string, raw: Error }
            Factory-->>Form: editMaterialStock(): throw { status: number, data: Object | null, message: string, raw: Error }
        end
    end
```

