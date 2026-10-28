# Contratos TypeScript: identity

Generado con `npm run docs:generate`. No editar manualmente.

Cada figura incluye hasta ocho miembros y dos relaciones; las partes reúnen el contrato completo.
Los destinos sin atributos son referencias: su definición completa aparece en su propia ficha.
Los objetos inline declarados muestran contexto, línea y columna. Las formas inferidas usan shapeN dentro del contrato padre; su fuente apunta al export o función original. No son clases instanciadas.

[Lectura y cobertura](index.md).

## IdentityTable.defineProps

**Fuente:** [src/modules/identity/components/IdentityTable.vue](../../../../../src/modules/identity/components/IdentityTable.vue) · línea 11, columna 27. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `resource` | `resource: IdentityResource;` |
| `rows` | `rows: IdentityEntry[];` |
| `total` | `total: number;` |
| `query` | `query: IdentityQuery;` |
| `isLoading` | `isLoading: boolean;` |
| `canEdit` | `canEdit: boolean;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [IdentityResource](../../../../../src/modules/identity/identity.ts) | `resource` |
| association | [IdentityEntry](../../../../../src/modules/identity/identity.ts) | `rows` |
| association | [IdentityQuery](../../../../../src/modules/identity/identity.ts) | `query` |

**Figura:** `DIA-VUE-TS-IDENTITY-1-1`. Parte 1/2.

```mermaid
classDiagram
    direction TB
    class Subject["IdentityTable.defineProps"] {
        <<SFC_contract>>
        resource: IdentityResource
        rows: IdentityEntry[]
        total: number
        query: IdentityQuery
        isLoading: boolean
        canEdit: boolean
    }
    class R0["IdentityResource"] {
        <<reference>>
    }
    class R1["IdentityEntry"] {
        <<reference>>
    }
    Subject ..> R0 : resource
    Subject "1" --> "0..*" R1 : rows
```

**Figura:** `DIA-VUE-TS-IDENTITY-1-2`. Parte 2/2.

```mermaid
classDiagram
    direction TB
    class Subject["IdentityTable.defineProps"] {
        <<SFC_contract>>
    }
    class R0["IdentityQuery"] {
        <<reference>>
    }
    Subject "1" --> "1" R0 : query
```

## IdentityTable.defineEmits

**Fuente:** [src/modules/identity/components/IdentityTable.vue](../../../../../src/modules/identity/components/IdentityTable.vue) · línea 19, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `edit` | `edit: [row: IdentityEntry];` |
| `password` | `password: [row: IdentityEntry];` |
| `query` | `query: [changes: Partial<IdentityQuery>];` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [IdentityEntry](../../../../../src/modules/identity/identity.ts) | `edit` |
| dependency | [IdentityEntry](../../../../../src/modules/identity/identity.ts) | `password` |
| dependency | `Partial` | `query` |
| dependency | [IdentityQuery](../../../../../src/modules/identity/identity.ts) | `query` |

**Figura:** `DIA-VUE-TS-IDENTITY-2-1`. Parte 1/2.

```mermaid
classDiagram
    direction TB
    class Subject["IdentityTable.defineEmits"] {
        <<SFC_contract>>
        edit: tuple
        password: tuple
        query: tuple
    }
    class R0["IdentityEntry"] {
        <<reference>>
    }
    Subject ..> R0 : edit
    Subject ..> R0 : password
```

**Figura:** `DIA-VUE-TS-IDENTITY-2-2`. Parte 2/2.

```mermaid
classDiagram
    direction TB
    class Subject["IdentityTable.defineEmits"] {
        <<SFC_contract>>
    }
    class R0["Partial"] {
        <<reference>>
    }
    class R1["IdentityQuery"] {
        <<reference>>
    }
    Subject ..> R0 : query
    Subject ..> R1 : query
```

## PersonForm.defineProps

**Fuente:** [src/modules/identity/components/PersonForm.vue](../../../../../src/modules/identity/components/PersonForm.vue) · línea 13, columna 13. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `title` | `title: string;` |
| `values` | `values: PersonValues;` |
| `errors` | `errors: { fullName?: string; accesses?: string };` |
| `departmentId` | `departmentId: string;` |
| `roleId` | `roleId: string;` |
| `accessError` | `accessError: string;` |
| `options` | `options: OrganizationState;` |
| `message` | `message: string;` |
| `isSubmitting` | `isSubmitting: boolean;` |
| `isConflicted` | `isConflicted: boolean;` |
| `isEditing` | `isEditing: boolean;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [PersonValues](../../../../../src/modules/identity/identity.ts) | `values` |
| association | [PersonForm.errors@16:13](../../../../../src/modules/identity/components/PersonForm.vue) | `errors` |
| dependency | [OrganizationState](../../../../../src/shared/lookup.ts) | `options` |

**Figura:** `DIA-VUE-TS-IDENTITY-3-1`. Parte 1/2.

```mermaid
classDiagram
    direction TB
    class Subject["PersonForm.defineProps"] {
        <<SFC_contract>>
        title: string
        values: PersonValues
        errors: object
        departmentId: string
        roleId: string
        accessError: string
        options: OrganizationState
        message: string
    }
    class R0["PersonValues"] {
        <<reference>>
    }
    class R1["PersonForm.errors@16:13"] {
        <<reference>>
    }
    Subject "1" --> "1" R0 : values
    Subject "1" --> "1" R1 : errors
```

**Figura:** `DIA-VUE-TS-IDENTITY-3-2`. Parte 2/2.

```mermaid
classDiagram
    direction TB
    class Subject["PersonForm.defineProps"] {
        <<SFC_contract>>
        isSubmitting: boolean
        isConflicted: boolean
        isEditing: boolean
    }
    class R0["OrganizationState"] {
        <<reference>>
    }
    Subject ..> R0 : options
```

## PersonForm.errors@16:13

**Fuente:** [src/modules/identity/components/PersonForm.vue](../../../../../src/modules/identity/components/PersonForm.vue) · línea 16, columna 13. **Declaración:** inline object.

| Miembro | Firma completa |
| --- | --- |
| `fullName` | `fullName?: string;` |
| `accesses` | `accesses?: string` |

**Figura:** `DIA-VUE-TS-IDENTITY-4-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["PersonForm.errors@16:13"] {
        <<inline_object>>
        fullName?: string
        accesses?: string
    }
```

## PersonForm.defineEmits

**Fuente:** [src/modules/identity/components/PersonForm.vue](../../../../../src/modules/identity/components/PersonForm.vue) · línea 26, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `update` | `update: [field: 'fullName', value: string];` |
| `blur` | `blur: [field: 'fullName'];` |
| `draft` | `draft: [field: 'departmentId' \| 'roleId', value: string];` |
| `add` | `add: [];` |
| `remove` | `remove: [departmentId: string];` |
| `search` | `search: [resource: OrganizationResource, value: string];` |
| `more` | `more: [resource: OrganizationResource];` |
| `retry` | `retry: [resource: OrganizationResource];` |
| `submit` | `submit: [];` |
| `close` | `close: [];` |
| `reload` | `reload: [];` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [OrganizationResource](../../../../../src/shared/lookup.ts) | `search` |
| dependency | [OrganizationResource](../../../../../src/shared/lookup.ts) | `more` |
| dependency | [OrganizationResource](../../../../../src/shared/lookup.ts) | `retry` |

**Figura:** `DIA-VUE-TS-IDENTITY-5-1`. Parte 1/2.

```mermaid
classDiagram
    direction TB
    class Subject["PersonForm.defineEmits"] {
        <<SFC_contract>>
        update: tuple
        blur: tuple
        draft: tuple
        add: tuple
        remove: tuple
        search: tuple
        more: tuple
        retry: tuple
    }
    class R0["OrganizationResource"] {
        <<reference>>
    }
    Subject ..> R0 : search
    Subject ..> R0 : more
```

**Figura:** `DIA-VUE-TS-IDENTITY-5-2`. Parte 2/2.

```mermaid
classDiagram
    direction TB
    class Subject["PersonForm.defineEmits"] {
        <<SFC_contract>>
        submit: tuple
        close: tuple
        reload: tuple
    }
    class R0["OrganizationResource"] {
        <<reference>>
    }
    Subject ..> R0 : retry
```

## UserForm.defineProps

**Fuente:** [src/modules/identity/components/UserForm.vue](../../../../../src/modules/identity/components/UserForm.vue) · línea 8, columna 13. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `action` | `action: 'create' \| 'edit' \| 'password';` |
| `title` | `title: string;` |
| `values` | `values: UserValues;` |
| `errors` | `errors: Partial<Record<UserField, string>>;` |
| `options` | `options: OrganizationState;` |
| `row` | `row?: IdentityEntry;` |
| `message` | `message: string;` |
| `isSubmitting` | `isSubmitting: boolean;` |
| `isConflicted` | `isConflicted: boolean;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [UserValues](../../../../../src/modules/identity/identity.ts) | `values` |
| dependency | `Partial` | `errors` |
| dependency | `Record` | `errors` |
| dependency | [UserField](../../../../../src/modules/identity/identity.ts) | `errors` |
| dependency | [OrganizationState](../../../../../src/shared/lookup.ts) | `options` |
| association | [IdentityEntry](../../../../../src/modules/identity/identity.ts) | `row` |

**Figura:** `DIA-VUE-TS-IDENTITY-6-1`. Parte 1/3.

```mermaid
classDiagram
    direction TB
    class Subject["UserForm.defineProps"] {
        <<SFC_contract>>
        action: 'create' | 'edit' | 'password'
        title: string
        values: UserValues
        errors: Partial~Record~UserField, string~~
        options: OrganizationState
        row?: IdentityEntry
        message: string
        isSubmitting: boolean
    }
    class R0["UserValues"] {
        <<reference>>
    }
    class R1["Partial"] {
        <<reference>>
    }
    Subject "1" --> "1" R0 : values
    Subject ..> R1 : errors
```

**Figura:** `DIA-VUE-TS-IDENTITY-6-2`. Parte 2/3.

```mermaid
classDiagram
    direction TB
    class Subject["UserForm.defineProps"] {
        <<SFC_contract>>
        isConflicted: boolean
    }
    class R0["Record"] {
        <<reference>>
    }
    class R1["UserField"] {
        <<reference>>
    }
    Subject ..> R0 : errors
    Subject ..> R1 : errors
