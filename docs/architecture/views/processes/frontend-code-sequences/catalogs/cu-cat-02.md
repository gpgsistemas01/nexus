<a id="cu-cat-02"></a>
# `CU-CAT-02` — Crear proveedor

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
| `Origin` | boundary | [`supplierDatatable.js`](../../../../../../src/public/js/plugins/datatable/warehouse/suppliers/supplierDatatable.js) |
| `Select` | boundary | [`supplier.js`](../../../../../../src/public/js/plugins/select2/domains/supplier.js) |
| `View` | boundary | [`supplierForm.js`](../../../../../../src/public/js/pages/warehouse/suppliers/supplierForm.js) |
| `Application` | control | [`createCrudApplication.js`](../../../../../../src/public/js/application/createCrudApplication.js) |
| `Request` | boundary | [`supplierService.js`](../../../../../../src/public/js/services/warehouse/supplierService.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `Transport` | control | [`supplierApiRoute.js`](../../../../../../src/routes/api/warehouse/supplierApiRoute.js) |
| `Modal` | boundary | [`supplierModal.js`](../../../../../../src/public/js/pages/warehouse/suppliers/supplierModal.js) |
| `FormUtils` | control | [`formUtils.js`](../../../../../../src/public/js/utils/formUtils.js) |
| `Form` | control | [`formUI.js`](../../../../../../src/public/js/ui/forms/formUI.js) |
| `SelectBase` | control | [`baseSelect.js`](../../../../../../src/public/js/plugins/select2/baseSelect.js) |
| `FileFormErrorsUI` | control | [`formErrorsUI.js`](../../../../../../src/public/js/ui/forms/formErrorsUI.js) |
| `FileSwalComponent` | control | [`swalComponent.js`](../../../../../../src/public/js/plugins/swal/swalComponent.js) |
| `FileModalUI` | control | [`modalUI.js`](../../../../../../src/public/js/ui/modalUI.js) |
| `FileTableOperations` | control | [`tableOperations.js`](../../../../../../src/public/js/plugins/datatable/core/base/tableOperations.js) |
| `FileErrorHandler` | control | [`errorHandler.js`](../../../../../../src/public/js/api/errorHandler.js) |
| `FileResponseUtils` | control | [`responseUtils.js`](../../../../../../src/public/js/utils/responseUtils.js) |
| `FileApiMessages` | control | [`apiMessages.js`](../../../../../../src/public/js/constants/apiMessages.js) |
| `FileSupplierController` | control | [`supplierController.js`](../../../../../../src/controllers/api/warehouse/supplierController.js) |
| `FileSuppliers` | control | [`suppliers.js`](../../../../../../src/public/js/application/warehouse/suppliers/suppliers.js) |
| `FileGoodsReceiptModal` | control | [`goodsReceiptModal.js`](../../../../../../src/public/js/pages/warehouse/goodsReceipts/goodsReceiptModal.js) |
| `FileSuppliersPage` | control | [`suppliersPage.js`](../../../../../../src/public/js/pages/warehouse/suppliers/suppliersPage.js) |
| `FileUtils` | control | [`utils.js`](../../../../../../src/public/js/api/utils.js) |
| `FileValidators` | control | [`validators.js`](../../../../../../src/public/js/utils/validations/validators.js) |
| `FileFieldValidations` | control | [`fieldValidations.js`](../../../../../../src/public/js/utils/validations/fieldValidations.js) |
| `FileBaseValidations` | control | [`baseValidations.js`](../../../../../../src/public/js/utils/validations/baseValidations.js) |

### Configuración y construcción

Las pantallas y modales operativos preparan la interacción. El botón independiente se implementa en el adaptador de tabla, mientras que el alta desde el documento se inicia en `Select`: [`suppliersPage.js`](../../../../../../src/public/js/pages/warehouse/suppliers/suppliersPage.js), [`goodsReceiptModal.js`](../../../../../../src/public/js/pages/warehouse/goodsReceipts/goodsReceiptModal.js).

El endpoint queda representado por su router. El controller asociado se desarrolla en la [secuencia backend `CU-CAT-02`](../../backend-code-sequences/catalogs/cu-cat-02.md#cu-cat-02): [`supplierController.js`](../../../../../../src/controllers/api/warehouse/supplierController.js).

La línea `Application` ejecuta la función generada en `createCrudApplication.js`. Su nombre público y la configuración de requests/contratos provienen de [`suppliers.js`](../../../../../../src/public/js/application/warehouse/suppliers/suppliers.js); exportar esa función no crea otra llamada durante cada petición.

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
        FileSupplierController["supplierController.js"]
        Transport["supplierApiRoute.js"]
    end
    subgraph Component1["Interfaz"]
        FileErrorHandler["errorHandler.js"]
        FileUtils["utils.js"]
        FileApiMessages["apiMessages.js"]
        FileGoodsReceiptModal["goodsReceiptModal.js"]
        View["supplierForm.js"]
        Modal["supplierModal.js"]
        FileSuppliersPage["suppliersPage.js"]
        FileTableOperations["tableOperations.js"]
        Origin["supplierDatatable.js"]
        Select["supplier.js"]
        FileSwalComponent["swalComponent.js"]
        FileModalUI["modalUI.js"]
        FormUtils["formUtils.js"]
        FileResponseUtils["responseUtils.js"]
        FileBaseValidations["baseValidations.js"]
        FileFieldValidations["fieldValidations.js"]
        FileValidators["validators.js"]
    end
    subgraph Component2["Aplicación y requests"]
        Application["createCrudApplication.js"]
        FileSuppliers["suppliers.js"]
        Request["supplierService.js"]
    end
    FileErrorHandler -->|import| FileApiMessages
    FileUtils -->|import| FileApiMessages
    FileSuppliers -->|import| Request
    FileSuppliers -->|import| Application
    FileGoodsReceiptModal -->|import| FileErrorHandler
    FileGoodsReceiptModal -->|import| FormUtils
    FileGoodsReceiptModal -->|import| FileModalUI
    FileGoodsReceiptModal -->|import| FileSwalComponent
    View -->|import| FileSuppliers
    View -->|import| FileValidators
    Modal -->|import| FileModalUI
    FileSuppliersPage -->|import| Origin
    FileSuppliersPage -->|import| View
    Origin -->|import| FileSuppliers
    Select -->|import| FileSuppliers
    FormUtils -->|import| FileApiMessages
    FormUtils -->|import| FileTableOperations
    FormUtils -->|import| FileModalUI
    FileResponseUtils -->|import| FileApiMessages
    FileFieldValidations -->|import| FileBaseValidations
    FileValidators -->|import| FileBaseValidations
    FileValidators -->|import| FileFieldValidations
    Transport -->|import| FileSupplierController
```

## Construcción de funciones para esta operación

El configurador se ejecuta al evaluar su módulo. Después se invoca la función devuelta
por la fábrica, usando el nombre público mostrado en la secuencia.

| Nombre público | Archivo configurador (alias) | Archivo que construye el cuerpo (alias) |
| --- | --- | --- |
| `registerSupplier` | `FileSuppliers` | `Application` · `createCrudApplication(...)` |

## Preparación de la interfaz

Este nivel muestra las dos entradas posibles y el archivo que abre el modal. El submit posterior ejecuta los callbacks del formulario del siguiente nivel.

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant Origin@{ "type": "boundary" } as supplierDatatable.js
    participant Select@{ "type": "boundary" } as supplier.js
    participant Modal@{ "type": "boundary" } as supplierModal.js

    participant SelectBase@{ "type": "control" } as baseSelect.js

    Initiator->>Browser: inicia CU-CAT-02 — Crear proveedor
    alt Sistemas inicia desde el listado independiente
        Browser->>Origin: seleccionar Nuevo proveedor
        Origin->>Modal: openSupplierModal({ mode: create })
    else Almacén inicia desde una compra autorizada
        Browser->>Select: escribir proveedor inexistente y seleccionar Nuevo proveedor
        Select->>SelectBase: runAfterSelect2Close({ selector: supplierSelector, action })
        SelectBase-->>Select: runAfterSelect2Close(): void
        SelectBase-)Select: action() — callback definido en supplier.js
        Select->>Modal: openSupplierModal({ data: { tradeName }, onSave })
    end
```

## Coordinación de la interfaz

Este nivel muestra apertura, normalización, validación y control de doble envío. Con
los datos válidos y `submitting` establecido, el listener continúa en `sendRequest`,
detallado en la figura siguiente. La rama inválida termina sin solicitar una mutación.

```mermaid
sequenceDiagram
    autonumber
    participant Browser as Navegador
    participant Form@{ "type": "control" } as formUI.js
    participant View@{ "type": "boundary" } as supplierForm.js
    participant FormUtils@{ "type": "control" } as formUtils.js

    participant FileFormErrorsUI@{ "type": "control" } as formErrorsUI.js

    Browser->>Form: submit — listener registrado por useForm(...)
    Form->>View: normalizeData({ form, formData }) — callback configurado
    View-->>Form: normalizeData(): Object — datos normalizados
    Form->>View: getErrors({ form, formData }) — callback configurado
    View->>FormUtils: validateFields(supplierValidation, formData)
    FormUtils-->>View: validateFields(): Object — errores por campo
    View-->>Form: getErrors(): Object — errores por campo
    Form->>FileFormErrorsUI: normalizeFormErrors({ form, errors }) — callback por defecto
    Form->>FileFormErrorsUI: toggleErrorMessages(form, errors)
    Form->>FormUtils: hasValidationErrors(errors)
    FormUtils-->>Form: hasValidationErrors(): boolean
    alt Formulario inválido
        Form->>FileFormErrorsUI: scrollToFirstFormError(form)
        Form-->>Browser: conservar datos y mostrar errores por campo
    else Formulario válido
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
    participant Select@{ "type": "boundary" } as supplier.js
    participant Form@{ "type": "control" } as formUI.js
    participant View@{ "type": "boundary" } as supplierForm.js
    participant FormUtils@{ "type": "control" } as formUtils.js
    participant Application@{ "type": "control" } as createCrudApplication.js

    participant FileErrorHandler@{ "type": "control" } as errorHandler.js

    participant FileSwalComponent@{ "type": "control" } as swalComponent.js

        Form->>View: sendRequest({ form, formData }) — callback configurado
        View->>FormUtils: handleSubmit({ form, formData, create, update })
        FormUtils->>Application: registerSupplier({ formData })
        alt Alta resuelta
            Application-->>FormUtils: registerSupplier(): Promise[{ message: string, data: Supplier }]
            FormUtils->>FileSwalComponent: notifications.showSuccess(response.message)
            Note over FormUtils: Cierre y recarga ampliados en los efectos transversales de handleSubmit
            FormUtils-->>View: handleSubmit(): Promise[Object] — entidad creada
            opt form.onSave definido por el selector operativo
                View->>Select: form.onSave(supplier)
                Select->>Select: toggleSupplierOption({ selector: supplierSelector,<br/>id: supplier.id, name: supplier.tradeName })
                Select-->>Browser: continuar en la compra sin abrir /proveedores
    end
        else Alta rechazada
            Application-->>FormUtils: registerSupplier(): throw { status: number, data: Object | null, message: string, raw: Error }
            FormUtils-->>View: error propagado por handleSubmit()
            View-->>Form: error propagado por sendRequest()
            Form->>FileErrorHandler: handleApiError({ err, form }) conserva los datos
    end
```

## Colaboración de aplicación y transporte

Amplía la llamada a `Application` del nivel anterior: cada request y el cliente HTTP tienen su propio archivo. El router identifica el endpoint de destino; su ejecución interna está en la secuencia backend del mismo CU. Los resultados regresan al caller de la primera figura.

```mermaid
sequenceDiagram
    autonumber
    participant FormUtils@{ "type": "control" } as formUtils.js
    participant Application@{ "type": "control" } as createCrudApplication.js
    participant Request@{ "type": "boundary" } as supplierService.js
    participant HTTP@{ "type": "boundary" } as axiosInstanceApi.js
    participant Transport@{ "type": "control" } as supplierApiRoute.js

    participant FileUtils@{ "type": "control" } as utils.js

    participant FileResponseUtils@{ "type": "control" } as responseUtils.js

    FormUtils->>Application: registerSupplier({ formData })
    Application->>Request: registerSupplierRequest({ data: formData })
    Request->>HTTP: apiRequest({ method: 'post',<br/>url: SUPPLIERS_API_ROUTE, data: formData })
    HTTP->>Transport: POST /api/warehouse/suppliers
    alt Alta resuelta
        Transport-->>HTTP: HTTP 200 { code, data: { supplier } }
        HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
        Request-->>Application: registerSupplierRequest(): Promise[AxiosResponse]
        Application->>FileResponseUtils: createSuccessResponseFromRequest({ response, dataKey })
        FileResponseUtils-->>Application: createSuccessResponseFromRequest(): Object — detalle transversal CRUD
        Application-->>FormUtils: registerSupplier(): Promise[{ message: string, data: Supplier }]
    else Alta rechazada
        Transport-->>HTTP: HTTP error { code, message, meta }
        opt No se inicia renovación: status distinto de 401 o request._retry
            HTTP->>FileUtils: normalizeHttpError(err)
            FileUtils-->>HTTP: normalizeHttpError(): Object — status, data, message, raw
        end
        HTTP-->>Request: apiRequest(): throw { status: number, data: Object | null, message: string, raw: Error }
        Request-->>Application: registerSupplierRequest(): throw { status: number, data: Object | null, message: string, raw: Error }
        Application-->>FormUtils: registerSupplier(): throw { status: number, data: Object | null, message: string, raw: Error }
    end
```
