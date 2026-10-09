<a id="cu-sal-09"></a>
# `CU-SAL-09` — Crear salida de merma

**Patrones:** `FE-P05`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.
La composición incluye también los archivos de configuración, construcción y reexport: cada
uno tiene un nodo propio, aunque no ejecute una delegación durante la petición.

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
| `FileSwalComponent` | control | [`swalComponent.js`](../../../../../../src/public/js/plugins/swal/swalComponent.js) |
| `FileModalUI` | control | [`modalUI.js`](../../../../../../src/public/js/ui/modalUI.js) |
| `FileTableOperations` | control | [`tableOperations.js`](../../../../../../src/public/js/plugins/datatable/core/base/tableOperations.js) |
| `FileErrorHandler` | control | [`errorHandler.js`](../../../../../../src/public/js/api/errorHandler.js) |
| `FileResponseUtils` | control | [`responseUtils.js`](../../../../../../src/public/js/utils/responseUtils.js) |
| `FileApiMessages` | control | [`apiMessages.js`](../../../../../../src/public/js/constants/apiMessages.js) |
| `FileWasteIssueController` | control | [`wasteIssueController.js`](../../../../../../src/controllers/api/warehouse/wasteIssueController.js) |
| `FileCreateIssueApplication` | control | [`createIssueApplication.js`](../../../../../../src/public/js/application/warehouse/issues/createIssueApplication.js) |
| `FileWasteIssues` | control | [`wasteIssues.js`](../../../../../../src/public/js/application/warehouse/wasteIssues/wasteIssues.js) |
| `FileValidators` | control | [`validators.js`](../../../../../../src/public/js/utils/validations/validators.js) |
| `FileFieldValidations` | control | [`fieldValidations.js`](../../../../../../src/public/js/utils/validations/fieldValidations.js) |
| `FileBaseValidations` | control | [`baseValidations.js`](../../../../../../src/public/js/utils/validations/baseValidations.js) |

### Configuración y construcción