```

**Figura:** `DIA-VUE-TS-IDENTITY-6-3`. Parte 3/3.

```mermaid
classDiagram
    direction TB
    class Subject["UserForm.defineProps"] {
        <<SFC_contract>>
    }
    class R0["OrganizationState"] {
        <<reference>>
    }
    class R1["IdentityEntry"] {
        <<reference>>
    }
    Subject ..> R0 : options
    Subject "1" --> "0..1" R1 : row
```

## UserForm.defineEmits

**Fuente:** [src/modules/identity/components/UserForm.vue](../../../../../src/modules/identity/components/UserForm.vue) · línea 19, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `update` | `update: [field: UserField, value: string];` |
| `blur` | `blur: [field: UserField];` |
| `submit` | `submit: [];` |
| `close` | `close: [];` |
| `reload` | `reload: [];` |
| `search` | `search: [resource: OrganizationResource, value: string];` |
| `more` | `more: [resource: OrganizationResource];` |
| `retry` | `retry: [resource: OrganizationResource];` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [UserField](../../../../../src/modules/identity/identity.ts) | `update` |
| dependency | [UserField](../../../../../src/modules/identity/identity.ts) | `blur` |
| dependency | [OrganizationResource](../../../../../src/shared/lookup.ts) | `search` |
| dependency | [OrganizationResource](../../../../../src/shared/lookup.ts) | `more` |
| dependency | [OrganizationResource](../../../../../src/shared/lookup.ts) | `retry` |

**Figura:** `DIA-VUE-TS-IDENTITY-7-1`. Parte 1/3.

```mermaid
classDiagram
    direction TB
    class Subject["UserForm.defineEmits"] {
        <<SFC_contract>>
        update: tuple
        blur: tuple
        submit: tuple
        close: tuple
        reload: tuple
        search: tuple
        more: tuple
        retry: tuple
    }
    class R0["UserField"] {
        <<reference>>
    }
    Subject ..> R0 : update
    Subject ..> R0 : blur
```

**Figura:** `DIA-VUE-TS-IDENTITY-7-2`. Parte 2/3.

```mermaid
classDiagram
    direction TB
    class Subject["UserForm.defineEmits"] {
        <<SFC_contract>>
    }
    class R0["OrganizationResource"] {
        <<reference>>
    }
    Subject ..> R0 : search
    Subject ..> R0 : more
```

**Figura:** `DIA-VUE-TS-IDENTITY-7-3`. Parte 3/3.

```mermaid
classDiagram
    direction TB
    class Subject["UserForm.defineEmits"] {
        <<SFC_contract>>
    }
    class R0["OrganizationResource"] {
        <<reference>>
    }
    Subject ..> R0 : retry
```

## usePersonEditor.options@12:42

**Fuente:** [src/modules/identity/composables/usePersonEditor.ts](../../../../../src/modules/identity/composables/usePersonEditor.ts) · línea 12, columna 42. **Declaración:** inline object.

| Miembro | Firma completa |
| --- | --- |
| `target` | `target: PersonTarget;` |
| `permissions` | `permissions: readonly string[];` |
| `onSaved` | `onSaved: () => void;` |
| `onDenied` | `onDenied: (status: number) => void;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [PersonTarget](../../../../../src/modules/identity/identity.ts) | `target` |

**Figura:** `DIA-VUE-TS-IDENTITY-8-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["usePersonEditor.<br/>options@12:42"] {
        <<inline_object>>
        target: PersonTarget
        permissions: readonly string[]
        onSaved: callback
        onDenied: callback
    }
    class R0["PersonTarget"] {
        <<reference>>
    }
    Subject ..> R0 : target
```

## useUserEditor.options@10:40

**Fuente:** [src/modules/identity/composables/useUserEditor.ts](../../../../../src/modules/identity/composables/useUserEditor.ts) · línea 10, columna 40. **Declaración:** inline object.

| Miembro | Firma completa |
| --- | --- |
| `target` | `target: IdentityTarget;` |
| `permissions` | `permissions: readonly string[];` |
| `onSaved` | `onSaved: () => void;` |
| `onDenied` | `onDenied: (status: number) => void;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [IdentityTarget](../../../../../src/modules/identity/identity.ts) | `target` |

**Figura:** `DIA-VUE-TS-IDENTITY-9-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["useUserEditor.options@10:40"] {
        <<inline_object>>
        target: IdentityTarget
        permissions: readonly string[]
        onSaved: callback
        onDenied: callback
    }
    class R0["IdentityTarget"] {
        <<reference>>
    }
    Subject ..> R0 : target
```

## IdentityQuery

**Fuente:** [src/modules/identity/identity.ts](../../../../../src/modules/identity/identity.ts) · línea 4, columna 1. **Declaración:** interface.

**Extensión/implementación:** `extends RecordQuery`.

| Miembro | Firma completa |
| --- | --- |
| `department` | `department: string;` |
| `role` | `role: string;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| inheritance | [RecordQuery](../../../../../src/shared/list.ts) | `extends` |

**Figura:** `DIA-VUE-TS-IDENTITY-10-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["IdentityQuery"] {
        <<interface>>
        department: string
        role: string
    }
    class R0["RecordQuery"] {
        <<reference>>
    }
    R0 <|-- Subject : extends
```

## IdentityResource

**Fuente:** [src/modules/identity/identity.ts](../../../../../src/modules/identity/identity.ts) · línea 9, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
'persons' | 'users'
```

**Figura:** `DIA-VUE-TS-IDENTITY-11-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["IdentityResource"] {
        <<type>>
    }
```

## PersonAccess

**Fuente:** [src/modules/identity/identity.ts](../../../../../src/modules/identity/identity.ts) · línea 10, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `departmentId` | `departmentId: string;` |
| `roleId` | `roleId: string;` |
| `departmentName` | `departmentName: string;` |
| `roleName` | `roleName: string;` |

**Figura:** `DIA-VUE-TS-IDENTITY-12-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["PersonAccess"] {
        <<interface>>
        departmentId: string
        roleId: string
        departmentName: string
        roleName: string
    }
```

## IdentityEntry

**Fuente:** [src/modules/identity/identity.ts](../../../../../src/modules/identity/identity.ts) · línea 16, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `id` | `id: string;` |
| `version` | `version: number;` |
| `name` | `name: string;` |
| `personName` | `personName: string;` |
| `departmentId` | `departmentId: string;` |
| `roleId` | `roleId: string;` |
| `departmentName` | `departmentName: string;` |
| `roleName` | `roleName: string;` |
| `accesses` | `accesses: PersonAccess[];` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [PersonAccess](../../../../../src/modules/identity/identity.ts) | `accesses` |

**Figura:** `DIA-VUE-TS-IDENTITY-13-1`. Parte 1/2.

```mermaid
classDiagram
    direction TB
    class Subject["IdentityEntry"] {
        <<interface>>
        id: string
        version: number
        name: string
        personName: string
        departmentId: string
        roleId: string
        departmentName: string
        roleName: string
    }
    class R0["PersonAccess"] {
        <<reference>>
    }
    Subject "1" --> "0..*" R0 : accesses
```

**Figura:** `DIA-VUE-TS-IDENTITY-13-2`. Parte 2/2.

```mermaid
classDiagram
    direction TB
    class Subject["IdentityEntry"] {
        <<interface>>
        accesses: PersonAccess[]
    }
```

## PersonValues

**Fuente:** [src/modules/identity/identity.ts](../../../../../src/modules/identity/identity.ts) · línea 27, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `fullName` | `fullName: string;` |
| `accesses` | `accesses: PersonAccess[];` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [PersonAccess](../../../../../src/modules/identity/identity.ts) | `accesses` |

**Figura:** `DIA-VUE-TS-IDENTITY-14-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["PersonValues"] {
        <<interface>>
        fullName: string
        accesses: PersonAccess[]
    }
    class R0["PersonAccess"] {
        <<reference>>
    }
    Subject "1" --> "0..*" R0 : accesses
```

## UserValues

**Fuente:** [src/modules/identity/identity.ts](../../../../../src/modules/identity/identity.ts) · línea 31, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `name` | `name: string;` |
| `password` | `password: string;` |
| `departmentId` | `departmentId: string;` |
| `roleId` | `roleId: string;` |

**Figura:** `DIA-VUE-TS-IDENTITY-15-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["UserValues"] {
        <<interface>>
        name: string
        password: string
        departmentId: string
        roleId: string
    }
```

## UserField

**Fuente:** [src/modules/identity/identity.ts](../../../../../src/modules/identity/identity.ts) · línea 37, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
keyof UserValues
```

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [UserValues](../../../../../src/modules/identity/identity.ts) | `type` |

**Figura:** `DIA-VUE-TS-IDENTITY-16-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["UserField"] {
        <<type>>
    }
    class R0["UserValues"] {
        <<reference>>
    }
    Subject ..> R0 : type
```

## PersonTarget

**Fuente:** [src/modules/identity/identity.ts](../../../../../src/modules/identity/identity.ts) · línea 38, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
{ action: 'create' } | { action: 'edit'; row: IdentityEntry }
```

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [PersonTarget@38:28](../../../../../src/modules/identity/identity.ts) | `type` |
| dependency | [PersonTarget@38:51](../../../../../src/modules/identity/identity.ts) | `type` |

**Figura:** `DIA-VUE-TS-IDENTITY-17-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["PersonTarget"] {
        <<type>>
    }
    class R0["PersonTarget@38:28"] {
        <<reference>>
    }
    class R1["PersonTarget@38:51"] {
        <<reference>>
    }
    Subject ..> R0 : type
    Subject ..> R1 : type
```

## PersonTarget@38:28

**Fuente:** [src/modules/identity/identity.ts](../../../../../src/modules/identity/identity.ts) · línea 38, columna 28. **Declaración:** inline object.

| Miembro | Firma completa |
| --- | --- |
| `action` | `action: 'create'` |

**Figura:** `DIA-VUE-TS-IDENTITY-18-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["PersonTarget@38:28"] {
        <<inline_object>>
        action: 'create'
    }
```

## PersonTarget@38:51

**Fuente:** [src/modules/identity/identity.ts](../../../../../src/modules/identity/identity.ts) · línea 38, columna 51. **Declaración:** inline object.

| Miembro | Firma completa |
| --- | --- |
| `action` | `action: 'edit';` |
| `row` | `row: IdentityEntry` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [IdentityEntry](../../../../../src/modules/identity/identity.ts) | `row` |

**Figura:** `DIA-VUE-TS-IDENTITY-19-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["PersonTarget@38:51"] {
        <<inline_object>>
        action: 'edit'
        row: IdentityEntry
    }
    class R0["IdentityEntry"] {
        <<reference>>
    }
    Subject "1" --> "1" R0 : row
