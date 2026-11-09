# Contratos TypeScript: issues

Generado con `npm run docs:generate`. No editar manualmente.

[Alcance y notación](index.md#alcance-y-notación).

## HistoricalDeliveryDialog.defineProps

**Fuente:** [src/modules/issues/components/HistoricalDeliveryDialog.vue](../../../../../src/modules/issues/components/HistoricalDeliveryDialog.vue) · línea 17, columna 13. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `values` | `values: { deliveredAt: string; reason: string; declaredDelivered: boolean; };` |
| `preview` | `preview: HistoricalDeliveryPreview \| null;` |
| `receipt` | `receipt: HistoricalDeliveryReceipt \| null;` |
| `selected` | `selected: string[];` |
| `allSelected` | `allSelected: boolean;` |
| `isWorking` | `isWorking: boolean;` |
| `isSelectingAll` | `isSelectingAll: boolean;` |
| `recoveryRequired` | `recoveryRequired: boolean;` |
| `canConfirm` | `canConfirm: boolean;` |
| `error` | `error: string;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [HistoricalDeliveryPreview](../../../../../src/modules/issues/historicalDelivery.ts) | `preview` |
| association | [HistoricalDeliveryReceipt](../../../../../src/modules/issues/historicalDelivery.ts) | `receipt` |

## HistoricalDeliveryDialog.defineEmits

**Fuente:** [src/modules/issues/components/HistoricalDeliveryDialog.vue](../../../../../src/modules/issues/components/HistoricalDeliveryDialog.vue) · línea 33, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `update` | `update: [field: 'deliveredAt' \| 'reason', value: string];` |
| `declare` | `declare: [value: boolean];` |
| `select` | `select: [id: string];` |
| `selectAll` | `selectAll: [selected: boolean];` |
| `load` | `load: [page?: number, preserveSelection?: boolean];` |
| `confirm` | `confirm: [];` |
| `recover` | `recover: [];` |
| `close` | `close: [];` |

## IssueDetailsTable.defineProps

**Fuente:** [src/modules/issues/components/IssueDetailsTable.vue](../../../../../src/modules/issues/components/IssueDetailsTable.vue) · línea 19, columna 27. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `rows` | `rows: IssueDetail[];` |
| `mode` | `mode: IssueMode;` |
| `itemLabel` | `itemLabel: string;` |
| `isDisabled` | `isDisabled: boolean;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [IssueDetail](../../../../../src/modules/issues/issue.ts) | `rows` |
| dependency | [IssueMode](../../../../../src/modules/issues/issue.ts) | `mode` |

## IssueDetailsTable.defineEmits

**Fuente:** [src/modules/issues/components/IssueDetailsTable.vue](../../../../../src/modules/issues/components/IssueDetailsTable.vue) · línea 25, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `remove` | `remove: [id: string];` |
| `supply` | `supply: [id: string, changes: IssueSupplyChanges];` |
| `return` | `return: [row: IssueDetail];` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [IssueSupplyChanges](../../../../../src/modules/issues/issue.ts) | `supply` |
| dependency | [IssueDetail](../../../../../src/modules/issues/issue.ts) | `return` |

## IssueEditor.defineProps

**Fuente:** [src/modules/issues/components/IssueEditor.vue](../../../../../src/modules/issues/components/IssueEditor.vue) · línea 20, columna 13. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `historicalDelivery` | `historicalDelivery?: HistoricalDeliveryEvidence;` |
| `title` | `title: string;` |
| `values` | `values: IssueValues;` |
| `errors` | `errors: Partial<Record<IssueField, string>>;` |
| `message` | `message: string;` |
| `isSubmitting` | `isSubmitting: boolean;` |
| `isConflicted` | `isConflicted: boolean;` |
| `canEditHeader` | `canEditHeader: boolean;` |
| `canEditDetails` | `canEditDetails: boolean;` |
| `mode` | `mode: IssueMode;` |
| `itemLabel` | `itemLabel: string;` |
| `selects` | `selects: IssueHeaderSelect[];` |
| `canCreateClient` | `canCreateClient: boolean;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [HistoricalDeliveryEvidence](../../../../../src/modules/issues/historicalDelivery.ts) | `historicalDelivery` |
| association | [IssueValues](../../../../../src/modules/issues/issue.ts) | `values` |
| dependency | [IssueField](../../../../../src/modules/issues/issue.ts) | `errors` |
| dependency | [IssueMode](../../../../../src/modules/issues/issue.ts) | `mode` |
| association | [IssueHeaderSelect](../../../../../src/modules/issues/issue.ts) | `selects` |

## IssueEditor.defineEmits

**Fuente:** [src/modules/issues/components/IssueEditor.vue](../../../../../src/modules/issues/components/IssueEditor.vue) · línea 35, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `update` | `update: [field: IssueField, value: string \| IssueDetail[]];` |
| `blur` | `blur: [field: IssueField];` |
| `search` | `search: [kind: IssueHeaderSelect['kind'], value: string];` |
| `more` | `more: [kind: IssueHeaderSelect['kind']];` |
| `retry` | `retry: [kind: IssueHeaderSelect['kind']];` |
| `remove` | `remove: [id: string];` |
| `supply` | `supply: [id: string, changes: IssueSupplyChanges];` |
| `return` | `return: [detail: IssueDetail];` |
| `submit` | `submit: [];` |
| `close` | `close: [];` |
| `reload` | `reload: [];` |
| `createClient` | `createClient: [search: string];` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [IssueField](../../../../../src/modules/issues/issue.ts) | `update` |
| dependency | [IssueDetail](../../../../../src/modules/issues/issue.ts) | `update` |
| dependency | [IssueField](../../../../../src/modules/issues/issue.ts) | `blur` |
| dependency | [IssueHeaderSelect](../../../../../src/modules/issues/issue.ts) | `search` |
| dependency | [IssueHeaderSelect](../../../../../src/modules/issues/issue.ts) | `more` |
| dependency | [IssueHeaderSelect](../../../../../src/modules/issues/issue.ts) | `retry` |
| dependency | [IssueSupplyChanges](../../../../../src/modules/issues/issue.ts) | `supply` |
| dependency | [IssueDetail](../../../../../src/modules/issues/issue.ts) | `return` |

## IssueFilters.defineProps

**Fuente:** [src/modules/issues/components/IssueFilters.vue](../../../../../src/modules/issues/components/IssueFilters.vue) · línea 10, columna 27. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `values` | `values: IssueFilters;` |
| `selects` | `selects: IssueFilterSelect[];` |
| `isLoading` | `isLoading: boolean;` |
| `isDepartmentLocked` | `isDepartmentLocked: boolean;` |
| `error` | `error: string;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [IssueFilters](../../../../../src/modules/issues/issue.ts) | `values` |
| association | [IssueFilterSelect](../../../../../src/modules/issues/issue.ts) | `selects` |

## IssueFilters.defineEmits

**Fuente:** [src/modules/issues/components/IssueFilters.vue](../../../../../src/modules/issues/components/IssueFilters.vue) · línea 17, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `update` | `update: [field: keyof IssueFilters, value: string];` |
| `apply` | `apply: [];` |
| `clear` | `clear: [];` |
| `refresh` | `refresh: [];` |
| `searchOptions` | `searchOptions: [kind: IssueFilterSelect['kind'], value: string];` |
| `more` | `more: [kind: IssueFilterSelect['kind']];` |
| `retry` | `retry: [kind: IssueFilterSelect['kind']];` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [IssueFilters](../../../../../src/modules/issues/issue.ts) | `update` |
| dependency | [IssueFilterSelect](../../../../../src/modules/issues/issue.ts) | `searchOptions` |
| dependency | [IssueFilterSelect](../../../../../src/modules/issues/issue.ts) | `more` |
| dependency | [IssueFilterSelect](../../../../../src/modules/issues/issue.ts) | `retry` |

## IssueLineEntryForm.defineProps

**Fuente:** [src/modules/issues/components/IssueLineEntryForm.vue](../../../../../src/modules/issues/components/IssueLineEntryForm.vue) · línea 9, columna 13. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `label` | `label: string;` |
| `values` | `values: { itemId: string; quantity: string };` |
| `errors` | `errors: Partial<Record<'itemId' \| 'quantity', string>>;` |
| `state` | `state: LookupState;` |
| `selected` | `selected?: LookupItem;` |
| `presentation` | `presentation: string;` |
| `isDisabled` | `isDisabled: boolean;` |
| `minimum` | `minimum: string;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [LookupState](../../../../../src/shared/lookup.ts) | `state` |
| association | [LookupItem](../../../../../src/shared/lookup.ts) | `selected` |

## IssueLineEntryForm.defineEmits

**Fuente:** [src/modules/issues/components/IssueLineEntryForm.vue](../../../../../src/modules/issues/components/IssueLineEntryForm.vue) · línea 19, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `update` | `update: [field: 'itemId' \| 'quantity', value: string];` |
| `blur` | `blur: [field: 'itemId' \| 'quantity'];` |
| `search` | `search: [value: string];` |
| `more` | `more: [];` |
| `retry` | `retry: [];` |
| `add` | `add: [];` |

## IssueReturnForm.defineProps

**Fuente:** [src/modules/issues/components/IssueReturnForm.vue](../../../../../src/modules/issues/components/IssueReturnForm.vue) · línea 10, columna 13. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `name` | `name: string;` |
| `presentation` | `presentation: string;` |
| `supplied` | `supplied: number;` |
| `returned` | `returned: number;` |
| `available` | `available: number;` |
| `values` | `values: { returnQuantity: string; observations: string };` |
| `errors` | `errors: Partial<Record<'returnQuantity' \| 'observations', string>>;` |
| `message` | `message: string;` |
| `isSubmitting` | `isSubmitting: boolean;` |
| `isConflicted` | `isConflicted: boolean;` |
| `isHistorical` | `isHistorical?: boolean;` |
| `physicalReturnConfirmed` | `physicalReturnConfirmed?: boolean;` |
| `physicalReturnError` | `physicalReturnError?: string;` |

## IssueReturnForm.defineEmits

**Fuente:** [src/modules/issues/components/IssueReturnForm.vue](../../../../../src/modules/issues/components/IssueReturnForm.vue) · línea 25, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `update` | `update: [field: 'returnQuantity' \| 'observations', value: string];` |
| `blur` | `blur: [field: 'returnQuantity' \| 'observations'];` |
| `submit` | `submit: [];` |
| `close` | `close: [];` |
| `reload` | `reload: [];` |
| `confirmPhysicalReturn` | `confirmPhysicalReturn: [value: boolean];` |

## IssueTable.defineProps

**Fuente:** [src/modules/issues/components/IssueTable.vue](../../../../../src/modules/issues/components/IssueTable.vue) · línea 11, columna 27. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `rows` | `rows: IssueRow[];` |
| `query` | `query: IssueQuery;` |
| `total` | `total: number;` |
| `isLoading` | `isLoading: boolean;` |
| `isReading` | `isReading: boolean;` |
| `canManage` | `canManage: boolean;` |
| `canSupply` | `canSupply: boolean;` |
| `showDepartment` | `showDepartment: boolean;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [IssueRow](../../../../../src/modules/issues/issue.ts) | `rows` |
| dependency | [IssueQuery](../../../../../src/modules/issues/issue.ts) | `query` |

## IssueTable.defineEmits

**Fuente:** [src/modules/issues/components/IssueTable.vue](../../../../../src/modules/issues/components/IssueTable.vue) · línea 21, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `query` | `query: [changes: Partial<IssueQuery>];` |
| `open` | `open: [row: IssueRow, mode: IssueOpenMode];` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [IssueQuery](../../../../../src/modules/issues/issue.ts) | `query` |
| dependency | [IssueRow](../../../../../src/modules/issues/issue.ts) | `open` |
| dependency | [IssueOpenMode](../../../../../src/modules/issues/issue.ts) | `open` |

## ReadTarget

**Fuente:** [src/modules/issues/composables/useIssueActions.ts](../../../../../src/modules/issues/composables/useIssueActions.ts) · línea 28, columna 5. **Declaración:** type.

| Miembro | Firma completa |
| --- | --- |
| `row` | `row: IssueRow;` |
| `mode` | `mode: IssueOpenMode;` |
| `afterReturn` | `afterReturn?: boolean` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [IssueRow](../../../../../src/modules/issues/issue.ts) | `row` |
| dependency | [IssueOpenMode](../../../../../src/modules/issues/issue.ts) | `mode` |

## HistoricalDeliveryCandidate

**Fuente:** [src/modules/issues/historicalDelivery.ts](../../../../../src/modules/issues/historicalDelivery.ts) · línea 3, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `id` | `id: string;` |
| `revision` | `revision: string;` |
| `referenceNumber` | `referenceNumber: string;` |
| `requestDate` | `requestDate: string;` |
| `departmentName` | `departmentName: string;` |
| `projectNumber` | `projectNumber: string;` |
| `details` | `details: { id: string; name: string; quantity: number; suppliedQuantity: number; returnedQuantity: number; pendingQuantity: number; }[];` |

## HistoricalDeliveryPreview

**Fuente:** [src/modules/issues/historicalDelivery.ts](../../../../../src/modules/issues/historicalDelivery.ts) · línea 19, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `resource` | `resource: IssueResource;` |
| `cutoffDate` | `cutoffDate: string;` |
| `page` | `page: number;` |
| `hasMore` | `hasMore: boolean;` |
| `documents` | `documents: HistoricalDeliveryCandidate[];` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [IssueResource](../../../../../src/modules/issues/issue.ts) | `resource` |
| association | [HistoricalDeliveryCandidate](../../../../../src/modules/issues/historicalDelivery.ts) | `documents` |

## HistoricalDeliveryCommand

**Fuente:** [src/modules/issues/historicalDelivery.ts](../../../../../src/modules/issues/historicalDelivery.ts) · línea 26, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `operationId` | `operationId: string;` |
| `cutoffDate` | `cutoffDate: string;` |
| `deliveredAt` | `deliveredAt: string \| null;` |
| `reason` | `reason: string;` |
| `declaredDelivered` | `declaredDelivered: true;` |
| `documents` | `documents: { id: string; revision: string }[];` |

## HistoricalDeliveryReceipt

**Fuente:** [src/modules/issues/historicalDelivery.ts](../../../../../src/modules/issues/historicalDelivery.ts) · línea 34, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `id` | `id: string;` |
| `resource` | `resource: IssueResource;` |
| `documents` | `documents: { id: string; referenceNumber: string }[];` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [IssueResource](../../../../../src/modules/issues/issue.ts) | `resource` |

## HistoricalDeliveryEvidence

**Fuente:** [src/modules/issues/historicalDelivery.ts](../../../../../src/modules/issues/historicalDelivery.ts) · línea 39, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `id` | `id: string;` |
| `reason` | `reason: string;` |
| `cutoffDate` | `cutoffDate: string;` |
| `deliveredAt` | `deliveredAt: string \| null;` |
| `createdAt` | `createdAt: string;` |
| `user` | `user: { name: string } \| null;` |

## IssueResource

**Fuente:** [src/modules/issues/issue.ts](../../../../../src/modules/issues/issue.ts) · línea 5, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
'materials' | 'consumables' | 'wastes'
```

## IssueMode

**Fuente:** [src/modules/issues/issue.ts](../../../../../src/modules/issues/issue.ts) · línea 6, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
'create' | 'edit' | 'header' | 'view' | 'supply' | 'return'
```

## IssueRow

**Fuente:** [src/modules/issues/issue.ts](../../../../../src/modules/issues/issue.ts) · línea 7, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `historicalDelivery` | `historicalDelivery?: HistoricalDeliveryEvidence;` |
| `id` | `id: string;` |
| `referenceNumber` | `referenceNumber: string;` |
| `requestDate` | `requestDate: string;` |
| `requesterId` | `requesterId: string;` |
| `requesterName` | `requesterName: string;` |
| `advisorId` | `advisorId: string;` |
| `advisorName` | `advisorName: string;` |
| `clientId` | `clientId: string;` |
| `clientName` | `clientName: string;` |
| `departmentId` | `departmentId: string;` |
| `departmentName` | `departmentName: string;` |
| `projectNumber` | `projectNumber: string;` |
| `observations` | `observations: string;` |
| `status` | `status: string;` |
| `fulfillmentStatus` | `fulfillmentStatus: string;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [HistoricalDeliveryEvidence](../../../../../src/modules/issues/historicalDelivery.ts) | `historicalDelivery` |

## IssueDetail

**Fuente:** [src/modules/issues/issue.ts](../../../../../src/modules/issues/issue.ts) · línea 25, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `id` | `id: string;` |
| `itemId` | `itemId: string;` |
| `supplierId` | `supplierId: string;` |
| `name` | `name: string;` |
| `base` | `base: number \| null;` |
| `height` | `height: number \| null;` |
| `presentation` | `presentation: string;` |
| `unitMeasure` | `unitMeasure: string;` |
| `quantity` | `quantity: number;` |
| `convertedQuantity` | `convertedQuantity: number;` |
| `suppliedQuantity` | `suppliedQuantity: number;` |
| `quantityToSupply` | `quantityToSupply: string;` |
| `returnedQuantity` | `returnedQuantity: number;` |
| `maxUnitCost` | `maxUnitCost: number \| null;` |
| `projectConvertedQuantity` | `projectConvertedQuantity: string;` |
| `isSupplied` | `isSupplied: boolean;` |
| `isOriginallySupplied` | `isOriginallySupplied: boolean;` |
| `isCanceled` | `isCanceled: boolean;` |
| `fulfillmentStatus` | `fulfillmentStatus?: string;` |

## IssueSupplyChanges

**Fuente:** [src/modules/issues/issue.ts](../../../../../src/modules/issues/issue.ts) · línea 46, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
Partial<
    Pick<IssueDetail, 'isSupplied' | 'quantityToSupply' | 'projectConvertedQuantity'>
>
```

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [IssueDetail](../../../../../src/modules/issues/issue.ts) | `type` |

## IssueDocument

**Fuente:** [src/modules/issues/issue.ts](../../../../../src/modules/issues/issue.ts) · línea 49, columna 1. **Declaración:** interface.

**Extensión/implementación:** `extends IssueRow`.

| Miembro | Firma completa |
| --- | --- |
| `details` | `details: IssueDetail[];` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| inheritance | [IssueRow](../../../../../src/modules/issues/issue.ts) | `extends` |
| association | [IssueDetail](../../../../../src/modules/issues/issue.ts) | `details` |

## IssueValues

**Fuente:** [src/modules/issues/issue.ts](../../../../../src/modules/issues/issue.ts) · línea 52, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `clientId` | `clientId: string;` |
| `advisorId` | `advisorId: string;` |
| `departmentId` | `departmentId: string;` |
| `requesterId` | `requesterId: string;` |
| `projectNumber` | `projectNumber: string;` |
| `requestDate` | `requestDate: string;` |
| `observations` | `observations: string;` |
| `details` | `details: IssueDetail[];` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [IssueDetail](../../../../../src/modules/issues/issue.ts) | `details` |

## IssueField

**Fuente:** [src/modules/issues/issue.ts](../../../../../src/modules/issues/issue.ts) · línea 62, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
keyof IssueValues
```

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [IssueValues](../../../../../src/modules/issues/issue.ts) | `type` |

## IssueWriteMode

**Fuente:** [src/modules/issues/issue.ts](../../../../../src/modules/issues/issue.ts) · línea 63, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
'create' | 'edit' | 'header' | 'supply'
```

## IssueOpenMode

**Fuente:** [src/modules/issues/issue.ts](../../../../../src/modules/issues/issue.ts) · línea 64, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
'edit' | 'view' | 'supply' | 'return'
```

## IssueWriteTarget

**Fuente:** [src/modules/issues/issue.ts](../../../../../src/modules/issues/issue.ts) · línea 65, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
| { mode: 'create'; document?: never }
    | { mode: Exclude<IssueWriteMode, 'create'>; document: IssueDocument }
```

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [IssueWriteMode](../../../../../src/modules/issues/issue.ts) | `type` |
| dependency | [IssueDocument](../../../../../src/modules/issues/issue.ts) | `type` |

## IssueTarget

**Fuente:** [src/modules/issues/issue.ts](../../../../../src/modules/issues/issue.ts) · línea 68, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
IssueWriteTarget | { mode: 'view' | 'return'; document: IssueDocument }
```

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [IssueWriteTarget](../../../../../src/modules/issues/issue.ts) | `type` |
| dependency | [IssueDocument](../../../../../src/modules/issues/issue.ts) | `type` |

## IssueFilters

**Fuente:** [src/modules/issues/issue.ts](../../../../../src/modules/issues/issue.ts) · línea 69, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `startDate` | `startDate: string;` |
| `endDate` | `endDate: string;` |
| `clientId` | `clientId: string;` |
| `departmentId` | `departmentId: string;` |
| `personId` | `personId: string;` |
| `fulfillmentStatusId` | `fulfillmentStatusId: string;` |
| `observationsSearch` | `observationsSearch: string;` |

## IssueQuery

**Fuente:** [src/modules/issues/issue.ts](../../../../../src/modules/issues/issue.ts) · línea 78, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
RecordQuery & IssueFilters
```

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [RecordQuery](../../../../../src/shared/list.ts) | `type` |
| dependency | [IssueFilters](../../../../../src/modules/issues/issue.ts) | `type` |

## IssueLookup

**Fuente:** [src/modules/issues/issue.ts](../../../../../src/modules/issues/issue.ts) · línea 79, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
'clients' | 'departments' | 'persons' | 'statuses' | 'items'
```

## IssueHeaderSelect

**Fuente:** [src/modules/issues/issue.ts](../../../../../src/modules/issues/issue.ts) · línea 80, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `field` | `field: 'clientId' \| 'advisorId' \| 'departmentId' \| 'requesterId';` |
| `kind` | `kind: 'clients' \| 'advisors' \| 'departments' \| 'requesters';` |
| `label` | `label: string;` |
| `state` | `state: LookupState;` |
| `initialOption` | `initialOption?: LookupItem;` |
| `isDisabled` | `isDisabled: boolean;` |
| `hint` | `hint: string;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [LookupState](../../../../../src/shared/lookup.ts) | `state` |
| association | [LookupItem](../../../../../src/shared/lookup.ts) | `initialOption` |

## IssueFilterSelect

**Fuente:** [src/modules/issues/issue.ts](../../../../../src/modules/issues/issue.ts) · línea 89, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `field` | `field: 'clientId' \| 'departmentId' \| 'personId' \| 'fulfillmentStatusId';` |
| `kind` | `kind: 'clients' \| 'departments' \| 'persons' \| 'statuses';` |
| `label` | `label: string;` |
| `state` | `state: LookupState;` |
| `isDisabled` | `isDisabled: boolean;` |
| `hint` | `hint: string;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [LookupState](../../../../../src/shared/lookup.ts) | `state` |

## HistoricalDeliveryPage.defineProps

**Fuente:** [src/modules/issues/pages/HistoricalDeliveryPage.vue](../../../../../src/modules/issues/pages/HistoricalDeliveryPage.vue) · línea 6, columna 27. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `resource` | `resource: IssueResource;` |
| `userId` | `userId: string` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [IssueResource](../../../../../src/modules/issues/issue.ts) | `resource` |

## HistoricalDeliveryPage.defineEmits

**Fuente:** [src/modules/issues/pages/HistoricalDeliveryPage.vue](../../../../../src/modules/issues/pages/HistoricalDeliveryPage.vue) · línea 7, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `close` | `close: [];` |
| `saved` | `saved: [];` |
| `unauthorized` | `unauthorized: []` |

## IssueEditorPage.defineProps

**Fuente:** [src/modules/issues/pages/IssueEditorPage.vue](../../../../../src/modules/issues/pages/IssueEditorPage.vue) · línea 15, columna 27. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `resource` | `resource: IssueResource;` |
| `target` | `target: IssueTarget` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [IssueResource](../../../../../src/modules/issues/issue.ts) | `resource` |
| dependency | [IssueTarget](../../../../../src/modules/issues/issue.ts) | `target` |

## IssueEditorPage.defineEmits

**Fuente:** [src/modules/issues/pages/IssueEditorPage.vue](../../../../../src/modules/issues/pages/IssueEditorPage.vue) · línea 16, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `saved` | `saved: [result: MutationConfirmation];` |
| `detailSaved` | `detailSaved: [result: MutationConfirmation];` |
| `close` | `close: [];` |
| `reload` | `reload: [];` |
| `createClient` | `createClient: [request: LookupCreation];` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [MutationConfirmation](../../../../../src/shared/http/recordContract.ts) | `saved` |
| dependency | [MutationConfirmation](../../../../../src/shared/http/recordContract.ts) | `detailSaved` |
| dependency | [LookupCreation](../../../../../src/shared/lookup.ts) | `createClient` |

## IssueLineEntryPage.defineProps

**Fuente:** [src/modules/issues/pages/IssueLineEntryPage.vue](../../../../../src/modules/issues/pages/IssueLineEntryPage.vue) · línea 8, columna 27. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `resource` | `resource: IssueResource;` |
| `isDisabled` | `isDisabled: boolean;` |
| `canRead` | `canRead: boolean` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [IssueResource](../../../../../src/modules/issues/issue.ts) | `resource` |

## IssueLineEntryPage.defineEmits

**Fuente:** [src/modules/issues/pages/IssueLineEntryPage.vue](../../../../../src/modules/issues/pages/IssueLineEntryPage.vue) · línea 9, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `add` | `add: [line: IssueDetail]` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [IssueDetail](../../../../../src/modules/issues/issue.ts) | `add` |

## IssuePage.defineProps

**Fuente:** [src/modules/issues/pages/IssuePage.vue](../../../../../src/modules/issues/pages/IssuePage.vue) · línea 27, columna 27. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `resource` | `resource: IssueResource` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [IssueResource](../../../../../src/modules/issues/issue.ts) | `resource` |

## IssuePage.defineEmits

**Fuente:** [src/modules/issues/pages/IssuePage.vue](../../../../../src/modules/issues/pages/IssuePage.vue) · línea 28, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `createClient` | `createClient: [request: LookupCreation]` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [LookupCreation](../../../../../src/shared/lookup.ts) | `createClient` |

## IssueReturnPage.defineProps

**Fuente:** [src/modules/issues/pages/IssueReturnPage.vue](../../../../../src/modules/issues/pages/IssueReturnPage.vue) · línea 7, columna 27. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `resource` | `resource: IssueResource;` |
| `document` | `document: IssueDocument;` |
| `detail` | `detail: IssueDetail;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [IssueResource](../../../../../src/modules/issues/issue.ts) | `resource` |
| association | [IssueDocument](../../../../../src/modules/issues/issue.ts) | `document` |
| association | [IssueDetail](../../../../../src/modules/issues/issue.ts) | `detail` |

## IssueReturnPage.defineEmits

**Fuente:** [src/modules/issues/pages/IssueReturnPage.vue](../../../../../src/modules/issues/pages/IssueReturnPage.vue) · línea 12, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `saved` | `saved: [result: MutationConfirmation];` |
| `close` | `close: [];` |
| `denied` | `denied: [status: number];` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [MutationConfirmation](../../../../../src/shared/http/recordContract.ts) | `saved` |

## IssueLookupRequest

**Fuente:** [src/modules/issues/services/issueLookupService.ts](../../../../../src/modules/issues/services/issueLookupService.ts) · línea 9, columna 1. **Declaración:** interface.

**Extensión/implementación:** `extends LookupQuery`.

| Miembro | Firma completa |
| --- | --- |
| `kind` | `kind: IssueLookup;` |
| `resource` | `resource: IssueResource;` |
| `filters` | `filters?: Record<string, string \| string[]>;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| inheritance | [LookupQuery](../../../../../src/shared/lookup.ts) | `extends` |
| dependency | [IssueLookup](../../../../../src/modules/issues/issue.ts) | `kind` |
| dependency | [IssueResource](../../../../../src/modules/issues/issue.ts) | `resource` |
