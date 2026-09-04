# Secuencias del código backend: Autenticación

Este capítulo forma parte del [catálogo de secuencias del código backend](index.md) y conserva los recorridos aplicados del grupo `AUT`. Las reglas comunes de lectura, trazabilidad y mantenimiento se declaran en el índice de la colección.

## `CU-AUT-01`

**Patrones:** `BE-P01`, `BE-P08`.

```mermaid
sequenceDiagram
    Note over Router,Controller: Variables de frontera: name, password y cookies
    participant Browser as Navegador
    participant Router as src/routes/api/authApiRoute.js
    participant Controller@{ "type": "control" } as src/controllers/api/authController.js
    participant Service as src/services/authService.js
    participant User as src/services/admin/userService.js
    participant Prisma as Prisma / PostgreSQL
    participant Token as src/services/jwtService.js
    participant Cookies as src/utils/cookiesUtils.js

    Browser->>Router: POST /api/auth/login { name, password }
    Router->>Router: loginValidation(req, res, next) → validateLogin(req, res, next)
    Router->>Controller: login(req, res)
    Controller->>Service: loginUser({ name, password })
    Service->>User: getUserIdByLogin(name, password)
    User->>Prisma: getDb().user.findUnique({ where: { name }, select })
    Prisma-->>User: usuario o ausencia
    User->>User: verifyPassword(password, user.password) y validar isActive/accesses
    User-->>Service: userId o null
    alt Credenciales inválidas o cuenta inactiva
        Service-->>Controller: error de autenticación
        Controller-->>Browser: respuesta de error sin sesión
    else Credenciales válidas
        Service->>Token: generateAccessToken(tokenDto) y generateRefreshToken(tokenDto)
        Token-->>Service: credenciales firmadas
        Service-->>Controller: access token y refresh token
        Controller->>Cookies: setAuthCookies(res, tokens.newAccessToken, tokens.newRefreshToken)
        Controller-->>Browser: éxito y cookies protegidas
    end
```

## `CU-AUT-02`

**Patrones:** `BE-P08`.

```mermaid
sequenceDiagram
    participant Client as Cliente HTTP / web
    participant Route as src/routes/web/auth/logoutWebRoute.js
    participant Controller@{ "type": "control" } as src/controllers/web/authController.js
    participant Response as Respuesta Express
    Note over Controller,Response: Variables de frontera: sin variables adicionales

    Client->>Route: POST /cerrar-sesion
    Route->>Route: ejecutar en orden el middleware configurado para la ruta
    Route->>Controller: controllers/web/authController.logout(req, res)
    activate Controller
    Controller->>Response: clearCookie(name, options) y res.redirect(path)
    activate Response
    Response->>Response: comprobar datos de frontera y reglas propias de la operación
    Response-->>Controller: resultado del servicio o error de dominio tipado
    deactivate Response
    alt El servicio devuelve el resultado
        Controller-->>Client: status HTTP y cuerpo concretos del controller
    else El servicio propaga un error de dominio
        Controller-->>Client: error entregado al middleware final para su respuesta HTTP
    end
    deactivate Controller
```