El endpoint queda representado por su router. El controller asociado se desarrolla en la [secuencia backend `CU-SAL-09`](../../backend-code-sequences/issues/cu-sal-09.md#cu-sal-09): [`wasteIssueController.js`](../../../../../../src/controllers/api/warehouse/wasteIssueController.js).

La aplicación ejecuta closures de `createCrudApplication.js`, configuradas por [`wasteIssues.js`](../../../../../../src/public/js/application/warehouse/wasteIssues/wasteIssues.js) mediante [`createIssueApplication.js`](../../../../../../src/public/js/application/warehouse/issues/createIssueApplication.js). Estos archivos de construcción no añaden delegaciones por petición.

Las llamadas internas de los helpers se amplían una vez en las
[colaboraciones CRUD compartidas](../../shared-runtime-behavior/03-crud-helper-collaborations.md). Sus archivos siguen representados
por separado en las figuras y la tabla de este caso.

## Composición de archivos

Los archivos que construyen, configuran o reexportan funciones aparecen como componentes
individuales. Las flechas representan imports reales, resueltos al cargar los módulos;
las llamadas durante la operación se muestran en las secuencias siguientes. Cada nombre
identifica un archivo y la tabla conserva su ruta completa.

```mermaid
flowchart TB
    subgraph Component0["Backend"]
        FileWasteIssueController["wasteIssueController.js"]
        Transport["wasteIssueApiRoute.js"]
    end
    subgraph Component1["Interfaz"]
        FileErrorHandler["errorHandler.js"]
        FileApiMessages["apiMessages.js"]
        View["wasteIssueForm.js"]
        FileTableOperations["tableOperations.js"]
        DetailTable["renderMaterialDatatable.js"]
        IssueUI["issueFormUI.js"]
        FileModalUI["modalUI.js"]
        FormUtils["formUtils.js"]
        FileResponseUtils["responseUtils.js"]
        FileBaseValidations["baseValidations.js"]
        FileFieldValidations["fieldValidations.js"]
        FileValidators["validators.js"]
    end
    subgraph Component2["Aplicación y requests"]
        Application["createCrudApplication.js"]
        FileCreateIssueApplication["createIssueApplication.js"]
        FileWasteIssues["wasteIssues.js"]
        Request["wasteIssueService.js"]
    end
    FileErrorHandler -->|import| FileApiMessages
    FileCreateIssueApplication -->|import| Application
    FileWasteIssues -->|import| Request
    FileWasteIssues -->|import| FileCreateIssueApplication
    View -->|import| FileWasteIssues
    View -->|import| FileValidators
    DetailTable -->|import| FileTableOperations
    IssueUI -->|import| FileModalUI
    FormUtils -->|import| FileApiMessages
    FormUtils -->|import| FileTableOperations
    FormUtils -->|import| FileModalUI
    FileResponseUtils -->|import| FileApiMessages
    FileFieldValidations -->|import| FileBaseValidations
    FileValidators -->|import| FileBaseValidations
    FileValidators -->|import| FileFieldValidations
    Transport -->|import| FileWasteIssueController
```

## Construcción de funciones para esta operación

El configurador se ejecuta al evaluar su módulo. Después se invoca la función devuelta
por la fábrica, usando el nombre público mostrado en la secuencia.

| Nombre público | Archivo configurador (alias) | Archivo que construye el cuerpo (alias) |
| --- | --- | --- |
| `registerWasteIssue` | `FileWasteIssues` | `FileCreateIssueApplication` · `createIssueApplication(...)` |

## Coordinación de la interfaz

El archivo `wasteIssueForm.js` define `addWaste` y registra su evento. Aquí se muestra
la validación de un renglón y su incorporación a `details`. El submit se desarrolla en
el siguiente nivel; `wasteIssueModal.js` prepara el modal y exporta esa colección.

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant View@{ "type": "boundary" } as wasteIssueForm.js
    participant DetailCollection@{ "type": "control" } as detailCollectionUtils.js
    participant DetailTable@{ "type": "boundary" } as renderMaterialDatatable.js
    participant DetailFormUI@{ "type": "boundary" } as detailFormUI.js
    participant FormUtils@{ "type": "control" } as formUtils.js
    participant FormErrors@{ "type": "control" } as formErrorsUI.js
    participant Decimal@{ "type": "control" } as formatUtils.js
    participant InventoryUtils@{ "type": "control" } as warehouseInventoryUtils.js

    participant Form@{ "type": "control" } as formUI.js

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
        Form->>FormErrors: scrollToFirstFormError(form)
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
    participant Form@{ "type": "control" } as formUI.js
    participant View@{ "type": "boundary" } as wasteIssueForm.js
    participant IssueUI@{ "type": "control" } as issueFormUI.js
    participant FormUtils@{ "type": "control" } as formUtils.js
    participant Application@{ "type": "control" } as createCrudApplication.js
    participant DetailTable@{ "type": "boundary" } as renderMaterialDatatable.js

    participant FileErrorHandler@{ "type": "control" } as errorHandler.js
    participant FormErrors@{ "type": "control" } as formErrorsUI.js

    participant FileSwalComponent@{ "type": "control" } as swalComponent.js

    Browser->>Form: submit del formulario de salida
    Form->>View: normalizeWasteIssueData({ form })
    View-->>Form: normalizeWasteIssueData(): Object
    Form->>View: getErrors({ form, formData }) — callback configurado
    View->>FormUtils: validateFields(wasteIssueValidation, formData)
    FormUtils-->>View: validateFields(): Object
    View-->>Form: getErrors(): Object
    Form->>FormErrors: normalizeFormErrors({ form, errors }) — callback por defecto
    Form->>FormErrors: toggleErrorMessages(form, errors)
    Form->>FormUtils: hasValidationErrors(errors)
    FormUtils-->>Form: hasValidationErrors(): boolean
    alt Datos inválidos
        Form->>FormErrors: scrollToFirstFormError(form)
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
            FormUtils->>FileSwalComponent: notifications.showSuccess(response.message)
            Note over FormUtils: Cierre y recarga ampliados en los efectos transversales de handleSubmit
            FormUtils-->>IssueUI: handleSubmit(): Promise[WasteIssue]
            IssueUI->>View: onSaved({ form, formData }) — callback configurado
            Note over View: details.length = 0
            View->>DetailTable: refreshMaterialTable(details)
        else Aplicación rechazada
            Application-->>FormUtils: error propagado
            FormUtils-->>IssueUI: error propagado por handleSubmit()
            IssueUI-->>Form: error propagado por sendRequest()
            Form->>FileErrorHandler: handleApiError({ err, form })
        end
    end
```

## Colaboración de aplicación y transporte

Amplía la llamada a `Application` del nivel anterior: cada request y el cliente HTTP tienen su propio archivo. El router identifica el endpoint de destino; su ejecución interna está en la secuencia backend del mismo CU. Los resultados regresan al caller de la primera figura.

```mermaid
sequenceDiagram
    autonumber
    participant FormUtils@{ "type": "control" } as formUtils.js
    participant Application@{ "type": "control" } as createCrudApplication.js
    participant Request@{ "type": "boundary" } as wasteIssueService.js
    participant HTTP@{ "type": "boundary" } as axiosInstanceApi.js
    participant Transport@{ "type": "control" } as wasteIssueApiRoute.js

    participant FileResponseUtils@{ "type": "control" } as responseUtils.js

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
        Application->>FileResponseUtils: createSuccessResponseFromRequest({ response, dataKey })
        FileResponseUtils-->>Application: createSuccessResponseFromRequest(): Object — detalle transversal CRUD
        alt Respuesta exitosa
            Application-->>FormUtils: registerWasteIssue(): Promise[{ message: string, data: WasteIssue }]
        else Respuesta rechazada
            Application-->>FormUtils: throw { status: number, data: Object | null, message: string, raw: Error }
    end
        deactivate Application
```
