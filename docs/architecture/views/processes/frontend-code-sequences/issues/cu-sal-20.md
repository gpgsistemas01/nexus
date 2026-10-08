<a id="cu-sal-20"></a>
# `CU-SAL-20` — Devolver consumible surtido

**Patrones:** `FE-P05`, `FE-P06`.

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant View@{ "type": "boundary" } as src/public/js/ui/issues/issueReturnUI.js
    participant Application@{ "type": "control" } as src/public/js/application/warehouse/goodsIssues/goodsIssues.js<br/>src/public/js/application/warehouse/goodsIssues/consumables/consumableGoodsIssues.js<br/>src/public/js/application/createCrudApplication.js
    participant Request as src/public/js/services/warehouse/goodsIssues/consumables/consumableGoodsIssueService.js<br/>src/public/js/services/warehouse/goodsIssues/createGoodsIssueRequests.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant Transport@{ "type": "control" } as src/routes/api/warehouse/goodsIssues/consumables/consumableGoodsIssueApiRoute.js<br/>src/controllers/api/warehouse/goodsIssues/consumables/consumableGoodsIssueController.js
    participant Form as src/public/js/ui/forms/formUI.js
    participant FormUtils as src/public/js/utils/formUtils.js

    Initiator->>Browser: inicia CU-SAL-20 — Devolver consumible surtido
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
        Application->>Request: returnConsumableGoodsIssueDetailRequest({ id, detailId, data: formData })
        Request->>HTTP: apiRequest({ method: 'patch', url, data })
        HTTP->>Transport: PATCH /api/warehouse/goods-issues/consumables/:id/details/:detailId/returns
        alt Respuesta exitosa
            Transport-->>HTTP: HTTP 200 { goodsIssueReturn, code }
            HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
            Request-->>Application: returnConsumableGoodsIssueDetailRequest(): Promise[AxiosResponse]
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
