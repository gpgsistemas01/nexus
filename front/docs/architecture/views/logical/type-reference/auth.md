# Contratos TypeScript: auth

Generado con `npm run docs:generate`. No editar manualmente.

[Alcance y notación](index.md#alcance-y-notación).

## LoginForm.defineProps

**Fuente:** [src/modules/auth/components/LoginForm.vue](../../../../../src/modules/auth/components/LoginForm.vue) · línea 7, columna 13. **Declaración:** SFC contract.

**Definición completa:**

```typescript
LoginFormProps
```

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [LoginFormProps](../../../../../src/modules/auth/login.ts) | `type` |

**Figura:** `DIA-VUE-TS-AUTH-1-1`.

```mermaid
classDiagram
    direction LR
    class Subject["LoginForm.defineProps"] {
        <<SFC_contract>>
    }
    class R0["LoginFormProps"] {
        <<reference>>
    }
    Subject ..> R0 : type
```

## LoginForm.defineEmits

**Fuente:** [src/modules/auth/components/LoginForm.vue](../../../../../src/modules/auth/components/LoginForm.vue) · línea 8, columna 26. **Declaración:** SFC contract.

**Definición completa:**

```typescript
LoginFormEmits
```

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [LoginFormEmits](../../../../../src/modules/auth/login.ts) | `type` |

**Figura:** `DIA-VUE-TS-AUTH-2-1`.

```mermaid
classDiagram
    direction LR
    class Subject["LoginForm.defineEmits"] {
        <<SFC_contract>>
    }
    class R0["LoginFormEmits"] {
        <<reference>>
    }
    Subject ..> R0 : type
```

## LoginFormOptions

**Fuente:** [src/modules/auth/composables/useLoginForm.ts](../../../../../src/modules/auth/composables/useLoginForm.ts) · línea 11, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `onSuccess` | `onSuccess: () => void;` |
| `request` | `request?: typeof loginRequest;` |

**Figura:** `DIA-VUE-TS-AUTH-3-1`.

```mermaid
classDiagram
    direction LR
    class Subject["LoginFormOptions"] {
        <<interface>>
        onSuccess: callback
        request?: typeof loginRequest
    }
```

## LoginCredentials

**Fuente:** [src/modules/auth/login.ts](../../../../../src/modules/auth/login.ts) · línea 1, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `name` | `name: string;` |
| `password` | `password: string;` |

**Figura:** `DIA-VUE-TS-AUTH-4-1`.

```mermaid
classDiagram
    direction LR
    class Subject["LoginCredentials"] {
        <<interface>>
        name: string
        password: string
    }
```

## LoginField

**Fuente:** [src/modules/auth/login.ts](../../../../../src/modules/auth/login.ts) · línea 6, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
keyof LoginCredentials
```

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [LoginCredentials](../../../../../src/modules/auth/login.ts) | `type` |

**Figura:** `DIA-VUE-TS-AUTH-5-1`.

```mermaid
classDiagram
    direction LR
    class Subject["LoginField"] {
        <<type>>
    }
    class R0["LoginCredentials"] {
        <<reference>>
    }
    Subject ..> R0 : type
```

## LoginFieldErrors

**Fuente:** [src/modules/auth/login.ts](../../../../../src/modules/auth/login.ts) · línea 7, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
Partial<Record<LoginField, string>>
```

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [LoginFieldErrors.expanded](../../../../../src/modules/auth/login.ts) | `evaluated structure` |
| dependency | [LoginField](../../../../../src/modules/auth/login.ts) | `type` |

**Figura:** `DIA-VUE-TS-AUTH-6-1`.

```mermaid
classDiagram
    direction LR
    class Subject["LoginFieldErrors"] {
        <<type>>
    }
    class R0["LoginFieldErrors.expanded"] {
        <<reference>>
    }
    class R1["LoginField"] {
        <<reference>>
    }
    Subject ..> R0 : evaluated structure
    Subject ..> R1 : type
```

## LoginFormProps

**Fuente:** [src/modules/auth/login.ts](../../../../../src/modules/auth/login.ts) · línea 9, columna 1. **Declaración:** interface.

**Extensión/implementación:** `extends LoginCredentials`.

| Miembro | Firma completa |
| --- | --- |
| `errors` | `errors: LoginFieldErrors;` |
| `isPasswordVisible` | `isPasswordVisible: boolean;` |
| `shouldRememberUser` | `shouldRememberUser: boolean;` |
| `isSubmitting` | `isSubmitting: boolean;` |
| `message` | `message: string;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| inheritance | [LoginCredentials](../../../../../src/modules/auth/login.ts) | `extends` |
| dependency | [LoginFieldErrors](../../../../../src/modules/auth/login.ts) | `errors` |

**Figura:** `DIA-VUE-TS-AUTH-7-1`.

```mermaid
classDiagram
    direction LR
    class Subject["LoginFormProps"] {
        <<interface>>
        errors: LoginFieldErrors
        isPasswordVisible: boolean
        shouldRememberUser: boolean
        isSubmitting: boolean
        message: string
    }
    class R0["LoginCredentials"] {
        <<reference>>
    }
    class R1["LoginFieldErrors"] {
        <<reference>>
    }
    R0 <|-- Subject : extends
    Subject ..> R1 : errors
```

## LoginFormEmits

**Fuente:** [src/modules/auth/login.ts](../../../../../src/modules/auth/login.ts) · línea 17, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `update:name` | `'update:name': [name: string];` |
| `update:password` | `'update:password': [password: string];` |
| `update:shouldRememberUser` | `'update:shouldRememberUser': [shouldRememberUser: boolean];` |
| `blur` | `blur: [field: LoginField];` |
| `togglePassword` | `togglePassword: [];` |
| `submit` | `submit: [];` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [LoginField](../../../../../src/modules/auth/login.ts) | `blur` |

**Figura:** `DIA-VUE-TS-AUTH-8-1`.

```mermaid
classDiagram
    direction LR
    class Subject["LoginFormEmits"] {
        <<interface>>
        update:name: tuple
        update:password: tuple
        update:shouldRememberUser: tuple
        blur: tuple
        togglePassword: tuple
        submit: tuple
    }
    class R0["LoginField"] {
        <<reference>>
    }
    Subject ..> R0 : blur
```

## LoginRequestError

**Fuente:** [src/modules/auth/services/authService.ts](../../../../../src/modules/auth/services/authService.ts) · línea 8, columna 1. **Declaración:** class.

**Extensión/implementación:** `extends Error`.

| Miembro | Firma completa |
| --- | --- |
| `constructor` | `constructor( message: string, public fieldErrors: LoginFieldErrors = {}, )` |
| `fieldErrors` | `public fieldErrors: LoginFieldErrors = {}` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [LoginFieldErrors](../../../../../src/modules/auth/login.ts) | `constructor.fieldErrors` |
| dependency | [LoginFieldErrors](../../../../../src/modules/auth/login.ts) | `fieldErrors` |

**Figura:** `DIA-VUE-TS-AUTH-9-1`.

```mermaid
classDiagram
    direction LR
    class Subject["LoginRequestError"] {
        <<class>>
        constructor(...)
        fieldErrors: LoginFieldErrors
    }
    class R0["LoginFieldErrors"] {
        <<reference>>
    }
    Subject ..> R0 : constructor.fieldErrors
    Subject ..> R0 : fieldErrors
```

## apiClient.request@23:46

**Fuente:** [src/modules/auth/services/authService.ts](../../../../../src/modules/auth/services/authService.ts) · línea 23, columna 46. **Declaración:** inline object.

| Miembro | Firma completa |
| --- | --- |
| `code` | `code: string` |

**Figura:** `DIA-VUE-TS-AUTH-10-1`.

```mermaid
classDiagram
    direction LR
    class Subject["apiClient.request@23:46"] {
        <<inline_object>>
        code: string
    }
```

## SessionUser

**Fuente:** [src/modules/auth/session.ts](../../../../../src/modules/auth/session.ts) · línea 6, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `id` | `id: string;` |
| `name` | `name: string;` |
| `permissions` | `permissions: readonly string[];` |

**Figura:** `DIA-VUE-TS-AUTH-11-1`.

```mermaid
classDiagram
    direction LR
    class Subject["SessionUser"] {
        <<interface>>
        id: string
        name: string
        permissions: readonly string[]
    }
```

## request@17:29

**Fuente:** [src/modules/auth/session.ts](../../../../../src/modules/auth/session.ts) · línea 17, columna 29. **Declaración:** inline object.

| Miembro | Firma completa |
| --- | --- |
| `user` | `user: unknown` |

**Figura:** `DIA-VUE-TS-AUTH-12-1`.

```mermaid
classDiagram
    direction LR
    class Subject["request@17:29"] {
        <<inline_object>>
        user: unknown
    }
```

## AuthSession

**Fuente:** [src/modules/auth/session.ts](../../../../../src/modules/auth/session.ts) · línea 49, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
ReturnType<typeof createAuthSession>
```

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [AuthSession.expanded](../../../../../src/modules/auth/session.ts) | `evaluated structure` |

**Figura:** `DIA-VUE-TS-AUTH-13-1`.

```mermaid
classDiagram
    direction LR
    class Subject["AuthSession"] {
        <<type>>
    }
    class R0["AuthSession.expanded"] {
        <<reference>>
    }
    Subject ..> R0 : evaluated structure
```

## useLoginForm.return

**Fuente:** [src/modules/auth/composables/useLoginForm.ts](../../../../../src/modules/auth/composables/useLoginForm.ts) · línea 16, columna 29. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `values` | `"values": LoginCredentials;` |
| `name` | `"name": Ref<string, string>;` |
| `password` | `"password": Ref<string, string>;` |
| `errors` | `"errors": ComputedRef<Partial<Record<"" \| "name" \| "password", string \| undefined>>>;` |
| `isSubmitting` | `"isSubmitting": Ref<boolean, boolean>;` |
| `isPasswordVisible` | `"isPasswordVisible": Ref<boolean, boolean>;` |
| `shouldRememberUser` | `"shouldRememberUser": Ref<boolean, boolean>;` |
| `message` | `"message": Ref<string, string>;` |
| `updateField` | `"updateField": (field: keyof LoginCredentials, value: string) => void;` |
| `blurField` | `"blurField": (field: keyof LoginCredentials) => Promise<unknown> \| undefined;` |
| `submit` | `"submit": () => Promise<Promise<void> \| undefined> \| undefined;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [LoginCredentials](../../../../../src/modules/auth/login.ts) | `values` |
| dependency | [LoginCredentials](../../../../../src/modules/auth/login.ts) | `updateField` |
| dependency | [LoginCredentials](../../../../../src/modules/auth/login.ts) | `blurField` |

**Figura:** `DIA-VUE-TS-AUTH-14-1`.

```mermaid
classDiagram
    direction LR
    class Subject["useLoginForm.return"] {
        <<inferred_return>>
        values: LoginCredentials
        name: Ref~string, string~
        password: Ref~string, string~
        errors: complex
        isSubmitting: Ref~boolean, boolean~
        isPasswordVisible: Ref~boolean, boolean~
        shouldRememberUser: Ref~boolean, boolean~
        message: Ref~string, string~
        updateField: callback
        blurField: callback
        submit: callback
    }
    class R0["LoginCredentials"] {
        <<reference>>
    }
    Subject "1" --> "1" R0 : values
    Subject ..> R0 : updateField
    Subject ..> R0 : blurField
```

## LoginFieldErrors.expanded

**Fuente:** [src/modules/auth/login.ts](../../../../../src/modules/auth/login.ts) · línea 7, columna 1. **Declaración:** evaluated alias.

| Miembro | Firma completa |
| --- | --- |
| `name` | `"name"?: string \| undefined;` |
| `password` | `"password"?: string \| undefined;` |

**Figura:** `DIA-VUE-TS-AUTH-15-1`.

```mermaid
classDiagram
    direction LR
    class Subject["LoginFieldErrors.expanded"] {
        <<evaluated_alias>>
        name?: string | undefined
        password?: string | undefined
    }
```

## createAuthSession.return

**Fuente:** [src/modules/auth/session.ts](../../../../../src/modules/auth/session.ts) · línea 12, columna 34. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `user` | `"user": Readonly<Ref<{ readonly id: string; readonly name: string; readonly permissions: readonly string[]; } \| null, { readonly id: string; readonly name: string; readonly permissions: readonly string[]; } \| null>>;` |
| `load` | `"load": () => Promise<SessionUser>;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [createAuthSession.return.user.shape1](../../../../../src/modules/auth/session.ts) | `user` |
| dependency | [createAuthSession.return.user.shape2](../../../../../src/modules/auth/session.ts) | `user` |
| dependency | [SessionUser](../../../../../src/modules/auth/session.ts) | `load` |

**Figura:** `DIA-VUE-TS-AUTH-16-1`.

```mermaid
classDiagram
    direction LR
    class Subject["createAuthSession.return"] {
        <<inferred_return>>
        user: object
        load: callback
    }
    class R0["createAuthSession.return.<br/>user.shape1"] {
        <<reference>>
    }
    class R1["createAuthSession.return.<br/>user.shape2"] {
        <<reference>>
    }
    class R2["SessionUser"] {
        <<reference>>
    }
    Subject ..> R0 : user
    Subject ..> R1 : user
    Subject ..> R2 : load
```

## createAuthSession.return.user.shape1

**Fuente:** [src/modules/auth/session.ts](../../../../../src/modules/auth/session.ts) · línea 12, columna 34. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `id` | `readonly id: string;` |
| `name` | `readonly name: string;` |
| `permissions` | `readonly permissions: readonly string[];` |

**Figura:** `DIA-VUE-TS-AUTH-17-1`.

```mermaid
classDiagram
    direction LR
    class Subject["createAuthSession.return.<br/>user.shape1"] {
        <<inferred_object>>
        id: string
        name: string
        permissions: readonly string[]
    }
```

## createAuthSession.return.user.shape2

**Fuente:** [src/modules/auth/session.ts](../../../../../src/modules/auth/session.ts) · línea 12, columna 34. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `id` | `readonly id: string;` |
| `name` | `readonly name: string;` |
| `permissions` | `readonly permissions: readonly string[];` |

**Figura:** `DIA-VUE-TS-AUTH-18-1`.

```mermaid
classDiagram
    direction LR
    class Subject["createAuthSession.return.<br/>user.shape2"] {
        <<inferred_object>>
        id: string
        name: string
        permissions: readonly string[]
    }
```

## AuthSession.expanded

**Fuente:** [src/modules/auth/session.ts](../../../../../src/modules/auth/session.ts) · línea 49, columna 1. **Declaración:** evaluated alias.

| Miembro | Firma completa |
| --- | --- |
| `user` | `"user": Readonly<Ref<{ readonly id: string; readonly name: string; readonly permissions: readonly string[]; } \| null, { readonly id: string; readonly name: string; readonly permissions: readonly string[]; } \| null>>;` |
| `load` | `"load": () => Promise<SessionUser>;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [AuthSession.expanded.user.shape1](../../../../../src/modules/auth/session.ts) | `user` |
| dependency | [AuthSession.expanded.user.shape2](../../../../../src/modules/auth/session.ts) | `user` |
| dependency | [SessionUser](../../../../../src/modules/auth/session.ts) | `load` |

**Figura:** `DIA-VUE-TS-AUTH-19-1`.

```mermaid
classDiagram
    direction LR
    class Subject["AuthSession.expanded"] {
        <<evaluated_alias>>
        user: object
        load: callback
    }
    class R0["AuthSession.expanded.user.<br/>shape1"] {
        <<reference>>
    }
    class R1["AuthSession.expanded.user.<br/>shape2"] {
        <<reference>>
    }
    class R2["SessionUser"] {
        <<reference>>
    }
    Subject ..> R0 : user
    Subject ..> R1 : user
    Subject ..> R2 : load
```

## AuthSession.expanded.user.shape1

**Fuente:** [src/modules/auth/session.ts](../../../../../src/modules/auth/session.ts) · línea 49, columna 1. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `id` | `readonly id: string;` |
| `name` | `readonly name: string;` |
| `permissions` | `readonly permissions: readonly string[];` |

**Figura:** `DIA-VUE-TS-AUTH-20-1`.

```mermaid
classDiagram
    direction LR
    class Subject["AuthSession.expanded.user.<br/>shape1"] {
        <<inferred_object>>
        id: string
        name: string
        permissions: readonly string[]
    }
```

## AuthSession.expanded.user.shape2

**Fuente:** [src/modules/auth/session.ts](../../../../../src/modules/auth/session.ts) · línea 49, columna 1. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `id` | `readonly id: string;` |
| `name` | `readonly name: string;` |
| `permissions` | `readonly permissions: readonly string[];` |

**Figura:** `DIA-VUE-TS-AUTH-21-1`.

```mermaid
classDiagram
    direction LR
    class Subject["AuthSession.expanded.user.<br/>shape2"] {
        <<inferred_object>>
        id: string
        name: string
        permissions: readonly string[]
    }
```
