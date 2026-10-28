# Contratos TypeScript: purchases

Generado con `npm run docs:generate`. No editar manualmente.

Cada figura incluye hasta ocho miembros y dos relaciones; las partes reúnen el contrato completo.
Los destinos sin atributos son referencias: su definición completa aparece en su propia ficha.
Los objetos inline declarados muestran contexto, línea y columna. Las formas inferidas usan shapeN dentro del contrato padre; su fuente apunta al export o función original. No son clases instanciadas.

[Lectura y cobertura](index.md).

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

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [PurchaseCorrectionForm.totals@8:13](../../../../../src/modules/purchases/components/PurchaseCorrectionForm.vue) | `totals` |
| association | [PurchaseCorrectionForm.values@9:13](../../../../../src/modules/purchases/components/PurchaseCorrectionForm.vue) | `values` |
| dependency | `Partial` | `errors` |
| dependency | `Record` | `errors` |

**Figura:** `DIA-VUE-TS-PURCHASES-1-1`. Parte 1/2.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseCorrectionForm.<br/>defineProps"] {
        <<SFC_contract>>
        context: string
        totals: object
        values: object
        errors: complex
        message: string
        isSubmitting: boolean
        isConflicted: boolean
    }
    class R0["PurchaseCorrectionForm.<br/>totals@8:13"] {
        <<reference>>
    }
    class R1["PurchaseCorrectionForm.<br/>values@9:13"] {
        <<reference>>
    }
    Subject "1" --> "0..1" R0 : totals
    Subject "1" --> "1" R1 : values
```

**Figura:** `DIA-VUE-TS-PURCHASES-1-2`. Parte 2/2.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseCorrectionForm.<br/>defineProps"] {
        <<SFC_contract>>
    }
    class R0["Partial"] {
        <<reference>>
    }
    class R1["Record"] {
        <<reference>>
    }
    Subject ..> R0 : errors
    Subject ..> R1 : errors
```

## PurchaseCorrectionForm.totals@8:13

**Fuente:** [src/modules/purchases/components/PurchaseCorrectionForm.vue](../../../../../src/modules/purchases/components/PurchaseCorrectionForm.vue) · línea 8, columna 13. **Declaración:** inline object.

| Miembro | Firma completa |
| --- | --- |
| `quantity` | `quantity: number;` |
| `net` | `net: number;` |
| `gross` | `gross: number` |

**Figura:** `DIA-VUE-TS-PURCHASES-2-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseCorrectionForm.<br/>totals@8:13"] {
        <<inline_object>>
        quantity: number
        net: number
        gross: number
    }
```

## PurchaseCorrectionForm.values@9:13

**Fuente:** [src/modules/purchases/components/PurchaseCorrectionForm.vue](../../../../../src/modules/purchases/components/PurchaseCorrectionForm.vue) · línea 9, columna 13. **Declaración:** inline object.

| Miembro | Firma completa |
| --- | --- |
| `quantity` | `quantity: string;` |
| `costPerUnitType` | `costPerUnitType: string` |

**Figura:** `DIA-VUE-TS-PURCHASES-3-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseCorrectionForm.<br/>values@9:13"] {
        <<inline_object>>
        quantity: string
        costPerUnitType: string
    }
```

## PurchaseCorrectionForm.defineEmits

**Fuente:** [src/modules/purchases/components/PurchaseCorrectionForm.vue](../../../../../src/modules/purchases/components/PurchaseCorrectionForm.vue) · línea 15, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `update` | `update: [field: 'quantity' \| 'costPerUnitType', value: string];` |
| `blur` | `blur: [field: 'quantity' \| 'costPerUnitType'];` |
| `submit` | `submit: [];` |
| `close` | `close: [];` |
| `reload` | `reload: [];` |

**Figura:** `DIA-VUE-TS-PURCHASES-4-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseCorrectionForm.<br/>defineEmits"] {
        <<SFC_contract>>
        update: tuple
        blur: tuple
        submit: tuple
        close: tuple
        reload: tuple
    }
```

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

**Figura:** `DIA-VUE-TS-PURCHASES-5-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseDetailsTable.<br/>defineProps"] {
        <<SFC_contract>>
        rows: PurchaseDetail[]
        canChange: boolean
        canRemove: boolean
        isDisabled: boolean
    }
    class R0["PurchaseDetail"] {
        <<reference>>
    }
    Subject "1" --> "0..*" R0 : rows
```

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

**Figura:** `DIA-VUE-TS-PURCHASES-6-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseDetailsTable.<br/>defineEmits"] {
        <<SFC_contract>>
        remove: tuple
        correct: tuple
        cancel: tuple
    }
    class R0["PurchaseDetail"] {
        <<reference>>
    }
    Subject ..> R0 : correct
    Subject ..> R0 : cancel
```

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
| dependency | `Partial` | `errors` |
| dependency | `Record` | `errors` |
| dependency | [PurchaseField](../../../../../src/modules/purchases/purchase.ts) | `errors` |
| association | [LookupState](../../../../../src/shared/lookup.ts) | `suppliers` |
| association | [LookupState](../../../../../src/shared/lookup.ts) | `persons` |
| association | [LookupItem](../../../../../src/shared/lookup.ts) | `supplier` |
| association | [LookupItem](../../../../../src/shared/lookup.ts) | `receiver` |
| association | [PurchaseDetail](../../../../../src/modules/purchases/purchase.ts) | `details` |
| association | [PurchaseEditor.totals@35:13](../../../../../src/modules/purchases/components/PurchaseEditor.vue) | `totals` |

**Figura:** `DIA-VUE-TS-PURCHASES-7-1`. Parte 1/5.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseEditor.defineProps"] {
        <<SFC_contract>>
        title: string
        values: PurchaseValues
        errors: Partial~Record~PurchaseField, string~~
        message: string
        isSubmitting: boolean
        isConflicted: boolean
        isReadOnly: boolean
        isChanging: boolean
    }
    class R0["PurchaseValues"] {
        <<reference>>
    }
    class R1["Partial"] {
        <<reference>>
    }
    Subject "1" --> "1" R0 : values
    Subject ..> R1 : errors
```

**Figura:** `DIA-VUE-TS-PURCHASES-7-2`. Parte 2/5.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseEditor.defineProps"] {
        <<SFC_contract>>
        isEditing: boolean
        canChangeDetails: boolean
        canCreateSupplier: boolean
        canSuppliers: boolean
        canPersons: boolean
        suppliers: LookupState
        persons: LookupState
        supplier?: LookupItem
    }
    class R0["Record"] {
        <<reference>>
    }
    class R1["PurchaseField"] {
        <<reference>>
    }
    Subject ..> R0 : errors
    Subject ..> R1 : errors
```

**Figura:** `DIA-VUE-TS-PURCHASES-7-3`. Parte 3/5.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseEditor.defineProps"] {
        <<SFC_contract>>
        receiver?: LookupItem
        details: PurchaseDetail[]
        totals: object
    }
    class R0["LookupState"] {
        <<reference>>
    }
    Subject "1" --> "1" R0 : suppliers
    Subject "1" --> "1" R0 : persons
```

**Figura:** `DIA-VUE-TS-PURCHASES-7-4`. Parte 4/5.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseEditor.defineProps"] {
        <<SFC_contract>>
    }
    class R0["LookupItem"] {
        <<reference>>
    }
    Subject "1" --> "0..1" R0 : supplier
    Subject "1" --> "0..1" R0 : receiver
```

**Figura:** `DIA-VUE-TS-PURCHASES-7-5`. Parte 5/5.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseEditor.defineProps"] {
        <<SFC_contract>>
    }
    class R0["PurchaseDetail"] {
        <<reference>>
    }
    class R1["PurchaseEditor.totals@35:13"] {
        <<reference>>
    }
    Subject "1" --> "0..*" R0 : details
    Subject "1" --> "1" R1 : totals
```

## PurchaseEditor.totals@35:13

**Fuente:** [src/modules/purchases/components/PurchaseEditor.vue](../../../../../src/modules/purchases/components/PurchaseEditor.vue) · línea 35, columna 13. **Declaración:** inline object.

| Miembro | Firma completa |
| --- | --- |
| `quantity` | `quantity: number;` |
| `net` | `net: number;` |
| `gross` | `gross: number` |

**Figura:** `DIA-VUE-TS-PURCHASES-8-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseEditor.totals@35:13"] {
        <<inline_object>>
        quantity: number
        net: number
        gross: number
    }
```

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

**Figura:** `DIA-VUE-TS-PURCHASES-9-1`. Parte 1/2.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseEditor.defineEmits"] {
        <<SFC_contract>>
        update: tuple
        blur: tuple
        search: tuple
        more: tuple
        retry: tuple
        createSupplier: tuple
        remove: tuple
        correct: tuple
    }
    class R0["PurchaseField"] {
        <<reference>>
    }
    Subject ..> R0 : update
    Subject ..> R0 : blur
```

**Figura:** `DIA-VUE-TS-PURCHASES-9-2`. Parte 2/2.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseEditor.defineEmits"] {
        <<SFC_contract>>
        cancel: tuple
        submit: tuple
        close: tuple
        reload: tuple
    }
    class R0["PurchaseDetail"] {
        <<reference>>
    }
    Subject ..> R0 : correct
    Subject ..> R0 : cancel
```

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

**Figura:** `DIA-VUE-TS-PURCHASES-10-1`. Parte 1/2.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseFilters.defineProps"] {
        <<SFC_contract>>
        values: PurchaseFilters
        suppliers: LookupState
        persons: LookupState
        canSuppliers: boolean
        canPersons: boolean
        isLoading: boolean
        error: string
    }
    class R0["PurchaseFilters"] {
        <<reference>>
    }
    class R1["LookupState"] {
        <<reference>>
    }
    Subject "1" --> "1" R0 : values
    Subject "1" --> "1" R1 : suppliers
```

**Figura:** `DIA-VUE-TS-PURCHASES-10-2`. Parte 2/2.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseFilters.defineProps"] {
        <<SFC_contract>>
    }
    class R0["LookupState"] {
        <<reference>>
    }
    Subject "1" --> "1" R0 : persons
```

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

**Figura:** `DIA-VUE-TS-PURCHASES-11-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseFilters.defineEmits"] {
        <<SFC_contract>>
        update: tuple
        apply: tuple
        clear: tuple
        refresh: tuple
        searchOptions: tuple
        more: tuple
        retry: tuple
    }
    class R0["PurchaseFilters"] {
        <<reference>>
    }
    Subject ..> R0 : update
```

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
| association | [PurchaseLineEntryForm.values@10:13](../../../../../src/modules/purchases/components/PurchaseLineEntryForm.vue) | `values` |
| dependency | `Partial` | `errors` |
| dependency | `Record` | `errors` |
| association | [LookupState](../../../../../src/shared/lookup.ts) | `items` |
| association | [LookupItem](../../../../../src/shared/lookup.ts) | `selected` |

**Figura:** `DIA-VUE-TS-PURCHASES-12-1`. Parte 1/3.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseLineEntryForm.<br/>defineProps"] {
        <<SFC_contract>>
        itemLabel: string
        values: object
        errors: complex
        items: LookupState
        selected?: LookupItem
        isDisabled: boolean
        canRead: boolean
        canCreate: boolean
    }
    class R0["PurchaseLineEntryForm.<br/>values@10:13"] {
        <<reference>>
    }
    class R1["Partial"] {
        <<reference>>
    }
    Subject "1" --> "1" R0 : values
    Subject ..> R1 : errors
```

**Figura:** `DIA-VUE-TS-PURCHASES-12-2`. Parte 2/3.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseLineEntryForm.<br/>defineProps"] {
        <<SFC_contract>>
    }
    class R0["Record"] {
        <<reference>>
    }
    class R1["LookupState"] {
        <<reference>>
    }
    Subject ..> R0 : errors
    Subject "1" --> "1" R1 : items
```

**Figura:** `DIA-VUE-TS-PURCHASES-12-3`. Parte 3/3.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseLineEntryForm.<br/>defineProps"] {
        <<SFC_contract>>
    }
    class R0["LookupItem"] {
        <<reference>>
    }
    Subject "1" --> "0..1" R0 : selected
```

## PurchaseLineEntryForm.values@10:13

**Fuente:** [src/modules/purchases/components/PurchaseLineEntryForm.vue](../../../../../src/modules/purchases/components/PurchaseLineEntryForm.vue) · línea 10, columna 13. **Declaración:** inline object.

| Miembro | Firma completa |
| --- | --- |
| `materialId` | `materialId: string;` |
| `quantity` | `quantity: string;` |
| `costPerUnitType` | `costPerUnitType: string` |

**Figura:** `DIA-VUE-TS-PURCHASES-13-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseLineEntryForm.<br/>values@10:13"] {
        <<inline_object>>
        materialId: string
        quantity: string
        costPerUnitType: string
    }
```

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

**Figura:** `DIA-VUE-TS-PURCHASES-14-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseLineEntryForm.<br/>defineEmits"] {
        <<SFC_contract>>
        update: tuple
        blur: tuple
        search: tuple
        more: tuple
        retry: tuple
        create: tuple
        add: tuple
    }
```

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

**Figura:** `DIA-VUE-TS-PURCHASES-15-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseTable.defineProps"] {
        <<SFC_contract>>
        rows: PurchaseRow[]
        query: PurchaseQuery
        total: number
        isLoading: boolean
        isReading: boolean
    }
    class R0["PurchaseRow"] {
        <<reference>>
    }
    class R1["PurchaseQuery"] {
        <<reference>>
    }
    Subject "1" --> "0..*" R0 : rows
    Subject ..> R1 : query
```

## PurchaseTable.defineEmits

**Fuente:** [src/modules/purchases/components/PurchaseTable.vue](../../../../../src/modules/purchases/components/PurchaseTable.vue) · línea 18, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `query` | `query: [changes: Partial<PurchaseQuery>];` |
| `open` | `open: [row: PurchaseRow, action: 'view' \| 'edit'];` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | `Partial` | `query` |
| dependency | [PurchaseQuery](../../../../../src/modules/purchases/purchase.ts) | `query` |
| dependency | [PurchaseRow](../../../../../src/modules/purchases/purchase.ts) | `open` |

**Figura:** `DIA-VUE-TS-PURCHASES-16-1`. Parte 1/2.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseTable.defineEmits"] {
        <<SFC_contract>>
        query: tuple
        open: tuple
    }
    class R0["Partial"] {
        <<reference>>
    }
    class R1["PurchaseQuery"] {
        <<reference>>
    }
    Subject ..> R0 : query
    Subject ..> R1 : query
```

**Figura:** `DIA-VUE-TS-PURCHASES-16-2`. Parte 2/2.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseTable.defineEmits"] {
        <<SFC_contract>>
    }
    class R0["PurchaseRow"] {
        <<reference>>
    }
    Subject ..> R0 : open
```

## PurchaseTotals.defineProps

**Fuente:** [src/modules/purchases/components/PurchaseTotals.vue](../../../../../src/modules/purchases/components/PurchaseTotals.vue) · línea 5, columna 17. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `totals` | `totals: { quantity: number; net: number; gross: number } \| null;` |
| `isCorrection` | `isCorrection?: boolean;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [PurchaseTotals.totals@6:17](../../../../../src/modules/purchases/components/PurchaseTotals.vue) | `totals` |

**Figura:** `DIA-VUE-TS-PURCHASES-17-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseTotals.defineProps"] {
        <<SFC_contract>>
        totals: object
        isCorrection?: boolean
    }
    class R0["PurchaseTotals.totals@6:17"] {
        <<reference>>
    }
    Subject "1" --> "0..1" R0 : totals
```

## PurchaseTotals.totals@6:17

**Fuente:** [src/modules/purchases/components/PurchaseTotals.vue](../../../../../src/modules/purchases/components/PurchaseTotals.vue) · línea 6, columna 17. **Declaración:** inline object.

| Miembro | Firma completa |
| --- | --- |
| `quantity` | `quantity: number;` |
| `net` | `net: number;` |
| `gross` | `gross: number` |

**Figura:** `DIA-VUE-TS-PURCHASES-18-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseTotals.totals@6:17"] {
        <<inline_object>>
        quantity: number
        net: number
        gross: number
    }
```

## usePurchaseActions.options@10:45

**Fuente:** [src/modules/purchases/composables/usePurchaseActions.ts](../../../../../src/modules/purchases/composables/usePurchaseActions.ts) · línea 10, columna 45. **Declaración:** inline object.

| Miembro | Firma completa |
| --- | --- |
| `resource` | `resource: PurchaseResource;` |
| `canManage` | `canManage: () => boolean;` |
| `reload` | `reload: () => unknown;` |
| `onError` | `onError: (cause: unknown) => void;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [PurchaseResource](../../../../../src/modules/purchases/purchase.ts) | `resource` |

**Figura:** `DIA-VUE-TS-PURCHASES-19-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseActions.<br/>options@10:45"] {
        <<inline_object>>
        resource: PurchaseResource
        canManage: callback
        reload: callback
        onError: callback
    }
    class R0["PurchaseResource"] {
        <<reference>>
    }
    Subject ..> R0 : resource
```

## lastOpen@26:19

**Fuente:** [src/modules/purchases/composables/usePurchaseActions.ts](../../../../../src/modules/purchases/composables/usePurchaseActions.ts) · línea 26, columna 19. **Declaración:** inline object.

