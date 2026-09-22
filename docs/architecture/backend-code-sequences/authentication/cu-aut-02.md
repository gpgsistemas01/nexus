<a id="cu-aut-02"></a>
# `CU-AUT-02` — Cerrar sesión

**Patrones:** `BE-P08`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/web/auth/logoutWebRoute.js
    participant Controller@{ "type": "control" } as src/controllers/web/authController.js
    participant Response as Respuesta Express

    Client->>Route: POST /cerrar-sesion
    Route->>Controller: controllers/web/authController.logout(req, res)
    activate Controller
    Controller->>Response: clearCookie(name, options) y res.redirect(path)
    activate Response
    alt req.error recibido desde refresh
        Controller->>Response: redirectWithFlash(res, INVALID_AUTH, req.error, 'error')
        Response-->>Client: redirect 302 con flash de error
    else Cierre solicitado
        Controller->>Response: redirectWithFlash(res, SUCCESS_LOGOUT, code, 'info')
        Response-->>Client: redirect 302 con flash informativo
    end
    deactivate Response
    deactivate Controller
```
