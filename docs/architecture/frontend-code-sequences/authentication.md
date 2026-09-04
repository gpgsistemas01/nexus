# Secuencias del código frontend: Autenticación

Este capítulo forma parte del [catálogo de secuencias del código frontend](index.md) y conserva los recorridos aplicados del grupo `AUT`. Las reglas comunes de lectura, trazabilidad y mantenimiento se declaran en el índice de la colección.

## `CU-AUT-01`

**Patrones:** `FE-P01`, `FE-P09`.

```mermaid
sequenceDiagram
    Note over User,App: Variables de frontera: name, password y cookies
    actor User as Usuario
    participant EJS as src/views/pages/home/login/loginPage.ejs
    participant Form as src/public/js/pages/home/login/loginForm.js
    participant App as src/public/js/application/auth/login.js
    participant Request as src/public/js/services/authService.js
    participant HTTP as src/public/js/services/axiosInstanceApi.js
    participant API@{ "type": "control" } as src/controllers/api/authController.js
    participant Browser as Navegador

    EJS->>Form: carga el módulo del formulario
    User->>Form: captura y envía credenciales
    Form->>Form: valida campos requeridos
    Form->>App: login({ formData })
    App->>Request: loginRequest({ data: formData })
    Request->>HTTP: apiRequest({ method: post, url, data })
    HTTP->>API: POST /api/auth/login
    API-->>HTTP: respuesta y cookies de sesión
    HTTP-->>Request: respuesta normalizada
    Request-->>App: respuesta normalizada
    App-->>Form: resultado exitoso
    Form->>Browser: navega a la portada autenticada
```

## `CU-AUT-02`

**Patrones:** `FE-P09`.

```mermaid
sequenceDiagram
    participant Browser as Navegador
    participant View as src/views/layout/ui/logoutForm.ejs
    participant Route as src/routes/web/auth/logoutWebRoute.js
    participant Controller@{ "type": "control" } as src/controllers/web/authController.js
    Note over View,Controller: Variables de frontera: sin variables de frontera adicionales

    Browser->>View: activar botón Salir
    View->>View: construir el POST sin payload adicional
    View->>Route: enviar formulario POST /cerrar-sesion
    activate Route
    Route->>Controller: logout(req, res)
    activate Controller
    Controller->>Controller: clearAuthCookies(res)
    Controller-->>Browser: responder redirect a /inicio-sesion
    Browser->>Browser: seguir redirección y renderizar inicio de sesión
    deactivate Controller
    deactivate Route
```
