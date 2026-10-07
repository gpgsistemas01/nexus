<a id="cu-ent-01"></a>
# `CU-ENT-01` — Consultar compras de material

**Patrones:** `FE-P02`, `FE-P04`.

```mermaid
sequenceDiagram
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant View as src/public/js/plugins/datatable/warehouse/goodsReceipts/goodsReceiptDatatable.js<br/>src/public/js/plugins/datatable/core/base/createDataTable.js
    participant Application as src/public/js/application/warehouse/goodsReceipts/goodsReceipts.js<br/>src/public/js/application/warehouse/goodsReceipts/materials/materialGoodsReceipts.js<br/>src/public/js/application/createCrudApplication.js
    participant Request as src/public/js/services/warehouse/goodsReceipts/materials/materialGoodsReceiptService.js<br/>src/public/js/services/warehouse/goodsReceipts/createGoodsReceiptRequests.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant Transport@{ "type": "control" } as src/routes/api/warehouse/goodsReceipts/materials/materialGoodsReceiptApiRoute.js<br/>src/controllers/api/warehouse/goodsReceipts/materials/materialGoodsReceiptController.js

    Initiator->>Browser: inicia CU-ENT-01 — Consultar compras de material
    Browser->>View: createGoodsReceiptDatatable(...) y aplicar filtros
    View->>Application: getAllGoodsReceipts(params)
    Application->>Request: getAllMaterialGoodsReceiptsRequest({ params })
    Request->>HTTP: apiRequest({ method: 'get', url, params })
    HTTP->>Transport: GET /api/warehouse/goods-receipts/materials
    alt Respuesta exitosa
        Transport-->>HTTP: HTTP 200 { data, recordsTotal, recordsFiltered }
        HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
        Request-->>Application: getAllMaterialGoodsReceiptsRequest(): Promise[AxiosResponse]
        Application-->>View: getAllGoodsReceipts(): Promise[AxiosResponse]
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
