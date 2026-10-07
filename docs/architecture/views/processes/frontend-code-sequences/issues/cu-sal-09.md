<a id="cu-sal-09"></a>
# `CU-SAL-09` — Crear salida de merma

**Patrones:** `FE-P05`.

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant View@{ "type": "boundary" } as src/public/js/pages/warehouse/wasteIssues/wasteIssueModal.js<br/>wasteIssueForm.js
    participant DetailCollection as src/public/js/utils/detailCollectionUtils.js
    participant DetailTable@{ "type": "boundary" } as src/public/js/plugins/datatable/shared/inventory/renderMaterialDatatable.js
    participant DetailFormUI@{ "type": "boundary" } as src/public/js/ui/forms/detailFormUI.js
    participant FormUtils as src/public/js/utils/formUtils.js
    participant InventoryUtils as src/public/js/utils/warehouseInventoryUtils.js
    participant Application@{ "type": "control" } as src/public/js/application/warehouse/wasteIssues/wasteIssues.js
    participant Request as src/public/js/services/warehouse/wasteIssueService.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant Transport@{ "type": "control" } as src/routes/api/warehouse/wasteIssueApiRoute.js<br/>src/controllers/api/warehouse/wasteIssueController.js

    Initiator->>Browser: inicia CU-SAL-09 — Crear salida de merma
    Browser->>View: on(DOM_EVENT_NAMES.CLICK, BUTTON_SELECTORS.ADD_MATERIAL, addWaste)
    View->>FormUtils: validateFields(addWasteIssueDetailValidation, { wasteId, quantity })
    FormUtils-->>View: validateFields(): Object
    View->>View: normalizeFormErrors({ form, errors })
    View->>FormUtils: hasValidationErrors(errors)
    FormUtils-->>View: hasValidationErrors(): boolean
    alt El renglón tiene datos inválidos
        View-->>Browser: errores visibles en merma o cantidad
    else Renglón válido
        View->>InventoryUtils: getPresentation({ presentation }), getUnitMeasure({ unitMeasure })
        View->>View: roundTo(base * height * quantity)
        Note over View: waste = { wasteId, name, base, height, presentation,<br/>unitMeasure, quantity, convertedQuantity }
        View->>DetailCollection: upsertIssueDetail({ details, detail: waste,<br/>matches: item => item.wasteId === wasteId })
        DetailCollection->>DetailCollection: upsertDetail({ details, detail: waste,<br/>matches, preserveKeys: ['id'] })
        DetailCollection->>DetailCollection: findDetailIndex({ details, matches })
        alt La merma ya está en details
            DetailCollection->>DetailCollection: details.splice(index, 1,<br/>{ ...waste, id: previousDetail.id })
        else Es una merma nueva
            DetailCollection->>DetailCollection: details.push(waste)
        end
        DetailCollection-->>View: upsertIssueDetail(): Object | null
        View->>DetailTable: refreshMaterialTable(details)
        View->>DetailFormUI: clearAddedItemInput({ itemSelector: SELECT_SELECTORS.WASTE,<br/>quantitySelector: INPUT_SELECTORS.QUANTITY,<br/>presentationSelector: presentationDisplaySelector })
    end
    View->>View: normalizeWasteIssueData({ form })
    View->>FormUtils: validateFields(wasteIssueValidation, formData)
    FormUtils-->>View: validateFields(): Object
    alt wasteIssueValidation devuelve errores
        View-->>Browser: useForm.getErrors() conserva datos y muestra errores por campo
    else Formulario válido
        View->>Application: registerWasteIssue({ formData })
        Application->>Request: registerWasteIssueRequest({ data: formData })
        activate Application
        Request->>HTTP: apiRequest({ method: 'post', url: ROUTE, data: formData })
        HTTP->>Transport: envía POST /api/warehouse/waste-issues
        Transport-->>HTTP: HTTP 2xx { code, data }
        HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
        Request-->>Application: registerWasteIssueRequest(): Promise[AxiosResponse]
        alt Respuesta exitosa
            Application-->>View: registerWasteIssue(): Promise[{ message: string, data: WasteIssue }]
            View-->>Browser: DOM o DataTable actualizado con response.data
        else Respuesta rechazada
            Application-->>View: throw { status: number, data: Object | null, message: string, raw: Error }
            View-->>Browser: formulario o filtros conservados, mensaje visible
        end
        deactivate Application
    end
```
