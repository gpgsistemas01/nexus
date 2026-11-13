# Contratos TypeScript: shared

Generado con `npm run docs:generate`. No editar manualmente.

[Alcance y notación](index.md#alcance-y-notación).

## DocumentReadDialog.defineProps

**Fuente:** [src/shared/components/DocumentReadDialog.vue](../../../../../src/shared/components/DocumentReadDialog.vue) · línea 8, columna 13. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `isReading` | `isReading: boolean;` |
| `error` | `error: string;` |
| `loadingLabel` | `loadingLabel: string;` |
| `canRetry` | `canRetry: boolean` |

## DocumentReadDialog.defineEmits

**Fuente:** [src/shared/components/DocumentReadDialog.vue](../../../../../src/shared/components/DocumentReadDialog.vue) · línea 9, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `retry` | `retry: [];` |
| `cancel` | `cancel: []` |

## EditorDialog.defineProps

**Fuente:** [src/shared/components/EditorDialog.vue](../../../../../src/shared/components/EditorDialog.vue) · línea 12, columna 17. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `title` | `title: string;` |
| `eyebrow` | `eyebrow?: string;` |
| `context` | `context?: string;` |
| `maxWidth` | `maxWidth?: number;` |
| `isSubmitting` | `isSubmitting: boolean;` |
| `isSubmitDisabled` | `isSubmitDisabled?: boolean;` |
| `submitLabel` | `submitLabel?: string;` |
| `note` | `note?: string;` |
| `showSubmit` | `showSubmit?: boolean;` |
| `closeLabel` | `closeLabel?: string;` |
| `retainFocus` | `retainFocus?: boolean;` |
| `message` | `message?: string;` |

## EditorDialog.defineEmits

**Fuente:** [src/shared/components/EditorDialog.vue](../../../../../src/shared/components/EditorDialog.vue) · línea 38, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `close` | `close: [];` |
| `submit` | `submit: []` |

## FilterActions.defineProps

**Fuente:** [src/shared/components/FilterActions.vue](../../../../../src/shared/components/FilterActions.vue) · línea 4, columna 13. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `isLoading` | `isLoading: boolean` |

## FilterActions.defineEmits

**Fuente:** [src/shared/components/FilterActions.vue](../../../../../src/shared/components/FilterActions.vue) · línea 5, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `refresh` | `refresh: [];` |
| `clear` | `clear: []` |

## FormErrorDialog.defineProps

**Fuente:** [src/shared/components/FormErrorDialog.vue](../../../../../src/shared/components/FormErrorDialog.vue) · línea 9, columna 17. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `message` | `message: string;` |
| `isSubmitting` | `isSubmitting: boolean;` |
| `title` | `title?: string` |

## ListFilters.defineProps

**Fuente:** [src/shared/components/ListFilters.vue](../../../../../src/shared/components/ListFilters.vue) · línea 14, columna 17. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `isLoading` | `isLoading: boolean;` |
| `hasExtraFilters` | `hasExtraFilters: boolean;` |
| `hasActiveFilters` | `hasActiveFilters: boolean;` |
| `searchLabel` | `searchLabel?: string;` |

## ListFilters.defineEmits

**Fuente:** [src/shared/components/ListFilters.vue](../../../../../src/shared/components/ListFilters.vue) · línea 22, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `apply` | `apply: [];` |
| `clear` | `clear: [];` |
| `refresh` | `refresh: []` |

## OrganizationFields.defineProps

**Fuente:** [src/shared/components/OrganizationFields.vue](../../../../../src/shared/components/OrganizationFields.vue) · línea 5, columna 13. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `departmentId` | `departmentId: string;` |
| `roleId` | `roleId: string;` |
| `options` | `options: OrganizationState;` |
| `isDisabled` | `isDisabled: boolean;` |
| `errors` | `errors?: { departmentId?: string; roleId?: string };` |
| `initialDepartment` | `initialDepartment?: LookupItem;` |
| `initialRole` | `initialRole?: LookupItem;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [OrganizationState](../../../../../src/shared/lookup.ts) | `options` |
| association | [LookupItem](../../../../../src/shared/lookup.ts) | `initialDepartment` |
| association | [LookupItem](../../../../../src/shared/lookup.ts) | `initialRole` |

## OrganizationFields.defineEmits

**Fuente:** [src/shared/components/OrganizationFields.vue](../../../../../src/shared/components/OrganizationFields.vue) · línea 14, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `update` | `update: [field: 'departmentId' \| 'roleId', value: string];` |
| `blur` | `blur: [field: 'departmentId' \| 'roleId'];` |
| `search` | `search: [resource: OrganizationResource, value: string];` |
| `more` | `more: [resource: OrganizationResource];` |
| `retry` | `retry: [resource: OrganizationResource];` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [OrganizationResource](../../../../../src/shared/lookup.ts) | `search` |
| dependency | [OrganizationResource](../../../../../src/shared/lookup.ts) | `more` |
| dependency | [OrganizationResource](../../../../../src/shared/lookup.ts) | `retry` |

## RecordEditorDialog.defineProps

**Fuente:** [src/shared/components/RecordEditorDialog.vue](../../../../../src/shared/components/RecordEditorDialog.vue) · línea 6, columna 17. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `title` | `title: string;` |
| `eyebrow` | `eyebrow: string;` |
| `message` | `message: string;` |
| `isSubmitting` | `isSubmitting: boolean;` |
| `isConflicted` | `isConflicted: boolean;` |
| `submitLabel` | `submitLabel?: string;` |
| `maxWidth` | `maxWidth?: number;` |
| `context` | `context?: string;` |
| `note` | `note?: string;` |
| `reloadLabel` | `reloadLabel?: string;` |
| `showSubmit` | `showSubmit?: boolean;` |
| `closeLabel` | `closeLabel?: string;` |
| `retainFocus` | `retainFocus?: boolean;` |

## RecordEditorDialog.defineEmits

**Fuente:** [src/shared/components/RecordEditorDialog.vue](../../../../../src/shared/components/RecordEditorDialog.vue) · línea 32, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `close` | `close: [];` |
| `submit` | `submit: [];` |
| `reload` | `reload: []` |

## RecordListPanel.defineProps

**Fuente:** [src/shared/components/RecordListPanel.vue](../../../../../src/shared/components/RecordListPanel.vue) · línea 8, columna 17. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `title` | `title: string;` |
| `titleId` | `titleId: string;` |
| `total` | `total: number;` |
| `isLoading` | `isLoading: boolean;` |
| `error` | `error: string;` |
| `loadingLabel` | `loadingLabel?: string;` |
| `titlePrefix` | `titlePrefix?: string;` |
| `hideSearch` | `hideSearch?: boolean;` |
| `hasActiveFilters` | `hasActiveFilters?: boolean;` |
| `showCount` | `showCount?: boolean;` |
| `isRefreshing` | `isRefreshing?: boolean;` |

## RecordListPanel.defineEmits

**Fuente:** [src/shared/components/RecordListPanel.vue](../../../../../src/shared/components/RecordListPanel.vue) · línea 30, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `search` | `search: [];` |
| `clear` | `clear: [];` |
| `refresh` | `refresh: []` |

## RemoteSelect.defineProps

**Fuente:** [src/shared/components/RemoteSelect.vue](../../../../../src/shared/components/RemoteSelect.vue) · línea 11, columna 17. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `label` | `label: string;` |
| `modelValue` | `modelValue: string;` |
| `state` | `state?: LookupState;` |
| `error` | `error?: string;` |
| `isDisabled` | `isDisabled?: boolean;` |
| `hint` | `hint?: string;` |
| `initialOption` | `initialOption?: LookupItem;` |
| `createLabel` | `createLabel?: string;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [LookupState](../../../../../src/shared/lookup.ts) | `state` |
| association | [LookupItem](../../../../../src/shared/lookup.ts) | `initialOption` |

## RemoteSelect.defineEmits

**Fuente:** [src/shared/components/RemoteSelect.vue](../../../../../src/shared/components/RemoteSelect.vue) · línea 29, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `update:modelValue` | `'update:modelValue': [value: string];` |
| `search` | `search: [value: string];` |
| `more` | `more: [];` |
| `retry` | `retry: [];` |
| `blur` | `blur: [];` |
| `create` | `create: [search: string];` |

## ReportScopeDialog.defineProps

**Fuente:** [src/shared/components/ReportScopeDialog.vue](../../../../../src/shared/components/ReportScopeDialog.vue) · línea 8, columna 17. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `values` | `values: ReportScope;` |
| `isSubmitting` | `isSubmitting: boolean;` |
| `error` | `error: string;` |
| `validationError` | `validationError?: string;` |
| `eyebrow` | `eyebrow?: string;` |
| `subject` | `subject?: string;` |
| `kind` | `kind?: ReportKind;` |
| `note` | `note?: string;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [ReportScope](../../../../../src/shared/report.ts) | `values` |
| dependency | [ReportKind](../../../../../src/shared/report.ts) | `kind` |

## ReportScopeDialog.defineEmits

**Fuente:** [src/shared/components/ReportScopeDialog.vue](../../../../../src/shared/components/ReportScopeDialog.vue) · línea 20, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `mode` | `mode: [value: ReportScope['mode']];` |
| `month` | `month: [value: string];` |
| `inventory` | `inventory: [value: NonNullable<ReportScope['inventoryScope']>];` |
| `submit` | `submit: [];` |
| `close` | `close: [];` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [ReportScope](../../../../../src/shared/report.ts) | `mode` |
| dependency | [ReportScope](../../../../../src/shared/report.ts) | `inventory` |

## ResponsiveTableCards.defineProps

**Fuente:** [src/shared/components/ResponsiveTableCards.vue](../../../../../src/shared/components/ResponsiveTableCards.vue) · línea 8, columna 17. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `headers` | `headers: DataTableHeader<Row>[];` |
| `rows` | `rows: Row[];` |
| `rowClass` | `rowClass?: (row: Row) => string;` |
| `formatValue` | `formatValue?: (row: Row, key: string) => string;` |
| `sortBy` | `sortBy?: DataTableSortItem[];` |
| `sortRows` | `sortRows?: boolean;` |
| `sortValue` | `sortValue?: (row: Row, key: string) => unknown;` |
| `emptyText` | `emptyText?: string;` |

## ResponsiveTableCards.defineEmits

**Fuente:** [src/shared/components/ResponsiveTableCards.vue](../../../../../src/shared/components/ResponsiveTableCards.vue) · línea 27, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `sortBy` | `sortBy: [sortBy: DataTableSortItem[]]` |

## ServerTable.defineProps

**Fuente:** [src/shared/components/ServerTable.vue](../../../../../src/shared/components/ServerTable.vue) · línea 10, columna 17. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `headers` | `headers: DataTableHeader<Row>[];` |
| `rows` | `rows: Row[];` |
| `total` | `total: number;` |
| `page` | `page: number;` |
| `pageSize` | `pageSize: number;` |
| `isLoading` | `isLoading: boolean;` |
| `pageSizeOptions` | `pageSizeOptions?: number[];` |
| `tableLabel` | `tableLabel?: string;` |
| `sortBy` | `sortBy?: DataTableSortItem[];` |
| `mustSort` | `mustSort?: boolean;` |
| `rowProps` | `rowProps?: (data: { item: Row }) => { class: string };` |
| `formatValue` | `formatValue?: (row: Row, key: string) => string;` |

## ServerTable.defineEmits

**Fuente:** [src/shared/components/ServerTable.vue](../../../../../src/shared/components/ServerTable.vue) · línea 33, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `options` | `options: [options: TableOptions];` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [TableOptions](../../../../../src/shared/composables/useTableQuery.ts) | `options` |

## StateBadge.defineProps

**Fuente:** [src/shared/components/StateBadge.vue](../../../../../src/shared/components/StateBadge.vue) · línea 4, columna 13. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `isActive` | `isActive: boolean` |

## TableAction.defineProps

**Fuente:** [src/shared/components/TableAction.vue](../../../../../src/shared/components/TableAction.vue) · línea 6, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `label` | `label: string;` |
| `icon` | `icon: string;` |
| `color` | `color?: string;` |
| `isDisabled` | `isDisabled?: boolean` |

## TableAction.defineEmits

**Fuente:** [src/shared/components/TableAction.vue](../../../../../src/shared/components/TableAction.vue) · línea 10, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `click` | `click: []` |

## TableFrame.defineProps

**Fuente:** [src/shared/components/TableFrame.vue](../../../../../src/shared/components/TableFrame.vue) · línea 7, columna 17. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `isLoading` | `isLoading?: boolean;` |
| `fitColumns` | `fitColumns?: boolean;` |
| `mobileCards` | `mobileCards?: boolean;` |

## FileExportOptions

**Fuente:** [src/shared/composables/useFileExport.ts](../../../../../src/shared/composables/useFileExport.ts) · línea 5, columna 1. **Declaración:** interface.

**Parámetros:** `Scope`.

| Miembro | Firma completa |
| --- | --- |
| `canExport` | `canExport: () => boolean;` |
| `request` | `request: (scope: Scope, signal: AbortSignal) => Promise<Blob>;` |
| `filename` | `filename: string \| (() => string);` |
| `onDenied` | `onDenied: (status: number) => void;` |

## InteractiveForm

**Fuente:** [src/shared/composables/useFormInteraction.ts](../../../../../src/shared/composables/useFormInteraction.ts) · línea 3, columna 1. **Declaración:** interface.

**Parámetros:** `Field extends string, Value`.

| Miembro | Firma completa |
| --- | --- |
| `values` | `values: Record<Field, Value>;` |
| `submitCount` | `submitCount: Ref<number>;` |
| `setFieldValue` | `setFieldValue: (field: Field, value: Value, shouldValidate: boolean) => void;` |
| `setFieldError` | `setFieldError: (field: Field, message: undefined) => void;` |
| `validateField` | `validateField: (field: Field) => Promise<unknown>;` |

## SearchQuery

**Fuente:** [src/shared/composables/useListSearch.ts](../../../../../src/shared/composables/useListSearch.ts) · línea 3, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `page` | `page: number;` |
| `search` | `search: string;` |

## PageQuery

**Fuente:** [src/shared/composables/usePagedList.ts](../../../../../src/shared/composables/usePagedList.ts) · línea 4, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `page` | `page: number;` |
| `length` | `length: number;` |

## RecordForm

**Fuente:** [src/shared/composables/useRecordForm.ts](../../../../../src/shared/composables/useRecordForm.ts) · línea 7, columna 1. **Declaración:** type.

**Parámetros:** `Values extends object`.

**Definición completa:**

```typescript
InteractiveForm<
    keyof Values & string,
    Values[keyof Values]
> & {
    values: Values;
    isSubmitting: Ref<boolean>;
    setErrors: (errors: Record<string, string>) => void;
    handleSubmit: (handler: (values: Values) => Promise<void>) => () => Promise<unknown>;
}
```

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [InteractiveForm](../../../../../src/shared/composables/useFormInteraction.ts) | `type` |

## TableOptions

**Fuente:** [src/shared/composables/useTableQuery.ts](../../../../../src/shared/composables/useTableQuery.ts) · línea 5, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `page` | `page: number;` |
| `itemsPerPage` | `itemsPerPage: number;` |
| `sortBy` | `sortBy: DataTableSortItem[];` |

## TableQuery

**Fuente:** [src/shared/composables/useTableQuery.ts](../../../../../src/shared/composables/useTableQuery.ts) · línea 11, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
Pick<RecordQuery, 'direction'> & { orderColumn?: number }
```

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [RecordQuery](../../../../../src/shared/list.ts) | `type` |

## ApiRequestConfig

**Fuente:** [src/shared/http/apiClient.ts](../../../../../src/shared/http/apiClient.ts) · línea 9, columna 1. **Declaración:** interface.

**Extensión/implementación:** `extends AxiosRequestConfig`.

| Miembro | Firma completa |
| --- | --- |
| `requiresAuth` | `requiresAuth?: boolean;` |

## RetriableRequest

**Fuente:** [src/shared/http/apiClient.ts](../../../../../src/shared/http/apiClient.ts) · línea 12, columna 1. **Declaración:** interface.

**Extensión/implementación:** `extends RecoverableRequest`.

| Miembro | Firma completa |
| --- | --- |
| `requiresAuth` | `requiresAuth?: boolean;` |
| `hasRetried` | `hasRetried?: boolean;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| inheritance | [RecoverableRequest](../../../../../src/shared/http/connectionRecovery.ts) | `extends` |

## ApiError

**Fuente:** [src/shared/http/apiError.ts](../../../../../src/shared/http/apiError.ts) · línea 5, columna 1. **Declaración:** class.

**Extensión/implementación:** `extends Error`.

| Miembro | Firma completa |
| --- | --- |
| `constructor` | `constructor( message: string, public status = 0, public code = '', public fieldErrors: Record<string, string> = {}, public meta: Record<string, unknown> = {}, )` |
| `status` | `public status = 0` |
| `code` | `public code = ''` |
| `fieldErrors` | `public fieldErrors: Record<string, string> = {}` |
| `meta` | `public meta: Record<string, unknown> = {}` |

## InventoryCatalogPath

**Fuente:** [src/shared/http/apiPaths.ts](../../../../../src/shared/http/apiPaths.ts) · línea 82, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
keyof typeof API_PATHS.inventoryCatalogs
```

## RecoverableRequest

**Fuente:** [src/shared/http/connectionRecovery.ts](../../../../../src/shared/http/connectionRecovery.ts) · línea 7, columna 1. **Declaración:** interface.

**Extensión/implementación:** `extends InternalAxiosRequestConfig`.

| Miembro | Firma completa |
| --- | --- |
| `connectionRetries` | `connectionRetries?: number;` |

## PageResult

**Fuente:** [src/shared/http/pageRequest.ts](../../../../../src/shared/http/pageRequest.ts) · línea 5, columna 1. **Declaración:** interface.

**Parámetros:** `T`.

| Miembro | Firma completa |
| --- | --- |
| `data` | `data: T[];` |
| `recordsFiltered` | `recordsFiltered: number;` |
| `recordsTotal` | `recordsTotal: number;` |

## MutationConfirmation

**Fuente:** [src/shared/http/recordContract.ts](../../../../../src/shared/http/recordContract.ts) · línea 35, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `code` | `code: string;` |
| `message` | `message: string;` |

## RecordQuery

**Fuente:** [src/shared/list.ts](../../../../../src/shared/list.ts) · línea 1, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `page` | `page: number;` |
| `length` | `length: number;` |
| `search` | `search: string;` |
| `orderColumn` | `orderColumn: number;` |
| `direction` | `direction: 'asc' \| 'desc';` |

## LookupItem

**Fuente:** [src/shared/lookup.ts](../../../../../src/shared/lookup.ts) · línea 1, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `id` | `id: string;` |
| `title` | `title: string;` |
| `data` | `data: Record<string, unknown>;` |
| `isDisabled` | `isDisabled?: boolean;` |

## LookupState

**Fuente:** [src/shared/lookup.ts](../../../../../src/shared/lookup.ts) · línea 8, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `items` | `items: LookupItem[];` |
| `isLoading` | `isLoading: boolean;` |
| `error` | `error: string;` |
| `hasMore` | `hasMore: boolean;` |
| `canRetry` | `canRetry?: boolean;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [LookupItem](../../../../../src/shared/lookup.ts) | `items` |

## LookupQuery

**Fuente:** [src/shared/lookup.ts](../../../../../src/shared/lookup.ts) · línea 15, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `search` | `search: string;` |
| `page` | `page: number;` |

## LookupCreation

**Fuente:** [src/shared/lookup.ts](../../../../../src/shared/lookup.ts) · línea 19, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `search` | `search: string;` |
| `onCreated` | `onCreated: (item: LookupItem) => void;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [LookupItem](../../../../../src/shared/lookup.ts) | `onCreated` |

## OrganizationResource

**Fuente:** [src/shared/lookup.ts](../../../../../src/shared/lookup.ts) · línea 23, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
'departments' | 'roles'
```

## OrganizationState

**Fuente:** [src/shared/lookup.ts](../../../../../src/shared/lookup.ts) · línea 24, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
Record<OrganizationResource, LookupState>
```

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [OrganizationResource](../../../../../src/shared/lookup.ts) | `type` |
| dependency | [LookupState](../../../../../src/shared/lookup.ts) | `type` |

## ReportScope

**Fuente:** [src/shared/report.ts](../../../../../src/shared/report.ts) · línea 3, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `mode` | `mode: 'filtered' \| 'current-month' \| 'specific-month';` |
| `month` | `month: string;` |
| `inventoryScope` | `inventoryScope?: 'activeOrStock' \| 'active' \| 'inStock';` |

## ReportKind

**Fuente:** [src/shared/report.ts](../../../../../src/shared/report.ts) · línea 9, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
'period' | 'inventory' | 'filtered'
```

## OrganizationLookupRequest

**Fuente:** [src/shared/services/organizationService.ts](../../../../../src/shared/services/organizationService.ts) · línea 7, columna 1. **Declaración:** interface.

**Extensión/implementación:** `extends LookupQuery`.

| Miembro | Firma completa |
| --- | --- |
| `resource` | `resource: OrganizationResource;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| inheritance | [LookupQuery](../../../../../src/shared/lookup.ts) | `extends` |
| dependency | [OrganizationResource](../../../../../src/shared/lookup.ts) | `resource` |

## NumericDisplayValue

**Fuente:** [src/shared/utils/formatNumbers.ts](../../../../../src/shared/utils/formatNumbers.ts) · línea 3, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
string | number | null | undefined
```
