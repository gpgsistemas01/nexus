<a id="cu-aut-01"></a>
# `CU-AUT-01` — Iniciar sesión

**Patrones:** `BE-P01`, `BE-P08`.

```mermaid
sequenceDiagram
    participant Browser as Navegador
    participant Router as src/routes/api/authApiRoute.js
    participant Validator as src/validators/forms/authValidations.js<br/>src/middleware/validatorMiddleware.js
    participant Controller@{ "type": "control" } as src/controllers/api/authController.js
    participant Service as src/services/authService.js
    participant User as src/services/admin/userService.js
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant Token as src/services/jwtService.js
    participant Cookies as src/utils/cookiesUtils.js

    Browser->>Router: POST /api/auth/login { name, password }
    Router->>Validator: loginValidation[] y validateLogin(req, res, next)
    alt loginValidation rechaza name/password
        Validator-->>Browser: HTTP 400 error { errors }
    else Entrada aceptada
        Router->>Controller: login(req, res)
        Controller->>Service: loginUser({ name, password })
        Service->>User: getUserIdByLogin(name, password)
        User->>Prisma: getDb().user.findUnique({ where: { name }, select })
        Prisma-->>User: findUnique(): Promise[User | null]
        User->>User: verifyPassword(password, user.password) y validar isActive/accesses
        User-->>Service: getUserIdByLogin(): Promise[number | null]
        alt Credenciales inválidas o cuenta inactiva
            Service-->>Controller: INVALID_AUTH sin crear tokens ni cookies
            Controller-->>Browser: HTTP 401 { code, message }
        else Credenciales válidas
            Service->>Token: generateAccessToken(tokenDto)
            Token-->>Service: generateAccessToken(): string
            Service->>Token: generateRefreshToken(tokenDto)
            Token-->>Service: generateRefreshToken(): string
            Service-->>Controller: loginUser(): Promise[{ newAccessToken: string, newRefreshToken: string }]
            Controller->>Cookies: setAuthCookies(res, tokens.newAccessToken, tokens.newRefreshToken)
            Controller-->>Browser: HTTP 200 { code } y cookies httpOnly
        end
    end
```
