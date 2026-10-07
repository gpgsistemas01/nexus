<a id="cu-sal-01"></a>
# `CU-SAL-01` — Consultar salidas de material

**Patrones:** `FE-P05`.

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant View@{ "type": "boundary" } as src/public/js/plugins/datatable/warehouse/goodsIssues/goodsIssueDatatable.js<br/>src/public/js/plugins/datatable/core/base/createDataTable.js
    participant Application@{ "type": "control" } as src/public/js/application/warehouse/goodsIssues/goodsIssues.js<br/>src/public/js/application/warehouse/goodsIssues/materials/materialGoodsIssues.js<br/>src/public/js/application/createCrudApplication.js
    participant Request as src/public/js/services/warehouse/goodsIssues/materials/materialGoodsIssueService.js<br/>src/public/js/services/warehouse/goodsIssues/createGoodsIssueRequests.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant Transport@{ "type": "control" } as src/routes/api/warehouse/goodsIssues/materials/materialGoodsIssueApiRoute.js<br/>src/controllers/api/warehouse/goodsIssues/materials/materialGoodsIssueController.js

    Initiator->>Browser: inicia CU-SAL-01 — Consultar salidas de material
    Browser->>View: createGoodsIssueDatatable(...) y aplicar filtros
    View->>Application: getAllGoodsIssues(params)
    Application->>Request: getAllMaterialGoodsIssuesRequest({ params })
    Request->>HTTP: apiRequest({ method: 'get', url, params })
    HTTP->>Transport: GET /api/warehouse/goods-issues/materials
    alt Respuesta exitosa
        Transport-->>HTTP: HTTP 200 { data, recordsTotal, recordsFiltered }
        HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
        Request-->>Application: getAllMaterialGoodsIssuesRequest(): Promise[AxiosResponse]
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
