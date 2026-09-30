<a id="cu-aut-02"></a>
# `CU-AUT-02` — Cerrar sesión

**Patrones:** `FE-P09`.

```mermaid
sequenceDiagram
    actor Initiator as Usuario registrado
    participant Browser as Navegador
    participant View as src/views/layout/ui/logoutForm.ejs
    participant Route as src/routes/web/auth/logoutWebRoute.js
    participant Controller@{ "type": "control" } as src/controllers/web/authController.js

    Initiator->>Browser: inicia CU-AUT-02 — Cerrar sesión
    Browser->>View: activar botón Salir
    View->>View: construir el POST sin payload adicional
    View->>Route: enviar formulario POST /cerrar-sesion
    activate Route
    Route->>Controller: logout(req, res)
    activate Controller
    Controller->>Controller: clearAuthCookies(res)
    alt req.error recibido desde refresh
        Controller->>Controller: redirectWithFlash(res, INVALID_AUTH, req.error, 'error')
        Controller-->>Browser: redirect 302 con flash de error
    else Cierre solicitado
        Controller->>Controller: redirectWithFlash(res, SUCCESS_LOGOUT, code, 'info')
        Controller-->>Browser: redirect 302 con flash informativo
    end
    Browser->>Browser: GET /inicio-sesion
    deactivate Controller
    deactivate Route
```
