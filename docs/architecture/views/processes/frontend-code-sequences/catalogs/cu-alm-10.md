<a id="cu-alm-10"></a>
# `CU-ALM-10` — Registrar merma

**Patrones:** `FE-P02`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `View` | boundary | [`wasteForm.js`](../../../../../../src/public/js/pages/warehouse/wastes/wasteForm.js) |
| `Application` | control | [`createCrudApplication.js`](../../../../../../src/public/js/application/createCrudApplication.js) |
| `Request` | boundary | [`wasteService.js`](../../../../../../src/public/js/services/warehouse/wasteService.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `Transport` | control | [`wasteApiRoute.js`](../../../../../../src/routes/api/warehouse/wasteApiRoute.js) |
| `Modal` | boundary | [`wasteModal.js`](../../../../../../src/public/js/pages/warehouse/wastes/wasteModal.js) |
| `FormUtils` | control | [`formUtils.js`](../../../../../../src/public/js/utils/formUtils.js) |
| `Form` | control | [`formUI.js`](../../../../../../src/public/js/ui/forms/formUI.js) |

### Configuración y archivos de contexto

El endpoint queda representado por su router. El controller asociado se desarrolla en la [secuencia backend `CU-ALM-10`](../../backend-code-sequences/catalogs/cu-alm-10.md#cu-alm-10): [`wasteController.js`](../../../../../../src/controllers/api/warehouse/wasteController.js).

La línea `Application` ejecuta la función generada en `createCrudApplication.js`. Su nombre público y la configuración de requests/contratos provienen de [`wastes.js`](../../../../../../src/public/js/application/warehouse/wastes/wastes.js); exportar esa función no crea otra llamada durante cada petición.

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

    Initiator->>Browser: inicia CU-ALM-10 — Registrar merma
    Browser->>Modal: openWasteModal({ mode: CREATE })
    Browser->>Form: submit — listener registrado por useForm(...)
    Form->>View: normalizeData({ form, formData }) — callback configurado
    View-->>Form: normalizeData(): Object — datos normalizados
    Form->>View: getErrors({ form, formData }) — callback configurado
    View->>FormUtils: validateFields(wasteValidation, formData)
    FormUtils-->>View: validateFields(): Object — errores por campo
    View-->>Form: getErrors(): Object — errores por campo
    alt wasteValidation devuelve errores
        Form-->>Browser: useForm.getErrors() conserva datos y muestra errores por campo
    else Formulario válido
        break Envío ya en curso
            Form-->>Browser: envío duplicado rechazado sin request
        end
        Note over Form: Marca dataset.submitting y deshabilita submit antes del callback
        Form->>View: sendRequest({ form, formData }) — callback configurado
        View->>FormUtils: handleSubmit({ form, formData, create, update })
        FormUtils->>Application: registerWaste({ formData })
        activate Application
        alt Respuesta exitosa
            Application-->>FormUtils: registerWaste(): Promise[{ message: string, data: Waste }]
            FormUtils-->>View: handleSubmit(): Promise[Object] — entidad guardada, cierre y recarga
            View-->>Browser: modal cerrado y #table recargada
        else Respuesta rechazada
            Application-->>FormUtils: throw { status: number, data: Object | null, message: string, raw: Error }
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

    FormUtils->>Application: registerWaste({ formData })
    activate Application
    Application->>Request: registerWasteRequest({ data: formData })
    Request->>HTTP: apiRequest({ method: 'post', url, data })
    HTTP->>Transport: enviar POST /api/warehouse/wastes
    alt Respuesta exitosa
        Transport-->>HTTP: HTTP 200 { code, data: templates }
        HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
        Request-->>Application: registerWasteRequest(): Promise[AxiosResponse]
        Application-->>FormUtils: registerWaste(): Promise[{ message: string, data: Waste }]
    else Respuesta rechazada
        Transport-->>HTTP: HTTP de error — respuesta del endpoint
        HTTP-->>Request: apiRequest(): throw { status: number, data: Object | null, message: string, raw: Error }
        Request-->>Application: throw { status: number, data: Object | null, message: string, raw: Error }
        Application-->>FormUtils: throw { status: number, data: Object | null, message: string, raw: Error }
    end
    deactivate Application
```
