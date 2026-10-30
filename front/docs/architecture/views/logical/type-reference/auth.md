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

## LoginForm.defineEmits

**Fuente:** [src/modules/auth/components/LoginForm.vue](../../../../../src/modules/auth/components/LoginForm.vue) · línea 8, columna 26. **Declaración:** SFC contract.

**Definición completa:**

```typescript
LoginFormEmits
```

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [LoginFormEmits](../../../../../src/modules/auth/login.ts) | `type` |

## LoginFormOptions

**Fuente:** [src/modules/auth/composables/useLoginForm.ts](../../../../../src/modules/auth/composables/useLoginForm.ts) · línea 11, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `onSuccess` | `onSuccess: () => void;` |
| `request` | `request?: typeof loginRequest;` |

## LoginCredentials

**Fuente:** [src/modules/auth/login.ts](../../../../../src/modules/auth/login.ts) · línea 1, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `name` | `name: string;` |
| `password` | `password: string;` |

## LoginField

**Fuente:** [src/modules/auth/login.ts](../../../../../src/modules/auth/login.ts) · línea 6, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
keyof LoginCredentials
```

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [LoginCredentials](../../../../../src/modules/auth/login.ts) | `type` |

## LoginFieldErrors

**Fuente:** [src/modules/auth/login.ts](../../../../../src/modules/auth/login.ts) · línea 7, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
Partial<Record<LoginField, string>>
```

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [LoginField](../../../../../src/modules/auth/login.ts) | `type` |

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

## SessionUser

**Fuente:** [src/modules/auth/session.ts](../../../../../src/modules/auth/session.ts) · línea 6, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `id` | `id: string;` |
| `name` | `name: string;` |
| `permissions` | `permissions: readonly string[];` |

## AuthSession

**Fuente:** [src/modules/auth/session.ts](../../../../../src/modules/auth/session.ts) · línea 49, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
ReturnType<typeof createAuthSession>
```
