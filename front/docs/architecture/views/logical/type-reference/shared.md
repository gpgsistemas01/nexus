# Contratos TypeScript: shared

Generado con `npm run docs:generate`. No editar manualmente.

[Alcance y notación](index.md#alcance-y-notación).

## EditorDialog.defineProps

**Fuente:** [src/shared/components/EditorDialog.vue](../../../../../src/shared/components/EditorDialog.vue) · línea 11, columna 17. **Declaración:** SFC contract.

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

**Figura:** `DIA-VUE-TS-SHARED-1-1`.

```mermaid
classDiagram
    direction LR
    class Subject["EditorDialog.defineProps"] {
        <<SFC_contract>>
        title: string
        eyebrow?: string
        context?: string
        maxWidth?: number
        isSubmitting: boolean
        isSubmitDisabled?: boolean
        submitLabel?: string
        note?: string
        showSubmit?: boolean
        closeLabel?: string
        retainFocus?: boolean
    }
```

## EditorDialog.defineEmits

**Fuente:** [src/shared/components/EditorDialog.vue](../../../../../src/shared/components/EditorDialog.vue) · línea 35, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `close` | `close: [];` |
| `submit` | `submit: []` |

**Figura:** `DIA-VUE-TS-SHARED-2-1`.

```mermaid
classDiagram
    direction LR
    class Subject["EditorDialog.defineEmits"] {
        <<SFC_contract>>
        close: tuple
        submit: tuple
    }
```

## FilterActions.defineProps

**Fuente:** [src/shared/components/FilterActions.vue](../../../../../src/shared/components/FilterActions.vue) · línea 4, columna 13. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `isLoading` | `isLoading: boolean` |

**Figura:** `DIA-VUE-TS-SHARED-3-1`.

```mermaid
classDiagram
    direction LR
    class Subject["FilterActions.defineProps"] {
        <<SFC_contract>>
        isLoading: boolean
    }
```

## FilterActions.defineEmits

**Fuente:** [src/shared/components/FilterActions.vue](../../../../../src/shared/components/FilterActions.vue) · línea 5, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `refresh` | `refresh: [];` |
| `clear` | `clear: []` |

**Figura:** `DIA-VUE-TS-SHARED-4-1`.

```mermaid
classDiagram
    direction LR
    class Subject["FilterActions.defineEmits"] {
        <<SFC_contract>>
        refresh: tuple
        clear: tuple
    }
```

## ListFilters.defineProps

**Fuente:** [src/shared/components/ListFilters.vue](../../../../../src/shared/components/ListFilters.vue) · línea 14, columna 17. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `isLoading` | `isLoading: boolean;` |
| `hasExtraFilters` | `hasExtraFilters: boolean;` |
| `hasActiveFilters` | `hasActiveFilters: boolean;` |
| `searchLabel` | `searchLabel?: string;` |

**Figura:** `DIA-VUE-TS-SHARED-5-1`.

```mermaid
classDiagram
    direction LR
    class Subject["ListFilters.defineProps"] {
        <<SFC_contract>>
        isLoading: boolean
        hasExtraFilters: boolean
        hasActiveFilters: boolean
        searchLabel?: string
    }
```

## ListFilters.defineEmits

**Fuente:** [src/shared/components/ListFilters.vue](../../../../../src/shared/components/ListFilters.vue) · línea 22, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `apply` | `apply: [];` |
| `clear` | `clear: [];` |
| `refresh` | `refresh: []` |

**Figura:** `DIA-VUE-TS-SHARED-6-1`.

```mermaid
classDiagram
    direction LR
    class Subject["ListFilters.defineEmits"] {
        <<SFC_contract>>
        apply: tuple
        clear: tuple
        refresh: tuple
    }
```

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
| association | [OrganizationFields.errors@10:14](../../../../../src/shared/components/OrganizationFields.vue) | `errors` |
| association | [LookupItem](../../../../../src/shared/lookup.ts) | `initialDepartment` |
| association | [LookupItem](../../../../../src/shared/lookup.ts) | `initialRole` |

**Figura:** `DIA-VUE-TS-SHARED-7-1`.

```mermaid
classDiagram
    direction LR
    class Subject["OrganizationFields.<br/>defineProps"] {
        <<SFC_contract>>
        departmentId: string
        roleId: string
        options: OrganizationState
        isDisabled: boolean
        errors?: object
        initialDepartment?: LookupItem
        initialRole?: LookupItem
    }
    class R0["OrganizationState"] {
        <<reference>>
    }
    class R1["OrganizationFields.<br/>errors@10:14"] {
        <<reference>>
    }
    class R2["LookupItem"] {
        <<reference>>
    }
    Subject ..> R0 : options
    Subject --> "0..1" R1 : errors
    Subject --> "0..1" R2 : initialDepartment
    Subject --> "0..1" R2 : initialRole
```

## OrganizationFields.errors@10:14

**Fuente:** [src/shared/components/OrganizationFields.vue](../../../../../src/shared/components/OrganizationFields.vue) · línea 10, columna 14. **Declaración:** inline object.

| Miembro | Firma completa |
| --- | --- |
| `departmentId` | `departmentId?: string;` |
| `roleId` | `roleId?: string` |

**Figura:** `DIA-VUE-TS-SHARED-8-1`.

```mermaid
classDiagram
    direction LR
    class Subject["OrganizationFields.<br/>errors@10:14"] {
        <<inline_object>>
        departmentId?: string
        roleId?: string
    }
```

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

**Figura:** `DIA-VUE-TS-SHARED-9-1`.

```mermaid
classDiagram
    direction LR
    class Subject["OrganizationFields.<br/>defineEmits"] {
        <<SFC_contract>>
        update: tuple
        blur: tuple
        search: tuple
        more: tuple
        retry: tuple
    }
    class R0["OrganizationResource"] {
        <<reference>>
    }
    Subject ..> R0 : search
    Subject ..> R0 : more
    Subject ..> R0 : retry
```

## RecordEditorDialog.defineProps

**Fuente:** [src/shared/components/RecordEditorDialog.vue](../../../../../src/shared/components/RecordEditorDialog.vue) · línea 7, columna 17. **Declaración:** SFC contract.

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

**Figura:** `DIA-VUE-TS-SHARED-10-1`.

```mermaid
classDiagram
    direction LR
    class Subject["RecordEditorDialog.<br/>defineProps"] {
        <<SFC_contract>>
        title: string
        eyebrow: string
        message: string
        isSubmitting: boolean
        isConflicted: boolean
        submitLabel?: string
        maxWidth?: number
        context?: string
        note?: string
        reloadLabel?: string
        showSubmit?: boolean
        closeLabel?: string
        retainFocus?: boolean
    }
```

## RecordEditorDialog.defineEmits

**Fuente:** [src/shared/components/RecordEditorDialog.vue](../../../../../src/shared/components/RecordEditorDialog.vue) · línea 33, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `close` | `close: [];` |
| `submit` | `submit: [];` |
| `reload` | `reload: []` |

**Figura:** `DIA-VUE-TS-SHARED-11-1`.

```mermaid
classDiagram
    direction LR
    class Subject["RecordEditorDialog.<br/>defineEmits"] {
        <<SFC_contract>>
        close: tuple
        submit: tuple
        reload: tuple
    }
```

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

**Figura:** `DIA-VUE-TS-SHARED-12-1`.

```mermaid
classDiagram
    direction LR
    class Subject["RecordListPanel.defineProps"] {
        <<SFC_contract>>
        title: string
        titleId: string
        total: number
        isLoading: boolean
        error: string
        loadingLabel?: string
        titlePrefix?: string
        hideSearch?: boolean
        hasActiveFilters?: boolean
        showCount?: boolean
        isRefreshing?: boolean
    }
```

## RecordListPanel.defineEmits

**Fuente:** [src/shared/components/RecordListPanel.vue](../../../../../src/shared/components/RecordListPanel.vue) · línea 30, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `search` | `search: [];` |
| `clear` | `clear: [];` |
| `refresh` | `refresh: []` |

**Figura:** `DIA-VUE-TS-SHARED-13-1`.

```mermaid
classDiagram
    direction LR
    class Subject["RecordListPanel.defineEmits"] {
        <<SFC_contract>>
        search: tuple
        clear: tuple
        refresh: tuple
    }
```

## RemoteSelect.defineProps

**Fuente:** [src/shared/components/RemoteSelect.vue](../../../../../src/shared/components/RemoteSelect.vue) · línea 10, columna 27. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `label` | `label: string;` |
| `modelValue` | `modelValue: string;` |
| `items` | `items: LookupItem[];` |
| `isLoading` | `isLoading: boolean;` |
| `error` | `error?: string;` |
| `loadError` | `loadError?: string;` |
| `hasMore` | `hasMore?: boolean;` |
| `isDisabled` | `isDisabled?: boolean;` |
| `hint` | `hint?: string;` |
| `initialOption` | `initialOption?: LookupItem;` |
| `createLabel` | `createLabel?: string;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [LookupItem](../../../../../src/shared/lookup.ts) | `items` |
| association | [LookupItem](../../../../../src/shared/lookup.ts) | `initialOption` |

**Figura:** `DIA-VUE-TS-SHARED-14-1`.

```mermaid
classDiagram
    direction LR
    class Subject["RemoteSelect.defineProps"] {
        <<SFC_contract>>
        label: string
        modelValue: string
        items: LookupItem[]
        isLoading: boolean
        error?: string
        loadError?: string
        hasMore?: boolean
        isDisabled?: boolean
        hint?: string
        initialOption?: LookupItem
        createLabel?: string
    }
    class R0["LookupItem"] {
        <<reference>>
    }
    Subject --> "0..*" R0 : items
    Subject --> "0..1" R0 : initialOption
```

## RemoteSelect.defineEmits

**Fuente:** [src/shared/components/RemoteSelect.vue](../../../../../src/shared/components/RemoteSelect.vue) · línea 23, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `update:modelValue` | `'update:modelValue': [value: string];` |
| `search` | `search: [value: string];` |
| `more` | `more: [];` |
| `retry` | `retry: [];` |
| `blur` | `blur: [];` |
| `create` | `create: [search: string];` |

**Figura:** `DIA-VUE-TS-SHARED-15-1`.

```mermaid
classDiagram
    direction LR
    class Subject["RemoteSelect.defineEmits"] {
        <<SFC_contract>>
        update:modelValue: tuple
        search: tuple
        more: tuple
        retry: tuple
        blur: tuple
        create: tuple
    }
```

## ReportScopeDialog.defineProps

**Fuente:** [src/shared/components/ReportScopeDialog.vue](../../../../../src/shared/components/ReportScopeDialog.vue) · línea 9, columna 17. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `values` | `values: ReportScope;` |
| `isSubmitting` | `isSubmitting: boolean;` |
| `error` | `error: string;` |
| `eyebrow` | `eyebrow?: string;` |
| `subject` | `subject?: string;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [ReportScope](../../../../../src/shared/report.ts) | `values` |

**Figura:** `DIA-VUE-TS-SHARED-16-1`.

```mermaid
classDiagram
    direction LR
    class Subject["ReportScopeDialog.<br/>defineProps"] {
        <<SFC_contract>>
        values: ReportScope
        isSubmitting: boolean
        error: string
        eyebrow?: string
        subject?: string
    }
    class R0["ReportScope"] {
        <<reference>>
    }
    Subject --> "1" R0 : values
```

## ReportScopeDialog.defineEmits

**Fuente:** [src/shared/components/ReportScopeDialog.vue](../../../../../src/shared/components/ReportScopeDialog.vue) · línea 18, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `mode` | `mode: [value: ReportScope['mode']];` |
| `month` | `month: [value: string];` |
| `submit` | `submit: [];` |
| `close` | `close: [];` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [ReportScope](../../../../../src/shared/report.ts) | `mode` |

**Figura:** `DIA-VUE-TS-SHARED-17-1`.

```mermaid
classDiagram
    direction LR
    class Subject["ReportScopeDialog.<br/>defineEmits"] {
        <<SFC_contract>>
        mode: tuple
        month: tuple
        submit: tuple
        close: tuple
    }
    class R0["ReportScope"] {
        <<reference>>
    }
    Subject ..> R0 : mode
```

## ServerTable.defineProps

**Fuente:** [src/shared/components/ServerTable.vue](../../../../../src/shared/components/ServerTable.vue) · línea 8, columna 17. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `headers` | `headers: DataTableHeader<Row>[];` |
| `rows` | `rows: Row[];` |
| `total` | `total: number;` |
| `page` | `page: number;` |
| `pageSize` | `pageSize: number;` |
| `isLoading` | `isLoading: boolean;` |
| `sortBy` | `sortBy?: DataTableSortItem[];` |
| `mustSort` | `mustSort?: boolean;` |
| `rowProps` | `rowProps?: (data: { item: Row }) => { class: string };` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [ServerTable.rowProps.data@17:27](../../../../../src/shared/components/ServerTable.vue) | `rowProps` |
| dependency | [ServerTable.rowProps@17:45](../../../../../src/shared/components/ServerTable.vue) | `rowProps` |

**Figura:** `DIA-VUE-TS-SHARED-18-1`.

```mermaid
classDiagram
    direction LR
    class Subject["ServerTable.defineProps"] {
        <<SFC_contract>>
        headers: DataTableHeader~Row~[]
        rows: Row[]
        total: number
        page: number
        pageSize: number
        isLoading: boolean
        sortBy?: DataTableSortItem[]
        mustSort?: boolean
        rowProps?: callback
    }
    class R0["ServerTable.rowProps.<br/>data@17:27"] {
        <<reference>>
    }
    class R1["ServerTable.rowProps@17:45"] {
        <<reference>>
    }
    Subject ..> R0 : rowProps
    Subject ..> R1 : rowProps
```

## ServerTable.rowProps.data@17:27

**Fuente:** [src/shared/components/ServerTable.vue](../../../../../src/shared/components/ServerTable.vue) · línea 17, columna 27. **Declaración:** inline object.

| Miembro | Firma completa |
| --- | --- |
| `item` | `item: Row` |

**Figura:** `DIA-VUE-TS-SHARED-19-1`.

```mermaid
classDiagram
    direction LR
    class Subject["ServerTable.rowProps.<br/>data@17:27"] {
        <<inline_object>>
        item: Row
    }
```

## ServerTable.rowProps@17:45

**Fuente:** [src/shared/components/ServerTable.vue](../../../../../src/shared/components/ServerTable.vue) · línea 17, columna 45. **Declaración:** inline object.

| Miembro | Firma completa |
| --- | --- |
| `class` | `class: string` |

**Figura:** `DIA-VUE-TS-SHARED-20-1`.

```mermaid
classDiagram
    direction LR
    class Subject["ServerTable.rowProps@17:45"] {
        <<inline_object>>
        class: string
    }
```

## ServerTable.defineEmits

**Fuente:** [src/shared/components/ServerTable.vue](../../../../../src/shared/components/ServerTable.vue) · línea 21, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `options` | `options: [options: TableOptions];` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [TableOptions](../../../../../src/shared/composables/useTableQuery.ts) | `options` |

**Figura:** `DIA-VUE-TS-SHARED-21-1`.

```mermaid
classDiagram
    direction LR
    class Subject["ServerTable.defineEmits"] {
        <<SFC_contract>>
        options: tuple
    }
    class R0["TableOptions"] {
        <<reference>>
    }
    Subject ..> R0 : options
```

## StateBadge.defineProps

**Fuente:** [src/shared/components/StateBadge.vue](../../../../../src/shared/components/StateBadge.vue) · línea 4, columna 13. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `isActive` | `isActive: boolean` |

**Figura:** `DIA-VUE-TS-SHARED-22-1`.

```mermaid
classDiagram
    direction LR
    class Subject["StateBadge.defineProps"] {
        <<SFC_contract>>
        isActive: boolean
    }
```

## TableAction.defineProps

**Fuente:** [src/shared/components/TableAction.vue](../../../../../src/shared/components/TableAction.vue) · línea 6, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `label` | `label: string;` |
| `icon` | `icon: string;` |
| `color` | `color?: string;` |
| `isDisabled` | `isDisabled?: boolean` |

**Figura:** `DIA-VUE-TS-SHARED-23-1`.

```mermaid
classDiagram
    direction LR
    class Subject["TableAction.defineProps"] {
        <<SFC_contract>>
        label: string
        icon: string
        color?: string
        isDisabled?: boolean
    }
```

## TableAction.defineEmits

**Fuente:** [src/shared/components/TableAction.vue](../../../../../src/shared/components/TableAction.vue) · línea 10, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `click` | `click: []` |

**Figura:** `DIA-VUE-TS-SHARED-24-1`.

```mermaid
classDiagram
    direction LR
    class Subject["TableAction.defineEmits"] {
        <<SFC_contract>>
        click: tuple
    }
```

## TableFrame.defineProps

**Fuente:** [src/shared/components/TableFrame.vue](../../../../../src/shared/components/TableFrame.vue) · línea 2, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `isLoading` | `isLoading?: boolean` |

**Figura:** `DIA-VUE-TS-SHARED-25-1`.

```mermaid
classDiagram
    direction LR
    class Subject["TableFrame.defineProps"] {
        <<SFC_contract>>
        isLoading?: boolean
    }
```

## useDocumentRead.options@3:52

**Fuente:** [src/shared/composables/useDocumentRead.ts](../../../../../src/shared/composables/useDocumentRead.ts) · línea 3, columna 52. **Declaración:** inline object.

| Miembro | Firma completa |
| --- | --- |
| `request` | `request: (id: string, signal: AbortSignal) => Promise<Document>;` |
| `onError` | `onError: (cause: unknown) => void;` |
| `errorMessage` | `errorMessage: string;` |

**Figura:** `DIA-VUE-TS-SHARED-26-1`.

```mermaid
classDiagram
    direction LR
    class Subject["useDocumentRead.options@3:52"] {
        <<inline_object>>
        request: callback
        onError: callback
        errorMessage: string
    }
```

## FileExportOptions

**Fuente:** [src/shared/composables/useFileExport.ts](../../../../../src/shared/composables/useFileExport.ts) · línea 4, columna 1. **Declaración:** interface.

**Parámetros:** `Scope`.

| Miembro | Firma completa |
| --- | --- |
| `canExport` | `canExport: () => boolean;` |
| `request` | `request: (scope: Scope, signal: AbortSignal) => Promise<Blob>;` |
| `filename` | `filename: string;` |
| `onDenied` | `onDenied: (status: number) => void;` |

**Figura:** `DIA-VUE-TS-SHARED-27-1`.

```mermaid
classDiagram
    direction LR
    class Subject["FileExportOptions"] {
        <<interface>>
        canExport: callback
        request: callback
        filename: string
        onDenied: callback
    }
```

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

**Figura:** `DIA-VUE-TS-SHARED-28-1`.

```mermaid
classDiagram
    direction LR
    class Subject["InteractiveForm"] {
        <<interface>>
        values: Record~Field, Value~
        submitCount: Ref~number~
        setFieldValue: callback
        setFieldError: callback
        validateField: callback
    }
```

## useFormInteraction.options@13:14

**Fuente:** [src/shared/composables/useFormInteraction.ts](../../../../../src/shared/composables/useFormInteraction.ts) · línea 13, columna 14. **Declaración:** inline object.

| Miembro | Firma completa |
| --- | --- |
| `isDisabled` | `isDisabled: () => boolean;` |
| `onChange` | `onChange: () => void` |

**Figura:** `DIA-VUE-TS-SHARED-29-1`.

```mermaid
classDiagram
    direction LR
    class Subject["useFormInteraction.<br/>options@13:14"] {
        <<inline_object>>
        isDisabled: callback
        onChange: callback
    }
```

## useListEditor.options@4:48

**Fuente:** [src/shared/composables/useListEditor.ts](../../../../../src/shared/composables/useListEditor.ts) · línea 4, columna 48. **Declaración:** inline object.

| Miembro | Firma completa |
| --- | --- |
| `canOpen` | `canOpen: (target: Target) => boolean;` |
| `reload` | `reload: () => unknown;` |
| `savedMessage` | `savedMessage?: string;` |

**Figura:** `DIA-VUE-TS-SHARED-30-1`.

```mermaid
classDiagram
    direction LR
    class Subject["useListEditor.options@4:48"] {
        <<inline_object>>
        canOpen: callback
        reload: callback
        savedMessage?: string
    }
```

## SearchQuery

**Fuente:** [src/shared/composables/useListSearch.ts](../../../../../src/shared/composables/useListSearch.ts) · línea 3, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `page` | `page: number;` |
| `search` | `search: string;` |

**Figura:** `DIA-VUE-TS-SHARED-31-1`.

```mermaid
classDiagram
    direction LR
    class Subject["SearchQuery"] {
        <<interface>>
        page: number
        search: string
    }
```

## useListSearch.list@9:11

**Fuente:** [src/shared/composables/useListSearch.ts](../../../../../src/shared/composables/useListSearch.ts) · línea 9, columna 11. **Declaración:** inline object.

| Miembro | Firma completa |
| --- | --- |
| `query` | `query: Query;` |
| `load` | `load: () => unknown;` |
| `applyQuery` | `applyQuery: (changes: Partial<Query>) => unknown;` |

**Figura:** `DIA-VUE-TS-SHARED-32-1`.

```mermaid
classDiagram
    direction LR
    class Subject["useListSearch.list@9:11"] {
        <<inline_object>>
        query: Query
        load: callback
        applyQuery: callback
    }
```

## PageQuery

**Fuente:** [src/shared/composables/usePagedList.ts](../../../../../src/shared/composables/usePagedList.ts) · línea 4, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `page` | `page: number;` |
| `length` | `length: number;` |

**Figura:** `DIA-VUE-TS-SHARED-33-1`.

```mermaid
classDiagram
    direction LR
    class Subject["PageQuery"] {
        <<interface>>
        page: number
        length: number
    }
```

## usePagedList.options@9:69

**Fuente:** [src/shared/composables/usePagedList.ts](../../../../../src/shared/composables/usePagedList.ts) · línea 9, columna 69. **Declaración:** inline object.

| Miembro | Firma completa |
| --- | --- |
| `initialQuery` | `initialQuery: Query;` |
| `request` | `request: (query: Query, signal: AbortSignal) => Promise<PageResult<Row>>;` |
| `errorMessage` | `errorMessage: string;` |
| `canLoad` | `canLoad?: () => boolean;` |
| `onError` | `onError: (cause: unknown) => void;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [PageResult](../../../../../src/shared/http/pageRequest.ts) | `request` |

**Figura:** `DIA-VUE-TS-SHARED-34-1`.

```mermaid
classDiagram
    direction LR
    class Subject["usePagedList.options@9:69"] {
        <<inline_object>>
        initialQuery: Query
        request: callback
        errorMessage: string
        canLoad?: callback
        onError: callback
    }
    class R0["PageResult"] {
        <<reference>>
    }
    Subject ..> R0 : request
```

## useRecordSave.options@4:58

**Fuente:** [src/shared/composables/useRecordSave.ts](../../../../../src/shared/composables/useRecordSave.ts) · línea 4, columna 58. **Declaración:** inline object.

| Miembro | Firma completa |
| --- | --- |
| `setErrors` | `setErrors: (errors: Record<string, string>) => void;` |
| `onSaved` | `onSaved: (result: Result) => void;` |
| `onDenied` | `onDenied: (status: number) => void;` |
| `errorMessage` | `errorMessage?: string;` |

**Figura:** `DIA-VUE-TS-SHARED-35-1`.

```mermaid
classDiagram
    direction LR
    class Subject["useRecordSave.options@4:58"] {
        <<inline_object>>
        setErrors: callback
        onSaved: callback
        onDenied: callback
        errorMessage?: string
    }
```

## TableOptions

**Fuente:** [src/shared/composables/useTableQuery.ts](../../../../../src/shared/composables/useTableQuery.ts) · línea 5, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `page` | `page: number;` |
| `itemsPerPage` | `itemsPerPage: number;` |
| `sortBy` | `sortBy: DataTableSortItem[];` |

**Figura:** `DIA-VUE-TS-SHARED-36-1`.

```mermaid
classDiagram
    direction LR
    class Subject["TableOptions"] {
        <<interface>>
        page: number
        itemsPerPage: number
        sortBy: DataTableSortItem[]
    }
```

## TableQuery

**Fuente:** [src/shared/composables/useTableQuery.ts](../../../../../src/shared/composables/useTableQuery.ts) · línea 11, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
Pick<RecordQuery, 'direction'> & { orderColumn?: number }
```

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [RecordQuery](../../../../../src/shared/list.ts) | `type` |
| dependency | [TableQuery@11:52](../../../../../src/shared/composables/useTableQuery.ts) | `type` |

**Figura:** `DIA-VUE-TS-SHARED-37-1`.

```mermaid
classDiagram
    direction LR
    class Subject["TableQuery"] {
        <<type>>
    }
    class R0["RecordQuery"] {
        <<reference>>
    }
    class R1["TableQuery@11:52"] {
        <<reference>>
    }
    Subject ..> R0 : type
    Subject ..> R1 : type
```

## TableQuery@11:52

**Fuente:** [src/shared/composables/useTableQuery.ts](../../../../../src/shared/composables/useTableQuery.ts) · línea 11, columna 52. **Declaración:** inline object.

| Miembro | Firma completa |
| --- | --- |
| `orderColumn` | `orderColumn?: number` |

**Figura:** `DIA-VUE-TS-SHARED-38-1`.

```mermaid
classDiagram
    direction LR
    class Subject["TableQuery@11:52"] {
        <<inline_object>>
        orderColumn?: number
    }
```

## useVisibleRefresh.options@3:44

**Fuente:** [src/shared/composables/useVisibleRefresh.ts](../../../../../src/shared/composables/useVisibleRefresh.ts) · línea 3, columna 44. **Declaración:** inline object.

| Miembro | Firma completa |
| --- | --- |
| `refresh` | `refresh: () => unknown;` |
| `canRefresh` | `canRefresh: () => boolean;` |
| `lastAttemptAt` | `lastAttemptAt: () => number;` |
| `intervalMs` | `intervalMs?: number;` |

**Figura:** `DIA-VUE-TS-SHARED-39-1`.

```mermaid
classDiagram
    direction LR
    class Subject["useVisibleRefresh.<br/>options@3:44"] {
        <<inline_object>>
        refresh: callback
        canRefresh: callback
        lastAttemptAt: callback
        intervalMs?: number
    }
```

## ApiRequestConfig

**Fuente:** [src/shared/http/apiClient.ts](../../../../../src/shared/http/apiClient.ts) · línea 6, columna 1. **Declaración:** interface.

**Extensión/implementación:** `extends AxiosRequestConfig`.

| Miembro | Firma completa |
| --- | --- |
| `requiresAuth` | `requiresAuth?: boolean;` |

**Figura:** `DIA-VUE-TS-SHARED-40-1`.

```mermaid
classDiagram
    direction LR
    class Subject["ApiRequestConfig"] {
        <<interface>>
        requiresAuth?: boolean
    }
```

## RetriableRequest

**Fuente:** [src/shared/http/apiClient.ts](../../../../../src/shared/http/apiClient.ts) · línea 9, columna 1. **Declaración:** interface.

**Extensión/implementación:** `extends InternalAxiosRequestConfig`.

| Miembro | Firma completa |
| --- | --- |
| `requiresAuth` | `requiresAuth?: boolean;` |
| `hasRetried` | `hasRetried?: boolean;` |

**Figura:** `DIA-VUE-TS-SHARED-41-1`.

```mermaid
classDiagram
    direction LR
    class Subject["RetriableRequest"] {
        <<interface>>
        requiresAuth?: boolean
        hasRetried?: boolean
    }
```

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

**Figura:** `DIA-VUE-TS-SHARED-42-1`.

```mermaid
classDiagram
    direction LR
    class Subject["ApiError"] {
        <<class>>
        constructor(...)
        status: inferred
        code: inferred
        fieldErrors: Record~string, string~
        meta: Record~string, unknown~
    }
```

## PageResult

**Fuente:** [src/shared/http/pageRequest.ts](../../../../../src/shared/http/pageRequest.ts) · línea 5, columna 1. **Declaración:** interface.

**Parámetros:** `T`.

| Miembro | Firma completa |
| --- | --- |
| `data` | `data: T[];` |
| `recordsFiltered` | `recordsFiltered: number;` |
| `recordsTotal` | `recordsTotal: number;` |

**Figura:** `DIA-VUE-TS-SHARED-43-1`.

```mermaid
classDiagram
    direction LR
    class Subject["PageResult"] {
        <<interface>>
        data: T[]
        recordsFiltered: number
        recordsTotal: number
    }
```

## readRecord@7:30

**Fuente:** [src/shared/http/recordContract.ts](../../../../../src/shared/http/recordContract.ts) · línea 7, columna 30. **Declaración:** inline object.

| Miembro | Firma completa |
| --- | --- |
| `id` | `id: string;` |
| `version` | `version: number` |

**Figura:** `DIA-VUE-TS-SHARED-44-1`.

```mermaid
classDiagram
    direction LR
    class Subject["readRecord@7:30"] {
        <<inline_object>>
        id: string
        version: number
    }
```

## MutationConfirmation

**Fuente:** [src/shared/http/recordContract.ts](../../../../../src/shared/http/recordContract.ts) · línea 35, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `code` | `code: string;` |
| `message` | `message: string;` |

**Figura:** `DIA-VUE-TS-SHARED-45-1`.

```mermaid
classDiagram
    direction LR
    class Subject["MutationConfirmation"] {
        <<interface>>
        code: string
        message: string
    }
```

## RecordQuery

**Fuente:** [src/shared/list.ts](../../../../../src/shared/list.ts) · línea 1, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `page` | `page: number;` |
| `length` | `length: number;` |
| `search` | `search: string;` |
| `orderColumn` | `orderColumn: number;` |
| `direction` | `direction: 'asc' \| 'desc';` |

**Figura:** `DIA-VUE-TS-SHARED-46-1`.

```mermaid
classDiagram
    direction LR
    class Subject["RecordQuery"] {
        <<interface>>
        page: number
        length: number
        search: string
        orderColumn: number
        direction: 'asc' | 'desc'
    }
```

## LookupItem

**Fuente:** [src/shared/lookup.ts](../../../../../src/shared/lookup.ts) · línea 1, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `id` | `id: string;` |
| `title` | `title: string;` |
| `data` | `data: Record<string, unknown>;` |
| `isDisabled` | `isDisabled?: boolean;` |

**Figura:** `DIA-VUE-TS-SHARED-47-1`.

```mermaid
classDiagram
    direction LR
    class Subject["LookupItem"] {
        <<interface>>
        id: string
        title: string
        data: Record~string, unknown~
        isDisabled?: boolean
    }
```

## LookupState

**Fuente:** [src/shared/lookup.ts](../../../../../src/shared/lookup.ts) · línea 8, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `items` | `items: LookupItem[];` |
| `isLoading` | `isLoading: boolean;` |
| `error` | `error: string;` |
| `hasMore` | `hasMore: boolean;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [LookupItem](../../../../../src/shared/lookup.ts) | `items` |

**Figura:** `DIA-VUE-TS-SHARED-48-1`.

```mermaid
classDiagram
    direction LR
    class Subject["LookupState"] {
        <<interface>>
        items: LookupItem[]
        isLoading: boolean
        error: string
        hasMore: boolean
    }
    class R0["LookupItem"] {
        <<reference>>
    }
    Subject --> "0..*" R0 : items
```

## LookupCreation

**Fuente:** [src/shared/lookup.ts](../../../../../src/shared/lookup.ts) · línea 14, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `search` | `search: string;` |
| `onCreated` | `onCreated: (item: LookupItem) => void;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [LookupItem](../../../../../src/shared/lookup.ts) | `onCreated` |

**Figura:** `DIA-VUE-TS-SHARED-49-1`.

```mermaid
classDiagram
    direction LR
    class Subject["LookupCreation"] {
        <<interface>>
        search: string
        onCreated: callback
    }
    class R0["LookupItem"] {
        <<reference>>
    }
    Subject ..> R0 : onCreated
```

## OrganizationResource

**Fuente:** [src/shared/lookup.ts](../../../../../src/shared/lookup.ts) · línea 18, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
'departments' | 'roles'
```

## OrganizationState

**Fuente:** [src/shared/lookup.ts](../../../../../src/shared/lookup.ts) · línea 19, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
Record<OrganizationResource, LookupState>
```

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [OrganizationState.expanded](../../../../../src/shared/lookup.ts) | `evaluated structure` |
| dependency | [OrganizationResource](../../../../../src/shared/lookup.ts) | `type` |
| dependency | [LookupState](../../../../../src/shared/lookup.ts) | `type` |

**Figura:** `DIA-VUE-TS-SHARED-51-1`.

```mermaid
classDiagram
    direction LR
    class Subject["OrganizationState"] {
        <<type>>
    }
    class R0["OrganizationState.expanded"] {
        <<reference>>
    }
    class R1["OrganizationResource"] {
        <<reference>>
    }
    class R2["LookupState"] {
        <<reference>>
    }
    Subject ..> R0 : evaluated structure
    Subject ..> R1 : type
    Subject ..> R2 : type
```

## ReportScope

**Fuente:** [src/shared/report.ts](../../../../../src/shared/report.ts) · línea 1, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `mode` | `mode: 'filtered' \| 'current-month' \| 'specific-month';` |
| `month` | `month: string;` |

**Figura:** `DIA-VUE-TS-SHARED-52-1`.

```mermaid
classDiagram
    direction LR
    class Subject["ReportScope"] {
        <<interface>>
        mode: complex
        month: string
    }
```

## dateRangeError.filters@21:41

**Fuente:** [src/shared/report.ts](../../../../../src/shared/report.ts) · línea 21, columna 41. **Declaración:** inline object.

| Miembro | Firma completa |
| --- | --- |
| `startDate` | `startDate: string;` |
| `endDate` | `endDate: string` |

**Figura:** `DIA-VUE-TS-SHARED-53-1`.

```mermaid
classDiagram
    direction LR
    class Subject["dateRangeError.filters@21:41"] {
        <<inline_object>>
        startDate: string
        endDate: string
    }
```

## confirmAction.options@27:46

**Fuente:** [src/shared/ui/feedback.ts](../../../../../src/shared/ui/feedback.ts) · línea 27, columna 46. **Declaración:** inline object.

| Miembro | Firma completa |
| --- | --- |
| `title` | `title: string;` |
| `description` | `description: string;` |
| `signal` | `signal: AbortSignal;` |
| `submit` | `submit?: () => Promise<void>;` |
| `confirmLabel` | `confirmLabel?: string;` |
| `failureMessage` | `failureMessage?: string;` |

**Figura:** `DIA-VUE-TS-SHARED-54-1`.

```mermaid
classDiagram
    direction LR
    class Subject["confirmAction.options@27:46"] {
        <<inline_object>>
        title: string
        description: string
        signal: AbortSignal
        submit?: callback
        confirmLabel?: string
        failureMessage?: string
    }
```

## useDocumentRead.return

**Fuente:** [src/shared/composables/useDocumentRead.ts](../../../../../src/shared/composables/useDocumentRead.ts) · línea 3, columna 32. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `document` | `"document": ShallowRef<Document \| undefined, Document \| undefined>;` |
| `isReading` | `"isReading": Ref<boolean, boolean>;` |
| `readError` | `"readError": Ref<string, string>;` |
| `load` | `"load": (id?: string) => Promise<Document \| undefined>;` |
| `close` | `"close": () => void;` |

**Figura:** `DIA-VUE-TS-SHARED-55-1`.

```mermaid
classDiagram
    direction LR
    class Subject["useDocumentRead.return"] {
        <<inferred_return>>
        document: complex
        isReading: Ref~boolean, boolean~
        readError: Ref~string, string~
        load: callback
        close: callback
    }
```

## useFileExport.return

**Fuente:** [src/shared/composables/useFileExport.ts](../../../../../src/shared/composables/useFileExport.ts) · línea 11, columna 30. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `isExporting` | `"isExporting": Ref<boolean, boolean>;` |
| `exportError` | `"exportError": Ref<string, string>;` |
| `exportReport` | `"exportReport": (scope: Scope) => Promise<void>;` |

**Figura:** `DIA-VUE-TS-SHARED-56-1`.

```mermaid
classDiagram
    direction LR
    class Subject["useFileExport.return"] {
        <<inferred_return>>
        isExporting: Ref~boolean, boolean~
        exportError: Ref~string, string~
        exportReport: callback
    }
```

## useFormInteraction.return

**Fuente:** [src/shared/composables/useFormInteraction.ts](../../../../../src/shared/composables/useFormInteraction.ts) · línea 11, columna 35. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `update` | `"update": (field: Field, value: Value) => void;` |
| `blur` | `"blur": (field: Field) => Promise<unknown> \| undefined;` |

**Figura:** `DIA-VUE-TS-SHARED-57-1`.

```mermaid
classDiagram
    direction LR
    class Subject["useFormInteraction.return"] {
        <<inferred_return>>
        update: callback
        blur: callback
    }
```

## useListEditor.return

**Fuente:** [src/shared/composables/useListEditor.ts](../../../../../src/shared/composables/useListEditor.ts) · línea 4, columna 30. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `editor` | `"editor": Ref<any, any> extends Target \| null ? ShallowRef<null, null> \| (Target extends Target & Ref<any, any> ? IfAny<Target, ShallowRef<Target, Target>, Target> : ShallowRef<Target, Target>) : ShallowRef<Target \| null, Target \| null>;` |
| `openEditor` | `"openEditor": (target: Target) => void;` |
| `closeEditor` | `"closeEditor": () => void;` |
| `reloadEditor` | `"reloadEditor": () => void;` |
| `onSaved` | `"onSaved": () => void;` |

**Figura:** `DIA-VUE-TS-SHARED-58-1`.

```mermaid
classDiagram
    direction LR
    class Subject["useListEditor.return"] {
        <<inferred_return>>
        editor: complex
        openEditor: callback
        closeEditor: callback
        reloadEditor: callback
        onSaved: callback
    }
```

## useListSearch.return

**Fuente:** [src/shared/composables/useListSearch.ts](../../../../../src/shared/composables/useListSearch.ts) · línea 8, columna 30. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `search` | `"search": Ref<string, string>;` |
| `applySearch` | `"applySearch": () => void;` |
| `clearSearch` | `"clearSearch": (filters?: Partial<Query>) => void;` |

**Figura:** `DIA-VUE-TS-SHARED-59-1`.

```mermaid
classDiagram
    direction LR
    class Subject["useListSearch.return"] {
        <<inferred_return>>
        search: Ref~string, string~
        applySearch: callback
        clearSearch: callback
    }
```

## useOrganizationOptions.return

**Fuente:** [src/shared/composables/useOrganizationOptions.ts](../../../../../src/shared/composables/useOrganizationOptions.ts) · línea 7, columna 39. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `departments` | `"departments": { state: ComputedRef<LookupState>; items: Ref<{ id: string; title: string; data: Record<string, unknown>; isDisabled?: boolean \| undefined; }[], LookupItem[] \| { id: string; title: string; data: Record<string, unknown>; isDisabled?: boolean \| undefined; }[]>; isLoading: Ref<boolean, boolean>; error: Ref<string, string>; search: Ref<string, string>; hasMore: Ref<boolean, boolean>; updateSearch: (value: string) => void; refresh: () => Promise<void>; loadMore: () => Promise<void> \| undefined; retry: () => Promise<void>; };` |
| `roles` | `"roles": { state: ComputedRef<LookupState>; items: Ref<{ id: string; title: string; data: Record<string, unknown>; isDisabled?: boolean \| undefined; }[], LookupItem[] \| { id: string; title: string; data: Record<string, unknown>; isDisabled?: boolean \| undefined; }[]>; isLoading: Ref<boolean, boolean>; error: Ref<string, string>; search: Ref<string, string>; hasMore: Ref<boolean, boolean>; updateSearch: (value: string) => void; refresh: () => Promise<void>; loadMore: () => Promise<void> \| undefined; retry: () => Promise<void>; };` |
| `state` | `"state": ComputedRef<OrganizationState>;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [useOrganizationOptions.return.departments.shape1](../../../../../src/shared/composables/useOrganizationOptions.ts) | `departments` |
| dependency | [useOrganizationOptions.return.roles.shape4](../../../../../src/shared/composables/useOrganizationOptions.ts) | `roles` |
| dependency | [OrganizationState](../../../../../src/shared/lookup.ts) | `state` |

**Figura:** `DIA-VUE-TS-SHARED-60-1`.

```mermaid
classDiagram
    direction LR
    class Subject["useOrganizationOptions.<br/>return"] {
        <<inferred_return>>
        departments: callback
        roles: callback
        state: ComputedRef~OrganizationState~
    }
    class R0["useOrganizationOptions.<br/>return.departments.shape1"] {
        <<reference>>
    }
    class R1["useOrganizationOptions.<br/>return.roles.shape4"] {
        <<reference>>
    }
    class R2["OrganizationState"] {
        <<reference>>
    }
    Subject ..> R0 : departments
    Subject ..> R1 : roles
    Subject ..> R2 : state
```

## useOrganizationOptions.return.departments.shape1

**Fuente:** [src/shared/composables/useOrganizationOptions.ts](../../../../../src/shared/composables/useOrganizationOptions.ts) · línea 7, columna 39. **Declaración:** inferred object.

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
| dependency | [useOrganizationOptions.return.departments.items.shape2](../../../../../src/shared/composables/useOrganizationOptions.ts) | `items` |
| dependency | [useOrganizationOptions.return.departments.items.shape3](../../../../../src/shared/composables/useOrganizationOptions.ts) | `items` |

**Figura:** `DIA-VUE-TS-SHARED-61-1`.

```mermaid
classDiagram
    direction LR
    class Subject["useOrganizationOptions.<br/>return.departments.shape1"] {
        <<inferred_object>>
        state: ComputedRef~LookupState~
        items: object
        isLoading: Ref~boolean, boolean~
        error: Ref~string, string~
        search: Ref~string, string~
        hasMore: Ref~boolean, boolean~
        updateSearch: callback
        refresh: callback
        loadMore: callback
        retry: callback
    }
    class R0["useOrganizationOptions.<br/>return.departments.items.<br/>shape2"] {
        <<reference>>
    }
    class R1["useOrganizationOptions.<br/>return.departments.items.<br/>shape3"] {
        <<reference>>
    }
    Subject ..> R0 : items
    Subject ..> R1 : items
```

## useOrganizationOptions.return.departments.items.shape2

**Fuente:** [src/shared/composables/useOrganizationOptions.ts](../../../../../src/shared/composables/useOrganizationOptions.ts) · línea 7, columna 39. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `id` | `id: string;` |
| `title` | `title: string;` |
| `data` | `data: Record<string, unknown>;` |
| `isDisabled` | `isDisabled?: boolean \| undefined;` |

**Figura:** `DIA-VUE-TS-SHARED-62-1`.

```mermaid
classDiagram
    direction LR
    class Subject["useOrganizationOptions.<br/>return.departments.items.<br/>shape2"] {
        <<inferred_object>>
        id: string
        title: string
        data: Record~string, unknown~
        isDisabled?: boolean | undefined
    }
```

## useOrganizationOptions.return.departments.items.shape3

**Fuente:** [src/shared/composables/useOrganizationOptions.ts](../../../../../src/shared/composables/useOrganizationOptions.ts) · línea 7, columna 39. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `id` | `id: string;` |
| `title` | `title: string;` |
| `data` | `data: Record<string, unknown>;` |
| `isDisabled` | `isDisabled?: boolean \| undefined;` |

**Figura:** `DIA-VUE-TS-SHARED-63-1`.

```mermaid
classDiagram
    direction LR
    class Subject["useOrganizationOptions.<br/>return.departments.items.<br/>shape3"] {
        <<inferred_object>>
        id: string
        title: string
        data: Record~string, unknown~
        isDisabled?: boolean | undefined
    }
```

## useOrganizationOptions.return.roles.shape4

**Fuente:** [src/shared/composables/useOrganizationOptions.ts](../../../../../src/shared/composables/useOrganizationOptions.ts) · línea 7, columna 39. **Declaración:** inferred object.

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
| dependency | [useOrganizationOptions.return.roles.items.shape5](../../../../../src/shared/composables/useOrganizationOptions.ts) | `items` |
| dependency | [useOrganizationOptions.return.roles.items.shape6](../../../../../src/shared/composables/useOrganizationOptions.ts) | `items` |

**Figura:** `DIA-VUE-TS-SHARED-64-1`.

```mermaid
classDiagram
    direction LR
    class Subject["useOrganizationOptions.<br/>return.roles.shape4"] {
        <<inferred_object>>
        state: ComputedRef~LookupState~
        items: object
        isLoading: Ref~boolean, boolean~
        error: Ref~string, string~
        search: Ref~string, string~
        hasMore: Ref~boolean, boolean~
        updateSearch: callback
        refresh: callback
        loadMore: callback
        retry: callback
    }
    class R0["useOrganizationOptions.<br/>return.roles.items.shape5"] {
        <<reference>>
    }
    class R1["useOrganizationOptions.<br/>return.roles.items.shape6"] {
        <<reference>>
    }
    Subject ..> R0 : items
    Subject ..> R1 : items
```

## useOrganizationOptions.return.roles.items.shape5

**Fuente:** [src/shared/composables/useOrganizationOptions.ts](../../../../../src/shared/composables/useOrganizationOptions.ts) · línea 7, columna 39. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `id` | `id: string;` |
| `title` | `title: string;` |
| `data` | `data: Record<string, unknown>;` |
| `isDisabled` | `isDisabled?: boolean \| undefined;` |

**Figura:** `DIA-VUE-TS-SHARED-65-1`.

```mermaid
classDiagram
    direction LR
    class Subject["useOrganizationOptions.<br/>return.roles.items.shape5"] {
        <<inferred_object>>
        id: string
        title: string
        data: Record~string, unknown~
        isDisabled?: boolean | undefined
    }
```

## useOrganizationOptions.return.roles.items.shape6

**Fuente:** [src/shared/composables/useOrganizationOptions.ts](../../../../../src/shared/composables/useOrganizationOptions.ts) · línea 7, columna 39. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `id` | `id: string;` |
| `title` | `title: string;` |
| `data` | `data: Record<string, unknown>;` |
| `isDisabled` | `isDisabled?: boolean \| undefined;` |

**Figura:** `DIA-VUE-TS-SHARED-66-1`.

```mermaid
classDiagram
    direction LR
    class Subject["useOrganizationOptions.<br/>return.roles.items.shape6"] {
        <<inferred_object>>
        id: string
        title: string
        data: Record~string, unknown~
        isDisabled?: boolean | undefined
    }
```

## usePagedList.return

**Fuente:** [src/shared/composables/usePagedList.ts](../../../../../src/shared/composables/usePagedList.ts) · línea 9, columna 29. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `query` | `"query": ShallowReactive<Query>;` |
| `rows` | `"rows": ShallowRef<Row[], Row[]>;` |
| `total` | `"total": Ref<number, number>;` |
| `isLoading` | `"isLoading": Ref<boolean, boolean>;` |
| `isRefreshing` | `"isRefreshing": Ref<boolean, boolean>;` |
| `error` | `"error": Ref<string, string>;` |
| `load` | `"load": () => Promise<void>;` |
| `refresh` | `"refresh": () => Promise<void>;` |
| `applyQuery` | `"applyQuery": (changes: Partial<Query>) => void;` |

**Figura:** `DIA-VUE-TS-SHARED-67-1`.

```mermaid
classDiagram
    direction LR
    class Subject["usePagedList.return"] {
        <<inferred_return>>
        query: ShallowReactive~Query~
        rows: ShallowRef~Row[], Row[]~
        total: Ref~number, number~
        isLoading: Ref~boolean, boolean~
        isRefreshing: Ref~boolean, boolean~
        error: Ref~string, string~
        load: callback
        refresh: callback
        applyQuery: callback
    }
```

## useRecordSave.return

**Fuente:** [src/shared/composables/useRecordSave.ts](../../../../../src/shared/composables/useRecordSave.ts) · línea 4, columna 30. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `message` | `"message": Ref<string, string>;` |
| `isSubmitting` | `"isSubmitting": Ref<boolean, boolean>;` |
| `isConflicted` | `"isConflicted": Ref<boolean, boolean>;` |
| `execute` | `"execute": (operation: (signal: AbortSignal) => Promise<Result>) => Promise<void>;` |
| `signal` | `"signal": AbortSignal;` |
| `isDisposed` | `"isDisposed": () => boolean;` |

**Figura:** `DIA-VUE-TS-SHARED-68-1`.

```mermaid
classDiagram
    direction LR
    class Subject["useRecordSave.return"] {
        <<inferred_return>>
        message: Ref~string, string~
        isSubmitting: Ref~boolean, boolean~
        isConflicted: Ref~boolean, boolean~
        execute: callback
        signal: AbortSignal
        isDisposed: callback
    }
```

## useRemoteLookup.return

**Fuente:** [src/shared/composables/useRemoteLookup.ts](../../../../../src/shared/composables/useRemoteLookup.ts) · línea 6, columna 32. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `state` | `"state": ComputedRef<LookupState>;` |
| `items` | `"items": Ref<{ id: string; title: string; data: Record<string, unknown>; isDisabled?: boolean \| undefined; }[], LookupItem[] \| { id: string; title: string; data: Record<string, unknown>; isDisabled?: boolean \| undefined; }[]>;` |
| `isLoading` | `"isLoading": Ref<boolean, boolean>;` |
| `error` | `"error": Ref<string, string>;` |
| `search` | `"search": Ref<string, string>;` |
| `hasMore` | `"hasMore": Ref<boolean, boolean>;` |
| `updateSearch` | `"updateSearch": (value: string) => void;` |
| `refresh` | `"refresh": () => Promise<void>;` |
| `loadMore` | `"loadMore": () => Promise<void> \| undefined;` |
| `retry` | `"retry": () => Promise<void>;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [LookupState](../../../../../src/shared/lookup.ts) | `state` |
| dependency | [useRemoteLookup.return.items.shape1](../../../../../src/shared/composables/useRemoteLookup.ts) | `items` |
| dependency | [LookupItem](../../../../../src/shared/lookup.ts) | `items` |
| dependency | [useRemoteLookup.return.items.shape2](../../../../../src/shared/composables/useRemoteLookup.ts) | `items` |

**Figura:** `DIA-VUE-TS-SHARED-69-1`.

```mermaid
classDiagram
    direction LR
    class Subject["useRemoteLookup.return"] {
        <<inferred_return>>
        state: ComputedRef~LookupState~
        items: object
        isLoading: Ref~boolean, boolean~
        error: Ref~string, string~
        search: Ref~string, string~
        hasMore: Ref~boolean, boolean~
        updateSearch: callback
        refresh: callback
        loadMore: callback
        retry: callback
    }
    class R0["LookupState"] {
        <<reference>>
    }
    class R1["useRemoteLookup.return.items.<br/>shape1"] {
        <<reference>>
    }
    class R2["LookupItem"] {
        <<reference>>
    }
    class R3["useRemoteLookup.return.items.<br/>shape2"] {
        <<reference>>
    }
    Subject ..> R0 : state
    Subject ..> R1 : items
    Subject ..> R2 : items
    Subject ..> R3 : items
```

## useRemoteLookup.return.items.shape1

**Fuente:** [src/shared/composables/useRemoteLookup.ts](../../../../../src/shared/composables/useRemoteLookup.ts) · línea 6, columna 32. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `id` | `id: string;` |
| `title` | `title: string;` |
| `data` | `data: Record<string, unknown>;` |
| `isDisabled` | `isDisabled?: boolean \| undefined;` |

**Figura:** `DIA-VUE-TS-SHARED-70-1`.

```mermaid
classDiagram
    direction LR
    class Subject["useRemoteLookup.return.items.<br/>shape1"] {
        <<inferred_object>>
        id: string
        title: string
        data: Record~string, unknown~
        isDisabled?: boolean | undefined
    }
```

## useRemoteLookup.return.items.shape2

**Fuente:** [src/shared/composables/useRemoteLookup.ts](../../../../../src/shared/composables/useRemoteLookup.ts) · línea 6, columna 32. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `id` | `id: string;` |
| `title` | `title: string;` |
| `data` | `data: Record<string, unknown>;` |
| `isDisabled` | `isDisabled?: boolean \| undefined;` |

**Figura:** `DIA-VUE-TS-SHARED-71-1`.

```mermaid
classDiagram
    direction LR
    class Subject["useRemoteLookup.return.items.<br/>shape2"] {
        <<inferred_object>>
        id: string
        title: string
        data: Record~string, unknown~
        isDisabled?: boolean | undefined
    }
```

## useReportScope.return

**Fuente:** [src/shared/composables/useReportScope.ts](../../../../../src/shared/composables/useReportScope.ts) · línea 7, columna 31. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `isReportOpen` | `"isReportOpen": Ref<boolean, boolean>;` |
| `reportValues` | `"reportValues": { mode: "filtered" \| "current-month" \| "specific-month"; month: string; };` |
| `reportFormError` | `"reportFormError": Ref<string, string>;` |
| `openReport` | `"openReport": () => void;` |
| `exportReport` | `"exportReport": () => Promise<void>;` |
| `setReportMode` | `"setReportMode": (value: ReportScope["mode"]) => void;` |
| `setReportMonth` | `"setReportMonth": (value: string) => void;` |
| `isExporting` | `"isExporting": Ref<boolean, boolean>;` |
| `exportError` | `"exportError": Ref<string, string>;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [useReportScope.return.reportValues.shape1](../../../../../src/shared/composables/useReportScope.ts) | `reportValues` |
| dependency | [ReportScope](../../../../../src/shared/report.ts) | `setReportMode` |

**Figura:** `DIA-VUE-TS-SHARED-72-1`.

```mermaid
classDiagram
    direction LR
    class Subject["useReportScope.return"] {
        <<inferred_return>>
        isReportOpen: Ref~boolean, boolean~
        reportValues: object
        reportFormError: Ref~string, string~
        openReport: callback
        exportReport: callback
        setReportMode: callback
        setReportMonth: callback
        isExporting: Ref~boolean, boolean~
        exportError: Ref~string, string~
    }
    class R0["useReportScope.return.<br/>reportValues.shape1"] {
        <<reference>>
    }
    class R1["ReportScope"] {
        <<reference>>
    }
    Subject --> "1" R0 : reportValues
    Subject ..> R1 : setReportMode
```

## useReportScope.return.reportValues.shape1

**Fuente:** [src/shared/composables/useReportScope.ts](../../../../../src/shared/composables/useReportScope.ts) · línea 7, columna 31. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `mode` | `mode: "filtered" \| "current-month" \| "specific-month";` |
| `month` | `month: string;` |

**Figura:** `DIA-VUE-TS-SHARED-73-1`.

```mermaid
classDiagram
    direction LR
    class Subject["useReportScope.return.<br/>reportValues.shape1"] {
        <<inferred_object>>
        mode: complex
        month: string
    }
```

## useSelectedOption.return

**Fuente:** [src/shared/composables/useSelectedOption.ts](../../../../../src/shared/composables/useSelectedOption.ts) · línea 6, columna 34. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `value` | `"value": LookupItem \| undefined;` |
| `__@RefSymbol@164` | `"__@RefSymbol@164": true;` |
| `__@ShallowRefMarker@171` | `"__@ShallowRefMarker@171"?: true \| undefined;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [LookupItem](../../../../../src/shared/lookup.ts) | `value` |

**Figura:** `DIA-VUE-TS-SHARED-74-1`.

```mermaid
classDiagram
    direction LR
    class Subject["useSelectedOption.return"] {
        <<inferred_return>>
        value: LookupItem | undefined
        __@RefSymbol@164: true
        __@ShallowRefMarker@171?: true | undefined
    }
    class R0["LookupItem"] {
        <<reference>>
    }
    Subject --> "0..1" R0 : value
```

## useTableQuery.return

**Fuente:** [src/shared/composables/useTableQuery.ts](../../../../../src/shared/composables/useTableQuery.ts) · línea 14, columna 30. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `sortBy` | `"sortBy": ComputedRef<DataTableSortItem[]>;` |
| `changesFromOptions` | `"changesFromOptions": (options: TableOptions) => Omit<RecordQuery, "search">;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [TableOptions](../../../../../src/shared/composables/useTableQuery.ts) | `changesFromOptions` |
| dependency | [RecordQuery](../../../../../src/shared/list.ts) | `changesFromOptions` |

**Figura:** `DIA-VUE-TS-SHARED-75-1`.

```mermaid
classDiagram
    direction LR
    class Subject["useTableQuery.return"] {
        <<inferred_return>>
        sortBy: ComputedRef~DataTableSortItem[]~
        changesFromOptions: callback
    }
    class R0["TableOptions"] {
        <<reference>>
    }
    class R1["RecordQuery"] {
        <<reference>>
    }
    Subject ..> R0 : changesFromOptions
    Subject ..> R1 : changesFromOptions
```

## createApiClient.return

**Fuente:** [src/shared/http/apiClient.ts](../../../../../src/shared/http/apiClient.ts) · línea 14, columna 32. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `request` | `"request": <T>(url: string, options?: ApiRequestConfig) => Promise<T>;` |
| `http` | `"http": AxiosInstance;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [ApiRequestConfig](../../../../../src/shared/http/apiClient.ts) | `request` |

**Figura:** `DIA-VUE-TS-SHARED-76-1`.

```mermaid
classDiagram
    direction LR
    class Subject["createApiClient.return"] {
        <<inferred_return>>
        request: callback
        http: AxiosInstance
    }
    class R0["ApiRequestConfig"] {
        <<reference>>
    }
    Subject ..> R0 : request
```

## normalizeApiError.return

**Fuente:** [src/shared/http/apiError.ts](../../../../../src/shared/http/apiError.ts) · línea 23, columna 34. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `status` | `"status": number;` |
| `code` | `"code": string;` |
| `fieldErrors` | `"fieldErrors": Record<string, string>;` |
| `meta` | `"meta": Record<string, unknown>;` |
| `name` | `"name": string;` |
| `message` | `"message": string;` |
| `stack` | `"stack"?: string \| undefined;` |
| `cause` | `"cause"?: unknown;` |

**Figura:** `DIA-VUE-TS-SHARED-77-1`.

```mermaid
classDiagram
    direction LR
    class Subject["normalizeApiError.return"] {
        <<inferred_return>>
        status: number
        code: string
        fieldErrors: Record~string, string~
        meta: Record~string, unknown~
        name: string
        message: string
        stack?: string | undefined
        cause?: unknown
    }
```

## requestPage.return

**Fuente:** [src/shared/http/pageRequest.ts](../../../../../src/shared/http/pageRequest.ts) · línea 11, columna 28. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `data` | `"data": Record<string, unknown>[];` |
| `recordsFiltered` | `"recordsFiltered": number;` |
| `recordsTotal` | `"recordsTotal": number;` |

**Figura:** `DIA-VUE-TS-SHARED-78-1`.

```mermaid
classDiagram
    direction LR
    class Subject["requestPage.return"] {
        <<inferred_return>>
        data: Record~string, unknown~[]
        recordsFiltered: number
        recordsTotal: number
    }
```

## readRecord.return

**Fuente:** [src/shared/http/recordContract.ts](../../../../../src/shared/http/recordContract.ts) · línea 5, columna 27. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `id` | `"id": string;` |
| `version` | `"version": number;` |

**Figura:** `DIA-VUE-TS-SHARED-79-1`.

```mermaid
classDiagram
    direction LR
    class Subject["readRecord.return"] {
        <<inferred_return>>
        id: string
        version: number
    }
```

## confirmMutation.return

**Fuente:** [src/shared/http/recordContract.ts](../../../../../src/shared/http/recordContract.ts) · línea 40, columna 32. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `code` | `"code": string;` |
| `message` | `"message": string;` |

**Figura:** `DIA-VUE-TS-SHARED-80-1`.

```mermaid
classDiagram
    direction LR
    class Subject["confirmMutation.return"] {
        <<inferred_return>>
        code: string
        message: string
    }
```

## recordParams.return

**Fuente:** [src/shared/http/recordParams.ts](../../../../../src/shared/http/recordParams.ts) · línea 3, columna 29. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `size` | `"size": number;` |
| `append` | `"append": (name: string, value: string) => void;` |
| `delete` | `"delete": (name: string, value?: string) => void;` |
| `get` | `"get": (name: string) => string \| null;` |
| `getAll` | `"getAll": (name: string) => string[];` |
| `has` | `"has": (name: string, value?: string) => boolean;` |
| `set` | `"set": (name: string, value: string) => void;` |
| `sort` | `"sort": () => void;` |
| `toString` | `"toString": () => string;` |
| `forEach` | `"forEach": (callbackfn: (value: string, key: string, parent: URLSearchParams) => void, thisArg?: any) => void;` |
| `entries` | `"entries": () => URLSearchParamsIterator<[string, string]>;` |
| `keys` | `"keys": () => URLSearchParamsIterator<string>;` |
| `values` | `"values": () => URLSearchParamsIterator<string>;` |
| `__@iterator@308` | `"__@iterator@308": () => URLSearchParamsIterator<[string, string]>;` |

**Figura:** `DIA-VUE-TS-SHARED-81-1`.

```mermaid
classDiagram
    direction LR
    class Subject["recordParams.return"] {
        <<inferred_return>>
        size: number
        append: callback
        delete: callback
        get: callback
        getAll: callback
        has: callback
        set: callback
        sort: callback
        toString: callback
        forEach: callback
        entries: callback
        keys: callback
        values: callback
        __@iterator@308: callback
    }
```

## requestExcel.return

**Fuente:** [src/shared/http/requestExcel.ts](../../../../../src/shared/http/requestExcel.ts) · línea 3, columna 29. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `size` | `"size": number;` |
| `type` | `"type": string;` |
| `arrayBuffer` | `"arrayBuffer": () => Promise<ArrayBuffer>;` |
| `bytes` | `"bytes": () => Promise<Uint8Array<ArrayBuffer>>;` |
| `slice` | `"slice": (start?: number, end?: number, contentType?: string) => Blob;` |
| `stream` | `"stream": () => ReadableStream<Uint8Array<ArrayBuffer>>;` |
| `text` | `"text": () => Promise<string>;` |

**Figura:** `DIA-VUE-TS-SHARED-82-1`.

```mermaid
classDiagram
    direction LR
    class Subject["requestExcel.return"] {
        <<inferred_return>>
        size: number
        type: string
        arrayBuffer: callback
        bytes: callback
        slice: callback
        stream: callback
        text: callback
    }
```

## initialRecordQuery.return

**Fuente:** [src/shared/list.ts](../../../../../src/shared/list.ts) · línea 9, columna 35. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `page` | `"page": number;` |
| `length` | `"length": number;` |
| `search` | `"search": string;` |
| `orderColumn` | `"orderColumn": number;` |
| `direction` | `"direction": "asc" \| "desc";` |

**Figura:** `DIA-VUE-TS-SHARED-83-1`.

```mermaid
classDiagram
    direction LR
    class Subject["initialRecordQuery.return"] {
        <<inferred_return>>
        page: number
        length: number
        search: string
        orderColumn: number
        direction: "asc" | "desc"
    }
```

## OrganizationState.expanded

**Fuente:** [src/shared/lookup.ts](../../../../../src/shared/lookup.ts) · línea 19, columna 1. **Declaración:** evaluated alias.

| Miembro | Firma completa |
| --- | --- |
| `departments` | `"departments": LookupState;` |
| `roles` | `"roles": LookupState;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [LookupState](../../../../../src/shared/lookup.ts) | `departments` |
| association | [LookupState](../../../../../src/shared/lookup.ts) | `roles` |

**Figura:** `DIA-VUE-TS-SHARED-84-1`.

```mermaid
classDiagram
    direction LR
    class Subject["OrganizationState.expanded"] {
        <<evaluated_alias>>
        departments: LookupState
        roles: LookupState
    }
    class R0["LookupState"] {
        <<reference>>
    }
    Subject --> "1" R0 : departments
    Subject --> "1" R0 : roles
```

## organizationService

**Fuente:** [src/shared/services/organizationService.ts](../../../../../src/shared/services/organizationService.ts) · línea 5, columna 14. **Declaración:** inferred export.

| Miembro | Firma completa |
| --- | --- |
| `options` | `"options": (resource: "departments" \| "roles", search: string, page: number, signal: AbortSignal) => Promise<{ data: LookupItem[]; recordsFiltered: number; recordsTotal: number; }>;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [organizationService.options.shape1](../../../../../src/shared/services/organizationService.ts) | `options` |

**Figura:** `DIA-VUE-TS-SHARED-85-1`.

```mermaid
classDiagram
    direction LR
    class Subject["organizationService"] {
        <<inferred_export>>
        options: callback
    }
    class R0["organizationService.options.<br/>shape1"] {
        <<reference>>
    }
    Subject ..> R0 : options
```

## organizationService.options.shape1

**Fuente:** [src/shared/services/organizationService.ts](../../../../../src/shared/services/organizationService.ts) · línea 5, columna 14. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `data` | `data: LookupItem[];` |
| `recordsFiltered` | `recordsFiltered: number;` |
| `recordsTotal` | `recordsTotal: number;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [LookupItem](../../../../../src/shared/lookup.ts) | `data` |

**Figura:** `DIA-VUE-TS-SHARED-86-1`.

```mermaid
classDiagram
    direction LR
    class Subject["organizationService.options.<br/>shape1"] {
        <<inferred_object>>
        data: LookupItem[]
        recordsFiltered: number
        recordsTotal: number
    }
    class R0["LookupItem"] {
        <<reference>>
    }
    Subject --> "0..*" R0 : data
```

## controlDefaults

**Fuente:** [src/shared/ui/controlDefaults.ts](../../../../../src/shared/ui/controlDefaults.ts) · línea 2, columna 14. **Declaración:** inferred export.

| Miembro | Firma completa |
| --- | --- |
| `VBtn` | `"VBtn": { class: string; rounded: string; elevation: number; };` |
| `VTextField` | `"VTextField": { class: string; variant: string; density: string; rounded: string; color: string; hideDetails: string; };` |
| `VTextarea` | `"VTextarea": { class: string; variant: string; density: string; rounded: string; color: string; hideDetails: string; };` |
| `VAutocomplete` | `"VAutocomplete": { class: string; variant: string; density: string; rounded: string; color: string; hideDetails: string; };` |
| `VSelect` | `"VSelect": { class: string; variant: string; density: string; rounded: string; color: string; hideDetails: string; };` |
| `VCheckbox` | `"VCheckbox": { density: string; color: string; hideDetails: string; };` |
| `VDataTableServer` | `"VDataTableServer": { density: string; hover: boolean; };` |
| `VTooltip` | `"VTooltip": { contentClass: string; };` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [controlDefaults.VBtn.shape1](../../../../../src/shared/ui/controlDefaults.ts) | `VBtn` |
| association | [controlDefaults.VTextField.shape2](../../../../../src/shared/ui/controlDefaults.ts) | `VTextField` |
| association | [controlDefaults.VTextarea.shape3](../../../../../src/shared/ui/controlDefaults.ts) | `VTextarea` |
| association | [controlDefaults.VAutocomplete.shape4](../../../../../src/shared/ui/controlDefaults.ts) | `VAutocomplete` |
| association | [controlDefaults.VSelect.shape5](../../../../../src/shared/ui/controlDefaults.ts) | `VSelect` |
| association | [controlDefaults.VCheckbox.shape6](../../../../../src/shared/ui/controlDefaults.ts) | `VCheckbox` |
| association | [controlDefaults.VDataTableServer.shape7](../../../../../src/shared/ui/controlDefaults.ts) | `VDataTableServer` |
| association | [controlDefaults.VTooltip.shape8](../../../../../src/shared/ui/controlDefaults.ts) | `VTooltip` |

**Figura:** `DIA-VUE-TS-SHARED-87-1`. Parte 1/2.

```mermaid
classDiagram
    direction LR
    class Subject["controlDefaults"] {
        <<inferred_export>>
        VBtn: object
        VTextField: object
        VTextarea: object
        VAutocomplete: object
    }
    class R0["controlDefaults.VBtn.shape1"] {
        <<reference>>
    }
    class R1["controlDefaults.VTextField.<br/>shape2"] {
        <<reference>>
    }
    class R2["controlDefaults.VTextarea.<br/>shape3"] {
        <<reference>>
    }
    class R3["controlDefaults.<br/>VAutocomplete.shape4"] {
        <<reference>>
    }
    Subject --> "1" R0 : VBtn
    Subject --> "1" R1 : VTextField
    Subject --> "1" R2 : VTextarea
    Subject --> "1" R3 : VAutocomplete
```

**Figura:** `DIA-VUE-TS-SHARED-87-2`. Parte 2/2.

```mermaid
classDiagram
    direction LR
    class Subject["controlDefaults"] {
        <<inferred_export>>
        VSelect: object
        VCheckbox: object
        VDataTableServer: object
        VTooltip: object
    }
    class R0["controlDefaults.VSelect.<br/>shape5"] {
        <<reference>>
    }
    class R1["controlDefaults.VCheckbox.<br/>shape6"] {
        <<reference>>
    }
    class R2["controlDefaults.<br/>VDataTableServer.shape7"] {
        <<reference>>
    }
    class R3["controlDefaults.VTooltip.<br/>shape8"] {
        <<reference>>
    }
    Subject --> "1" R0 : VSelect
    Subject --> "1" R1 : VCheckbox
    Subject --> "1" R2 : VDataTableServer
    Subject --> "1" R3 : VTooltip
```

## controlDefaults.VBtn.shape1

**Fuente:** [src/shared/ui/controlDefaults.ts](../../../../../src/shared/ui/controlDefaults.ts) · línea 2, columna 14. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `class` | `class: string;` |
| `rounded` | `rounded: string;` |
| `elevation` | `elevation: number;` |

**Figura:** `DIA-VUE-TS-SHARED-88-1`.

```mermaid
classDiagram
    direction LR
    class Subject["controlDefaults.VBtn.shape1"] {
        <<inferred_object>>
        class: string
        rounded: string
        elevation: number
    }
```

## controlDefaults.VTextField.shape2

**Fuente:** [src/shared/ui/controlDefaults.ts](../../../../../src/shared/ui/controlDefaults.ts) · línea 2, columna 14. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `class` | `class: string;` |
| `variant` | `variant: string;` |
| `density` | `density: string;` |
| `rounded` | `rounded: string;` |
| `color` | `color: string;` |
| `hideDetails` | `hideDetails: string;` |

**Figura:** `DIA-VUE-TS-SHARED-89-1`.

```mermaid
classDiagram
    direction LR
    class Subject["controlDefaults.VTextField.<br/>shape2"] {
        <<inferred_object>>
        class: string
        variant: string
        density: string
        rounded: string
        color: string
        hideDetails: string
    }
```

## controlDefaults.VTextarea.shape3

**Fuente:** [src/shared/ui/controlDefaults.ts](../../../../../src/shared/ui/controlDefaults.ts) · línea 2, columna 14. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `class` | `class: string;` |
| `variant` | `variant: string;` |
| `density` | `density: string;` |
| `rounded` | `rounded: string;` |
| `color` | `color: string;` |
| `hideDetails` | `hideDetails: string;` |

**Figura:** `DIA-VUE-TS-SHARED-90-1`.

```mermaid
classDiagram
    direction LR
    class Subject["controlDefaults.VTextarea.<br/>shape3"] {
        <<inferred_object>>
        class: string
        variant: string
        density: string
        rounded: string
        color: string
        hideDetails: string
    }
```

## controlDefaults.VAutocomplete.shape4

**Fuente:** [src/shared/ui/controlDefaults.ts](../../../../../src/shared/ui/controlDefaults.ts) · línea 2, columna 14. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `class` | `class: string;` |
| `variant` | `variant: string;` |
| `density` | `density: string;` |
| `rounded` | `rounded: string;` |
| `color` | `color: string;` |
| `hideDetails` | `hideDetails: string;` |

**Figura:** `DIA-VUE-TS-SHARED-91-1`.

```mermaid
classDiagram
    direction LR
    class Subject["controlDefaults.<br/>VAutocomplete.shape4"] {
        <<inferred_object>>
        class: string
        variant: string
        density: string
        rounded: string
        color: string
        hideDetails: string
    }
```

## controlDefaults.VSelect.shape5

**Fuente:** [src/shared/ui/controlDefaults.ts](../../../../../src/shared/ui/controlDefaults.ts) · línea 2, columna 14. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `class` | `class: string;` |
| `variant` | `variant: string;` |
| `density` | `density: string;` |
| `rounded` | `rounded: string;` |
| `color` | `color: string;` |
| `hideDetails` | `hideDetails: string;` |

**Figura:** `DIA-VUE-TS-SHARED-92-1`.

```mermaid
classDiagram
    direction LR
    class Subject["controlDefaults.VSelect.<br/>shape5"] {
        <<inferred_object>>
        class: string
        variant: string
        density: string
        rounded: string
        color: string
        hideDetails: string
    }
```

## controlDefaults.VCheckbox.shape6

**Fuente:** [src/shared/ui/controlDefaults.ts](../../../../../src/shared/ui/controlDefaults.ts) · línea 2, columna 14. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `density` | `density: string;` |
| `color` | `color: string;` |
| `hideDetails` | `hideDetails: string;` |

**Figura:** `DIA-VUE-TS-SHARED-93-1`.

```mermaid
classDiagram
    direction LR
    class Subject["controlDefaults.VCheckbox.<br/>shape6"] {
        <<inferred_object>>
        density: string
        color: string
        hideDetails: string
    }
```

## controlDefaults.VDataTableServer.shape7

**Fuente:** [src/shared/ui/controlDefaults.ts](../../../../../src/shared/ui/controlDefaults.ts) · línea 2, columna 14. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `density` | `density: string;` |
| `hover` | `hover: boolean;` |

**Figura:** `DIA-VUE-TS-SHARED-94-1`.

```mermaid
classDiagram
    direction LR
    class Subject["controlDefaults.<br/>VDataTableServer.shape7"] {
        <<inferred_object>>
        density: string
        hover: boolean
    }
```

## controlDefaults.VTooltip.shape8

**Fuente:** [src/shared/ui/controlDefaults.ts](../../../../../src/shared/ui/controlDefaults.ts) · línea 2, columna 14. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `contentClass` | `contentClass: string;` |

**Figura:** `DIA-VUE-TS-SHARED-95-1`.

```mermaid
classDiagram
    direction LR
    class Subject["controlDefaults.VTooltip.<br/>shape8"] {
        <<inferred_object>>
        contentClass: string
    }
```

## showSuccess.return

**Fuente:** [src/shared/ui/feedback.ts](../../../../../src/shared/ui/feedback.ts) · línea 16, columna 28. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `isConfirmed` | `"isConfirmed": boolean;` |
| `isDenied` | `"isDenied": boolean;` |
| `isDismissed` | `"isDismissed": boolean;` |
| `value` | `"value"?: any;` |
| `dismiss` | `"dismiss"?: DismissReason \| undefined;` |

**Figura:** `DIA-VUE-TS-SHARED-96-1`.

```mermaid
classDiagram
    direction LR
    class Subject["showSuccess.return"] {
        <<inferred_return>>
        isConfirmed: boolean
        isDenied: boolean
        isDismissed: boolean
        value?: any
        dismiss?: DismissReason | undefined
    }
```

## confirmAction.return.variant1

**Fuente:** [src/shared/ui/feedback.ts](../../../../../src/shared/ui/feedback.ts) · línea 27, columna 30. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `valueOf` | `"valueOf": () => boolean;` |

**Figura:** `DIA-VUE-TS-SHARED-97-1`.

```mermaid
classDiagram
    direction LR
    class Subject["confirmAction.return.<br/>variant1"] {
        <<inferred_return>>
        valueOf: callback
    }
```

## confirmAction.return.variant2

**Fuente:** [src/shared/ui/feedback.ts](../../../../../src/shared/ui/feedback.ts) · línea 27, columna 30. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `valueOf` | `"valueOf": () => boolean;` |

**Figura:** `DIA-VUE-TS-SHARED-98-1`.

```mermaid
classDiagram
    direction LR
    class Subject["confirmAction.return.<br/>variant2"] {
        <<inferred_return>>
        valueOf: callback
    }
```

## numberText.return

**Fuente:** [src/shared/utils/formatNumbers.ts](../../../../../src/shared/utils/formatNumbers.ts) · línea 1, columna 27. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `toString` | `"toString": () => string;` |
| `charAt` | `"charAt": (pos: number) => string;` |
| `charCodeAt` | `"charCodeAt": (index: number) => number;` |
| `concat` | `"concat": (...strings: string[]) => string;` |
| `indexOf` | `"indexOf": (searchString: string, position?: number) => number;` |
| `lastIndexOf` | `"lastIndexOf": (searchString: string, position?: number) => number;` |
| `localeCompare` | `"localeCompare": { (that: string): number; (that: string, locales?: string \| string[], options?: Intl.CollatorOptions): number; (that: string, locales?: Intl.LocalesArgument, options?: Intl.CollatorOptions): number; };` |
| `match` | `"match": { (regexp: string \| RegExp): RegExpMatchArray \| null; (matcher: { [Symbol.match](string: string): RegExpMatchArray \| null; }): RegExpMatchArray \| null; };` |
| `replace` | `"replace": { (searchValue: string \| RegExp, replaceValue: string): string; (searchValue: string \| RegExp, replacer: (substring: string, ...args: any[]) => string): string; (searchValue: { [Symbol.replace](string: string, replaceValue: string): string; }, replaceValue: string): string; (searchValue: { [Symbol.replace](string: string, replacer: (substring: string, ...args: any[]) => string): string; }, replacer: (substring: string, ...args: any[]) => string): string; };` |
| `search` | `"search": { (regexp: string \| RegExp): number; (searcher: { [Symbol.search](string: string): number; }): number; };` |
| `slice` | `"slice": (start?: number, end?: number) => string;` |
| `split` | `"split": { (separator: string \| RegExp, limit?: number): string[]; (splitter: { [Symbol.split](string: string, limit?: number): string[]; }, limit?: number): string[]; };` |
| `substring` | `"substring": (start: number, end?: number) => string;` |
| `toLowerCase` | `"toLowerCase": () => string;` |
| `toLocaleLowerCase` | `"toLocaleLowerCase": { (locales?: string \| string[]): string; (locales?: Intl.LocalesArgument): string; };` |
| `toUpperCase` | `"toUpperCase": () => string;` |
| `toLocaleUpperCase` | `"toLocaleUpperCase": { (locales?: string \| string[]): string; (locales?: Intl.LocalesArgument): string; };` |
| `trim` | `"trim": () => string;` |
| `length` | `"length": number;` |
| `substr` | `"substr": (from: number, length?: number) => string;` |
| `valueOf` | `"valueOf": () => string;` |
| `codePointAt` | `"codePointAt": (pos: number) => number \| undefined;` |
| `includes` | `"includes": (searchString: string, position?: number) => boolean;` |
| `endsWith` | `"endsWith": (searchString: string, endPosition?: number) => boolean;` |
| `normalize` | `"normalize": { (form: "NFC" \| "NFD" \| "NFKC" \| "NFKD"): string; (form?: string): string; };` |
| `repeat` | `"repeat": (count: number) => string;` |
| `startsWith` | `"startsWith": (searchString: string, position?: number) => boolean;` |
| `anchor` | `"anchor": (name: string) => string;` |
| `big` | `"big": () => string;` |
| `blink` | `"blink": () => string;` |
| `bold` | `"bold": () => string;` |
| `fixed` | `"fixed": () => string;` |
| `fontcolor` | `"fontcolor": (color: string) => string;` |
| `fontsize` | `"fontsize": { (size: number): string; (size: string): string; };` |
| `italics` | `"italics": () => string;` |
| `link` | `"link": (url: string) => string;` |
| `small` | `"small": () => string;` |
| `strike` | `"strike": () => string;` |
| `sub` | `"sub": () => string;` |
| `sup` | `"sup": () => string;` |
| `padStart` | `"padStart": (maxLength: number, fillString?: string) => string;` |
| `padEnd` | `"padEnd": (maxLength: number, fillString?: string) => string;` |
| `trimEnd` | `"trimEnd": () => string;` |
| `trimStart` | `"trimStart": () => string;` |
| `trimLeft` | `"trimLeft": () => string;` |
| `trimRight` | `"trimRight": () => string;` |
| `matchAll` | `"matchAll": (regexp: RegExp) => RegExpStringIterator<RegExpExecArray>;` |
| `replaceAll` | `"replaceAll": { (searchValue: string \| RegExp, replaceValue: string): string; (searchValue: string \| RegExp, replacer: (substring: string, ...args: any[]) => string): string; };` |
| `at` | `"at": (index: number) => string \| undefined;` |
| `__@iterator@308` | `"__@iterator@308": () => StringIterator<string>;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [numberText.return.localeCompare.shape1](../../../../../src/shared/utils/formatNumbers.ts) | `localeCompare` |
| association | [numberText.return.match.shape2](../../../../../src/shared/utils/formatNumbers.ts) | `match` |
| dependency | [numberText.return.replace.shape4](../../../../../src/shared/utils/formatNumbers.ts) | `replace` |
| association | [numberText.return.search.shape7](../../../../../src/shared/utils/formatNumbers.ts) | `search` |
| association | [numberText.return.split.shape9](../../../../../src/shared/utils/formatNumbers.ts) | `split` |
| association | [numberText.return.toLocaleLowerCase.shape11](../../../../../src/shared/utils/formatNumbers.ts) | `toLocaleLowerCase` |
| association | [numberText.return.toLocaleUpperCase.shape12](../../../../../src/shared/utils/formatNumbers.ts) | `toLocaleUpperCase` |
| association | [numberText.return.normalize.shape13](../../../../../src/shared/utils/formatNumbers.ts) | `normalize` |
| association | [numberText.return.fontsize.shape14](../../../../../src/shared/utils/formatNumbers.ts) | `fontsize` |
| dependency | [numberText.return.replaceAll.shape15](../../../../../src/shared/utils/formatNumbers.ts) | `replaceAll` |

**Figura:** `DIA-VUE-TS-SHARED-99-1`. Parte 1/5.

```mermaid
classDiagram
    direction LR
    class Subject["numberText.return"] {
        <<inferred_return>>
        toString: callback
        charAt: callback
        charCodeAt: callback
        concat: callback
        indexOf: callback
        lastIndexOf: callback
        localeCompare: object
        match: object
        replace: callback
        search: object
        slice: callback
        substring: callback
        toLowerCase: callback
        toUpperCase: callback
    }
    class R0["numberText.return.<br/>localeCompare.shape1"] {
        <<reference>>
    }
    class R1["numberText.return.match.<br/>shape2"] {
        <<reference>>
    }
    class R2["numberText.return.replace.<br/>shape4"] {
        <<reference>>
    }
    class R3["numberText.return.search.<br/>shape7"] {
        <<reference>>
    }
    Subject --> "1" R0 : localeCompare
    Subject --> "0..1" R1 : match
    Subject ..> R2 : replace
    Subject --> "1" R3 : search
```

**Figura:** `DIA-VUE-TS-SHARED-99-2`. Parte 2/5.

```mermaid
classDiagram
    direction LR
    class Subject["numberText.return"] {
        <<inferred_return>>
        split: object
        toLocaleLowerCase: object
    }
    class R0["numberText.return.split.<br/>shape9"] {
        <<reference>>
    }
    class R1["numberText.return.<br/>toLocaleLowerCase.shape11"] {
        <<reference>>
    }
    Subject --> "1" R0 : split
    Subject --> "1" R1 : toLocaleLowerCase
```

**Figura:** `DIA-VUE-TS-SHARED-99-3`. Parte 3/5.

```mermaid
classDiagram
    direction LR
    class Subject["numberText.return"] {
        <<inferred_return>>
        toLocaleUpperCase: object
        trim: callback
        length: number
        substr: callback
        valueOf: callback
        codePointAt: callback
        includes: callback
        endsWith: callback
        normalize: object
        repeat: callback
        startsWith: callback
        anchor: callback
        big: callback
        blink: callback
        bold: callback
        fixed: callback
    }
    class R0["numberText.return.<br/>toLocaleUpperCase.shape12"] {
        <<reference>>
    }
    class R1["numberText.return.normalize.<br/>shape13"] {
        <<reference>>
    }
    Subject --> "1" R0 : toLocaleUpperCase
    Subject --> "1" R1 : normalize
```

**Figura:** `DIA-VUE-TS-SHARED-99-4`. Parte 4/5.

```mermaid
classDiagram
    direction LR
    class Subject["numberText.return"] {
        <<inferred_return>>
        fontcolor: callback
        fontsize: object
        italics: callback
        link: callback
        small: callback
        strike: callback
        sub: callback
        sup: callback
        padStart: callback
        padEnd: callback
        trimEnd: callback
        trimStart: callback
        trimLeft: callback
        trimRight: callback
        matchAll: callback
        replaceAll: callback
    }
    class R0["numberText.return.fontsize.<br/>shape14"] {
        <<reference>>
    }
    class R1["numberText.return.replaceAll.<br/>shape15"] {
        <<reference>>
    }
    Subject --> "1" R0 : fontsize
    Subject ..> R1 : replaceAll
```

**Figura:** `DIA-VUE-TS-SHARED-99-5`. Parte 5/5.

```mermaid
classDiagram
    direction LR
    class Subject["numberText.return"] {
        <<inferred_return>>
        at: callback
        __@iterator@308: callback
    }
```

## numberText.return.localeCompare.shape1

**Fuente:** [src/shared/utils/formatNumbers.ts](../../../../../src/shared/utils/formatNumbers.ts) · línea 1, columna 27. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `signature` | `(that: string): number;` |
| `signature` | `(that: string, locales?: string \| string[], options?: Intl.CollatorOptions): number;` |
| `signature` | `(that: string, locales?: Intl.LocalesArgument, options?: Intl.CollatorOptions): number;` |

**Figura:** `DIA-VUE-TS-SHARED-100-1`.

```mermaid
classDiagram
    direction LR
    class Subject["numberText.return.<br/>localeCompare.shape1"] {
        <<inferred_object>>
        signature: number
        signature: number
        signature: number
    }
```

## numberText.return.match.shape2

**Fuente:** [src/shared/utils/formatNumbers.ts](../../../../../src/shared/utils/formatNumbers.ts) · línea 1, columna 27. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `signature` | `(regexp: string \| RegExp): RegExpMatchArray \| null;` |
| `signature` | `(matcher: { [Symbol.match](string: string): RegExpMatchArray \| null; }): RegExpMatchArray \| null;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [numberText.return.match.matcher.shape3](../../../../../src/shared/utils/formatNumbers.ts) | `signature.matcher` |

**Figura:** `DIA-VUE-TS-SHARED-101-1`.

```mermaid
classDiagram
    direction LR
    class Subject["numberText.return.match.<br/>shape2"] {
        <<inferred_object>>
        signature: RegExpMatchArray | null
        signature: RegExpMatchArray | null
    }
    class R0["numberText.return.match.<br/>matcher.shape3"] {
        <<reference>>
    }
    Subject ..> R0 : signature.matcher
```

## numberText.return.match.matcher.shape3

**Fuente:** [src/shared/utils/formatNumbers.ts](../../../../../src/shared/utils/formatNumbers.ts) · línea 1, columna 27. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `[Symbol.match]` | `[Symbol.match](string: string): RegExpMatchArray \| null;` |

**Figura:** `DIA-VUE-TS-SHARED-102-1`.

```mermaid
classDiagram
    direction LR
    class Subject["numberText.return.match.<br/>matcher.shape3"] {
        <<inferred_object>>
        [Symbol.match](...)
    }
```

## numberText.return.replace.shape4

**Fuente:** [src/shared/utils/formatNumbers.ts](../../../../../src/shared/utils/formatNumbers.ts) · línea 1, columna 27. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `signature` | `(searchValue: string \| RegExp, replaceValue: string): string;` |
| `signature` | `(searchValue: string \| RegExp, replacer: (substring: string, ...args: any[]) => string): string;` |
| `signature` | `(searchValue: { [Symbol.replace](string: string, replaceValue: string): string; }, replaceValue: string): string;` |
| `signature` | `(searchValue: { [Symbol.replace](string: string, replacer: (substring: string, ...args: any[]) => string): string; }, replacer: (substring: string, ...args: any[]) => string): string;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [numberText.return.replace.searchValue.shape5](../../../../../src/shared/utils/formatNumbers.ts) | `signature.searchValue` |
| dependency | [numberText.return.replace.searchValue.shape6](../../../../../src/shared/utils/formatNumbers.ts) | `signature.searchValue` |

**Figura:** `DIA-VUE-TS-SHARED-103-1`.

```mermaid
classDiagram
    direction LR
    class Subject["numberText.return.replace.<br/>shape4"] {
        <<inferred_object>>
        signature: string
        signature: string
        signature: string
        signature: string
    }
    class R0["numberText.return.replace.<br/>searchValue.shape5"] {
        <<reference>>
    }
    class R1["numberText.return.replace.<br/>searchValue.shape6"] {
        <<reference>>
    }
    Subject ..> R0 : signature.searchValue
    Subject ..> R1 : signature.searchValue
```

## numberText.return.replace.searchValue.shape5

**Fuente:** [src/shared/utils/formatNumbers.ts](../../../../../src/shared/utils/formatNumbers.ts) · línea 1, columna 27. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `[Symbol.replace]` | `[Symbol.replace](string: string, replaceValue: string): string;` |

**Figura:** `DIA-VUE-TS-SHARED-104-1`.

```mermaid
classDiagram
    direction LR
    class Subject["numberText.return.replace.<br/>searchValue.shape5"] {
        <<inferred_object>>
        [Symbol.replace](...)
    }
```

## numberText.return.replace.searchValue.shape6

**Fuente:** [src/shared/utils/formatNumbers.ts](../../../../../src/shared/utils/formatNumbers.ts) · línea 1, columna 27. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `[Symbol.replace]` | `[Symbol.replace](string: string, replacer: (substring: string, ...args: any[]) => string): string;` |

**Figura:** `DIA-VUE-TS-SHARED-105-1`.

```mermaid
classDiagram
    direction LR
    class Subject["numberText.return.replace.<br/>searchValue.shape6"] {
        <<inferred_object>>
        [Symbol.replace](...)
    }
```

## numberText.return.search.shape7

**Fuente:** [src/shared/utils/formatNumbers.ts](../../../../../src/shared/utils/formatNumbers.ts) · línea 1, columna 27. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `signature` | `(regexp: string \| RegExp): number;` |
| `signature` | `(searcher: { [Symbol.search](string: string): number; }): number;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [numberText.return.search.searcher.shape8](../../../../../src/shared/utils/formatNumbers.ts) | `signature.searcher` |

**Figura:** `DIA-VUE-TS-SHARED-106-1`.

```mermaid
classDiagram
    direction LR
    class Subject["numberText.return.search.<br/>shape7"] {
        <<inferred_object>>
        signature: number
        signature: number
    }
    class R0["numberText.return.search.<br/>searcher.shape8"] {
        <<reference>>
    }
    Subject ..> R0 : signature.searcher
```

## numberText.return.search.searcher.shape8

**Fuente:** [src/shared/utils/formatNumbers.ts](../../../../../src/shared/utils/formatNumbers.ts) · línea 1, columna 27. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `[Symbol.search]` | `[Symbol.search](string: string): number;` |

**Figura:** `DIA-VUE-TS-SHARED-107-1`.

```mermaid
classDiagram
    direction LR
    class Subject["numberText.return.search.<br/>searcher.shape8"] {
        <<inferred_object>>
        [Symbol.search](...)
    }
```

## numberText.return.split.shape9

**Fuente:** [src/shared/utils/formatNumbers.ts](../../../../../src/shared/utils/formatNumbers.ts) · línea 1, columna 27. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `signature` | `(separator: string \| RegExp, limit?: number): string[];` |
| `signature` | `(splitter: { [Symbol.split](string: string, limit?: number): string[]; }, limit?: number): string[];` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [numberText.return.split.splitter.shape10](../../../../../src/shared/utils/formatNumbers.ts) | `signature.splitter` |

**Figura:** `DIA-VUE-TS-SHARED-108-1`.

```mermaid
classDiagram
    direction LR
    class Subject["numberText.return.split.<br/>shape9"] {
        <<inferred_object>>
        signature: string[]
        signature: string[]
    }
    class R0["numberText.return.split.<br/>splitter.shape10"] {
        <<reference>>
    }
    Subject ..> R0 : signature.splitter
```

## numberText.return.split.splitter.shape10

**Fuente:** [src/shared/utils/formatNumbers.ts](../../../../../src/shared/utils/formatNumbers.ts) · línea 1, columna 27. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `[Symbol.split]` | `[Symbol.split](string: string, limit?: number): string[];` |

**Figura:** `DIA-VUE-TS-SHARED-109-1`.

```mermaid
classDiagram
    direction LR
    class Subject["numberText.return.split.<br/>splitter.shape10"] {
        <<inferred_object>>
        [Symbol.split](...)
    }
```

## numberText.return.toLocaleLowerCase.shape11

**Fuente:** [src/shared/utils/formatNumbers.ts](../../../../../src/shared/utils/formatNumbers.ts) · línea 1, columna 27. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `signature` | `(locales?: string \| string[]): string;` |
| `signature` | `(locales?: Intl.LocalesArgument): string;` |

**Figura:** `DIA-VUE-TS-SHARED-110-1`.

```mermaid
classDiagram
    direction LR
    class Subject["numberText.return.<br/>toLocaleLowerCase.shape11"] {
        <<inferred_object>>
        signature: string
        signature: string
    }
```

## numberText.return.toLocaleUpperCase.shape12

**Fuente:** [src/shared/utils/formatNumbers.ts](../../../../../src/shared/utils/formatNumbers.ts) · línea 1, columna 27. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `signature` | `(locales?: string \| string[]): string;` |
| `signature` | `(locales?: Intl.LocalesArgument): string;` |

**Figura:** `DIA-VUE-TS-SHARED-111-1`.

```mermaid
classDiagram
    direction LR
    class Subject["numberText.return.<br/>toLocaleUpperCase.shape12"] {
        <<inferred_object>>
        signature: string
        signature: string
    }
```

## numberText.return.normalize.shape13

**Fuente:** [src/shared/utils/formatNumbers.ts](../../../../../src/shared/utils/formatNumbers.ts) · línea 1, columna 27. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `signature` | `(form: "NFC" \| "NFD" \| "NFKC" \| "NFKD"): string;` |
| `signature` | `(form?: string): string;` |

**Figura:** `DIA-VUE-TS-SHARED-112-1`.

```mermaid
classDiagram
    direction LR
    class Subject["numberText.return.normalize.<br/>shape13"] {
        <<inferred_object>>
        signature: string
        signature: string
    }
```

## numberText.return.fontsize.shape14

**Fuente:** [src/shared/utils/formatNumbers.ts](../../../../../src/shared/utils/formatNumbers.ts) · línea 1, columna 27. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `signature` | `(size: number): string;` |
| `signature` | `(size: string): string;` |

**Figura:** `DIA-VUE-TS-SHARED-113-1`.

```mermaid
classDiagram
    direction LR
    class Subject["numberText.return.fontsize.<br/>shape14"] {
        <<inferred_object>>
        signature: string
        signature: string
    }
```

## numberText.return.replaceAll.shape15

**Fuente:** [src/shared/utils/formatNumbers.ts](../../../../../src/shared/utils/formatNumbers.ts) · línea 1, columna 27. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `signature` | `(searchValue: string \| RegExp, replaceValue: string): string;` |
| `signature` | `(searchValue: string \| RegExp, replacer: (substring: string, ...args: any[]) => string): string;` |

**Figura:** `DIA-VUE-TS-SHARED-114-1`.

```mermaid
classDiagram
    direction LR
    class Subject["numberText.return.replaceAll.<br/>shape15"] {
        <<inferred_object>>
        signature: string
        signature: string
    }
```

## currencyText.return

**Fuente:** [src/shared/utils/formatNumbers.ts](../../../../../src/shared/utils/formatNumbers.ts) · línea 4, columna 29. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `toString` | `"toString": () => string;` |
| `charAt` | `"charAt": (pos: number) => string;` |
| `charCodeAt` | `"charCodeAt": (index: number) => number;` |
| `concat` | `"concat": (...strings: string[]) => string;` |
| `indexOf` | `"indexOf": (searchString: string, position?: number) => number;` |
| `lastIndexOf` | `"lastIndexOf": (searchString: string, position?: number) => number;` |
| `localeCompare` | `"localeCompare": { (that: string): number; (that: string, locales?: string \| string[], options?: Intl.CollatorOptions): number; (that: string, locales?: Intl.LocalesArgument, options?: Intl.CollatorOptions): number; };` |
| `match` | `"match": { (regexp: string \| RegExp): RegExpMatchArray \| null; (matcher: { [Symbol.match](string: string): RegExpMatchArray \| null; }): RegExpMatchArray \| null; };` |
| `replace` | `"replace": { (searchValue: string \| RegExp, replaceValue: string): string; (searchValue: string \| RegExp, replacer: (substring: string, ...args: any[]) => string): string; (searchValue: { [Symbol.replace](string: string, replaceValue: string): string; }, replaceValue: string): string; (searchValue: { [Symbol.replace](string: string, replacer: (substring: string, ...args: any[]) => string): string; }, replacer: (substring: string, ...args: any[]) => string): string; };` |
| `search` | `"search": { (regexp: string \| RegExp): number; (searcher: { [Symbol.search](string: string): number; }): number; };` |
| `slice` | `"slice": (start?: number, end?: number) => string;` |
| `split` | `"split": { (separator: string \| RegExp, limit?: number): string[]; (splitter: { [Symbol.split](string: string, limit?: number): string[]; }, limit?: number): string[]; };` |
| `substring` | `"substring": (start: number, end?: number) => string;` |
| `toLowerCase` | `"toLowerCase": () => string;` |
| `toLocaleLowerCase` | `"toLocaleLowerCase": { (locales?: string \| string[]): string; (locales?: Intl.LocalesArgument): string; };` |
| `toUpperCase` | `"toUpperCase": () => string;` |
| `toLocaleUpperCase` | `"toLocaleUpperCase": { (locales?: string \| string[]): string; (locales?: Intl.LocalesArgument): string; };` |
| `trim` | `"trim": () => string;` |
| `length` | `"length": number;` |
| `substr` | `"substr": (from: number, length?: number) => string;` |
| `valueOf` | `"valueOf": () => string;` |
| `codePointAt` | `"codePointAt": (pos: number) => number \| undefined;` |
| `includes` | `"includes": (searchString: string, position?: number) => boolean;` |
| `endsWith` | `"endsWith": (searchString: string, endPosition?: number) => boolean;` |
| `normalize` | `"normalize": { (form: "NFC" \| "NFD" \| "NFKC" \| "NFKD"): string; (form?: string): string; };` |
| `repeat` | `"repeat": (count: number) => string;` |
| `startsWith` | `"startsWith": (searchString: string, position?: number) => boolean;` |
| `anchor` | `"anchor": (name: string) => string;` |
| `big` | `"big": () => string;` |
| `blink` | `"blink": () => string;` |
| `bold` | `"bold": () => string;` |
| `fixed` | `"fixed": () => string;` |
| `fontcolor` | `"fontcolor": (color: string) => string;` |
| `fontsize` | `"fontsize": { (size: number): string; (size: string): string; };` |
| `italics` | `"italics": () => string;` |
| `link` | `"link": (url: string) => string;` |
| `small` | `"small": () => string;` |
| `strike` | `"strike": () => string;` |
| `sub` | `"sub": () => string;` |
| `sup` | `"sup": () => string;` |
| `padStart` | `"padStart": (maxLength: number, fillString?: string) => string;` |
| `padEnd` | `"padEnd": (maxLength: number, fillString?: string) => string;` |
| `trimEnd` | `"trimEnd": () => string;` |
| `trimStart` | `"trimStart": () => string;` |
| `trimLeft` | `"trimLeft": () => string;` |
| `trimRight` | `"trimRight": () => string;` |
| `matchAll` | `"matchAll": (regexp: RegExp) => RegExpStringIterator<RegExpExecArray>;` |
| `replaceAll` | `"replaceAll": { (searchValue: string \| RegExp, replaceValue: string): string; (searchValue: string \| RegExp, replacer: (substring: string, ...args: any[]) => string): string; };` |
| `at` | `"at": (index: number) => string \| undefined;` |
| `__@iterator@308` | `"__@iterator@308": () => StringIterator<string>;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [currencyText.return.localeCompare.shape1](../../../../../src/shared/utils/formatNumbers.ts) | `localeCompare` |
| association | [currencyText.return.match.shape2](../../../../../src/shared/utils/formatNumbers.ts) | `match` |
| dependency | [currencyText.return.replace.shape4](../../../../../src/shared/utils/formatNumbers.ts) | `replace` |
| association | [currencyText.return.search.shape7](../../../../../src/shared/utils/formatNumbers.ts) | `search` |
| association | [currencyText.return.split.shape9](../../../../../src/shared/utils/formatNumbers.ts) | `split` |
| association | [currencyText.return.toLocaleLowerCase.shape11](../../../../../src/shared/utils/formatNumbers.ts) | `toLocaleLowerCase` |
| association | [currencyText.return.toLocaleUpperCase.shape12](../../../../../src/shared/utils/formatNumbers.ts) | `toLocaleUpperCase` |
| association | [currencyText.return.normalize.shape13](../../../../../src/shared/utils/formatNumbers.ts) | `normalize` |
| association | [currencyText.return.fontsize.shape14](../../../../../src/shared/utils/formatNumbers.ts) | `fontsize` |
| dependency | [currencyText.return.replaceAll.shape15](../../../../../src/shared/utils/formatNumbers.ts) | `replaceAll` |

**Figura:** `DIA-VUE-TS-SHARED-115-1`. Parte 1/5.

```mermaid
classDiagram
    direction LR
    class Subject["currencyText.return"] {
        <<inferred_return>>
        toString: callback
        charAt: callback
        charCodeAt: callback
        concat: callback
        indexOf: callback
        lastIndexOf: callback
        localeCompare: object
        match: object
        replace: callback
        search: object
        slice: callback
        substring: callback
        toLowerCase: callback
        toUpperCase: callback
    }
    class R0["currencyText.return.<br/>localeCompare.shape1"] {
        <<reference>>
    }
    class R1["currencyText.return.match.<br/>shape2"] {
        <<reference>>
    }
    class R2["currencyText.return.replace.<br/>shape4"] {
        <<reference>>
    }
    class R3["currencyText.return.search.<br/>shape7"] {
        <<reference>>
    }
    Subject --> "1" R0 : localeCompare
    Subject --> "0..1" R1 : match
    Subject ..> R2 : replace
    Subject --> "1" R3 : search
```

**Figura:** `DIA-VUE-TS-SHARED-115-2`. Parte 2/5.

```mermaid
classDiagram
    direction LR
    class Subject["currencyText.return"] {
        <<inferred_return>>
        split: object
        toLocaleLowerCase: object
    }
    class R0["currencyText.return.split.<br/>shape9"] {
        <<reference>>
    }
    class R1["currencyText.return.<br/>toLocaleLowerCase.shape11"] {
        <<reference>>
    }
    Subject --> "1" R0 : split
    Subject --> "1" R1 : toLocaleLowerCase
```

**Figura:** `DIA-VUE-TS-SHARED-115-3`. Parte 3/5.

```mermaid
classDiagram
    direction LR
    class Subject["currencyText.return"] {
        <<inferred_return>>
        toLocaleUpperCase: object
        trim: callback
        length: number
        substr: callback
        valueOf: callback
        codePointAt: callback
        includes: callback
        endsWith: callback
        normalize: object
        repeat: callback
        startsWith: callback
        anchor: callback
        big: callback
        blink: callback
        bold: callback
        fixed: callback
    }
    class R0["currencyText.return.<br/>toLocaleUpperCase.shape12"] {
        <<reference>>
    }
    class R1["currencyText.return.<br/>normalize.shape13"] {
        <<reference>>
    }
    Subject --> "1" R0 : toLocaleUpperCase
    Subject --> "1" R1 : normalize
```

**Figura:** `DIA-VUE-TS-SHARED-115-4`. Parte 4/5.

```mermaid
classDiagram
    direction LR
    class Subject["currencyText.return"] {
        <<inferred_return>>
        fontcolor: callback
        fontsize: object
        italics: callback
        link: callback
        small: callback
        strike: callback
        sub: callback
        sup: callback
        padStart: callback
        padEnd: callback
        trimEnd: callback
        trimStart: callback
        trimLeft: callback
        trimRight: callback
        matchAll: callback
        replaceAll: callback
    }
    class R0["currencyText.return.fontsize.<br/>shape14"] {
        <<reference>>
    }
    class R1["currencyText.return.<br/>replaceAll.shape15"] {
        <<reference>>
    }
    Subject --> "1" R0 : fontsize
    Subject ..> R1 : replaceAll
```

**Figura:** `DIA-VUE-TS-SHARED-115-5`. Parte 5/5.

```mermaid
classDiagram
    direction LR
    class Subject["currencyText.return"] {
        <<inferred_return>>
        at: callback
        __@iterator@308: callback
    }
```

## currencyText.return.localeCompare.shape1

**Fuente:** [src/shared/utils/formatNumbers.ts](../../../../../src/shared/utils/formatNumbers.ts) · línea 4, columna 29. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `signature` | `(that: string): number;` |
| `signature` | `(that: string, locales?: string \| string[], options?: Intl.CollatorOptions): number;` |
| `signature` | `(that: string, locales?: Intl.LocalesArgument, options?: Intl.CollatorOptions): number;` |

**Figura:** `DIA-VUE-TS-SHARED-116-1`.

```mermaid
classDiagram
    direction LR
    class Subject["currencyText.return.<br/>localeCompare.shape1"] {
        <<inferred_object>>
        signature: number
        signature: number
        signature: number
    }
```

## currencyText.return.match.shape2

**Fuente:** [src/shared/utils/formatNumbers.ts](../../../../../src/shared/utils/formatNumbers.ts) · línea 4, columna 29. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `signature` | `(regexp: string \| RegExp): RegExpMatchArray \| null;` |
| `signature` | `(matcher: { [Symbol.match](string: string): RegExpMatchArray \| null; }): RegExpMatchArray \| null;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [currencyText.return.match.matcher.shape3](../../../../../src/shared/utils/formatNumbers.ts) | `signature.matcher` |

**Figura:** `DIA-VUE-TS-SHARED-117-1`.

```mermaid
classDiagram
    direction LR
    class Subject["currencyText.return.match.<br/>shape2"] {
        <<inferred_object>>
        signature: RegExpMatchArray | null
        signature: RegExpMatchArray | null
    }
    class R0["currencyText.return.match.<br/>matcher.shape3"] {
        <<reference>>
    }
    Subject ..> R0 : signature.matcher
```

## currencyText.return.match.matcher.shape3

**Fuente:** [src/shared/utils/formatNumbers.ts](../../../../../src/shared/utils/formatNumbers.ts) · línea 4, columna 29. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `[Symbol.match]` | `[Symbol.match](string: string): RegExpMatchArray \| null;` |

**Figura:** `DIA-VUE-TS-SHARED-118-1`.

```mermaid
classDiagram
    direction LR
    class Subject["currencyText.return.match.<br/>matcher.shape3"] {
        <<inferred_object>>
        [Symbol.match](...)
    }
```

## currencyText.return.replace.shape4

**Fuente:** [src/shared/utils/formatNumbers.ts](../../../../../src/shared/utils/formatNumbers.ts) · línea 4, columna 29. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `signature` | `(searchValue: string \| RegExp, replaceValue: string): string;` |
| `signature` | `(searchValue: string \| RegExp, replacer: (substring: string, ...args: any[]) => string): string;` |
| `signature` | `(searchValue: { [Symbol.replace](string: string, replaceValue: string): string; }, replaceValue: string): string;` |
| `signature` | `(searchValue: { [Symbol.replace](string: string, replacer: (substring: string, ...args: any[]) => string): string; }, replacer: (substring: string, ...args: any[]) => string): string;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [currencyText.return.replace.searchValue.shape5](../../../../../src/shared/utils/formatNumbers.ts) | `signature.searchValue` |
| dependency | [currencyText.return.replace.searchValue.shape6](../../../../../src/shared/utils/formatNumbers.ts) | `signature.searchValue` |

**Figura:** `DIA-VUE-TS-SHARED-119-1`.

```mermaid
classDiagram
    direction LR
    class Subject["currencyText.return.replace.<br/>shape4"] {
        <<inferred_object>>
        signature: string
        signature: string
        signature: string
        signature: string
    }
    class R0["currencyText.return.replace.<br/>searchValue.shape5"] {
        <<reference>>
    }
    class R1["currencyText.return.replace.<br/>searchValue.shape6"] {
        <<reference>>
    }
    Subject ..> R0 : signature.searchValue
    Subject ..> R1 : signature.searchValue
```

## currencyText.return.replace.searchValue.shape5

**Fuente:** [src/shared/utils/formatNumbers.ts](../../../../../src/shared/utils/formatNumbers.ts) · línea 4, columna 29. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `[Symbol.replace]` | `[Symbol.replace](string: string, replaceValue: string): string;` |

**Figura:** `DIA-VUE-TS-SHARED-120-1`.

```mermaid
classDiagram
    direction LR
    class Subject["currencyText.return.replace.<br/>searchValue.shape5"] {
        <<inferred_object>>
        [Symbol.replace](...)
    }
```

## currencyText.return.replace.searchValue.shape6

**Fuente:** [src/shared/utils/formatNumbers.ts](../../../../../src/shared/utils/formatNumbers.ts) · línea 4, columna 29. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `[Symbol.replace]` | `[Symbol.replace](string: string, replacer: (substring: string, ...args: any[]) => string): string;` |

**Figura:** `DIA-VUE-TS-SHARED-121-1`.

```mermaid
classDiagram
    direction LR
    class Subject["currencyText.return.replace.<br/>searchValue.shape6"] {
        <<inferred_object>>
        [Symbol.replace](...)
    }
```

## currencyText.return.search.shape7

**Fuente:** [src/shared/utils/formatNumbers.ts](../../../../../src/shared/utils/formatNumbers.ts) · línea 4, columna 29. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `signature` | `(regexp: string \| RegExp): number;` |
| `signature` | `(searcher: { [Symbol.search](string: string): number; }): number;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [currencyText.return.search.searcher.shape8](../../../../../src/shared/utils/formatNumbers.ts) | `signature.searcher` |

**Figura:** `DIA-VUE-TS-SHARED-122-1`.

```mermaid
classDiagram
    direction LR
    class Subject["currencyText.return.search.<br/>shape7"] {
        <<inferred_object>>
        signature: number
        signature: number
    }
    class R0["currencyText.return.search.<br/>searcher.shape8"] {
        <<reference>>
    }
    Subject ..> R0 : signature.searcher
```

## currencyText.return.search.searcher.shape8

**Fuente:** [src/shared/utils/formatNumbers.ts](../../../../../src/shared/utils/formatNumbers.ts) · línea 4, columna 29. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `[Symbol.search]` | `[Symbol.search](string: string): number;` |

**Figura:** `DIA-VUE-TS-SHARED-123-1`.

```mermaid
classDiagram
    direction LR
    class Subject["currencyText.return.search.<br/>searcher.shape8"] {
        <<inferred_object>>
        [Symbol.search](...)
    }
```

## currencyText.return.split.shape9

**Fuente:** [src/shared/utils/formatNumbers.ts](../../../../../src/shared/utils/formatNumbers.ts) · línea 4, columna 29. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `signature` | `(separator: string \| RegExp, limit?: number): string[];` |
| `signature` | `(splitter: { [Symbol.split](string: string, limit?: number): string[]; }, limit?: number): string[];` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [currencyText.return.split.splitter.shape10](../../../../../src/shared/utils/formatNumbers.ts) | `signature.splitter` |

**Figura:** `DIA-VUE-TS-SHARED-124-1`.

```mermaid
classDiagram
    direction LR
    class Subject["currencyText.return.split.<br/>shape9"] {
        <<inferred_object>>
        signature: string[]
        signature: string[]
    }
    class R0["currencyText.return.split.<br/>splitter.shape10"] {
        <<reference>>
    }
    Subject ..> R0 : signature.splitter
```

## currencyText.return.split.splitter.shape10

**Fuente:** [src/shared/utils/formatNumbers.ts](../../../../../src/shared/utils/formatNumbers.ts) · línea 4, columna 29. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `[Symbol.split]` | `[Symbol.split](string: string, limit?: number): string[];` |

**Figura:** `DIA-VUE-TS-SHARED-125-1`.

```mermaid
classDiagram
    direction LR
    class Subject["currencyText.return.split.<br/>splitter.shape10"] {
        <<inferred_object>>
        [Symbol.split](...)
    }
```

## currencyText.return.toLocaleLowerCase.shape11

**Fuente:** [src/shared/utils/formatNumbers.ts](../../../../../src/shared/utils/formatNumbers.ts) · línea 4, columna 29. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `signature` | `(locales?: string \| string[]): string;` |
| `signature` | `(locales?: Intl.LocalesArgument): string;` |

**Figura:** `DIA-VUE-TS-SHARED-126-1`.

```mermaid
classDiagram
    direction LR
    class Subject["currencyText.return.<br/>toLocaleLowerCase.shape11"] {
        <<inferred_object>>
        signature: string
        signature: string
    }
```

## currencyText.return.toLocaleUpperCase.shape12

**Fuente:** [src/shared/utils/formatNumbers.ts](../../../../../src/shared/utils/formatNumbers.ts) · línea 4, columna 29. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `signature` | `(locales?: string \| string[]): string;` |
| `signature` | `(locales?: Intl.LocalesArgument): string;` |

**Figura:** `DIA-VUE-TS-SHARED-127-1`.

```mermaid
classDiagram
    direction LR
    class Subject["currencyText.return.<br/>toLocaleUpperCase.shape12"] {
        <<inferred_object>>
        signature: string
        signature: string
    }
```

## currencyText.return.normalize.shape13

**Fuente:** [src/shared/utils/formatNumbers.ts](../../../../../src/shared/utils/formatNumbers.ts) · línea 4, columna 29. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `signature` | `(form: "NFC" \| "NFD" \| "NFKC" \| "NFKD"): string;` |
| `signature` | `(form?: string): string;` |

**Figura:** `DIA-VUE-TS-SHARED-128-1`.

```mermaid
classDiagram
    direction LR
    class Subject["currencyText.return.<br/>normalize.shape13"] {
        <<inferred_object>>
        signature: string
        signature: string
    }
```

## currencyText.return.fontsize.shape14

**Fuente:** [src/shared/utils/formatNumbers.ts](../../../../../src/shared/utils/formatNumbers.ts) · línea 4, columna 29. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `signature` | `(size: number): string;` |
| `signature` | `(size: string): string;` |

**Figura:** `DIA-VUE-TS-SHARED-129-1`.

```mermaid
classDiagram
    direction LR
    class Subject["currencyText.return.fontsize.<br/>shape14"] {
        <<inferred_object>>
        signature: string
        signature: string
    }
```

## currencyText.return.replaceAll.shape15

**Fuente:** [src/shared/utils/formatNumbers.ts](../../../../../src/shared/utils/formatNumbers.ts) · línea 4, columna 29. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `signature` | `(searchValue: string \| RegExp, replaceValue: string): string;` |
| `signature` | `(searchValue: string \| RegExp, replacer: (substring: string, ...args: any[]) => string): string;` |

**Figura:** `DIA-VUE-TS-SHARED-130-1`.

```mermaid
classDiagram
    direction LR
    class Subject["currencyText.return.<br/>replaceAll.shape15"] {
        <<inferred_object>>
        signature: string
        signature: string
    }
```
