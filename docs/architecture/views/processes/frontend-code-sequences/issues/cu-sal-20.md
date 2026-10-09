<a id="cu-sal-20"></a>
# `CU-SAL-20` — Devolver consumible surtido

**Patrones:** `FE-P05`, `FE-P06`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `View` | boundary | [`issueReturnUI.js`](../../../../../../src/public/js/ui/issues/issueReturnUI.js) |
| `Application` | control | [`createCrudApplication.js`](../../../../../../src/public/js/application/createCrudApplication.js) |
| `Request` | boundary | [`createGoodsIssueRequests.js`](../../../../../../src/public/js/services/warehouse/goodsIssues/createGoodsIssueRequests.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `Transport` | control | [`consumableGoodsIssueApiRoute.js`](../../../../../../src/routes/api/warehouse/goodsIssues/consumables/consumableGoodsIssueApiRoute.js) |
| `Form` | control | [`formUI.js`](../../../../../../src/public/js/ui/forms/formUI.js) |
| `FormUtils` | control | [`formUtils.js`](../../../../../../src/public/js/utils/formUtils.js) |

### Configuración y archivos de contexto

Estos módulos seleccionan/configuran y exportan la función de aplicación. Su cuerpo se ejecuta en la fábrica de la línea `Application`, sin una llamada intermedia entre reexports: [`goodsIssues.js`](../../../../../../src/public/js/application/warehouse/goodsIssues/goodsIssues.js), [`consumableGoodsIssues.js`](../../../../../../src/public/js/application/warehouse/goodsIssues/consumables/consumableGoodsIssues.js).

Estos módulos configuran o reexportan el request. La función que llama a `apiRequest` está definida en el archivo de la línea `Request`: [`consumableGoodsIssueService.js`](../../../../../../src/public/js/services/warehouse/goodsIssues/consumables/consumableGoodsIssueService.js).

El endpoint queda representado por su router. El controller asociado se desarrolla en la [secuencia backend `CU-SAL-20`](../../backend-code-sequences/issues/cu-sal-20.md#cu-sal-20): [`consumableGoodsIssueController.js`](../../../../../../src/controllers/api/warehouse/goodsIssues/consumables/consumableGoodsIssueController.js).

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
    Initiator->>Browser: inicia CU-SAL-20 — Devolver consumible surtido
    Browser->>Form: submit manejado por useForm(...)
    Form->>View: normalizeData({ form, formData }) — callback configurado
    activate View
    View-->>Form: normalizeData(): Object — datos normalizados
    deactivate View
    Form->>View: getErrors({ form, formData }) — callback configurado
    View->>FormUtils: validateFields(issueReturnValidation, formData)
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
        View->>Application: returnGoodsIssueDetail({ id, detailId, formData })
        alt Respuesta exitosa
            Application-->>View: returnGoodsIssueDetail(): Promise[{ message, data: goodsIssueReturn }]
            View->>Browser: notifications.showSuccess(response.message)
            View->>Browser: initMdbModal(getModal()).hide()
            View->>Browser: window.location.reload()
        else Error HTTP o de dominio
            Application-->>View: error propagado
            Form->>Browser: handleApiError({ err, form }) conserva el formulario
    end
    end
```

## Colaboración de aplicación y transporte

Amplía la llamada a `Application` del nivel anterior: cada request y el cliente HTTP tienen su propio archivo. El router identifica el endpoint de destino; su ejecución interna está en la secuencia backend del mismo CU. Los resultados regresan al caller de la primera figura.

```mermaid
sequenceDiagram
    autonumber
    participant View@{ "type": "boundary" } as Callback formulario
    participant Application@{ "type": "control" } as Application
    participant Request@{ "type": "boundary" } as Requests del recurso
    participant HTTP@{ "type": "boundary" } as Cliente HTTP
    participant Transport@{ "type": "control" } as Endpoint API

    Note over Application: Closure configurada
    Note over Request: Request configurado
    activate View
    deactivate View
        View->>Application: returnGoodsIssueDetail({ id, detailId, formData })
        Application->>Request: returnConsumableGoodsIssueDetailRequest({ id, detailId, data: formData })
        Request->>HTTP: apiRequest({ method: 'patch', url, data })
        HTTP->>Transport: PATCH /api/warehouse/goods-issues/consumables/:id/details/:detailId/returns
        alt Respuesta exitosa
            Transport-->>HTTP: HTTP 200 { goodsIssueReturn, code }
            HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
            Request-->>Application: returnConsumableGoodsIssueDetailRequest(): Promise[AxiosResponse]
            Application-->>View: returnGoodsIssueDetail(): Promise[{ message, data: goodsIssueReturn }]
        else Error HTTP o de dominio
            Transport-->>HTTP: HTTP de error { code, message }
            HTTP-->>Request: error normalizado
            Request-->>Application: error propagado
            Application-->>View: error propagado
    end
```
