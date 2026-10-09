<a id="cu-sal-09"></a>
# `CU-SAL-09` — Crear salida de merma

**Patrones:** `FE-P05`.

## Participantes y trazabilidad

Los nombres breves del diagrama corresponden a los archivos vinculados siguientes.
La ruta completa se conserva en cada enlace, fuera de la cabecera visual. Un participante
puede agrupar colaboradores del mismo rol; esa agrupación no implica una clase ni un
proceso independiente. Los retornos representan el resultado o error propagado.

| Alias | Rol visual | Archivos de implementación |
| --- | --- | --- |
| `View` | boundary | [`wasteIssueModal.js`](../../../../../../src/public/js/pages/warehouse/wasteIssues/wasteIssueModal.js) |
| `DetailCollection` | control | [`detailCollectionUtils.js`](../../../../../../src/public/js/utils/detailCollectionUtils.js) |
| `DetailTable` | boundary | [`renderMaterialDatatable.js`](../../../../../../src/public/js/plugins/datatable/shared/inventory/renderMaterialDatatable.js) |
| `DetailFormUI` | boundary | [`detailFormUI.js`](../../../../../../src/public/js/ui/forms/detailFormUI.js) |
| `FormUtils` | control | [`formUtils.js`](../../../../../../src/public/js/utils/formUtils.js) |
| `InventoryUtils` | control | [`warehouseInventoryUtils.js`](../../../../../../src/public/js/utils/warehouseInventoryUtils.js) |
| `Application` | control | [`wasteIssues.js`](../../../../../../src/public/js/application/warehouse/wasteIssues/wasteIssues.js) |
| `Request` | boundary | [`wasteIssueService.js`](../../../../../../src/public/js/services/warehouse/wasteIssueService.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `Transport` | control | [`wasteIssueApiRoute.js`](../../../../../../src/routes/api/warehouse/wasteIssueApiRoute.js)<br/>[`wasteIssueController.js`](../../../../../../src/controllers/api/warehouse/wasteIssueController.js) |

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant View@{ "type": "boundary" } as Pantalla / formulario
    participant DetailCollection@{ "type": "control" } as Colección de detalles
    participant DetailTable@{ "type": "boundary" } as Tabla de detalles
    participant DetailFormUI@{ "type": "boundary" } as UI de detalles
    participant FormUtils@{ "type": "control" } as Form helpers
    participant InventoryUtils@{ "type": "control" } as Conversión de inventario
    participant Application@{ "type": "control" } as Application
    participant Request@{ "type": "boundary" } as Requests del recurso
    participant HTTP@{ "type": "boundary" } as Cliente HTTP
    participant Transport@{ "type": "control" } as Endpoint API

    Initiator->>Browser: inicia CU-SAL-09 — Crear salida de merma
    Browser->>View: on(DOM_EVENT_NAMES.CLICK, BUTTON_SELECTORS.ADD_MATERIAL, addWaste)
    View->>FormUtils: validateFields(addWasteIssueDetailValidation, { wasteId, quantity })
    activate FormUtils
    FormUtils-->>View: validateFields(): Object
    deactivate FormUtils
    View->>View: normalizeFormErrors({ form, errors })
    View->>FormUtils: hasValidationErrors(errors)
    activate FormUtils
    FormUtils-->>View: hasValidationErrors(): boolean
    deactivate FormUtils
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
    activate FormUtils
    FormUtils-->>View: validateFields(): Object
    deactivate FormUtils
    alt wasteIssueValidation devuelve errores
        View-->>Browser: useForm.getErrors() conserva datos y muestra errores por campo
    else Formulario válido
        View->>Application: registerWasteIssue({ formData })
        activate Application
        Application->>Request: registerWasteIssueRequest({ data: formData })
        Request->>HTTP: apiRequest({ method: 'post', url: ROUTE, data: formData })
        HTTP->>Transport: envía POST /api/warehouse/waste-issues
        activate Transport
        Transport-->>HTTP: HTTP 200 { wasteIssue, code }
        deactivate Transport
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
