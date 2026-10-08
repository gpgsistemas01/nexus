<a id="cu-alm-18"></a>
# `CU-ALM-18` — Crear consumible

**Patrones:** `FE-P02`.

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant View@{ "type": "boundary" } as src/public/js/pages/warehouse/materials/materialModal.js<br/>src/public/js/pages/warehouse/materials/materialForm.js
    participant Application@{ "type": "control" } as src/public/js/application/warehouse/consumables/consumables.js
    participant Request as src/public/js/services/warehouse/consumableService.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant Transport@{ "type": "control" } as src/routes/api/warehouse/consumableApiRoute.js<br/>src/controllers/api/warehouse/consumableController.js

    Initiator->>Browser: inicia CU-ALM-18 — Crear consumible
    Browser->>View: openMaterialModal({ mode: CREATE, resource: CONSUMABLE })
    View->>View: setFormSectionVisibility({ form, fieldNames: ['base', 'height'], isVisible: false })
    View->>View: validateFields(materialCreateValidation, formData)
    alt [datos inválidos]
        View-->>Browser: useForm.getErrors() conserva datos y muestra errores
    else [datos válidos]
        View->>Application: registerConsumable({ formData, creationContext: null })
        activate Application
        Application->>Request: registerConsumableRequest({ data: formData })
        Request->>HTTP: apiRequest({ method: 'post', url: CONSUMABLES_API_ROUTE, data })
        HTTP->>Transport: POST /api/warehouse/consumables
        alt [HTTP 200]
            Transport-->>HTTP: { material: supplierMaterial, code }
            HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
            Request-->>Application: registerConsumableRequest(): Promise[AxiosResponse]
            Application-->>View: registerConsumable(): Promise[{ message: string, data: SupplierMaterial }]
            View->>View: form.onSave?.(supplierMaterial)
            View-->>Browser: cerrar modal y refrescar listado
        else [HTTP 4xx/5xx]
            Transport-->>HTTP: { code, message, meta }
            HTTP-->>Request: apiRequest(): throw { status, data, message, raw }
            Request-->>Application: registerConsumableRequest(): throw { status, data, message, raw }
            Application-->>View: registerConsumable(): throw { status, data, message, raw }
            View-->>Browser: handleSubmit() conserva formulario y muestra error
        end
        deactivate Application
    end
```
