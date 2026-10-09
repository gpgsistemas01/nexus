<a id="cu-alm-19"></a>
# `CU-ALM-19` — Editar consumible

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
| `View` | boundary | [`materialForm.js`](../../../../../../src/public/js/pages/warehouse/materials/materialForm.js) |
| `Application` | control | [`createCrudApplication.js`](../../../../../../src/public/js/application/createCrudApplication.js) |
| `Request` | boundary | [`consumableService.js`](../../../../../../src/public/js/services/warehouse/consumableService.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `Transport` | control | [`consumableApiRoute.js`](../../../../../../src/routes/api/warehouse/consumableApiRoute.js) |
| `Modal` | boundary | [`materialModal.js`](../../../../../../src/public/js/pages/warehouse/materials/materialModal.js) |
| `FormUtils` | control | [`formUtils.js`](../../../../../../src/public/js/utils/formUtils.js) |
| `Form` | control | [`formUI.js`](../../../../../../src/public/js/ui/forms/formUI.js) |
| `FileFormErrorsUI` | control | [`formErrorsUI.js`](../../../../../../src/public/js/ui/forms/formErrorsUI.js) |
| `FileErrorHandler` | control | [`errorHandler.js`](../../../../../../src/public/js/api/errorHandler.js) |
| `FileResponseUtils` | control | [`responseUtils.js`](../../../../../../src/public/js/utils/responseUtils.js) |
| `FileApiMessages` | control | [`apiMessages.js`](../../../../../../src/public/js/constants/apiMessages.js) |
| `FileConsumableController` | control | [`consumableController.js`](../../../../../../src/controllers/api/warehouse/consumableController.js) |
| `FileConsumables` | control | [`consumables.js`](../../../../../../src/public/js/application/warehouse/consumables/consumables.js) |
| `FileValidators` | control | [`validators.js`](../../../../../../src/public/js/utils/validations/validators.js) |
| `FileFieldValidations` | control | [`fieldValidations.js`](../../../../../../src/public/js/utils/validations/fieldValidations.js) |
| `FileBaseValidations` | control | [`baseValidations.js`](../../../../../../src/public/js/utils/validations/baseValidations.js) |
| `FileSwalComponent` | control | [`swalComponent.js`](../../../../../../src/public/js/plugins/swal/swalComponent.js) |
| `FileModalUI` | control | [`modalUI.js`](../../../../../../src/public/js/ui/modalUI.js) |
| `FileTableOperations` | control | [`tableOperations.js`](../../../../../../src/public/js/plugins/datatable/core/base/tableOperations.js) |

### Configuración y construcción

El endpoint queda representado por su router. El controller asociado se desarrolla en la [secuencia backend `CU-ALM-19`](../../backend-code-sequences/catalogs/cu-alm-19.md#cu-alm-19): [`consumableController.js`](../../../../../../src/controllers/api/warehouse/consumableController.js).

La línea `Application` ejecuta la función generada en `createCrudApplication.js`. Su nombre público y la configuración de requests/contratos provienen de [`consumables.js`](../../../../../../src/public/js/application/warehouse/consumables/consumables.js); exportar esa función no crea otra llamada durante cada petición.

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
        FileConsumableController["consumableController.js"]
        Transport["consumableApiRoute.js"]
    end
    subgraph Component1["Interfaz"]
        FileErrorHandler["errorHandler.js"]
        FileApiMessages["apiMessages.js"]
        View["materialForm.js"]
        Modal["materialModal.js"]
        FileTableOperations["tableOperations.js"]
        FileModalUI["modalUI.js"]
        FormUtils["formUtils.js"]
        FileResponseUtils["responseUtils.js"]
        FileBaseValidations["baseValidations.js"]
        FileFieldValidations["fieldValidations.js"]
        FileValidators["validators.js"]
    end
    subgraph Component2["Aplicación y requests"]
        Application["createCrudApplication.js"]
        FileConsumables["consumables.js"]
        Request["consumableService.js"]
    end
    FileErrorHandler -->|import| FileApiMessages
    FileConsumables -->|import| Request
    FileConsumables -->|import| Application
    View -->|import| FileConsumables
    View -->|import| FileValidators
    Modal -->|import| FileModalUI
    FormUtils -->|import| FileApiMessages
    FormUtils -->|import| FileTableOperations
    FormUtils -->|import| FileModalUI
    FileResponseUtils -->|import| FileApiMessages
    FileFieldValidations -->|import| FileBaseValidations
    FileValidators -->|import| FileBaseValidations
    FileValidators -->|import| FileFieldValidations
    Transport -->|import| FileConsumableController
```

## Construcción de funciones para esta operación

El configurador se ejecuta al evaluar su módulo. Después se invoca la función devuelta
por la fábrica, usando el nombre público mostrado en la secuencia.

| Nombre público | Archivo configurador (alias) | Archivo que construye el cuerpo (alias) |
| --- | --- | --- |
| `editConsumable` | `FileConsumables` | `Application` · `createCrudApplication(...)` |

## Coordinación de la interfaz

Este nivel conserva entrada, callbacks y efectos de interfaz. La llamada a `Application` se amplía en la colaboración de transporte, con los mismos argumentos y resultado.

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant Form@{ "type": "control" } as formUI.js
    participant View@{ "type": "boundary" } as materialForm.js
    participant FormUtils@{ "type": "control" } as formUtils.js
    participant Modal@{ "type": "boundary" } as materialModal.js
    participant Application@{ "type": "control" } as createCrudApplication.js

    participant FileErrorHandler@{ "type": "control" } as errorHandler.js
    participant FileFormErrorsUI@{ "type": "control" } as formErrorsUI.js

    participant FileSwalComponent@{ "type": "control" } as swalComponent.js

    Initiator->>Browser: inicia CU-ALM-19 — Editar consumible
    Browser->>Modal: openMaterialModal({ mode: EDIT, resource: CONSUMABLE, data })
    Browser->>Form: submit — listener registrado por useForm(...)
    Form->>View: normalizeData({ form, formData }) — callback configurado
    View-->>Form: normalizeData(): Object — datos normalizados
    Form->>View: getErrors({ form, formData }) — callback configurado
    View->>FormUtils: validateFields(materialEditValidation, formData)
    FormUtils-->>View: validateFields(): Object — errores por campo
    View-->>Form: getErrors(): Object — errores por campo
    Form->>FileFormErrorsUI: normalizeFormErrors({ form, errors }) — callback por defecto
    Form->>FileFormErrorsUI: toggleErrorMessages(form, errors)
    Form->>FormUtils: hasValidationErrors(errors)
    FormUtils-->>Form: hasValidationErrors(): boolean
    alt materialEditValidation devuelve errores
        Form->>FileFormErrorsUI: scrollToFirstFormError(form)
        Form-->>Browser: conservar datos y errores, no se realiza request
    else Formulario válido
        break Envío ya en curso
            Form-->>Browser: envío duplicado rechazado sin request
        end
        Note over Form: Marca dataset.submitting y deshabilita submit antes del callback
        Form->>View: sendRequest({ form, formData }) — callback configurado
        View->>FormUtils: handleSubmit({ form, formData, create, update })
        FormUtils->>Application: editConsumable({ id, formData })
        activate Application
        alt Respuesta exitosa
            Application-->>FormUtils: editConsumable(): Promise[{ message: string }]
            FormUtils->>FileSwalComponent: notifications.showSuccess(response.message)
            Note over FormUtils: Cierre y recarga ampliados en los efectos transversales de handleSubmit
            FormUtils-->>View: handleSubmit(): Promise[Object] — entidad guardada, cierre y recarga
            View-->>Browser: table.ajax.reload(null, false) después de guardar
        else Respuesta rechazada
            Application-->>FormUtils: throw { status: number, data: Object | null, message: string, raw: Error }
            FormUtils-->>View: error propagado por handleSubmit()
            View-->>Form: error propagado por sendRequest()
            Form->>FileErrorHandler: handleApiError({ err, form }) conserva los datos
        end
        deactivate Application
    end
```

## Colaboración de aplicación y transporte

Amplía la llamada a `Application` del nivel anterior: cada request y el cliente HTTP tienen su propio archivo. El router identifica el endpoint de destino; su ejecución interna está en la secuencia backend del mismo CU. Los resultados regresan al caller de la primera figura.

```mermaid
sequenceDiagram
    autonumber
    participant FormUtils@{ "type": "control" } as formUtils.js
    participant Application@{ "type": "control" } as createCrudApplication.js
    participant Request@{ "type": "boundary" } as consumableService.js
    participant HTTP@{ "type": "boundary" } as axiosInstanceApi.js
    participant Transport@{ "type": "control" } as consumableApiRoute.js

    participant FileResponseUtils@{ "type": "control" } as responseUtils.js

    FormUtils->>Application: editConsumable({ id, formData })
    activate Application
    Application->>Request: editConsumableRequest({ id, data: formData })
    Request->>HTTP: apiRequest({ method: 'patch', url, data })
    HTTP->>Transport: envía PATCH /api/warehouse/consumables/:id
    activate Transport
    Transport-->>HTTP: HTTP 200 { material, code }
    deactivate Transport
    HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
    Request-->>Application: editConsumableRequest(): Promise[AxiosResponse]
    Application->>FileResponseUtils: createSuccessResponseFromRequest({ response, dataKey })
    FileResponseUtils-->>Application: createSuccessResponseFromRequest(): Object — detalle transversal CRUD
    alt Respuesta exitosa
        Application-->>FormUtils: editConsumable(): Promise[{ message: string }]
    else Respuesta rechazada
        Application-->>FormUtils: throw { status: number, data: Object | null, message: string, raw: Error }
    end
    deactivate Application
```