| Miembro | Firma completa |
| --- | --- |
| `row` | `row: PurchaseRow;` |
| `action` | `action: 'view' \| 'edit'` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [PurchaseRow](../../../../../src/modules/purchases/purchase.ts) | `row` |

**Figura:** `DIA-VUE-TS-PURCHASES-20-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["lastOpen@26:19"] {
        <<inline_object>>
        row: PurchaseRow
        action: 'view' | 'edit'
    }
    class R0["PurchaseRow"] {
        <<reference>>
    }
    Subject "1" --> "1" R0 : row
```

## usePurchaseCorrection.options@12:48

**Fuente:** [src/modules/purchases/composables/usePurchaseCorrection.ts](../../../../../src/modules/purchases/composables/usePurchaseCorrection.ts) · línea 12, columna 48. **Declaración:** inline object.

| Miembro | Firma completa |
| --- | --- |
| `resource` | `resource: PurchaseResource;` |
| `document` | `document: PurchaseDocument;` |
| `detail` | `detail: PurchaseDetail;` |
| `onSaved` | `onSaved: (confirmation: MutationConfirmation) => void;` |
| `onDenied` | `onDenied: (status: number) => void;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [PurchaseResource](../../../../../src/modules/purchases/purchase.ts) | `resource` |
| association | [PurchaseDocument](../../../../../src/modules/purchases/purchase.ts) | `document` |
| association | [PurchaseDetail](../../../../../src/modules/purchases/purchase.ts) | `detail` |
| dependency | [MutationConfirmation](../../../../../src/shared/http/recordContract.ts) | `onSaved` |

**Figura:** `DIA-VUE-TS-PURCHASES-21-1`. Parte 1/2.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseCorrection.<br/>options@12:48"] {
        <<inline_object>>
        resource: PurchaseResource
        document: PurchaseDocument
        detail: PurchaseDetail
        onSaved: callback
        onDenied: callback
    }
    class R0["PurchaseResource"] {
        <<reference>>
    }
    class R1["PurchaseDocument"] {
        <<reference>>
    }
    Subject ..> R0 : resource
    Subject "1" --> "1" R1 : document
```

**Figura:** `DIA-VUE-TS-PURCHASES-21-2`. Parte 2/2.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseCorrection.<br/>options@12:48"] {
        <<inline_object>>
    }
    class R0["PurchaseDetail"] {
        <<reference>>
    }
    class R1["MutationConfirmation"] {
        <<reference>>
    }
    Subject "1" --> "1" R0 : detail
    Subject ..> R1 : onSaved
```

## Field

**Fuente:** [src/modules/purchases/composables/usePurchaseCorrection.ts](../../../../../src/modules/purchases/composables/usePurchaseCorrection.ts) · línea 19, columna 5. **Declaración:** type.

**Definición completa:**

```typescript
'quantity' | 'costPerUnitType'
```

**Figura:** `DIA-VUE-TS-PURCHASES-22-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["Field"] {
        <<type>>
    }
```

## usePurchaseEditor.options@23:44

**Fuente:** [src/modules/purchases/composables/usePurchaseEditor.ts](../../../../../src/modules/purchases/composables/usePurchaseEditor.ts) · línea 23, columna 44. **Declaración:** inline object.

| Miembro | Firma completa |
| --- | --- |
| `resource` | `resource: PurchaseResource;` |
| `target` | `target: PurchaseTarget;` |
| `has` | `has: (permission: string) => boolean;` |
| `onSaved` | `onSaved: (confirmation: MutationConfirmation) => void;` |
| `onDenied` | `onDenied: (status: number) => void;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [PurchaseResource](../../../../../src/modules/purchases/purchase.ts) | `resource` |
| dependency | [PurchaseTarget](../../../../../src/modules/purchases/purchase.ts) | `target` |
| dependency | [MutationConfirmation](../../../../../src/shared/http/recordContract.ts) | `onSaved` |

**Figura:** `DIA-VUE-TS-PURCHASES-23-1`. Parte 1/2.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseEditor.<br/>options@23:44"] {
        <<inline_object>>
        resource: PurchaseResource
        target: PurchaseTarget
        has: callback
        onSaved: callback
        onDenied: callback
    }
    class R0["PurchaseResource"] {
        <<reference>>
    }
    class R1["PurchaseTarget"] {
        <<reference>>
    }
    Subject ..> R0 : resource
    Subject ..> R1 : target
```

**Figura:** `DIA-VUE-TS-PURCHASES-23-2`. Parte 2/2.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseEditor.<br/>options@23:44"] {
        <<inline_object>>
    }
    class R0["MutationConfirmation"] {
        <<reference>>
    }
    Subject ..> R0 : onSaved
```

## usePurchaseLineEntry.options@12:47

**Fuente:** [src/modules/purchases/composables/usePurchaseLineEntry.ts](../../../../../src/modules/purchases/composables/usePurchaseLineEntry.ts) · línea 12, columna 47. **Declaración:** inline object.

| Miembro | Firma completa |
| --- | --- |
| `resource` | `resource: PurchaseResource;` |
| `supplier` | `supplier: LookupItem;` |
| `canRead` | `canRead: boolean;` |
| `isDisabled` | `isDisabled: () => boolean;` |
| `onAdded` | `onAdded: (line: PurchaseDetail) => void;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [PurchaseResource](../../../../../src/modules/purchases/purchase.ts) | `resource` |
| association | [LookupItem](../../../../../src/shared/lookup.ts) | `supplier` |
| dependency | [PurchaseDetail](../../../../../src/modules/purchases/purchase.ts) | `onAdded` |

**Figura:** `DIA-VUE-TS-PURCHASES-24-1`. Parte 1/2.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseLineEntry.<br/>options@12:47"] {
        <<inline_object>>
        resource: PurchaseResource
        supplier: LookupItem
        canRead: boolean
        isDisabled: callback
        onAdded: callback
    }
    class R0["PurchaseResource"] {
        <<reference>>
    }
    class R1["LookupItem"] {
        <<reference>>
    }
    Subject ..> R0 : resource
    Subject "1" --> "1" R1 : supplier
```

**Figura:** `DIA-VUE-TS-PURCHASES-24-2`. Parte 2/2.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseLineEntry.<br/>options@12:47"] {
        <<inline_object>>
    }
    class R0["PurchaseDetail"] {
        <<reference>>
    }
    Subject ..> R0 : onAdded
```

## Field

**Fuente:** [src/modules/purchases/composables/usePurchaseLineEntry.ts](../../../../../src/modules/purchases/composables/usePurchaseLineEntry.ts) · línea 19, columna 5. **Declaración:** type.

**Definición completa:**

```typescript
'materialId' | 'quantity' | 'costPerUnitType'
```

**Figura:** `DIA-VUE-TS-PURCHASES-25-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["Field"] {
        <<type>>
    }
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

**Figura:** `DIA-VUE-TS-PURCHASES-26-1`. Parte 1/2.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseCorrectionPage.<br/>defineProps"] {
        <<SFC_contract>>
        resource: PurchaseResource
        document: PurchaseDocument
        detail: PurchaseDetail
    }
    class R0["PurchaseResource"] {
        <<reference>>
    }
    class R1["PurchaseDocument"] {
        <<reference>>
    }
    Subject ..> R0 : resource
    Subject "1" --> "1" R1 : document
```

**Figura:** `DIA-VUE-TS-PURCHASES-26-2`. Parte 2/2.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseCorrectionPage.<br/>defineProps"] {
        <<SFC_contract>>
    }
    class R0["PurchaseDetail"] {
        <<reference>>
    }
    Subject "1" --> "1" R0 : detail
```

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

**Figura:** `DIA-VUE-TS-PURCHASES-27-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseCorrectionPage.<br/>defineEmits"] {
        <<SFC_contract>>
        saved: tuple
        close: tuple
        reload: tuple
    }
    class R0["MutationConfirmation"] {
        <<reference>>
    }
    Subject ..> R0 : saved
```

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

**Figura:** `DIA-VUE-TS-PURCHASES-28-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseEditorPage.<br/>defineProps"] {
        <<SFC_contract>>
        resource: PurchaseResource
        target: PurchaseTarget
        canChangeDetails: boolean
        isChanging: boolean
        readError: string
    }
    class R0["PurchaseResource"] {
        <<reference>>
    }
    class R1["PurchaseTarget"] {
        <<reference>>
    }
    Subject ..> R0 : resource
    Subject ..> R1 : target
```

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

**Figura:** `DIA-VUE-TS-PURCHASES-29-1`. Parte 1/3.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseEditorPage.<br/>defineEmits"] {
        <<SFC_contract>>
        saved: tuple
        close: tuple
        reload: tuple
        correct: tuple
        cancel: tuple
        createSupplier: tuple
        createItem: tuple
    }
    class R0["MutationConfirmation"] {
        <<reference>>
    }
    class R1["PurchaseDetail"] {
        <<reference>>
    }
    Subject ..> R0 : saved
    Subject ..> R1 : correct
```

**Figura:** `DIA-VUE-TS-PURCHASES-29-2`. Parte 2/3.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseEditorPage.<br/>defineEmits"] {
        <<SFC_contract>>
    }
    class R0["PurchaseDetail"] {
        <<reference>>
    }
    class R1["LookupCreation"] {
        <<reference>>
    }
    Subject ..> R0 : cancel
    Subject ..> R1 : createSupplier
```

**Figura:** `DIA-VUE-TS-PURCHASES-29-3`. Parte 3/3.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseEditorPage.<br/>defineEmits"] {
        <<SFC_contract>>
    }
    class R0["ItemCreation"] {
        <<reference>>
    }
    Subject ..> R0 : createItem
```

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

**Figura:** `DIA-VUE-TS-PURCHASES-30-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseLineEntryPage.<br/>defineProps"] {
        <<SFC_contract>>
        resource: PurchaseResource
        supplier: LookupItem
        isDisabled: boolean
        canRead: boolean
        canCreate: boolean
    }
    class R0["PurchaseResource"] {
        <<reference>>
    }
    class R1["LookupItem"] {
        <<reference>>
    }
    Subject ..> R0 : resource
    Subject "1" --> "1" R1 : supplier
```

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

**Figura:** `DIA-VUE-TS-PURCHASES-31-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseLineEntryPage.<br/>defineEmits"] {
        <<SFC_contract>>
        add: tuple
        create: tuple
    }
    class R0["PurchaseDetail"] {
        <<reference>>
    }
    class R1["ItemCreation"] {
        <<reference>>
    }
    Subject ..> R0 : add
    Subject ..> R1 : create
```

## PurchasePage.defineProps

**Fuente:** [src/modules/purchases/pages/PurchasePage.vue](../../../../../src/modules/purchases/pages/PurchasePage.vue) · línea 27, columna 27. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `resource` | `resource: PurchaseResource` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [PurchaseResource](../../../../../src/modules/purchases/purchase.ts) | `resource` |

**Figura:** `DIA-VUE-TS-PURCHASES-32-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["PurchasePage.defineProps"] {
        <<SFC_contract>>
        resource: PurchaseResource
    }
    class R0["PurchaseResource"] {
        <<reference>>
    }
    Subject ..> R0 : resource
```

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

**Figura:** `DIA-VUE-TS-PURCHASES-33-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["PurchasePage.defineEmits"] {
        <<SFC_contract>>
        createSupplier: tuple
        createItem: tuple
    }
    class R0["LookupCreation"] {
        <<reference>>
    }
    class R1["ItemCreation"] {
        <<reference>>
    }
    Subject ..> R0 : createSupplier
    Subject ..> R1 : createItem
```

## PurchaseResource

**Fuente:** [src/modules/purchases/purchase.ts](../../../../../src/modules/purchases/purchase.ts) · línea 4, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
'materials' | 'consumables'
```

**Figura:** `DIA-VUE-TS-PURCHASES-34-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseResource"] {
        <<type>>
    }
```

## Decimal

**Fuente:** [src/modules/purchases/purchase.ts](../../../../../src/modules/purchases/purchase.ts) · línea 5, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
string | number
```

**Figura:** `DIA-VUE-TS-PURCHASES-35-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["Decimal"] {
        <<type>>
    }
```

## PurchaseFilters

**Fuente:** [src/modules/purchases/purchase.ts](../../../../../src/modules/purchases/purchase.ts) · línea 6, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `startDate` | `startDate: string;` |
| `endDate` | `endDate: string;` |
| `supplierId` | `supplierId: string;` |
| `personId` | `personId: string;` |

**Figura:** `DIA-VUE-TS-PURCHASES-36-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseFilters"] {
        <<interface>>
        startDate: string
        endDate: string
        supplierId: string
        personId: string
    }
```

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

**Figura:** `DIA-VUE-TS-PURCHASES-37-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseQuery"] {
        <<type>>
    }
    class R0["RecordQuery"] {
        <<reference>>
    }
    class R1["PurchaseFilters"] {
        <<reference>>
    }
    Subject ..> R0 : type
    Subject ..> R1 : type
```

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

**Figura:** `DIA-VUE-TS-PURCHASES-38-1`. Parte 1/2.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseRow"] {
        <<interface>>
        id: string
        referenceNumber: string
        receptionDate: string
        supplierId: string
        supplierName: string
        receivedById: string
        receivedByName: string
        isInvoiced: boolean
    }
    class R0["Decimal"] {
        <<reference>>
    }
    Subject ..> R0 : totalQuantity
    Subject ..> R0 : totalNetPurchaseAmount
```

**Figura:** `DIA-VUE-TS-PURCHASES-38-2`. Parte 2/2.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseRow"] {
        <<interface>>
        invoice: string
        status: string
        totalQuantity: Decimal
        totalNetPurchaseAmount: Decimal
        totalGrossPurchaseAmount: Decimal
    }
    class R0["Decimal"] {
        <<reference>>
    }
    Subject ..> R0 : totalGrossPurchaseAmount
```

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

**Figura:** `DIA-VUE-TS-PURCHASES-39-1`. Parte 1/4.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseDetail"] {
        <<interface>>
        id: string
        materialId: string
        name: string
        base: Decimal | null
        height: Decimal | null
        presentation: string
        unitMeasure: string
        quantity: Decimal
    }
    class R0["Decimal"] {
        <<reference>>
    }
    Subject ..> R0 : base
    Subject ..> R0 : height
```

**Figura:** `DIA-VUE-TS-PURCHASES-39-2`. Parte 2/4.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseDetail"] {
        <<interface>>
        convertedQuantity: Decimal
        costPerUnitType: Decimal
        conversionUnitCost: Decimal
        netPurchaseAmount: Decimal
        grossPurchaseAmount: Decimal
        status: 'ACTIVE' | 'CANCELED'
        isNew: boolean
    }
    class R0["Decimal"] {
        <<reference>>
    }
    Subject ..> R0 : quantity
    Subject ..> R0 : convertedQuantity
```

**Figura:** `DIA-VUE-TS-PURCHASES-39-3`. Parte 3/4.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseDetail"] {
        <<interface>>
    }
    class R0["Decimal"] {
        <<reference>>
    }
    Subject ..> R0 : costPerUnitType
    Subject ..> R0 : conversionUnitCost
```

**Figura:** `DIA-VUE-TS-PURCHASES-39-4`. Parte 4/4.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseDetail"] {
        <<interface>>
    }
    class R0["Decimal"] {
        <<reference>>
    }
    Subject ..> R0 : netPurchaseAmount
    Subject ..> R0 : grossPurchaseAmount
```

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

**Figura:** `DIA-VUE-TS-PURCHASES-40-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseDocument"] {
        <<interface>>
        observations: string
        details: PurchaseDetail[]
    }
    class R0["PurchaseRow"] {
        <<reference>>
    }
    class R1["PurchaseDetail"] {
        <<reference>>
    }
    R0 <|-- Subject : extends
    Subject "1" --> "0..*" R1 : details
```

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

**Figura:** `DIA-VUE-TS-PURCHASES-41-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseValues"] {
        <<interface>>
        supplierId: string
        receivedById: string
        isInvoiced: boolean
        invoice: string
        receptionDate: string
        observations: string
        details: PurchaseDetail[]
    }
    class R0["PurchaseDetail"] {
        <<reference>>
    }
    Subject "1" --> "0..*" R0 : details
```

## PurchaseField

**Fuente:** [src/modules/purchases/purchase.ts](../../../../../src/modules/purchases/purchase.ts) · línea 58, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
keyof PurchaseValues
```

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [PurchaseValues](../../../../../src/modules/purchases/purchase.ts) | `type` |

**Figura:** `DIA-VUE-TS-PURCHASES-42-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseField"] {
        <<type>>
    }
    class R0["PurchaseValues"] {
        <<reference>>
    }
    Subject ..> R0 : type
```

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
| dependency | [PurchaseTarget@60:7](../../../../../src/modules/purchases/purchase.ts) | `type` |
| dependency | [PurchaseTarget@61:7](../../../../../src/modules/purchases/purchase.ts) | `type` |
| dependency | [PurchaseTarget@62:7](../../../../../src/modules/purchases/purchase.ts) | `type` |

**Figura:** `DIA-VUE-TS-PURCHASES-43-1`. Parte 1/2.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseTarget"] {
        <<type>>
    }
    class R0["PurchaseTarget@60:7"] {
        <<reference>>
    }
    class R1["PurchaseTarget@61:7"] {
        <<reference>>
    }
    Subject ..> R0 : type
    Subject ..> R1 : type
