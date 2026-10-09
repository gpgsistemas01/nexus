<a id="cu-sal-13"></a>
# `CU-SAL-13` — Devolver merma surtida

**Patrones:** `FE-P05`, `FE-P06`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.
La composición incluye también los archivos de configuración, construcción y reexport: cada
uno tiene un nodo propio, aunque no ejecute una delegación durante la petición.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `Issue` | boundary | [`wasteIssueReturn.js`](../../../../../../src/public/js/pages/warehouse/wasteIssues/returns/wasteIssueReturn.js) |
| `Return` | boundary | [`issueReturnUI.js`](../../../../../../src/public/js/ui/issues/issueReturnUI.js) |
| `App` | control | [`wasteIssues.js`](../../../../../../src/public/js/application/warehouse/wasteIssues/wasteIssues.js) |
| `Request` | boundary | [`wasteIssueService.js`](../../../../../../src/public/js/services/warehouse/wasteIssueService.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `API` | control | [`wasteIssueController.js`](../../../../../../src/controllers/api/warehouse/wasteIssueController.js) |
| `FormUtils` | control | [`formUtils.js`](../../../../../../src/public/js/utils/formUtils.js) |
| `FileUtils` | control | [`utils.js`](../../../../../../src/public/js/api/utils.js) |
| `FileValidators` | control | [`validators.js`](../../../../../../src/public/js/utils/validations/validators.js) |
| `FileFieldValidations` | control | [`fieldValidations.js`](../../../../../../src/public/js/utils/validations/fieldValidations.js) |
| `FileBaseValidations` | control | [`baseValidations.js`](../../../../../../src/public/js/utils/validations/baseValidations.js) |
| `FileCreateIssueApplication` | control | [`createIssueApplication.js`](../../../../../../src/public/js/application/warehouse/issues/createIssueApplication.js) |
| `Application` | control | [`createCrudApplication.js`](../../../../../../src/public/js/application/createCrudApplication.js) |
| `Form` | control | [`formUI.js`](../../../../../../src/public/js/ui/forms/formUI.js) |
| `FileFormErrorsUI` | control | [`formErrorsUI.js`](../../../../../../src/public/js/ui/forms/formErrorsUI.js) |
| `FileErrorHandler` | control | [`errorHandler.js`](../../../../../../src/public/js/api/errorHandler.js) |
| `FileSwalComponent` | control | [`swalComponent.js`](../../../../../../src/public/js/plugins/swal/swalComponent.js) |
| `FileBaseInstance` | control | [`baseInstance.js`](../../../../../../src/public/js/plugins/mdb/baseInstance.js) |
| `FileResponseUtils` | control | [`responseUtils.js`](../../../../../../src/public/js/utils/responseUtils.js) |
| `FileApiMessages` | control | [`apiMessages.js`](../../../../../../src/public/js/constants/apiMessages.js) |
| `Transport` | control | [`wasteIssueApiRoute.js`](../../../../../../src/routes/api/warehouse/wasteIssueApiRoute.js) |
| `FileFormStateUI` | control | [`formStateUI.js`](../../../../../../src/public/js/ui/forms/formStateUI.js) |

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
        API["wasteIssueController.js"]
        Transport["wasteIssueApiRoute.js"]
    end
    subgraph Component1["Interfaz"]
        FileErrorHandler["errorHandler.js"]
        FileUtils["utils.js"]
        FileApiMessages["apiMessages.js"]
        Issue["wasteIssueReturn.js"]
        Return["issueReturnUI.js"]
        FormUtils["formUtils.js"]
        FileResponseUtils["responseUtils.js"]
        FileBaseValidations["baseValidations.js"]
        FileFieldValidations["fieldValidations.js"]
        FileValidators["validators.js"]
    end
    subgraph Component2["Aplicación y requests"]
        Application["createCrudApplication.js"]
        FileCreateIssueApplication["createIssueApplication.js"]
        App["wasteIssues.js"]
        Request["wasteIssueService.js"]
    end
    FileErrorHandler -->|import| FileApiMessages
    FileUtils -->|import| FileApiMessages
    FileCreateIssueApplication -->|import| Application
    App -->|import| Request
    App -->|import| FileCreateIssueApplication
    Issue -->|import| App
    Return -->|import| FileValidators
    FormUtils -->|import| FileApiMessages
    FileResponseUtils -->|import| FileApiMessages
    FileFieldValidations -->|import| FileBaseValidations
    FileValidators -->|import| FileBaseValidations
    FileValidators -->|import| FileFieldValidations
    Transport -->|import| API
```

## Construcción de funciones para esta operación

El configurador se ejecuta al evaluar su módulo. Después se invoca la función devuelta
por la fábrica, usando el nombre público mostrado en la secuencia.

| Nombre público | Archivo configurador (alias) | Archivo que construye el cuerpo (alias) |
| --- | --- | --- |
| `returnWasteIssueDetail` | `App` | `FileCreateIssueApplication` · `createIssueApplication(...)` |

## Coordinación de la interfaz

`initializeWasteIssueReturns` registra el listener y `createIssueReturn` configura
`useForm` antes de la selección. La interacción inicia sobre esos listeners.

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant Issue@{ "type": "boundary" } as wasteIssueReturn.js
    participant Return@{ "type": "boundary" } as issueReturnUI.js
    participant Form@{ "type": "control" } as formUI.js
    participant FormUtils@{ "type": "control" } as formUtils.js
    participant FileFormErrorsUI@{ "type": "control" } as formErrorsUI.js
    participant Application@{ "type": "control" } as createCrudApplication.js
    participant FileSwalComponent@{ "type": "control" } as swalComponent.js
    participant FileBaseInstance@{ "type": "control" } as baseInstance.js
    participant FileErrorHandler@{ "type": "control" } as errorHandler.js

    participant FileFormStateUI@{ "type": "control" } as formStateUI.js

    Initiator->>Browser: inicia CU-SAL-13 — Devolver merma surtida
    Browser->>Issue: click en .return-issue-detail-btn — listener ya registrado
    Issue->>Return: open({ issue: { id: getIssueId() }, detail })
    Return->>Browser: openModal(getModal()) — cantidad disponible = surtida - devuelta
    Browser->>Form: submit — listener registrado por useForm()
    Form->>Return: normalizeData({ formData })
    Return-->>Form: normalizeData(): Object — returnQuantity como número
    Form->>Return: getErrors({ form, formData })
    Return->>FormUtils: validateFields(issueReturnValidation, formData)
    FormUtils-->>Return: validateFields(): Object
    Return-->>Form: getErrors(): Object — incluye límite disponible
    Form->>FileFormErrorsUI: normalizeFormErrors({ form, errors })
    Form->>FileFormErrorsUI: toggleErrorMessages(form, errors)
    Form->>FormUtils: hasValidationErrors(errors)
    alt Datos inválidos
        Form->>FileFormErrorsUI: scrollToFirstFormError(form)
    else Datos válidos
        break dataset.submitting es true
            Form-->>Browser: envío duplicado rechazado
        end
        Note over Form,Return: Establece submitting y deshabilita submit antes del callback
        Form->>Return: sendRequest({ form, formData })
        break No hay id o detailId
            Return->>FileSwalComponent: notifications.showError(message)
        Return->>FileFormStateUI: resetFormSubmitState(form)
            Return-->>Form: sendRequest(): Promise[void] — sin request
        end
        Return->>Application: returnWasteIssueDetail({ id, detailId, formData })
        alt Devolución aceptada
            Application-->>Return: returnWasteIssueDetail(): Promise[{ message, data: WasteIssueReturn }]
            Return->>FileSwalComponent: notifications.showSuccess(response.message)
            Return->>FileBaseInstance: initMdbModal(getModal()).hide()
            Return->>Browser: window.location.reload()
        else Error HTTP o de dominio
            Application-->>Return: error propagado
            Return-->>Form: error propagado por sendRequest()
            Form->>FileErrorHandler: handleApiError({ err, form, normalizeServerErrors })
        end
    end
```

## Colaboración de aplicación y transporte

La llamada a la función generada se amplía aquí; el configurador `wasteIssues.js` y el
wrapper `createIssueApplication.js` aparecen separadamente en la composición.

```mermaid
sequenceDiagram
    autonumber
    participant Return@{ "type": "boundary" } as issueReturnUI.js
    participant Application@{ "type": "control" } as createCrudApplication.js
    participant Request@{ "type": "boundary" } as wasteIssueService.js
    participant HTTP@{ "type": "boundary" } as axiosInstanceApi.js
    participant Transport@{ "type": "control" } as wasteIssueApiRoute.js
    participant FileUtils@{ "type": "control" } as utils.js

    participant FileResponseUtils@{ "type": "control" } as responseUtils.js

    Return->>Application: returnWasteIssueDetail({ id, detailId, formData })
    Application->>Request: returnWasteIssueDetailRequest({ id, detailId, data: formData })
    Request->>HTTP: apiRequest({ method: 'patch', url, data })
    HTTP->>Transport: PATCH /api/warehouse/waste-issues/:id/details/:detailId/returns
    alt Devolución aceptada
        Transport-->>HTTP: HTTP 200 { wasteIssueReturn, code }
        HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
        Request-->>Application: returnWasteIssueDetailRequest(): Promise[AxiosResponse]
        Application->>FileResponseUtils: createSuccessResponseFromRequest({ response, dataKey: 'wasteIssueReturn' })
        FileResponseUtils-->>Application: createSuccessResponseFromRequest(): Object — detalle transversal CRUD
        Application-->>Return: returnWasteIssueDetail(): Promise[{ message, data: WasteIssueReturn }]
    else Cantidad inválida, estado incompatible o error HTTP
        Transport-->>HTTP: HTTP error { code, message }
        opt No se inicia renovación: status distinto de 401 o request._retry
            HTTP->>FileUtils: normalizeHttpError(err)
            FileUtils-->>HTTP: normalizeHttpError(): Object
        end
        HTTP-->>Request: error propagado
        Request-->>Application: error propagado
        Application-->>Return: error propagado
    end
```
