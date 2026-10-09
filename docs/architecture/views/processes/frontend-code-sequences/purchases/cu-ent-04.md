<a id="cu-ent-04"></a>
# `CU-ENT-04` — Corregir material de una compra

**Patrones:** `FE-P02`, `FE-P04`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.
La composición incluye también los archivos de configuración, construcción y reexport: cada
uno tiene un nodo propio, aunque no ejecute una delegación durante la petición.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `View` | boundary | [`correctionForm.js`](../../../../../../src/public/js/pages/warehouse/goodsReceipts/corrections/correctionForm.js) |
| `Application` | control | [`createCrudApplication.js`](../../../../../../src/public/js/application/createCrudApplication.js) |
| `Request` | boundary | [`createGoodsReceiptRequests.js`](../../../../../../src/public/js/services/warehouse/goodsReceipts/createGoodsReceiptRequests.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `Transport` | control | [`materialGoodsReceiptApiRoute.js`](../../../../../../src/routes/api/warehouse/goodsReceipts/materials/materialGoodsReceiptApiRoute.js) |
| `Form` | control | [`formUI.js`](../../../../../../src/public/js/ui/forms/formUI.js) |
| `FormUtils` | control | [`formUtils.js`](../../../../../../src/public/js/utils/formUtils.js) |
| `Modal` | boundary | [`goodsReceiptModal.js`](../../../../../../src/public/js/pages/warehouse/goodsReceipts/goodsReceiptModal.js) |
| `FileFormErrorsUI` | control | [`formErrorsUI.js`](../../../../../../src/public/js/ui/forms/formErrorsUI.js) |
| `FileSwalComponent` | control | [`swalComponent.js`](../../../../../../src/public/js/plugins/swal/swalComponent.js) |
| `FileRenderMaterialDatatable` | control | [`renderMaterialDatatable.js`](../../../../../../src/public/js/plugins/datatable/shared/inventory/renderMaterialDatatable.js) |
| `FileTotalsSummaryUI` | control | [`totalsSummaryUI.js`](../../../../../../src/public/js/ui/forms/totalsSummaryUI.js) |
| `FileBaseInstance` | control | [`baseInstance.js`](../../../../../../src/public/js/plugins/mdb/baseInstance.js) |
| `FileTableOperations` | control | [`tableOperations.js`](../../../../../../src/public/js/plugins/datatable/core/base/tableOperations.js) |
| `FileErrorHandler` | control | [`errorHandler.js`](../../../../../../src/public/js/api/errorHandler.js) |
| `FileMaterialGoodsReceiptController` | control | [`materialGoodsReceiptController.js`](../../../../../../src/controllers/api/warehouse/goodsReceipts/materials/materialGoodsReceiptController.js) |
| `FileConsumableGoodsReceipts` | control | [`consumableGoodsReceipts.js`](../../../../../../src/public/js/application/warehouse/goodsReceipts/consumables/consumableGoodsReceipts.js) |
| `FileGoodsReceipts` | control | [`goodsReceipts.js`](../../../../../../src/public/js/application/warehouse/goodsReceipts/goodsReceipts.js) |
| `FileMaterialGoodsReceipts` | control | [`materialGoodsReceipts.js`](../../../../../../src/public/js/application/warehouse/goodsReceipts/materials/materialGoodsReceipts.js) |
| `FileConsumableGoodsReceiptService` | control | [`consumableGoodsReceiptService.js`](../../../../../../src/public/js/services/warehouse/goodsReceipts/consumables/consumableGoodsReceiptService.js) |
| `FileMaterialGoodsReceiptService` | control | [`materialGoodsReceiptService.js`](../../../../../../src/public/js/services/warehouse/goodsReceipts/materials/materialGoodsReceiptService.js) |
| `FileResponseUtils` | control | [`responseUtils.js`](../../../../../../src/public/js/utils/responseUtils.js) |
| `FileApiMessages` | control | [`apiMessages.js`](../../../../../../src/public/js/constants/apiMessages.js) |
| `FileUtils` | control | [`utils.js`](../../../../../../src/public/js/api/utils.js) |
| `FileValidators` | control | [`validators.js`](../../../../../../src/public/js/utils/validations/validators.js) |
| `FileFieldValidations` | control | [`fieldValidations.js`](../../../../../../src/public/js/utils/validations/fieldValidations.js) |
| `FileBaseValidations` | control | [`baseValidations.js`](../../../../../../src/public/js/utils/validations/baseValidations.js) |
| `FileGoodsReceiptContext` | control | [`goodsReceiptContext.js`](../../../../../../src/public/js/pages/warehouse/goodsReceipts/goodsReceiptContext.js) |

### Configuración y construcción

Estos módulos seleccionan/configuran y exportan la función de aplicación. Su cuerpo se ejecuta en la fábrica de la línea `Application`, sin una llamada intermedia entre reexports: [`goodsReceipts.js`](../../../../../../src/public/js/application/warehouse/goodsReceipts/goodsReceipts.js), [`materialGoodsReceipts.js`](../../../../../../src/public/js/application/warehouse/goodsReceipts/materials/materialGoodsReceipts.js).

Estos módulos configuran o reexportan el request. La función que llama a `apiRequest` está definida en el archivo de la línea `Request`: [`materialGoodsReceiptService.js`](../../../../../../src/public/js/services/warehouse/goodsReceipts/materials/materialGoodsReceiptService.js).

El endpoint queda representado por su router. El controller asociado se desarrolla en la [secuencia backend `CU-ENT-04`](../../backend-code-sequences/purchases/cu-ent-04.md#cu-ent-04): [`materialGoodsReceiptController.js`](../../../../../../src/controllers/api/warehouse/goodsReceipts/materials/materialGoodsReceiptController.js).

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
        FileMaterialGoodsReceiptController["materialGoodsReceiptController.js"]
        Transport["materialGoodsReceiptApiRoute.js"]
    end
    subgraph Component1["Interfaz"]
        FileErrorHandler["errorHandler.js"]
        FileUtils["utils.js"]
        FileApiMessages["apiMessages.js"]
        View["correctionForm.js"]
        FileGoodsReceiptContext["goodsReceiptContext.js"]
        Modal["goodsReceiptModal.js"]
        FormUtils["formUtils.js"]
        FileResponseUtils["responseUtils.js"]
        FileBaseValidations["baseValidations.js"]
        FileFieldValidations["fieldValidations.js"]
        FileValidators["validators.js"]
    end
    subgraph Component2["Aplicación y requests"]
        Application["createCrudApplication.js"]
        FileConsumableGoodsReceipts["consumableGoodsReceipts.js"]
        FileGoodsReceipts["goodsReceipts.js"]
        FileMaterialGoodsReceipts["materialGoodsReceipts.js"]
        FileConsumableGoodsReceiptService["consumableGoodsReceiptService.js"]
        Request["createGoodsReceiptRequests.js"]
        FileMaterialGoodsReceiptService["materialGoodsReceiptService.js"]
    end
    FileErrorHandler -->|import| FileApiMessages
    FileUtils -->|import| FileApiMessages
    FileConsumableGoodsReceipts -->|import| FileConsumableGoodsReceiptService
    FileConsumableGoodsReceipts -->|import| Application
    FileGoodsReceipts -->|import| FileMaterialGoodsReceipts
    FileGoodsReceipts -->|import| FileConsumableGoodsReceipts
    FileGoodsReceipts -->|import| FileGoodsReceiptContext
    FileMaterialGoodsReceipts -->|import| FileMaterialGoodsReceiptService
    FileMaterialGoodsReceipts -->|import| Application
    View -->|import| FileGoodsReceipts
    View -->|import| FileValidators
    Modal -->|import| FileGoodsReceipts
    FileConsumableGoodsReceiptService -->|import| Request
    FileMaterialGoodsReceiptService -->|import| Request
    FormUtils -->|import| FileApiMessages
    FileResponseUtils -->|import| FileApiMessages
    FileFieldValidations -->|import| FileBaseValidations
    FileValidators -->|import| FileBaseValidations
    FileValidators -->|import| FileFieldValidations
    Transport -->|import| FileMaterialGoodsReceiptController
```

## Construcción de funciones para esta operación

El configurador se ejecuta al evaluar su módulo. Después se invoca la función devuelta
por la fábrica, usando el nombre público mostrado en la secuencia.

| Nombre público | Archivo configurador (alias) | Archivo que construye el cuerpo (alias) |
| --- | --- | --- |
| `correctMaterialGoodsReceiptDetailRequest` | `FileMaterialGoodsReceiptService` | `Request` · `createGoodsReceiptRequests(...)` |

## Coordinación de la interfaz

Este nivel conserva entrada, callbacks y efectos de interfaz. La llamada a `Application` se amplía en la colaboración de transporte, con los mismos argumentos y resultado.

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant View@{ "type": "boundary" } as correctionForm.js
    participant Modal@{ "type": "boundary" } as goodsReceiptModal.js
    participant Application@{ "type": "control" } as createCrudApplication.js
    participant Form@{ "type": "control" } as formUI.js
    participant FormUtils@{ "type": "control" } as formUtils.js

    participant FileBaseInstance@{ "type": "control" } as baseInstance.js
    participant FileErrorHandler@{ "type": "control" } as errorHandler.js
    participant FileFormErrorsUI@{ "type": "control" } as formErrorsUI.js
    participant FileRenderMaterialDatatable@{ "type": "control" } as renderMaterialDatatable.js
    participant FileSwalComponent@{ "type": "control" } as swalComponent.js
    participant FileTableOperations@{ "type": "control" } as tableOperations.js
    participant FileTotalsSummaryUI@{ "type": "control" } as totalsSummaryUI.js

    Note over Application: Closure configurada
    Initiator->>Browser: inicia CU-ENT-04 — Corregir material de una compra
    Browser->>Form: submit manejado por useForm(...)
    Form->>View: normalizeData({ form, formData }) — callback configurado
    activate View
    View-->>Form: normalizeData(): Object — datos normalizados
    deactivate View
    Form->>View: getErrors({ form, formData }) — callback configurado
    View->>FormUtils: validateFields(goodsReceiptCorrectionValidation, formData)
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
        View->>FileSwalComponent: notifications.showConfirmation(...) sólo si quantity o costPerUnitType cambiaron
        opt Corrección confirmada
            View->>Application: correctGoodsReceiptDetail({ id, detailId, formData })
            alt Respuesta exitosa
                Application-->>View: correctGoodsReceiptDetail(): Promise[{ message, data: correction }]
                View->>FileSwalComponent: notifications.showSuccess(response.message)
                View->>Browser: dispatchEvent(new CustomEvent('goods-receipt-correction:applied', { bubbles: true, detail: response.data }))
                Browser-)Modal: evento goods-receipt-correction:applied — handler registrado con on(...)
                Modal->>FileRenderMaterialDatatable: refreshMaterialTable(details) — o consulta si la compra quedó cancelada
                Modal->>FileTotalsSummaryUI: setTotals({ quantity, net, gross })
                View->>FileBaseInstance: initMdbModal(getModal()).hide()
                View->>FileTableOperations: reloadMainTable()
            else Error HTTP o de dominio
                Application-->>View: error propagado
                Form->>FileErrorHandler: handleApiError({ err, form }) conserva el formulario
    end
    end
    end
```

## Colaboración de aplicación y transporte

Amplía la llamada a `Application` del nivel anterior: cada request y el cliente HTTP tienen su propio archivo. El router identifica el endpoint de destino; su ejecución interna está en la secuencia backend del mismo CU. Los resultados regresan al caller de la primera figura.

```mermaid
sequenceDiagram
    autonumber
    participant View@{ "type": "boundary" } as correctionForm.js
    participant Application@{ "type": "control" } as createCrudApplication.js
    participant Request@{ "type": "boundary" } as createGoodsReceiptRequests.js
    participant HTTP@{ "type": "boundary" } as axiosInstanceApi.js
    participant Transport@{ "type": "control" } as materialGoodsReceiptApiRoute.js

    participant FileUtils@{ "type": "control" } as utils.js

    participant FileResponseUtils@{ "type": "control" } as responseUtils.js

    Note over Application: Closure configurada
    Note over Request: Request configurado
    activate View
    deactivate View
        opt Corrección confirmada
            View->>Application: correctGoodsReceiptDetail({ id, detailId, formData })
            Application->>Request: correctMaterialGoodsReceiptDetailRequest({ id, detailId, data: formData })
            Request->>HTTP: apiRequest({ method: 'patch', url, data })
            HTTP->>Transport: PATCH /api/warehouse/goods-receipts/materials/:id/details/:detailId/corrections
            alt Respuesta exitosa
                Transport-->>HTTP: HTTP 200 { correction, code }
                HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
                Request-->>Application: correctMaterialGoodsReceiptDetailRequest(): Promise[AxiosResponse]
                Application->>FileResponseUtils: createSuccessResponseFromRequest({ response, dataKey })
                FileResponseUtils-->>Application: createSuccessResponseFromRequest(): Object — detalle transversal CRUD
                Application-->>View: correctGoodsReceiptDetail(): Promise[{ message, data: correction }]
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
    end
```
