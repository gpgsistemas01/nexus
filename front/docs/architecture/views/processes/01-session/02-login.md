# Captura, login y navegación

## Escenario y contratos

**Casos relacionados:** CU-AUT-01.

## Secuencia aplicada

**Identificador:** `DIA-VUE-SEQ-003`.

**Lectura visual:** [líneas de vida, números y mensajes](../../diagram-reading.md#secuencias).

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario autorizado
    box Interfaz
    participant Form@{ "type": "boundary" } as Login<br/>Form.vue
    participant Page@{ "type": "boundary" } as Login<br/>Page.vue
    end
    box Coordinación
    participant Editor@{ "type": "control" } as useLogin<br/>Form.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as auth<br/>Service.ts
    end
    U->>Form: capturar y pulsar Ingresar
    Form->>Page: update:name, update:password y submit
    Page->>Editor: updateField y submit()
    Editor->>Editor: validar con loginValidation
    alt captura inválida
        Editor-->>Page: errors y mensaje
        Page-->>Form: props de errores, sin petición
    else captura válida
        Editor->>Service: loginRequest(credentials, signal)
        Note over Page,Service: Transporte y traducción del rechazo en SEQ-047
        alt acceso confirmado y editor vigente
            Service-->>Editor: promesa resuelta
            Editor->>Editor: recordar nombre y vaciar contraseña
            Editor->>Page: onSuccess()
            Page->>Page: protectedDestination y solicitar navegación
        else rechazo
            Service-->>Editor: LoginRequestError
            Editor-->>Page: mensaje y errores
            Page-->>Form: conservar captura recuperable
        end
    end
```

## Petición y contrato de acceso

**Identificador:** `DIA-VUE-SEQ-047`. Amplía `loginRequest` sin representar objetos internos de la biblioteca HTTP.

```mermaid
sequenceDiagram
    autonumber
    box Integración
    participant Service@{ "type": "boundary" } as auth<br/>Service.ts
    participant HTTP@{ "type": "boundary" } as apiClient.ts
    end
    box Sistema externo
    participant API@{ "type": "boundary" } as API del sistema
    end
    Service->>Service: recortar nombre y conservar contraseña
    Service->>HTTP: request con requiresAuth false y signal
    HTTP->>API: POST /api/auth/login
    API-->>HTTP: respuesta de acceso
    alt respuesta HTTP admitida
        HTTP-->>Service: cuerpo JSON
        alt code SUCCESS_LOGIN
            Service->>Service: resolver loginRequest sin valor
        else código inesperado
            Service->>Service: lanzar LoginRequestError INVALID_RESPONSE
        end
    else fallo HTTP o red
        HTTP-->>Service: ApiError
        Service->>Service: traducir 400, 401, 429, red o respuesta inválida
        Note over Service: Rechazar con LoginRequestError y campos cuando corresponde
    end
```

## Reglas y recuperación

Los espacios de contraseña se conservan; nombre se recorta al construir la solicitud. Un fallo de Storage no revoca un acceso ya confirmado. La [renovación y retorno](01-bootstrap-and-session.md) tienen secuencia propia.

## Evidencia

login.spec.ts, useLoginFormTest.ts y authServiceTest.ts. La [matriz por caso](../../../../testing/04-use-case-coverage.md) identifica alcance y límites, y el [registro CP](../../../../testing/03-test-cases.md) concreta datos y oráculos críticos.

## Fuentes de los participantes

[LoginForm.vue](../../../../../src/modules/auth/components/LoginForm.vue),
[LoginPage.vue](../../../../../src/modules/auth/pages/LoginPage.vue),
[useLoginForm.ts](../../../../../src/modules/auth/composables/useLoginForm.ts),
[authService.ts](../../../../../src/modules/auth/services/authService.ts),
[apiClient.ts](../../../../../src/shared/http/apiClient.ts).
