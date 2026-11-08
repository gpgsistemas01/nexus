<a id="cu-aut-02"></a>
# `CU-AUT-02` — Cerrar sesión

**Patrones:** `BE-P08`.

## Participantes y trazabilidad

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `Route` | boundary | [`logoutRoute.js`](../../../../../../src/routes/system/logoutRoute.js) |
| `Cookies` | control | [`cookiesUtils.js`](../../../../../../src/utils/cookiesUtils.js) |

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    participant Client as Cliente HTTP / web
    participant Route@{ "type": "boundary" } as logoutRoute.js
    participant Cookies@{ "type": "control" } as cookiesUtils.js
    participant Response as Respuesta Express

    Client->>Route: POST /cerrar-sesion
    Route->>Cookies: clearAuthCookies(res)
    activate Cookies
    Cookies->>Response: clearCookie('accessToken', options)
    Cookies->>Response: clearCookie('refreshToken', options)
    Cookies-->>Route: clearAuthCookies(): void
    deactivate Cookies
    Route->>Response: res.redirect(303, '/inicio-sesion')
    Response-->>Client: HTTP 303 hacia el login Vue
```

El formulario de navegación Vue envía el POST al mismo origen. El proxy conserva
la respuesta y las cookies; Vue Router resuelve el destino después de la redirección.
