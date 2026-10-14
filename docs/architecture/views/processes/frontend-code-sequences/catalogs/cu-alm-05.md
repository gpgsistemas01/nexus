<a id="cu-alm-05"></a>
# `CU-ALM-05` — Ajustar existencia de material

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
| `EJS` | boundary | [`materialsPage.ejs`](../../../../../../src/views/pages/warehouse/materials/materialsPage.ejs) |
| `Form` | boundary | [`materialForm.js`](../../../../../../src/public/js/pages/warehouse/materials/materialForm.js) |
| `App` | control | [`materials.js`](../../../../../../src/public/js/application/warehouse/materials/materials.js) |
| `Factory` | control | [`createCrudApplication.js`](../../../../../../src/public/js/application/createCrudApplication.js) |
| `Request` | boundary | [`materialService.js`](../../../../../../src/public/js/services/warehouse/materialService.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `API` | control | [`materialController.js`](../../../../../../src/controllers/api/warehouse/materialController.js) |
| `FormUtils` | control | [`formUtils.js`](../../../../../../src/public/js/utils/formUtils.js) |
| `FileResponseUtils` | control | [`responseUtils.js`](../../../../../../src/public/js/utils/responseUtils.js) |
| `FileApiMessages` | control | [`apiMessages.js`](../../../../../../src/public/js/constants/apiMessages.js) |
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
| `Transport` | control | [`materialApiRoute.js`](../../../../../../src/routes/api/warehouse/materialApiRoute.js) |
| `FileMaterialFields` | control | [`materialFields.js`](../../../../../../src/public/js/pages/warehouse/materials/materialFields.js) |

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
        API["materialController.js"]
        Transport["materialApiRoute.js"]
    end
    subgraph Component1["Interfaz"]
        FileErrorHandler["errorHandler.js"]
        FileUtils["utils.js"]
        FileApiMessages["apiMessages.js"]
        FileMaterialFields["materialFields.js"]
        Form["materialForm.js"]
        FileTableOperations["tableOperations.js"]
        FileModalUI["modalUI.js"]
        FormUtils["formUtils.js"]
        FileResponseUtils["responseUtils.js"]
        FileBaseValidations["baseValidations.js"]
        FileFieldValidations["fieldValidations.js"]
        FileValidators["validators.js"]
        EJS["materialsPage.ejs"]
    end
    subgraph Component2["Aplicación y requests"]
        Factory["createCrudApplication.js"]
        App["materials.js"]
        Request["materialService.js"]
    end
    FileErrorHandler -->|import| FileApiMessages
    FileUtils -->|import| FileApiMessages
    App -->|import| Request
    App -->|import| Factory
    Form -->|import| App
    Form -->|import| FileValidators
    Form -->|import| FileMaterialFields
    FormUtils -->|import| FileApiMessages
    FormUtils -->|import| FileTableOperations
    FormUtils -->|import| FileModalUI
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
| `editMaterialStock` | `App` | `Factory` · `createCrudApplication(...)` |

## Coordinación de la interfaz

El listener pertenece a `formUI.js`; normalización y callbacks pertenecen al formulario
del recurso. Este nivel termina antes del envío.

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Administrador del sistema
    participant Browser as Navegador
    participant FormCore@{ "type": "control" } as formUI.js
    participant Form@{ "type": "boundary" } as materialForm.js
    participant FormUtils@{ "type": "control" } as formUtils.js
    participant FileFormErrorsUI@{ "type": "control" } as formErrorsUI.js

    Initiator->>Browser: inicia CU-ALM-05 — Ajustar existencia de material
    Browser->>FormCore: submit — listener registrado por useForm()
    FormCore->>Form: normalizeData({ form, formData })
    Form->>FormUtils: pickFormFields(formData, materialStockRequestFields)
    FormUtils-->>Form: pickFormFields(): Object
    Form-->>FormCore: normalizeData(): Object
    FormCore->>Form: getErrors({ form, formData })
    Form->>FormUtils: validateFields(materialStockValidation, formData)
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
    participant Form@{ "type": "boundary" } as materialForm.js
    participant FormUtils@{ "type": "control" } as formUtils.js
    participant Factory@{ "type": "control" } as createCrudApplication.js
    participant FileErrorHandler@{ "type": "control" } as errorHandler.js

    participant FileSwalComponent@{ "type": "control" } as swalComponent.js

    FormCore->>Form: sendRequest({ form, formData })
    Form->>FormUtils: handleSubmit({ form, formData, update: editMaterialStock })
    FormUtils->>Factory: editMaterialStock({ formData, id: form.dataset.id })
    alt Mutación aceptada
        Factory-->>FormUtils: editMaterialStock(): Promise[{ message }]
        FormUtils->>FileSwalComponent: notifications.showSuccess(response.message)
        Note over FormUtils: Cierre y recarga ampliados en los efectos transversales de handleSubmit
        FormUtils-->>Form: handleSubmit(): Promise[undefined]
        Form->>Form: form.onSave?.(undefined) — callback opcional
    else Error HTTP o de dominio
        Factory-->>FormUtils: error propagado
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
    participant Factory@{ "type": "control" } as createCrudApplication.js
    participant Request@{ "type": "boundary" } as materialService.js
    participant HTTP@{ "type": "boundary" } as axiosInstanceApi.js
    participant Transport@{ "type": "control" } as materialApiRoute.js
    participant FileUtils@{ "type": "control" } as utils.js

    participant FileResponseUtils@{ "type": "control" } as responseUtils.js

    FormUtils->>Factory: editMaterialStock({ formData, id })
    Factory->>Request: editMaterialStockRequest({ data: formData, id })
    Request->>HTTP: apiRequest({ method: 'patch', url, data })
    HTTP->>Transport: PATCH /api/warehouse/materials/:id/stock
    alt Mutación aceptada
        Transport-->>HTTP: HTTP 200 { material, code }
        HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
        Request-->>Factory: editMaterialStockRequest(): Promise[AxiosResponse]
        Factory->>FileResponseUtils: createSuccessResponseFromRequest({ response, dataKey: null })
        FileResponseUtils-->>Factory: createSuccessResponseFromRequest(): Object — detalle transversal CRUD
        Factory-->>FormUtils: editMaterialStock(): Promise[{ message }]
    else Error HTTP o de dominio
        Transport-->>HTTP: HTTP error { code, message }
        opt No se inicia renovación: status distinto de 401 o request._retry
            HTTP->>FileUtils: normalizeHttpError(err)
            FileUtils-->>HTTP: normalizeHttpError(): Object
        end
        HTTP-->>Request: error propagado
        Request-->>Factory: error propagado
        Factory-->>FormUtils: error propagado
    end
```
