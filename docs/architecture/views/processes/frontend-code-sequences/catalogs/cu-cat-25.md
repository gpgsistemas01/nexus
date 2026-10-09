<a id="cu-cat-25"></a>
# `CU-CAT-25` — Crear estado de cumplimiento

**Patrones:** `FE-P03`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `View` | boundary | [`catalogForm.js`](../../../../../../src/public/js/pages/admin/catalogs/catalogForm.js) |
| `Application` | control | [`createCrudApplication.js`](../../../../../../src/public/js/application/createCrudApplication.js) |
| `Request` | boundary | [`catalogService.js`](../../../../../../src/public/js/services/admin/catalogService.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `Transport` | control | [`catalogApiRoute.js`](../../../../../../src/routes/api/admin/catalogApiRoute.js) |
| `FormUtils` | control | [`formUtils.js`](../../../../../../src/public/js/utils/formUtils.js) |
| `Form` | control | [`formUI.js`](../../../../../../src/public/js/ui/forms/formUI.js) |

### Configuración y archivos de contexto

El endpoint queda representado por su router. El controller asociado se desarrolla en la [secuencia backend `CU-CAT-25`](../../backend-code-sequences/catalogs/cu-cat-25.md#cu-cat-25): [`catalogController.js`](../../../../../../src/controllers/api/admin/catalogController.js).

La línea `Application` ejecuta la función generada en `createCrudApplication.js`. Su nombre público y la configuración de requests/contratos provienen de [`catalogs.js`](../../../../../../src/public/js/application/admin/catalogs/catalogs.js); exportar esa función no crea otra llamada durante cada petición.

## Coordinación de la interfaz

Este nivel conserva entrada, callbacks y efectos de interfaz. La llamada a `Application` se amplía en la colaboración de transporte, con los mismos argumentos y resultado.

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Administrador del sistema
    participant Browser as Navegador
    participant Form@{ "type": "control" } as useForm
    participant View@{ "type": "boundary" } as Callback formulario
    participant FormUtils@{ "type": "control" } as Form helpers
    participant Application@{ "type": "control" } as Application

    Initiator->>Browser: inicia CU-CAT-25 — Crear estado de cumplimiento
    Browser->>View: confirmar el formulario de alta
    Browser->>Form: submit — listener registrado por useForm(...)
    Form->>View: normalizeData({ form, formData }) — callback configurado
    View-->>Form: normalizeData(): Object — datos normalizados
    Form->>View: getErrors({ form, formData }) — callback configurado
    View->>FormUtils: validateFields(catalogValidation, formData)
    FormUtils-->>View: validateFields(): Object — errores por campo
    View-->>Form: getErrors(): Object — errores por campo
    alt catalogValidation devuelve errores
        Form-->>Browser: useForm.getErrors() conserva datos y muestra errores por campo
    else Formulario válido
        break Envío ya en curso
            Form-->>Browser: envío duplicado rechazado sin request
        end
        Note over Form: Marca dataset.submitting y deshabilita submit antes del callback
        Form->>View: sendRequest({ form, formData }) — callback configurado
        View->>FormUtils: handleSubmit({ form, formData, create, update })
        FormUtils->>Application: registerCatalogEntry({ catalog, formData })
        activate Application
        alt Respuesta exitosa
            Application-->>FormUtils: registerCatalogEntry(): Promise[{ message: string, data: Object }]
            FormUtils-->>View: handleSubmit(): Promise[Object] — entidad guardada, cierre y recarga
            View-->>Browser: DOM o DataTable actualizado con response.data
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

    FormUtils->>Application: registerCatalogEntry({ catalog, formData })
    activate Application
    Application->>Request: createCatalogEntryRequest({ catalog, data })
    Request->>HTTP: apiRequest({ method: 'post', url, data })
    HTTP->>Transport: consume POST /api/admin/catalogs/fulfillment-statuses
    alt Respuesta exitosa
        Transport-->>HTTP: HTTP 201 { data, code }
        HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
        Request-->>Application: createCatalogEntryRequest(): Promise[AxiosResponse]
        Application-->>FormUtils: registerCatalogEntry(): Promise[{ message: string, data: Object }]
    else Respuesta rechazada
        Transport-->>HTTP: HTTP de error — respuesta del endpoint
        HTTP-->>Request: apiRequest(): throw { status: number, data: Object | null, message: string, raw: Error }
        Request-->>Application: throw { status: number, data: Object | null, message: string, raw: Error }
        Application-->>FormUtils: throw { status: number, data: Object | null, message: string, raw: Error }
    end
    deactivate Application
```