```

**Figura:** `DIA-VUE-TS-PURCHASES-43-2`. Parte 2/2.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseTarget"] {
        <<type>>
    }
    class R0["PurchaseTarget@62:7"] {
        <<reference>>
    }
    Subject ..> R0 : type
```

## PurchaseTarget@60:7

**Fuente:** [src/modules/purchases/purchase.ts](../../../../../src/modules/purchases/purchase.ts) · línea 60, columna 7. **Declaración:** inline object.

| Miembro | Firma completa |
| --- | --- |
| `action` | `action: 'create'` |

**Figura:** `DIA-VUE-TS-PURCHASES-44-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseTarget@60:7"] {
        <<inline_object>>
        action: 'create'
    }
```

## PurchaseTarget@61:7

**Fuente:** [src/modules/purchases/purchase.ts](../../../../../src/modules/purchases/purchase.ts) · línea 61, columna 7. **Declaración:** inline object.

| Miembro | Firma completa |
| --- | --- |
| `action` | `action: 'edit';` |
| `document` | `document: PurchaseDocument` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [PurchaseDocument](../../../../../src/modules/purchases/purchase.ts) | `document` |

**Figura:** `DIA-VUE-TS-PURCHASES-45-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseTarget@61:7"] {
        <<inline_object>>
        action: 'edit'
        document: PurchaseDocument
    }
    class R0["PurchaseDocument"] {
        <<reference>>
    }
    Subject "1" --> "1" R0 : document
```

## PurchaseTarget@62:7

**Fuente:** [src/modules/purchases/purchase.ts](../../../../../src/modules/purchases/purchase.ts) · línea 62, columna 7. **Declaración:** inline object.

| Miembro | Firma completa |
| --- | --- |
| `action` | `action: 'view';` |
| `document` | `document: PurchaseDocument` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [PurchaseDocument](../../../../../src/modules/purchases/purchase.ts) | `document` |

**Figura:** `DIA-VUE-TS-PURCHASES-46-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseTarget@62:7"] {
        <<inline_object>>
        action: 'view'
        document: PurchaseDocument
    }
    class R0["PurchaseDocument"] {
        <<reference>>
    }
    Subject "1" --> "1" R0 : document
```

## PurchaseWriteTarget

**Fuente:** [src/modules/purchases/purchase.ts](../../../../../src/modules/purchases/purchase.ts) · línea 63, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
Exclude<PurchaseTarget, { action: 'view' }>
```

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | `Exclude` | `type` |
| dependency | [PurchaseTarget](../../../../../src/modules/purchases/purchase.ts) | `type` |
| dependency | [PurchaseWriteTarget@63:59](../../../../../src/modules/purchases/purchase.ts) | `type` |

**Figura:** `DIA-VUE-TS-PURCHASES-47-1`. Parte 1/2.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseWriteTarget"] {
        <<type>>
    }
    class R0["Exclude"] {
        <<reference>>
    }
    class R1["PurchaseTarget"] {
        <<reference>>
    }
    Subject ..> R0 : type
    Subject ..> R1 : type
```

**Figura:** `DIA-VUE-TS-PURCHASES-47-2`. Parte 2/2.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseWriteTarget"] {
        <<type>>
    }
    class R0["PurchaseWriteTarget@63:59"] {
        <<reference>>
    }
    Subject ..> R0 : type
```

## PurchaseWriteTarget@63:59

**Fuente:** [src/modules/purchases/purchase.ts](../../../../../src/modules/purchases/purchase.ts) · línea 63, columna 59. **Declaración:** inline object.

| Miembro | Firma completa |
| --- | --- |
| `action` | `action: 'view'` |

**Figura:** `DIA-VUE-TS-PURCHASES-48-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseWriteTarget@63:59"] {
        <<inline_object>>
        action: 'view'
    }
```

## PurchaseDetailChange

**Fuente:** [src/modules/purchases/purchase.ts](../../../../../src/modules/purchases/purchase.ts) · línea 64, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
{ action: 'correct'; quantity: number; costPerUnitType: number } | { action: 'cancel' }
```

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [PurchaseDetailChange@65:5](../../../../../src/modules/purchases/purchase.ts) | `type` |
| dependency | [PurchaseDetailChange@65:72](../../../../../src/modules/purchases/purchase.ts) | `type` |

**Figura:** `DIA-VUE-TS-PURCHASES-49-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseDetailChange"] {
        <<type>>
    }
    class R0["PurchaseDetailChange@65:5"] {
        <<reference>>
    }
    class R1["PurchaseDetailChange@65:72"] {
        <<reference>>
    }
    Subject ..> R0 : type
    Subject ..> R1 : type
```

## PurchaseDetailChange@65:5

**Fuente:** [src/modules/purchases/purchase.ts](../../../../../src/modules/purchases/purchase.ts) · línea 65, columna 5. **Declaración:** inline object.

| Miembro | Firma completa |
| --- | --- |
| `action` | `action: 'correct';` |
| `quantity` | `quantity: number;` |
| `costPerUnitType` | `costPerUnitType: number` |

**Figura:** `DIA-VUE-TS-PURCHASES-50-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseDetailChange@65:5"] {
        <<inline_object>>
        action: 'correct'
        quantity: number
        costPerUnitType: number
    }
```

## PurchaseDetailChange@65:72

**Fuente:** [src/modules/purchases/purchase.ts](../../../../../src/modules/purchases/purchase.ts) · línea 65, columna 72. **Declaración:** inline object.

| Miembro | Firma completa |
| --- | --- |
| `action` | `action: 'cancel'` |

**Figura:** `DIA-VUE-TS-PURCHASES-51-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["PurchaseDetailChange@65:72"] {
        <<inline_object>>
        action: 'cancel'
    }
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

**Figura:** `DIA-VUE-TS-PURCHASES-52-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["ItemCreation"] {
        <<interface>>
        supplier: LookupItem
    }
    class R0["LookupCreation"] {
        <<reference>>
    }
    class R1["LookupItem"] {
        <<reference>>
    }
    R0 <|-- Subject : extends
    Subject "1" --> "1" R1 : supplier
```

## calculatePurchaseCorrectionTotals.values@19:13

**Fuente:** [src/modules/purchases/purchaseCalculations.ts](../../../../../src/modules/purchases/purchaseCalculations.ts) · línea 19, columna 13. **Declaración:** inline object.

| Miembro | Firma completa |
| --- | --- |
| `quantity` | `quantity: string;` |
| `costPerUnitType` | `costPerUnitType: string` |

**Figura:** `DIA-VUE-TS-PURCHASES-53-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["calculatePurchaseCorrectionT<br/>otals.values@19:13"] {
        <<inline_object>>
        quantity: string
        costPerUnitType: string
    }
```

## purchaseLookupService.options@14:18

**Fuente:** [src/modules/purchases/services/purchaseLookupService.ts](../../../../../src/modules/purchases/services/purchaseLookupService.ts) · línea 14, columna 18. **Declaración:** inline object.

| Miembro | Firma completa |
| --- | --- |
| `supplierId` | `supplierId?: string;` |
| `capture` | `capture?: boolean` |

**Figura:** `DIA-VUE-TS-PURCHASES-54-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["purchaseLookupService.<br/>options@14:18"] {
        <<inline_object>>
        supplierId?: string
        capture?: boolean
    }
```

## apiClient.request@39:48

**Fuente:** [src/modules/purchases/services/purchaseService.ts](../../../../../src/modules/purchases/services/purchaseService.ts) · línea 39, columna 48. **Declaración:** inline object.

| Miembro | Firma completa |
| --- | --- |
| `goodsReceipt` | `goodsReceipt: unknown` |

**Figura:** `DIA-VUE-TS-PURCHASES-55-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["apiClient.request@39:48"] {
        <<inline_object>>
        goodsReceipt: unknown
    }
```

## purchaseService.options@49:25

**Fuente:** [src/modules/purchases/services/purchaseService.ts](../../../../../src/modules/purchases/services/purchaseService.ts) · línea 49, columna 25. **Declaración:** inline object.

| Miembro | Firma completa |
| --- | --- |
| `resource` | `resource: PurchaseResource;` |
| `target` | `target: PurchaseWriteTarget;` |
| `payload` | `payload: Record<string, unknown>;` |
| `signal` | `signal: AbortSignal;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [PurchaseResource](../../../../../src/modules/purchases/purchase.ts) | `resource` |
| dependency | [PurchaseWriteTarget](../../../../../src/modules/purchases/purchase.ts) | `target` |
| dependency | `Record` | `payload` |
| dependency | `AbortSignal` | `signal` |

**Figura:** `DIA-VUE-TS-PURCHASES-56-1`. Parte 1/2.

```mermaid
classDiagram
    direction TB
    class Subject["purchaseService.<br/>options@49:25"] {
        <<inline_object>>
        resource: PurchaseResource
        target: PurchaseWriteTarget
        payload: Record~string, unknown~
        signal: AbortSignal
    }
    class R0["PurchaseResource"] {
        <<reference>>
    }
    class R1["PurchaseWriteTarget"] {
        <<reference>>
    }
    Subject ..> R0 : resource
    Subject ..> R1 : target
```

**Figura:** `DIA-VUE-TS-PURCHASES-56-2`. Parte 2/2.

```mermaid
classDiagram
    direction TB
    class Subject["purchaseService.<br/>options@49:25"] {
        <<inline_object>>
    }
    class R0["Record"] {
        <<reference>>
    }
    class R1["AbortSignal"] {
        <<reference>>
    }
    Subject ..> R0 : payload
    Subject ..> R1 : signal
```

## purchaseService.options@69:33

**Fuente:** [src/modules/purchases/services/purchaseService.ts](../../../../../src/modules/purchases/services/purchaseService.ts) · línea 69, columna 33. **Declaración:** inline object.

| Miembro | Firma completa |
| --- | --- |
| `resource` | `resource: PurchaseResource;` |
| `documentId` | `documentId: string;` |
| `detailId` | `detailId: string;` |
| `change` | `change: PurchaseDetailChange;` |
| `signal` | `signal: AbortSignal;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [PurchaseResource](../../../../../src/modules/purchases/purchase.ts) | `resource` |
| dependency | [PurchaseDetailChange](../../../../../src/modules/purchases/purchase.ts) | `change` |
| dependency | `AbortSignal` | `signal` |

**Figura:** `DIA-VUE-TS-PURCHASES-57-1`. Parte 1/2.

```mermaid
classDiagram
    direction TB
    class Subject["purchaseService.<br/>options@69:33"] {
        <<inline_object>>
        resource: PurchaseResource
        documentId: string
        detailId: string
        change: PurchaseDetailChange
        signal: AbortSignal
    }
    class R0["PurchaseResource"] {
        <<reference>>
    }
    class R1["PurchaseDetailChange"] {
        <<reference>>
    }
    Subject ..> R0 : resource
    Subject ..> R1 : change
```

**Figura:** `DIA-VUE-TS-PURCHASES-57-2`. Parte 2/2.

```mermaid
classDiagram
    direction TB
    class Subject["purchaseService.<br/>options@69:33"] {
        <<inline_object>>
    }
    class R0["AbortSignal"] {
        <<reference>>
    }
    Subject ..> R0 : signal
```

## usePurchaseActions.return

**Fuente:** [src/modules/purchases/composables/usePurchaseActions.ts](../../../../../src/modules/purchases/composables/usePurchaseActions.ts) · línea 10, columna 35. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `editor` | `"editor": ShallowRef<PurchaseTarget \| null, PurchaseTarget \| null>;` |
| `editorKey` | `"editorKey": Ref<number, number>;` |
| `correction` | `"correction": ShallowRef<PurchaseDetail \| undefined, PurchaseDetail \| undefined>;` |
| `isChanging` | `"isChanging": Ref<boolean, boolean>;` |
| `needsReload` | `"needsReload": Ref<boolean, boolean>;` |
| `open` | `"open": (row: PurchaseRow, action: "view" \| "edit") => Promise<void>;` |
| `create` | `"create": () => void;` |
| `close` | `"close": () => void;` |
| `reload` | `"reload": () => Promise<void> \| undefined;` |
| `retry` | `"retry": () => Promise<void> \| undefined;` |
| `handleSaved` | `"handleSaved": (confirmation: MutationConfirmation) => void;` |
| `correct` | `"correct": (line: PurchaseDetail) => void;` |
| `cancel` | `"cancel": (line: PurchaseDetail) => Promise<void>;` |
| `handleDetailSaved` | `"handleDetailSaved": (confirmation: MutationConfirmation) => Promise<void>;` |
| `document` | `"document": ShallowRef<PurchaseDocument \| undefined, PurchaseDocument \| undefined>;` |
| `isReading` | `"isReading": Ref<boolean, boolean>;` |
| `readError` | `"readError": Ref<string, string>;` |
| `load` | `"load": (id?: string) => Promise<PurchaseDocument \| undefined>;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | `ShallowRef` | `editor` |
| dependency | [PurchaseTarget](../../../../../src/modules/purchases/purchase.ts) | `editor` |
| dependency | `Ref` | `editorKey` |
| dependency | `ShallowRef` | `correction` |
| dependency | [PurchaseDetail](../../../../../src/modules/purchases/purchase.ts) | `correction` |
| dependency | `Ref` | `isChanging` |
| dependency | `Ref` | `needsReload` |
| dependency | [PurchaseRow](../../../../../src/modules/purchases/purchase.ts) | `open` |
| dependency | `Promise` | `open` |
| dependency | `Promise` | `reload` |
| dependency | `Promise` | `retry` |
| dependency | [MutationConfirmation](../../../../../src/shared/http/recordContract.ts) | `handleSaved` |
| dependency | [PurchaseDetail](../../../../../src/modules/purchases/purchase.ts) | `correct` |
| dependency | [PurchaseDetail](../../../../../src/modules/purchases/purchase.ts) | `cancel` |
| dependency | `Promise` | `cancel` |
| dependency | [MutationConfirmation](../../../../../src/shared/http/recordContract.ts) | `handleDetailSaved` |
| dependency | `Promise` | `handleDetailSaved` |
| dependency | `ShallowRef` | `document` |
| dependency | `PurchaseDocument` | `document` |
| dependency | `Ref` | `isReading` |
| dependency | `Ref` | `readError` |
| dependency | `Promise` | `load` |
| dependency | `PurchaseDocument` | `load` |

**Figura:** `DIA-VUE-TS-PURCHASES-58-1`. Parte 1/12.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseActions.return"] {
        <<inferred_return>>
        editor: complex
        editorKey: Ref~number, number~
        correction: complex
        isChanging: Ref~boolean, boolean~
        needsReload: Ref~boolean, boolean~
        open: callback
        create: callback
        close: callback
    }
    class R0["ShallowRef"] {
        <<reference>>
    }
    class R1["PurchaseTarget"] {
        <<reference>>
    }
    Subject ..> R0 : editor
    Subject ..> R1 : editor
```

**Figura:** `DIA-VUE-TS-PURCHASES-58-2`. Parte 2/12.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseActions.return"] {
        <<inferred_return>>
        reload: callback
        retry: callback
        handleSaved: callback
        correct: callback
        cancel: callback
        handleDetailSaved: callback
        document: complex
        isReading: Ref~boolean, boolean~
    }
    class R0["Ref"] {
        <<reference>>
    }
    class R1["ShallowRef"] {
        <<reference>>
    }
    Subject ..> R0 : editorKey
    Subject ..> R1 : correction
```

**Figura:** `DIA-VUE-TS-PURCHASES-58-3`. Parte 3/12.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseActions.return"] {
        <<inferred_return>>
        readError: Ref~string, string~
        load: callback
    }
    class R0["PurchaseDetail"] {
        <<reference>>
    }
    class R1["Ref"] {
        <<reference>>
    }
    Subject ..> R0 : correction
    Subject ..> R1 : isChanging
```

**Figura:** `DIA-VUE-TS-PURCHASES-58-4`. Parte 4/12.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseActions.return"] {
        <<inferred_return>>
    }
    class R0["Ref"] {
        <<reference>>
    }
    class R1["PurchaseRow"] {
        <<reference>>
    }
    Subject ..> R0 : needsReload
    Subject ..> R1 : open
```

**Figura:** `DIA-VUE-TS-PURCHASES-58-5`. Parte 5/12.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseActions.return"] {
        <<inferred_return>>
    }
    class R0["Promise"] {
        <<reference>>
    }
    Subject ..> R0 : open
    Subject ..> R0 : reload
```

**Figura:** `DIA-VUE-TS-PURCHASES-58-6`. Parte 6/12.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseActions.return"] {
        <<inferred_return>>
    }
    class R0["Promise"] {
        <<reference>>
    }
    class R1["MutationConfirmation"] {
        <<reference>>
    }
    Subject ..> R0 : retry
    Subject ..> R1 : handleSaved
```

**Figura:** `DIA-VUE-TS-PURCHASES-58-7`. Parte 7/12.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseActions.return"] {
        <<inferred_return>>
    }
    class R0["PurchaseDetail"] {
        <<reference>>
    }
    Subject ..> R0 : correct
    Subject ..> R0 : cancel
```

**Figura:** `DIA-VUE-TS-PURCHASES-58-8`. Parte 8/12.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseActions.return"] {
        <<inferred_return>>
    }
    class R0["Promise"] {
        <<reference>>
    }
    class R1["MutationConfirmation"] {
        <<reference>>
    }
    Subject ..> R0 : cancel
    Subject ..> R1 : handleDetailSaved
```

