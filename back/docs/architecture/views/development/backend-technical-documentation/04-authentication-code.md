# 4. Autenticación: estructura de código

**Identificador:** `DIA-BE-MOD-AUT-001`.
**Alcance:** grupos de implementación del módulo y sus dependencias directas.
**Fuente:** imports de los archivos de la tabla.

```mermaid
flowchart TB
    R["routes/api<br/>authApiRoute.js"]
    C["controllers/api<br/>authController.js"]
    M["middleware<br/>authMiddleware.js"]
    S["services<br/>authService.js"]
    J["services<br/>jwtService.js"]
    X["Colaboradores de dominio<br/>userService.js"]
    K["utils<br/>cookiesUtils.js"]
    V["Validadores<br/>authValidations.js"]
    P["baseRepository.js<br/>getDb(tx)"]
    C --> S
    C --> K
    R --> C
    R --> M
    R --> V
    M --> X
    M --> J
    S --> P
    S --> X
    S --> J
    X --> P
```

| Grupo del mapa | Archivos que lo componen |
| --- | --- |
| routes/api · authApiRoute.js | `src/routes/api/authApiRoute.js` |
| controllers/api · authController.js | `src/controllers/api/authController.js` |
| middleware · authMiddleware.js | `src/middleware/authMiddleware.js` |
| services · authService.js · jwtService.js · y colaboradores | `src/services/authService.js`<br/>`src/services/jwtService.js`<br/>`src/services/roleService.js` |
| Colaboradores de dominio · userService.js | `src/services/admin/userService.js` |
| Validadores · authValidations.js | `src/validators/forms/authValidations.js` |
| baseRepository.js · getDb(tx) | `src/repository/baseRepository.js` |


## Contratos de implementación

### Datos, resultados y efectos del módulo

| Capacidad | Entrada y retorno | Reglas, errores y persistencia |
| --- | --- | --- |
| Autenticación y autorización | El middleware de token requerido carga una vez el usuario y lo asigna a `req.user`; el middleware de permiso valida sus permisos ya resueltos. `authController.js` adapta login, usuario actual y renovación; `/me` reutiliza `req.user`. | `authMiddleware.js`, `authService.js`, `jwtService.js`, cookies y tokens; no persiste dominio salvo las lecturas del usuario. |


| Archivo bajo `src/` | Símbolos públicos y puntos de configuración |
| --- | --- |
| `controllers/api/authController.js` | `login`<br/>`refreshAuthToken`<br/>`getCurrentUser` |
| `middleware/authMiddleware.js` | `getAuthTokenInfo`<br/>`verifyCookiesAuthTokenRequired`<br/>`verifyApiTokenRequired`<br/>`authorizeUserApi`<br/>`authorizeUserWeb` |

## Variantes y límites de reutilización

El controller de autenticación usa authService; éste consulta userService y delega JWT. El middleware de autenticación consulta userService una vez por petición protegida y entrega el usuario a los siguientes middleware y controllers. Cookies y errores permanecen en sus helpers. El login web usa un controller distinto al de la API.

Los reportes y la infraestructura transversal se localizan en el
[capítulo 3](03-shared-code-and-coverage.md); el orden de llamadas está en
[procesos](../../processes/backend-code-sequences/index.md).
