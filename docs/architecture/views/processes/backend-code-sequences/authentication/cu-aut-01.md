<a id="cu-aut-01"></a>
# `CU-AUT-01` — Iniciar sesión

**Patrones:** `BE-P01`, `BE-P08`.

## Participantes y trazabilidad

Cada línea de vida técnica corresponde a un único archivo de implementación, indicado
por su alias en la tabla. Dos archivos distintos usan participantes distintos. Los actores,
el navegador y la frontera de persistencia son elementos externos, no archivos del proyecto.
Los retornos representan el resultado o error de la función ejecutada en el archivo indicado.
La composición incluye también los archivos de configuración, construcción y reexport: cada
uno tiene un nodo propio, aunque no ejecute una delegación durante la petición.

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
| `FileBaseRepository` | control | [`baseRepository.js`](../../../../../../src/repository/baseRepository.js) |
| `FileDatabaseUrl` | control | [`databaseUrl.js`](../../../../../../src/lib/databaseUrl.js) |
| `FilePrisma` | control | [`prisma.js`](../../../../../../src/lib/prisma.js) |

## Composición de archivos

Los archivos que construyen, configuran o reexportan funciones aparecen como componentes
individuales. Las flechas representan imports reales, resueltos al cargar los módulos;
las llamadas durante la operación se muestran en las secuencias siguientes. Cada nombre
identifica un archivo y la tabla conserva su ruta completa.

```mermaid
flowchart TB
    subgraph Component0["Backend"]
        FileDatabaseUrl["databaseUrl.js"]
        FilePrisma["prisma.js"]
        FileBaseRepository["baseRepository.js"]
    end
    FilePrisma -->|import| FileDatabaseUrl
    FileBaseRepository -->|import| FilePrisma
```

## Secuencia de implementación

```mermaid
sequenceDiagram
    autonumber
    participant Browser as Navegador
    participant Router@{ "type": "boundary" } as authApiRoute.js
    participant ValidationRules@{ "type": "control" } as authValidations.js
    participant Validator@{ "type": "control" } as validatorMiddleware.js
    participant Controller@{ "type": "control" } as authController.js
    participant Service@{ "type": "control" } as authService.js
    participant User@{ "type": "control" } as userService.js
    participant Prisma@{ "type": "database" } as Prisma / PostgreSQL
    participant Token@{ "type": "control" } as jwtService.js
    participant Cookies@{ "type": "boundary" } as cookiesUtils.js

    participant Password@{ "type": "control" } as encryptionUtils.js

    participant FileBaseRepository@{ "type": "control" } as baseRepository.js

    Browser->>Router: POST /api/auth/login { name, password }
    Router->>ValidationRules: loginValidation[] — cadena ejecutada por Express
    Router->>Validator: validateLogin(req, res, next)
    alt loginValidation rechaza name/password
        Validator-->>Browser: HTTP 400 error { errors }
    else Entrada aceptada
        Router->>Controller: login(req, res)
        Controller->>Service: loginUser({ name, password })
        Service->>User: getUserIdByLogin(name, password)
        User->>FileBaseRepository: getDb()
        FileBaseRepository-->>User: getDb(): PrismaClient | TransactionClient — tx si se recibió
        User->>Prisma: db.user.findUnique({ where: { name }, select })
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
