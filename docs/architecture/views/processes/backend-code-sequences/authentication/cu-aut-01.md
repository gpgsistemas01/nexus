<a id="cu-aut-01"></a>
# `CU-AUT-01` — Iniciar sesión

**Patrones:** `BE-P01`, `BE-P08`.

## Participantes y trazabilidad

Los nombres breves del diagrama corresponden a los archivos vinculados siguientes.
La ruta completa se conserva en cada enlace, fuera de la cabecera visual. Un participante
puede agrupar colaboradores del mismo rol; esa agrupación no implica una clase ni un
proceso independiente. Los retornos representan el resultado o error propagado.

| Alias | Rol visual | Archivos de implementación |
| --- | --- | --- |
| `Router` | boundary | [`authApiRoute.js`](../../../../../../src/routes/api/authApiRoute.js) |
| `Validator` | control | [`authValidations.js`](../../../../../../src/validators/forms/authValidations.js)<br/>[`validatorMiddleware.js`](../../../../../../src/middleware/validatorMiddleware.js) |
| `Controller` | control | [`authController.js`](../../../../../../src/controllers/api/authController.js) |
| `Service` | control | [`authService.js`](../../../../../../src/services/authService.js) |
| `User` | control | [`userService.js`](../../../../../../src/services/admin/userService.js) |
| `Token` | control | [`jwtService.js`](../../../../../../src/services/jwtService.js) |
| `Cookies` | boundary | [`cookiesUtils.js`](../../../../../../src/utils/cookiesUtils.js) |

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    participant Browser as Navegador
    participant Router@{ "type": "boundary" } as Router web
    participant Validator@{ "type": "control" } as Validación HTTP
    participant Controller@{ "type": "control" } as Controller
    participant Service@{ "type": "control" } as Service
    participant User@{ "type": "control" } as Usuario
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant Token@{ "type": "control" } as JWT
    participant Cookies@{ "type": "boundary" } as Cookies

    Browser->>Router: POST /api/auth/login { name, password }
    Router->>Validator: loginValidation[] y validateLogin(req, res, next)
    alt loginValidation rechaza name/password
        Validator-->>Browser: HTTP 400 error { errors }
    else Entrada aceptada
        Router->>Controller: login(req, res)
        Controller->>Service: loginUser({ name, password })
        Service->>User: getUserIdByLogin(name, password)
        User->>Prisma: getDb().user.findUnique({ where: { name }, select })
        activate Prisma
        Prisma-->>User: findUnique(): Promise[User | null]
        deactivate Prisma
        User->>User: verifyPassword(password, user.password) y validar isActive/accesses
        User-->>Service: getUserIdByLogin(): Promise[number | null]
        alt Credenciales inválidas o cuenta inactiva
            Service-->>Controller: INVALID_AUTH sin crear tokens ni cookies
            Controller-->>Browser: HTTP 401 { code, message }
        else Credenciales válidas
            Service->>Token: generateAccessToken(tokenDto)
            activate Token
            Token-->>Service: generateAccessToken(): string
            deactivate Token
            Service->>Token: generateRefreshToken(tokenDto)
            activate Token
            Token-->>Service: generateRefreshToken(): string
            deactivate Token
            Service-->>Controller: loginUser(): Promise[{ newAccessToken: string, newRefreshToken: string }]
            Controller->>Cookies: setAuthCookies(res, tokens.newAccessToken, tokens.newRefreshToken)
            Controller-->>Browser: HTTP 200 { code } y cookies httpOnly
        end
    end
```
