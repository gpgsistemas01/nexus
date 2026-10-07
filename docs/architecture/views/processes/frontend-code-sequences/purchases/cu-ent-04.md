<a id="cu-ent-04"></a>
# `CU-ENT-04` — Corregir material de una compra

**Patrones:** `FE-P02`, `FE-P04`.

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant View@{ "type": "boundary" } as src/public/js/pages/warehouse/goodsReceipts/corrections/correctionModal.js<br/>src/public/js/pages/warehouse/goodsReceipts/corrections/correctionForm.js
    participant Application@{ "type": "control" } as src/public/js/application/warehouse/goodsReceipts/goodsReceipts.js
    participant Request as src/public/js/services/warehouse/goodsReceiptService.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant Transport@{ "type": "control" } as src/routes/api/warehouse/goodsReceiptApiRoute.js<br/>src/controllers/api/warehouse/goodsReceiptController.js

    Initiator->>Browser: inicia CU-ENT-04 — Corregir material de una compra
    Browser->>View: correctionModal.js y correctionForm.js aíslan la corrección
    View->>View: validateFields(goodsReceiptCorrectionValidation, formData)
    alt goodsReceiptCorrectionValidation devuelve errores
        View-->>Browser: useForm.getErrors() conserva datos y muestra errores por campo
    else Formulario válido
        View->>Application: correctGoodsReceiptDetail({ id, detailId, formData })
        Application->>Request: correctGoodsReceiptDetailRequest({ id, detailId, formData })
        activate Application
        Request->>HTTP: apiRequest({ method: 'patch', url, data })
        HTTP->>Transport: envía PATCH /api/warehouse/goods-receipts/materials/:id/details/:detailId/corrections
        Transport-->>HTTP: HTTP 2xx { code, data }
        HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
        Request-->>Application: correctGoodsReceiptDetailRequest(): Promise[AxiosResponse]
        alt Respuesta exitosa
            Application-->>View: correctGoodsReceiptDetail(): Promise[{ message: string, data: Object }]
            View-->>Browser: DOM o DataTable actualizado con response.data
        else Respuesta rechazada
            Application-->>View: throw { status: number, data: Object | null, message: string, raw: Error }
            View-->>Browser: formulario o filtros conservados, mensaje visible
        end
        deactivate Application
    end
```

