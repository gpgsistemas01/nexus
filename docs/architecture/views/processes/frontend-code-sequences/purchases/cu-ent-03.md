<a id="cu-ent-03"></a>
# `CU-ENT-03` — Editar compra de material

**Patrones:** `FE-P02`, `FE-P04`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `View` | boundary | [`goodsReceiptForm.js`](../../../../../../src/public/js/pages/warehouse/goodsReceipts/goodsReceiptForm.js) |
| `Application` | control | [`createCrudApplication.js`](../../../../../../src/public/js/application/createCrudApplication.js) |
| `Request` | boundary | [`createGoodsReceiptRequests.js`](../../../../../../src/public/js/services/warehouse/goodsReceipts/createGoodsReceiptRequests.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `Transport` | control | [`materialGoodsReceiptApiRoute.js`](../../../../../../src/routes/api/warehouse/goodsReceipts/materials/materialGoodsReceiptApiRoute.js) |
| `Form` | control | [`formUI.js`](../../../../../../src/public/js/ui/forms/formUI.js) |
| `FormUtils` | control | [`formUtils.js`](../../../../../../src/public/js/utils/formUtils.js) |

### Configuración y archivos de contexto

Estos módulos seleccionan/configuran y exportan la función de aplicación. Su cuerpo se ejecuta en la fábrica de la línea `Application`, sin una llamada intermedia entre reexports: [`goodsReceipts.js`](../../../../../../src/public/js/application/warehouse/goodsReceipts/goodsReceipts.js), [`materialGoodsReceipts.js`](../../../../../../src/public/js/application/warehouse/goodsReceipts/materials/materialGoodsReceipts.js).

Estos módulos configuran o reexportan el request. La función que llama a `apiRequest` está definida en el archivo de la línea `Request`: [`materialGoodsReceiptService.js`](../../../../../../src/public/js/services/warehouse/goodsReceipts/materials/materialGoodsReceiptService.js).

El endpoint queda representado por su router. El controller asociado se desarrolla en la [secuencia backend `CU-ENT-03`](../../backend-code-sequences/purchases/cu-ent-03.md#cu-ent-03): [`materialGoodsReceiptController.js`](../../../../../../src/controllers/api/warehouse/goodsReceipts/materials/materialGoodsReceiptController.js).

## Coordinación de la interfaz

Este nivel conserva entrada, callbacks y efectos de interfaz. La llamada a `Application` se amplía en la colaboración de transporte, con los mismos argumentos y resultado.

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant View@{ "type": "boundary" } as Callback formulario
    participant Application@{ "type": "control" } as Application
    participant Form@{ "type": "control" } as useForm
    participant FormUtils@{ "type": "control" } as Form helpers

    Note over Application: Closure configurada
    Initiator->>Browser: inicia CU-ENT-03 — Editar compra de material
    Browser->>Form: submit manejado por useForm(...)
    Form->>View: normalizeData({ form, formData }) — callback configurado
    activate View
    View-->>Form: normalizeData(): Object — datos normalizados
    deactivate View
    Form->>View: getErrors({ form, formData }) — callback configurado
    View->>FormUtils: validateFields(goodsReceiptEditValidation, formData)
    activate FormUtils
    FormUtils-->>View: validateFields(): Object — errores por campo
    deactivate FormUtils
    View-->>Form: getErrors(): Object
    alt Hay errores de validación
        Form->>Browser: normalizeFormErrors({ form, errors })
    else Datos válidos
        break Envío ya en curso
            Form-->>Browser: envío duplicado rechazado, sin otro request
    end
        Note over Form: dataset.submitting = 'true', botón submit deshabilitado
        Form->>View: sendRequest({ form, formData }) — callback configurado
        View->>FormUtils: handleSubmit({ form, formData, create, update: editGoodsReceiptHeader })
        FormUtils->>Application: editGoodsReceiptHeader({ id, formData })
        alt Respuesta exitosa
            Application-->>FormUtils: editGoodsReceiptHeader(): Promise[{ message }]
            FormUtils->>Browser: notifications.showSuccess(response.message)
            FormUtils->>Browser: closeModal(form)
            FormUtils->>Browser: reloadMainTable({ resetPaging: mode === CREATE })
        else Error HTTP o de dominio
            Application-->>FormUtils: error propagado
            Form->>Browser: handleApiError({ err, form }) conserva el formulario
    end
    end
```

## Colaboración de aplicación y transporte

Amplía la llamada a `Application` del nivel anterior: cada request y el cliente HTTP tienen su propio archivo. El router identifica el endpoint de destino; su ejecución interna está en la secuencia backend del mismo CU. Los resultados regresan al caller de la primera figura.

```mermaid
sequenceDiagram
    autonumber
    participant Application@{ "type": "control" } as Application
    participant Request@{ "type": "boundary" } as Requests del recurso
    participant HTTP@{ "type": "boundary" } as Cliente HTTP
    participant Transport@{ "type": "control" } as Endpoint API
    participant FormUtils@{ "type": "control" } as Form helpers

    Note over Application: Closure configurada
    Note over Request: Request configurado
    activate FormUtils
    deactivate FormUtils
        FormUtils->>Application: editGoodsReceiptHeader({ id, formData })
        Application->>Request: editMaterialGoodsReceiptHeaderRequest({ id, data: formData })
        Request->>HTTP: apiRequest({ method: 'patch', url, data })
        HTTP->>Transport: PATCH /api/warehouse/goods-receipts/materials/:id
        alt Respuesta exitosa
            Transport-->>HTTP: HTTP 200 { goodsReceipt, code }
            HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
            Request-->>Application: editMaterialGoodsReceiptHeaderRequest(): Promise[AxiosResponse]
            Application-->>FormUtils: editGoodsReceiptHeader(): Promise[{ message }]
        else Error HTTP o de dominio
            Transport-->>HTTP: HTTP de error { code, message }
            HTTP-->>Request: error normalizado
            Request-->>Application: error propagado
            Application-->>FormUtils: error propagado
    end
```