**Figura:** `DIA-VUE-TS-PURCHASES-58-9`. Parte 9/12.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseActions.return"] {
        <<inferred_return>>
    }
    class R0["Promise"] {
        <<reference>>
    }
    class R1["ShallowRef"] {
        <<reference>>
    }
    Subject ..> R0 : handleDetailSaved
    Subject ..> R1 : document
```

**Figura:** `DIA-VUE-TS-PURCHASES-58-10`. Parte 10/12.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseActions.return"] {
        <<inferred_return>>
    }
    class R0["PurchaseDocument"] {
        <<reference>>
    }
    class R1["Ref"] {
        <<reference>>
    }
    Subject ..> R0 : document
    Subject ..> R1 : isReading
```

**Figura:** `DIA-VUE-TS-PURCHASES-58-11`. Parte 11/12.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseActions.return"] {
        <<inferred_return>>
    }
    class R0["Ref"] {
        <<reference>>
    }
    class R1["Promise"] {
        <<reference>>
    }
    Subject ..> R0 : readError
    Subject ..> R1 : load
```

**Figura:** `DIA-VUE-TS-PURCHASES-58-12`. Parte 12/12.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseActions.return"] {
        <<inferred_return>>
    }
    class R0["PurchaseDocument"] {
        <<reference>>
    }
    Subject ..> R0 : load
```

## usePurchaseCorrection.return

**Fuente:** [src/modules/purchases/composables/usePurchaseCorrection.ts](../../../../../src/modules/purchases/composables/usePurchaseCorrection.ts) · línea 12, columna 38. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `values` | `"values": Record<Field, string>;` |
| `totals` | `"totals": ComputedRef<{ quantity: number; net: number; gross: number; } \| null>;` |
| `errors` | `"errors": ComputedRef<Partial<Record<"" \| "quantity" \| "costPerUnitType", string \| undefined>>>;` |
| `isSubmitting` | `"isSubmitting": ComputedRef<boolean>;` |
| `submit` | `"submit": () => Promise<Promise<void> \| undefined> \| undefined;` |
| `update` | `"update": (field: Field, value: string) => void;` |
| `blur` | `"blur": (field: Field) => Promise<unknown> \| undefined;` |
| `message` | `"message": Ref<string, string>;` |
| `isConflicted` | `"isConflicted": Ref<boolean, boolean>;` |
| `execute` | `"execute": (operation: (signal: AbortSignal) => Promise<MutationConfirmation>) => Promise<void>;` |
| `signal` | `"signal": AbortSignal;` |
| `isDisposed` | `"isDisposed": () => boolean;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | `Record` | `values` |
| dependency | [Field](../../../../../src/modules/purchases/composables/usePurchaseCorrection.ts) | `values` |
| dependency | `ComputedRef` | `totals` |
| dependency | [usePurchaseCorrection.return.totals.shape1](../../../../../src/modules/purchases/composables/usePurchaseCorrection.ts) | `totals` |
| dependency | `ComputedRef` | `errors` |
| dependency | `Partial` | `errors` |
| dependency | `Record` | `errors` |
| dependency | `ComputedRef` | `isSubmitting` |
| dependency | `Promise` | `submit` |
| dependency | [Field](../../../../../src/modules/purchases/composables/usePurchaseCorrection.ts) | `update` |
| dependency | [Field](../../../../../src/modules/purchases/composables/usePurchaseCorrection.ts) | `blur` |
| dependency | `Promise` | `blur` |
| dependency | `Ref` | `message` |
| dependency | `Ref` | `isConflicted` |
| dependency | `AbortSignal` | `execute` |
| dependency | `Promise` | `execute` |
| dependency | [MutationConfirmation](../../../../../src/shared/http/recordContract.ts) | `execute` |
| dependency | `AbortSignal` | `signal` |

**Figura:** `DIA-VUE-TS-PURCHASES-59-1`. Parte 1/9.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseCorrection.return"] {
        <<inferred_return>>
        values: Record~Field, string~
        totals: object
        errors: complex
        isSubmitting: ComputedRef~boolean~
        submit: callback
        update: callback
        blur: callback
        message: Ref~string, string~
    }
    class R0["Record"] {
        <<reference>>
    }
    class R1["Field"] {
        <<reference>>
    }
    Subject ..> R0 : values
    Subject ..> R1 : values
```

**Figura:** `DIA-VUE-TS-PURCHASES-59-2`. Parte 2/9.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseCorrection.return"] {
        <<inferred_return>>
        isConflicted: Ref~boolean, boolean~
        execute: callback
        signal: AbortSignal
        isDisposed: callback
    }
    class R0["ComputedRef"] {
        <<reference>>
    }
    class R1["usePurchaseCorrection.return.<br/>totals.shape1"] {
        <<reference>>
    }
    Subject ..> R0 : totals
    Subject ..> R1 : totals
```

**Figura:** `DIA-VUE-TS-PURCHASES-59-3`. Parte 3/9.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseCorrection.return"] {
        <<inferred_return>>
    }
    class R0["ComputedRef"] {
        <<reference>>
    }
    class R1["Partial"] {
        <<reference>>
    }
    Subject ..> R0 : errors
    Subject ..> R1 : errors
```

**Figura:** `DIA-VUE-TS-PURCHASES-59-4`. Parte 4/9.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseCorrection.return"] {
        <<inferred_return>>
    }
    class R0["Record"] {
        <<reference>>
    }
    class R1["ComputedRef"] {
        <<reference>>
    }
    Subject ..> R0 : errors
    Subject ..> R1 : isSubmitting
```

**Figura:** `DIA-VUE-TS-PURCHASES-59-5`. Parte 5/9.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseCorrection.return"] {
        <<inferred_return>>
    }
    class R0["Promise"] {
        <<reference>>
    }
    class R1["Field"] {
        <<reference>>
    }
    Subject ..> R0 : submit
    Subject ..> R1 : update
```

**Figura:** `DIA-VUE-TS-PURCHASES-59-6`. Parte 6/9.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseCorrection.return"] {
        <<inferred_return>>
    }
    class R0["Field"] {
        <<reference>>
    }
    class R1["Promise"] {
        <<reference>>
    }
    Subject ..> R0 : blur
    Subject ..> R1 : blur
```

**Figura:** `DIA-VUE-TS-PURCHASES-59-7`. Parte 7/9.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseCorrection.return"] {
        <<inferred_return>>
    }
    class R0["Ref"] {
        <<reference>>
    }
    Subject ..> R0 : message
    Subject ..> R0 : isConflicted
```

**Figura:** `DIA-VUE-TS-PURCHASES-59-8`. Parte 8/9.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseCorrection.return"] {
        <<inferred_return>>
    }
    class R0["AbortSignal"] {
        <<reference>>
    }
    class R1["Promise"] {
        <<reference>>
    }
    Subject ..> R0 : execute
    Subject ..> R1 : execute
```

**Figura:** `DIA-VUE-TS-PURCHASES-59-9`. Parte 9/9.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseCorrection.return"] {
        <<inferred_return>>
    }
    class R0["MutationConfirmation"] {
        <<reference>>
    }
    class R1["AbortSignal"] {
        <<reference>>
    }
    Subject ..> R0 : execute
    Subject ..> R1 : signal
```

## usePurchaseCorrection.return.totals.shape1

**Fuente:** [src/modules/purchases/composables/usePurchaseCorrection.ts](../../../../../src/modules/purchases/composables/usePurchaseCorrection.ts) · línea 12, columna 38. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `quantity` | `quantity: number;` |
| `net` | `net: number;` |
| `gross` | `gross: number;` |

**Figura:** `DIA-VUE-TS-PURCHASES-60-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseCorrection.return.<br/>totals.shape1"] {
        <<inferred_object>>
        quantity: number
        net: number
        gross: number
    }
```

## usePurchaseEditor.return

**Fuente:** [src/modules/purchases/composables/usePurchaseEditor.ts](../../../../../src/modules/purchases/composables/usePurchaseEditor.ts) · línea 23, columna 34. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `values` | `"values": PurchaseValues;` |
| `errors` | `"errors": ComputedRef<Partial<Record<"" \| "observations" \| "details" \| "supplierId" \| details[${number}] \| details[${number}].id \| details[${number}].name \| details[${number}].base \| details[${number}].height \| details[${number}].presentation \| details[${number}].unitMeasure \| details[${number}].quantity \| details[${number}].convertedQuantity \| "receivedById" \| "isInvoiced" \| "invoice" \| "receptionDate" \| details[${number}].costPerUnitType \| details[${number}].materialId \| details[${number}].conversionUnitCost \| details[${number}].netPurchaseAmount \| details[${number}].grossPurchaseAmount \| details[${number}].status \| details[${number}].isNew, string \| undefined>>>;` |
| `isSubmitting` | `"isSubmitting": ComputedRef<boolean>;` |
| `isReadOnly` | `"isReadOnly": boolean;` |
| `suppliers` | `"suppliers": { state: ComputedRef<LookupState>; items: Ref<{ id: string; title: string; data: Record<string, unknown>; isDisabled?: boolean \| undefined; }[], LookupItem[] \| { id: string; title: string; data: Record<string, unknown>; isDisabled?: boolean \| undefined; }[]>; isLoading: Ref<boolean, boolean>; error: Ref<string, string>; search: Ref<string, string>; hasMore: Ref<boolean, boolean>; updateSearch: (value: string) => void; refresh: () => Promise<void>; loadMore: () => Promise<void> \| undefined; retry: () => Promise<void>; };` |
| `persons` | `"persons": { state: ComputedRef<LookupState>; items: Ref<{ id: string; title: string; data: Record<string, unknown>; isDisabled?: boolean \| undefined; }[], LookupItem[] \| { id: string; title: string; data: Record<string, unknown>; isDisabled?: boolean \| undefined; }[]>; isLoading: Ref<boolean, boolean>; error: Ref<string, string>; search: Ref<string, string>; hasMore: Ref<boolean, boolean>; updateSearch: (value: string) => void; refresh: () => Promise<void>; loadMore: () => Promise<void> \| undefined; retry: () => Promise<void>; };` |
| `supplier` | `"supplier": ShallowRef<LookupItem \| undefined, LookupItem \| undefined>;` |
| `receiverSeed` | `"receiverSeed": { id: string; title: string; data: {}; } \| undefined;` |
| `canSuppliers` | `"canSuppliers": ComputedRef<boolean>;` |
| `canPersons` | `"canPersons": ComputedRef<boolean>;` |
| `selectCreatedSupplier` | `"selectCreatedSupplier": (item: LookupItem) => void;` |
| `addDetail` | `"addDetail": (line: PurchaseDetail) => void;` |
| `removeDetail` | `"removeDetail": (id: string) => void;` |
| `totals` | `"totals": ComputedRef<{ quantity: number; net: number; gross: number; }>;` |
| `submit` | `"submit": () => Promise<Promise<void> \| undefined> \| undefined;` |
| `update` | `"update": (field: keyof PurchaseValues, value: string \| boolean \| PurchaseDetail[]) => void;` |
| `blur` | `"blur": (field: keyof PurchaseValues) => Promise<unknown> \| undefined;` |
| `message` | `"message": Ref<string, string>;` |
| `isConflicted` | `"isConflicted": Ref<boolean, boolean>;` |
| `execute` | `"execute": (operation: (signal: AbortSignal) => Promise<MutationConfirmation>) => Promise<void>;` |
| `signal` | `"signal": AbortSignal;` |
| `isDisposed` | `"isDisposed": () => boolean;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [PurchaseValues](../../../../../src/modules/purchases/purchase.ts) | `values` |
| dependency | `ComputedRef` | `errors` |
| dependency | `Partial` | `errors` |
| dependency | `Record` | `errors` |
| dependency | `ComputedRef` | `isSubmitting` |
| dependency | [usePurchaseEditor.return.suppliers.shape1](../../../../../src/modules/purchases/composables/usePurchaseEditor.ts) | `suppliers` |
| dependency | [usePurchaseEditor.return.persons.shape4](../../../../../src/modules/purchases/composables/usePurchaseEditor.ts) | `persons` |
| dependency | `ShallowRef` | `supplier` |
| dependency | [LookupItem](../../../../../src/shared/lookup.ts) | `supplier` |
| association | [usePurchaseEditor.return.receiverSeed.shape7](../../../../../src/modules/purchases/composables/usePurchaseEditor.ts) | `receiverSeed` |
| dependency | `ComputedRef` | `canSuppliers` |
| dependency | `ComputedRef` | `canPersons` |
| dependency | [LookupItem](../../../../../src/shared/lookup.ts) | `selectCreatedSupplier` |
| dependency | [PurchaseDetail](../../../../../src/modules/purchases/purchase.ts) | `addDetail` |
| dependency | `ComputedRef` | `totals` |
| dependency | [usePurchaseEditor.return.totals.shape9](../../../../../src/modules/purchases/composables/usePurchaseEditor.ts) | `totals` |
| dependency | `Promise` | `submit` |
| dependency | [PurchaseValues](../../../../../src/modules/purchases/purchase.ts) | `update` |
| dependency | [PurchaseDetail](../../../../../src/modules/purchases/purchase.ts) | `update` |
| dependency | [PurchaseValues](../../../../../src/modules/purchases/purchase.ts) | `blur` |
| dependency | `Promise` | `blur` |
| dependency | `Ref` | `message` |
| dependency | `Ref` | `isConflicted` |
| dependency | `AbortSignal` | `execute` |
| dependency | `Promise` | `execute` |
| dependency | [MutationConfirmation](../../../../../src/shared/http/recordContract.ts) | `execute` |
| dependency | `AbortSignal` | `signal` |

**Figura:** `DIA-VUE-TS-PURCHASES-61-1`. Parte 1/14.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseEditor.return"] {
        <<inferred_return>>
        values: PurchaseValues
        errors: object
        isSubmitting: ComputedRef~boolean~
        isReadOnly: boolean
        suppliers: callback
        persons: callback
        supplier: complex
        receiverSeed: object
    }
    class R0["PurchaseValues"] {
        <<reference>>
    }
    class R1["ComputedRef"] {
        <<reference>>
    }
    Subject "1" --> "1" R0 : values
    Subject ..> R1 : errors
```

**Figura:** `DIA-VUE-TS-PURCHASES-61-2`. Parte 2/14.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseEditor.return"] {
        <<inferred_return>>
        canSuppliers: ComputedRef~boolean~
        canPersons: ComputedRef~boolean~
        selectCreatedSupplier: callback
        addDetail: callback
        removeDetail: callback
        totals: object
        submit: callback
        update: callback
    }
    class R0["Partial"] {
        <<reference>>
    }
    class R1["Record"] {
        <<reference>>
    }
    Subject ..> R0 : errors
    Subject ..> R1 : errors
```

**Figura:** `DIA-VUE-TS-PURCHASES-61-3`. Parte 3/14.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseEditor.return"] {
        <<inferred_return>>
        blur: callback
        message: Ref~string, string~
        isConflicted: Ref~boolean, boolean~
        execute: callback
        signal: AbortSignal
        isDisposed: callback
    }
    class R0["ComputedRef"] {
        <<reference>>
    }
    class R1["usePurchaseEditor.return.<br/>suppliers.shape1"] {
        <<reference>>
    }
    Subject ..> R0 : isSubmitting
    Subject ..> R1 : suppliers
```

**Figura:** `DIA-VUE-TS-PURCHASES-61-4`. Parte 4/14.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseEditor.return"] {
        <<inferred_return>>
    }
    class R0["usePurchaseEditor.return.<br/>persons.shape4"] {
        <<reference>>
    }
    class R1["ShallowRef"] {
        <<reference>>
    }
    Subject ..> R0 : persons
    Subject ..> R1 : supplier
```

**Figura:** `DIA-VUE-TS-PURCHASES-61-5`. Parte 5/14.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseEditor.return"] {
        <<inferred_return>>
    }
    class R0["LookupItem"] {
        <<reference>>
    }
    class R1["usePurchaseEditor.return.<br/>receiverSeed.shape7"] {
        <<reference>>
    }
    Subject ..> R0 : supplier
    Subject "1" --> "0..1" R1 : receiverSeed
```

**Figura:** `DIA-VUE-TS-PURCHASES-61-6`. Parte 6/14.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseEditor.return"] {
        <<inferred_return>>
    }
    class R0["ComputedRef"] {
        <<reference>>
    }
    Subject ..> R0 : canSuppliers
    Subject ..> R0 : canPersons
```

**Figura:** `DIA-VUE-TS-PURCHASES-61-7`. Parte 7/14.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseEditor.return"] {
        <<inferred_return>>
    }
    class R0["LookupItem"] {
        <<reference>>
    }
    class R1["PurchaseDetail"] {
        <<reference>>
    }
    Subject ..> R0 : selectCreatedSupplier
    Subject ..> R1 : addDetail
```

**Figura:** `DIA-VUE-TS-PURCHASES-61-8`. Parte 8/14.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseEditor.return"] {
        <<inferred_return>>
    }
    class R0["ComputedRef"] {
        <<reference>>
    }
    class R1["usePurchaseEditor.return.<br/>totals.shape9"] {
        <<reference>>
    }
    Subject ..> R0 : totals
    Subject ..> R1 : totals
```

**Figura:** `DIA-VUE-TS-PURCHASES-61-9`. Parte 9/14.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseEditor.return"] {
        <<inferred_return>>
    }
    class R0["Promise"] {
        <<reference>>
    }
    class R1["PurchaseValues"] {
        <<reference>>
    }
    Subject ..> R0 : submit
    Subject ..> R1 : update
```

