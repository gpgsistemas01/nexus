<a id="cu-aut-01"></a>
# `CU-AUT-01` — Iniciar sesión

**Patrones:** `FE-P01`, `FE-P09`.

```mermaid
sequenceDiagram
    actor Initiator as Usuario registrado
    participant Browser as Navegador
    participant EJS as src/views/pages/home/login/loginPage.ejs
    participant Form as src/public/js/pages/home/login/loginForm.js
    participant App as src/public/js/application/auth/login.js
    participant Request as src/public/js/services/authService.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant API@{ "type": "control" } as src/controllers/api/authController.js
    participant Browser as Navegador

    Initiator->>Browser: inicia CU-AUT-01 — Iniciar sesión
    EJS->>Form: import './loginForm.js'
    Browser->>Form: captura y envía credenciales
    Form->>Form: validateFields(loginValidation, formData)
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
