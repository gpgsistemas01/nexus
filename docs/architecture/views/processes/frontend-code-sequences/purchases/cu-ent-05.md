<a id="cu-ent-05"></a>
# `CU-ENT-05` — Cancelar material de una compra

**Patrones:** `FE-P02`, `FE-P04`.

## Participantes y trazabilidad

Los nombres breves del diagrama corresponden a los archivos vinculados siguientes.
La ruta completa se conserva en cada enlace, fuera de la cabecera visual. Un participante
puede agrupar colaboradores del mismo rol; esa agrupación no implica una clase ni un
proceso independiente. Los retornos representan el resultado o error propagado.

| Alias | Rol visual | Archivos de implementación |
| --- | --- | --- |
| `View` | boundary | [`goodsReceiptModal.js`](../../../../../../src/public/js/pages/warehouse/goodsReceipts/goodsReceiptModal.js) |
| `Application` | control | [`goodsReceipts.js`](../../../../../../src/public/js/application/warehouse/goodsReceipts/goodsReceipts.js)<br/>[`materialGoodsReceipts.js`](../../../../../../src/public/js/application/warehouse/goodsReceipts/materials/materialGoodsReceipts.js)<br/>[`createCrudApplication.js`](../../../../../../src/public/js/application/createCrudApplication.js) |
| `Request` | boundary | [`materialGoodsReceiptService.js`](../../../../../../src/public/js/services/warehouse/goodsReceipts/materials/materialGoodsReceiptService.js)<br/>[`createGoodsReceiptRequests.js`](../../../../../../src/public/js/services/warehouse/goodsReceipts/createGoodsReceiptRequests.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `Transport` | control | [`materialGoodsReceiptApiRoute.js`](../../../../../../src/routes/api/warehouse/goodsReceipts/materials/materialGoodsReceiptApiRoute.js)<br/>[`materialGoodsReceiptController.js`](../../../../../../src/controllers/api/warehouse/goodsReceipts/materials/materialGoodsReceiptController.js) |

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant View@{ "type": "boundary" } as Pantalla / formulario
    participant Application@{ "type": "control" } as Application
    participant Request@{ "type": "boundary" } as Requests del recurso
    participant HTTP@{ "type": "boundary" } as Cliente HTTP
    participant Transport@{ "type": "control" } as Endpoint API

    Initiator->>Browser: inicia CU-ENT-05 — Cancelar material de una compra
    Browser->>View: evento click de cancelar detalle
    View->>Browser: notifications.showConfirmation(...)
    alt Cancelación no confirmada
        View-->>Browser: sin solicitud HTTP
    else Cancelación confirmada
        View->>Application: cancelGoodsReceiptDetail({ id, detailId })
        Application->>Request: cancelMaterialGoodsReceiptDetailRequest({ id, detailId })
        Request->>HTTP: apiRequest({ method: 'patch', url })
        HTTP->>Transport: PATCH /api/warehouse/goods-receipts/materials/:id/details/:detailId/cancel
        alt Respuesta exitosa
            Transport-->>HTTP: HTTP 200 { correction, code }
            HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
            Request-->>Application: cancelMaterialGoodsReceiptDetailRequest(): Promise[AxiosResponse]
            Application-->>View: cancelGoodsReceiptDetail(): Promise[{ message, data: correction }]
            View->>Browser: notifications.showSuccess(response.message)
            View->>Browser: dispatchEvent('goods-receipt-correction:applied', response.data)
            View->>Browser: refreshMaterialTable(details) — o consulta si la compra quedó cancelada
            View->>Browser: setTotals({ quantity, net, gross })
        else Error HTTP o de dominio
            Transport-->>HTTP: HTTP de error { code, message }
            HTTP-->>Request: error normalizado
            Request-->>Application: error propagado
            Application-->>View: error propagado
            View->>Browser: handleApiError({ err, form }) conserva el formulario
        end
    end
```