**Figura:** `DIA-VUE-TS-PURCHASES-61-10`. Parte 10/14.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseEditor.return"] {
        <<inferred_return>>
    }
    class R0["PurchaseDetail"] {
        <<reference>>
    }
    class R1["PurchaseValues"] {
        <<reference>>
    }
    Subject ..> R0 : update
    Subject ..> R1 : blur
```

**Figura:** `DIA-VUE-TS-PURCHASES-61-11`. Parte 11/14.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseEditor.return"] {
        <<inferred_return>>
    }
    class R0["Promise"] {
        <<reference>>
    }
    class R1["Ref"] {
        <<reference>>
    }
    Subject ..> R0 : blur
    Subject ..> R1 : message
```

**Figura:** `DIA-VUE-TS-PURCHASES-61-12`. Parte 12/14.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseEditor.return"] {
        <<inferred_return>>
    }
    class R0["Ref"] {
        <<reference>>
    }
    class R1["AbortSignal"] {
        <<reference>>
    }
    Subject ..> R0 : isConflicted
    Subject ..> R1 : execute
```

**Figura:** `DIA-VUE-TS-PURCHASES-61-13`. Parte 13/14.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseEditor.return"] {
        <<inferred_return>>
    }
    class R0["Promise"] {
        <<reference>>
    }
    class R1["MutationConfirmation"] {
        <<reference>>
    }
    Subject ..> R0 : execute
    Subject ..> R1 : execute
```

**Figura:** `DIA-VUE-TS-PURCHASES-61-14`. Parte 14/14.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseEditor.return"] {
        <<inferred_return>>
    }
    class R0["AbortSignal"] {
        <<reference>>
    }
    Subject ..> R0 : signal
```

## usePurchaseEditor.return.suppliers.shape1

**Fuente:** [src/modules/purchases/composables/usePurchaseEditor.ts](../../../../../src/modules/purchases/composables/usePurchaseEditor.ts) · línea 23, columna 34. **Declaración:** inferred object.

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
| dependency | `ComputedRef` | `state` |
| dependency | `LookupState` | `state` |
| dependency | `Ref` | `items` |
| dependency | [usePurchaseEditor.return.suppliers.items.shape2](../../../../../src/modules/purchases/composables/usePurchaseEditor.ts) | `items` |
| dependency | [LookupItem](../../../../../src/shared/lookup.ts) | `items` |
| dependency | [usePurchaseEditor.return.suppliers.items.shape3](../../../../../src/modules/purchases/composables/usePurchaseEditor.ts) | `items` |
| dependency | `Ref` | `isLoading` |
| dependency | `Ref` | `error` |
| dependency | `Ref` | `search` |
| dependency | `Ref` | `hasMore` |
| dependency | `Promise` | `refresh` |
| dependency | `Promise` | `loadMore` |
| dependency | `Promise` | `retry` |

**Figura:** `DIA-VUE-TS-PURCHASES-62-1`. Parte 1/7.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseEditor.return.<br/>suppliers.shape1"] {
        <<inferred_object>>
        state: ComputedRef~LookupState~
        items: object
        isLoading: Ref~boolean, boolean~
        error: Ref~string, string~
        search: Ref~string, string~
        hasMore: Ref~boolean, boolean~
        updateSearch: callback
        refresh: callback
    }
    class R0["ComputedRef"] {
        <<reference>>
    }
    class R1["LookupState"] {
        <<reference>>
    }
    Subject ..> R0 : state
    Subject ..> R1 : state
```

**Figura:** `DIA-VUE-TS-PURCHASES-62-2`. Parte 2/7.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseEditor.return.<br/>suppliers.shape1"] {
        <<inferred_object>>
        loadMore: callback
        retry: callback
    }
    class R0["Ref"] {
        <<reference>>
    }
    class R1["usePurchaseEditor.return.<br/>suppliers.items.shape2"] {
        <<reference>>
    }
    Subject ..> R0 : items
    Subject ..> R1 : items
```

**Figura:** `DIA-VUE-TS-PURCHASES-62-3`. Parte 3/7.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseEditor.return.<br/>suppliers.shape1"] {
        <<inferred_object>>
    }
    class R0["LookupItem"] {
        <<reference>>
    }
    class R1["usePurchaseEditor.return.<br/>suppliers.items.shape3"] {
        <<reference>>
    }
    Subject ..> R0 : items
    Subject ..> R1 : items
```

**Figura:** `DIA-VUE-TS-PURCHASES-62-4`. Parte 4/7.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseEditor.return.<br/>suppliers.shape1"] {
        <<inferred_object>>
    }
    class R0["Ref"] {
        <<reference>>
    }
    Subject ..> R0 : isLoading
    Subject ..> R0 : error
```

**Figura:** `DIA-VUE-TS-PURCHASES-62-5`. Parte 5/7.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseEditor.return.<br/>suppliers.shape1"] {
        <<inferred_object>>
    }
    class R0["Ref"] {
        <<reference>>
    }
    Subject ..> R0 : search
    Subject ..> R0 : hasMore
```

**Figura:** `DIA-VUE-TS-PURCHASES-62-6`. Parte 6/7.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseEditor.return.<br/>suppliers.shape1"] {
        <<inferred_object>>
    }
    class R0["Promise"] {
        <<reference>>
    }
    Subject ..> R0 : refresh
    Subject ..> R0 : loadMore
```

**Figura:** `DIA-VUE-TS-PURCHASES-62-7`. Parte 7/7.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseEditor.return.<br/>suppliers.shape1"] {
        <<inferred_object>>
    }
    class R0["Promise"] {
        <<reference>>
    }
    Subject ..> R0 : retry
```

## usePurchaseEditor.return.suppliers.items.shape2

**Fuente:** [src/modules/purchases/composables/usePurchaseEditor.ts](../../../../../src/modules/purchases/composables/usePurchaseEditor.ts) · línea 23, columna 34. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `id` | `id: string;` |
| `title` | `title: string;` |
| `data` | `data: Record<string, unknown>;` |
| `isDisabled` | `isDisabled?: boolean \| undefined;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | `Record` | `data` |

**Figura:** `DIA-VUE-TS-PURCHASES-63-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseEditor.return.<br/>suppliers.items.shape2"] {
        <<inferred_object>>
        id: string
        title: string
        data: Record~string, unknown~
        isDisabled?: boolean | undefined
    }
    class R0["Record"] {
        <<reference>>
    }
    Subject ..> R0 : data
```

## usePurchaseEditor.return.suppliers.items.shape3

**Fuente:** [src/modules/purchases/composables/usePurchaseEditor.ts](../../../../../src/modules/purchases/composables/usePurchaseEditor.ts) · línea 23, columna 34. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `id` | `id: string;` |
| `title` | `title: string;` |
| `data` | `data: Record<string, unknown>;` |
| `isDisabled` | `isDisabled?: boolean \| undefined;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | `Record` | `data` |

**Figura:** `DIA-VUE-TS-PURCHASES-64-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseEditor.return.<br/>suppliers.items.shape3"] {
        <<inferred_object>>
        id: string
        title: string
        data: Record~string, unknown~
        isDisabled?: boolean | undefined
    }
    class R0["Record"] {
        <<reference>>
    }
    Subject ..> R0 : data
```

## usePurchaseEditor.return.persons.shape4

**Fuente:** [src/modules/purchases/composables/usePurchaseEditor.ts](../../../../../src/modules/purchases/composables/usePurchaseEditor.ts) · línea 23, columna 34. **Declaración:** inferred object.

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
| dependency | `ComputedRef` | `state` |
| dependency | `LookupState` | `state` |
| dependency | `Ref` | `items` |
| dependency | [usePurchaseEditor.return.persons.items.shape5](../../../../../src/modules/purchases/composables/usePurchaseEditor.ts) | `items` |
| dependency | [LookupItem](../../../../../src/shared/lookup.ts) | `items` |
| dependency | [usePurchaseEditor.return.persons.items.shape6](../../../../../src/modules/purchases/composables/usePurchaseEditor.ts) | `items` |
| dependency | `Ref` | `isLoading` |
| dependency | `Ref` | `error` |
| dependency | `Ref` | `search` |
| dependency | `Ref` | `hasMore` |
| dependency | `Promise` | `refresh` |
| dependency | `Promise` | `loadMore` |
| dependency | `Promise` | `retry` |

**Figura:** `DIA-VUE-TS-PURCHASES-65-1`. Parte 1/7.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseEditor.return.<br/>persons.shape4"] {
        <<inferred_object>>
        state: ComputedRef~LookupState~
        items: object
        isLoading: Ref~boolean, boolean~
        error: Ref~string, string~
        search: Ref~string, string~
        hasMore: Ref~boolean, boolean~
        updateSearch: callback
        refresh: callback
    }
    class R0["ComputedRef"] {
        <<reference>>
    }
    class R1["LookupState"] {
        <<reference>>
    }
    Subject ..> R0 : state
    Subject ..> R1 : state
```

**Figura:** `DIA-VUE-TS-PURCHASES-65-2`. Parte 2/7.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseEditor.return.<br/>persons.shape4"] {
        <<inferred_object>>
        loadMore: callback
        retry: callback
    }
    class R0["Ref"] {
        <<reference>>
    }
    class R1["usePurchaseEditor.return.<br/>persons.items.shape5"] {
        <<reference>>
    }
    Subject ..> R0 : items
    Subject ..> R1 : items
```

**Figura:** `DIA-VUE-TS-PURCHASES-65-3`. Parte 3/7.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseEditor.return.<br/>persons.shape4"] {
        <<inferred_object>>
    }
    class R0["LookupItem"] {
        <<reference>>
    }
    class R1["usePurchaseEditor.return.<br/>persons.items.shape6"] {
        <<reference>>
    }
    Subject ..> R0 : items
    Subject ..> R1 : items
```

**Figura:** `DIA-VUE-TS-PURCHASES-65-4`. Parte 4/7.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseEditor.return.<br/>persons.shape4"] {
        <<inferred_object>>
    }
    class R0["Ref"] {
        <<reference>>
    }
    Subject ..> R0 : isLoading
    Subject ..> R0 : error
```

**Figura:** `DIA-VUE-TS-PURCHASES-65-5`. Parte 5/7.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseEditor.return.<br/>persons.shape4"] {
        <<inferred_object>>
    }
    class R0["Ref"] {
        <<reference>>
    }
    Subject ..> R0 : search
    Subject ..> R0 : hasMore
```

**Figura:** `DIA-VUE-TS-PURCHASES-65-6`. Parte 6/7.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseEditor.return.<br/>persons.shape4"] {
        <<inferred_object>>
    }
    class R0["Promise"] {
        <<reference>>
    }
    Subject ..> R0 : refresh
    Subject ..> R0 : loadMore
```

**Figura:** `DIA-VUE-TS-PURCHASES-65-7`. Parte 7/7.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseEditor.return.<br/>persons.shape4"] {
        <<inferred_object>>
    }
    class R0["Promise"] {
        <<reference>>
    }
    Subject ..> R0 : retry
```

## usePurchaseEditor.return.persons.items.shape5

**Fuente:** [src/modules/purchases/composables/usePurchaseEditor.ts](../../../../../src/modules/purchases/composables/usePurchaseEditor.ts) · línea 23, columna 34. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `id` | `id: string;` |
| `title` | `title: string;` |
| `data` | `data: Record<string, unknown>;` |
| `isDisabled` | `isDisabled?: boolean \| undefined;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | `Record` | `data` |

**Figura:** `DIA-VUE-TS-PURCHASES-66-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseEditor.return.<br/>persons.items.shape5"] {
        <<inferred_object>>
        id: string
        title: string
        data: Record~string, unknown~
        isDisabled?: boolean | undefined
    }
    class R0["Record"] {
        <<reference>>
    }
    Subject ..> R0 : data
```

## usePurchaseEditor.return.persons.items.shape6

**Fuente:** [src/modules/purchases/composables/usePurchaseEditor.ts](../../../../../src/modules/purchases/composables/usePurchaseEditor.ts) · línea 23, columna 34. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `id` | `id: string;` |
| `title` | `title: string;` |
| `data` | `data: Record<string, unknown>;` |
| `isDisabled` | `isDisabled?: boolean \| undefined;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | `Record` | `data` |

**Figura:** `DIA-VUE-TS-PURCHASES-67-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseEditor.return.<br/>persons.items.shape6"] {
        <<inferred_object>>
        id: string
        title: string
        data: Record~string, unknown~
        isDisabled?: boolean | undefined
    }
    class R0["Record"] {
        <<reference>>
    }
    Subject ..> R0 : data
```

## usePurchaseEditor.return.receiverSeed.shape7

**Fuente:** [src/modules/purchases/composables/usePurchaseEditor.ts](../../../../../src/modules/purchases/composables/usePurchaseEditor.ts) · línea 23, columna 34. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `id` | `id: string;` |
| `title` | `title: string;` |
| `data` | `data: {};` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [usePurchaseEditor.return.receiverSeed.data.shape8](../../../../../src/modules/purchases/composables/usePurchaseEditor.ts) | `data` |

**Figura:** `DIA-VUE-TS-PURCHASES-68-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseEditor.return.<br/>receiverSeed.shape7"] {
        <<inferred_object>>
        id: string
        title: string
        data: object
    }
    class R0["usePurchaseEditor.return.<br/>receiverSeed.data.shape8"] {
        <<reference>>
    }
    Subject "1" --> "1" R0 : data
```

## usePurchaseEditor.return.receiverSeed.data.shape8

**Fuente:** [src/modules/purchases/composables/usePurchaseEditor.ts](../../../../../src/modules/purchases/composables/usePurchaseEditor.ts) · línea 23, columna 34. **Declaración:** inferred object.

**Definición completa:**

```typescript
{}
```

**Figura:** `DIA-VUE-TS-PURCHASES-69-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseEditor.return.<br/>receiverSeed.data.shape8"] {
        <<inferred_object>>
    }
```

## usePurchaseEditor.return.totals.shape9

**Fuente:** [src/modules/purchases/composables/usePurchaseEditor.ts](../../../../../src/modules/purchases/composables/usePurchaseEditor.ts) · línea 23, columna 34. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `quantity` | `quantity: number;` |
| `net` | `net: number;` |
| `gross` | `gross: number;` |

**Figura:** `DIA-VUE-TS-PURCHASES-70-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseEditor.return.<br/>totals.shape9"] {
        <<inferred_object>>
        quantity: number
        net: number
        gross: number
    }
```

## usePurchaseFilters.return

**Fuente:** [src/modules/purchases/composables/usePurchaseFilters.ts](../../../../../src/modules/purchases/composables/usePurchaseFilters.ts) · línea 8, columna 35. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `values` | `"values": { startDate: string; endDate: string; supplierId: string; personId: string; };` |
| `suppliers` | `"suppliers": { state: ComputedRef<LookupState>; items: Ref<{ id: string; title: string; data: Record<string, unknown>; isDisabled?: boolean \| undefined; }[], LookupItem[] \| { id: string; title: string; data: Record<string, unknown>; isDisabled?: boolean \| undefined; }[]>; isLoading: Ref<boolean, boolean>; error: Ref<string, string>; search: Ref<string, string>; hasMore: Ref<boolean, boolean>; updateSearch: (value: string) => void; refresh: () => Promise<void>; loadMore: () => Promise<void> \| undefined; retry: () => Promise<void>; };` |
| `persons` | `"persons": { state: ComputedRef<LookupState>; items: Ref<{ id: string; title: string; data: Record<string, unknown>; isDisabled?: boolean \| undefined; }[], LookupItem[] \| { id: string; title: string; data: Record<string, unknown>; isDisabled?: boolean \| undefined; }[]>; isLoading: Ref<boolean, boolean>; error: Ref<string, string>; search: Ref<string, string>; hasMore: Ref<boolean, boolean>; updateSearch: (value: string) => void; refresh: () => Promise<void>; loadMore: () => Promise<void> \| undefined; retry: () => Promise<void>; };` |
| `canSuppliers` | `"canSuppliers": ComputedRef<boolean>;` |
| `canPersons` | `"canPersons": ComputedRef<boolean>;` |
| `clear` | `"clear": () => void;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [usePurchaseFilters.return.values.shape1](../../../../../src/modules/purchases/composables/usePurchaseFilters.ts) | `values` |
| dependency | [usePurchaseFilters.return.suppliers.shape2](../../../../../src/modules/purchases/composables/usePurchaseFilters.ts) | `suppliers` |
| dependency | [usePurchaseFilters.return.persons.shape5](../../../../../src/modules/purchases/composables/usePurchaseFilters.ts) | `persons` |
| dependency | `ComputedRef` | `canSuppliers` |
| dependency | `ComputedRef` | `canPersons` |

**Figura:** `DIA-VUE-TS-PURCHASES-71-1`. Parte 1/3.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseFilters.return"] {
        <<inferred_return>>
        values: object
        suppliers: callback
        persons: callback
        canSuppliers: ComputedRef~boolean~
        canPersons: ComputedRef~boolean~
        clear: callback
    }
    class R0["usePurchaseFilters.return.<br/>values.shape1"] {
        <<reference>>
    }
    class R1["usePurchaseFilters.return.<br/>suppliers.shape2"] {
        <<reference>>
    }
    Subject "1" --> "1" R0 : values
    Subject ..> R1 : suppliers
