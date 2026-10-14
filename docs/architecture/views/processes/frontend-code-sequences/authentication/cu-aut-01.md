<a id="cu-aut-01"></a>
# `CU-AUT-01` — Iniciar sesión

**Patrones:** `FE-P01`, `FE-P09`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.
La composición incluye también los archivos de configuración, construcción y reexport: cada
uno tiene un nodo propio, aunque no ejecute una delegación durante la petición.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `EJS` | boundary | [`loginPage.ejs`](../../../../../../src/views/pages/home/login/loginPage.ejs) |
| `Form` | boundary | [`loginForm.js`](../../../../../../src/public/js/pages/home/login/loginForm.js) |
| `App` | control | [`login.js`](../../../../../../src/public/js/application/auth/login.js) |
| `Request` | boundary | [`authService.js`](../../../../../../src/public/js/services/authService.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `API` | control | [`authController.js`](../../../../../../src/controllers/api/authController.js) |
| `FormUtils` | control | [`formUtils.js`](../../../../../../src/public/js/utils/formUtils.js) |
| `FileUtils` | control | [`utils.js`](../../../../../../src/public/js/api/utils.js) |
| `FileValidators` | control | [`validators.js`](../../../../../../src/public/js/utils/validations/validators.js) |
| `FileFieldValidations` | control | [`fieldValidations.js`](../../../../../../src/public/js/utils/validations/fieldValidations.js) |
| `FileBaseValidations` | control | [`baseValidations.js`](../../../../../../src/public/js/utils/validations/baseValidations.js) |
| `FormCore` | control | [`formUI.js`](../../../../../../src/public/js/ui/forms/formUI.js) |
| `FileFormErrorsUI` | control | [`formErrorsUI.js`](../../../../../../src/public/js/ui/forms/formErrorsUI.js) |
| `FileErrorHandler` | control | [`errorHandler.js`](../../../../../../src/public/js/api/errorHandler.js) |
| `FileResponseUtils` | control | [`responseUtils.js`](../../../../../../src/public/js/utils/responseUtils.js) |
| `FileApiMessages` | control | [`apiMessages.js`](../../../../../../src/public/js/constants/apiMessages.js) |
| `Transport` | control | [`authApiRoute.js`](../../../../../../src/routes/api/authApiRoute.js) |

## Composición de archivos

Los archivos que construyen, configuran o reexportan funciones aparecen como componentes
individuales. Las flechas representan imports reales, resueltos al cargar los módulos;
las llamadas durante la operación se muestran en las secuencias siguientes. Cada nombre
identifica un archivo y la tabla conserva su ruta completa.

```mermaid
flowchart TB
    subgraph Component0["Backend"]
        API["authController.js"]
        Transport["authApiRoute.js"]
    end
    subgraph Component1["Interfaz"]
        Form["loginForm.js"]
        FileBaseValidations["baseValidations.js"]
        FileFieldValidations["fieldValidations.js"]
        FileValidators["validators.js"]
    end
    Form -->|import| FileValidators
    FileFieldValidations -->|import| FileBaseValidations
    FileValidators -->|import| FileBaseValidations
    FileValidators -->|import| FileFieldValidations
    Transport -->|import| API
```

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Usuario registrado
    participant Browser as Navegador
    participant EJS@{ "type": "boundary" } as loginPage.ejs
    participant Form@{ "type": "boundary" } as loginForm.js
    participant App@{ "type": "control" } as login.js
    participant Request@{ "type": "boundary" } as authService.js
    participant HTTP@{ "type": "boundary" } as axiosInstanceApi.js

    participant FormUtils@{ "type": "control" } as formUtils.js

    participant FileUtils@{ "type": "control" } as utils.js

    participant FileErrorHandler@{ "type": "control" } as errorHandler.js
    participant FileFormErrorsUI@{ "type": "control" } as formErrorsUI.js
    participant FormCore@{ "type": "control" } as formUI.js
    participant Transport@{ "type": "control" } as authApiRoute.js

    Initiator->>Browser: inicia CU-AUT-01 — Iniciar sesión
    EJS->>Form: import './loginForm.js'
    Browser->>FormCore: captura y envía credenciales — submit
    FormCore->>Form: normalizeData({ formData })
    Form-->>FormCore: normalizeData(): Object
    FormCore->>Form: getErrors({ formData })
    Form->>FormUtils: validateFields(loginValidation, formData)
    FormUtils-->>Form: validateFields(): Object
    Form-->>FormCore: getErrors(): Object
    FormCore->>Form: normalizeErrors({ errors }) — callback específico de login
    Form-->>FormCore: normalizeErrors(): Object — mensajes de usuario y contraseña
    FormCore->>FileFormErrorsUI: toggleErrorMessages(form, errors)
    FormCore->>FormUtils: hasValidationErrors(errors)
    break Validación local rechazada
        FormCore->>FileFormErrorsUI: scrollToFirstFormError(form)
        Form-->>Browser: mostrar errores sin invocar loginRequest
    end
    break dataset.submitting es true
        FormCore-->>Browser: envío duplicado rechazado
    end
    Note over FormCore,Form: Establece submitting y deshabilita submit
    FormCore->>Form: sendRequest({ formData })
    Form->>App: login({ formData })
    App->>Request: loginRequest({ data: formData })
    Request->>HTTP: apiRequest({ method: 'post', url, data })
    HTTP->>Transport: POST /api/auth/login
    alt Credenciales aceptadas
        Transport-->>HTTP: 200 y cookies de sesión
        HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
        Request-->>App: loginRequest(): Promise[AxiosResponse]
        Note over App: Adapta la respuesta según dataKey — detalle de adaptación de respuesta
        App-->>Form: login(): Promise[{ message: string }]
        Form->>Form: updateRememberedCredentials(formData)
        Form->>Browser: localStorage.setItem(showSuccessToast, response.message)
        Form->>Browser: window.location.replace('/almacen/materiales')
    else Credenciales rechazadas
        Transport-->>HTTP: 401 { code, message }
        opt No se inicia renovación: status distinto de 401 o request._retry
            HTTP->>FileUtils: normalizeHttpError(err)
            FileUtils-->>HTTP: normalizeHttpError(): Object — status, data, message, raw
        end
        HTTP-->>Request: apiRequest(): throw { status: number, data: Object | null, message: string, raw: Error }
        Request-->>App: loginRequest(): throw { status: number, data: Object | null, message: string, raw: Error }
        App-->>Form: login(): throw { status: number, data: Object | null, message: string, raw: Error }, sin navegación
        Form-->>FormCore: error propagado por sendRequest()
        FormCore->>FileErrorHandler: handleApiError({ err, form, normalizeServerErrors })
    end
```

## Detalle de adaptación de respuesta

Amplía la adaptación posterior al request exitoso. El wrapper y la construcción de la
respuesta se ejecutan en `responseUtils.js`; el mensaje se obtiene de `apiMessages.js`.

```mermaid
sequenceDiagram
    autonumber
    participant App@{ "type": "control" } as login.js
    participant FileResponseUtils@{ "type": "control" } as responseUtils.js
    participant FileApiMessages@{ "type": "control" } as apiMessages.js

    App->>FileResponseUtils: createSuccessResponseFromRequest({ response })
    FileResponseUtils->>FileResponseUtils: createSuccessResponse({ data: response.data, dataKey, message })
    FileResponseUtils->>FileApiMessages: getSuccessMessage(response.data?.code)
    FileApiMessages-->>FileResponseUtils: getSuccessMessage(): string
    FileResponseUtils-->>App: createSuccessResponseFromRequest(): Object — message y data sólo si hay dataKey
```