```

## IdentityTarget

**Fuente:** [src/modules/identity/identity.ts](../../../../../src/modules/identity/identity.ts) · línea 39, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
PersonTarget | { action: 'password'; row: IdentityEntry }
```

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [PersonTarget](../../../../../src/modules/identity/identity.ts) | `type` |
| dependency | [IdentityTarget@39:45](../../../../../src/modules/identity/identity.ts) | `type` |

**Figura:** `DIA-VUE-TS-IDENTITY-20-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["IdentityTarget"] {
        <<type>>
    }
    class R0["PersonTarget"] {
        <<reference>>
    }
    class R1["IdentityTarget@39:45"] {
        <<reference>>
    }
    Subject ..> R0 : type
    Subject ..> R1 : type
```

## IdentityTarget@39:45

**Fuente:** [src/modules/identity/identity.ts](../../../../../src/modules/identity/identity.ts) · línea 39, columna 45. **Declaración:** inline object.

| Miembro | Firma completa |
| --- | --- |
| `action` | `action: 'password';` |
| `row` | `row: IdentityEntry` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [IdentityEntry](../../../../../src/modules/identity/identity.ts) | `row` |

**Figura:** `DIA-VUE-TS-IDENTITY-21-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["IdentityTarget@39:45"] {
        <<inline_object>>
        action: 'password'
        row: IdentityEntry
    }
    class R0["IdentityEntry"] {
        <<reference>>
    }
    Subject "1" --> "1" R0 : row
```

## IdentityPage.defineProps

**Fuente:** [src/modules/identity/pages/IdentityPage.vue](../../../../../src/modules/identity/pages/IdentityPage.vue) · línea 25, columna 27. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `resource` | `resource: IdentityResource` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [IdentityResource](../../../../../src/modules/identity/identity.ts) | `resource` |

**Figura:** `DIA-VUE-TS-IDENTITY-22-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["IdentityPage.defineProps"] {
        <<SFC_contract>>
        resource: IdentityResource
    }
    class R0["IdentityResource"] {
        <<reference>>
    }
    Subject ..> R0 : resource
```

## PersonEditorPage.defineProps

**Fuente:** [src/modules/identity/pages/PersonEditorPage.vue](../../../../../src/modules/identity/pages/PersonEditorPage.vue) · línea 7, columna 27. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `target` | `target: PersonTarget;` |
| `permissions` | `permissions: readonly string[]` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [PersonTarget](../../../../../src/modules/identity/identity.ts) | `target` |

**Figura:** `DIA-VUE-TS-IDENTITY-23-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["PersonEditorPage.defineProps"] {
        <<SFC_contract>>
        target: PersonTarget
        permissions: readonly string[]
    }
    class R0["PersonTarget"] {
        <<reference>>
    }
    Subject ..> R0 : target
```

## PersonEditorPage.defineEmits

**Fuente:** [src/modules/identity/pages/PersonEditorPage.vue](../../../../../src/modules/identity/pages/PersonEditorPage.vue) · línea 8, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `saved` | `saved: [];` |
| `close` | `close: [];` |
| `reload` | `reload: [];` |
| `denied` | `denied: [status: number]` |

**Figura:** `DIA-VUE-TS-IDENTITY-24-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["PersonEditorPage.defineEmits"] {
        <<SFC_contract>>
        saved: tuple
        close: tuple
        reload: tuple
        denied: tuple
    }
```

## UserEditorPage.defineProps

**Fuente:** [src/modules/identity/pages/UserEditorPage.vue](../../../../../src/modules/identity/pages/UserEditorPage.vue) · línea 7, columna 27. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `target` | `target: IdentityTarget;` |
| `permissions` | `permissions: readonly string[]` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [IdentityTarget](../../../../../src/modules/identity/identity.ts) | `target` |

**Figura:** `DIA-VUE-TS-IDENTITY-25-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["UserEditorPage.defineProps"] {
        <<SFC_contract>>
        target: IdentityTarget
        permissions: readonly string[]
    }
    class R0["IdentityTarget"] {
        <<reference>>
    }
    Subject ..> R0 : target
```

## UserEditorPage.defineEmits

**Fuente:** [src/modules/identity/pages/UserEditorPage.vue](../../../../../src/modules/identity/pages/UserEditorPage.vue) · línea 8, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `saved` | `saved: [];` |
| `close` | `close: [];` |
| `reload` | `reload: [];` |
| `denied` | `denied: [status: number]` |

**Figura:** `DIA-VUE-TS-IDENTITY-26-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["UserEditorPage.defineEmits"] {
        <<SFC_contract>>
        saved: tuple
        close: tuple
        reload: tuple
        denied: tuple
    }
```

## usePersonEditor.return

**Fuente:** [src/modules/identity/composables/usePersonEditor.ts](../../../../../src/modules/identity/composables/usePersonEditor.ts) · línea 12, columna 32. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `organization` | `"organization": { departments: { state: ComputedRef<LookupState>; items: Ref<{ id: string; title: string; data: Record<string, unknown>; isDisabled?: boolean \| undefined; }[], LookupItem[] \| { id: string; title: string; data: Record<string, unknown>; isDisabled?: boolean \| undefined; }[]>; isLoading: Ref<boolean, boolean>; error: Ref<string, string>; search: Ref<string, string>; hasMore: Ref<boolean, boolean>; updateSearch: (value: string) => void; refresh: () => Promise<void>; loadMore: () => Promise<void> \| undefined; retry: () => Promise<void>; }; roles: { state: ComputedRef<LookupState>; items: Ref<{ id: string; title: string; data: Record<string, unknown>; isDisabled?: boolean \| undefined; }[], LookupItem[] \| { id: string; title: string; data: Record<string, unknown>; isDisabled?: boolean \| undefined; }[]>; isLoading: Ref<boolean, boolean>; error: Ref<string, string>; search: Ref<string, string>; hasMore: Ref<boolean, boolean>; updateSearch: (value: string) => void; refresh: () => Promise<void>; loadMore: () => Promise<void> \| undefined; retry: () => Promise<void>; }; state: ComputedRef<OrganizationState>; };` |
| `departmentId` | `"departmentId": Ref<string, string>;` |
| `roleId` | `"roleId": Ref<string, string>;` |
| `accessError` | `"accessError": Ref<string, string>;` |
| `addAccess` | `"addAccess": () => Promise<void>;` |
| `removeAccess` | `"removeAccess": (id: string) => Promise<void>;` |
| `submit` | `"submit": () => Promise<Promise<void> \| undefined> \| undefined;` |
| `update` | `"update": (field: "fullName", value: string) => void;` |
| `blur` | `"blur": (field: "fullName") => Promise<unknown> \| undefined;` |
| `message` | `"message": Ref<string, string>;` |
| `isSubmitting` | `"isSubmitting": Ref<boolean, boolean>;` |
| `isConflicted` | `"isConflicted": Ref<boolean, boolean>;` |
| `execute` | `"execute": (operation: (signal: AbortSignal) => Promise<unknown>) => Promise<void>;` |
| `signal` | `"signal": AbortSignal;` |
| `isDisposed` | `"isDisposed": () => boolean;` |
| `values` | `"values": PersonValues;` |
| `errors` | `"errors": ComputedRef<Partial<Record<"" \| "fullName" \| "accesses" \| accesses[${number}] \| accesses[${number}].departmentId \| accesses[${number}].roleId \| accesses[${number}].departmentName \| accesses[${number}].roleName, string \| undefined>>>;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [usePersonEditor.return.organization.shape1](../../../../../src/modules/identity/composables/usePersonEditor.ts) | `organization` |
| dependency | `Ref` | `departmentId` |
| dependency | `Ref` | `roleId` |
| dependency | `Ref` | `accessError` |
| dependency | `Promise` | `addAccess` |
| dependency | `Promise` | `removeAccess` |
| dependency | `Promise` | `submit` |
| dependency | `Promise` | `blur` |
| dependency | `Ref` | `message` |
| dependency | `Ref` | `isSubmitting` |
| dependency | `Ref` | `isConflicted` |
| dependency | `AbortSignal` | `execute` |
| dependency | `Promise` | `execute` |
| dependency | `AbortSignal` | `signal` |
| association | [PersonValues](../../../../../src/modules/identity/identity.ts) | `values` |
| dependency | `ComputedRef` | `errors` |
| dependency | `Partial` | `errors` |
| dependency | `Record` | `errors` |

**Figura:** `DIA-VUE-TS-IDENTITY-27-1`. Parte 1/9.

```mermaid
classDiagram
    direction TB
    class Subject["usePersonEditor.return"] {
        <<inferred_return>>
        organization: callback
        departmentId: Ref~string, string~
        roleId: Ref~string, string~
        accessError: Ref~string, string~
        addAccess: callback
        removeAccess: callback
        submit: callback
        update: callback
    }
    class R0["usePersonEditor.return.<br/>organization.shape1"] {
        <<reference>>
    }
    class R1["Ref"] {
        <<reference>>
    }
    Subject ..> R0 : organization
    Subject ..> R1 : departmentId
```

**Figura:** `DIA-VUE-TS-IDENTITY-27-2`. Parte 2/9.

```mermaid
classDiagram
    direction TB
    class Subject["usePersonEditor.return"] {
        <<inferred_return>>
        blur: callback
        message: Ref~string, string~
        isSubmitting: Ref~boolean, boolean~
        isConflicted: Ref~boolean, boolean~
        execute: callback
        signal: AbortSignal
        isDisposed: callback
        values: PersonValues
    }
    class R0["Ref"] {
        <<reference>>
    }
    Subject ..> R0 : roleId
    Subject ..> R0 : accessError
```

**Figura:** `DIA-VUE-TS-IDENTITY-27-3`. Parte 3/9.

```mermaid
classDiagram
    direction TB
    class Subject["usePersonEditor.return"] {
        <<inferred_return>>
        errors: object
    }
    class R0["Promise"] {
        <<reference>>
    }
    Subject ..> R0 : addAccess
    Subject ..> R0 : removeAccess
```

**Figura:** `DIA-VUE-TS-IDENTITY-27-4`. Parte 4/9.

```mermaid
classDiagram
    direction TB
    class Subject["usePersonEditor.return"] {
        <<inferred_return>>
    }
    class R0["Promise"] {
        <<reference>>
    }
    Subject ..> R0 : submit
    Subject ..> R0 : blur
```

**Figura:** `DIA-VUE-TS-IDENTITY-27-5`. Parte 5/9.

```mermaid
classDiagram
    direction TB
    class Subject["usePersonEditor.return"] {
        <<inferred_return>>
    }
    class R0["Ref"] {
        <<reference>>
    }
    Subject ..> R0 : message
    Subject ..> R0 : isSubmitting
