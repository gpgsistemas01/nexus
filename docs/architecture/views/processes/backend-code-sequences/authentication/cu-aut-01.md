<a id="cu-aut-01"></a>
# `CU-AUT-01` — Iniciar sesión

**Patrones:** `BE-P01`, `BE-P08`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.

| Alias | Rol visual | Archivo de implementación |
| --- | --- | --- |
| `Router` | boundary | [`authApiRoute.js`](../../../../../../src/routes/api/authApiRoute.js) |
| `Validator` | control | [`validatorMiddleware.js`](../../../../../../src/middleware/validatorMiddleware.js) |
| `Controller` | control | [`authController.js`](../../../../../../src/controllers/api/authController.js) |
| `Service` | control | [`authService.js`](../../../../../../src/services/authService.js) |
| `User` | control | [`userService.js`](../../../../../../src/services/admin/userService.js) |
| `Token` | control | [`jwtService.js`](../../../../../../src/services/jwtService.js) |
| `Cookies` | boundary | [`cookiesUtils.js`](../../../../../../src/utils/cookiesUtils.js) |
| `ValidationRules` | control | [`authValidations.js`](../../../../../../src/validators/forms/authValidations.js) |
| `Password` | control | [`encryptionUtils.js`](../../../../../../src/utils/encryptionUtils.js) |

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    participant Browser as Navegador
    participant Router@{ "type": "boundary" } as Router web
    participant ValidationRules@{ "type": "control" } as Reglas de entrada
    participant Validator@{ "type": "control" } as Validación HTTP
    participant Controller@{ "type": "control" } as Controller
    participant Service@{ "type": "control" } as Service
    participant User@{ "type": "control" } as Usuario
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant Token@{ "type": "control" } as JWT
    participant Cookies@{ "type": "boundary" } as Cookies

    participant Password@{ "type": "control" } as Contraseña

    Browser->>Router: POST /api/auth/login { name, password }
    Router->>ValidationRules: loginValidation[] — cadena ejecutada por Express
    Router->>Validator: validateLogin(req, res, next)
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
        User->>Password: verifyPassword(password, user.password) y validar isActive/accesses
        Password-->>User: verifyPassword(): Promise[boolean]
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
