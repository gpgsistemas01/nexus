# Captura, login y navegación

**Casos relacionados:** CU-AUT-01.

## Secuencia aplicada

**Identificador:** `DIA-VUE-SEQ-003`.

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    box Interfaz
    participant Form@{ "type": "boundary" } as Login<br/>Form.vue
    end
    box Coordinación
    participant Page@{ "type": "control" } as Login<br/>Page.vue
    participant Editor@{ "type": "control" } as useLogin<br/>Form.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as auth<br/>Service.ts
    end
    U->>Form: nowrap: submit
    Form->>Page: nowrap: emit('submit')
    Page->>Editor: nowrap: submit()
    opt nowrap: !isSubmitting.value
        Editor->>Editor: nowrap: submitValidated()
        Editor->>Service: nowrap: request(credentials, controller.signal)
        Service-->>Editor: nowrap: undefined
        opt nowrap: !controller.signal.aborted
            Editor->>Editor: nowrap: setFieldValue('password', '', false)
            Editor->>Page: nowrap: onSuccess()
            Page->>Page: nowrap: protectedDestination(router,<br/>route.query.returnTo)
            Page->>Page: nowrap: router.replace(destination)
        end
    end
```

## Petición y contrato de acceso

**Identificador:** `DIA-VUE-SEQ-047`.

```mermaid
sequenceDiagram
    autonumber
    box Coordinación
    participant Editor@{ "type": "control" } as useLogin<br/>Form.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as auth<br/>Service.ts
    participant HTTP@{ "type": "boundary" } as apiClient.ts
    end
    box Sistema externo
    participant API@{ "type": "boundary" } as API del sistema
    end
    Service->>HTTP: nowrap: apiClient.request('/api/auth/login', {<br/>method: 'POST', data: { name:<br/>credentials.name.trim(), password:<br/>credentials.password }, signal,<br/>requiresAuth: false })
    HTTP->>API: nowrap: POST /api/auth/login
    API-->>HTTP: nowrap: { code }
    HTTP-->>Service: nowrap: data
    alt nowrap: data.code !== successCodeMessages.SUCCESS_LOGIN
        Service-->>Editor: nowrap: throw new LoginRequestError(<br/>LOGIN_MESSAGES.INVALID_RESPONSE)
    else
        Service-->>Editor: nowrap: undefined
    end
```

## catch(error) en el formulario

**Identificador:** `DIA-VUE-SEQ-054`.

```mermaid
sequenceDiagram
    autonumber
    box Interfaz
    participant Form@{ "type": "boundary" } as Login<br/>Form.vue
    end
    box Coordinación
    participant Page@{ "type": "control" } as Login<br/>Page.vue
    participant Editor@{ "type": "control" } as useLogin<br/>Form.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as auth<br/>Service.ts
    end
    Service-->>Editor: nowrap: throw error
    opt nowrap: !controller.signal.aborted
        Editor->>Editor: nowrap: message.value = error instanceof<br/>LoginRequestError ? error.message :<br/>LOGIN_MESSAGES.REQUEST_FAILED
        opt nowrap: error instanceof LoginRequestError
            loop nowrap: field of ['name', 'password']
                opt nowrap: error.fieldErrors[field]
                    Editor->>Editor: nowrap: setFieldError(field,<br/>error.fieldErrors[field])
                end
            end
        end
        Editor-->>Page: nowrap: { errors, message, isSubmitting }
        Page-->>Form: nowrap: { errors, message, isSubmitting }
    end
```

## catch(cause) en loginRequest

**Identificador:** `DIA-VUE-SEQ-055`.

```mermaid
sequenceDiagram
    autonumber
    box Coordinación
    participant Editor@{ "type": "control" } as useLogin<br/>Form.ts
    end
    box Integración
    participant Service@{ "type": "boundary" } as auth<br/>Service.ts
    participant HTTP@{ "type": "boundary" } as apiClient.ts
    end
    HTTP-->>Service: nowrap: throw cause
    alt nowrap: !(cause instanceof ApiError)
        Service-->>Editor: nowrap: throw cause
    else nowrap: cause.status === 401
        Service-->>Editor: nowrap: throw new LoginRequestError(<br/>errorMessages.LOGIN_ERROR)
    else nowrap: cause.status === 429
        Service-->>Editor: nowrap: throw new LoginRequestError(<br/>LOGIN_MESSAGES.TOO_MANY_ATTEMPTS)
    else nowrap: cause.status === 400
        Service-->>Editor: nowrap: throw new LoginRequestError(<br/>LOGIN_MESSAGES.INVALID_FIELDS,<br/>cause.fieldErrors)
    else nowrap: cause.code === 'NETWORK_ERROR'
        Service-->>Editor: nowrap: throw new LoginRequestError(<br/>LOGIN_MESSAGES.CONNECTION_FAILED)
    else nowrap: cause.code === 'INVALID_RESPONSE'
        Service-->>Editor: nowrap: throw new LoginRequestError(<br/>LOGIN_MESSAGES.INVALID_RESPONSE)
    else
        Service-->>Editor: nowrap: throw new LoginRequestError(<br/>LOGIN_MESSAGES.REQUEST_FAILED)
    end
```

## Fuentes de los participantes

[LoginForm.vue](../../../../../src/modules/auth/components/LoginForm.vue),
[LoginPage.vue](../../../../../src/modules/auth/pages/LoginPage.vue),
[useLoginForm.ts](../../../../../src/modules/auth/composables/useLoginForm.ts),
[authService.ts](../../../../../src/modules/auth/services/authService.ts),
[apiClient.ts](../../../../../src/shared/http/apiClient.ts).
