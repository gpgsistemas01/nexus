<a id="cu-aut-02"></a>
# `CU-AUT-02` — Cerrar sesión

**Patrones:** `BE-P08`.

## Participantes y trazabilidad

Los nombres breves del diagrama corresponden a los archivos vinculados siguientes.
La ruta completa se conserva en cada enlace, fuera de la cabecera visual. Un participante
puede agrupar colaboradores del mismo rol; esa agrupación no implica una clase ni un
proceso independiente. Los retornos representan el resultado o error propagado.

| Alias | Rol visual | Archivos de implementación |
| --- | --- | --- |
| `Route` | boundary | [`logoutWebRoute.js`](../../../../../../src/routes/web/auth/logoutWebRoute.js) |
| `Controller` | control | [`authController.js`](../../../../../../src/controllers/web/authController.js) |

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Route@{ "type": "boundary" } as Router API
    participant Controller@{ "type": "control" } as Controller
    participant Response as Respuesta Express

    Client->>Route: POST /cerrar-sesion
    Route->>Controller: controllers/web/authController.logout(req, res)
    activate Controller
    Controller->>Response: clearCookie(name, options)
    Controller->>Response: res.redirect(path)
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
