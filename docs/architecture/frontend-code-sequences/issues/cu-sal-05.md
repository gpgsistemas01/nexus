<a id="cu-sal-05"></a>
# `CU-SAL-05` — Surtir material

**Patrones:** `FE-P05`.

```mermaid
sequenceDiagram
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant View as src/public/js/pages/warehouse/goodsIssues/goodsIssueForm.js
    participant Application as src/public/js/application/warehouse/goodsIssues/goodsIssues.js
    participant Request as src/public/js/services/warehouse/goodsIssueService.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant Transport@{ "type": "control" } as src/routes/api/warehouse/goodsIssueApiRoute.js<br/>src/controllers/api/warehouse/goodsIssueController.js

    Initiator->>Browser: inicia CU-SAL-05 — Surtir material
    Browser->>View: Acción Surtir dentro de los detalles de salida
    View->>View: mapIssueDetailsToSupplyRequest(goodsIssueDetails)
    View->>View: validateDetailsFields(...) aplica validateFields(issueProjectQuantityDetailsValidation, detail) a cada detalle
    alt No hay detalle seleccionado o alguna cantidad es inválida
        View-->>Browser: useForm.getErrors() conserva datos y muestra el error por detalle
    else Detalles de surtimiento válidos
        View->>Application: editGoodsIssueDetails({ id, formData })
        Application->>Request: editGoodsIssueDetailsRequest({ id, data: formData })
        activate Application
        Request->>HTTP: apiRequest({ method: 'patch', url, data })
        HTTP->>Transport: enviar PATCH /api/warehouse/goods-issues/:id/details
        Transport-->>HTTP: HTTP 2xx { code, data }
        HTTP-->>Request: apiRequest() resuelve response.data
        Request-->>Application: editGoodsIssueDetailsRequest() resuelve response.data
        alt Respuesta exitosa
            Application-->>View: editGoodsIssueDetails() resuelve response.data
            View-->>Browser: DOM o DataTable actualizado con response.data
        else Respuesta rechazada
            Application-->>View: error Axios normalizado { code, message, meta }
            View-->>Browser: formulario o filtros conservados, mensaje visible
        end
        deactivate Application
    end
```
