# Contratos TypeScript: catalogs

Generado con `npm run docs:generate`. No editar manualmente.

[Alcance y notación](index.md#alcance-y-notación).

## CatalogName

**Fuente:** [src/modules/catalogs/catalog.ts](../../../../../src/modules/catalogs/catalog.ts) · línea 3, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
keyof typeof PUBLIC_CATALOGS
```

## CatalogField

**Fuente:** [src/modules/catalogs/catalog.ts](../../../../../src/modules/catalogs/catalog.ts) · línea 4, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
'name' | 'symbol' | 'isActive'
```

## CatalogValues

**Fuente:** [src/modules/catalogs/catalog.ts](../../../../../src/modules/catalogs/catalog.ts) · línea 5, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `name` | `name: string;` |
| `symbol` | `symbol: string;` |
| `isActive` | `isActive: boolean;` |

## CatalogEntry

**Fuente:** [src/modules/catalogs/catalog.ts](../../../../../src/modules/catalogs/catalog.ts) · línea 10, columna 1. **Declaración:** interface.

**Extensión/implementación:** `extends CatalogValues`.

| Miembro | Firma completa |
| --- | --- |
| `id` | `id: string;` |
| `version` | `version: number;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| inheritance | [CatalogValues](../../../../../src/modules/catalogs/catalog.ts) | `extends` |

## CatalogQuery

**Fuente:** [src/modules/catalogs/catalog.ts](../../../../../src/modules/catalogs/catalog.ts) · línea 14, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `search` | `search: string;` |
| `page` | `page: number;` |
| `length` | `length: number;` |

## CatalogTarget

**Fuente:** [src/modules/catalogs/catalog.ts](../../../../../src/modules/catalogs/catalog.ts) · línea 19, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
{ action: 'create' } | { action: 'edit'; row: CatalogEntry }
```

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [CatalogEntry](../../../../../src/modules/catalogs/catalog.ts) | `type` |

## CatalogForm.defineProps

**Fuente:** [src/modules/catalogs/components/CatalogForm.vue](../../../../../src/modules/catalogs/components/CatalogForm.vue) · línea 7, columna 13. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `title` | `title: string;` |
| `values` | `values: CatalogValues;` |
| `errors` | `errors: Partial<Record<CatalogField, string>>;` |
| `message` | `message: string;` |
| `isSubmitting` | `isSubmitting: boolean;` |
| `isConflicted` | `isConflicted: boolean;` |
| `hasSymbol` | `hasSymbol: boolean;` |
| `maxNameLength` | `maxNameLength: number;` |
| `maxSymbolLength` | `maxSymbolLength?: number;` |
| `isEditing` | `isEditing: boolean;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [CatalogValues](../../../../../src/modules/catalogs/catalog.ts) | `values` |
| dependency | [CatalogField](../../../../../src/modules/catalogs/catalog.ts) | `errors` |

## CatalogForm.defineEmits

**Fuente:** [src/modules/catalogs/components/CatalogForm.vue](../../../../../src/modules/catalogs/components/CatalogForm.vue) · línea 19, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `update` | `update: [field: CatalogField, value: string \| boolean];` |
| `blur` | `blur: [field: CatalogField];` |
| `submit` | `submit: [];` |
| `close` | `close: [];` |
| `reload` | `reload: [];` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [CatalogField](../../../../../src/modules/catalogs/catalog.ts) | `update` |
| dependency | [CatalogField](../../../../../src/modules/catalogs/catalog.ts) | `blur` |

## CatalogTable.defineProps

**Fuente:** [src/modules/catalogs/components/CatalogTable.vue](../../../../../src/modules/catalogs/components/CatalogTable.vue) · línea 8, columna 27. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `rows` | `rows: CatalogEntry[];` |
| `total` | `total: number;` |
| `query` | `query: CatalogQuery;` |
| `isLoading` | `isLoading: boolean;` |
| `hasSymbol` | `hasSymbol: boolean;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [CatalogEntry](../../../../../src/modules/catalogs/catalog.ts) | `rows` |
| association | [CatalogQuery](../../../../../src/modules/catalogs/catalog.ts) | `query` |

## CatalogTable.defineEmits

**Fuente:** [src/modules/catalogs/components/CatalogTable.vue](../../../../../src/modules/catalogs/components/CatalogTable.vue) · línea 15, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `edit` | `edit: [row: CatalogEntry];` |
| `query` | `query: [query: Partial<CatalogQuery>]` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [CatalogEntry](../../../../../src/modules/catalogs/catalog.ts) | `edit` |
| dependency | [CatalogQuery](../../../../../src/modules/catalogs/catalog.ts) | `query` |

## CatalogEditorPage.defineProps

**Fuente:** [src/modules/catalogs/pages/CatalogEditorPage.vue](../../../../../src/modules/catalogs/pages/CatalogEditorPage.vue) · línea 7, columna 27. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `catalog` | `catalog: CatalogName;` |
| `target` | `target: CatalogTarget` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [CatalogName](../../../../../src/modules/catalogs/catalog.ts) | `catalog` |
| dependency | [CatalogTarget](../../../../../src/modules/catalogs/catalog.ts) | `target` |

## CatalogEditorPage.defineEmits

**Fuente:** [src/modules/catalogs/pages/CatalogEditorPage.vue](../../../../../src/modules/catalogs/pages/CatalogEditorPage.vue) · línea 8, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `saved` | `saved: [];` |
| `close` | `close: [];` |
| `reload` | `reload: [];` |
| `denied` | `denied: [status: number]` |

## CatalogPage.defineProps

**Fuente:** [src/modules/catalogs/pages/CatalogPage.vue](../../../../../src/modules/catalogs/pages/CatalogPage.vue) · línea 15, columna 27. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `catalog` | `catalog: CatalogName` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [CatalogName](../../../../../src/modules/catalogs/catalog.ts) | `catalog` |
