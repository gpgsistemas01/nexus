<a id="cu-sal-09"></a>
# `CU-SAL-09` — Crear salida de merma

**Patrones:** `FE-P05`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `View` | boundary | [`wasteIssueForm.js`](../../../../../../src/public/js/pages/warehouse/wasteIssues/wasteIssueForm.js) |
| `DetailCollection` | control | [`detailCollectionUtils.js`](../../../../../../src/public/js/utils/detailCollectionUtils.js) |
| `DetailTable` | boundary | [`renderMaterialDatatable.js`](../../../../../../src/public/js/plugins/datatable/shared/inventory/renderMaterialDatatable.js) |
| `DetailFormUI` | boundary | [`detailFormUI.js`](../../../../../../src/public/js/ui/forms/detailFormUI.js) |
| `FormUtils` | control | [`formUtils.js`](../../../../../../src/public/js/utils/formUtils.js) |
| `InventoryUtils` | control | [`warehouseInventoryUtils.js`](../../../../../../src/public/js/utils/warehouseInventoryUtils.js) |
| `Application` | control | [`createCrudApplication.js`](../../../../../../src/public/js/application/createCrudApplication.js) |
| `Request` | boundary | [`wasteIssueService.js`](../../../../../../src/public/js/services/warehouse/wasteIssueService.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `Transport` | control | [`wasteIssueApiRoute.js`](../../../../../../src/routes/api/warehouse/wasteIssueApiRoute.js) |
| `Form` | control | [`formUI.js`](../../../../../../src/public/js/ui/forms/formUI.js) |
| `IssueUI` | control | [`issueFormUI.js`](../../../../../../src/public/js/ui/issues/issueFormUI.js) |
| `FormErrors` | control | [`formErrorsUI.js`](../../../../../../src/public/js/ui/forms/formErrorsUI.js) |
| `Decimal` | control | [`formatUtils.js`](../../../../../../src/public/js/utils/formatUtils.js) |

### Configuración y archivos de contexto

El endpoint queda representado por su router. El controller asociado se desarrolla en la [secuencia backend `CU-SAL-09`](../../backend-code-sequences/issues/cu-sal-09.md#cu-sal-09): [`wasteIssueController.js`](../../../../../../src/controllers/api/warehouse/wasteIssueController.js).

La aplicación ejecuta closures de `createCrudApplication.js`, configuradas por [`wasteIssues.js`](../../../../../../src/public/js/application/warehouse/wasteIssues/wasteIssues.js) mediante [`createIssueApplication.js`](../../../../../../src/public/js/application/warehouse/issues/createIssueApplication.js). Estos archivos de construcción no añaden delegaciones por petición.

## Coordinación de la interfaz

El archivo `wasteIssueForm.js` define `addWaste` y registra su evento. Aquí se muestra
la validación de un renglón y su incorporación a `details`. El submit se desarrolla en
el siguiente nivel; `wasteIssueModal.js` prepara el modal y exporta esa colección.

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant View@{ "type": "boundary" } as Pantalla JS
    participant DetailCollection@{ "type": "control" } as Colección de detalles
    participant DetailTable@{ "type": "boundary" } as Tabla de detalles
    participant DetailFormUI@{ "type": "boundary" } as UI de detalles
    participant FormUtils@{ "type": "control" } as Form helpers
    participant FormErrors@{ "type": "control" } as Errores formulario
    participant Decimal@{ "type": "control" } as Decimales
    participant InventoryUtils@{ "type": "control" } as Conversión de inventario

    Initiator->>Browser: inicia CU-SAL-09 — Crear salida de merma
    Browser->>View: on(DOM_EVENT_NAMES.CLICK, BUTTON_SELECTORS.ADD_MATERIAL, addWaste)
    View->>FormUtils: validateFields(addWasteIssueDetailValidation, { wasteId, quantity })
    activate FormUtils
    FormUtils-->>View: validateFields(): Object
    deactivate FormUtils
    View->>FormErrors: normalizeFormErrors({ form, errors })
    View->>FormUtils: hasValidationErrors(errors)
    activate FormUtils
    FormUtils-->>View: hasValidationErrors(): boolean
    deactivate FormUtils
    alt El renglón tiene datos inválidos
        View-->>Browser: errores visibles en merma o cantidad
    else Renglón válido
        View->>InventoryUtils: getPresentation({ presentation }), getUnitMeasure({ unitMeasure })
        View->>Decimal: roundTo(base * height * quantity)
        Note over View,InventoryUtils: waste = { wasteId, name, base, height, presentation,<br/>unitMeasure, quantity, convertedQuantity }
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

```

## Envío y resultado de la interfaz

`useIssueForm`, definido en `issueFormUI.js`, configura el listener común de `formUI.js`.
Los callbacks de normalización y validación se definen en `wasteIssueForm.js`; el callback
`sendRequest` se define en `issueFormUI.js` y delega en `handleSubmit`. No comparten una
línea de vida aunque participen en el mismo submit.

```mermaid
sequenceDiagram
    autonumber
    participant Browser as Navegador
    participant Form@{ "type": "control" } as useForm
    participant View@{ "type": "boundary" } as Callback formulario
    participant IssueUI@{ "type": "control" } as Formulario de salida
    participant FormUtils@{ "type": "control" } as Form helpers
    participant Application@{ "type": "control" } as Application
    participant DetailTable@{ "type": "boundary" } as Tabla de detalles

    Browser->>Form: submit del formulario de salida
    Form->>View: normalizeWasteIssueData({ form })
    View-->>Form: normalizeWasteIssueData(): Object
    Form->>View: getErrors({ form, formData }) — callback configurado
    View->>FormUtils: validateFields(wasteIssueValidation, formData)
    FormUtils-->>View: validateFields(): Object
    View-->>Form: getErrors(): Object
    alt Datos inválidos
        Form-->>Browser: errores por campo, sin request
    else Formulario válido
        break Envío ya en curso
            Form-->>Browser: envío duplicado rechazado
        end
        Form->>IssueUI: sendRequest({ formData, form }) — callback de useIssueForm
        IssueUI->>FormUtils: handleSubmit({ form, formData, create: register, update })
        FormUtils->>Application: registerWasteIssue({ formData })
        alt Aplicación resuelta
            Application-->>FormUtils: registerWasteIssue(): Promise[{ message, data }]
            FormUtils->>Browser: notifications.showSuccess(response.message)
            FormUtils->>Browser: closeModal(form)
            FormUtils->>Browser: reloadMainTable({ resetPaging: true })
            FormUtils-->>IssueUI: handleSubmit(): Promise[WasteIssue]
            IssueUI->>View: onSaved({ form, formData }) — callback configurado
            Note over View: details.length = 0
            View->>DetailTable: refreshMaterialTable(details)
        else Aplicación rechazada
            Application-->>FormUtils: error propagado
            FormUtils-->>IssueUI: error propagado por handleSubmit()
            IssueUI-->>Form: error propagado por sendRequest()
            Form->>Browser: handleApiError({ err, form })
        end
    end
```

## Colaboración de aplicación y transporte

Amplía la llamada a `Application` del nivel anterior: cada request y el cliente HTTP tienen su propio archivo. El router identifica el endpoint de destino; su ejecución interna está en la secuencia backend del mismo CU. Los resultados regresan al caller de la primera figura.

```mermaid
sequenceDiagram
    autonumber
    participant FormUtils@{ "type": "control" } as Form helpers
    participant Application@{ "type": "control" } as Application
    participant Request@{ "type": "boundary" } as Requests del recurso
    participant HTTP@{ "type": "boundary" } as Cliente HTTP
    participant Transport@{ "type": "control" } as Endpoint API

        FormUtils->>Application: registerWasteIssue({ formData })
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
            Application-->>FormUtils: registerWasteIssue(): Promise[{ message: string, data: WasteIssue }]
        else Respuesta rechazada
            Application-->>FormUtils: throw { status: number, data: Object | null, message: string, raw: Error }
    end
        deactivate Application
```
