# Contratos TypeScript: identity

Generado con `npm run docs:generate`. No editar manualmente.

[Alcance y notación](index.md#alcance-y-notación).

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
| dependency | [IdentityQuery](../../../../../src/modules/identity/identity.ts) | `query` |

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
| dependency | [OrganizationState](../../../../../src/shared/lookup.ts) | `options` |

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
| dependency | [UserField](../../../../../src/modules/identity/identity.ts) | `errors` |
| dependency | [OrganizationState](../../../../../src/shared/lookup.ts) | `options` |
| association | [IdentityEntry](../../../../../src/modules/identity/identity.ts) | `row` |

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

## IdentityResource

**Fuente:** [src/modules/identity/identity.ts](../../../../../src/modules/identity/identity.ts) · línea 9, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
'persons' | 'users'
```

## PersonAccess

**Fuente:** [src/modules/identity/identity.ts](../../../../../src/modules/identity/identity.ts) · línea 10, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `departmentId` | `departmentId: string;` |
| `roleId` | `roleId: string;` |
| `departmentName` | `departmentName: string;` |
| `roleName` | `roleName: string;` |

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

## PersonValues

**Fuente:** [src/modules/identity/identity.ts](../../../../../src/modules/identity/identity.ts) · línea 27, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `fullName` | `fullName: string;` |
| `accesses` | `accesses: PersonAccess[];` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [PersonAccess](../../../../../src/modules/identity/identity.ts) | `accesses` |

## UserValues

**Fuente:** [src/modules/identity/identity.ts](../../../../../src/modules/identity/identity.ts) · línea 31, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `name` | `name: string;` |
| `password` | `password: string;` |
| `departmentId` | `departmentId: string;` |
| `roleId` | `roleId: string;` |

## UserField

**Fuente:** [src/modules/identity/identity.ts](../../../../../src/modules/identity/identity.ts) · línea 37, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
keyof UserValues
```

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [UserValues](../../../../../src/modules/identity/identity.ts) | `type` |

## PersonTarget

**Fuente:** [src/modules/identity/identity.ts](../../../../../src/modules/identity/identity.ts) · línea 38, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
{ action: 'create' } | { action: 'edit'; row: IdentityEntry }
```

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [IdentityEntry](../../../../../src/modules/identity/identity.ts) | `type` |

## IdentityTarget

**Fuente:** [src/modules/identity/identity.ts](../../../../../src/modules/identity/identity.ts) · línea 39, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
PersonTarget | { action: 'password'; row: IdentityEntry }
```

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [PersonTarget](../../../../../src/modules/identity/identity.ts) | `type` |
| dependency | [IdentityEntry](../../../../../src/modules/identity/identity.ts) | `type` |

## IdentityPage.defineProps

**Fuente:** [src/modules/identity/pages/IdentityPage.vue](../../../../../src/modules/identity/pages/IdentityPage.vue) · línea 25, columna 27. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `resource` | `resource: IdentityResource` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [IdentityResource](../../../../../src/modules/identity/identity.ts) | `resource` |

## PersonEditorPage.defineProps

**Fuente:** [src/modules/identity/pages/PersonEditorPage.vue](../../../../../src/modules/identity/pages/PersonEditorPage.vue) · línea 7, columna 27. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `target` | `target: PersonTarget;` |
| `permissions` | `permissions: readonly string[]` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [PersonTarget](../../../../../src/modules/identity/identity.ts) | `target` |

## PersonEditorPage.defineEmits

**Fuente:** [src/modules/identity/pages/PersonEditorPage.vue](../../../../../src/modules/identity/pages/PersonEditorPage.vue) · línea 8, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `saved` | `saved: [];` |
| `close` | `close: [];` |
| `reload` | `reload: [];` |
| `denied` | `denied: [status: number]` |

## UserEditorPage.defineProps

**Fuente:** [src/modules/identity/pages/UserEditorPage.vue](../../../../../src/modules/identity/pages/UserEditorPage.vue) · línea 7, columna 27. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `target` | `target: IdentityTarget;` |
| `permissions` | `permissions: readonly string[]` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [IdentityTarget](../../../../../src/modules/identity/identity.ts) | `target` |

## UserEditorPage.defineEmits

**Fuente:** [src/modules/identity/pages/UserEditorPage.vue](../../../../../src/modules/identity/pages/UserEditorPage.vue) · línea 8, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `saved` | `saved: [];` |
| `close` | `close: [];` |
| `reload` | `reload: [];` |
| `denied` | `denied: [status: number]` |
