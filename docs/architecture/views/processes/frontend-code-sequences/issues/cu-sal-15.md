<a id="cu-sal-15"></a>
# `CU-SAL-15` — Consultar salidas de consumible

**Patrones:** `FE-P05`.

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant View@{ "type": "boundary" } as src/public/js/plugins/datatable/warehouse/goodsIssues/goodsIssueDatatable.js<br/>src/public/js/plugins/datatable/core/base/createDataTable.js
    participant Application@{ "type": "control" } as src/public/js/application/warehouse/goodsIssues/goodsIssues.js<br/>src/public/js/application/warehouse/goodsIssues/consumables/consumableGoodsIssues.js<br/>src/public/js/application/createCrudApplication.js
    participant Request as src/public/js/services/warehouse/goodsIssues/consumables/consumableGoodsIssueService.js<br/>src/public/js/services/warehouse/goodsIssues/createGoodsIssueRequests.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant Transport@{ "type": "control" } as src/routes/api/warehouse/goodsIssues/consumables/consumableGoodsIssueApiRoute.js<br/>src/controllers/api/warehouse/goodsIssues/consumables/consumableGoodsIssueController.js

    Initiator->>Browser: inicia CU-SAL-15 — Consultar salidas de consumible
    Browser->>View: createGoodsIssueDatatable(...) y aplicar filtros
    View->>Application: getAllGoodsIssues(params)
    Application->>Request: getAllConsumableGoodsIssuesRequest({ params })
    Request->>HTTP: apiRequest({ method: 'get', url, params })
    HTTP->>Transport: GET /api/warehouse/goods-issues/consumables
    alt Respuesta exitosa
        Transport-->>HTTP: HTTP 200 { data, recordsTotal, recordsFiltered }
        HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
        Request-->>Application: getAllConsumableGoodsIssuesRequest(): Promise[AxiosResponse]
        Application-->>View: getAllGoodsIssues(): Promise[AxiosResponse]
        View->>Browser: callback(response.data) — filas y conteos de DataTable
    else Error HTTP o de dominio
        Transport-->>HTTP: HTTP de error { code, message }
        HTTP-->>Request: error normalizado
        Request-->>Application: error propagado
        Application-->>View: error propagado
        View->>Browser: handleDataTableError(error)
        View->>Browser: callback({ data: [], recordsTotal: 0, recordsFiltered: 0 })
    end
```