```

**Figura:** `DIA-VUE-TS-IDENTITY-27-6`. Parte 6/9.

```mermaid
classDiagram
    direction TB
    class Subject["usePersonEditor.return"] {
        <<inferred_return>>
    }
    class R0["Ref"] {
        <<reference>>
    }
    class R1["AbortSignal"] {
        <<reference>>
    }
    Subject ..> R0 : isConflicted
    Subject ..> R1 : execute
```

**Figura:** `DIA-VUE-TS-IDENTITY-27-7`. Parte 7/9.

```mermaid
classDiagram
    direction TB
    class Subject["usePersonEditor.return"] {
        <<inferred_return>>
    }
    class R0["Promise"] {
        <<reference>>
    }
    class R1["AbortSignal"] {
        <<reference>>
    }
    Subject ..> R0 : execute
    Subject ..> R1 : signal
```

**Figura:** `DIA-VUE-TS-IDENTITY-27-8`. Parte 8/9.

```mermaid
classDiagram
    direction TB
    class Subject["usePersonEditor.return"] {
        <<inferred_return>>
    }
    class R0["PersonValues"] {
        <<reference>>
    }
    class R1["ComputedRef"] {
        <<reference>>
    }
    Subject "1" --> "1" R0 : values
    Subject ..> R1 : errors
```

**Figura:** `DIA-VUE-TS-IDENTITY-27-9`. Parte 9/9.

```mermaid
classDiagram
    direction TB
    class Subject["usePersonEditor.return"] {
        <<inferred_return>>
    }
    class R0["Partial"] {
        <<reference>>
    }
    class R1["Record"] {
        <<reference>>
    }
    Subject ..> R0 : errors
    Subject ..> R1 : errors
```

## usePersonEditor.return.organization.shape1

**Fuente:** [src/modules/identity/composables/usePersonEditor.ts](../../../../../src/modules/identity/composables/usePersonEditor.ts) · línea 12, columna 32. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `departments` | `departments: { state: ComputedRef<LookupState>; items: Ref<{ id: string; title: string; data: Record<string, unknown>; isDisabled?: boolean \| undefined; }[], LookupItem[] \| { id: string; title: string; data: Record<string, unknown>; isDisabled?: boolean \| undefined; }[]>; isLoading: Ref<boolean, boolean>; error: Ref<string, string>; search: Ref<string, string>; hasMore: Ref<boolean, boolean>; updateSearch: (value: string) => void; refresh: () => Promise<void>; loadMore: () => Promise<void> \| undefined; retry: () => Promise<void>; };` |
| `roles` | `roles: { state: ComputedRef<LookupState>; items: Ref<{ id: string; title: string; data: Record<string, unknown>; isDisabled?: boolean \| undefined; }[], LookupItem[] \| { id: string; title: string; data: Record<string, unknown>; isDisabled?: boolean \| undefined; }[]>; isLoading: Ref<boolean, boolean>; error: Ref<string, string>; search: Ref<string, string>; hasMore: Ref<boolean, boolean>; updateSearch: (value: string) => void; refresh: () => Promise<void>; loadMore: () => Promise<void> \| undefined; retry: () => Promise<void>; };` |
| `state` | `state: ComputedRef<OrganizationState>;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [usePersonEditor.return.organization.departments.shape2](../../../../../src/modules/identity/composables/usePersonEditor.ts) | `departments` |
| dependency | [usePersonEditor.return.organization.roles.shape5](../../../../../src/modules/identity/composables/usePersonEditor.ts) | `roles` |
| dependency | `ComputedRef` | `state` |
| dependency | `OrganizationState` | `state` |

**Figura:** `DIA-VUE-TS-IDENTITY-28-1`. Parte 1/2.

```mermaid
classDiagram
    direction TB
    class Subject["usePersonEditor.return.<br/>organization.shape1"] {
        <<inferred_object>>
        departments: callback
        roles: callback
        state: ComputedRef~OrganizationState~
    }
    class R0["usePersonEditor.return.<br/>organization.departments.<br/>shape2"] {
        <<reference>>
    }
    class R1["usePersonEditor.return.<br/>organization.roles.shape5"] {
        <<reference>>
    }
    Subject ..> R0 : departments
    Subject ..> R1 : roles
```

**Figura:** `DIA-VUE-TS-IDENTITY-28-2`. Parte 2/2.

```mermaid
classDiagram
    direction TB
    class Subject["usePersonEditor.return.<br/>organization.shape1"] {
        <<inferred_object>>
    }
    class R0["ComputedRef"] {
        <<reference>>
    }
    class R1["OrganizationState"] {
        <<reference>>
    }
    Subject ..> R0 : state
    Subject ..> R1 : state
```

## usePersonEditor.return.organization.departments.shape2

**Fuente:** [src/modules/identity/composables/usePersonEditor.ts](../../../../../src/modules/identity/composables/usePersonEditor.ts) · línea 12, columna 32. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `state` | `state: ComputedRef<LookupState>;` |
| `items` | `items: Ref<{ id: string; title: string; data: Record<string, unknown>; isDisabled?: boolean \| undefined; }[], LookupItem[] \| { id: string; title: string; data: Record<string, unknown>; isDisabled?: boolean \| undefined; }[]>;` |
| `isLoading` | `isLoading: Ref<boolean, boolean>;` |
| `error` | `error: Ref<string, string>;` |
| `search` | `search: Ref<string, string>;` |
| `hasMore` | `hasMore: Ref<boolean, boolean>;` |
| `updateSearch` | `updateSearch: (value: string) => void;` |
| `refresh` | `refresh: () => Promise<void>;` |
| `loadMore` | `loadMore: () => Promise<void> \| undefined;` |
| `retry` | `retry: () => Promise<void>;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | `ComputedRef` | `state` |
| dependency | `LookupState` | `state` |
| dependency | `Ref` | `items` |
| dependency | [usePersonEditor.return.organization.departments.items.shape3](../../../../../src/modules/identity/composables/usePersonEditor.ts) | `items` |
| dependency | `LookupItem` | `items` |
| dependency | [usePersonEditor.return.organization.departments.items.shape4](../../../../../src/modules/identity/composables/usePersonEditor.ts) | `items` |
| dependency | `Ref` | `isLoading` |
| dependency | `Ref` | `error` |
| dependency | `Ref` | `search` |
| dependency | `Ref` | `hasMore` |
| dependency | `Promise` | `refresh` |
| dependency | `Promise` | `loadMore` |
| dependency | `Promise` | `retry` |

**Figura:** `DIA-VUE-TS-IDENTITY-29-1`. Parte 1/7.

```mermaid
classDiagram
    direction TB
    class Subject["usePersonEditor.return.<br/>organization.departments.<br/>shape2"] {
        <<inferred_object>>
        state: ComputedRef~LookupState~
        items: object
        isLoading: Ref~boolean, boolean~
        error: Ref~string, string~
        search: Ref~string, string~
        hasMore: Ref~boolean, boolean~
        updateSearch: callback
        refresh: callback
    }
    class R0["ComputedRef"] {
        <<reference>>
    }
    class R1["LookupState"] {
        <<reference>>
    }
    Subject ..> R0 : state
    Subject ..> R1 : state
```

**Figura:** `DIA-VUE-TS-IDENTITY-29-2`. Parte 2/7.

```mermaid
classDiagram
    direction TB
    class Subject["usePersonEditor.return.<br/>organization.departments.<br/>shape2"] {
        <<inferred_object>>
        loadMore: callback
        retry: callback
    }
    class R0["Ref"] {
        <<reference>>
    }
    class R1["usePersonEditor.return.<br/>organization.departments.<br/>items.shape3"] {
        <<reference>>
    }
    Subject ..> R0 : items
    Subject ..> R1 : items
```

**Figura:** `DIA-VUE-TS-IDENTITY-29-3`. Parte 3/7.

```mermaid
classDiagram
    direction TB
    class Subject["usePersonEditor.return.<br/>organization.departments.<br/>shape2"] {
        <<inferred_object>>
    }
    class R0["LookupItem"] {
        <<reference>>
    }
    class R1["usePersonEditor.return.<br/>organization.departments.<br/>items.shape4"] {
        <<reference>>
    }
    Subject ..> R0 : items
    Subject ..> R1 : items
```

**Figura:** `DIA-VUE-TS-IDENTITY-29-4`. Parte 4/7.

```mermaid
classDiagram
    direction TB
    class Subject["usePersonEditor.return.<br/>organization.departments.<br/>shape2"] {
        <<inferred_object>>
    }
    class R0["Ref"] {
        <<reference>>
    }
    Subject ..> R0 : isLoading
    Subject ..> R0 : error
```

**Figura:** `DIA-VUE-TS-IDENTITY-29-5`. Parte 5/7.

```mermaid
classDiagram
    direction TB
    class Subject["usePersonEditor.return.<br/>organization.departments.<br/>shape2"] {
        <<inferred_object>>
    }
    class R0["Ref"] {
        <<reference>>
    }
    Subject ..> R0 : search
    Subject ..> R0 : hasMore
```

**Figura:** `DIA-VUE-TS-IDENTITY-29-6`. Parte 6/7.

```mermaid
classDiagram
    direction TB
    class Subject["usePersonEditor.return.<br/>organization.departments.<br/>shape2"] {
        <<inferred_object>>
    }
    class R0["Promise"] {
        <<reference>>
    }
    Subject ..> R0 : refresh
    Subject ..> R0 : loadMore
```

**Figura:** `DIA-VUE-TS-IDENTITY-29-7`. Parte 7/7.

```mermaid
classDiagram
    direction TB
    class Subject["usePersonEditor.return.<br/>organization.departments.<br/>shape2"] {
        <<inferred_object>>
    }
    class R0["Promise"] {
        <<reference>>
    }
    Subject ..> R0 : retry
```

## usePersonEditor.return.organization.departments.items.shape3

**Fuente:** [src/modules/identity/composables/usePersonEditor.ts](../../../../../src/modules/identity/composables/usePersonEditor.ts) · línea 12, columna 32. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `id` | `id: string;` |
| `title` | `title: string;` |
| `data` | `data: Record<string, unknown>;` |
| `isDisabled` | `isDisabled?: boolean \| undefined;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | `Record` | `data` |

**Figura:** `DIA-VUE-TS-IDENTITY-30-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["usePersonEditor.return.<br/>organization.departments.<br/>items.shape3"] {
        <<inferred_object>>
        id: string
        title: string
        data: Record~string, unknown~
        isDisabled?: boolean | undefined
    }
    class R0["Record"] {
        <<reference>>
    }
    Subject ..> R0 : data
```

