# Contratos TypeScript: warehouse

Generado con `npm run docs:generate`. No editar manualmente.

[Alcance y notación](index.md#alcance-y-notación).

## InventoryEditor.defineProps

**Fuente:** [src/modules/warehouse/components/InventoryEditor.vue](../../../../../src/modules/warehouse/components/InventoryEditor.vue) · línea 12, columna 13. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `title` | `title: string;` |
| `context` | `context?: string;` |
| `sections` | `sections: InventoryFormSection[];` |
| `values` | `values: InventoryValues;` |
| `errors` | `errors: Partial<Record<InventoryField, string>>;` |
| `message` | `message: string;` |
| `isSubmitting` | `isSubmitting: boolean;` |
| `isPending` | `isPending: boolean;` |
| `isConflicted` | `isConflicted: boolean;` |
| `isConfirmingDuplicate` | `isConfirmingDuplicate?: boolean;` |
| `lookups` | `lookups: Record<string, LookupState>;` |
| `supplier` | `supplier?: LookupItem;` |
| `canCreateSupplier` | `canCreateSupplier?: boolean;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [InventoryFormSection](../../../../../src/modules/warehouse/formFields.ts) | `sections` |
| association | [InventoryValues](../../../../../src/modules/warehouse/inventory.ts) | `values` |
| dependency | [InventoryField](../../../../../src/modules/warehouse/inventory.ts) | `errors` |
| dependency | [LookupState](../../../../../src/shared/lookup.ts) | `lookups` |
| association | [LookupItem](../../../../../src/shared/lookup.ts) | `supplier` |

## InventoryEditor.defineEmits

**Fuente:** [src/modules/warehouse/components/InventoryEditor.vue](../../../../../src/modules/warehouse/components/InventoryEditor.vue) · línea 27, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `update` | `update: [field: InventoryField, value: string \| boolean];` |
| `blur` | `blur: [field: InventoryField];` |
| `search` | `search: [field: InventoryField, value: string];` |
| `more` | `more: [field: InventoryField];` |
| `retry` | `retry: [field: InventoryField];` |
| `submit` | `submit: [];` |
| `close` | `close: [];` |
| `reload` | `reload: [];` |
| `createSupplier` | `createSupplier: [search: string];` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [InventoryField](../../../../../src/modules/warehouse/inventory.ts) | `update` |
| dependency | [InventoryField](../../../../../src/modules/warehouse/inventory.ts) | `blur` |
| dependency | [InventoryField](../../../../../src/modules/warehouse/inventory.ts) | `search` |
| dependency | [InventoryField](../../../../../src/modules/warehouse/inventory.ts) | `more` |
| dependency | [InventoryField](../../../../../src/modules/warehouse/inventory.ts) | `retry` |

## InventoryFilters.defineProps

**Fuente:** [src/modules/warehouse/components/InventoryFilters.vue](../../../../../src/modules/warehouse/components/InventoryFilters.vue) · línea 7, columna 13. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `supplierId` | `supplierId: string;` |
| `canFilterSupplier` | `canFilterSupplier: boolean;` |
| `isLoading` | `isLoading: boolean;` |
| `suppliers` | `suppliers: LookupState;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [LookupState](../../../../../src/shared/lookup.ts) | `suppliers` |

## InventoryFilters.defineEmits

**Fuente:** [src/modules/warehouse/components/InventoryFilters.vue](../../../../../src/modules/warehouse/components/InventoryFilters.vue) · línea 13, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `supplier` | `supplier: [value: string];` |
| `searchOptions` | `searchOptions: [value: string];` |
| `more` | `more: [];` |
| `retry` | `retry: [];` |
| `apply` | `apply: [];` |
| `clear` | `clear: [];` |
| `refresh` | `refresh: [];` |

## InventoryFormField.defineProps

**Fuente:** [src/modules/warehouse/components/InventoryFormField.vue](../../../../../src/modules/warehouse/components/InventoryFormField.vue) · línea 9, columna 27. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `field` | `field: InventoryFieldSpec;` |
| `value` | `value: string \| boolean;` |
| `error` | `error?: string;` |
| `isDisabled` | `isDisabled: boolean;` |
| `lookup` | `lookup?: LookupState;` |
| `initialOption` | `initialOption?: LookupItem;` |
| `createLabel` | `createLabel?: string;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [InventoryFieldSpec](../../../../../src/modules/warehouse/formFields.ts) | `field` |
| association | [LookupState](../../../../../src/shared/lookup.ts) | `lookup` |
| association | [LookupItem](../../../../../src/shared/lookup.ts) | `initialOption` |

## InventoryFormField.defineEmits

**Fuente:** [src/modules/warehouse/components/InventoryFormField.vue](../../../../../src/modules/warehouse/components/InventoryFormField.vue) · línea 18, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `update` | `update: [value: string \| boolean];` |
| `blur` | `blur: [];` |
| `search` | `search: [value: string];` |
| `more` | `more: [];` |
| `retry` | `retry: [];` |
| `create` | `create: [search: string];` |

## InventoryImportDialog.defineProps

**Fuente:** [src/modules/warehouse/components/InventoryImportDialog.vue](../../../../../src/modules/warehouse/components/InventoryImportDialog.vue) · línea 21, columna 27. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `resource` | `resource: InventoryResource;` |
| `mode` | `mode: InventoryImportMode;` |
| `availableModes` | `availableModes: readonly InventoryImportMode[];` |
| `batch` | `batch: InventoryImportBatch \| null;` |
| `file` | `file: File \| null;` |
| `isWorking` | `isWorking: boolean;` |
| `isDownloading` | `isDownloading: boolean;` |
| `canConfirm` | `canConfirm: boolean;` |
| `recoveryRequired` | `recoveryRequired: boolean;` |
| `error` | `error: string;` |
| `downloadError` | `downloadError: string;` |
| `suppliers` | `suppliers: LookupState;` |
| `supplierId` | `supplierId: string;` |
| `search` | `search: string;` |
| `templatePage` | `templatePage: number;` |
| `canReadSuppliers` | `canReadSuppliers: boolean;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [InventoryResource](../../../../../src/modules/warehouse/inventory.ts) | `resource` |
| dependency | [InventoryImportMode](../../../../../src/modules/warehouse/inventoryImport.ts) | `mode` |
| dependency | [InventoryImportMode](../../../../../src/modules/warehouse/inventoryImport.ts) | `availableModes` |
| association | [InventoryImportBatch](../../../../../src/modules/warehouse/inventoryImport.ts) | `batch` |
| association | [LookupState](../../../../../src/shared/lookup.ts) | `suppliers` |

## InventoryImportDialog.defineEmits

**Fuente:** [src/modules/warehouse/components/InventoryImportDialog.vue](../../../../../src/modules/warehouse/components/InventoryImportDialog.vue) · línea 39, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `file` | `file: [value: File \| null];` |
| `mode` | `mode: [value: InventoryImportMode];` |
| `prepare` | `prepare: [];` |
| `confirm` | `confirm: [];` |
| `recover` | `recover: [];` |
| `discard` | `discard: [];` |
| `close` | `close: [];` |
| `template` | `template: [];` |
| `errors` | `errors: [];` |
| `supplier` | `supplier: [value: string];` |
| `search` | `search: [value: string];` |
| `templatePage` | `templatePage: [value: number];` |
| `searchSuppliers` | `searchSuppliers: [value: string];` |
| `moreSuppliers` | `moreSuppliers: [];` |
| `retrySuppliers` | `retrySuppliers: [];` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [InventoryImportMode](../../../../../src/modules/warehouse/inventoryImport.ts) | `mode` |

## InventoryRowActions.defineProps

**Fuente:** [src/modules/warehouse/components/InventoryRowActions.vue](../../../../../src/modules/warehouse/components/InventoryRowActions.vue) · línea 5, columna 13. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `row` | `row: InventoryRow;` |
| `permissions` | `permissions: InventoryPermissions;` |
| `isWaste` | `isWaste: boolean` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [InventoryRow](../../../../../src/modules/warehouse/inventory.ts) | `row` |
| association | [InventoryPermissions](../../../../../src/modules/warehouse/inventory.ts) | `permissions` |

## InventoryRowActions.defineEmits

**Fuente:** [src/modules/warehouse/components/InventoryRowActions.vue](../../../../../src/modules/warehouse/components/InventoryRowActions.vue) · línea 6, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `action` | `action: [target: EditorTarget]` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [EditorTarget](../../../../../src/modules/warehouse/inventory.ts) | `action` |

## InventoryTable.defineProps

**Fuente:** [src/modules/warehouse/components/InventoryTable.vue](../../../../../src/modules/warehouse/components/InventoryTable.vue) · línea 25, columna 27. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `rows` | `rows: InventoryRow[];` |
| `permissions` | `permissions: InventoryPermissions;` |
| `resource` | `resource: InventoryResource;` |
| `isLoading` | `isLoading: boolean;` |
| `total` | `total: number;` |
| `query` | `query: InventoryQuery;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [InventoryRow](../../../../../src/modules/warehouse/inventory.ts) | `rows` |
| association | [InventoryPermissions](../../../../../src/modules/warehouse/inventory.ts) | `permissions` |
| dependency | [InventoryResource](../../../../../src/modules/warehouse/inventory.ts) | `resource` |
| association | [InventoryQuery](../../../../../src/modules/warehouse/inventory.ts) | `query` |

## InventoryTable.defineEmits

**Fuente:** [src/modules/warehouse/components/InventoryTable.vue](../../../../../src/modules/warehouse/components/InventoryTable.vue) · línea 33, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `action` | `action: [target: EditorTarget];` |
| `query` | `query: [query: Partial<InventoryQuery>];` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [EditorTarget](../../../../../src/modules/warehouse/inventory.ts) | `action` |
| dependency | [InventoryQuery](../../../../../src/modules/warehouse/inventory.ts) | `query` |

## WasteDuplicateRecoveryResult

**Fuente:** [src/modules/warehouse/composables/useWasteDuplicateRecovery.ts](../../../../../src/modules/warehouse/composables/useWasteDuplicateRecovery.ts) · línea 7, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
'unavailable' | 'canceled' | 'confirmed'
```

## InventoryFieldSpec

**Fuente:** [src/modules/warehouse/formFields.ts](../../../../../src/modules/warehouse/formFields.ts) · línea 9, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `name` | `name: InventoryField;` |
| `label` | `label: string;` |
| `type` | `type?: 'number' \| 'lookup' \| 'checkbox' \| 'textarea';` |
| `step` | `step?: number;` |
| `isReadOnly` | `isReadOnly?: boolean;` |
| `isDisabled` | `isDisabled?: boolean;` |
| `displayValue` | `displayValue?: string;` |
| `hint` | `hint?: string;` |
| `isWide` | `isWide?: boolean;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [InventoryField](../../../../../src/modules/warehouse/inventory.ts) | `name` |

## InventorySummaryItem

**Fuente:** [src/modules/warehouse/formFields.ts](../../../../../src/modules/warehouse/formFields.ts) · línea 20, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `label` | `label: string;` |
| `value` | `value: string;` |

## InventoryFormSection

**Fuente:** [src/modules/warehouse/formFields.ts](../../../../../src/modules/warehouse/formFields.ts) · línea 24, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `id` | `id: string;` |
| `title` | `title: string;` |
| `description` | `description?: string;` |
| `fields` | `fields: InventoryFieldSpec[];` |
| `summary` | `summary?: InventorySummaryItem[];` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [InventoryFieldSpec](../../../../../src/modules/warehouse/formFields.ts) | `fields` |
| association | [InventorySummaryItem](../../../../../src/modules/warehouse/formFields.ts) | `summary` |

## InventoryResource

**Fuente:** [src/modules/warehouse/inventory.ts](../../../../../src/modules/warehouse/inventory.ts) · línea 3, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
'materials' | 'consumables' | 'wastes'
```

## InventoryAction

**Fuente:** [src/modules/warehouse/inventory.ts](../../../../../src/modules/warehouse/inventory.ts) · línea 4, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
'create' | 'edit' | 'stock' | 'add-stock' | 'delete'
```

## Numeric

**Fuente:** [src/modules/warehouse/inventory.ts](../../../../../src/modules/warehouse/inventory.ts) · línea 5, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
string | number | null
```

## InventoryRow

**Fuente:** [src/modules/warehouse/inventory.ts](../../../../../src/modules/warehouse/inventory.ts) · línea 7, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `id` | `id: string;` |
| `entityId` | `entityId: string;` |
| `version` | `version: number;` |
| `materialVersion` | `materialVersion?: number;` |
| `supplierId` | `supplierId: string;` |
| `supplierName` | `supplierName: string;` |
| `name` | `name: string;` |
| `presentationId` | `presentationId: string;` |
| `presentation` | `presentation: string;` |
| `unitMeasureId` | `unitMeasureId: string;` |
| `unitMeasure` | `unitMeasure: string;` |
| `base` | `base: Numeric;` |
| `height` | `height: Numeric;` |
| `currentStock` | `currentStock: Numeric;` |
| `convertedQuantity` | `convertedQuantity: Numeric;` |
| `minStock` | `minStock: Numeric;` |
| `maxUnitCost` | `maxUnitCost?: Numeric;` |
| `isActive` | `isActive: boolean;` |
| `canDelete` | `canDelete: boolean;` |
| `coneWeightKg` | `coneWeightKg: Numeric;` |
| `totalWeightKg` | `totalWeightKg: Numeric;` |
| `weightKg` | `weightKg: Numeric;` |
| `referenceRollTotalWeightKg` | `referenceRollTotalWeightKg: Numeric;` |
| `sampleLengthM` | `sampleLengthM: Numeric;` |
| `sampleNetWeightKg` | `sampleNetWeightKg: Numeric;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [Numeric](../../../../../src/modules/warehouse/inventory.ts) | `base` |
| dependency | [Numeric](../../../../../src/modules/warehouse/inventory.ts) | `height` |
| dependency | [Numeric](../../../../../src/modules/warehouse/inventory.ts) | `currentStock` |
| dependency | [Numeric](../../../../../src/modules/warehouse/inventory.ts) | `convertedQuantity` |
| dependency | [Numeric](../../../../../src/modules/warehouse/inventory.ts) | `minStock` |
| dependency | [Numeric](../../../../../src/modules/warehouse/inventory.ts) | `maxUnitCost` |
| dependency | [Numeric](../../../../../src/modules/warehouse/inventory.ts) | `coneWeightKg` |
| dependency | [Numeric](../../../../../src/modules/warehouse/inventory.ts) | `totalWeightKg` |
| dependency | [Numeric](../../../../../src/modules/warehouse/inventory.ts) | `weightKg` |
| dependency | [Numeric](../../../../../src/modules/warehouse/inventory.ts) | `referenceRollTotalWeightKg` |
| dependency | [Numeric](../../../../../src/modules/warehouse/inventory.ts) | `sampleLengthM` |
| dependency | [Numeric](../../../../../src/modules/warehouse/inventory.ts) | `sampleNetWeightKg` |

## InventoryQuery

**Fuente:** [src/modules/warehouse/inventory.ts](../../../../../src/modules/warehouse/inventory.ts) · línea 35, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `search` | `search: string;` |
| `supplierId` | `supplierId: string;` |
| `page` | `page: number;` |
| `length` | `length: number;` |
| `direction` | `direction: 'asc' \| 'desc';` |
| `orderColumn` | `orderColumn?: number;` |

## InventoryPermissions

**Fuente:** [src/modules/warehouse/inventory.ts](../../../../../src/modules/warehouse/inventory.ts) · línea 43, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `canRead` | `canRead: boolean;` |
| `canWrite` | `canWrite: boolean;` |
| `canAdjust` | `canAdjust: boolean;` |
| `canAdd` | `canAdd: boolean;` |
| `canReadCosts` | `canReadCosts: boolean;` |
| `canReadState` | `canReadState: boolean;` |
| `canExport` | `canExport: boolean;` |

## StockAdditionTarget

**Fuente:** [src/modules/warehouse/inventory.ts](../../../../../src/modules/warehouse/inventory.ts) · línea 52, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `action` | `action: 'add-stock';` |
| `row` | `row: Partial<InventoryRow> & Pick<InventoryRow, 'id' \| 'entityId' \| 'name' \| 'supplierName' \| 'currentStock'>;` |
| `quantity` | `quantity?: string;` |
| `observations` | `observations?: string;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [InventoryRow](../../../../../src/modules/warehouse/inventory.ts) | `row` |

## EditorTarget

**Fuente:** [src/modules/warehouse/inventory.ts](../../../../../src/modules/warehouse/inventory.ts) · línea 59, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
| { action: Exclude<InventoryAction, 'add-stock'>; row?: InventoryRow; initialName?: string }
    | StockAdditionTarget
```

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [InventoryAction](../../../../../src/modules/warehouse/inventory.ts) | `type` |
| dependency | [InventoryRow](../../../../../src/modules/warehouse/inventory.ts) | `type` |
| dependency | [StockAdditionTarget](../../../../../src/modules/warehouse/inventory.ts) | `type` |

## InventoryValues

**Fuente:** [src/modules/warehouse/inventory.ts](../../../../../src/modules/warehouse/inventory.ts) · línea 90, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `name` | `name: string;` |
| `supplierId` | `supplierId: string;` |
| `presentationId` | `presentationId: string;` |
| `unitMeasureId` | `unitMeasureId: string;` |
| `materialId` | `materialId: string;` |
| `base` | `base: string;` |
| `height` | `height: string;` |
| `minStock` | `minStock: string;` |
| `maxUnitCost` | `maxUnitCost: string;` |
| `isActive` | `isActive: boolean;` |
| `newStock` | `newStock: string;` |
| `initialQuantity` | `initialQuantity: string;` |
| `quantity` | `quantity: string;` |
| `reasonId` | `reasonId: string;` |
| `observations` | `observations: string;` |
| `coneWeightKg` | `coneWeightKg: string;` |
| `totalWeightKg` | `totalWeightKg: string;` |
| `referenceRollTotalWeightKg` | `referenceRollTotalWeightKg: string;` |

## InventoryField

**Fuente:** [src/modules/warehouse/inventory.ts](../../../../../src/modules/warehouse/inventory.ts) · línea 110, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
keyof InventoryValues
```

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [InventoryValues](../../../../../src/modules/warehouse/inventory.ts) | `type` |

## InventoryPayload

**Fuente:** [src/modules/warehouse/inventory.ts](../../../../../src/modules/warehouse/inventory.ts) · línea 111, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
Record<string, string | number | boolean | null>
```

## InventoryImportMode

**Fuente:** [src/modules/warehouse/inventoryImport.ts](../../../../../src/modules/warehouse/inventoryImport.ts) · línea 8, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
(typeof INVENTORY_IMPORT_MODES)[keyof typeof INVENTORY_IMPORT_MODES]
```

## ImportValue

**Fuente:** [src/modules/warehouse/inventoryImport.ts](../../../../../src/modules/warehouse/inventoryImport.ts) · línea 14, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
string | number | boolean | null
```

## InventoryImportRow

**Fuente:** [src/modules/warehouse/inventoryImport.ts](../../../../../src/modules/warehouse/inventoryImport.ts) · línea 15, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `row` | `row: number;` |
| `id` | `id: string \| null;` |
| `name` | `name: string;` |
| `action` | `action: (typeof INVENTORY_IMPORT_ROW_ACTIONS)[keyof typeof INVENTORY_IMPORT_ROW_ACTIONS];` |
| `before` | `before: Record<string, ImportValue> \| null;` |
| `after` | `after: Record<string, ImportValue> \| null;` |
| `details` | `details: Record<string, ImportValue>;` |
| `errors` | `errors: { column: string; message: string; code: string }[];` |
| `warnings` | `warnings: string[];` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [ImportValue](../../../../../src/modules/warehouse/inventoryImport.ts) | `before` |
| dependency | [ImportValue](../../../../../src/modules/warehouse/inventoryImport.ts) | `after` |
| dependency | [ImportValue](../../../../../src/modules/warehouse/inventoryImport.ts) | `details` |

## InventoryImportPreview

**Fuente:** [src/modules/warehouse/inventoryImport.ts](../../../../../src/modules/warehouse/inventoryImport.ts) · línea 26, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `summary` | `summary: { total: number; creates: number; updates: number; unchanged: number; errors: number };` |
| `rows` | `rows: InventoryImportRow[];` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [InventoryImportRow](../../../../../src/modules/warehouse/inventoryImport.ts) | `rows` |

## InventoryImportBatch

**Fuente:** [src/modules/warehouse/inventoryImport.ts](../../../../../src/modules/warehouse/inventoryImport.ts) · línea 30, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `id` | `id: string;` |
| `version` | `version: number;` |
| `resource` | `resource: InventoryResource;` |
| `mode` | `mode: InventoryImportMode;` |
| `status` | `status: (typeof INVENTORY_IMPORT_STATUSES)[keyof typeof INVENTORY_IMPORT_STATUSES];` |
| `filename` | `filename: string;` |
| `expiresAt` | `expiresAt: string;` |
| `preview` | `preview: InventoryImportPreview \| null;` |
| `result` | `result: InventoryImportPreview \| null;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [InventoryResource](../../../../../src/modules/warehouse/inventory.ts) | `resource` |
| dependency | [InventoryImportMode](../../../../../src/modules/warehouse/inventoryImport.ts) | `mode` |
| association | [InventoryImportPreview](../../../../../src/modules/warehouse/inventoryImport.ts) | `preview` |
| association | [InventoryImportPreview](../../../../../src/modules/warehouse/inventoryImport.ts) | `result` |

## PendingInventoryImport

**Fuente:** [src/modules/warehouse/inventoryImport.ts](../../../../../src/modules/warehouse/inventoryImport.ts) · línea 41, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `id` | `id: string;` |
| `expectedVersion` | `expectedVersion: number;` |
| `operationId` | `operationId: string;` |

## InventoryEditorPage.defineProps

**Fuente:** [src/modules/warehouse/pages/InventoryEditorPage.vue](../../../../../src/modules/warehouse/pages/InventoryEditorPage.vue) · línea 10, columna 27. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `resource` | `resource: InventoryResource;` |
| `target` | `target: EditorTarget;` |
| `userId` | `userId: string;` |
| `creationContext` | `creationContext?: 'goodsReceipt';` |
| `initialSupplier` | `initialSupplier?: LookupItem;` |
| `canAddStock` | `canAddStock?: boolean;` |
| `canCreateSupplier` | `canCreateSupplier?: boolean;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [InventoryResource](../../../../../src/modules/warehouse/inventory.ts) | `resource` |
| dependency | [EditorTarget](../../../../../src/modules/warehouse/inventory.ts) | `target` |
| association | [LookupItem](../../../../../src/shared/lookup.ts) | `initialSupplier` |

## InventoryEditorPage.defineEmits

**Fuente:** [src/modules/warehouse/pages/InventoryEditorPage.vue](../../../../../src/modules/warehouse/pages/InventoryEditorPage.vue) · línea 19, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `saved` | `saved: [created?: LookupItem];` |
| `close` | `close: [];` |
| `reload` | `reload: [];` |
| `unauthorized` | `unauthorized: [];` |
| `addStock` | `addStock: [target: StockAdditionTarget];` |
| `createSupplier` | `createSupplier: [request: LookupCreation];` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [LookupItem](../../../../../src/shared/lookup.ts) | `saved` |
| dependency | [StockAdditionTarget](../../../../../src/modules/warehouse/inventory.ts) | `addStock` |
| dependency | [LookupCreation](../../../../../src/shared/lookup.ts) | `createSupplier` |

## InventoryImportPage.defineProps

**Fuente:** [src/modules/warehouse/pages/InventoryImportPage.vue](../../../../../src/modules/warehouse/pages/InventoryImportPage.vue) · línea 9, columna 27. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `resource` | `resource: InventoryResource;` |
| `userId` | `userId: string;` |
| `canReadSuppliers` | `canReadSuppliers: boolean;` |
| `canEditData` | `canEditData: boolean;` |
| `canAdjust` | `canAdjust: boolean;` |
| `initialSupplierId` | `initialSupplierId: string;` |
| `initialSearch` | `initialSearch: string;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [InventoryResource](../../../../../src/modules/warehouse/inventory.ts) | `resource` |

## InventoryImportPage.defineEmits

**Fuente:** [src/modules/warehouse/pages/InventoryImportPage.vue](../../../../../src/modules/warehouse/pages/InventoryImportPage.vue) · línea 18, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `close` | `close: [];` |
| `saved` | `saved: [];` |
| `unauthorized` | `unauthorized: []` |

## InventoryPage.defineProps

**Fuente:** [src/modules/warehouse/pages/InventoryPage.vue](../../../../../src/modules/warehouse/pages/InventoryPage.vue) · línea 18, columna 27. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `resource` | `resource: InventoryResource` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [InventoryResource](../../../../../src/modules/warehouse/inventory.ts) | `resource` |

## InventoryPage.defineEmits

**Fuente:** [src/modules/warehouse/pages/InventoryPage.vue](../../../../../src/modules/warehouse/pages/InventoryPage.vue) · línea 20, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `createSupplier` | `createSupplier: [request: LookupCreation]` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [LookupCreation](../../../../../src/shared/lookup.ts) | `createSupplier` |

## InventoryLookupRequest

**Fuente:** [src/modules/warehouse/services/inventoryCatalogService.ts](../../../../../src/modules/warehouse/services/inventoryCatalogService.ts) · línea 9, columna 1. **Declaración:** interface.

**Extensión/implementación:** `extends LookupQuery`.

| Miembro | Firma completa |
| --- | --- |
| `path` | `path: InventoryCatalogPath;` |
| `supplierId` | `supplierId?: string;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| inheritance | [LookupQuery](../../../../../src/shared/lookup.ts) | `extends` |
| dependency | [InventoryCatalogPath](../../../../../src/shared/http/apiPaths.ts) | `path` |
