<a id="cu-alm-02"></a>
# `CU-ALM-02` — Crear material

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
| `Request` | boundary | [`materialService.js`](../../../../../../src/public/js/services/warehouse/materialService.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `Transport` | control | [`materialApiRoute.js`](../../../../../../src/routes/api/warehouse/materialApiRoute.js) |
| `Modal` | boundary | [`materialModal.js`](../../../../../../src/public/js/pages/warehouse/materials/materialModal.js) |
| `FormUtils` | control | [`formUtils.js`](../../../../../../src/public/js/utils/formUtils.js) |
| `Form` | control | [`formUI.js`](../../../../../../src/public/js/ui/forms/formUI.js) |
| `MaterialAdapter` | control | [`materials.js`](../../../../../../src/public/js/application/warehouse/materials/materials.js) |
| `FileFormStateUI` | control | [`formStateUI.js`](../../../../../../src/public/js/ui/forms/formStateUI.js) |
| `FileFormErrorsUI` | control | [`formErrorsUI.js`](../../../../../../src/public/js/ui/forms/formErrorsUI.js) |
| `FileErrorHandler` | control | [`errorHandler.js`](../../../../../../src/public/js/api/errorHandler.js) |
| `FileResponseUtils` | control | [`responseUtils.js`](../../../../../../src/public/js/utils/responseUtils.js) |
| `FileApiMessages` | control | [`apiMessages.js`](../../../../../../src/public/js/constants/apiMessages.js) |
| `FileMaterialController` | control | [`materialController.js`](../../../../../../src/controllers/api/warehouse/materialController.js) |
| `FileUtils` | control | [`utils.js`](../../../../../../src/public/js/api/utils.js) |
| `FileValidators` | control | [`validators.js`](../../../../../../src/public/js/utils/validations/validators.js) |
| `FileFieldValidations` | control | [`fieldValidations.js`](../../../../../../src/public/js/utils/validations/fieldValidations.js) |
| `FileBaseValidations` | control | [`baseValidations.js`](../../../../../../src/public/js/utils/validations/baseValidations.js) |
| `FileSwalComponent` | control | [`swalComponent.js`](../../../../../../src/public/js/plugins/swal/swalComponent.js) |
| `FileModalUI` | control | [`modalUI.js`](../../../../../../src/public/js/ui/modalUI.js) |
| `FileTableOperations` | control | [`tableOperations.js`](../../../../../../src/public/js/plugins/datatable/core/base/tableOperations.js) |

### Configuración y construcción

El endpoint queda representado por su router. El controller asociado se desarrolla en la [secuencia backend `CU-ALM-02`](../../backend-code-sequences/catalogs/cu-alm-02.md#cu-alm-02): [`materialController.js`](../../../../../../src/controllers/api/warehouse/materialController.js).

La línea `Application` ejecuta la función generada en `createCrudApplication.js`. Su nombre público y la configuración de requests/contratos provienen de [`materials.js`](../../../../../../src/public/js/application/warehouse/materials/materials.js); exportar esa función no crea otra llamada durante cada petición.

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
        FileMaterialController["materialController.js"]
        Transport["materialApiRoute.js"]
    end
    subgraph Component1["Interfaz"]
        FileErrorHandler["errorHandler.js"]
        FileUtils["utils.js"]
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
    FileErrorHandler -->|import| FileApiMessages
    FileUtils -->|import| FileApiMessages
    View -->|import| FileValidators
    Modal -->|import| FileModalUI
    FormUtils -->|import| FileApiMessages
    FormUtils -->|import| FileTableOperations
    FormUtils -->|import| FileModalUI
    FileResponseUtils -->|import| FileApiMessages
    FileFieldValidations -->|import| FileBaseValidations
    FileValidators -->|import| FileBaseValidations
    FileValidators -->|import| FileFieldValidations
    Transport -->|import| FileMaterialController
```

## Construcción de funciones para esta operación

El configurador se ejecuta al evaluar su módulo. Después se invoca la función devuelta
por la fábrica, usando el nombre público mostrado en la secuencia.

| Nombre público | Archivo configurador (alias) | Archivo que construye el cuerpo (alias) |
| --- | --- | --- |
| `registerMaterial` | `MaterialAdapter` | `Application` · `createCrudApplication(...)` |

## Coordinación de la interfaz

Este nivel muestra apertura, normalización, validación y control de doble envío. Con
los datos válidos y `submitting` establecido, el listener continúa en `sendRequest`,
detallado en la figura siguiente. La rama inválida termina sin solicitar una mutación.

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant Form@{ "type": "control" } as formUI.js
    participant View@{ "type": "boundary" } as materialForm.js
    participant FormUtils@{ "type": "control" } as formUtils.js
    participant Modal@{ "type": "boundary" } as materialModal.js

    participant FileFormErrorsUI@{ "type": "control" } as formErrorsUI.js
    participant FileFormStateUI@{ "type": "control" } as formStateUI.js

    Initiator->>Browser: inicia CU-ALM-02 — Crear material
    Browser->>Modal: openMaterialModal({ mode: CREATE, creationContext, data, onSave })
    Modal->>FileFormStateUI: setFormSectionVisibility({ form, selector: '.stock-data-section',<br/>isVisible: false })
    Modal->>FileFormStateUI: setFormSectionVisibility({ form, isVisible: false,<br/>fieldNames: ['maxUnitCost'] })
    Browser->>Form: submit — listener registrado por useForm(...)
    Form->>View: normalizeData({ form, formData }) — callback configurado
    View-->>Form: normalizeData(): Object — datos normalizados
    Form->>View: getErrors({ form, formData }) — callback configurado
    alt creationContext es goodsReceipt
        View->>FormUtils: validateFields(goodsReceiptMaterialCreateValidation, formData)
        FormUtils-->>View: validateFields(): Object — errores por campo
    else Alta directa
        View->>FormUtils: validateFields(materialCreateValidation, formData)
        FormUtils-->>View: validateFields(): Object — errores por campo
    end
    View-->>Form: getErrors(): Object — errores por campo
    Form->>FileFormErrorsUI: normalizeFormErrors({ form, errors }) — callback por defecto
    Form->>FileFormErrorsUI: toggleErrorMessages(form, errors)
    Form->>FormUtils: hasValidationErrors(errors)
    FormUtils-->>Form: hasValidationErrors(): boolean
    alt validateFields() devuelve errores
        Form->>FileFormErrorsUI: scrollToFirstFormError(form)
    else Captura válida
        break Envío ya en curso
            Form-->>Browser: envío duplicado rechazado sin request
    end
        Note over Form: Marca dataset.submitting y deshabilita submit antes del callback
    end
```

## Envío y resultado de la interfaz

Continúa el submit que superó la validación del nivel anterior. El callback del formulario
invoca la aplicación; su request se amplía en la colaboración de transporte. Aquí se
conservan los archivos que actualizan la interfaz o propagan el error al listener.

```mermaid
sequenceDiagram
    autonumber
    participant Browser as Navegador
    participant Form@{ "type": "control" } as formUI.js
    participant View@{ "type": "boundary" } as materialForm.js
    participant FormUtils@{ "type": "control" } as formUtils.js
    participant Application@{ "type": "control" } as createCrudApplication.js

        alt creationContext es goodsReceipt
    participant FileErrorHandler@{ "type": "control" } as errorHandler.js

    participant FileSwalComponent@{ "type": "control" } as swalComponent.js

            Form->>View: sendRequest({ form, formData }) — callback configurado
            View->>FormUtils: handleSubmit({ form, formData, create, update })
            FormUtils->>View: create({ formData }) — callback definido en materialForm.js
            View->>Application: registerMaterial({ formData, creationContext: 'goodsReceipt' })
        else Alta directa
            Form->>View: sendRequest({ form, formData }) — callback configurado
            View->>FormUtils: handleSubmit({ form, formData, create, update })
            FormUtils->>View: create({ formData }) — callback definido en materialForm.js
            View->>Application: registerMaterial({ formData, creationContext: null })
    end
        activate Application
        alt HTTP 200
            Application-->>View: registerMaterial(): Promise[{ message: string, data: SupplierMaterial }]
            View-->>FormUtils: create(): Promise[{ message: string, data: SupplierMaterial }]
            FormUtils->>FileSwalComponent: notifications.showSuccess(response.message)
            Note over FormUtils: Cierre y recarga ampliados en los efectos transversales de handleSubmit
            FormUtils-->>View: handleSubmit(): Promise[Object] — entidad guardada, cierre y recarga
            View-->>Browser: onSave(supplierMaterial) y cierre del modal
        else HTTP 4xx/5xx
            Application-->>View: registerMaterial(): throw { status: number, data: Object | null, message: string, raw: Error }
            View-->>FormUtils: create(): throw { status: number, data: Object | null, message: string, raw: Error }
            FormUtils-->>View: error propagado por handleSubmit()
            View-->>Form: error propagado por sendRequest()
            Form->>FileErrorHandler: handleApiError({ err, form }) conserva los datos
    end
        deactivate Application
```

## Colaboración de aplicación y transporte

Amplía la llamada a `Application` del nivel anterior: cada request y el cliente HTTP tienen su propio archivo. El router identifica el endpoint de destino; su ejecución interna está en la secuencia backend del mismo CU. Los resultados regresan al caller de la primera figura.

```mermaid
sequenceDiagram
    autonumber
    participant FormUtils@{ "type": "control" } as formUtils.js
    participant Application@{ "type": "control" } as createCrudApplication.js
    participant MaterialAdapter@{ "type": "control" } as materials.js
    participant Request@{ "type": "boundary" } as materialService.js
    participant HTTP@{ "type": "boundary" } as axiosInstanceApi.js
    participant Transport@{ "type": "control" } as materialApiRoute.js
    participant View@{ "type": "boundary" } as materialForm.js

    alt creationContext es goodsReceipt

    participant FileUtils@{ "type": "control" } as utils.js

    participant FileResponseUtils@{ "type": "control" } as responseUtils.js

        FormUtils->>View: create({ formData }) — callback definido en materialForm.js

        View->>Application: registerMaterial({ formData, creationContext: 'goodsReceipt' })
    else Alta directa
        FormUtils->>View: create({ formData }) — callback definido en materialForm.js
        View->>Application: registerMaterial({ formData, creationContext: null })
    end
    activate Application
    Application->>MaterialAdapter: requests.register({ data: formData, creationContext })
    opt creationContext es goodsReceipt
        MaterialAdapter->>MaterialAdapter: buildGoodsReceiptMaterialData(data) omite maxUnitCost y newStock
    end
    MaterialAdapter->>Request: registerMaterialRequest({ data })
    Request->>HTTP: apiRequest({ method: 'post', url: MATERIALS_API_ROUTE, data })
    HTTP->>Transport: POST /api/warehouse/materials { data }
    alt HTTP 200
        Transport-->>HTTP: { material: supplierMaterial, code }
        HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
        Request-->>MaterialAdapter: registerMaterialRequest(): Promise[AxiosResponse]
        MaterialAdapter-->>Application: requests.register(): Promise[AxiosResponse]
        Application->>FileResponseUtils: createSuccessResponseFromRequest({ response, dataKey })
        FileResponseUtils-->>Application: createSuccessResponseFromRequest(): Object — detalle transversal CRUD
        Application-->>View: registerMaterial(): Promise[{ message: string, data: SupplierMaterial }]
        View-->>FormUtils: create(): Promise[{ message: string, data: SupplierMaterial }]
    else HTTP 4xx/5xx
        Transport-->>HTTP: { code, message, meta }
        opt No se inicia renovación: status distinto de 401 o request._retry
            HTTP->>FileUtils: normalizeHttpError(err)
            FileUtils-->>HTTP: normalizeHttpError(): Object — status, data, message, raw
        end
        HTTP-->>Request: apiRequest(): throw { status: number, data: Object | null, message: string, raw: Error }
        Request-->>Application: registerMaterialRequest(): throw { status: number, data: Object | null, message: string, raw: Error }
        Application-->>View: registerMaterial(): throw { status: number, data: Object | null, message: string, raw: Error }
        View-->>FormUtils: create(): throw { status: number, data: Object | null, message: string, raw: Error }
    end
    deactivate Application
```