## usePersonEditor.return.organization.departments.items.shape4

**Fuente:** [src/modules/identity/composables/usePersonEditor.ts](../../../../../src/modules/identity/composables/usePersonEditor.ts) · línea 12, columna 32. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `id` | `id: string;` |
| `title` | `title: string;` |
| `data` | `data: Record<string, unknown>;` |
| `isDisabled` | `isDisabled?: boolean \| undefined;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | `Record` | `data` |

**Figura:** `DIA-VUE-TS-IDENTITY-31-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["usePersonEditor.return.<br/>organization.departments.<br/>items.shape4"] {
        <<inferred_object>>
        id: string
        title: string
        data: Record~string, unknown~
        isDisabled?: boolean | undefined
    }
    class R0["Record"] {
        <<reference>>
    }
    Subject ..> R0 : data
```

## usePersonEditor.return.organization.roles.shape5

**Fuente:** [src/modules/identity/composables/usePersonEditor.ts](../../../../../src/modules/identity/composables/usePersonEditor.ts) · línea 12, columna 32. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `state` | `state: ComputedRef<LookupState>;` |
| `items` | `items: Ref<{ id: string; title: string; data: Record<string, unknown>; isDisabled?: boolean \| undefined; }[], LookupItem[] \| { id: string; title: string; data: Record<string, unknown>; isDisabled?: boolean \| undefined; }[]>;` |
| `isLoading` | `isLoading: Ref<boolean, boolean>;` |
| `error` | `error: Ref<string, string>;` |
| `search` | `search: Ref<string, string>;` |
| `hasMore` | `hasMore: Ref<boolean, boolean>;` |
| `updateSearch` | `updateSearch: (value: string) => void;` |
| `refresh` | `refresh: () => Promise<void>;` |
| `loadMore` | `loadMore: () => Promise<void> \| undefined;` |
| `retry` | `retry: () => Promise<void>;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | `ComputedRef` | `state` |
| dependency | `LookupState` | `state` |
| dependency | `Ref` | `items` |
| dependency | [usePersonEditor.return.organization.roles.items.shape6](../../../../../src/modules/identity/composables/usePersonEditor.ts) | `items` |
| dependency | `LookupItem` | `items` |
| dependency | [usePersonEditor.return.organization.roles.items.shape7](../../../../../src/modules/identity/composables/usePersonEditor.ts) | `items` |
| dependency | `Ref` | `isLoading` |
| dependency | `Ref` | `error` |
| dependency | `Ref` | `search` |
| dependency | `Ref` | `hasMore` |
| dependency | `Promise` | `refresh` |
| dependency | `Promise` | `loadMore` |
| dependency | `Promise` | `retry` |

**Figura:** `DIA-VUE-TS-IDENTITY-32-1`. Parte 1/7.

```mermaid
classDiagram
    direction TB
    class Subject["usePersonEditor.return.<br/>organization.roles.shape5"] {
        <<inferred_object>>
        state: ComputedRef~LookupState~
        items: object
        isLoading: Ref~boolean, boolean~
        error: Ref~string, string~
        search: Ref~string, string~
        hasMore: Ref~boolean, boolean~
        updateSearch: callback
        refresh: callback
    }
    class R0["ComputedRef"] {
        <<reference>>
    }
    class R1["LookupState"] {
        <<reference>>
    }
    Subject ..> R0 : state
    Subject ..> R1 : state
```

**Figura:** `DIA-VUE-TS-IDENTITY-32-2`. Parte 2/7.

```mermaid
classDiagram
    direction TB
    class Subject["usePersonEditor.return.<br/>organization.roles.shape5"] {
        <<inferred_object>>
        loadMore: callback
        retry: callback
    }
    class R0["Ref"] {
        <<reference>>
    }
    class R1["usePersonEditor.return.<br/>organization.roles.items.<br/>shape6"] {
        <<reference>>
    }
    Subject ..> R0 : items
    Subject ..> R1 : items
```

**Figura:** `DIA-VUE-TS-IDENTITY-32-3`. Parte 3/7.

```mermaid
classDiagram
    direction TB
    class Subject["usePersonEditor.return.<br/>organization.roles.shape5"] {
        <<inferred_object>>
    }
    class R0["LookupItem"] {
        <<reference>>
    }
    class R1["usePersonEditor.return.<br/>organization.roles.items.<br/>shape7"] {
        <<reference>>
    }
    Subject ..> R0 : items
    Subject ..> R1 : items
```

**Figura:** `DIA-VUE-TS-IDENTITY-32-4`. Parte 4/7.

```mermaid
classDiagram
    direction TB
    class Subject["usePersonEditor.return.<br/>organization.roles.shape5"] {
        <<inferred_object>>
    }
    class R0["Ref"] {
        <<reference>>
    }
    Subject ..> R0 : isLoading
    Subject ..> R0 : error
```

**Figura:** `DIA-VUE-TS-IDENTITY-32-5`. Parte 5/7.

```mermaid
classDiagram
    direction TB
    class Subject["usePersonEditor.return.<br/>organization.roles.shape5"] {
        <<inferred_object>>
    }
    class R0["Ref"] {
        <<reference>>
    }
    Subject ..> R0 : search
    Subject ..> R0 : hasMore
```

**Figura:** `DIA-VUE-TS-IDENTITY-32-6`. Parte 6/7.

```mermaid
classDiagram
    direction TB
    class Subject["usePersonEditor.return.<br/>organization.roles.shape5"] {
        <<inferred_object>>
    }
    class R0["Promise"] {
        <<reference>>
    }
    Subject ..> R0 : refresh
    Subject ..> R0 : loadMore
```

**Figura:** `DIA-VUE-TS-IDENTITY-32-7`. Parte 7/7.

```mermaid
classDiagram
    direction TB
    class Subject["usePersonEditor.return.<br/>organization.roles.shape5"] {
        <<inferred_object>>
    }
    class R0["Promise"] {
        <<reference>>
    }
    Subject ..> R0 : retry
```

## usePersonEditor.return.organization.roles.items.shape6

**Fuente:** [src/modules/identity/composables/usePersonEditor.ts](../../../../../src/modules/identity/composables/usePersonEditor.ts) · línea 12, columna 32. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `id` | `id: string;` |
| `title` | `title: string;` |
| `data` | `data: Record<string, unknown>;` |
| `isDisabled` | `isDisabled?: boolean \| undefined;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | `Record` | `data` |

**Figura:** `DIA-VUE-TS-IDENTITY-33-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["usePersonEditor.return.<br/>organization.roles.items.<br/>shape6"] {
        <<inferred_object>>
        id: string
        title: string
        data: Record~string, unknown~
        isDisabled?: boolean | undefined
    }
    class R0["Record"] {
        <<reference>>
    }
    Subject ..> R0 : data
```

## usePersonEditor.return.organization.roles.items.shape7

**Fuente:** [src/modules/identity/composables/usePersonEditor.ts](../../../../../src/modules/identity/composables/usePersonEditor.ts) · línea 12, columna 32. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `id` | `id: string;` |
| `title` | `title: string;` |
| `data` | `data: Record<string, unknown>;` |
| `isDisabled` | `isDisabled?: boolean \| undefined;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | `Record` | `data` |

**Figura:** `DIA-VUE-TS-IDENTITY-34-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["usePersonEditor.return.<br/>organization.roles.items.<br/>shape7"] {
        <<inferred_object>>
        id: string
        title: string
        data: Record~string, unknown~
        isDisabled?: boolean | undefined
    }
    class R0["Record"] {
        <<reference>>
    }
    Subject ..> R0 : data
```

## useUserEditor.return

**Fuente:** [src/modules/identity/composables/useUserEditor.ts](../../../../../src/modules/identity/composables/useUserEditor.ts) · línea 10, columna 30. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `organization` | `"organization": { departments: { state: ComputedRef<LookupState>; items: Ref<{ id: string; title: string; data: Record<string, unknown>; isDisabled?: boolean \| undefined; }[], LookupItem[] \| { id: string; title: string; data: Record<string, unknown>; isDisabled?: boolean \| undefined; }[]>; isLoading: Ref<boolean, boolean>; error: Ref<string, string>; search: Ref<string, string>; hasMore: Ref<boolean, boolean>; updateSearch: (value: string) => void; refresh: () => Promise<void>; loadMore: () => Promise<void> \| undefined; retry: () => Promise<void>; }; roles: { state: ComputedRef<LookupState>; items: Ref<{ id: string; title: string; data: Record<string, unknown>; isDisabled?: boolean \| undefined; }[], LookupItem[] \| { id: string; title: string; data: Record<string, unknown>; isDisabled?: boolean \| undefined; }[]>; isLoading: Ref<boolean, boolean>; error: Ref<string, string>; search: Ref<string, string>; hasMore: Ref<boolean, boolean>; updateSearch: (value: string) => void; refresh: () => Promise<void>; loadMore: () => Promise<void> \| undefined; retry: () => Promise<void>; }; state: ComputedRef<OrganizationState>; };` |
| `submit` | `"submit": () => Promise<Promise<void> \| undefined> \| undefined;` |
| `update` | `"update": (field: keyof UserValues, value: string) => void;` |
| `blur` | `"blur": (field: keyof UserValues) => Promise<unknown> \| undefined;` |
| `message` | `"message": Ref<string, string>;` |
| `isSubmitting` | `"isSubmitting": Ref<boolean, boolean>;` |
| `isConflicted` | `"isConflicted": Ref<boolean, boolean>;` |
| `execute` | `"execute": (operation: (signal: AbortSignal) => Promise<unknown>) => Promise<void>;` |
| `signal` | `"signal": AbortSignal;` |
| `isDisposed` | `"isDisposed": () => boolean;` |
| `values` | `"values": UserValues;` |
| `errors` | `"errors": ComputedRef<Partial<Record<"" \| "name" \| "password" \| "departmentId" \| "roleId", string \| undefined>>>;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [useUserEditor.return.organization.shape1](../../../../../src/modules/identity/composables/useUserEditor.ts) | `organization` |
| dependency | `Promise` | `submit` |
| dependency | [UserValues](../../../../../src/modules/identity/identity.ts) | `update` |
| dependency | [UserValues](../../../../../src/modules/identity/identity.ts) | `blur` |
| dependency | `Promise` | `blur` |
| dependency | `Ref` | `message` |
| dependency | `Ref` | `isSubmitting` |
| dependency | `Ref` | `isConflicted` |
| dependency | `AbortSignal` | `execute` |
| dependency | `Promise` | `execute` |
| dependency | `AbortSignal` | `signal` |
| association | [UserValues](../../../../../src/modules/identity/identity.ts) | `values` |
| dependency | `ComputedRef` | `errors` |
| dependency | `Partial` | `errors` |
| dependency | `Record` | `errors` |

**Figura:** `DIA-VUE-TS-IDENTITY-35-1`. Parte 1/8.

```mermaid
classDiagram
    direction TB
    class Subject["useUserEditor.return"] {
        <<inferred_return>>
        organization: callback
        submit: callback
        update: callback
        blur: callback
        message: Ref~string, string~
        isSubmitting: Ref~boolean, boolean~
        isConflicted: Ref~boolean, boolean~
        execute: callback
    }
    class R0["useUserEditor.return.<br/>organization.shape1"] {
        <<reference>>
    }
    class R1["Promise"] {
        <<reference>>
    }
    Subject ..> R0 : organization
    Subject ..> R1 : submit
