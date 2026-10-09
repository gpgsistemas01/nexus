<a id="cu-aut-02"></a>
# `CU-AUT-02` — Cerrar sesión

**Patrones:** `FE-P09`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `View` | boundary | [`logoutForm.ejs`](../../../../../../src/views/layout/ui/logoutForm.ejs) |
| `Route` | boundary | [`logoutWebRoute.js`](../../../../../../src/routes/web/auth/logoutWebRoute.js) |
| `Controller` | control | [`authController.js`](../../../../../../src/controllers/web/authController.js) |
| `Cookies` | control | [`cookiesUtils.js`](../../../../../../src/utils/cookiesUtils.js) |
| `Flash` | control | [`flashUtils.js`](../../../../../../src/utils/flashUtils.js) |

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Usuario registrado
    participant Browser as Navegador
    participant View@{ "type": "boundary" } as Pantalla JS
    participant Route@{ "type": "boundary" } as Router API
    participant Controller@{ "type": "control" } as Controller

    participant Cookies@{ "type": "control" } as Cookies

    participant Flash@{ "type": "control" } as Redirección con flash

    Initiator->>Browser: inicia CU-AUT-02 — Cerrar sesión
    Browser->>View: activar botón Salir
    View->>View: construir el POST sin payload adicional
    View->>Route: enviar formulario POST /cerrar-sesion
    activate Route
    Route->>Controller: logout(req, res)
    activate Controller
    Controller->>Cookies: clearAuthCookies(res)
    Cookies-->>Controller: clearAuthCookies(): void
    alt req.error recibido desde refresh
        Controller->>Flash: redirectWithFlash(res, INVALID_AUTH, req.error, 'error')
        Flash-->>Controller: redirectWithFlash(): void
        Controller-->>Browser: redirect 302 con flash de error
    else Cierre solicitado
        Controller->>Flash: redirectWithFlash(res, SUCCESS_LOGOUT, code, 'info')
        Flash-->>Controller: redirectWithFlash(): void
        Controller-->>Browser: redirect 302 con flash informativo
    end
    Browser->>Browser: GET /inicio-sesion
    deactivate Controller
    deactivate Route
```
