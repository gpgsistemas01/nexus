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
keyof CatalogValues
```

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [CatalogValues](../../../../../src/modules/catalogs/catalog.ts) | `type` |

## CatalogValues

**Fuente:** [src/modules/catalogs/catalog.ts](../../../../../src/modules/catalogs/catalog.ts) · línea 5, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `name` | `name: string;` |
| `symbol` | `symbol: string;` |
| `isActive` | `isActive: boolean;` |
| `type` | `type?: string;` |
| `presentationId` | `presentationId?: string;` |
| `unitMeasureId` | `unitMeasureId?: string;` |
| `base` | `base?: string;` |
| `height` | `height?: string;` |
| `minStock` | `minStock?: string;` |

## CatalogEntry

**Fuente:** [src/modules/catalogs/catalog.ts](../../../../../src/modules/catalogs/catalog.ts) · línea 16, columna 1. **Declaración:** interface.

**Extensión/implementación:** `extends Omit<CatalogValues, 'isActive'>`.

| Miembro | Firma completa |
| --- | --- |
| `isActive` | `isActive?: boolean;` |
| `hasSuppliers` | `hasSuppliers?: boolean;` |
| `presentation` | `presentation?: string;` |
| `unitMeasure` | `unitMeasure?: string;` |
| `unitSymbol` | `unitSymbol?: string;` |
| `id` | `id: string;` |
| `version` | `version: number;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [CatalogValues](../../../../../src/modules/catalogs/catalog.ts) | `type argument` |

## CatalogQuery

**Fuente:** [src/modules/catalogs/catalog.ts](../../../../../src/modules/catalogs/catalog.ts) · línea 25, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `search` | `search: string;` |
| `page` | `page: number;` |
| `length` | `length: number;` |

## CatalogTarget

**Fuente:** [src/modules/catalogs/catalog.ts](../../../../../src/modules/catalogs/catalog.ts) · línea 30, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
{ action: 'create' } | { action: 'edit'; row: CatalogEntry }
```

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [CatalogEntry](../../../../../src/modules/catalogs/catalog.ts) | `type` |

## CatalogForm.defineProps

**Fuente:** [src/modules/catalogs/components/CatalogForm.vue](../../../../../src/modules/catalogs/components/CatalogForm.vue) · línea 10, columna 13. **Declaración:** SFC contract.

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
| `isMaterial` | `isMaterial?: boolean;` |
| `canEditIdentity` | `canEditIdentity?: boolean;` |
| `fixedMeasurements` | `fixedMeasurements?: boolean;` |
| `presentations` | `presentations?: LookupState;` |
| `units` | `units?: LookupState;` |
| `selectedPresentation` | `selectedPresentation?: LookupItem;` |
| `selectedUnit` | `selectedUnit?: LookupItem;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [CatalogValues](../../../../../src/modules/catalogs/catalog.ts) | `values` |
| dependency | [CatalogField](../../../../../src/modules/catalogs/catalog.ts) | `errors` |
| association | [LookupState](../../../../../src/shared/lookup.ts) | `presentations` |
| association | [LookupState](../../../../../src/shared/lookup.ts) | `units` |
| association | [LookupItem](../../../../../src/shared/lookup.ts) | `selectedPresentation` |
| association | [LookupItem](../../../../../src/shared/lookup.ts) | `selectedUnit` |

## CatalogForm.defineEmits

**Fuente:** [src/modules/catalogs/components/CatalogForm.vue](../../../../../src/modules/catalogs/components/CatalogForm.vue) · línea 29, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `update` | `update: [field: CatalogField, value: string \| boolean];` |
| `blur` | `blur: [field: CatalogField];` |
| `submit` | `submit: [];` |
| `close` | `close: [];` |
| `reload` | `reload: [];` |
| `search` | `search: [field: 'presentationId' \| 'unitMeasureId', search: string];` |
| `more` | `more: [field: 'presentationId' \| 'unitMeasureId'];` |
| `retry` | `retry: [field: 'presentationId' \| 'unitMeasureId'];` |

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
| `isMaterial` | `isMaterial?: boolean;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [CatalogEntry](../../../../../src/modules/catalogs/catalog.ts) | `rows` |
| association | [CatalogQuery](../../../../../src/modules/catalogs/catalog.ts) | `query` |

## CatalogTable.defineEmits

**Fuente:** [src/modules/catalogs/components/CatalogTable.vue](../../../../../src/modules/catalogs/components/CatalogTable.vue) · línea 16, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `edit` | `edit: [row: CatalogEntry];` |
| `query` | `query: [query: Partial<CatalogQuery>]` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [CatalogEntry](../../../../../src/modules/catalogs/catalog.ts) | `edit` |
| dependency | [CatalogQuery](../../../../../src/modules/catalogs/catalog.ts) | `query` |

## FormValues

**Fuente:** [src/modules/catalogs/composables/useCatalogEditor.ts](../../../../../src/modules/catalogs/composables/useCatalogEditor.ts) · línea 23, columna 5. **Declaración:** type.

**Definición completa:**

```typescript
Required<CatalogValues>
```

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [CatalogValues](../../../../../src/modules/catalogs/catalog.ts) | `type` |

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
