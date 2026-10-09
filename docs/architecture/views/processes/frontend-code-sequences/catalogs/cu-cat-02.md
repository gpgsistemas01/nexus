<a id="cu-cat-02"></a>
# `CU-CAT-02` — Crear proveedor

**Patrones:** `FE-P02`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.

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

### Configuración y archivos de contexto

Las pantallas y modales operativos preparan la interacción. El botón independiente se implementa en el adaptador de tabla, mientras que el alta desde el documento se inicia en `Select`: [`suppliersPage.js`](../../../../../../src/public/js/pages/warehouse/suppliers/suppliersPage.js), [`goodsReceiptModal.js`](../../../../../../src/public/js/pages/warehouse/goodsReceipts/goodsReceiptModal.js).

El endpoint queda representado por su router. El controller asociado se desarrolla en la [secuencia backend `CU-CAT-02`](../../backend-code-sequences/catalogs/cu-cat-02.md#cu-cat-02): [`supplierController.js`](../../../../../../src/controllers/api/warehouse/supplierController.js).

La línea `Application` ejecuta la función generada en `createCrudApplication.js`. Su nombre público y la configuración de requests/contratos provienen de [`suppliers.js`](../../../../../../src/public/js/application/warehouse/suppliers/suppliers.js); exportar esa función no crea otra llamada durante cada petición.

## Preparación de la interfaz

Este nivel muestra las dos entradas posibles y el archivo que abre el modal. El submit posterior ejecuta los callbacks del formulario del siguiente nivel.

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant Origin@{ "type": "boundary" } as Documento origen
    participant Select@{ "type": "boundary" } as Select2
    participant Modal@{ "type": "boundary" } as Inicialización modal

    participant SelectBase@{ "type": "control" } as Select2 base

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
    participant Form@{ "type": "control" } as useForm
    participant View@{ "type": "boundary" } as Callback formulario
    participant FormUtils@{ "type": "control" } as Form helpers

    Browser->>Form: submit — listener registrado por useForm(...)
    Form->>View: normalizeData({ form, formData }) — callback configurado
    View-->>Form: normalizeData(): Object — datos normalizados
    Form->>View: getErrors({ form, formData }) — callback configurado
    View->>FormUtils: validateFields(supplierValidation, formData)
    FormUtils-->>View: validateFields(): Object — errores por campo
    View-->>Form: getErrors(): Object — errores por campo
    alt Formulario inválido
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
    participant Select@{ "type": "boundary" } as Select2
    participant Form@{ "type": "control" } as useForm
    participant View@{ "type": "boundary" } as Callback formulario
    participant FormUtils@{ "type": "control" } as Form helpers
    participant Application@{ "type": "control" } as Application

        Form->>View: sendRequest({ form, formData }) — callback configurado
        View->>FormUtils: handleSubmit({ form, formData, create, update })
        FormUtils->>Application: registerSupplier({ formData })
        alt Alta resuelta
            Application-->>FormUtils: registerSupplier(): Promise[{ message: string, data: Supplier }]
            FormUtils->>Browser: notifications.showSuccess(response.message)
            FormUtils->>Browser: closeModal(form)
            FormUtils->>Browser: reloadMainTable({ resetPaging: true })
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
            Form->>Browser: handleApiError({ err, form }) conserva los datos
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

    FormUtils->>Application: registerSupplier({ formData })
    Application->>Request: registerSupplierRequest({ data: formData })
    Request->>HTTP: apiRequest({ method: 'post',<br/>url: SUPPLIERS_API_ROUTE, data: formData })
    HTTP->>Transport: POST /api/warehouse/suppliers
    alt Alta resuelta
        Transport-->>HTTP: HTTP 200 { code, data: { supplier } }
        HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
        Request-->>Application: registerSupplierRequest(): Promise[AxiosResponse]
        Application-->>FormUtils: registerSupplier(): Promise[{ message: string, data: Supplier }]
    else Alta rechazada
        Transport-->>HTTP: HTTP error { code, message, meta }
        HTTP-->>Request: apiRequest(): throw { status: number, data: Object | null, message: string, raw: Error }
        Request-->>Application: registerSupplierRequest(): throw { status: number, data: Object | null, message: string, raw: Error }
        Application-->>FormUtils: registerSupplier(): throw { status: number, data: Object | null, message: string, raw: Error }
    end
```
