<a id="cu-aut-01"></a>
# `CU-AUT-01` — Iniciar sesión

**Patrones:** `FE-P01`, `FE-P09`.

## Participantes y trazabilidad

Los nombres breves del diagrama corresponden a los archivos vinculados siguientes.
La ruta completa se conserva en cada enlace, fuera de la cabecera visual. Un participante
puede agrupar colaboradores del mismo rol; esa agrupación no implica una clase ni un
proceso independiente. Los retornos representan el resultado o error propagado.

| Alias | Rol visual | Archivos de implementación |
| --- | --- | --- |
| `EJS` | boundary | [`loginPage.ejs`](../../../../../../src/views/pages/home/login/loginPage.ejs) |
| `Form` | boundary | [`loginForm.js`](../../../../../../src/public/js/pages/home/login/loginForm.js) |
| `App` | control | [`login.js`](../../../../../../src/public/js/application/auth/login.js) |
| `Request` | boundary | [`authService.js`](../../../../../../src/public/js/services/authService.js) |
| `HTTP` | boundary | [`axiosInstanceApi.js`](../../../../../../src/public/js/services/axiosInstanceApi.js) |
| `API` | control | [`authController.js`](../../../../../../src/controllers/api/authController.js) |

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Usuario registrado
    participant Browser as Navegador
    participant EJS@{ "type": "boundary" } as Plantilla EJS
    participant Form@{ "type": "boundary" } as useForm
    participant App@{ "type": "control" } as Application
    participant Request@{ "type": "boundary" } as Requests del recurso
    participant HTTP@{ "type": "boundary" } as Cliente HTTP
    participant API@{ "type": "control" } as Endpoint API

    Initiator->>Browser: inicia CU-AUT-01 — Iniciar sesión
    EJS->>Form: import './loginForm.js'
    Browser->>Form: captura y envía credenciales
    Form->>Form: validateFields(loginValidation, formData)
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
