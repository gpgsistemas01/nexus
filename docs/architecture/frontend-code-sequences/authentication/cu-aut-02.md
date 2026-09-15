<a id="cu-aut-02"></a>
# `CU-AUT-02` — Cerrar sesión

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
