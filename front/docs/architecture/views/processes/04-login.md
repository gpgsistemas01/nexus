# Captura, login y navegación

## Escenario y contratos

**Casos relacionados:** CU-AUT-01.

**Fuente técnica:** LoginPage.vue, useLoginForm.ts y authService.ts. El diagrama describe el código Vue y sus fronteras. La API es un participante externo; sus transacciones internas no se atribuyen al navegador.

## Secuencia aplicada

**Identificador:** `DIA-VUE-SEQ-003`. Mensajes numerados; líneas continuas = invocación/solicitud, discontinuas = respuesta o resultado. Las ramas representan decisiones reales; no son ejecuciones simultáneas.

```mermaid
sequenceDiagram
    autonumber
    actor Usuario
    participant Page as LoginPage y LoginForm
    participant Form as useLoginForm
    participant Validation as VeeValidate
    participant Service as loginRequest
    participant API
    Usuario->>Page: capturar y pulsar Entrar
    Page->>Form: updateField y submit
    Form->>Validation: handleSubmit
    alt captura inválida
        Validation-->>Page: errores de campo sin solicitud
    else captura válida
        Validation-->>Form: credenciales
        Form->>Service: request(credentials, signal)
        Service->>API: POST login sin refresh automático
        alt código SUCCESS_LOGIN
            API-->>Service: confirmación y cookies
            Service-->>Form: acceso confirmado
            Form->>Form: recordar sólo nombre y vaciar contraseña
            Form-->>Page: onSuccess si sigue montado
            Page->>Page: resolver destino protegido con sesión vigente
        else 400 o 401 o 429 o red
            API-->>Service: rechazo o indisponibilidad
            Service-->>Form: LoginRequestError normalizado
            Form-->>Page: conservar captura y permitir corrección
        end
    end
```

## Reglas y recuperación

Los espacios de contraseña se conservan; nombre se recorta al construir la solicitud. Un fallo de Storage no revoca un acceso ya confirmado. La [renovación y retorno](01-bootstrap-and-session.md) tienen secuencia propia.

## Evidencia

login.spec.ts, useLoginFormTest.ts y authServiceTest.ts. La [matriz por caso](../../../testing/04-use-case-coverage.md) identifica alcance y límites, y el [registro CP](../../../testing/03-test-cases.md) concreta datos y oráculos críticos.
