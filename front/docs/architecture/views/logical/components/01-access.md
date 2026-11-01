# Acceso y sesión: componentes

**Identificador:** `DIA-VUE-COMP-001`. **Pregunta:** ¿qué dependencias enlazan arranque, sesión y captura de login?
**Fuentes:** [main.ts](../../../../../src/main.ts), [index.ts](../../../../../src/app/router/index.ts), [authService.ts](../../../../../src/modules/auth/services/authService.ts), [apiClient.ts](../../../../../src/shared/http/apiClient.ts).
**Notación:** [mapa de dependencias](../../diagram-reading.md#componentes-y-dependencias).

```mermaid
flowchart TB
    main["main.ts"]
    router["createAppRouter<br/>app/router/index.ts"]
    session["createAuthSession<br/>session.ts"]
    page["LoginPage"]
    form["LoginForm"]
    login["useLoginForm"]
    validation["loginValidation.js"]
    interaction["useFormInteraction"]
    service["authService"]
    http["apiClient.ts"]
    main --> router
    main --> session
    router --> session
    router --> page
    page --> form
    page --> login
    login --> validation
    login --> interaction
    login --> service
    service --> http
    session --> http
```

Vue Router gestiona la guarda; VeeValidate, el formulario; Axios, HTTP. El mapa muestra
imports. La [provisión de
sesión](../../development/design-and-construction-patterns/06-session-provision.md)
explica cómo se comparte la instancia.