```

**Figura:** `DIA-VUE-TS-PURCHASES-71-2`. Parte 2/3.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseFilters.return"] {
        <<inferred_return>>
    }
    class R0["usePurchaseFilters.return.<br/>persons.shape5"] {
        <<reference>>
    }
    class R1["ComputedRef"] {
        <<reference>>
    }
    Subject ..> R0 : persons
    Subject ..> R1 : canSuppliers
```

**Figura:** `DIA-VUE-TS-PURCHASES-71-3`. Parte 3/3.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseFilters.return"] {
        <<inferred_return>>
    }
    class R0["ComputedRef"] {
        <<reference>>
    }
    Subject ..> R0 : canPersons
```

## usePurchaseFilters.return.values.shape1

**Fuente:** [src/modules/purchases/composables/usePurchaseFilters.ts](../../../../../src/modules/purchases/composables/usePurchaseFilters.ts) · línea 8, columna 35. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `startDate` | `startDate: string;` |
| `endDate` | `endDate: string;` |
| `supplierId` | `supplierId: string;` |
| `personId` | `personId: string;` |

**Figura:** `DIA-VUE-TS-PURCHASES-72-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseFilters.return.<br/>values.shape1"] {
        <<inferred_object>>
        startDate: string
        endDate: string
        supplierId: string
        personId: string
    }
```

## usePurchaseFilters.return.suppliers.shape2

**Fuente:** [src/modules/purchases/composables/usePurchaseFilters.ts](../../../../../src/modules/purchases/composables/usePurchaseFilters.ts) · línea 8, columna 35. **Declaración:** inferred object.

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
| dependency | `ComputedRef` | `state` |
| dependency | `LookupState` | `state` |
| dependency | `Ref` | `items` |
| dependency | [usePurchaseFilters.return.suppliers.items.shape3](../../../../../src/modules/purchases/composables/usePurchaseFilters.ts) | `items` |
| dependency | `LookupItem` | `items` |
| dependency | [usePurchaseFilters.return.suppliers.items.shape4](../../../../../src/modules/purchases/composables/usePurchaseFilters.ts) | `items` |
| dependency | `Ref` | `isLoading` |
| dependency | `Ref` | `error` |
| dependency | `Ref` | `search` |
| dependency | `Ref` | `hasMore` |
| dependency | `Promise` | `refresh` |
| dependency | `Promise` | `loadMore` |
| dependency | `Promise` | `retry` |

**Figura:** `DIA-VUE-TS-PURCHASES-73-1`. Parte 1/7.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseFilters.return.<br/>suppliers.shape2"] {
        <<inferred_object>>
        state: ComputedRef~LookupState~
        items: object
        isLoading: Ref~boolean, boolean~
        error: Ref~string, string~
        search: Ref~string, string~
        hasMore: Ref~boolean, boolean~
        updateSearch: callback
        refresh: callback
    }
    class R0["ComputedRef"] {
        <<reference>>
    }
    class R1["LookupState"] {
        <<reference>>
    }
    Subject ..> R0 : state
    Subject ..> R1 : state
```

**Figura:** `DIA-VUE-TS-PURCHASES-73-2`. Parte 2/7.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseFilters.return.<br/>suppliers.shape2"] {
        <<inferred_object>>
        loadMore: callback
        retry: callback
    }
    class R0["Ref"] {
        <<reference>>
    }
    class R1["usePurchaseFilters.return.<br/>suppliers.items.shape3"] {
        <<reference>>
    }
    Subject ..> R0 : items
    Subject ..> R1 : items
```

**Figura:** `DIA-VUE-TS-PURCHASES-73-3`. Parte 3/7.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseFilters.return.<br/>suppliers.shape2"] {
        <<inferred_object>>
    }
    class R0["LookupItem"] {
        <<reference>>
    }
    class R1["usePurchaseFilters.return.<br/>suppliers.items.shape4"] {
        <<reference>>
    }
    Subject ..> R0 : items
    Subject ..> R1 : items
```

**Figura:** `DIA-VUE-TS-PURCHASES-73-4`. Parte 4/7.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseFilters.return.<br/>suppliers.shape2"] {
        <<inferred_object>>
    }
    class R0["Ref"] {
        <<reference>>
    }
    Subject ..> R0 : isLoading
    Subject ..> R0 : error
```

**Figura:** `DIA-VUE-TS-PURCHASES-73-5`. Parte 5/7.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseFilters.return.<br/>suppliers.shape2"] {
        <<inferred_object>>
    }
    class R0["Ref"] {
        <<reference>>
    }
    Subject ..> R0 : search
    Subject ..> R0 : hasMore
```

**Figura:** `DIA-VUE-TS-PURCHASES-73-6`. Parte 6/7.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseFilters.return.<br/>suppliers.shape2"] {
        <<inferred_object>>
    }
    class R0["Promise"] {
        <<reference>>
    }
    Subject ..> R0 : refresh
    Subject ..> R0 : loadMore
```

**Figura:** `DIA-VUE-TS-PURCHASES-73-7`. Parte 7/7.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseFilters.return.<br/>suppliers.shape2"] {
        <<inferred_object>>
    }
    class R0["Promise"] {
        <<reference>>
    }
    Subject ..> R0 : retry
```

## usePurchaseFilters.return.suppliers.items.shape3

**Fuente:** [src/modules/purchases/composables/usePurchaseFilters.ts](../../../../../src/modules/purchases/composables/usePurchaseFilters.ts) · línea 8, columna 35. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `id` | `id: string;` |
| `title` | `title: string;` |
| `data` | `data: Record<string, unknown>;` |
| `isDisabled` | `isDisabled?: boolean \| undefined;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | `Record` | `data` |

**Figura:** `DIA-VUE-TS-PURCHASES-74-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseFilters.return.<br/>suppliers.items.shape3"] {
        <<inferred_object>>
        id: string
        title: string
        data: Record~string, unknown~
        isDisabled?: boolean | undefined
    }
    class R0["Record"] {
        <<reference>>
    }
    Subject ..> R0 : data
```

## usePurchaseFilters.return.suppliers.items.shape4

**Fuente:** [src/modules/purchases/composables/usePurchaseFilters.ts](../../../../../src/modules/purchases/composables/usePurchaseFilters.ts) · línea 8, columna 35. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `id` | `id: string;` |
| `title` | `title: string;` |
| `data` | `data: Record<string, unknown>;` |
| `isDisabled` | `isDisabled?: boolean \| undefined;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | `Record` | `data` |

**Figura:** `DIA-VUE-TS-PURCHASES-75-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseFilters.return.<br/>suppliers.items.shape4"] {
        <<inferred_object>>
        id: string
        title: string
        data: Record~string, unknown~
        isDisabled?: boolean | undefined
    }
    class R0["Record"] {
        <<reference>>
    }
    Subject ..> R0 : data
```

## usePurchaseFilters.return.persons.shape5

**Fuente:** [src/modules/purchases/composables/usePurchaseFilters.ts](../../../../../src/modules/purchases/composables/usePurchaseFilters.ts) · línea 8, columna 35. **Declaración:** inferred object.

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
| dependency | `ComputedRef` | `state` |
| dependency | `LookupState` | `state` |
| dependency | `Ref` | `items` |
| dependency | [usePurchaseFilters.return.persons.items.shape6](../../../../../src/modules/purchases/composables/usePurchaseFilters.ts) | `items` |
| dependency | `LookupItem` | `items` |
| dependency | [usePurchaseFilters.return.persons.items.shape7](../../../../../src/modules/purchases/composables/usePurchaseFilters.ts) | `items` |
| dependency | `Ref` | `isLoading` |
| dependency | `Ref` | `error` |
| dependency | `Ref` | `search` |
| dependency | `Ref` | `hasMore` |
| dependency | `Promise` | `refresh` |
| dependency | `Promise` | `loadMore` |
| dependency | `Promise` | `retry` |

**Figura:** `DIA-VUE-TS-PURCHASES-76-1`. Parte 1/7.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseFilters.return.<br/>persons.shape5"] {
        <<inferred_object>>
        state: ComputedRef~LookupState~
        items: object
        isLoading: Ref~boolean, boolean~
        error: Ref~string, string~
        search: Ref~string, string~
        hasMore: Ref~boolean, boolean~
        updateSearch: callback
        refresh: callback
    }
    class R0["ComputedRef"] {
        <<reference>>
    }
    class R1["LookupState"] {
        <<reference>>
    }
    Subject ..> R0 : state
    Subject ..> R1 : state
```

**Figura:** `DIA-VUE-TS-PURCHASES-76-2`. Parte 2/7.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseFilters.return.<br/>persons.shape5"] {
        <<inferred_object>>
        loadMore: callback
        retry: callback
    }
    class R0["Ref"] {
        <<reference>>
    }
    class R1["usePurchaseFilters.return.<br/>persons.items.shape6"] {
        <<reference>>
    }
    Subject ..> R0 : items
    Subject ..> R1 : items
```

**Figura:** `DIA-VUE-TS-PURCHASES-76-3`. Parte 3/7.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseFilters.return.<br/>persons.shape5"] {
        <<inferred_object>>
    }
    class R0["LookupItem"] {
        <<reference>>
    }
    class R1["usePurchaseFilters.return.<br/>persons.items.shape7"] {
        <<reference>>
    }
    Subject ..> R0 : items
    Subject ..> R1 : items
```

**Figura:** `DIA-VUE-TS-PURCHASES-76-4`. Parte 4/7.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseFilters.return.<br/>persons.shape5"] {
        <<inferred_object>>
    }
    class R0["Ref"] {
        <<reference>>
    }
    Subject ..> R0 : isLoading
    Subject ..> R0 : error
```

**Figura:** `DIA-VUE-TS-PURCHASES-76-5`. Parte 5/7.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseFilters.return.<br/>persons.shape5"] {
        <<inferred_object>>
    }
    class R0["Ref"] {
        <<reference>>
    }
    Subject ..> R0 : search
    Subject ..> R0 : hasMore
```

**Figura:** `DIA-VUE-TS-PURCHASES-76-6`. Parte 6/7.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseFilters.return.<br/>persons.shape5"] {
        <<inferred_object>>
    }
    class R0["Promise"] {
        <<reference>>
    }
    Subject ..> R0 : refresh
    Subject ..> R0 : loadMore
```

**Figura:** `DIA-VUE-TS-PURCHASES-76-7`. Parte 7/7.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseFilters.return.<br/>persons.shape5"] {
        <<inferred_object>>
    }
    class R0["Promise"] {
        <<reference>>
    }
    Subject ..> R0 : retry
```

## usePurchaseFilters.return.persons.items.shape6

**Fuente:** [src/modules/purchases/composables/usePurchaseFilters.ts](../../../../../src/modules/purchases/composables/usePurchaseFilters.ts) · línea 8, columna 35. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `id` | `id: string;` |
| `title` | `title: string;` |
| `data` | `data: Record<string, unknown>;` |
| `isDisabled` | `isDisabled?: boolean \| undefined;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | `Record` | `data` |

**Figura:** `DIA-VUE-TS-PURCHASES-77-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseFilters.return.<br/>persons.items.shape6"] {
        <<inferred_object>>
        id: string
        title: string
        data: Record~string, unknown~
        isDisabled?: boolean | undefined
    }
    class R0["Record"] {
        <<reference>>
    }
    Subject ..> R0 : data
```

## usePurchaseFilters.return.persons.items.shape7

**Fuente:** [src/modules/purchases/composables/usePurchaseFilters.ts](../../../../../src/modules/purchases/composables/usePurchaseFilters.ts) · línea 8, columna 35. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `id` | `id: string;` |
| `title` | `title: string;` |
| `data` | `data: Record<string, unknown>;` |
| `isDisabled` | `isDisabled?: boolean \| undefined;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | `Record` | `data` |

**Figura:** `DIA-VUE-TS-PURCHASES-78-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseFilters.return.<br/>persons.items.shape7"] {
        <<inferred_object>>
        id: string
        title: string
        data: Record~string, unknown~
        isDisabled?: boolean | undefined
    }
    class R0["Record"] {
        <<reference>>
    }
    Subject ..> R0 : data
```

## usePurchaseLineEntry.return

**Fuente:** [src/modules/purchases/composables/usePurchaseLineEntry.ts](../../../../../src/modules/purchases/composables/usePurchaseLineEntry.ts) · línea 12, columna 37. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `values` | `"values": Record<Field, string>;` |
| `errors` | `"errors": ComputedRef<Partial<Record<"" \| "quantity" \| "costPerUnitType" \| "materialId", string \| undefined>>>;` |
| `items` | `"items": { state: ComputedRef<LookupState>; items: Ref<{ id: string; title: string; data: Record<string, unknown>; isDisabled?: boolean \| undefined; }[], LookupItem[] \| { id: string; title: string; data: Record<string, unknown>; isDisabled?: boolean \| undefined; }[]>; isLoading: Ref<boolean, boolean>; error: Ref<string, string>; search: Ref<string, string>; hasMore: Ref<boolean, boolean>; updateSearch: (value: string) => void; refresh: () => Promise<void>; loadMore: () => Promise<void> \| undefined; retry: () => Promise<void>; };` |
| `item` | `"item": ShallowRef<LookupItem \| undefined, LookupItem \| undefined>;` |
| `selectCreatedItem` | `"selectCreatedItem": (created: LookupItem) => void;` |
| `add` | `"add": () => Promise<void \| undefined> \| undefined;` |
| `update` | `"update": (field: Field, value: string) => void;` |
| `blur` | `"blur": (field: Field) => Promise<unknown> \| undefined;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | `Record` | `values` |
| dependency | [Field](../../../../../src/modules/purchases/composables/usePurchaseLineEntry.ts) | `values` |
| dependency | `ComputedRef` | `errors` |
| dependency | `Partial` | `errors` |
| dependency | `Record` | `errors` |
| dependency | [usePurchaseLineEntry.return.items.shape1](../../../../../src/modules/purchases/composables/usePurchaseLineEntry.ts) | `items` |
| dependency | `ShallowRef` | `item` |
| dependency | [LookupItem](../../../../../src/shared/lookup.ts) | `item` |
| dependency | [LookupItem](../../../../../src/shared/lookup.ts) | `selectCreatedItem` |
| dependency | `Promise` | `add` |
| dependency | [Field](../../../../../src/modules/purchases/composables/usePurchaseLineEntry.ts) | `update` |
| dependency | [Field](../../../../../src/modules/purchases/composables/usePurchaseLineEntry.ts) | `blur` |
| dependency | `Promise` | `blur` |

**Figura:** `DIA-VUE-TS-PURCHASES-79-1`. Parte 1/7.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseLineEntry.return"] {
        <<inferred_return>>
        values: Record~Field, string~
        errors: complex
        items: callback
        item: complex
        selectCreatedItem: callback
        add: callback
        update: callback
        blur: callback
    }
    class R0["Record"] {
        <<reference>>
    }
    class R1["Field"] {
        <<reference>>
    }
    Subject ..> R0 : values
    Subject ..> R1 : values
```

**Figura:** `DIA-VUE-TS-PURCHASES-79-2`. Parte 2/7.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseLineEntry.return"] {
        <<inferred_return>>
    }
    class R0["ComputedRef"] {
        <<reference>>
    }
    class R1["Partial"] {
        <<reference>>
    }
    Subject ..> R0 : errors
    Subject ..> R1 : errors
```

**Figura:** `DIA-VUE-TS-PURCHASES-79-3`. Parte 3/7.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseLineEntry.return"] {
        <<inferred_return>>
    }
    class R0["Record"] {
        <<reference>>
    }
    class R1["usePurchaseLineEntry.return.<br/>items.shape1"] {
        <<reference>>
    }
    Subject ..> R0 : errors
    Subject ..> R1 : items
```

**Figura:** `DIA-VUE-TS-PURCHASES-79-4`. Parte 4/7.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseLineEntry.return"] {
        <<inferred_return>>
    }
    class R0["ShallowRef"] {
        <<reference>>
    }
    class R1["LookupItem"] {
        <<reference>>
    }
    Subject ..> R0 : item
    Subject ..> R1 : item
```

**Figura:** `DIA-VUE-TS-PURCHASES-79-5`. Parte 5/7.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseLineEntry.return"] {
        <<inferred_return>>
    }
    class R0["LookupItem"] {
        <<reference>>
    }
    class R1["Promise"] {
        <<reference>>
    }
    Subject ..> R0 : selectCreatedItem
    Subject ..> R1 : add
```

**Figura:** `DIA-VUE-TS-PURCHASES-79-6`. Parte 6/7.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseLineEntry.return"] {
        <<inferred_return>>
    }
    class R0["Field"] {
        <<reference>>
    }
    Subject ..> R0 : update
    Subject ..> R0 : blur
```

**Figura:** `DIA-VUE-TS-PURCHASES-79-7`. Parte 7/7.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseLineEntry.return"] {
        <<inferred_return>>
    }
    class R0["Promise"] {
        <<reference>>
    }
    Subject ..> R0 : blur
