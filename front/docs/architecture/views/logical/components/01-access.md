# Acceso y sesión: componentes

**Identificador:** `DIA-VUE-COMP-001`. **Pregunta:** ¿Qué colaboradores tienen responsabilidad propia y qué contratos los conectan?

**Fuente:** main.ts, LoginPage, useLoginForm, authService, createAuthSession y Router. **Notación y alcance:** Las flechas indican dependencia o consumo; no orden temporal ni herencia.

```mermaid
flowchart TB
    page["LoginPage · coordinación"] --> form["LoginForm · props y eventos"]
    page --> login["useLoginForm · captura e interacción"]
    login --> rules["VeeValidate y loginValidation"]
    login --> service["loginRequest · contrato login"]
    service --> http["apiClient · HTTP y refresh"]
    router["Router · guarda y retorno"] --> session["createAuthSession · identidad readonly"]
    session --> http
    http --> api["API · autorización y cookies"]
```

El corte representa elementos del cliente, no clases ni procesos desplegados. La [vista de procesos](../../processes/index.md) detalla orden, validación, rechazo y recuperación. Los contratos de props/eventos se localizan en la [referencia generada](../../development/code-reference.md).
