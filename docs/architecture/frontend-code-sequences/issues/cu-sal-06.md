<a id="cu-sal-06"></a>
# `CU-SAL-06` — Devolver material surtido

**Patrones:** `FE-P05`, `FE-P06`.

```mermaid
sequenceDiagram
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant Issue as src/public/js/pages/warehouse/goodsIssues/returns/goodsIssueReturn.js
    participant Return as src/public/js/ui/issues/issueReturnUI.js
    participant App as src/public/js/application/warehouse/goodsIssues/goodsIssues.js
    participant Request as src/public/js/services/warehouse/goodsIssueService.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant API@{ "type": "control" } as src/controllers/api/warehouse/goodsIssueController.js

    Initiator->>Browser: inicia CU-SAL-06 — Devolver material surtido
    Browser->>Issue: selecciona Devolver en un detalle
    Issue->>Issue: initializeGoodsIssueReturns({ details, getCurrentIssue })
    Issue->>Return: goodsIssueReturn.open({ issue, detail })
    Browser->>Return: captura cantidad y confirma
    Return->>Return: validateFields(issueReturnValidation, formData)
    Return->>App: returnGoodsIssueDetail({ id, detailId, formData })
    App->>Request: returnGoodsIssueDetailRequest({ id, detailId, data: formData })
    Request->>HTTP: apiRequest({ method: 'patch', url, data })
    HTTP->>API: PATCH /api/warehouse/goods-issues/:id/details/:detailId/returns
    alt Respuesta exitosa
        API-->>HTTP: 200 { goodsIssueReturn, code }
        HTTP-->>Request: apiRequest() resuelve response.data
        Request-->>App: goodsIssueReturn
        App-->>Return: operación de devolución resuelve response.data
        Return->>Issue: window.location.reload()
    else Cantidad inválida, estado incompatible o error HTTP
        API-->>HTTP: status HTTP { code, message }
        HTTP-->>Request: apiRequest() rechaza { code, message, meta }
        Request-->>App: error propagado
        App-->>Return: operación rechaza { code, message, meta }, sin reload
    end
```