```

## usePurchaseLineEntry.return.items.shape1

**Fuente:** [src/modules/purchases/composables/usePurchaseLineEntry.ts](../../../../../src/modules/purchases/composables/usePurchaseLineEntry.ts) · línea 12, columna 37. **Declaración:** inferred object.

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
| dependency | `ComputedRef` | `state` |
| dependency | `LookupState` | `state` |
| dependency | `Ref` | `items` |
| dependency | [usePurchaseLineEntry.return.items.items.shape2](../../../../../src/modules/purchases/composables/usePurchaseLineEntry.ts) | `items` |
| dependency | [LookupItem](../../../../../src/shared/lookup.ts) | `items` |
| dependency | [usePurchaseLineEntry.return.items.items.shape3](../../../../../src/modules/purchases/composables/usePurchaseLineEntry.ts) | `items` |
| dependency | `Ref` | `isLoading` |
| dependency | `Ref` | `error` |
| dependency | `Ref` | `search` |
| dependency | `Ref` | `hasMore` |
| dependency | `Promise` | `refresh` |
| dependency | `Promise` | `loadMore` |
| dependency | `Promise` | `retry` |

**Figura:** `DIA-VUE-TS-PURCHASES-80-1`. Parte 1/7.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseLineEntry.return.<br/>items.shape1"] {
        <<inferred_object>>
        state: ComputedRef~LookupState~
        items: object
        isLoading: Ref~boolean, boolean~
        error: Ref~string, string~
        search: Ref~string, string~
        hasMore: Ref~boolean, boolean~
        updateSearch: callback
        refresh: callback
    }
    class R0["ComputedRef"] {
        <<reference>>
    }
    class R1["LookupState"] {
        <<reference>>
    }
    Subject ..> R0 : state
    Subject ..> R1 : state
```

**Figura:** `DIA-VUE-TS-PURCHASES-80-2`. Parte 2/7.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseLineEntry.return.<br/>items.shape1"] {
        <<inferred_object>>
        loadMore: callback
        retry: callback
    }
    class R0["Ref"] {
        <<reference>>
    }
    class R1["usePurchaseLineEntry.return.<br/>items.items.shape2"] {
        <<reference>>
    }
    Subject ..> R0 : items
    Subject ..> R1 : items
```

**Figura:** `DIA-VUE-TS-PURCHASES-80-3`. Parte 3/7.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseLineEntry.return.<br/>items.shape1"] {
        <<inferred_object>>
    }
    class R0["LookupItem"] {
        <<reference>>
    }
    class R1["usePurchaseLineEntry.return.<br/>items.items.shape3"] {
        <<reference>>
    }
    Subject ..> R0 : items
    Subject ..> R1 : items
```

**Figura:** `DIA-VUE-TS-PURCHASES-80-4`. Parte 4/7.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseLineEntry.return.<br/>items.shape1"] {
        <<inferred_object>>
    }
    class R0["Ref"] {
        <<reference>>
    }
    Subject ..> R0 : isLoading
    Subject ..> R0 : error
```

**Figura:** `DIA-VUE-TS-PURCHASES-80-5`. Parte 5/7.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseLineEntry.return.<br/>items.shape1"] {
        <<inferred_object>>
    }
    class R0["Ref"] {
        <<reference>>
    }
    Subject ..> R0 : search
    Subject ..> R0 : hasMore
```

**Figura:** `DIA-VUE-TS-PURCHASES-80-6`. Parte 6/7.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseLineEntry.return.<br/>items.shape1"] {
        <<inferred_object>>
    }
    class R0["Promise"] {
        <<reference>>
    }
    Subject ..> R0 : refresh
    Subject ..> R0 : loadMore
```

**Figura:** `DIA-VUE-TS-PURCHASES-80-7`. Parte 7/7.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseLineEntry.return.<br/>items.shape1"] {
        <<inferred_object>>
    }
    class R0["Promise"] {
        <<reference>>
    }
    Subject ..> R0 : retry
```

## usePurchaseLineEntry.return.items.items.shape2

**Fuente:** [src/modules/purchases/composables/usePurchaseLineEntry.ts](../../../../../src/modules/purchases/composables/usePurchaseLineEntry.ts) · línea 12, columna 37. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `id` | `id: string;` |
| `title` | `title: string;` |
| `data` | `data: Record<string, unknown>;` |
| `isDisabled` | `isDisabled?: boolean \| undefined;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | `Record` | `data` |

**Figura:** `DIA-VUE-TS-PURCHASES-81-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseLineEntry.return.<br/>items.items.shape2"] {
        <<inferred_object>>
        id: string
        title: string
        data: Record~string, unknown~
        isDisabled?: boolean | undefined
    }
    class R0["Record"] {
        <<reference>>
    }
    Subject ..> R0 : data
```

## usePurchaseLineEntry.return.items.items.shape3

**Fuente:** [src/modules/purchases/composables/usePurchaseLineEntry.ts](../../../../../src/modules/purchases/composables/usePurchaseLineEntry.ts) · línea 12, columna 37. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `id` | `id: string;` |
| `title` | `title: string;` |
| `data` | `data: Record<string, unknown>;` |
| `isDisabled` | `isDisabled?: boolean \| undefined;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | `Record` | `data` |

**Figura:** `DIA-VUE-TS-PURCHASES-82-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["usePurchaseLineEntry.return.<br/>items.items.shape3"] {
        <<inferred_object>>
        id: string
        title: string
        data: Record~string, unknown~
        isDisabled?: boolean | undefined
    }
    class R0["Record"] {
        <<reference>>
    }
    Subject ..> R0 : data
```

## normalizePurchaseRow.return

**Fuente:** [src/modules/purchases/mappers/purchaseResponseMapper.ts](../../../../../src/modules/purchases/mappers/purchaseResponseMapper.ts) · línea 32, columna 37. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `id` | `"id": string;` |
| `referenceNumber` | `"referenceNumber": string;` |
| `receptionDate` | `"receptionDate": string;` |
| `supplierId` | `"supplierId": string;` |
| `supplierName` | `"supplierName": string;` |
| `receivedById` | `"receivedById": string;` |
| `receivedByName` | `"receivedByName": string;` |
| `isInvoiced` | `"isInvoiced": boolean;` |
| `invoice` | `"invoice": string;` |
| `status` | `"status": string;` |
| `totalQuantity` | `"totalQuantity": Decimal;` |
| `totalNetPurchaseAmount` | `"totalNetPurchaseAmount": Decimal;` |
| `totalGrossPurchaseAmount` | `"totalGrossPurchaseAmount": Decimal;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [Decimal](../../../../../src/modules/purchases/purchase.ts) | `totalQuantity` |
| dependency | [Decimal](../../../../../src/modules/purchases/purchase.ts) | `totalNetPurchaseAmount` |
| dependency | [Decimal](../../../../../src/modules/purchases/purchase.ts) | `totalGrossPurchaseAmount` |

**Figura:** `DIA-VUE-TS-PURCHASES-83-1`. Parte 1/2.

```mermaid
classDiagram
    direction TB
    class Subject["normalizePurchaseRow.return"] {
        <<inferred_return>>
        id: string
        referenceNumber: string
        receptionDate: string
        supplierId: string
        supplierName: string
        receivedById: string
        receivedByName: string
        isInvoiced: boolean
    }
    class R0["Decimal"] {
        <<reference>>
    }
    Subject ..> R0 : totalQuantity
    Subject ..> R0 : totalNetPurchaseAmount
```

**Figura:** `DIA-VUE-TS-PURCHASES-83-2`. Parte 2/2.

```mermaid
classDiagram
    direction TB
    class Subject["normalizePurchaseRow.return"] {
        <<inferred_return>>
        invoice: string
        status: string
        totalQuantity: Decimal
        totalNetPurchaseAmount: Decimal
        totalGrossPurchaseAmount: Decimal
    }
    class R0["Decimal"] {
        <<reference>>
    }
    Subject ..> R0 : totalGrossPurchaseAmount
```

## normalizePurchaseDocument.return

**Fuente:** [src/modules/purchases/mappers/purchaseResponseMapper.ts](../../../../../src/modules/purchases/mappers/purchaseResponseMapper.ts) · línea 96, columna 42. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `observations` | `"observations": string;` |
| `details` | `"details": PurchaseDetail[];` |
| `id` | `"id": string;` |
| `referenceNumber` | `"referenceNumber": string;` |
| `receptionDate` | `"receptionDate": string;` |
| `supplierId` | `"supplierId": string;` |
| `supplierName` | `"supplierName": string;` |
| `receivedById` | `"receivedById": string;` |
| `receivedByName` | `"receivedByName": string;` |
| `isInvoiced` | `"isInvoiced": boolean;` |
| `invoice` | `"invoice": string;` |
| `status` | `"status": string;` |
| `totalQuantity` | `"totalQuantity": Decimal;` |
| `totalNetPurchaseAmount` | `"totalNetPurchaseAmount": Decimal;` |
| `totalGrossPurchaseAmount` | `"totalGrossPurchaseAmount": Decimal;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [PurchaseDetail](../../../../../src/modules/purchases/purchase.ts) | `details` |
| dependency | [Decimal](../../../../../src/modules/purchases/purchase.ts) | `totalQuantity` |
| dependency | [Decimal](../../../../../src/modules/purchases/purchase.ts) | `totalNetPurchaseAmount` |
| dependency | [Decimal](../../../../../src/modules/purchases/purchase.ts) | `totalGrossPurchaseAmount` |

**Figura:** `DIA-VUE-TS-PURCHASES-84-1`. Parte 1/2.

```mermaid
classDiagram
    direction TB
    class Subject["normalizePurchaseDocument.<br/>return"] {
        <<inferred_return>>
        observations: string
        details: PurchaseDetail[]
        id: string
        referenceNumber: string
        receptionDate: string
        supplierId: string
        supplierName: string
        receivedById: string
    }
    class R0["PurchaseDetail"] {
        <<reference>>
    }
    class R1["Decimal"] {
        <<reference>>
    }
    Subject "1" --> "0..*" R0 : details
    Subject ..> R1 : totalQuantity
```

**Figura:** `DIA-VUE-TS-PURCHASES-84-2`. Parte 2/2.

```mermaid
classDiagram
    direction TB
    class Subject["normalizePurchaseDocument.<br/>return"] {
        <<inferred_return>>
        receivedByName: string
        isInvoiced: boolean
        invoice: string
        status: string
        totalQuantity: Decimal
        totalNetPurchaseAmount: Decimal
        totalGrossPurchaseAmount: Decimal
    }
    class R0["Decimal"] {
        <<reference>>
    }
    Subject ..> R0 : totalNetPurchaseAmount
    Subject ..> R0 : totalGrossPurchaseAmount
```

## mapPurchaseItemOption.return

**Fuente:** [src/modules/purchases/mappers/purchaseResponseMapper.ts](../../../../../src/modules/purchases/mappers/purchaseResponseMapper.ts) · línea 119, columna 38. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `id` | `"id": string;` |
| `title` | `"title": string;` |
| `data` | `"data": Record<string, unknown>;` |
| `isDisabled` | `"isDisabled"?: boolean \| undefined;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | `Record` | `data` |

**Figura:** `DIA-VUE-TS-PURCHASES-85-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["mapPurchaseItemOption.return"] {
        <<inferred_return>>
        id: string
        title: string
        data: Record~string, unknown~
        isDisabled?: boolean | undefined
    }
    class R0["Record"] {
        <<reference>>
    }
    Subject ..> R0 : data
```

## calculatePurchaseTotals.return

**Fuente:** [src/modules/purchases/purchaseCalculations.ts](../../../../../src/modules/purchases/purchaseCalculations.ts) · línea 4, columna 40. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `quantity` | `"quantity": number;` |
| `net` | `"net": number;` |
| `gross` | `"gross": number;` |

**Figura:** `DIA-VUE-TS-PURCHASES-86-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["calculatePurchaseTotals.<br/>return"] {
        <<inferred_return>>
        quantity: number
        net: number
        gross: number
    }
```

## calculatePurchaseCorrectionTotals.return.variant2

**Fuente:** [src/modules/purchases/purchaseCalculations.ts](../../../../../src/modules/purchases/purchaseCalculations.ts) · línea 16, columna 50. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `quantity` | `"quantity": number;` |
| `net` | `"net": number;` |
| `gross` | `"gross": number;` |

**Figura:** `DIA-VUE-TS-PURCHASES-87-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["calculatePurchaseCorrectionT<br/>otals.return.variant2"] {
        <<inferred_return>>
        quantity: number
        net: number
        gross: number
    }
```

## PURCHASE_CONFIG

**Fuente:** [src/modules/purchases/purchaseConfig.ts](../../../../../src/modules/purchases/purchaseConfig.ts) · línea 1, columna 14. **Declaración:** inferred export.

| Miembro | Firma completa |
| --- | --- |
| `materials` | `"materials": { readonly title: "Compras de Materiales"; readonly label: "Materiales"; readonly item: "Material"; readonly path: "materiales"; readonly type: "MATERIAL"; };` |
| `consumables` | `"consumables": { readonly title: "Compras de Consumibles"; readonly label: "Consumibles"; readonly item: "Consumible"; readonly path: "consumibles"; readonly type: "CONSUMABLE"; };` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [PURCHASE_CONFIG.materials.shape1](../../../../../src/modules/purchases/purchaseConfig.ts) | `materials` |
| association | [PURCHASE_CONFIG.consumables.shape2](../../../../../src/modules/purchases/purchaseConfig.ts) | `consumables` |

**Figura:** `DIA-VUE-TS-PURCHASES-88-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["PURCHASE_CONFIG"] {
        <<inferred_export>>
        materials: object
        consumables: object
    }
    class R0["PURCHASE_CONFIG.materials.<br/>shape1"] {
        <<reference>>
    }
    class R1["PURCHASE_CONFIG.consumables.<br/>shape2"] {
        <<reference>>
    }
    Subject "1" --> "1" R0 : materials
    Subject "1" --> "1" R1 : consumables
```

## PURCHASE_CONFIG.materials.shape1

**Fuente:** [src/modules/purchases/purchaseConfig.ts](../../../../../src/modules/purchases/purchaseConfig.ts) · línea 1, columna 14. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `title` | `readonly title: "Compras de Materiales";` |
| `label` | `readonly label: "Materiales";` |
| `item` | `readonly item: "Material";` |
| `path` | `readonly path: "materiales";` |
| `type` | `readonly type: "MATERIAL";` |

**Figura:** `DIA-VUE-TS-PURCHASES-89-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["PURCHASE_CONFIG.materials.<br/>shape1"] {
        <<inferred_object>>
        title: "Compras de Materiales"
        label: "Materiales"
        item: "Material"
        path: "materiales"
        type: "MATERIAL"
    }
```

## PURCHASE_CONFIG.consumables.shape2

**Fuente:** [src/modules/purchases/purchaseConfig.ts](../../../../../src/modules/purchases/purchaseConfig.ts) · línea 1, columna 14. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `title` | `readonly title: "Compras de Consumibles";` |
| `label` | `readonly label: "Consumibles";` |
| `item` | `readonly item: "Consumible";` |
| `path` | `readonly path: "consumibles";` |
| `type` | `readonly type: "CONSUMABLE";` |

**Figura:** `DIA-VUE-TS-PURCHASES-90-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["PURCHASE_CONFIG.consumables.<br/>shape2"] {
        <<inferred_object>>
        title: "Compras de Consumibles"
        label: "Consumibles"
        item: "Consumible"
        path: "consumibles"
        type: "CONSUMABLE"
    }
```

## createPurchaseDetailDraft.return

**Fuente:** [src/modules/purchases/purchaseDetails.ts](../../../../../src/modules/purchases/purchaseDetails.ts) · línea 6, columna 42. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `id` | `"id": string;` |
| `materialId` | `"materialId": string;` |
| `name` | `"name": string;` |
| `base` | `"base": Decimal \| null;` |
| `height` | `"height": Decimal \| null;` |
| `presentation` | `"presentation": string;` |
| `unitMeasure` | `"unitMeasure": string;` |
| `quantity` | `"quantity": Decimal;` |
| `convertedQuantity` | `"convertedQuantity": Decimal;` |
| `costPerUnitType` | `"costPerUnitType": Decimal;` |
| `conversionUnitCost` | `"conversionUnitCost": Decimal;` |
| `netPurchaseAmount` | `"netPurchaseAmount": Decimal;` |
| `grossPurchaseAmount` | `"grossPurchaseAmount": Decimal;` |
| `status` | `"status": "ACTIVE" \| "CANCELED";` |
| `isNew` | `"isNew": boolean;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | `Decimal` | `base` |
| dependency | `Decimal` | `height` |
| dependency | `Decimal` | `quantity` |
| dependency | `Decimal` | `convertedQuantity` |
| dependency | `Decimal` | `costPerUnitType` |
| dependency | `Decimal` | `conversionUnitCost` |
| dependency | `Decimal` | `netPurchaseAmount` |
| dependency | `Decimal` | `grossPurchaseAmount` |

**Figura:** `DIA-VUE-TS-PURCHASES-91-1`. Parte 1/4.

```mermaid
classDiagram
    direction TB
    class Subject["createPurchaseDetailDraft.<br/>return"] {
        <<inferred_return>>
        id: string
        materialId: string
        name: string
        base: Decimal | null
        height: Decimal | null
        presentation: string
        unitMeasure: string
        quantity: Decimal
    }
    class R0["Decimal"] {
        <<reference>>
    }
    Subject ..> R0 : base
    Subject ..> R0 : height
```

**Figura:** `DIA-VUE-TS-PURCHASES-91-2`. Parte 2/4.

```mermaid
classDiagram
    direction TB
    class Subject["createPurchaseDetailDraft.<br/>return"] {
        <<inferred_return>>
        convertedQuantity: Decimal
        costPerUnitType: Decimal
        conversionUnitCost: Decimal
        netPurchaseAmount: Decimal
        grossPurchaseAmount: Decimal
        status: "ACTIVE" | "CANCELED"
        isNew: boolean
    }
    class R0["Decimal"] {
        <<reference>>
    }
    Subject ..> R0 : quantity
    Subject ..> R0 : convertedQuantity
```

