<a id="cu-aut-02"></a>
# `CU-AUT-02` — Cerrar sesión

**Patrones:** `BE-P08`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.
La composición incluye también los archivos de configuración, construcción y reexport: cada
uno tiene un nodo propio, aunque no ejecute una delegación durante la petición.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `Route` | boundary | [`logoutWebRoute.js`](../../../../../../src/routes/web/auth/logoutWebRoute.js) |
| `Controller` | control | [`authController.js`](../../../../../../src/controllers/web/authController.js) |

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Route@{ "type": "boundary" } as logoutWebRoute.js
    participant Controller@{ "type": "control" } as authController.js
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
