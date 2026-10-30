# Contratos TypeScript: purchases

Generado con `npm run docs:generate`. No editar manualmente.

[Alcance y notación](index.md#alcance-y-notación).

## PurchaseCorrectionForm.defineProps

**Fuente:** [src/modules/purchases/components/PurchaseCorrectionForm.vue](../../../../../src/modules/purchases/components/PurchaseCorrectionForm.vue) · línea 6, columna 13. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `context` | `context: string;` |
| `totals` | `totals: { quantity: number; net: number; gross: number } \| null;` |
| `values` | `values: { quantity: string; costPerUnitType: string };` |
| `errors` | `errors: Partial<Record<'quantity' \| 'costPerUnitType', string>>;` |
| `message` | `message: string;` |
| `isSubmitting` | `isSubmitting: boolean;` |
| `isConflicted` | `isConflicted: boolean;` |

## PurchaseCorrectionForm.defineEmits

**Fuente:** [src/modules/purchases/components/PurchaseCorrectionForm.vue](../../../../../src/modules/purchases/components/PurchaseCorrectionForm.vue) · línea 15, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `update` | `update: [field: 'quantity' \| 'costPerUnitType', value: string];` |
| `blur` | `blur: [field: 'quantity' \| 'costPerUnitType'];` |
| `submit` | `submit: [];` |
| `close` | `close: [];` |
| `reload` | `reload: [];` |

## PurchaseDetailsTable.defineProps

**Fuente:** [src/modules/purchases/components/PurchaseDetailsTable.vue](../../../../../src/modules/purchases/components/PurchaseDetailsTable.vue) · línea 9, columna 13. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `rows` | `rows: PurchaseDetail[];` |
| `canChange` | `canChange: boolean;` |
| `canRemove` | `canRemove: boolean;` |
| `isDisabled` | `isDisabled: boolean;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [PurchaseDetail](../../../../../src/modules/purchases/purchase.ts) | `rows` |

## PurchaseDetailsTable.defineEmits

**Fuente:** [src/modules/purchases/components/PurchaseDetailsTable.vue](../../../../../src/modules/purchases/components/PurchaseDetailsTable.vue) · línea 15, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `remove` | `remove: [id: string];` |
| `correct` | `correct: [row: PurchaseDetail];` |
| `cancel` | `cancel: [row: PurchaseDetail];` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [PurchaseDetail](../../../../../src/modules/purchases/purchase.ts) | `correct` |
| dependency | [PurchaseDetail](../../../../../src/modules/purchases/purchase.ts) | `cancel` |

## PurchaseEditor.defineProps

**Fuente:** [src/modules/purchases/components/PurchaseEditor.vue](../../../../../src/modules/purchases/components/PurchaseEditor.vue) · línea 16, columna 13. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `title` | `title: string;` |
| `values` | `values: PurchaseValues;` |
| `errors` | `errors: Partial<Record<PurchaseField, string>>;` |
| `message` | `message: string;` |
| `isSubmitting` | `isSubmitting: boolean;` |
| `isConflicted` | `isConflicted: boolean;` |
| `isReadOnly` | `isReadOnly: boolean;` |
| `isChanging` | `isChanging: boolean;` |
| `isEditing` | `isEditing: boolean;` |
| `canChangeDetails` | `canChangeDetails: boolean;` |
| `canCreateSupplier` | `canCreateSupplier: boolean;` |
| `canSuppliers` | `canSuppliers: boolean;` |
| `canPersons` | `canPersons: boolean;` |
| `suppliers` | `suppliers: LookupState;` |
| `persons` | `persons: LookupState;` |
| `supplier` | `supplier?: LookupItem;` |
| `receiver` | `receiver?: LookupItem;` |
| `details` | `details: PurchaseDetail[];` |
| `totals` | `totals: { quantity: number; net: number; gross: number };` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [PurchaseValues](../../../../../src/modules/purchases/purchase.ts) | `values` |
| dependency | [PurchaseField](../../../../../src/modules/purchases/purchase.ts) | `errors` |
| association | [LookupState](../../../../../src/shared/lookup.ts) | `suppliers` |
| association | [LookupState](../../../../../src/shared/lookup.ts) | `persons` |
| association | [LookupItem](../../../../../src/shared/lookup.ts) | `supplier` |
| association | [LookupItem](../../../../../src/shared/lookup.ts) | `receiver` |
| association | [PurchaseDetail](../../../../../src/modules/purchases/purchase.ts) | `details` |

## PurchaseEditor.defineEmits

**Fuente:** [src/modules/purchases/components/PurchaseEditor.vue](../../../../../src/modules/purchases/components/PurchaseEditor.vue) · línea 37, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `update` | `update: [field: PurchaseField, value: string \| boolean];` |
| `blur` | `blur: [field: PurchaseField];` |
| `search` | `search: [kind: 'suppliers' \| 'persons', value: string];` |
| `more` | `more: [kind: 'suppliers' \| 'persons'];` |
| `retry` | `retry: [kind: 'suppliers' \| 'persons'];` |
| `createSupplier` | `createSupplier: [search: string];` |
| `remove` | `remove: [id: string];` |
| `correct` | `correct: [detail: PurchaseDetail];` |
| `cancel` | `cancel: [detail: PurchaseDetail];` |
| `submit` | `submit: [];` |
| `close` | `close: [];` |
| `reload` | `reload: [];` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [PurchaseField](../../../../../src/modules/purchases/purchase.ts) | `update` |
| dependency | [PurchaseField](../../../../../src/modules/purchases/purchase.ts) | `blur` |
| dependency | [PurchaseDetail](../../../../../src/modules/purchases/purchase.ts) | `correct` |
| dependency | [PurchaseDetail](../../../../../src/modules/purchases/purchase.ts) | `cancel` |

## PurchaseFilters.defineProps

**Fuente:** [src/modules/purchases/components/PurchaseFilters.vue](../../../../../src/modules/purchases/components/PurchaseFilters.vue) · línea 10, columna 13. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `values` | `values: PurchaseFilters;` |
| `suppliers` | `suppliers: LookupState;` |
| `persons` | `persons: LookupState;` |
| `canSuppliers` | `canSuppliers: boolean;` |
| `canPersons` | `canPersons: boolean;` |
| `isLoading` | `isLoading: boolean;` |
| `error` | `error: string;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [PurchaseFilters](../../../../../src/modules/purchases/purchase.ts) | `values` |
| association | [LookupState](../../../../../src/shared/lookup.ts) | `suppliers` |
| association | [LookupState](../../../../../src/shared/lookup.ts) | `persons` |

## PurchaseFilters.defineEmits

**Fuente:** [src/modules/purchases/components/PurchaseFilters.vue](../../../../../src/modules/purchases/components/PurchaseFilters.vue) · línea 19, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `update` | `update: [field: keyof PurchaseFilters, value: string];` |
| `apply` | `apply: [];` |
| `clear` | `clear: [];` |
| `refresh` | `refresh: [];` |
| `searchOptions` | `searchOptions: [kind: 'suppliers' \| 'persons', value: string];` |
| `more` | `more: [kind: 'suppliers' \| 'persons'];` |
| `retry` | `retry: [kind: 'suppliers' \| 'persons'];` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [PurchaseFilters](../../../../../src/modules/purchases/purchase.ts) | `update` |

## PurchaseLineEntryForm.defineProps

**Fuente:** [src/modules/purchases/components/PurchaseLineEntryForm.vue](../../../../../src/modules/purchases/components/PurchaseLineEntryForm.vue) · línea 8, columna 13. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `itemLabel` | `itemLabel: string;` |
| `values` | `values: { materialId: string; quantity: string; costPerUnitType: string };` |
| `errors` | `errors: Partial<Record<'materialId' \| 'quantity' \| 'costPerUnitType', string>>;` |
| `items` | `items: LookupState;` |
| `selected` | `selected?: LookupItem;` |
| `isDisabled` | `isDisabled: boolean;` |
| `canRead` | `canRead: boolean;` |
| `canCreate` | `canCreate: boolean;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [LookupState](../../../../../src/shared/lookup.ts) | `items` |
| association | [LookupItem](../../../../../src/shared/lookup.ts) | `selected` |

## PurchaseLineEntryForm.defineEmits

**Fuente:** [src/modules/purchases/components/PurchaseLineEntryForm.vue](../../../../../src/modules/purchases/components/PurchaseLineEntryForm.vue) · línea 18, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `update` | `update: [field: 'materialId' \| 'quantity' \| 'costPerUnitType', value: string];` |
| `blur` | `blur: [field: 'materialId' \| 'quantity' \| 'costPerUnitType'];` |
| `search` | `search: [value: string];` |
| `more` | `more: [];` |
| `retry` | `retry: [];` |
| `create` | `create: [search: string];` |
| `add` | `add: [];` |

## PurchaseTable.defineProps

**Fuente:** [src/modules/purchases/components/PurchaseTable.vue](../../../../../src/modules/purchases/components/PurchaseTable.vue) · línea 11, columna 27. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `rows` | `rows: PurchaseRow[];` |
| `query` | `query: PurchaseQuery;` |
| `total` | `total: number;` |
| `isLoading` | `isLoading: boolean;` |
| `isReading` | `isReading: boolean;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [PurchaseRow](../../../../../src/modules/purchases/purchase.ts) | `rows` |
| dependency | [PurchaseQuery](../../../../../src/modules/purchases/purchase.ts) | `query` |

## PurchaseTable.defineEmits

**Fuente:** [src/modules/purchases/components/PurchaseTable.vue](../../../../../src/modules/purchases/components/PurchaseTable.vue) · línea 18, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `query` | `query: [changes: Partial<PurchaseQuery>];` |
| `open` | `open: [row: PurchaseRow, action: 'view' \| 'edit'];` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [PurchaseQuery](../../../../../src/modules/purchases/purchase.ts) | `query` |
| dependency | [PurchaseRow](../../../../../src/modules/purchases/purchase.ts) | `open` |

## PurchaseTotals.defineProps

**Fuente:** [src/modules/purchases/components/PurchaseTotals.vue](../../../../../src/modules/purchases/components/PurchaseTotals.vue) · línea 5, columna 17. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `totals` | `totals: { quantity: number; net: number; gross: number } \| null;` |
| `isCorrection` | `isCorrection?: boolean;` |

## Field

**Fuente:** [src/modules/purchases/composables/usePurchaseCorrection.ts](../../../../../src/modules/purchases/composables/usePurchaseCorrection.ts) · línea 19, columna 5. **Declaración:** type.

**Definición completa:**

```typescript
'quantity' | 'costPerUnitType'
```

## Field

**Fuente:** [src/modules/purchases/composables/usePurchaseLineEntry.ts](../../../../../src/modules/purchases/composables/usePurchaseLineEntry.ts) · línea 19, columna 5. **Declaración:** type.

**Definición completa:**

```typescript
'materialId' | 'quantity' | 'costPerUnitType'
```

## PurchaseCorrectionPage.defineProps

**Fuente:** [src/modules/purchases/pages/PurchaseCorrectionPage.vue](../../../../../src/modules/purchases/pages/PurchaseCorrectionPage.vue) · línea 8, columna 27. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `resource` | `resource: PurchaseResource;` |
| `document` | `document: PurchaseDocument;` |
| `detail` | `detail: PurchaseDetail;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [PurchaseResource](../../../../../src/modules/purchases/purchase.ts) | `resource` |
| association | [PurchaseDocument](../../../../../src/modules/purchases/purchase.ts) | `document` |
| association | [PurchaseDetail](../../../../../src/modules/purchases/purchase.ts) | `detail` |

## PurchaseCorrectionPage.defineEmits

**Fuente:** [src/modules/purchases/pages/PurchaseCorrectionPage.vue](../../../../../src/modules/purchases/pages/PurchaseCorrectionPage.vue) · línea 13, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `saved` | `saved: [confirmation: MutationConfirmation];` |
| `close` | `close: [];` |
| `reload` | `reload: []` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [MutationConfirmation](../../../../../src/shared/http/recordContract.ts) | `saved` |

## PurchaseEditorPage.defineProps

**Fuente:** [src/modules/purchases/pages/PurchaseEditorPage.vue](../../../../../src/modules/purchases/pages/PurchaseEditorPage.vue) · línea 18, columna 27. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `resource` | `resource: PurchaseResource;` |
| `target` | `target: PurchaseTarget;` |
| `canChangeDetails` | `canChangeDetails: boolean;` |
| `isChanging` | `isChanging: boolean;` |
| `readError` | `readError: string;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [PurchaseResource](../../../../../src/modules/purchases/purchase.ts) | `resource` |
| dependency | [PurchaseTarget](../../../../../src/modules/purchases/purchase.ts) | `target` |

## PurchaseEditorPage.defineEmits

**Fuente:** [src/modules/purchases/pages/PurchaseEditorPage.vue](../../../../../src/modules/purchases/pages/PurchaseEditorPage.vue) · línea 25, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `saved` | `saved: [confirmation: MutationConfirmation];` |
| `close` | `close: [];` |
| `reload` | `reload: [];` |
| `correct` | `correct: [detail: PurchaseDetail];` |
| `cancel` | `cancel: [detail: PurchaseDetail];` |
| `createSupplier` | `createSupplier: [request: LookupCreation];` |
| `createItem` | `createItem: [request: ItemCreation];` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [MutationConfirmation](../../../../../src/shared/http/recordContract.ts) | `saved` |
| dependency | [PurchaseDetail](../../../../../src/modules/purchases/purchase.ts) | `correct` |
| dependency | [PurchaseDetail](../../../../../src/modules/purchases/purchase.ts) | `cancel` |
| dependency | [LookupCreation](../../../../../src/shared/lookup.ts) | `createSupplier` |
| dependency | [ItemCreation](../../../../../src/modules/purchases/purchase.ts) | `createItem` |

## PurchaseLineEntryPage.defineProps

**Fuente:** [src/modules/purchases/pages/PurchaseLineEntryPage.vue](../../../../../src/modules/purchases/pages/PurchaseLineEntryPage.vue) · línea 8, columna 27. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `resource` | `resource: PurchaseResource;` |
| `supplier` | `supplier: LookupItem;` |
| `isDisabled` | `isDisabled: boolean;` |
| `canRead` | `canRead: boolean;` |
| `canCreate` | `canCreate: boolean;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [PurchaseResource](../../../../../src/modules/purchases/purchase.ts) | `resource` |
| association | [LookupItem](../../../../../src/shared/lookup.ts) | `supplier` |

## PurchaseLineEntryPage.defineEmits

**Fuente:** [src/modules/purchases/pages/PurchaseLineEntryPage.vue](../../../../../src/modules/purchases/pages/PurchaseLineEntryPage.vue) · línea 15, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `add` | `add: [line: PurchaseDetail];` |
| `create` | `create: [request: ItemCreation]` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [PurchaseDetail](../../../../../src/modules/purchases/purchase.ts) | `add` |
| dependency | [ItemCreation](../../../../../src/modules/purchases/purchase.ts) | `create` |

## PurchasePage.defineProps

**Fuente:** [src/modules/purchases/pages/PurchasePage.vue](../../../../../src/modules/purchases/pages/PurchasePage.vue) · línea 27, columna 27. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `resource` | `resource: PurchaseResource` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [PurchaseResource](../../../../../src/modules/purchases/purchase.ts) | `resource` |

## PurchasePage.defineEmits

**Fuente:** [src/modules/purchases/pages/PurchasePage.vue](../../../../../src/modules/purchases/pages/PurchasePage.vue) · línea 28, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `createSupplier` | `createSupplier: [request: LookupCreation];` |
| `createItem` | `createItem: [request: ItemCreation];` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [LookupCreation](../../../../../src/shared/lookup.ts) | `createSupplier` |
| dependency | [ItemCreation](../../../../../src/modules/purchases/purchase.ts) | `createItem` |

## PurchaseResource

**Fuente:** [src/modules/purchases/purchase.ts](../../../../../src/modules/purchases/purchase.ts) · línea 4, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
'materials' | 'consumables'
```

## Decimal

**Fuente:** [src/modules/purchases/purchase.ts](../../../../../src/modules/purchases/purchase.ts) · línea 5, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
string | number
```

## PurchaseFilters

**Fuente:** [src/modules/purchases/purchase.ts](../../../../../src/modules/purchases/purchase.ts) · línea 6, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `startDate` | `startDate: string;` |
| `endDate` | `endDate: string;` |
| `supplierId` | `supplierId: string;` |
| `personId` | `personId: string;` |

## PurchaseQuery

**Fuente:** [src/modules/purchases/purchase.ts](../../../../../src/modules/purchases/purchase.ts) · línea 12, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
RecordQuery & PurchaseFilters
```

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [RecordQuery](../../../../../src/shared/list.ts) | `type` |
| dependency | [PurchaseFilters](../../../../../src/modules/purchases/purchase.ts) | `type` |

## PurchaseRow

**Fuente:** [src/modules/purchases/purchase.ts](../../../../../src/modules/purchases/purchase.ts) · línea 13, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `id` | `id: string;` |
| `referenceNumber` | `referenceNumber: string;` |
| `receptionDate` | `receptionDate: string;` |
| `supplierId` | `supplierId: string;` |
| `supplierName` | `supplierName: string;` |
| `receivedById` | `receivedById: string;` |
| `receivedByName` | `receivedByName: string;` |
| `isInvoiced` | `isInvoiced: boolean;` |
| `invoice` | `invoice: string;` |
| `status` | `status: string;` |
| `totalQuantity` | `totalQuantity: Decimal;` |
| `totalNetPurchaseAmount` | `totalNetPurchaseAmount: Decimal;` |
| `totalGrossPurchaseAmount` | `totalGrossPurchaseAmount: Decimal;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [Decimal](../../../../../src/modules/purchases/purchase.ts) | `totalQuantity` |
| dependency | [Decimal](../../../../../src/modules/purchases/purchase.ts) | `totalNetPurchaseAmount` |
| dependency | [Decimal](../../../../../src/modules/purchases/purchase.ts) | `totalGrossPurchaseAmount` |

## PurchaseDetail

**Fuente:** [src/modules/purchases/purchase.ts](../../../../../src/modules/purchases/purchase.ts) · línea 28, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `id` | `id: string;` |
| `materialId` | `materialId: string;` |
| `name` | `name: string;` |
| `base` | `base: Decimal \| null;` |
| `height` | `height: Decimal \| null;` |
| `presentation` | `presentation: string;` |
| `unitMeasure` | `unitMeasure: string;` |
| `quantity` | `quantity: Decimal;` |
| `convertedQuantity` | `convertedQuantity: Decimal;` |
| `costPerUnitType` | `costPerUnitType: Decimal;` |
| `conversionUnitCost` | `conversionUnitCost: Decimal;` |
| `netPurchaseAmount` | `netPurchaseAmount: Decimal;` |
| `grossPurchaseAmount` | `grossPurchaseAmount: Decimal;` |
| `status` | `status: 'ACTIVE' \| 'CANCELED';` |
| `isNew` | `isNew: boolean;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [Decimal](../../../../../src/modules/purchases/purchase.ts) | `base` |
| dependency | [Decimal](../../../../../src/modules/purchases/purchase.ts) | `height` |
| dependency | [Decimal](../../../../../src/modules/purchases/purchase.ts) | `quantity` |
| dependency | [Decimal](../../../../../src/modules/purchases/purchase.ts) | `convertedQuantity` |
| dependency | [Decimal](../../../../../src/modules/purchases/purchase.ts) | `costPerUnitType` |
| dependency | [Decimal](../../../../../src/modules/purchases/purchase.ts) | `conversionUnitCost` |
| dependency | [Decimal](../../../../../src/modules/purchases/purchase.ts) | `netPurchaseAmount` |
| dependency | [Decimal](../../../../../src/modules/purchases/purchase.ts) | `grossPurchaseAmount` |

## PurchaseDocument

**Fuente:** [src/modules/purchases/purchase.ts](../../../../../src/modules/purchases/purchase.ts) · línea 45, columna 1. **Declaración:** interface.

**Extensión/implementación:** `extends PurchaseRow`.

| Miembro | Firma completa |
| --- | --- |
| `observations` | `observations: string;` |
| `details` | `details: PurchaseDetail[];` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| inheritance | [PurchaseRow](../../../../../src/modules/purchases/purchase.ts) | `extends` |
| association | [PurchaseDetail](../../../../../src/modules/purchases/purchase.ts) | `details` |

## PurchaseValues

**Fuente:** [src/modules/purchases/purchase.ts](../../../../../src/modules/purchases/purchase.ts) · línea 49, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `supplierId` | `supplierId: string;` |
| `receivedById` | `receivedById: string;` |
| `isInvoiced` | `isInvoiced: boolean;` |
| `invoice` | `invoice: string;` |
| `receptionDate` | `receptionDate: string;` |
| `observations` | `observations: string;` |
| `details` | `details: PurchaseDetail[];` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [PurchaseDetail](../../../../../src/modules/purchases/purchase.ts) | `details` |

## PurchaseField

**Fuente:** [src/modules/purchases/purchase.ts](../../../../../src/modules/purchases/purchase.ts) · línea 58, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
keyof PurchaseValues
```

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [PurchaseValues](../../../../../src/modules/purchases/purchase.ts) | `type` |

## PurchaseTarget

**Fuente:** [src/modules/purchases/purchase.ts](../../../../../src/modules/purchases/purchase.ts) · línea 59, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
| { action: 'create' }
    | { action: 'edit'; document: PurchaseDocument }
    | { action: 'view'; document: PurchaseDocument }
```

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [PurchaseDocument](../../../../../src/modules/purchases/purchase.ts) | `type` |

## PurchaseWriteTarget

**Fuente:** [src/modules/purchases/purchase.ts](../../../../../src/modules/purchases/purchase.ts) · línea 63, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
Exclude<PurchaseTarget, { action: 'view' }>
```

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [PurchaseTarget](../../../../../src/modules/purchases/purchase.ts) | `type` |

## PurchaseDetailChange

**Fuente:** [src/modules/purchases/purchase.ts](../../../../../src/modules/purchases/purchase.ts) · línea 64, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
{ action: 'correct'; quantity: number; costPerUnitType: number } | { action: 'cancel' }
```

## ItemCreation

**Fuente:** [src/modules/purchases/purchase.ts](../../../../../src/modules/purchases/purchase.ts) · línea 66, columna 1. **Declaración:** interface.

**Extensión/implementación:** `extends LookupCreation`.

| Miembro | Firma completa |
| --- | --- |
| `supplier` | `supplier: LookupItem;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| inheritance | [LookupCreation](../../../../../src/shared/lookup.ts) | `extends` |
| association | [LookupItem](../../../../../src/shared/lookup.ts) | `supplier` |

## PurchaseLookupRequest

**Fuente:** [src/modules/purchases/services/purchaseLookupService.ts](../../../../../src/modules/purchases/services/purchaseLookupService.ts) · línea 7, columna 1. **Declaración:** interface.

**Extensión/implementación:** `extends LookupQuery`.

| Miembro | Firma completa |
| --- | --- |
| `kind` | `kind: 'suppliers' \| 'persons' \| 'items';` |
| `resource` | `resource: PurchaseResource;` |
| `supplierId` | `supplierId?: string;` |
| `capture` | `capture?: boolean;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| inheritance | [LookupQuery](../../../../../src/shared/lookup.ts) | `extends` |
| dependency | [PurchaseResource](../../../../../src/modules/purchases/purchase.ts) | `resource` |
