<a id="cu-alm-02"></a>
# `CU-ALM-02` — Crear material

**Patrones:** `FE-P02`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.

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

### Configuración y archivos de contexto

El endpoint queda representado por su router. El controller asociado se desarrolla en la [secuencia backend `CU-ALM-02`](../../backend-code-sequences/catalogs/cu-alm-02.md#cu-alm-02): [`materialController.js`](../../../../../../src/controllers/api/warehouse/materialController.js).

La línea `Application` ejecuta la función generada en `createCrudApplication.js`. Su nombre público y la configuración de requests/contratos provienen de [`materials.js`](../../../../../../src/public/js/application/warehouse/materials/materials.js); exportar esa función no crea otra llamada durante cada petición.

## Coordinación de la interfaz

Este nivel muestra apertura, normalización, validación y control de doble envío. Con
los datos válidos y `submitting` establecido, el listener continúa en `sendRequest`,
detallado en la figura siguiente. La rama inválida termina sin solicitar una mutación.

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant Form@{ "type": "control" } as useForm
    participant View@{ "type": "boundary" } as Callback formulario
    participant FormUtils@{ "type": "control" } as Form helpers
    participant Modal@{ "type": "boundary" } as Inicialización modal

    Initiator->>Browser: inicia CU-ALM-02 — Crear material
    Browser->>Modal: openMaterialModal({ mode: CREATE, creationContext, data, onSave })
    Modal->>Browser: setFormSectionVisibility({ form, selector: '.stock-data-section',<br/>isVisible: false })
    Modal->>Browser: setFormSectionVisibility({ form, isVisible: false,<br/>fieldNames: ['maxUnitCost'] })
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
    alt validateFields() devuelve errores
        Form->>Browser: normalizeFormErrors({ form, errors }) conserva formulario y señala campos
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
    participant Form@{ "type": "control" } as useForm
    participant View@{ "type": "boundary" } as Callback formulario
    participant FormUtils@{ "type": "control" } as Form helpers
    participant Application@{ "type": "control" } as Application

        alt creationContext es goodsReceipt
            Form->>View: sendRequest({ form, formData }) — callback configurado
            View->>FormUtils: handleSubmit({ form, formData, create, update })
            FormUtils->>Application: registerMaterial({ formData, creationContext: 'goodsReceipt' })
        else Alta directa
            Form->>View: sendRequest({ form, formData }) — callback configurado
            View->>FormUtils: handleSubmit({ form, formData, create, update })
            FormUtils->>Application: registerMaterial({ formData, creationContext: null })
    end
        activate Application
        alt HTTP 200
            Application-->>FormUtils: registerMaterial(): Promise[{ message: string, data: SupplierMaterial }]
            FormUtils-->>View: handleSubmit(): Promise[Object] — entidad guardada, cierre y recarga
            View-->>Browser: onSave(supplierMaterial) y cierre del modal
        else HTTP 4xx/5xx
            Application-->>FormUtils: registerMaterial(): throw { status: number, data: Object | null, message: string, raw: Error }
            FormUtils-->>View: error propagado por handleSubmit()
            View-->>Form: error propagado por sendRequest()
            Form->>Browser: handleApiError({ err, form }) conserva los datos
    end
        deactivate Application
```

## Colaboración de aplicación y transporte

Amplía la llamada a `Application` del nivel anterior: cada request y el cliente HTTP tienen su propio archivo. El router identifica el endpoint de destino; su ejecución interna está en la secuencia backend del mismo CU. Los resultados regresan al caller de la primera figura.

```mermaid
sequenceDiagram
    autonumber
    participant FormUtils@{ "type": "control" } as Form helpers
    participant Application@{ "type": "control" } as Application
    participant MaterialAdapter@{ "type": "control" } as Adaptador material
    participant Request@{ "type": "boundary" } as Requests del recurso
    participant HTTP@{ "type": "boundary" } as Cliente HTTP
    participant Transport@{ "type": "control" } as Endpoint API

    alt creationContext es goodsReceipt
        FormUtils->>Application: registerMaterial({ formData, creationContext: 'goodsReceipt' })
    else Alta directa
        FormUtils->>Application: registerMaterial({ formData, creationContext: null })
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
        Application-->>FormUtils: registerMaterial(): Promise[{ message: string, data: SupplierMaterial }]
    else HTTP 4xx/5xx
        Transport-->>HTTP: { code, message, meta }
        HTTP-->>Request: apiRequest(): throw { status: number, data: Object | null, message: string, raw: Error }
        Request-->>Application: registerMaterialRequest(): throw { status: number, data: Object | null, message: string, raw: Error }
        Application-->>FormUtils: registerMaterial(): throw { status: number, data: Object | null, message: string, raw: Error }
    end
    deactivate Application
```
