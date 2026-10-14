<a id="cu-alm-13"></a>
# `CU-ALM-13` — Agregar existencia de merma

**Patrones:** `FE-P02`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.
La composición incluye también los archivos de configuración, construcción y reexport: cada
uno tiene un nodo propio, aunque no ejecute una delegación durante la petición.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `EJS` | boundary | [`wastesPage.ejs`](../../../../../../src/views/pages/warehouse/wastes/wastesPage.ejs) |
| `Page` | boundary | [`wastesPage.js`](../../../../../../src/public/js/pages/warehouse/wastes/wastesPage.js) |
| `Table` | boundary | [`wasteDatatable.js`](../../../../../../src/public/js/plugins/datatable/warehouse/wastes/wasteDatatable.js) |
| `Modal` | boundary | [`wasteStockAdditionModal.js`](../../../../../../src/public/js/pages/warehouse/wastes/wasteStockAdditionModal.js) |
| `Form` | boundary | [`wasteStockAdditionForm.js`](../../../../../../src/public/js/pages/warehouse/wastes/wasteStockAdditionForm.js) |
| `Application` | control | [`createCrudApplication.js`](../../../../../../src/public/js/application/createCrudApplication.js) |
| `Request` | boundary | [`wasteService.js`](../../../../../../src/public/js/services/warehouse/wasteService.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `Transport` | control | [`wasteApiRoute.js`](../../../../../../src/routes/api/warehouse/wasteApiRoute.js) |
| `FormUtils` | control | [`formUtils.js`](../../../../../../src/public/js/utils/formUtils.js) |
| `FileResponseUtils` | control | [`responseUtils.js`](../../../../../../src/public/js/utils/responseUtils.js) |
| `FileApiMessages` | control | [`apiMessages.js`](../../../../../../src/public/js/constants/apiMessages.js) |
| `FileWasteController` | control | [`wasteController.js`](../../../../../../src/controllers/api/warehouse/wasteController.js) |
| `FileWastes` | control | [`wastes.js`](../../../../../../src/public/js/application/warehouse/wastes/wastes.js) |
| `FileUtils` | control | [`utils.js`](../../../../../../src/public/js/api/utils.js) |
| `FileValidators` | control | [`validators.js`](../../../../../../src/public/js/utils/validations/validators.js) |
| `FileFieldValidations` | control | [`fieldValidations.js`](../../../../../../src/public/js/utils/validations/fieldValidations.js) |
| `FileBaseValidations` | control | [`baseValidations.js`](../../../../../../src/public/js/utils/validations/baseValidations.js) |
| `FormCore` | control | [`formUI.js`](../../../../../../src/public/js/ui/forms/formUI.js) |
| `FileFormErrorsUI` | control | [`formErrorsUI.js`](../../../../../../src/public/js/ui/forms/formErrorsUI.js) |
| `FileErrorHandler` | control | [`errorHandler.js`](../../../../../../src/public/js/api/errorHandler.js) |
| `FileSwalComponent` | control | [`swalComponent.js`](../../../../../../src/public/js/plugins/swal/swalComponent.js) |
| `FileModalUI` | control | [`modalUI.js`](../../../../../../src/public/js/ui/modalUI.js) |
| `FileTableOperations` | control | [`tableOperations.js`](../../../../../../src/public/js/plugins/datatable/core/base/tableOperations.js) |
| `FileWasteFields` | control | [`wasteFields.js`](../../../../../../src/public/js/pages/warehouse/wastes/wasteFields.js) |

### Configuración y construcción

El endpoint queda representado por su router. El controller asociado se desarrolla en la [secuencia backend `CU-ALM-13`](../../backend-code-sequences/catalogs/cu-alm-13.md#cu-alm-13): [`wasteController.js`](../../../../../../src/controllers/api/warehouse/wasteController.js).

La línea `Application` ejecuta la función generada en `createCrudApplication.js`. Su nombre público y la configuración de requests/contratos provienen de [`wastes.js`](../../../../../../src/public/js/application/warehouse/wastes/wastes.js); exportar esa función no crea otra llamada durante cada petición.

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
        FileWasteController["wasteController.js"]
        Transport["wasteApiRoute.js"]
    end
    subgraph Component1["Interfaz"]
        FileErrorHandler["errorHandler.js"]
        FileUtils["utils.js"]
        FileApiMessages["apiMessages.js"]
        FileWasteFields["wasteFields.js"]
        Form["wasteStockAdditionForm.js"]
        Modal["wasteStockAdditionModal.js"]
        Page["wastesPage.js"]
        FileTableOperations["tableOperations.js"]
        Table["wasteDatatable.js"]
        FileModalUI["modalUI.js"]
        FormUtils["formUtils.js"]
        FileResponseUtils["responseUtils.js"]
        FileBaseValidations["baseValidations.js"]
        FileFieldValidations["fieldValidations.js"]
        FileValidators["validators.js"]
        EJS["wastesPage.ejs"]
    end
    subgraph Component2["Aplicación y requests"]
        Application["createCrudApplication.js"]
        FileWastes["wastes.js"]
        Request["wasteService.js"]
    end
    FileErrorHandler -->|import| FileApiMessages
    FileUtils -->|import| FileApiMessages
    FileWastes -->|import| Request
    FileWastes -->|import| Application
    Form -->|import| FileWastes
    Form -->|import| FileValidators
    Form -->|import| FileWasteFields
    Modal -->|import| FileModalUI
    Page -->|import| Table
    Page -->|import| Modal
    Page -->|import| Form
    Table -->|import| FileTableOperations
    Table -->|import| FileWastes
    FormUtils -->|import| FileApiMessages
    FormUtils -->|import| FileTableOperations
    FormUtils -->|import| FileModalUI
    FileResponseUtils -->|import| FileApiMessages
    FileFieldValidations -->|import| FileBaseValidations
    FileValidators -->|import| FileBaseValidations
    FileValidators -->|import| FileFieldValidations
    Transport -->|import| FileWasteController
```

## Construcción de funciones para esta operación

El configurador se ejecuta al evaluar su módulo. Después se invoca la función devuelta
por la fábrica, usando el nombre público mostrado en la secuencia.

| Nombre público | Archivo configurador (alias) | Archivo que construye el cuerpo (alias) |
| --- | --- | --- |
| `addWasteStock` | `FileWastes` | `Application` · `createCrudApplication(...)` |

## Coordinación de la interfaz

El listener pertenece a `formUI.js`; normalización y callbacks pertenecen al formulario
del recurso. Este nivel termina antes del envío.

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant FormCore@{ "type": "control" } as formUI.js
    participant Form@{ "type": "boundary" } as wasteStockAdditionForm.js
    participant FormUtils@{ "type": "control" } as formUtils.js
    participant FileFormErrorsUI@{ "type": "control" } as formErrorsUI.js

    Initiator->>Browser: inicia CU-ALM-13 — Agregar existencia de merma
    Browser->>FormCore: submit — listener registrado por useForm()
    FormCore->>Form: normalizeData({ form, formData })
    Form->>FormUtils: pickFormFields(formData, wasteStockAdditionFields)
    FormUtils-->>Form: pickFormFields(): Object
    Form-->>FormCore: normalizeData(): Object
    FormCore->>Form: getErrors({ form, formData })
    Form->>FormUtils: validateFields(wasteStockAdditionValidation, formData)
    FormUtils-->>Form: validateFields(): Object
    Form-->>FormCore: getErrors(): Object
    FormCore->>FileFormErrorsUI: normalizeFormErrors({ form, errors })
    FormCore->>FileFormErrorsUI: toggleErrorMessages(form, errors)
    FormCore->>FormUtils: hasValidationErrors(errors)
    FormUtils-->>FormCore: hasValidationErrors(): boolean
    alt Datos inválidos
        FormCore->>FileFormErrorsUI: scrollToFirstFormError(form)
        FormCore-->>Browser: conservar datos y errores sin request
    else Datos válidos
        break dataset.submitting es true
            FormCore-->>Browser: envío duplicado rechazado
        end
        Note over FormCore,Form: Establece submitting y deshabilita submit antes del callback
    end
```

## Envío y resultado de la interfaz

Continúa con datos válidos y sin otro envío en curso. `handleSubmit` elige `update`
por el modo del formulario y ejecuta los efectos de interfaz después del éxito.

```mermaid
sequenceDiagram
    autonumber
    participant FormCore@{ "type": "control" } as formUI.js
    participant Form@{ "type": "boundary" } as wasteStockAdditionForm.js
    participant FormUtils@{ "type": "control" } as formUtils.js
    participant Application@{ "type": "control" } as createCrudApplication.js
    participant FileErrorHandler@{ "type": "control" } as errorHandler.js

    participant FileSwalComponent@{ "type": "control" } as swalComponent.js

    FormCore->>Form: sendRequest({ form, formData })
    Form->>FormUtils: handleSubmit({ form, formData, update: addWasteStock })
    FormUtils->>Application: addWasteStock({ formData, id: form.dataset.id })
    alt Mutación aceptada
        Application-->>FormUtils: addWasteStock(): Promise[{ message, data: Waste }]
        FormUtils->>FileSwalComponent: notifications.showSuccess(response.message)
        Note over FormUtils: Cierre y recarga ampliados en los efectos transversales de handleSubmit
        FormUtils-->>Form: handleSubmit(): Promise[Waste]
    else Error HTTP o de dominio
        Application-->>FormUtils: error propagado
        FormUtils-->>Form: error propagado por handleSubmit()
        Form-->>FormCore: error propagado por sendRequest()
        FormCore->>FileErrorHandler: handleApiError({ err, form, normalizeServerErrors })
    end
```

## Colaboración de aplicación y transporte

El nombre público apunta a la closure construida al cargar el configurador. No existe
una llamada de delegación por el reexport. El request recibe `data`, no `formData`.

```mermaid
sequenceDiagram
    autonumber
    participant FormUtils@{ "type": "control" } as formUtils.js
    participant Application@{ "type": "control" } as createCrudApplication.js
    participant Request@{ "type": "boundary" } as wasteService.js
    participant HTTP@{ "type": "boundary" } as axiosInstanceApi.js
    participant Transport@{ "type": "control" } as wasteApiRoute.js
    participant FileUtils@{ "type": "control" } as utils.js

    participant FileResponseUtils@{ "type": "control" } as responseUtils.js

    FormUtils->>Application: addWasteStock({ formData, id })
    Application->>Request: addWasteStockRequest({ data: formData, id })
    Request->>HTTP: apiRequest({ method: 'post', url, data })
    HTTP->>Transport: POST /api/warehouse/wastes/:id/stock-additions
    alt Mutación aceptada
        Transport-->>HTTP: HTTP 200 { waste, code }
        HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
        Request-->>Application: addWasteStockRequest(): Promise[AxiosResponse]
        Application->>FileResponseUtils: createSuccessResponseFromRequest({ response, dataKey: 'waste' })
        FileResponseUtils-->>Application: createSuccessResponseFromRequest(): Object — detalle transversal CRUD
        Application-->>FormUtils: addWasteStock(): Promise[{ message, data: Waste }]
    else Error HTTP o de dominio
        Transport-->>HTTP: HTTP error { code, message }
        opt No se inicia renovación: status distinto de 401 o request._retry
            HTTP->>FileUtils: normalizeHttpError(err)
            FileUtils-->>HTTP: normalizeHttpError(): Object
        end
        HTTP-->>Request: error propagado
        Request-->>Application: error propagado
        Application-->>FormUtils: error propagado
    end
```
