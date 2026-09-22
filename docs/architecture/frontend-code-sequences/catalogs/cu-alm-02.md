<a id="cu-alm-02"></a>
# `CU-ALM-02` — Crear material

**Patrones:** `FE-P02`.

```mermaid
sequenceDiagram
    participant Browser as Navegador
    participant View as src/public/js/pages/warehouse/materials/materialModal.js<br/>src/public/js/pages/warehouse/materials/materialForm.js
    participant Application as src/public/js/application/warehouse/materials/materials.js
    participant Request as src/public/js/services/warehouse/materialService.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant Transport@{ "type": "control" } as src/routes/api/warehouse/materialApiRoute.js<br/>src/controllers/api/warehouse/materialController.js

    Browser->>View: materialModal.js abre materialForm.js en modo alta
    View->>View: validateFields(getMaterialValidation(form), formData)
    alt Alta desde compra
        View->>Application: registerMaterial({ formData, creationContext: 'goodsReceipt' })
        Application->>Application: buildGoodsReceiptMaterialData(data) omite maxUnitCost y newStock
    else Alta directa
        View->>Application: registerMaterial({ formData, creationContext: null })
    end
    Application->>Request: registerMaterialRequest({ data })
    activate Application
    Request->>HTTP: apiRequest({ method: 'post', url, data })
    HTTP->>Transport: envía POST /api/warehouse/materials
    alt Ya existe la identidad y la relación con el proveedor
        Transport-->>View: 409 MATERIAL_ALREADY_EXISTS y conservar stock y dirigir al ajuste
    else Identidad existente sólo para otro proveedor o identidad nueva
    end
    Transport-->>HTTP: HTTP 2xx { code, data }
    HTTP-->>Request: apiRequest() resuelve response.data
    Request-->>Application: registerMaterialRequest() resuelve response.data
    alt Respuesta exitosa
        Application-->>View: registerMaterial() resuelve response.data
        View-->>Browser: DOM o DataTable actualizado con response.data
    else Respuesta rechazada
        Application-->>View: error Axios normalizado { code, message, meta }
        View-->>Browser: formulario o filtros conservados, mensaje visible
    end
    deactivate Application
```
