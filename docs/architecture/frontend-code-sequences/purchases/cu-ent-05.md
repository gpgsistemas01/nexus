<a id="cu-ent-05"></a>
# `CU-ENT-05` — Cancelar material de una compra

**Patrones:** `FE-P02`, `FE-P04`.

```mermaid
sequenceDiagram
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant View as src/public/js/pages/warehouse/goodsReceipts/goodsReceiptModal.js
    participant Application as src/public/js/application/warehouse/goodsReceipts/goodsReceipts.js
    participant Request as src/public/js/services/warehouse/goodsReceiptService.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant Transport@{ "type": "control" } as src/routes/api/warehouse/goodsReceiptApiRoute.js<br/>src/controllers/api/warehouse/goodsReceiptController.js

    Initiator->>Browser: inicia CU-ENT-05 — Cancelar material de una compra
    Browser->>View: Acción Cancelar del detalle en el modal de compra
    View->>Application: cancelGoodsReceiptDetail({ id, detailId, formData })
    Application->>Request: cancelGoodsReceiptDetailRequest({ id, detailId, formData })
    activate Application
    Request->>HTTP: apiRequest({ method: 'patch', url, data })
    HTTP->>Transport: envía PATCH /api/warehouse/goods-receipts/:id/details/:detailId/cancel
    Transport-->>HTTP: HTTP 2xx { code, data }
    HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
    Request-->>Application: cancelGoodsReceiptDetailRequest(): Promise[AxiosResponse]
    alt Respuesta exitosa
        Application-->>View: cancelGoodsReceiptDetail(): Promise[{ message: string, data: Object }]
        View-->>Browser: DOM o DataTable actualizado con response.data
    else Respuesta rechazada
        Application-->>View: throw { status: number, data: Object | null, message: string, raw: Error }
        View-->>Browser: formulario o filtros conservados, mensaje visible
    end
    deactivate Application
```
