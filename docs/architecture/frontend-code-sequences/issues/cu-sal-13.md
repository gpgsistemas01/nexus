<a id="cu-sal-13"></a>
# `CU-SAL-13` — Devolver merma surtida

**Patrones:** `FE-P05`, `FE-P06`.

```mermaid
sequenceDiagram
    Note over Warehouse,App: Variables de frontera: id, detailId, returnDto, userId y tx
    actor Warehouse as Almacén
    participant Issue as src/public/js/pages/warehouse/wasteIssues/returns/wasteIssueReturn.js
    participant Return as src/public/js/ui/issues/issueReturnUI.js
    participant App as src/public/js/application/warehouse/wasteIssues/wasteIssues.js
    participant Request as src/public/js/services/warehouse/wasteIssueService.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant API@{ "type": "control" } as src/controllers/api/warehouse/wasteIssueController.js

    Warehouse->>Issue: selecciona Devolver en un detalle de merma
    Issue->>Issue: initializeWasteIssueReturns({ details, getIssueId })
    Issue->>Return: wasteIssueReturn.open({ issue: { id }, detail })
    Warehouse->>Return: captura cantidad y confirma
    Return->>Return: valida límite retornable
    Return->>App: returnWasteIssueDetail({ id, detailId, formData })
    App->>Request: returnWasteIssueDetailRequest({ id, detailId, data: formData })
    Request->>HTTP: apiRequest({ method: patch, url, data })
    HTTP->>API: PATCH /api/warehouse/waste-issues/:id/details/:detailId/returns
    API-->>HTTP: wasteIssueReturn
    HTTP-->>Request: respuesta normalizada
    Request-->>App: wasteIssueReturn
    App-->>Return: respuesta exitosa
    Return->>Issue: recarga la página y consulta la salida actualizada
```
