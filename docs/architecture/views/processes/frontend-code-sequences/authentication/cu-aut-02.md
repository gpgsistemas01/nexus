<a id="cu-aut-02"></a>
# `CU-AUT-02` — Cerrar sesión

**Patrones:** `FE-P09`.

## Participantes y trazabilidad

Los nombres breves del diagrama corresponden a los archivos vinculados siguientes.
La ruta completa se conserva en cada enlace, fuera de la cabecera visual. Un participante
puede agrupar colaboradores del mismo rol; esa agrupación no implica una clase ni un
proceso independiente. Los retornos representan el resultado o error propagado.

| Alias | Rol visual | Archivos de implementación |
| --- | --- | --- |
| `View` | boundary | [`logoutForm.ejs`](../../../../../../src/views/layout/ui/logoutForm.ejs) |
| `Route` | boundary | [`logoutWebRoute.js`](../../../../../../src/routes/web/auth/logoutWebRoute.js) |
| `Controller` | control | [`authController.js`](../../../../../../src/controllers/web/authController.js) |

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    actor Initiator as Usuario registrado
    participant Browser as Navegador
    participant View@{ "type": "boundary" } as Pantalla / formulario
    participant Route@{ "type": "boundary" } as Router API
    participant Controller@{ "type": "control" } as Controller

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
