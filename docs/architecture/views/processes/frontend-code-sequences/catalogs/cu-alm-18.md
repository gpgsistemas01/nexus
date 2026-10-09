<a id="cu-alm-18"></a>
# `CU-ALM-18` — Crear consumible

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
| `Request` | boundary | [`consumableService.js`](../../../../../../src/public/js/services/warehouse/consumableService.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `Transport` | control | [`consumableApiRoute.js`](../../../../../../src/routes/api/warehouse/consumableApiRoute.js) |
| `Modal` | boundary | [`materialModal.js`](../../../../../../src/public/js/pages/warehouse/materials/materialModal.js) |
| `FormUtils` | control | [`formUtils.js`](../../../../../../src/public/js/utils/formUtils.js) |
| `Form` | control | [`formUI.js`](../../../../../../src/public/js/ui/forms/formUI.js) |

### Configuración y archivos de contexto

El endpoint queda representado por su router. El controller asociado se desarrolla en la [secuencia backend `CU-ALM-18`](../../backend-code-sequences/catalogs/cu-alm-18.md#cu-alm-18): [`consumableController.js`](../../../../../../src/controllers/api/warehouse/consumableController.js).

La línea `Application` ejecuta la función generada en `createCrudApplication.js`. Su nombre público y la configuración de requests/contratos provienen de [`consumables.js`](../../../../../../src/public/js/application/warehouse/consumables/consumables.js); exportar esa función no crea otra llamada durante cada petición.

## Coordinación de la interfaz

Este nivel conserva entrada, callbacks y efectos de interfaz. La llamada a `Application` se amplía en la colaboración de transporte, con los mismos argumentos y resultado.

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Personal de almacén
    participant Browser as Navegador
    participant Form@{ "type": "control" } as useForm
    participant View@{ "type": "boundary" } as Callback formulario
    participant FormUtils@{ "type": "control" } as Form helpers
    participant Modal@{ "type": "boundary" } as Inicialización modal
    participant Application@{ "type": "control" } as Application

    Initiator->>Browser: inicia CU-ALM-18 — Crear consumible
    Browser->>Modal: openMaterialModal({ mode: CREATE, resource: CONSUMABLE })
    Modal->>Browser: setFormSectionVisibility({ form, fieldNames: ['base', 'height'], isVisible: false })
    Browser->>Form: submit — listener registrado por useForm(...)
    Form->>View: normalizeData({ form, formData }) — callback configurado
    View-->>Form: normalizeData(): Object — datos normalizados
    Form->>View: getErrors({ form, formData }) — callback configurado
    View->>FormUtils: validateFields(materialCreateValidation, formData)
    FormUtils-->>View: validateFields(): Object — errores por campo
    View-->>Form: getErrors(): Object — errores por campo
    alt [datos inválidos]
        Form-->>Browser: useForm.getErrors() conserva datos y muestra errores
    else [datos válidos]
        break Envío ya en curso
            Form-->>Browser: envío duplicado rechazado sin request
        end
        Note over Form: Marca dataset.submitting y deshabilita submit antes del callback
        Form->>View: sendRequest({ form, formData }) — callback configurado
        View->>FormUtils: handleSubmit({ form, formData, create, update })
        FormUtils->>Application: registerConsumable({ formData, creationContext: null })
        activate Application
        alt [HTTP 200]
            Application-->>FormUtils: registerConsumable(): Promise[{ message: string, data: SupplierMaterial }]
            FormUtils-->>View: handleSubmit(): Promise[Object] — entidad guardada, cierre y recarga
            View->>View: form.onSave?.(supplierMaterial)
            View-->>Browser: cerrar modal y refrescar listado
        else [HTTP 4xx/5xx]
            Application-->>FormUtils: registerConsumable(): throw { status, data, message, raw }
            FormUtils-->>View: error propagado por handleSubmit()
            View-->>Form: error propagado por sendRequest()
            Form->>Browser: handleApiError({ err, form }) conserva los datos
        end
        deactivate Application
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

    FormUtils->>Application: registerConsumable({ formData, creationContext: null })
    activate Application
    Application->>Request: registerConsumableRequest({ data: formData })
    Request->>HTTP: apiRequest({ method: 'post', url: CONSUMABLES_API_ROUTE, data })
    HTTP->>Transport: POST /api/warehouse/consumables
    alt [HTTP 200]
        Transport-->>HTTP: { material: supplierMaterial, code }
        HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
        Request-->>Application: registerConsumableRequest(): Promise[AxiosResponse]
        Application-->>FormUtils: registerConsumable(): Promise[{ message: string, data: SupplierMaterial }]
    else [HTTP 4xx/5xx]
        Transport-->>HTTP: { code, message, meta }
        HTTP-->>Request: apiRequest(): throw { status, data, message, raw }
        Request-->>Application: registerConsumableRequest(): throw { status, data, message, raw }
        Application-->>FormUtils: registerConsumable(): throw { status, data, message, raw }
    end
    deactivate Application
```