```

**Figura:** `DIA-VUE-TS-IDENTITY-35-2`. Parte 2/8.

```mermaid
classDiagram
    direction TB
    class Subject["useUserEditor.return"] {
        <<inferred_return>>
        signal: AbortSignal
        isDisposed: callback
        values: UserValues
        errors: complex
    }
    class R0["UserValues"] {
        <<reference>>
    }
    Subject ..> R0 : update
    Subject ..> R0 : blur
```

**Figura:** `DIA-VUE-TS-IDENTITY-35-3`. Parte 3/8.

```mermaid
classDiagram
    direction TB
    class Subject["useUserEditor.return"] {
        <<inferred_return>>
    }
    class R0["Promise"] {
        <<reference>>
    }
    class R1["Ref"] {
        <<reference>>
    }
    Subject ..> R0 : blur
    Subject ..> R1 : message
```

**Figura:** `DIA-VUE-TS-IDENTITY-35-4`. Parte 4/8.

```mermaid
classDiagram
    direction TB
    class Subject["useUserEditor.return"] {
        <<inferred_return>>
    }
    class R0["Ref"] {
        <<reference>>
    }
    Subject ..> R0 : isSubmitting
    Subject ..> R0 : isConflicted
```

**Figura:** `DIA-VUE-TS-IDENTITY-35-5`. Parte 5/8.

```mermaid
classDiagram
    direction TB
    class Subject["useUserEditor.return"] {
        <<inferred_return>>
    }
    class R0["AbortSignal"] {
        <<reference>>
    }
    class R1["Promise"] {
        <<reference>>
    }
    Subject ..> R0 : execute
    Subject ..> R1 : execute
```

**Figura:** `DIA-VUE-TS-IDENTITY-35-6`. Parte 6/8.

```mermaid
classDiagram
    direction TB
    class Subject["useUserEditor.return"] {
        <<inferred_return>>
    }
    class R0["AbortSignal"] {
        <<reference>>
    }
    class R1["UserValues"] {
        <<reference>>
    }
    Subject ..> R0 : signal
    Subject "1" --> "1" R1 : values
```

**Figura:** `DIA-VUE-TS-IDENTITY-35-7`. Parte 7/8.

```mermaid
classDiagram
    direction TB
    class Subject["useUserEditor.return"] {
        <<inferred_return>>
    }
    class R0["ComputedRef"] {
        <<reference>>
    }
    class R1["Partial"] {
        <<reference>>
    }
    Subject ..> R0 : errors
    Subject ..> R1 : errors
```

**Figura:** `DIA-VUE-TS-IDENTITY-35-8`. Parte 8/8.

```mermaid
classDiagram
    direction TB
    class Subject["useUserEditor.return"] {
        <<inferred_return>>
    }
    class R0["Record"] {
        <<reference>>
    }
    Subject ..> R0 : errors
```

## useUserEditor.return.organization.shape1

**Fuente:** [src/modules/identity/composables/useUserEditor.ts](../../../../../src/modules/identity/composables/useUserEditor.ts) · línea 10, columna 30. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `departments` | `departments: { state: ComputedRef<LookupState>; items: Ref<{ id: string; title: string; data: Record<string, unknown>; isDisabled?: boolean \| undefined; }[], LookupItem[] \| { id: string; title: string; data: Record<string, unknown>; isDisabled?: boolean \| undefined; }[]>; isLoading: Ref<boolean, boolean>; error: Ref<string, string>; search: Ref<string, string>; hasMore: Ref<boolean, boolean>; updateSearch: (value: string) => void; refresh: () => Promise<void>; loadMore: () => Promise<void> \| undefined; retry: () => Promise<void>; };` |
| `roles` | `roles: { state: ComputedRef<LookupState>; items: Ref<{ id: string; title: string; data: Record<string, unknown>; isDisabled?: boolean \| undefined; }[], LookupItem[] \| { id: string; title: string; data: Record<string, unknown>; isDisabled?: boolean \| undefined; }[]>; isLoading: Ref<boolean, boolean>; error: Ref<string, string>; search: Ref<string, string>; hasMore: Ref<boolean, boolean>; updateSearch: (value: string) => void; refresh: () => Promise<void>; loadMore: () => Promise<void> \| undefined; retry: () => Promise<void>; };` |
| `state` | `state: ComputedRef<OrganizationState>;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [useUserEditor.return.organization.departments.shape2](../../../../../src/modules/identity/composables/useUserEditor.ts) | `departments` |
| dependency | [useUserEditor.return.organization.roles.shape5](../../../../../src/modules/identity/composables/useUserEditor.ts) | `roles` |
| dependency | `ComputedRef` | `state` |
| dependency | `OrganizationState` | `state` |

**Figura:** `DIA-VUE-TS-IDENTITY-36-1`. Parte 1/2.

```mermaid
classDiagram
    direction TB
    class Subject["useUserEditor.return.<br/>organization.shape1"] {
        <<inferred_object>>
        departments: callback
        roles: callback
        state: ComputedRef~OrganizationState~
    }
    class R0["useUserEditor.return.<br/>organization.departments.<br/>shape2"] {
        <<reference>>
    }
    class R1["useUserEditor.return.<br/>organization.roles.shape5"] {
        <<reference>>
    }
    Subject ..> R0 : departments
    Subject ..> R1 : roles
```

**Figura:** `DIA-VUE-TS-IDENTITY-36-2`. Parte 2/2.

```mermaid
classDiagram
    direction TB
    class Subject["useUserEditor.return.<br/>organization.shape1"] {
        <<inferred_object>>
    }
    class R0["ComputedRef"] {
        <<reference>>
    }
    class R1["OrganizationState"] {
        <<reference>>
    }
    Subject ..> R0 : state
    Subject ..> R1 : state
```

## useUserEditor.return.organization.departments.shape2

**Fuente:** [src/modules/identity/composables/useUserEditor.ts](../../../../../src/modules/identity/composables/useUserEditor.ts) · línea 10, columna 30. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `state` | `state: ComputedRef<LookupState>;` |
| `items` | `items: Ref<{ id: string; title: string; data: Record<string, unknown>; isDisabled?: boolean \| undefined; }[], LookupItem[] \| { id: string; title: string; data: Record<string, unknown>; isDisabled?: boolean \| undefined; }[]>;` |
| `isLoading` | `isLoading: Ref<boolean, boolean>;` |
| `error` | `error: Ref<string, string>;` |
| `search` | `search: Ref<string, string>;` |
| `hasMore` | `hasMore: Ref<boolean, boolean>;` |
| `updateSearch` | `updateSearch: (value: string) => void;` |
| `refresh` | `refresh: () => Promise<void>;` |
| `loadMore` | `loadMore: () => Promise<void> \| undefined;` |
| `retry` | `retry: () => Promise<void>;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | `ComputedRef` | `state` |
| dependency | `LookupState` | `state` |
| dependency | `Ref` | `items` |
| dependency | [useUserEditor.return.organization.departments.items.shape3](../../../../../src/modules/identity/composables/useUserEditor.ts) | `items` |
| dependency | `LookupItem` | `items` |
| dependency | [useUserEditor.return.organization.departments.items.shape4](../../../../../src/modules/identity/composables/useUserEditor.ts) | `items` |
| dependency | `Ref` | `isLoading` |
| dependency | `Ref` | `error` |
| dependency | `Ref` | `search` |
| dependency | `Ref` | `hasMore` |
| dependency | `Promise` | `refresh` |
| dependency | `Promise` | `loadMore` |
| dependency | `Promise` | `retry` |

**Figura:** `DIA-VUE-TS-IDENTITY-37-1`. Parte 1/7.

```mermaid
classDiagram
    direction TB
    class Subject["useUserEditor.return.<br/>organization.departments.<br/>shape2"] {
        <<inferred_object>>
        state: ComputedRef~LookupState~
        items: object
        isLoading: Ref~boolean, boolean~
        error: Ref~string, string~
        search: Ref~string, string~
        hasMore: Ref~boolean, boolean~
        updateSearch: callback
        refresh: callback
    }
    class R0["ComputedRef"] {
        <<reference>>
    }
    class R1["LookupState"] {
        <<reference>>
    }
    Subject ..> R0 : state
    Subject ..> R1 : state
```

**Figura:** `DIA-VUE-TS-IDENTITY-37-2`. Parte 2/7.

```mermaid
classDiagram
    direction TB
    class Subject["useUserEditor.return.<br/>organization.departments.<br/>shape2"] {
        <<inferred_object>>
        loadMore: callback
        retry: callback
    }
    class R0["Ref"] {
        <<reference>>
    }
    class R1["useUserEditor.return.<br/>organization.departments.<br/>items.shape3"] {
        <<reference>>
    }
    Subject ..> R0 : items
    Subject ..> R1 : items
```

**Figura:** `DIA-VUE-TS-IDENTITY-37-3`. Parte 3/7.

```mermaid
classDiagram
    direction TB
    class Subject["useUserEditor.return.<br/>organization.departments.<br/>shape2"] {
        <<inferred_object>>
    }
    class R0["LookupItem"] {
        <<reference>>
    }
    class R1["useUserEditor.return.<br/>organization.departments.<br/>items.shape4"] {
        <<reference>>
    }
    Subject ..> R0 : items
    Subject ..> R1 : items
```

**Figura:** `DIA-VUE-TS-IDENTITY-37-4`. Parte 4/7.

```mermaid
classDiagram
    direction TB
    class Subject["useUserEditor.return.<br/>organization.departments.<br/>shape2"] {
        <<inferred_object>>
    }
    class R0["Ref"] {
        <<reference>>
    }
    Subject ..> R0 : isLoading
    Subject ..> R0 : error
