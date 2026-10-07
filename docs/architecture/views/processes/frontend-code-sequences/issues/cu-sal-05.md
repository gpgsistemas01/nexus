<a id="cu-sal-05"></a>
# `CU-SAL-05` — Surtir material

**Patrones:** `FE-P05`.

```mermaid
sequenceDiagram
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant View as src/public/js/pages/warehouse/goodsIssues/goodsIssueForm.js
    participant Application as src/public/js/application/warehouse/goodsIssues/goodsIssues.js<br/>src/public/js/application/warehouse/goodsIssues/materials/materialGoodsIssues.js<br/>src/public/js/application/createCrudApplication.js
    participant Request as src/public/js/services/warehouse/goodsIssues/materials/materialGoodsIssueService.js<br/>src/public/js/services/warehouse/goodsIssues/createGoodsIssueRequests.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant Transport@{ "type": "control" } as src/routes/api/warehouse/goodsIssues/materials/materialGoodsIssueApiRoute.js<br/>src/controllers/api/warehouse/goodsIssues/materials/materialGoodsIssueController.js
    participant Form as src/public/js/ui/forms/formUI.js
    participant FormUtils as src/public/js/utils/formUtils.js

    Initiator->>Browser: inicia CU-SAL-05 — Surtir material
    Browser->>Form: submit manejado por useForm(...)
    Form->>View: normalizeData({ form, formData }) — callback configurado
    View-->>Form: normalizeData(): Object — datos normalizados
    Form->>View: getErrors({ form, formData }) — callback configurado
    View->>FormUtils: validateDetailsFields(issueProjectQuantityDetailsValidation, detailsToSupply)
    loop Cada detalle pendiente
        FormUtils->>FormUtils: validateFields(issueProjectQuantityDetailsValidation, detail)
    end
    FormUtils-->>View: validateDetailsFields(): Object — errores por campo
    View-->>Form: getErrors(): Object
    alt Hay errores de validación
        Form->>Browser: normalizeFormErrors({ form, errors })
    else Datos válidos
        Form->>View: sendRequest({ form, formData }) — callback configurado
        View->>FormUtils: handleSubmit({ form, formData, create, update: editGoodsIssueDetails })
        FormUtils->>Application: editGoodsIssueDetails({ id, formData })
        Application->>Request: editMaterialGoodsIssueDetailsRequest({ id, data: formData })
        Request->>HTTP: apiRequest({ method: 'patch', url, data })
        HTTP->>Transport: PATCH /api/warehouse/goods-issues/materials/:id/details
        alt Respuesta exitosa
            Transport-->>HTTP: HTTP 200 { goodsIssue, code }
            HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
            Request-->>Application: editMaterialGoodsIssueDetailsRequest(): Promise[AxiosResponse]
            Application-->>FormUtils: editGoodsIssueDetails(): Promise[{ message }]
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
