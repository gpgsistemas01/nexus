<a id="cu-sal-02"></a>
# `CU-SAL-02` — Crear salida de material

**Patrones:** `FE-P05`.

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant View@{ "type": "boundary" } as src/public/js/pages/warehouse/goodsIssues/goodsIssueModal.js<br/>goodsIssueForm.js
    participant ClientSelect as src/public/js/plugins/select2/domains/client.js
    participant ClientModal@{ "type": "boundary" } as src/public/js/pages/sales/clients/clientModal.js<br/>clientForm.js
    participant DetailCollection as src/public/js/utils/detailCollectionUtils.js
    participant DetailTable@{ "type": "boundary" } as src/public/js/plugins/datatable/shared/inventory/renderMaterialDatatable.js
    participant DetailFormUI@{ "type": "boundary" } as src/public/js/ui/forms/detailFormUI.js
    participant FormUtils as src/public/js/utils/formUtils.js
    participant InventoryUtils as src/public/js/utils/warehouseInventoryUtils.js
    participant ErrorHandler as src/public/js/api/errorHandler.js
    participant Application@{ "type": "control" } as src/public/js/application/warehouse/goodsIssues/goodsIssues.js
    participant Request as src/public/js/services/warehouse/goodsIssueService.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant Transport@{ "type": "control" } as src/routes/api/warehouse/goodsIssueApiRoute.js<br/>src/controllers/api/warehouse/goodsIssueController.js

    Initiator->>Browser: inicia CU-SAL-02 — Crear salida de material
    Browser->>View: openGoodsIssueModal({ mode: FORM_MODES.CREATE })
    opt El cliente no está catalogado
        Browser->>ClientSelect: escribir nombre y seleccionar Nuevo cliente
        ClientSelect->>ClientSelect: runAfterSelect2Close({ selector: baseSelector, action })
        ClientSelect->>ClientModal: openClientModal({ data: { name }, onSave })
        Note over ClientModal,ClientSelect: registerClient({ formData }) y POST /api/sales/clients<br/>se detallan en DIA-FE-CU-CAT-06
        ClientModal->>ClientSelect: form.onSave(createdClient)
        ClientSelect->>ClientSelect: toggleClientOption({ selector: baseSelector,<br/>id: createdClient.id, name: createdClient.name })
        ClientSelect-->>Browser: continuar salida sin abrir /clientes
    end
    Browser->>View: on(DOM_EVENT_NAMES.CLICK, BUTTON_SELECTORS.ADD_MATERIAL,<br/>addGoodsIssueMaterial)
    View->>View: addGoodsIssueMaterial() lee option.dataset y quantity
    View->>FormUtils: validateFields(addGoodsIssueMaterialValidation,<br/>{ materialId: material.id, supplierId: supplier.id, quantity })
    FormUtils-->>View: validateFields(): Object
    View->>View: normalizeFormErrors({ form: document.querySelector(formId), errors })
    View->>FormUtils: hasValidationErrors(errors)
    FormUtils-->>View: hasValidationErrors(): boolean
    alt El renglón tiene datos inválidos
        View-->>Browser: errores visibles en material, proveedor o cantidad
    else Renglón válido
        View->>InventoryUtils: getBase(material), getHeight(material),<br/>getUnitMeasure(material), getPresentation(material)
        View->>View: roundTo(material.base * material.height * quantity)
        Note over View: newMaterial = { materialId, name, base, height, quantity,<br/>unitMeasure, presentation, convertedQuantity, supplier,<br/>maxUnitCost, supplierId }
        View->>DetailCollection: upsertIssueDetail({ details, detail: newMaterial,<br/>matches: detail => detail.materialId === material.id<br/>y detail.supplierId === supplier.id })
        DetailCollection->>DetailCollection: upsertDetail({ details, detail: newMaterial,<br/>matches, preserveKeys: ['id'] })
        DetailCollection->>DetailCollection: findDetailIndex({ details, matches })
        alt Se agrega otra vez la misma combinación material-proveedor
            DetailCollection->>DetailCollection: details.splice(index, 1,<br/>{ ...newMaterial, id: previousDetail.id })
        else Es una combinación nueva
            DetailCollection->>DetailCollection: details.push(newMaterial)
        end
        DetailCollection-->>View: upsertIssueDetail(): Object | null
        View->>DetailTable: refreshMaterialTable(details)
        DetailTable->>DetailTable: refreshDataTable({ selector: DATATABLE_SELECTORS.MATERIAL,<br/>data: details })
        View->>DetailFormUI: clearAddedMaterialInput()
        DetailFormUI->>DetailFormUI: clearAddedItemInput({ itemSelector: SELECT_SELECTORS.MATERIAL,<br/>quantitySelector: INPUT_SELECTORS.QUANTITY,<br/>presentationSelector: INPUT_SELECTORS.PRESENTATION_DISPLAY,<br/>costSelector: INPUT_SELECTORS.COST_PER_UNIT, clearItemOptions: true })
        DetailFormUI-->>Browser: #materialTable redibujada y campos de detalle vacíos
    end
    Browser->>View: useForm.on(DOM_EVENT_NAMES.SUBMIT, formId, callback)
    View->>View: normalizeGoodsIssueData({ form, formData })
    View->>InventoryUtils: mapGoodsIssueDetailsToRequest(goodsIssueDetails)
    InventoryUtils-->>View: mapGoodsIssueDetailsToRequest(): Object[]
    View->>FormUtils: validateFields(goodsIssueValidation, formData)
    FormUtils-->>View: validateFields(): Object
    View->>View: normalizeFormErrors({ form, errors })
    View->>FormUtils: hasValidationErrors(errors)
    FormUtils-->>View: hasValidationErrors(): boolean
    alt goodsIssueValidation devuelve errores
        View->>View: scrollToFirstFormError(form)
        View-->>Browser: formulario conservado con errores por campo
    else Formulario válido
        View->>FormUtils: handleSubmit({ form, formData,<br/>create: registerGoodsIssue, update: editGoodsIssue })
        FormUtils->>Application: registerGoodsIssue({ formData })
        Application->>Request: registerGoodsIssueRequest({ data: formData })
        activate Application
        Request->>HTTP: apiRequest({ method: 'post',<br/>url: GOODS_ISSUES_API_ROUTE, data: formData })
        HTTP->>Transport: envía POST /api/warehouse/goods-issues
        alt Alta resuelta
            Transport-->>HTTP: HTTP 200 { code, data: { goodsIssue } }
            HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
            Request-->>Application: registerGoodsIssueRequest(): Promise[AxiosResponse]
            Application-->>FormUtils: registerGoodsIssue(): Promise[{ message: string }]
            FormUtils->>FormUtils: notifications.showSuccess(response.message)
            FormUtils->>FormUtils: closeModal(form)
            FormUtils->>FormUtils: reloadMainTable({ resetPaging: true })
            FormUtils-->>View: handleSubmit(): Promise[undefined]
            View-->>Browser: modal cerrado y #table recargada
        else Alta rechazada
            Transport-->>HTTP: HTTP error { code, message, meta }
            HTTP-->>Request: apiRequest(): throw { status: number, data: Object | null, message: string, raw: Error }
            Request-->>Application: registerGoodsIssueRequest(): throw { status: number, data: Object | null, message: string, raw: Error }
            Application-->>FormUtils: registerGoodsIssue(): throw { status: number, data: Object | null, message: string, raw: Error }
            FormUtils-->>View: handleSubmit(): throw { status: number, data: Object | null, message: string, raw: Error }
            View->>ErrorHandler: handleApiError({ err, form,<br/>normalizeServerErrors: normalizeFormErrors })
            ErrorHandler-->>Browser: error de campo, notificación o redirección según status
        end
        deactivate Application
    end
```
