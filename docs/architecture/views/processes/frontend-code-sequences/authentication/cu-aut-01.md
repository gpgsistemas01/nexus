<a id="cu-aut-01"></a>
# `CU-AUT-01` — Iniciar sesión

**Patrones:** `FE-P01`, `FE-P09`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `EJS` | boundary | [`loginPage.ejs`](../../../../../../src/views/pages/home/login/loginPage.ejs) |
| `Form` | boundary | [`loginForm.js`](../../../../../../src/public/js/pages/home/login/loginForm.js) |
| `App` | control | [`login.js`](../../../../../../src/public/js/application/auth/login.js) |
| `Request` | boundary | [`authService.js`](../../../../../../src/public/js/services/authService.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `API` | control | [`authController.js`](../../../../../../src/controllers/api/authController.js) |
| `FormUtils` | control | [`formUtils.js`](../../../../../../src/public/js/utils/formUtils.js) |

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Usuario registrado
    participant Browser as Navegador
    participant EJS@{ "type": "boundary" } as Plantilla EJS
    participant Form@{ "type": "boundary" } as Formulario login
    participant App@{ "type": "control" } as Application
    participant Request@{ "type": "boundary" } as Requests del recurso
    participant HTTP@{ "type": "boundary" } as Cliente HTTP
    participant API@{ "type": "control" } as Endpoint API

    participant FormUtils@{ "type": "control" } as Form helpers

    Initiator->>Browser: inicia CU-AUT-01 — Iniciar sesión
    EJS->>Form: import './loginForm.js'
    Browser->>Form: captura y envía credenciales
    Form->>FormUtils: validateFields(loginValidation, formData)
    FormUtils-->>Form: validateFields(): Object
    break Validación local rechazada
        Form-->>Browser: mostrar errores sin invocar loginRequest
    end
    Form->>App: login({ formData })
    App->>Request: loginRequest({ data: formData })
    Request->>HTTP: apiRequest({ method: 'post', url, data })
    HTTP->>API: POST /api/auth/login
    alt Credenciales aceptadas
        API-->>HTTP: 200 y cookies de sesión
        HTTP-->>Request: apiRequest(): Promise[AxiosResponse]
        Request-->>App: loginRequest(): Promise[AxiosResponse]
        App-->>Form: login(): Promise[{ message: string }]
        Form->>Browser: window.location.replace('/almacen/materiales')
    else Credenciales rechazadas
        API-->>HTTP: 401 { code, message }
        HTTP-->>Request: apiRequest(): throw { status: number, data: Object | null, message: string, raw: Error }
        Request-->>App: loginRequest(): throw { status: number, data: Object | null, message: string, raw: Error }
        App-->>Form: login(): throw { status: number, data: Object | null, message: string, raw: Error }, sin navegación
    end
```
