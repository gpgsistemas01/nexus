<a id="cu-ent-02"></a>
# `CU-ENT-02` — Crear compra de material

**Patrones:** `FE-P02`, `FE-P04`.

```mermaid
sequenceDiagram
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant View as src/public/js/pages/warehouse/goodsReceipts/goodsReceiptForm.js
    participant Application as src/public/js/application/warehouse/goodsReceipts/goodsReceipts.js<br/>src/public/js/application/warehouse/goodsReceipts/materials/materialGoodsReceipts.js<br/>src/public/js/application/createCrudApplication.js
    participant Request as src/public/js/services/warehouse/goodsReceipts/materials/materialGoodsReceiptService.js<br/>src/public/js/services/warehouse/goodsReceipts/createGoodsReceiptRequests.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant Transport@{ "type": "control" } as src/routes/api/warehouse/goodsReceipts/materials/materialGoodsReceiptApiRoute.js<br/>src/controllers/api/warehouse/goodsReceipts/materials/materialGoodsReceiptController.js
    participant Form as src/public/js/ui/forms/formUI.js
    participant FormUtils as src/public/js/utils/formUtils.js

    Initiator->>Browser: inicia CU-ENT-02 — Crear compra de material
    Browser->>Form: submit manejado por useForm(...)
    Form->>View: normalizeData({ form, formData }) — callback configurado
    View-->>Form: normalizeData(): Object — datos normalizados
    Form->>View: getErrors({ form, formData }) — callback configurado
    View->>FormUtils: validateFields(goodsReceiptValidation, formData)
    FormUtils-->>View: validateFields(): Object — errores por campo
    View-->>Form: getErrors(): Object
    alt Hay errores de validación
        Form->>Browser: normalizeFormErrors({ form, errors })
    else Datos válidos
        Form->>View: sendRequest({ form, formData }) — callback configurado
        View->>FormUtils: handleSubmit({ form, formData, create, update: registerGoodsReceipt })
        FormUtils->>Application: registerGoodsReceipt({ formData })
        Application->>Request: registerMaterialGoodsReceiptRequest({ data: formData })
        Request->>HTTP: apiRequest({ method: 'post', url, data })
        HTTP->>Transport: POST /api/warehouse/goods-receipts/materials
        alt Respuesta exitosa
            Transport-->>HTTP: HTTP 200 { goodsReceipt, code }
            HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
            Request-->>Application: registerMaterialGoodsReceiptRequest(): Promise[AxiosResponse]
            Application-->>FormUtils: registerGoodsReceipt(): Promise[{ message }]
            FormUtils->>Browser: notifications.showSuccess(response.message)
            FormUtils->>Browser: closeModal(form)
            FormUtils->>Browser: reloadMainTable({ resetPaging: mode === CREATE })
        else Error HTTP o de dominio
            Transport-->>HTTP: HTTP de error { code, message }
            HTTP-->>Request: error normalizado
            Request-->>Application: error propagado
            Application-->>FormUtils: error propagado
            Form->>Browser: handleApiError({ err, form }) conserva el formulario
        end
    end
```
