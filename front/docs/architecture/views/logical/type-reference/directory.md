# Contratos TypeScript: directory

Generado con `npm run docs:generate`. No editar manualmente.

[Alcance y notación](index.md#alcance-y-notación).

## DirectoryForm.defineProps

**Fuente:** [src/modules/directory/components/DirectoryForm.vue](../../../../../src/modules/directory/components/DirectoryForm.vue) · línea 7, columna 13. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `resource` | `resource: DirectoryResource;` |
| `title` | `title: string;` |
| `values` | `values: DirectoryValues;` |
| `errors` | `errors: Partial<Record<DirectoryField, string>>;` |
| `message` | `message: string;` |
| `isSubmitting` | `isSubmitting: boolean;` |
| `isConflicted` | `isConflicted: boolean;` |
| `isEditing` | `isEditing: boolean;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [DirectoryResource](../../../../../src/modules/directory/directory.ts) | `resource` |
| association | [DirectoryValues](../../../../../src/modules/directory/directory.ts) | `values` |
| dependency | [DirectoryField](../../../../../src/modules/directory/directory.ts) | `errors` |

## DirectoryForm.defineEmits

**Fuente:** [src/modules/directory/components/DirectoryForm.vue](../../../../../src/modules/directory/components/DirectoryForm.vue) · línea 17, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `update` | `update: [field: DirectoryField, value: string \| boolean];` |
| `blur` | `blur: [field: DirectoryField];` |
| `submit` | `submit: [];` |
| `close` | `close: [];` |
| `reload` | `reload: [];` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [DirectoryField](../../../../../src/modules/directory/directory.ts) | `update` |
| dependency | [DirectoryField](../../../../../src/modules/directory/directory.ts) | `blur` |

## DirectoryTable.defineProps

**Fuente:** [src/modules/directory/components/DirectoryTable.vue](../../../../../src/modules/directory/components/DirectoryTable.vue) · línea 11, columna 27. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `resource` | `resource: DirectoryResource;` |
| `rows` | `rows: DirectoryEntry[];` |
| `query` | `query: RecordQuery;` |
| `total` | `total: number;` |
| `isLoading` | `isLoading: boolean;` |
| `canEdit` | `canEdit: boolean;` |
| `canSeeState` | `canSeeState: boolean;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [DirectoryResource](../../../../../src/modules/directory/directory.ts) | `resource` |
| association | [DirectoryEntry](../../../../../src/modules/directory/directory.ts) | `rows` |
| association | [RecordQuery](../../../../../src/shared/list.ts) | `query` |

## DirectoryTable.defineEmits

**Fuente:** [src/modules/directory/components/DirectoryTable.vue](../../../../../src/modules/directory/components/DirectoryTable.vue) · línea 20, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `edit` | `edit: [row: DirectoryEntry];` |
| `query` | `query: [changes: Partial<RecordQuery>]` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [DirectoryEntry](../../../../../src/modules/directory/directory.ts) | `edit` |
| dependency | [RecordQuery](../../../../../src/shared/list.ts) | `query` |

## DirectoryResource

**Fuente:** [src/modules/directory/directory.ts](../../../../../src/modules/directory/directory.ts) · línea 3, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
'clients' | 'suppliers'
```

## DirectoryValues

**Fuente:** [src/modules/directory/directory.ts](../../../../../src/modules/directory/directory.ts) · línea 4, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `name` | `name: string;` |
| `legalName` | `legalName: string;` |
| `tradeName` | `tradeName: string;` |
| `isActive` | `isActive: boolean;` |

## DirectoryEntry

**Fuente:** [src/modules/directory/directory.ts](../../../../../src/modules/directory/directory.ts) · línea 10, columna 1. **Declaración:** interface.

**Extensión/implementación:** `extends DirectoryValues`.

| Miembro | Firma completa |
| --- | --- |
| `id` | `id: string;` |
| `version` | `version: number;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| inheritance | [DirectoryValues](../../../../../src/modules/directory/directory.ts) | `extends` |

## DirectoryTarget

**Fuente:** [src/modules/directory/directory.ts](../../../../../src/modules/directory/directory.ts) · línea 14, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
{ action: 'create'; initialName?: string } | { action: 'edit'; row: DirectoryEntry }
```

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [DirectoryEntry](../../../../../src/modules/directory/directory.ts) | `type` |

## DirectoryField

**Fuente:** [src/modules/directory/directory.ts](../../../../../src/modules/directory/directory.ts) · línea 16, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
keyof DirectoryValues
```

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [DirectoryValues](../../../../../src/modules/directory/directory.ts) | `type` |

## DirectoryEditorPage.defineProps

**Fuente:** [src/modules/directory/pages/DirectoryEditorPage.vue](../../../../../src/modules/directory/pages/DirectoryEditorPage.vue) · línea 7, columna 27. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `resource` | `resource: DirectoryResource;` |
| `target` | `target: DirectoryTarget` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [DirectoryResource](../../../../../src/modules/directory/directory.ts) | `resource` |
| dependency | [DirectoryTarget](../../../../../src/modules/directory/directory.ts) | `target` |

## DirectoryEditorPage.defineEmits

**Fuente:** [src/modules/directory/pages/DirectoryEditorPage.vue](../../../../../src/modules/directory/pages/DirectoryEditorPage.vue) · línea 8, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `saved` | `saved: [entry?: DirectoryEntry];` |
| `close` | `close: [];` |
| `reload` | `reload: [];` |
| `denied` | `denied: [status: number];` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [DirectoryEntry](../../../../../src/modules/directory/directory.ts) | `saved` |

## DirectoryPage.defineProps

**Fuente:** [src/modules/directory/pages/DirectoryPage.vue](../../../../../src/modules/directory/pages/DirectoryPage.vue) · línea 20, columna 27. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `resource` | `resource: DirectoryResource` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [DirectoryResource](../../../../../src/modules/directory/directory.ts) | `resource` |
