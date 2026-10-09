<a id="cu-sal-20"></a>
# `CU-SAL-20` — Devolver consumible surtido

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
| `View` | boundary | [`issueReturnUI.js`](../../../../../../src/public/js/ui/issues/issueReturnUI.js) |
| `Application` | control | [`createCrudApplication.js`](../../../../../../src/public/js/application/createCrudApplication.js) |
| `Request` | boundary | [`createGoodsIssueRequests.js`](../../../../../../src/public/js/services/warehouse/goodsIssues/createGoodsIssueRequests.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `Transport` | control | [`consumableGoodsIssueApiRoute.js`](../../../../../../src/routes/api/warehouse/goodsIssues/consumables/consumableGoodsIssueApiRoute.js) |
| `Form` | control | [`formUI.js`](../../../../../../src/public/js/ui/forms/formUI.js) |
| `FormUtils` | control | [`formUtils.js`](../../../../../../src/public/js/utils/formUtils.js) |
| `FileFormErrorsUI` | control | [`formErrorsUI.js`](../../../../../../src/public/js/ui/forms/formErrorsUI.js) |
| `FileSwalComponent` | control | [`swalComponent.js`](../../../../../../src/public/js/plugins/swal/swalComponent.js) |
| `FileBaseInstance` | control | [`baseInstance.js`](../../../../../../src/public/js/plugins/mdb/baseInstance.js) |
| `FileErrorHandler` | control | [`errorHandler.js`](../../../../../../src/public/js/api/errorHandler.js) |
| `FileConsumableGoodsIssueController` | control | [`consumableGoodsIssueController.js`](../../../../../../src/controllers/api/warehouse/goodsIssues/consumables/consumableGoodsIssueController.js) |
| `FileConsumableGoodsIssues` | control | [`consumableGoodsIssues.js`](../../../../../../src/public/js/application/warehouse/goodsIssues/consumables/consumableGoodsIssues.js) |
| `FileGoodsIssues` | control | [`goodsIssues.js`](../../../../../../src/public/js/application/warehouse/goodsIssues/goodsIssues.js) |
| `FileMaterialGoodsIssues` | control | [`materialGoodsIssues.js`](../../../../../../src/public/js/application/warehouse/goodsIssues/materials/materialGoodsIssues.js) |
| `FileCreateIssueApplication` | control | [`createIssueApplication.js`](../../../../../../src/public/js/application/warehouse/issues/createIssueApplication.js) |
| `FileConsumableGoodsIssueService` | control | [`consumableGoodsIssueService.js`](../../../../../../src/public/js/services/warehouse/goodsIssues/consumables/consumableGoodsIssueService.js) |
| `FileMaterialGoodsIssueService` | control | [`materialGoodsIssueService.js`](../../../../../../src/public/js/services/warehouse/goodsIssues/materials/materialGoodsIssueService.js) |
| `FileResponseUtils` | control | [`responseUtils.js`](../../../../../../src/public/js/utils/responseUtils.js) |
| `FileApiMessages` | control | [`apiMessages.js`](../../../../../../src/public/js/constants/apiMessages.js) |
| `FileUtils` | control | [`utils.js`](../../../../../../src/public/js/api/utils.js) |
| `FileValidators` | control | [`validators.js`](../../../../../../src/public/js/utils/validations/validators.js) |
| `FileFieldValidations` | control | [`fieldValidations.js`](../../../../../../src/public/js/utils/validations/fieldValidations.js) |
| `FileBaseValidations` | control | [`baseValidations.js`](../../../../../../src/public/js/utils/validations/baseValidations.js) |
| `FileGoodsIssueReturn` | control | [`goodsIssueReturn.js`](../../../../../../src/public/js/pages/warehouse/goodsIssues/returns/goodsIssueReturn.js) |
| `FileGoodsIssueContext` | control | [`goodsIssueContext.js`](../../../../../../src/public/js/pages/warehouse/goodsIssues/goodsIssueContext.js) |

### Configuración y construcción

Estos módulos seleccionan/configuran y exportan la función de aplicación. Su cuerpo se ejecuta en la fábrica de la línea `Application`, sin una llamada intermedia entre reexports: [`goodsIssues.js`](../../../../../../src/public/js/application/warehouse/goodsIssues/goodsIssues.js), [`consumableGoodsIssues.js`](../../../../../../src/public/js/application/warehouse/goodsIssues/consumables/consumableGoodsIssues.js).

Estos módulos configuran o reexportan el request. La función que llama a `apiRequest` está definida en el archivo de la línea `Request`: [`consumableGoodsIssueService.js`](../../../../../../src/public/js/services/warehouse/goodsIssues/consumables/consumableGoodsIssueService.js).

El endpoint queda representado por su router. El controller asociado se desarrolla en la [secuencia backend `CU-SAL-20`](../../backend-code-sequences/issues/cu-sal-20.md#cu-sal-20): [`consumableGoodsIssueController.js`](../../../../../../src/controllers/api/warehouse/goodsIssues/consumables/consumableGoodsIssueController.js).

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
        FileConsumableGoodsIssueController["consumableGoodsIssueController.js"]
        Transport["consumableGoodsIssueApiRoute.js"]
    end
    subgraph Component1["Interfaz"]
        FileErrorHandler["errorHandler.js"]
        FileUtils["utils.js"]
        FileApiMessages["apiMessages.js"]
        FileGoodsIssueContext["goodsIssueContext.js"]
        FileGoodsIssueReturn["goodsIssueReturn.js"]
        View["issueReturnUI.js"]
        FormUtils["formUtils.js"]
        FileResponseUtils["responseUtils.js"]
        FileBaseValidations["baseValidations.js"]
        FileFieldValidations["fieldValidations.js"]
        FileValidators["validators.js"]
    end
    subgraph Component2["Aplicación y requests"]
        Application["createCrudApplication.js"]
        FileConsumableGoodsIssues["consumableGoodsIssues.js"]
        FileGoodsIssues["goodsIssues.js"]
        FileMaterialGoodsIssues["materialGoodsIssues.js"]
        FileCreateIssueApplication["createIssueApplication.js"]
        FileConsumableGoodsIssueService["consumableGoodsIssueService.js"]
        Request["createGoodsIssueRequests.js"]
        FileMaterialGoodsIssueService["materialGoodsIssueService.js"]
    end
    FileErrorHandler -->|import| FileApiMessages
    FileUtils -->|import| FileApiMessages
    FileConsumableGoodsIssues -->|import| FileConsumableGoodsIssueService
    FileConsumableGoodsIssues -->|import| FileCreateIssueApplication
    FileGoodsIssues -->|import| FileMaterialGoodsIssues
    FileGoodsIssues -->|import| FileConsumableGoodsIssues
    FileGoodsIssues -->|import| FileGoodsIssueContext
    FileMaterialGoodsIssues -->|import| FileMaterialGoodsIssueService
    FileMaterialGoodsIssues -->|import| FileCreateIssueApplication
    FileCreateIssueApplication -->|import| Application
    FileGoodsIssueReturn -->|import| FileGoodsIssues
    FileGoodsIssueReturn -->|import| View
    FileConsumableGoodsIssueService -->|import| Request
    FileMaterialGoodsIssueService -->|import| Request
    View -->|import| FileValidators
    FormUtils -->|import| FileApiMessages
    FileResponseUtils -->|import| FileApiMessages
    FileFieldValidations -->|import| FileBaseValidations
    FileValidators -->|import| FileBaseValidations
    FileValidators -->|import| FileFieldValidations
    Transport -->|import| FileConsumableGoodsIssueController
```

## Construcción de funciones para esta operación

El configurador se ejecuta al evaluar su módulo. Después se invoca la función devuelta
por la fábrica, usando el nombre público mostrado en la secuencia.

| Nombre público | Archivo configurador (alias) | Archivo que construye el cuerpo (alias) |
| --- | --- | --- |
| `returnConsumableGoodsIssueDetailRequest` | `FileConsumableGoodsIssueService` | `Request` · `createGoodsIssueRequests(...)` |

## Coordinación de la interfaz

Este nivel conserva entrada, callbacks y efectos de interfaz. La llamada a `Application` se amplía en la colaboración de transporte, con los mismos argumentos y resultado.

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant View@{ "type": "boundary" } as issueReturnUI.js
    participant Application@{ "type": "control" } as createCrudApplication.js
    participant Form@{ "type": "control" } as formUI.js
    participant FormUtils@{ "type": "control" } as formUtils.js

    participant FileBaseInstance@{ "type": "control" } as baseInstance.js
    participant FileErrorHandler@{ "type": "control" } as errorHandler.js
    participant FileFormErrorsUI@{ "type": "control" } as formErrorsUI.js
    participant FileSwalComponent@{ "type": "control" } as swalComponent.js

    Note over Application: Closure configurada
    Initiator->>Browser: inicia CU-SAL-20 — Devolver consumible surtido
    Browser->>Form: submit manejado por useForm(...)
    Form->>View: normalizeData({ form, formData }) — callback configurado
    activate View
    View-->>Form: normalizeData(): Object — datos normalizados
    deactivate View
    Form->>View: getErrors({ form, formData }) — callback configurado
    View->>FormUtils: validateFields(issueReturnValidation, formData)
    activate FormUtils
    FormUtils-->>View: validateFields(): Object — errores por campo
    deactivate FormUtils
    View-->>Form: getErrors(): Object
    Form->>FileFormErrorsUI: normalizeFormErrors({ form, errors }) — callback por defecto
    Form->>FileFormErrorsUI: toggleErrorMessages(form, errors)
    Form->>FormUtils: hasValidationErrors(errors)
    FormUtils-->>Form: hasValidationErrors(): boolean
    alt Hay errores de validación
        Form->>FileFormErrorsUI: scrollToFirstFormError(form)
    else Datos válidos
        break Envío ya en curso
            Form-->>Browser: envío duplicado rechazado, sin otro request
    end
        Note over Form: dataset.submitting = 'true', botón submit deshabilitado
        Form->>View: sendRequest({ form, formData }) — callback configurado
        View->>Application: returnGoodsIssueDetail({ id, detailId, formData })
        alt Respuesta exitosa
            Application-->>View: returnGoodsIssueDetail(): Promise[{ message, data: goodsIssueReturn }]
            View->>FileSwalComponent: notifications.showSuccess(response.message)
            View->>FileBaseInstance: initMdbModal(getModal()).hide()
            View->>Browser: window.location.reload()
        else Error HTTP o de dominio
            Application-->>View: error propagado
            Form->>FileErrorHandler: handleApiError({ err, form }) conserva el formulario
    end
    end
```

## Colaboración de aplicación y transporte

Amplía la llamada a `Application` del nivel anterior: cada request y el cliente HTTP tienen su propio archivo. El router identifica el endpoint de destino; su ejecución interna está en la secuencia backend del mismo CU. Los resultados regresan al caller de la primera figura.

```mermaid
sequenceDiagram
    autonumber
    participant View@{ "type": "boundary" } as issueReturnUI.js
    participant Application@{ "type": "control" } as createCrudApplication.js
    participant Request@{ "type": "boundary" } as createGoodsIssueRequests.js
    participant HTTP@{ "type": "boundary" } as axiosInstanceApi.js
    participant Transport@{ "type": "control" } as consumableGoodsIssueApiRoute.js

    participant FileUtils@{ "type": "control" } as utils.js

    participant FileResponseUtils@{ "type": "control" } as responseUtils.js

    Note over Application: Closure configurada
    Note over Request: Request configurado
    activate View
    deactivate View
        View->>Application: returnGoodsIssueDetail({ id, detailId, formData })
        Application->>Request: returnConsumableGoodsIssueDetailRequest({ id, detailId, data: formData })
        Request->>HTTP: apiRequest({ method: 'patch', url, data })
        HTTP->>Transport: PATCH /api/warehouse/goods-issues/consumables/:id/details/:detailId/returns
        alt Respuesta exitosa
            Transport-->>HTTP: HTTP 200 { goodsIssueReturn, code }
            HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
            Request-->>Application: returnConsumableGoodsIssueDetailRequest(): Promise[AxiosResponse]
            Application->>FileResponseUtils: createSuccessResponseFromRequest({ response, dataKey })
            FileResponseUtils-->>Application: createSuccessResponseFromRequest(): Object — detalle transversal CRUD
            Application-->>View: returnGoodsIssueDetail(): Promise[{ message, data: goodsIssueReturn }]
        else Error HTTP o de dominio
            Transport-->>HTTP: HTTP de error { code, message }
            opt No se inicia renovación: status distinto de 401 o request._retry
                HTTP->>FileUtils: normalizeHttpError(err)
                FileUtils-->>HTTP: normalizeHttpError(): Object — status, data, message, raw
            end
            HTTP-->>Request: error normalizado
            Request-->>Application: error propagado
            Application-->>View: error propagado
    end
```