```

**Figura:** `DIA-VUE-TS-IDENTITY-37-5`. Parte 5/7.

```mermaid
classDiagram
    direction TB
    class Subject["useUserEditor.return.<br/>organization.departments.<br/>shape2"] {
        <<inferred_object>>
    }
    class R0["Ref"] {
        <<reference>>
    }
    Subject ..> R0 : search
    Subject ..> R0 : hasMore
```

**Figura:** `DIA-VUE-TS-IDENTITY-37-6`. Parte 6/7.

```mermaid
classDiagram
    direction TB
    class Subject["useUserEditor.return.<br/>organization.departments.<br/>shape2"] {
        <<inferred_object>>
    }
    class R0["Promise"] {
        <<reference>>
    }
    Subject ..> R0 : refresh
    Subject ..> R0 : loadMore
```

**Figura:** `DIA-VUE-TS-IDENTITY-37-7`. Parte 7/7.

```mermaid
classDiagram
    direction TB
    class Subject["useUserEditor.return.<br/>organization.departments.<br/>shape2"] {
        <<inferred_object>>
    }
    class R0["Promise"] {
        <<reference>>
    }
    Subject ..> R0 : retry
```

## useUserEditor.return.organization.departments.items.shape3

**Fuente:** [src/modules/identity/composables/useUserEditor.ts](../../../../../src/modules/identity/composables/useUserEditor.ts) · línea 10, columna 30. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `id` | `id: string;` |
| `title` | `title: string;` |
| `data` | `data: Record<string, unknown>;` |
| `isDisabled` | `isDisabled?: boolean \| undefined;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | `Record` | `data` |

**Figura:** `DIA-VUE-TS-IDENTITY-38-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["useUserEditor.return.<br/>organization.departments.<br/>items.shape3"] {
        <<inferred_object>>
        id: string
        title: string
        data: Record~string, unknown~
        isDisabled?: boolean | undefined
    }
    class R0["Record"] {
        <<reference>>
    }
    Subject ..> R0 : data
```

## useUserEditor.return.organization.departments.items.shape4

**Fuente:** [src/modules/identity/composables/useUserEditor.ts](../../../../../src/modules/identity/composables/useUserEditor.ts) · línea 10, columna 30. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `id` | `id: string;` |
| `title` | `title: string;` |
| `data` | `data: Record<string, unknown>;` |
| `isDisabled` | `isDisabled?: boolean \| undefined;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | `Record` | `data` |

**Figura:** `DIA-VUE-TS-IDENTITY-39-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["useUserEditor.return.<br/>organization.departments.<br/>items.shape4"] {
        <<inferred_object>>
        id: string
        title: string
        data: Record~string, unknown~
        isDisabled?: boolean | undefined
    }
    class R0["Record"] {
        <<reference>>
    }
    Subject ..> R0 : data
```

## useUserEditor.return.organization.roles.shape5

**Fuente:** [src/modules/identity/composables/useUserEditor.ts](../../../../../src/modules/identity/composables/useUserEditor.ts) · línea 10, columna 30. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `state` | `state: ComputedRef<LookupState>;` |
| `items` | `items: Ref<{ id: string; title: string; data: Record<string, unknown>; isDisabled?: boolean \| undefined; }[], LookupItem[] \| { id: string; title: string; data: Record<string, unknown>; isDisabled?: boolean \| undefined; }[]>;` |
| `isLoading` | `isLoading: Ref<boolean, boolean>;` |
| `error` | `error: Ref<string, string>;` |
| `search` | `search: Ref<string, string>;` |
| `hasMore` | `hasMore: Ref<boolean, boolean>;` |
| `updateSearch` | `updateSearch: (value: string) => void;` |
| `refresh` | `refresh: () => Promise<void>;` |
| `loadMore` | `loadMore: () => Promise<void> \| undefined;` |
| `retry` | `retry: () => Promise<void>;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | `ComputedRef` | `state` |
| dependency | `LookupState` | `state` |
| dependency | `Ref` | `items` |
| dependency | [useUserEditor.return.organization.roles.items.shape6](../../../../../src/modules/identity/composables/useUserEditor.ts) | `items` |
| dependency | `LookupItem` | `items` |
| dependency | [useUserEditor.return.organization.roles.items.shape7](../../../../../src/modules/identity/composables/useUserEditor.ts) | `items` |
| dependency | `Ref` | `isLoading` |
| dependency | `Ref` | `error` |
| dependency | `Ref` | `search` |
| dependency | `Ref` | `hasMore` |
| dependency | `Promise` | `refresh` |
| dependency | `Promise` | `loadMore` |
| dependency | `Promise` | `retry` |

**Figura:** `DIA-VUE-TS-IDENTITY-40-1`. Parte 1/7.

```mermaid
classDiagram
    direction TB
    class Subject["useUserEditor.return.<br/>organization.roles.shape5"] {
        <<inferred_object>>
        state: ComputedRef~LookupState~
        items: object
        isLoading: Ref~boolean, boolean~
        error: Ref~string, string~
        search: Ref~string, string~
        hasMore: Ref~boolean, boolean~
        updateSearch: callback
        refresh: callback
    }
    class R0["ComputedRef"] {
        <<reference>>
    }
    class R1["LookupState"] {
        <<reference>>
    }
    Subject ..> R0 : state
    Subject ..> R1 : state
```

**Figura:** `DIA-VUE-TS-IDENTITY-40-2`. Parte 2/7.

```mermaid
classDiagram
    direction TB
    class Subject["useUserEditor.return.<br/>organization.roles.shape5"] {
        <<inferred_object>>
        loadMore: callback
        retry: callback
    }
    class R0["Ref"] {
        <<reference>>
    }
    class R1["useUserEditor.return.<br/>organization.roles.items.<br/>shape6"] {
        <<reference>>
    }
    Subject ..> R0 : items
    Subject ..> R1 : items
```

**Figura:** `DIA-VUE-TS-IDENTITY-40-3`. Parte 3/7.

```mermaid
classDiagram
    direction TB
    class Subject["useUserEditor.return.<br/>organization.roles.shape5"] {
        <<inferred_object>>
    }
    class R0["LookupItem"] {
        <<reference>>
    }
    class R1["useUserEditor.return.<br/>organization.roles.items.<br/>shape7"] {
        <<reference>>
    }
    Subject ..> R0 : items
    Subject ..> R1 : items
```

**Figura:** `DIA-VUE-TS-IDENTITY-40-4`. Parte 4/7.

```mermaid
classDiagram
    direction TB
    class Subject["useUserEditor.return.<br/>organization.roles.shape5"] {
        <<inferred_object>>
    }
    class R0["Ref"] {
        <<reference>>
    }
    Subject ..> R0 : isLoading
    Subject ..> R0 : error
```

**Figura:** `DIA-VUE-TS-IDENTITY-40-5`. Parte 5/7.

```mermaid
classDiagram
    direction TB
    class Subject["useUserEditor.return.<br/>organization.roles.shape5"] {
        <<inferred_object>>
    }
    class R0["Ref"] {
        <<reference>>
    }
    Subject ..> R0 : search
    Subject ..> R0 : hasMore
```

**Figura:** `DIA-VUE-TS-IDENTITY-40-6`. Parte 6/7.

```mermaid
classDiagram
    direction TB
    class Subject["useUserEditor.return.<br/>organization.roles.shape5"] {
        <<inferred_object>>
    }
    class R0["Promise"] {
        <<reference>>
    }
    Subject ..> R0 : refresh
    Subject ..> R0 : loadMore
```

**Figura:** `DIA-VUE-TS-IDENTITY-40-7`. Parte 7/7.

```mermaid
classDiagram
    direction TB
    class Subject["useUserEditor.return.<br/>organization.roles.shape5"] {
        <<inferred_object>>
    }
    class R0["Promise"] {
        <<reference>>
    }
    Subject ..> R0 : retry
```

## useUserEditor.return.organization.roles.items.shape6

**Fuente:** [src/modules/identity/composables/useUserEditor.ts](../../../../../src/modules/identity/composables/useUserEditor.ts) · línea 10, columna 30. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `id` | `id: string;` |
| `title` | `title: string;` |
| `data` | `data: Record<string, unknown>;` |
| `isDisabled` | `isDisabled?: boolean \| undefined;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | `Record` | `data` |

**Figura:** `DIA-VUE-TS-IDENTITY-41-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["useUserEditor.return.<br/>organization.roles.items.<br/>shape6"] {
        <<inferred_object>>
        id: string
        title: string
        data: Record~string, unknown~
        isDisabled?: boolean | undefined
    }
    class R0["Record"] {
        <<reference>>
    }
    Subject ..> R0 : data
```

## useUserEditor.return.organization.roles.items.shape7

**Fuente:** [src/modules/identity/composables/useUserEditor.ts](../../../../../src/modules/identity/composables/useUserEditor.ts) · línea 10, columna 30. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `id` | `id: string;` |
| `title` | `title: string;` |
| `data` | `data: Record<string, unknown>;` |
| `isDisabled` | `isDisabled?: boolean \| undefined;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | `Record` | `data` |

**Figura:** `DIA-VUE-TS-IDENTITY-42-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["useUserEditor.return.<br/>organization.roles.items.<br/>shape7"] {
        <<inferred_object>>
        id: string
        title: string
        data: Record~string, unknown~
        isDisabled?: boolean | undefined
    }
    class R0["Record"] {
        <<reference>>
    }
    Subject ..> R0 : data
```

## IDENTITY_CONFIG

**Fuente:** [src/modules/identity/identity.ts](../../../../../src/modules/identity/identity.ts) · línea 41, columna 14. **Declaración:** inferred export.

| Miembro | Firma completa |
| --- | --- |
| `persons` | `"persons": { readonly title: "Personas"; readonly createLabel: "Nueva persona"; readonly read: "persons:read"; readonly write: "persons:write"; readonly report: "person:reports-read"; };` |
| `users` | `"users": { readonly title: "Usuarios"; readonly createLabel: "Nuevo usuario"; readonly read: "users:manage"; readonly write: "users:manage"; readonly report: "admin:reports-read"; };` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [IDENTITY_CONFIG.persons.shape1](../../../../../src/modules/identity/identity.ts) | `persons` |
| association | [IDENTITY_CONFIG.users.shape2](../../../../../src/modules/identity/identity.ts) | `users` |

