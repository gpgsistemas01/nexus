<a id="cu-sal-06"></a>
# `CU-SAL-06` — Devolver material surtido

**Patrones:** `FE-P05`, `FE-P06`.

```mermaid
sequenceDiagram
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant View as src/public/js/ui/issues/issueReturnUI.js
    participant Application as src/public/js/application/warehouse/goodsIssues/goodsIssues.js<br/>src/public/js/application/warehouse/goodsIssues/materials/materialGoodsIssues.js<br/>src/public/js/application/createCrudApplication.js
    participant Request as src/public/js/services/warehouse/goodsIssues/materials/materialGoodsIssueService.js<br/>src/public/js/services/warehouse/goodsIssues/createGoodsIssueRequests.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant Transport@{ "type": "control" } as src/routes/api/warehouse/goodsIssues/materials/materialGoodsIssueApiRoute.js<br/>src/controllers/api/warehouse/goodsIssues/materials/materialGoodsIssueController.js
    participant Form as src/public/js/ui/forms/formUI.js
    participant FormUtils as src/public/js/utils/formUtils.js

    Initiator->>Browser: inicia CU-SAL-06 — Devolver material surtido
    Browser->>Form: submit manejado por useForm(...)
    Form->>View: normalizeData({ form, formData }) — callback configurado
    View-->>Form: normalizeData(): Object — datos normalizados
    Form->>View: getErrors({ form, formData }) — callback configurado
    View->>FormUtils: validateFields(issueReturnValidation, formData)
    FormUtils-->>View: validateFields(): Object — errores por campo
    View-->>Form: getErrors(): Object
    alt Hay errores de validación
        Form->>Browser: normalizeFormErrors({ form, errors })
    else Datos válidos
        Form->>View: sendRequest({ form, formData }) — callback configurado
        View->>Application: returnGoodsIssueDetail({ id, detailId, formData })
        Application->>Request: returnMaterialGoodsIssueDetailRequest({ id, detailId, data: formData })
        Request->>HTTP: apiRequest({ method: 'patch', url, data })
        HTTP->>Transport: PATCH /api/warehouse/goods-issues/materials/:id/details/:detailId/returns
        alt Respuesta exitosa
            Transport-->>HTTP: HTTP 200 { goodsIssueReturn, code }
            HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
            Request-->>Application: returnMaterialGoodsIssueDetailRequest(): Promise[AxiosResponse]
            Application-->>View: returnGoodsIssueDetail(): Promise[{ message, data: goodsIssueReturn }]
            View->>Browser: notifications.showSuccess(response.message)
            View->>Browser: initMdbModal(getModal()).hide()
            View->>Browser: window.location.reload()
        else Error HTTP o de dominio
            Transport-->>HTTP: HTTP de error { code, message }
            HTTP-->>Request: error normalizado
            Request-->>Application: error propagado
            Application-->>View: error propagado
            Form->>Browser: handleApiError({ err, form }) conserva el formulario
        end
    end
```
