<a id="cu-alm-10"></a>
# `CU-ALM-10` — Registrar merma

**Patrones:** `FE-P02`.

```mermaid
sequenceDiagram
    participant Browser as Navegador
    participant View as src/public/js/pages/warehouse/wastes/wasteModal.js<br/>src/public/js/pages/warehouse/wastes/wasteForm.js
    participant Application as src/public/js/application/warehouse/wastes/wastes.js
    participant Request as src/public/js/services/warehouse/wasteService.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant Transport@{ "type": "control" } as src/routes/api/warehouse/wasteApiRoute.js<br/>src/controllers/api/warehouse/wasteController.js

    Browser->>View: wasteModal.js y wasteForm.js seleccionan una plantilla de material
    View->>Application: getWasteMaterialTemplates({ params })
    Application->>Request: registerWaste({ formData })
    activate Application
    Request->>HTTP: apiRequest({ method: 'post', url, data })
    HTTP->>Transport: enviar POST /api/warehouse/wastes
    alt Misma identidad de merma
        Transport-->>View: 409 WASTE_ALREADY_EXISTS y no incrementar stock
    else Merma nueva
    end
    Transport-->>HTTP: HTTP 2xx { code, data }
    HTTP-->>Request: apiRequest() resuelve response.data
    Request-->>Application: registerWaste() resuelve response.data
    alt Respuesta exitosa
        Application-->>View: getWasteMaterialTemplates() resuelve response.data
        View-->>Browser: DOM o DataTable actualizado con response.data
    else Respuesta rechazada
        Application-->>View: error Axios normalizado { code, message, meta }
        View-->>Browser: formulario o filtros conservados, mensaje visible
    end
    deactivate Application
```