**Figura:** `DIA-VUE-TS-IDENTITY-43-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["IDENTITY_CONFIG"] {
        <<inferred_export>>
        persons: object
        users: object
    }
    class R0["IDENTITY_CONFIG.persons.<br/>shape1"] {
        <<reference>>
    }
    class R1["IDENTITY_CONFIG.users.shape2"] {
        <<reference>>
    }
    Subject "1" --> "1" R0 : persons
    Subject "1" --> "1" R1 : users
```

## IDENTITY_CONFIG.persons.shape1

**Fuente:** [src/modules/identity/identity.ts](../../../../../src/modules/identity/identity.ts) · línea 41, columna 14. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `title` | `readonly title: "Personas";` |
| `createLabel` | `readonly createLabel: "Nueva persona";` |
| `read` | `readonly read: "persons:read";` |
| `write` | `readonly write: "persons:write";` |
| `report` | `readonly report: "person:reports-read";` |

**Figura:** `DIA-VUE-TS-IDENTITY-44-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["IDENTITY_CONFIG.persons.<br/>shape1"] {
        <<inferred_object>>
        title: "Personas"
        createLabel: "Nueva persona"
        read: "persons:read"
        write: "persons:write"
        report: "person:reports-read"
    }
```

## IDENTITY_CONFIG.users.shape2

**Fuente:** [src/modules/identity/identity.ts](../../../../../src/modules/identity/identity.ts) · línea 41, columna 14. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `title` | `readonly title: "Usuarios";` |
| `createLabel` | `readonly createLabel: "Nuevo usuario";` |
| `read` | `readonly read: "users:manage";` |
| `write` | `readonly write: "users:manage";` |
| `report` | `readonly report: "admin:reports-read";` |

**Figura:** `DIA-VUE-TS-IDENTITY-45-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["IDENTITY_CONFIG.users.shape2"] {
        <<inferred_object>>
        title: "Usuarios"
        createLabel: "Nuevo usuario"
        read: "users:manage"
        write: "users:manage"
        report: "admin:reports-read"
    }
```

## personPayload.return

**Fuente:** [src/modules/identity/identity.ts](../../../../../src/modules/identity/identity.ts) · línea 58, columna 30. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `expectedVersion` | `"expectedVersion"?: number \| undefined;` |
| `fullName` | `"fullName": string;` |
| `accesses` | `"accesses": { departmentId: string; roleId: string; }[];` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [personPayload.return.accesses.shape1](../../../../../src/modules/identity/identity.ts) | `accesses` |

**Figura:** `DIA-VUE-TS-IDENTITY-46-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["personPayload.return"] {
        <<inferred_return>>
        expectedVersion?: number | undefined
        fullName: string
        accesses: object
    }
    class R0["personPayload.return.<br/>accesses.shape1"] {
        <<reference>>
    }
    Subject "1" --> "0..*" R0 : accesses
```

## personPayload.return.accesses.shape1

**Fuente:** [src/modules/identity/identity.ts](../../../../../src/modules/identity/identity.ts) · línea 58, columna 30. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `departmentId` | `departmentId: string;` |
| `roleId` | `roleId: string;` |

**Figura:** `DIA-VUE-TS-IDENTITY-47-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["personPayload.return.<br/>accesses.shape1"] {
        <<inferred_object>>
        departmentId: string
        roleId: string
    }
```

## userPayload.return.variant1

**Fuente:** [src/modules/identity/identity.ts](../../../../../src/modules/identity/identity.ts) · línea 64, columna 28. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `password` | `"password": string;` |
| `expectedVersion` | `"expectedVersion": number;` |

**Figura:** `DIA-VUE-TS-IDENTITY-48-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["userPayload.return.variant1"] {
        <<inferred_return>>
        password: string
        expectedVersion: number
    }
```

## userPayload.return.variant2

**Fuente:** [src/modules/identity/identity.ts](../../../../../src/modules/identity/identity.ts) · línea 64, columna 28. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `password` | `"password": string;` |
| `name` | `"name": string;` |
| `departmentId` | `"departmentId": string;` |
| `roleId` | `"roleId": string;` |
| `expectedVersion` | `"expectedVersion"?: undefined;` |

**Figura:** `DIA-VUE-TS-IDENTITY-49-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["userPayload.return.variant2"] {
        <<inferred_return>>
        password: string
        name: string
        departmentId: string
        roleId: string
        expectedVersion?: undefined
    }
```

## userPayload.return.variant3

**Fuente:** [src/modules/identity/identity.ts](../../../../../src/modules/identity/identity.ts) · línea 64, columna 28. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `expectedVersion` | `"expectedVersion": number;` |
| `name` | `"name": string;` |
| `departmentId` | `"departmentId": string;` |
| `roleId` | `"roleId": string;` |
| `password` | `"password"?: undefined;` |

**Figura:** `DIA-VUE-TS-IDENTITY-50-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["userPayload.return.variant3"] {
        <<inferred_return>>
        expectedVersion: number
        name: string
        departmentId: string
        roleId: string
        password?: undefined
    }
```

## identityService

**Fuente:** [src/modules/identity/services/identityService.ts](../../../../../src/modules/identity/services/identityService.ts) · línea 73, columna 14. **Declaración:** inferred export.

| Miembro | Firma completa |
| --- | --- |
| `list` | `"list": (resource: IdentityResource, query: IdentityQuery, signal?: AbortSignal) => Promise<{ data: IdentityEntry[]; recordsFiltered: number; recordsTotal: number; }>;` |
| `save` | `"save": (resource: IdentityResource, target: IdentityTarget, payload: Record<string, unknown>, signal: AbortSignal) => Promise<void>;` |
| `export` | `"export": (resource: IdentityResource, query: IdentityQuery, signal: AbortSignal) => Promise<Blob>;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [IdentityResource](../../../../../src/modules/identity/identity.ts) | `list` |
| dependency | [IdentityQuery](../../../../../src/modules/identity/identity.ts) | `list` |
| dependency | `AbortSignal` | `list` |
| dependency | `Promise` | `list` |
| dependency | [identityService.list.shape1](../../../../../src/modules/identity/services/identityService.ts) | `list` |
| dependency | [IdentityResource](../../../../../src/modules/identity/identity.ts) | `save` |
| dependency | [IdentityTarget](../../../../../src/modules/identity/identity.ts) | `save` |
| dependency | `Record` | `save` |
| dependency | `AbortSignal` | `save` |
| dependency | `Promise` | `save` |
| dependency | [IdentityResource](../../../../../src/modules/identity/identity.ts) | `export` |
| dependency | [IdentityQuery](../../../../../src/modules/identity/identity.ts) | `export` |
| dependency | `AbortSignal` | `export` |
| dependency | `Promise` | `export` |
| dependency | `Blob` | `export` |

**Figura:** `DIA-VUE-TS-IDENTITY-51-1`. Parte 1/8.

```mermaid
classDiagram
    direction TB
    class Subject["identityService"] {
        <<inferred_export>>
        list: callback
        save: callback
        export: callback
    }
    class R0["IdentityResource"] {
        <<reference>>
    }
    class R1["IdentityQuery"] {
        <<reference>>
    }
    Subject ..> R0 : list
    Subject ..> R1 : list
```

**Figura:** `DIA-VUE-TS-IDENTITY-51-2`. Parte 2/8.

```mermaid
classDiagram
    direction TB
    class Subject["identityService"] {
        <<inferred_export>>
    }
    class R0["AbortSignal"] {
        <<reference>>
    }
    class R1["Promise"] {
        <<reference>>
    }
    Subject ..> R0 : list
    Subject ..> R1 : list
```

**Figura:** `DIA-VUE-TS-IDENTITY-51-3`. Parte 3/8.

```mermaid
classDiagram
    direction TB
    class Subject["identityService"] {
        <<inferred_export>>
    }
    class R0["identityService.list.shape1"] {
        <<reference>>
    }
    class R1["IdentityResource"] {
        <<reference>>
    }
    Subject ..> R0 : list
    Subject ..> R1 : save
```

**Figura:** `DIA-VUE-TS-IDENTITY-51-4`. Parte 4/8.

```mermaid
classDiagram
    direction TB
    class Subject["identityService"] {
        <<inferred_export>>
    }
    class R0["IdentityTarget"] {
        <<reference>>
    }
    class R1["Record"] {
        <<reference>>
    }
    Subject ..> R0 : save
    Subject ..> R1 : save
```

**Figura:** `DIA-VUE-TS-IDENTITY-51-5`. Parte 5/8.

```mermaid
classDiagram
    direction TB
    class Subject["identityService"] {
        <<inferred_export>>
    }
    class R0["AbortSignal"] {
        <<reference>>
    }
    class R1["Promise"] {
        <<reference>>
    }
    Subject ..> R0 : save
    Subject ..> R1 : save
```

**Figura:** `DIA-VUE-TS-IDENTITY-51-6`. Parte 6/8.

```mermaid
classDiagram
    direction TB
    class Subject["identityService"] {
        <<inferred_export>>
    }
    class R0["IdentityResource"] {
        <<reference>>
    }
    class R1["IdentityQuery"] {
        <<reference>>
    }
    Subject ..> R0 : export
    Subject ..> R1 : export
```

**Figura:** `DIA-VUE-TS-IDENTITY-51-7`. Parte 7/8.

```mermaid
classDiagram
    direction TB
    class Subject["identityService"] {
        <<inferred_export>>
    }
    class R0["AbortSignal"] {
        <<reference>>
    }
    class R1["Promise"] {
        <<reference>>
    }
    Subject ..> R0 : export
    Subject ..> R1 : export
```

**Figura:** `DIA-VUE-TS-IDENTITY-51-8`. Parte 8/8.

```mermaid
classDiagram
    direction TB
    class Subject["identityService"] {
        <<inferred_export>>
    }
    class R0["Blob"] {
        <<reference>>
    }
    Subject ..> R0 : export
```

## identityService.list.shape1

**Fuente:** [src/modules/identity/services/identityService.ts](../../../../../src/modules/identity/services/identityService.ts) · línea 73, columna 14. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `data` | `data: IdentityEntry[];` |
| `recordsFiltered` | `recordsFiltered: number;` |
| `recordsTotal` | `recordsTotal: number;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [IdentityEntry](../../../../../src/modules/identity/identity.ts) | `data` |

**Figura:** `DIA-VUE-TS-IDENTITY-52-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["identityService.list.shape1"] {
        <<inferred_object>>
        data: IdentityEntry[]
        recordsFiltered: number
        recordsTotal: number
    }
    class R0["IdentityEntry"] {
        <<reference>>
    }
    Subject "1" --> "0..*" R0 : data
```
