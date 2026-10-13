# 4. Autenticación: estructura de código

**Identificador:** `DIA-BE-MOD-AUT-001`.
**Alcance:** grupos de implementación del módulo y sus dependencias directas.
**Fuente:** imports de los archivos de la tabla.

```mermaid
flowchart TB
    R["routes/api<br/>authApiRoute.js"]
    C["controllers/api<br/>authController.js"]
    S["services<br/>authService.js<br/>jwtService.js"]
    X["Colaboradores de dominio<br/>userService.js"]
    V["Validadores<br/>authValidations.js"]
    P["baseRepository.js<br/>getDb(tx)"]
    C --> S
    C --> X
    R --> C
    R --> V
    S --> P
    S --> X
    X --> P
```

| Grupo del mapa | Archivos que lo componen |
| --- | --- |
| routes/api · authApiRoute.js | `src/routes/api/authApiRoute.js` |
| controllers/api · authController.js | `src/controllers/api/authController.js` |
| services · authService.js · jwtService.js · y colaboradores | `src/services/authService.js`<br/>`src/services/jwtService.js`<br/>`src/services/roleService.js` |
| Colaboradores de dominio · userService.js | `src/services/admin/userService.js` |
| Validadores · authValidations.js | `src/validators/forms/authValidations.js` |
| baseRepository.js · getDb(tx) | `src/repository/baseRepository.js` |


## Contratos de implementación

### Datos, resultados y efectos del módulo

| Capacidad | Entrada y retorno | Reglas, errores y persistencia |
| --- | --- | --- |
| Autenticación y autorización | Las rutas protegidas pasan por token requerido y permiso; `authController.js` adapta login, usuario actual y renovación. | `authService.js`, `jwtService.js`, cookies y tokens; no persiste dominio salvo la lectura del usuario. |


| Archivo bajo `src/` | Símbolos públicos y puntos de configuración |
| --- | --- |
| `controllers/api/authController.js` | `login`<br/>`refreshAuthToken`<br/>`getCurrentUser` |

## Variantes y límites de reutilización

El controller de autenticación usa authService; éste consulta userService y delega JWT. Cookies y errores permanecen en sus helpers. El login web usa un controller distinto al de la API.

Los reportes y la infraestructura transversal se localizan en el
[capítulo 3](03-shared-code-and-coverage.md); el orden de llamadas está en
[procesos](../../processes/backend-code-sequences/index.md).