**Figura:** `DIA-VUE-TS-PURCHASES-91-3`. Parte 3/4.

```mermaid
classDiagram
    direction TB
    class Subject["createPurchaseDetailDraft.<br/>return"] {
        <<inferred_return>>
    }
    class R0["Decimal"] {
        <<reference>>
    }
    Subject ..> R0 : costPerUnitType
    Subject ..> R0 : conversionUnitCost
```

**Figura:** `DIA-VUE-TS-PURCHASES-91-4`. Parte 4/4.

```mermaid
classDiagram
    direction TB
    class Subject["createPurchaseDetailDraft.<br/>return"] {
        <<inferred_return>>
    }
    class R0["Decimal"] {
        <<reference>>
    }
    Subject ..> R0 : netPurchaseAmount
    Subject ..> R0 : grossPurchaseAmount
```

## createInitialPurchaseValues.return

**Fuente:** [src/modules/purchases/purchaseForm.ts](../../../../../src/modules/purchases/purchaseForm.ts) · línea 6, columna 44. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `supplierId` | `"supplierId": string;` |
| `receivedById` | `"receivedById": string;` |
| `isInvoiced` | `"isInvoiced": boolean;` |
| `invoice` | `"invoice": string;` |
| `receptionDate` | `"receptionDate": string;` |
| `observations` | `"observations": string;` |
| `details` | `"details": PurchaseDetail[];` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | `PurchaseDetail` | `details` |

**Figura:** `DIA-VUE-TS-PURCHASES-92-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["createInitialPurchaseValues.<br/>return"] {
        <<inferred_return>>
        supplierId: string
        receivedById: string
        isInvoiced: boolean
        invoice: string
        receptionDate: string
        observations: string
        details: PurchaseDetail[]
    }
    class R0["PurchaseDetail"] {
        <<reference>>
    }
    Subject ..> R0 : details
```

## emptyPurchaseFilters.return

**Fuente:** [src/modules/purchases/purchaseForm.ts](../../../../../src/modules/purchases/purchaseForm.ts) · línea 18, columna 37. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `startDate` | `"startDate": string;` |
| `endDate` | `"endDate": string;` |
| `supplierId` | `"supplierId": string;` |
| `personId` | `"personId": string;` |

**Figura:** `DIA-VUE-TS-PURCHASES-93-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["emptyPurchaseFilters.return"] {
        <<inferred_return>>
        startDate: string
        endDate: string
        supplierId: string
        personId: string
    }
```

## purchaseLookupService

**Fuente:** [src/modules/purchases/services/purchaseLookupService.ts](../../../../../src/modules/purchases/services/purchaseLookupService.ts) · línea 7, columna 14. **Declaración:** inferred export.

| Miembro | Firma completa |
| --- | --- |
| `list` | `"list": (kind: "suppliers" \| "persons" \| "items", resource: PurchaseResource, search: string, page: number, signal: AbortSignal, options?: { supplierId?: string; capture?: boolean; }) => Promise<{ data: LookupItem[]; recordsFiltered: number; recordsTotal: number; }>;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [PurchaseResource](../../../../../src/modules/purchases/purchase.ts) | `list` |
| dependency | `AbortSignal` | `list` |
| dependency | [purchaseLookupService.list.options.shape1](../../../../../src/modules/purchases/services/purchaseLookupService.ts) | `list` |
| dependency | `Promise` | `list` |
| dependency | [purchaseLookupService.list.shape2](../../../../../src/modules/purchases/services/purchaseLookupService.ts) | `list` |

**Figura:** `DIA-VUE-TS-PURCHASES-94-1`. Parte 1/3.

```mermaid
classDiagram
    direction TB
    class Subject["purchaseLookupService"] {
        <<inferred_export>>
        list: callback
    }
    class R0["PurchaseResource"] {
        <<reference>>
    }
    class R1["AbortSignal"] {
        <<reference>>
    }
    Subject ..> R0 : list
    Subject ..> R1 : list
```

**Figura:** `DIA-VUE-TS-PURCHASES-94-2`. Parte 2/3.

```mermaid
classDiagram
    direction TB
    class Subject["purchaseLookupService"] {
        <<inferred_export>>
    }
    class R0["purchaseLookupService.list.<br/>options.shape1"] {
        <<reference>>
    }
    class R1["Promise"] {
        <<reference>>
    }
    Subject ..> R0 : list
    Subject ..> R1 : list
```

**Figura:** `DIA-VUE-TS-PURCHASES-94-3`. Parte 3/3.

```mermaid
classDiagram
    direction TB
    class Subject["purchaseLookupService"] {
        <<inferred_export>>
    }
    class R0["purchaseLookupService.list.<br/>shape2"] {
        <<reference>>
    }
    Subject ..> R0 : list
```

## purchaseLookupService.list.options.shape1

**Fuente:** [src/modules/purchases/services/purchaseLookupService.ts](../../../../../src/modules/purchases/services/purchaseLookupService.ts) · línea 7, columna 14. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `supplierId` | `supplierId?: string;` |
| `capture` | `capture?: boolean;` |

**Figura:** `DIA-VUE-TS-PURCHASES-95-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["purchaseLookupService.list.<br/>options.shape1"] {
        <<inferred_object>>
        supplierId?: string
        capture?: boolean
    }
```

## purchaseLookupService.list.shape2

**Fuente:** [src/modules/purchases/services/purchaseLookupService.ts](../../../../../src/modules/purchases/services/purchaseLookupService.ts) · línea 7, columna 14. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `data` | `data: LookupItem[];` |
| `recordsFiltered` | `recordsFiltered: number;` |
| `recordsTotal` | `recordsTotal: number;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [LookupItem](../../../../../src/shared/lookup.ts) | `data` |

**Figura:** `DIA-VUE-TS-PURCHASES-96-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["purchaseLookupService.list.<br/>shape2"] {
        <<inferred_object>>
        data: LookupItem[]
        recordsFiltered: number
        recordsTotal: number
    }
    class R0["LookupItem"] {
        <<reference>>
    }
    Subject "1" --> "0..*" R0 : data
```

## purchaseService

**Fuente:** [src/modules/purchases/services/purchaseService.ts](../../../../../src/modules/purchases/services/purchaseService.ts) · línea 30, columna 14. **Declaración:** inferred export.

| Miembro | Firma completa |
| --- | --- |
| `list` | `"list": (resource: PurchaseResource, query: PurchaseQuery, signal: AbortSignal) => Promise<{ data: PurchaseRow[]; recordsFiltered: number; recordsTotal: number; }>;` |
| `get` | `"get": (resource: PurchaseResource, id: string, signal: AbortSignal) => Promise<PurchaseDocument>;` |
| `save` | `"save": (options: { resource: PurchaseResource; target: PurchaseWriteTarget; payload: Record<string, unknown>; signal: AbortSignal; }) => Promise<MutationConfirmation>;` |
| `changeDetail` | `"changeDetail": (options: { resource: PurchaseResource; documentId: string; detailId: string; change: PurchaseDetailChange; signal: AbortSignal; }) => Promise<MutationConfirmation>;` |
| `export` | `"export": (resource: PurchaseResource, query: PurchaseQuery, scope: ReportScope, signal: AbortSignal) => Promise<Blob>;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [PurchaseResource](../../../../../src/modules/purchases/purchase.ts) | `list` |
| dependency | [PurchaseQuery](../../../../../src/modules/purchases/purchase.ts) | `list` |
| dependency | `AbortSignal` | `list` |
| dependency | `Promise` | `list` |
| dependency | [purchaseService.list.shape1](../../../../../src/modules/purchases/services/purchaseService.ts) | `list` |
| dependency | [PurchaseResource](../../../../../src/modules/purchases/purchase.ts) | `get` |
| dependency | `AbortSignal` | `get` |
| dependency | `Promise` | `get` |
| dependency | `PurchaseDocument` | `get` |
| dependency | [purchaseService.save.options.shape2](../../../../../src/modules/purchases/services/purchaseService.ts) | `save` |
| dependency | `Promise` | `save` |
| dependency | `MutationConfirmation` | `save` |
| dependency | [purchaseService.changeDetail.options.shape3](../../../../../src/modules/purchases/services/purchaseService.ts) | `changeDetail` |
| dependency | `Promise` | `changeDetail` |
| dependency | `MutationConfirmation` | `changeDetail` |
| dependency | [PurchaseResource](../../../../../src/modules/purchases/purchase.ts) | `export` |
| dependency | [PurchaseQuery](../../../../../src/modules/purchases/purchase.ts) | `export` |
| dependency | [ReportScope](../../../../../src/shared/report.ts) | `export` |
| dependency | `AbortSignal` | `export` |
| dependency | `Promise` | `export` |
| dependency | `Blob` | `export` |

**Figura:** `DIA-VUE-TS-PURCHASES-97-1`. Parte 1/11.

```mermaid
classDiagram
    direction TB
    class Subject["purchaseService"] {
        <<inferred_export>>
        list: callback
        get: callback
        save: callback
        changeDetail: callback
        export: callback
    }
    class R0["PurchaseResource"] {
        <<reference>>
    }
    class R1["PurchaseQuery"] {
        <<reference>>
    }
    Subject ..> R0 : list
    Subject ..> R1 : list
```

**Figura:** `DIA-VUE-TS-PURCHASES-97-2`. Parte 2/11.

```mermaid
classDiagram
    direction TB
    class Subject["purchaseService"] {
        <<inferred_export>>
    }
    class R0["AbortSignal"] {
        <<reference>>
    }
    class R1["Promise"] {
        <<reference>>
    }
    Subject ..> R0 : list
    Subject ..> R1 : list
```

**Figura:** `DIA-VUE-TS-PURCHASES-97-3`. Parte 3/11.

```mermaid
classDiagram
    direction TB
    class Subject["purchaseService"] {
        <<inferred_export>>
    }
    class R0["purchaseService.list.shape1"] {
        <<reference>>
    }
    class R1["PurchaseResource"] {
        <<reference>>
    }
    Subject ..> R0 : list
    Subject ..> R1 : get
```

**Figura:** `DIA-VUE-TS-PURCHASES-97-4`. Parte 4/11.

```mermaid
classDiagram
    direction TB
    class Subject["purchaseService"] {
        <<inferred_export>>
    }
    class R0["AbortSignal"] {
        <<reference>>
    }
    class R1["Promise"] {
        <<reference>>
    }
    Subject ..> R0 : get
    Subject ..> R1 : get
```

**Figura:** `DIA-VUE-TS-PURCHASES-97-5`. Parte 5/11.

```mermaid
classDiagram
    direction TB
    class Subject["purchaseService"] {
        <<inferred_export>>
    }
    class R0["PurchaseDocument"] {
        <<reference>>
    }
    class R1["purchaseService.save.options.<br/>shape2"] {
        <<reference>>
    }
    Subject ..> R0 : get
    Subject ..> R1 : save
```

**Figura:** `DIA-VUE-TS-PURCHASES-97-6`. Parte 6/11.

```mermaid
classDiagram
    direction TB
    class Subject["purchaseService"] {
        <<inferred_export>>
    }
    class R0["Promise"] {
        <<reference>>
    }
    class R1["MutationConfirmation"] {
        <<reference>>
    }
    Subject ..> R0 : save
    Subject ..> R1 : save
```

**Figura:** `DIA-VUE-TS-PURCHASES-97-7`. Parte 7/11.

```mermaid
classDiagram
    direction TB
    class Subject["purchaseService"] {
        <<inferred_export>>
    }
    class R0["purchaseService.changeDetail.<br/>options.shape3"] {
        <<reference>>
    }
    class R1["Promise"] {
        <<reference>>
    }
    Subject ..> R0 : changeDetail
    Subject ..> R1 : changeDetail
```

**Figura:** `DIA-VUE-TS-PURCHASES-97-8`. Parte 8/11.

```mermaid
classDiagram
    direction TB
    class Subject["purchaseService"] {
        <<inferred_export>>
    }
    class R0["MutationConfirmation"] {
        <<reference>>
    }
    class R1["PurchaseResource"] {
        <<reference>>
    }
    Subject ..> R0 : changeDetail
    Subject ..> R1 : export
```

**Figura:** `DIA-VUE-TS-PURCHASES-97-9`. Parte 9/11.

```mermaid
classDiagram
    direction TB
    class Subject["purchaseService"] {
        <<inferred_export>>
    }
    class R0["PurchaseQuery"] {
        <<reference>>
    }
    class R1["ReportScope"] {
        <<reference>>
    }
    Subject ..> R0 : export
    Subject ..> R1 : export
```

**Figura:** `DIA-VUE-TS-PURCHASES-97-10`. Parte 10/11.

```mermaid
classDiagram
    direction TB
    class Subject["purchaseService"] {
        <<inferred_export>>
    }
    class R0["AbortSignal"] {
        <<reference>>
    }
    class R1["Promise"] {
        <<reference>>
    }
    Subject ..> R0 : export
    Subject ..> R1 : export
```

**Figura:** `DIA-VUE-TS-PURCHASES-97-11`. Parte 11/11.

```mermaid
classDiagram
    direction TB
    class Subject["purchaseService"] {
        <<inferred_export>>
    }
    class R0["Blob"] {
        <<reference>>
    }
    Subject ..> R0 : export
```

## purchaseService.list.shape1

**Fuente:** [src/modules/purchases/services/purchaseService.ts](../../../../../src/modules/purchases/services/purchaseService.ts) · línea 30, columna 14. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `data` | `data: PurchaseRow[];` |
| `recordsFiltered` | `recordsFiltered: number;` |
| `recordsTotal` | `recordsTotal: number;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | `PurchaseRow` | `data` |

**Figura:** `DIA-VUE-TS-PURCHASES-98-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["purchaseService.list.shape1"] {
        <<inferred_object>>
        data: PurchaseRow[]
        recordsFiltered: number
        recordsTotal: number
    }
    class R0["PurchaseRow"] {
        <<reference>>
    }
    Subject ..> R0 : data
```

## purchaseService.save.options.shape2

**Fuente:** [src/modules/purchases/services/purchaseService.ts](../../../../../src/modules/purchases/services/purchaseService.ts) · línea 30, columna 14. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `resource` | `resource: PurchaseResource;` |
| `target` | `target: PurchaseWriteTarget;` |
| `payload` | `payload: Record<string, unknown>;` |
| `signal` | `signal: AbortSignal;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [PurchaseResource](../../../../../src/modules/purchases/purchase.ts) | `resource` |
| dependency | [PurchaseWriteTarget](../../../../../src/modules/purchases/purchase.ts) | `target` |
| dependency | `Record` | `payload` |
| dependency | `AbortSignal` | `signal` |

**Figura:** `DIA-VUE-TS-PURCHASES-99-1`. Parte 1/2.

```mermaid
classDiagram
    direction TB
    class Subject["purchaseService.save.options.<br/>shape2"] {
        <<inferred_object>>
        resource: PurchaseResource
        target: PurchaseWriteTarget
        payload: Record~string, unknown~
        signal: AbortSignal
    }
    class R0["PurchaseResource"] {
        <<reference>>
    }
    class R1["PurchaseWriteTarget"] {
        <<reference>>
    }
    Subject ..> R0 : resource
    Subject ..> R1 : target
```

**Figura:** `DIA-VUE-TS-PURCHASES-99-2`. Parte 2/2.

```mermaid
classDiagram
    direction TB
    class Subject["purchaseService.save.options.<br/>shape2"] {
        <<inferred_object>>
    }
    class R0["Record"] {
        <<reference>>
    }
    class R1["AbortSignal"] {
        <<reference>>
    }
    Subject ..> R0 : payload
    Subject ..> R1 : signal
```

## purchaseService.changeDetail.options.shape3

**Fuente:** [src/modules/purchases/services/purchaseService.ts](../../../../../src/modules/purchases/services/purchaseService.ts) · línea 30, columna 14. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `resource` | `resource: PurchaseResource;` |
| `documentId` | `documentId: string;` |
| `detailId` | `detailId: string;` |
| `change` | `change: PurchaseDetailChange;` |
| `signal` | `signal: AbortSignal;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [PurchaseResource](../../../../../src/modules/purchases/purchase.ts) | `resource` |
| dependency | [PurchaseDetailChange](../../../../../src/modules/purchases/purchase.ts) | `change` |
| dependency | `AbortSignal` | `signal` |

**Figura:** `DIA-VUE-TS-PURCHASES-100-1`. Parte 1/2.

```mermaid
classDiagram
    direction TB
    class Subject["purchaseService.changeDetail.<br/>options.shape3"] {
        <<inferred_object>>
        resource: PurchaseResource
        documentId: string
        detailId: string
        change: PurchaseDetailChange
        signal: AbortSignal
    }
    class R0["PurchaseResource"] {
        <<reference>>
    }
    class R1["PurchaseDetailChange"] {
        <<reference>>
    }
    Subject ..> R0 : resource
    Subject ..> R1 : change
```

**Figura:** `DIA-VUE-TS-PURCHASES-100-2`. Parte 2/2.

```mermaid
classDiagram
    direction TB
    class Subject["purchaseService.changeDetail.<br/>options.shape3"] {
        <<inferred_object>>
    }
    class R0["AbortSignal"] {
        <<reference>>
    }
    Subject ..> R0 : signal
```
