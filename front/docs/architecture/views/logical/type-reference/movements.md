# Contratos TypeScript: movements

Generado con `npm run docs:generate`. No editar manualmente.

[Alcance y notación](index.md#alcance-y-notación).

## MovementFilters.defineProps

**Fuente:** [src/modules/movements/components/MovementFilters.vue](../../../../../src/modules/movements/components/MovementFilters.vue) · línea 12, columna 13. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `values` | `values: MovementFilters;` |
| `suppliers` | `suppliers: LookupState;` |
| `items` | `items: LookupState;` |
| `canSelectSupplier` | `canSelectSupplier: boolean;` |
| `canSelectItem` | `canSelectItem: boolean;` |
| `itemLabel` | `itemLabel: string;` |
| `isLoading` | `isLoading: boolean;` |
| `error` | `error: string;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [MovementFilters](../../../../../src/modules/movements/movement.ts) | `values` |
| association | [LookupState](../../../../../src/shared/lookup.ts) | `suppliers` |
| association | [LookupState](../../../../../src/shared/lookup.ts) | `items` |

## MovementFilters.defineEmits

**Fuente:** [src/modules/movements/components/MovementFilters.vue](../../../../../src/modules/movements/components/MovementFilters.vue) · línea 22, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `update` | `update: [field: keyof MovementFilters, value: string];` |
| `searchOptions` | `searchOptions: [lookup: 'suppliers' \| 'items', value: string];` |
| `more` | `more: [lookup: 'suppliers' \| 'items'];` |
| `retry` | `retry: [lookup: 'suppliers' \| 'items'];` |
| `apply` | `apply: [];` |
| `clear` | `clear: [];` |
| `refresh` | `refresh: [];` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [MovementFilters](../../../../../src/modules/movements/movement.ts) | `update` |

## MovementTable.defineProps

**Fuente:** [src/modules/movements/components/MovementTable.vue](../../../../../src/modules/movements/components/MovementTable.vue) · línea 9, columna 27. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `resource` | `resource: MovementResource;` |
| `query` | `query: MovementQuery;` |
| `rows` | `rows: MovementRow[];` |
| `total` | `total: number;` |
| `isLoading` | `isLoading: boolean;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [MovementResource](../../../../../src/modules/movements/movement.ts) | `resource` |
| dependency | [MovementQuery](../../../../../src/modules/movements/movement.ts) | `query` |
| association | [MovementRow](../../../../../src/modules/movements/movement.ts) | `rows` |

## MovementTable.defineEmits

**Fuente:** [src/modules/movements/components/MovementTable.vue](../../../../../src/modules/movements/components/MovementTable.vue) · línea 16, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `query` | `query: [changes: Partial<MovementQuery>]` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [MovementQuery](../../../../../src/modules/movements/movement.ts) | `query` |

## MovementResource

**Fuente:** [src/modules/movements/movement.ts](../../../../../src/modules/movements/movement.ts) · línea 3, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
'materials' | 'consumables' | 'wastes'
```

## MovementType

**Fuente:** [src/modules/movements/movement.ts](../../../../../src/modules/movements/movement.ts) · línea 4, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
'' | 'ENTRY' | 'ISSUE' | 'ADJUSTMENT' | 'RETURN'
```

## MovementFilters

**Fuente:** [src/modules/movements/movement.ts](../../../../../src/modules/movements/movement.ts) · línea 6, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `startDate` | `startDate: string;` |
| `endDate` | `endDate: string;` |
| `movementType` | `movementType: MovementType;` |
| `supplierId` | `supplierId: string;` |
| `itemId` | `itemId: string;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [MovementType](../../../../../src/modules/movements/movement.ts) | `movementType` |

## MovementQuery

**Fuente:** [src/modules/movements/movement.ts](../../../../../src/modules/movements/movement.ts) · línea 13, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
MovementFilters & RecordQuery
```

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [MovementFilters](../../../../../src/modules/movements/movement.ts) | `type` |
| dependency | [RecordQuery](../../../../../src/shared/list.ts) | `type` |

## MovementRow

**Fuente:** [src/modules/movements/movement.ts](../../../../../src/modules/movements/movement.ts) · línea 14, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `id` | `id: string;` |
| `date` | `date: string;` |
| `type` | `type: string;` |
| `referenceNumber` | `referenceNumber: string;` |
| `materialName` | `materialName: string;` |
| `supplierName` | `supplierName: string;` |
| `materialBase` | `materialBase: string \| number \| null;` |
| `materialHeight` | `materialHeight: string \| number \| null;` |
| `previousStock` | `previousStock: string \| number \| null;` |
| `quantity` | `quantity: string \| number \| null;` |
| `newStock` | `newStock: string \| number \| null;` |

## MovementPage.defineProps

**Fuente:** [src/modules/movements/pages/MovementPage.vue](../../../../../src/modules/movements/pages/MovementPage.vue) · línea 21, columna 27. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `resource` | `resource: MovementResource` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [MovementResource](../../../../../src/modules/movements/movement.ts) | `resource` |
