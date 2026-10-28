# Contratos TypeScript: catalogs

Generado con `npm run docs:generate`. No editar manualmente.

Cada figura incluye hasta ocho miembros y dos relaciones; las partes reúnen el contrato completo.
Los destinos sin atributos son referencias: su definición completa aparece en su propia ficha.
Los objetos inline declarados muestran contexto, línea y columna. Las formas inferidas usan shapeN dentro del contrato padre; su fuente apunta al export o función original. No son clases instanciadas.

[Lectura y cobertura](index.md).

## CatalogName

**Fuente:** [src/modules/catalogs/catalog.ts](../../../../../src/modules/catalogs/catalog.ts) · línea 3, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
keyof typeof PUBLIC_CATALOGS
```

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | `PUBLIC_CATALOGS` | `type typeof` |

**Figura:** `DIA-VUE-TS-CATALOGS-1-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["CatalogName"] {
        <<type>>
    }
    class R0["PUBLIC_CATALOGS"] {
        <<reference>>
    }
    Subject ..> R0 : type typeof
```

## CatalogField

**Fuente:** [src/modules/catalogs/catalog.ts](../../../../../src/modules/catalogs/catalog.ts) · línea 4, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
'name' | 'symbol' | 'isActive'
```

**Figura:** `DIA-VUE-TS-CATALOGS-2-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["CatalogField"] {
        <<type>>
    }
```

## CatalogValues

**Fuente:** [src/modules/catalogs/catalog.ts](../../../../../src/modules/catalogs/catalog.ts) · línea 5, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `name` | `name: string;` |
| `symbol` | `symbol: string;` |
| `isActive` | `isActive: boolean;` |

**Figura:** `DIA-VUE-TS-CATALOGS-3-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["CatalogValues"] {
        <<interface>>
        name: string
        symbol: string
        isActive: boolean
    }
```

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

**Figura:** `DIA-VUE-TS-CATALOGS-4-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["CatalogEntry"] {
        <<interface>>
        id: string
        version: number
    }
    class R0["CatalogValues"] {
        <<reference>>
    }
    R0 <|-- Subject : extends
```

## CatalogQuery

**Fuente:** [src/modules/catalogs/catalog.ts](../../../../../src/modules/catalogs/catalog.ts) · línea 14, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `search` | `search: string;` |
| `page` | `page: number;` |
| `length` | `length: number;` |

**Figura:** `DIA-VUE-TS-CATALOGS-5-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["CatalogQuery"] {
        <<interface>>
        search: string
        page: number
        length: number
    }
```

## CatalogTarget

**Fuente:** [src/modules/catalogs/catalog.ts](../../../../../src/modules/catalogs/catalog.ts) · línea 19, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
{ action: 'create' } | { action: 'edit'; row: CatalogEntry }
```

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [CatalogTarget@19:29](../../../../../src/modules/catalogs/catalog.ts) | `type` |
| dependency | [CatalogTarget@19:52](../../../../../src/modules/catalogs/catalog.ts) | `type` |

**Figura:** `DIA-VUE-TS-CATALOGS-6-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["CatalogTarget"] {
        <<type>>
    }
    class R0["CatalogTarget@19:29"] {
        <<reference>>
    }
    class R1["CatalogTarget@19:52"] {
        <<reference>>
    }
    Subject ..> R0 : type
    Subject ..> R1 : type
```

## CatalogTarget@19:29

**Fuente:** [src/modules/catalogs/catalog.ts](../../../../../src/modules/catalogs/catalog.ts) · línea 19, columna 29. **Declaración:** inline object.

| Miembro | Firma completa |
| --- | --- |
| `action` | `action: 'create'` |

**Figura:** `DIA-VUE-TS-CATALOGS-7-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["CatalogTarget@19:29"] {
        <<inline_object>>
        action: 'create'
    }
```

## CatalogTarget@19:52

**Fuente:** [src/modules/catalogs/catalog.ts](../../../../../src/modules/catalogs/catalog.ts) · línea 19, columna 52. **Declaración:** inline object.

| Miembro | Firma completa |
| --- | --- |
| `action` | `action: 'edit';` |
| `row` | `row: CatalogEntry` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [CatalogEntry](../../../../../src/modules/catalogs/catalog.ts) | `row` |

**Figura:** `DIA-VUE-TS-CATALOGS-8-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["CatalogTarget@19:52"] {
        <<inline_object>>
        action: 'edit'
        row: CatalogEntry
    }
    class R0["CatalogEntry"] {
        <<reference>>
    }
    Subject "1" --> "1" R0 : row
```

## maxLengths@23:23

**Fuente:** [src/modules/catalogs/catalog.ts](../../../../../src/modules/catalogs/catalog.ts) · línea 23, columna 23. **Declaración:** inline object.

| Miembro | Firma completa |
| --- | --- |
| `name` | `name: number;` |
| `symbol` | `symbol?: number` |

**Figura:** `DIA-VUE-TS-CATALOGS-9-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["maxLengths@23:23"] {
        <<inline_object>>
        name: number
        symbol?: number
    }
```

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
| dependency | `Partial` | `errors` |
| dependency | `Record` | `errors` |
| dependency | [CatalogField](../../../../../src/modules/catalogs/catalog.ts) | `errors` |

**Figura:** `DIA-VUE-TS-CATALOGS-10-1`. Parte 1/2.

```mermaid
classDiagram
    direction TB
    class Subject["CatalogForm.defineProps"] {
        <<SFC_contract>>
        title: string
        values: CatalogValues
        errors: Partial~Record~CatalogField, string~~
        message: string
        isSubmitting: boolean
        isConflicted: boolean
        hasSymbol: boolean
        maxNameLength: number
    }
    class R0["CatalogValues"] {
        <<reference>>
    }
    class R1["Partial"] {
        <<reference>>
    }
    Subject "1" --> "1" R0 : values
    Subject ..> R1 : errors
```

**Figura:** `DIA-VUE-TS-CATALOGS-10-2`. Parte 2/2.

```mermaid
classDiagram
    direction TB
    class Subject["CatalogForm.defineProps"] {
        <<SFC_contract>>
        maxSymbolLength?: number
        isEditing: boolean
    }
    class R0["Record"] {
        <<reference>>
    }
    class R1["CatalogField"] {
        <<reference>>
    }
    Subject ..> R0 : errors
    Subject ..> R1 : errors
```

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

**Figura:** `DIA-VUE-TS-CATALOGS-11-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["CatalogForm.defineEmits"] {
        <<SFC_contract>>
        update: tuple
        blur: tuple
        submit: tuple
        close: tuple
        reload: tuple
    }
    class R0["CatalogField"] {
        <<reference>>
    }
    Subject ..> R0 : update
    Subject ..> R0 : blur
```

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

**Figura:** `DIA-VUE-TS-CATALOGS-12-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["CatalogTable.defineProps"] {
        <<SFC_contract>>
        rows: CatalogEntry[]
        total: number
        query: CatalogQuery
        isLoading: boolean
        hasSymbol: boolean
    }
    class R0["CatalogEntry"] {
        <<reference>>
    }
    class R1["CatalogQuery"] {
        <<reference>>
    }
    Subject "1" --> "0..*" R0 : rows
    Subject "1" --> "1" R1 : query
```

## CatalogTable.defineEmits

**Fuente:** [src/modules/catalogs/components/CatalogTable.vue](../../../../../src/modules/catalogs/components/CatalogTable.vue) · línea 15, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `edit` | `edit: [row: CatalogEntry];` |
| `query` | `query: [query: Partial<CatalogQuery>]` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [CatalogEntry](../../../../../src/modules/catalogs/catalog.ts) | `edit` |
| dependency | `Partial` | `query` |
| dependency | [CatalogQuery](../../../../../src/modules/catalogs/catalog.ts) | `query` |

**Figura:** `DIA-VUE-TS-CATALOGS-13-1`. Parte 1/2.

```mermaid
classDiagram
    direction TB
    class Subject["CatalogTable.defineEmits"] {
        <<SFC_contract>>
        edit: tuple
        query: tuple
    }
    class R0["CatalogEntry"] {
        <<reference>>
    }
    class R1["Partial"] {
        <<reference>>
    }
    Subject ..> R0 : edit
    Subject ..> R1 : query
```

**Figura:** `DIA-VUE-TS-CATALOGS-13-2`. Parte 2/2.

```mermaid
classDiagram
    direction TB
    class Subject["CatalogTable.defineEmits"] {
        <<SFC_contract>>
    }
    class R0["CatalogQuery"] {
        <<reference>>
    }
    Subject ..> R0 : query
```

## useCatalogEditor.options@9:43

**Fuente:** [src/modules/catalogs/composables/useCatalogEditor.ts](../../../../../src/modules/catalogs/composables/useCatalogEditor.ts) · línea 9, columna 43. **Declaración:** inline object.

| Miembro | Firma completa |
| --- | --- |
| `catalog` | `catalog: CatalogName;` |
| `target` | `target: CatalogTarget;` |
| `onSaved` | `onSaved: () => void;` |
| `onDenied` | `onDenied: (status: number) => void;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [CatalogName](../../../../../src/modules/catalogs/catalog.ts) | `catalog` |
| dependency | [CatalogTarget](../../../../../src/modules/catalogs/catalog.ts) | `target` |

**Figura:** `DIA-VUE-TS-CATALOGS-14-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["useCatalogEditor.<br/>options@9:43"] {
        <<inline_object>>
        catalog: CatalogName
        target: CatalogTarget
        onSaved: callback
        onDenied: callback
    }
    class R0["CatalogName"] {
        <<reference>>
    }
    class R1["CatalogTarget"] {
        <<reference>>
    }
    Subject ..> R0 : catalog
    Subject ..> R1 : target
```

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

**Figura:** `DIA-VUE-TS-CATALOGS-15-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["CatalogEditorPage.<br/>defineProps"] {
        <<SFC_contract>>
        catalog: CatalogName
        target: CatalogTarget
    }
    class R0["CatalogName"] {
        <<reference>>
    }
    class R1["CatalogTarget"] {
        <<reference>>
    }
    Subject ..> R0 : catalog
    Subject ..> R1 : target
```

## CatalogEditorPage.defineEmits

**Fuente:** [src/modules/catalogs/pages/CatalogEditorPage.vue](../../../../../src/modules/catalogs/pages/CatalogEditorPage.vue) · línea 8, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `saved` | `saved: [];` |
| `close` | `close: [];` |
| `reload` | `reload: [];` |
| `denied` | `denied: [status: number]` |

**Figura:** `DIA-VUE-TS-CATALOGS-16-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["CatalogEditorPage.<br/>defineEmits"] {
        <<SFC_contract>>
        saved: tuple
        close: tuple
        reload: tuple
        denied: tuple
    }
```

## CatalogPage.defineProps

**Fuente:** [src/modules/catalogs/pages/CatalogPage.vue](../../../../../src/modules/catalogs/pages/CatalogPage.vue) · línea 15, columna 27. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `catalog` | `catalog: CatalogName` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [CatalogName](../../../../../src/modules/catalogs/catalog.ts) | `catalog` |

**Figura:** `DIA-VUE-TS-CATALOGS-17-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["CatalogPage.defineProps"] {
        <<SFC_contract>>
        catalog: CatalogName
    }
    class R0["CatalogName"] {
        <<reference>>
    }
    Subject ..> R0 : catalog
```

## apiClient.request@48:48

**Fuente:** [src/modules/catalogs/services/catalogService.ts](../../../../../src/modules/catalogs/services/catalogService.ts) · línea 48, columna 48. **Declaración:** inline object.

| Miembro | Firma completa |
| --- | --- |
| `code` | `code: string;` |
| `data` | `data: unknown` |

**Figura:** `DIA-VUE-TS-CATALOGS-18-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["apiClient.request@48:48"] {
        <<inline_object>>
        code: string
        data: unknown
    }
```

## catalogDefinition.return.variant1

**Fuente:** [src/modules/catalogs/catalog.ts](../../../../../src/modules/catalogs/catalog.ts) · línea 21, columna 34. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `name` | `"name": "departments" \| "roles" \| "presentations" \| "unit-measures" \| "reasons" \| "fulfillment-statuses";` |
| `maxLengths` | `"maxLengths": { name: number; symbol?: number; };` |
| `fields` | `"fields": string[];` |
| `label` | `"label": string;` |
| `entityLabel` | `"entityLabel": string;` |
| `createButtonLabel` | `"createButtonLabel": string;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [catalogDefinition.return.variant1.maxLengths.shape1](../../../../../src/modules/catalogs/catalog.ts) | `maxLengths` |

**Figura:** `DIA-VUE-TS-CATALOGS-19-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["catalogDefinition.return.<br/>variant1"] {
        <<inferred_return>>
        name: complex
        maxLengths: object
        fields: string[]
        label: string
        entityLabel: string
        createButtonLabel: string
    }
    class R0["catalogDefinition.return.<br/>variant1.maxLengths.shape1"] {
        <<reference>>
    }
    Subject "1" --> "1" R0 : maxLengths
```

## catalogDefinition.return.variant1.maxLengths.shape1

**Fuente:** [src/modules/catalogs/catalog.ts](../../../../../src/modules/catalogs/catalog.ts) · línea 21, columna 34. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `name` | `name: number;` |
| `symbol` | `symbol?: number;` |

**Figura:** `DIA-VUE-TS-CATALOGS-20-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["catalogDefinition.return.<br/>variant1.maxLengths.shape1"] {
        <<inferred_object>>
        name: number
        symbol?: number
    }
```

## catalogDefinition.return.variant2

**Fuente:** [src/modules/catalogs/catalog.ts](../../../../../src/modules/catalogs/catalog.ts) · línea 21, columna 34. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `name` | `"name": "departments" \| "roles" \| "presentations" \| "unit-measures" \| "reasons" \| "fulfillment-statuses";` |
| `maxLengths` | `"maxLengths": { name: number; symbol?: number; };` |
| `fields` | `"fields": string[];` |
| `label` | `"label": string;` |
| `entityLabel` | `"entityLabel": string;` |
| `createButtonLabel` | `"createButtonLabel": string;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [catalogDefinition.return.variant2.maxLengths.shape1](../../../../../src/modules/catalogs/catalog.ts) | `maxLengths` |

**Figura:** `DIA-VUE-TS-CATALOGS-21-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["catalogDefinition.return.<br/>variant2"] {
        <<inferred_return>>
        name: complex
        maxLengths: object
        fields: string[]
        label: string
        entityLabel: string
        createButtonLabel: string
    }
    class R0["catalogDefinition.return.<br/>variant2.maxLengths.shape1"] {
        <<reference>>
    }
    Subject "1" --> "1" R0 : maxLengths
```

## catalogDefinition.return.variant2.maxLengths.shape1

**Fuente:** [src/modules/catalogs/catalog.ts](../../../../../src/modules/catalogs/catalog.ts) · línea 21, columna 34. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `name` | `name: number;` |
| `symbol` | `symbol?: number;` |

**Figura:** `DIA-VUE-TS-CATALOGS-22-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["catalogDefinition.return.<br/>variant2.maxLengths.shape1"] {
        <<inferred_object>>
        name: number
        symbol?: number
    }
```

## catalogDefinition.return.variant3

**Fuente:** [src/modules/catalogs/catalog.ts](../../../../../src/modules/catalogs/catalog.ts) · línea 21, columna 34. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `name` | `"name": "departments" \| "roles" \| "presentations" \| "unit-measures" \| "reasons" \| "fulfillment-statuses";` |
| `maxLengths` | `"maxLengths": { name: number; symbol?: number; };` |
| `fields` | `"fields": string[];` |
| `label` | `"label": string;` |
| `entityLabel` | `"entityLabel": string;` |
| `createButtonLabel` | `"createButtonLabel": string;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [catalogDefinition.return.variant3.maxLengths.shape1](../../../../../src/modules/catalogs/catalog.ts) | `maxLengths` |

**Figura:** `DIA-VUE-TS-CATALOGS-23-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["catalogDefinition.return.<br/>variant3"] {
        <<inferred_return>>
        name: complex
        maxLengths: object
        fields: string[]
        label: string
        entityLabel: string
        createButtonLabel: string
    }
    class R0["catalogDefinition.return.<br/>variant3.maxLengths.shape1"] {
        <<reference>>
    }
    Subject "1" --> "1" R0 : maxLengths
```

## catalogDefinition.return.variant3.maxLengths.shape1

**Fuente:** [src/modules/catalogs/catalog.ts](../../../../../src/modules/catalogs/catalog.ts) · línea 21, columna 34. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `name` | `name: number;` |
| `symbol` | `symbol?: number;` |

**Figura:** `DIA-VUE-TS-CATALOGS-24-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["catalogDefinition.return.<br/>variant3.maxLengths.shape1"] {
        <<inferred_object>>
        name: number
        symbol?: number
    }
```

## catalogDefinition.return.variant4

**Fuente:** [src/modules/catalogs/catalog.ts](../../../../../src/modules/catalogs/catalog.ts) · línea 21, columna 34. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `name` | `"name": "departments" \| "roles" \| "presentations" \| "unit-measures" \| "reasons" \| "fulfillment-statuses";` |
| `maxLengths` | `"maxLengths": { name: number; symbol?: number; };` |
| `fields` | `"fields": string[];` |
| `label` | `"label": string;` |
| `entityLabel` | `"entityLabel": string;` |
| `createButtonLabel` | `"createButtonLabel": string;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [catalogDefinition.return.variant4.maxLengths.shape1](../../../../../src/modules/catalogs/catalog.ts) | `maxLengths` |

**Figura:** `DIA-VUE-TS-CATALOGS-25-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["catalogDefinition.return.<br/>variant4"] {
        <<inferred_return>>
        name: complex
        maxLengths: object
        fields: string[]
        label: string
        entityLabel: string
        createButtonLabel: string
    }
    class R0["catalogDefinition.return.<br/>variant4.maxLengths.shape1"] {
        <<reference>>
    }
    Subject "1" --> "1" R0 : maxLengths
```

## catalogDefinition.return.variant4.maxLengths.shape1

**Fuente:** [src/modules/catalogs/catalog.ts](../../../../../src/modules/catalogs/catalog.ts) · línea 21, columna 34. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `name` | `name: number;` |
| `symbol` | `symbol?: number;` |

**Figura:** `DIA-VUE-TS-CATALOGS-26-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["catalogDefinition.return.<br/>variant4.maxLengths.shape1"] {
        <<inferred_object>>
        name: number
        symbol?: number
    }
```

## catalogDefinition.return.variant5

**Fuente:** [src/modules/catalogs/catalog.ts](../../../../../src/modules/catalogs/catalog.ts) · línea 21, columna 34. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `name` | `"name": "departments" \| "roles" \| "presentations" \| "unit-measures" \| "reasons" \| "fulfillment-statuses";` |
| `maxLengths` | `"maxLengths": { name: number; symbol?: number; };` |
| `fields` | `"fields": string[];` |
| `label` | `"label": string;` |
| `entityLabel` | `"entityLabel": string;` |
| `createButtonLabel` | `"createButtonLabel": string;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [catalogDefinition.return.variant5.maxLengths.shape1](../../../../../src/modules/catalogs/catalog.ts) | `maxLengths` |

**Figura:** `DIA-VUE-TS-CATALOGS-27-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["catalogDefinition.return.<br/>variant5"] {
        <<inferred_return>>
        name: complex
        maxLengths: object
        fields: string[]
        label: string
        entityLabel: string
        createButtonLabel: string
    }
    class R0["catalogDefinition.return.<br/>variant5.maxLengths.shape1"] {
        <<reference>>
    }
    Subject "1" --> "1" R0 : maxLengths
```

## catalogDefinition.return.variant5.maxLengths.shape1

**Fuente:** [src/modules/catalogs/catalog.ts](../../../../../src/modules/catalogs/catalog.ts) · línea 21, columna 34. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `name` | `name: number;` |
| `symbol` | `symbol?: number;` |

**Figura:** `DIA-VUE-TS-CATALOGS-28-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["catalogDefinition.return.<br/>variant5.maxLengths.shape1"] {
        <<inferred_object>>
        name: number
        symbol?: number
    }
```

## catalogDefinition.return.variant6

**Fuente:** [src/modules/catalogs/catalog.ts](../../../../../src/modules/catalogs/catalog.ts) · línea 21, columna 34. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `name` | `"name": "departments" \| "roles" \| "presentations" \| "unit-measures" \| "reasons" \| "fulfillment-statuses";` |
| `maxLengths` | `"maxLengths": { name: number; symbol?: number; };` |
| `fields` | `"fields": string[];` |
| `label` | `"label": string;` |
| `entityLabel` | `"entityLabel": string;` |
| `createButtonLabel` | `"createButtonLabel": string;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [catalogDefinition.return.variant6.maxLengths.shape1](../../../../../src/modules/catalogs/catalog.ts) | `maxLengths` |

**Figura:** `DIA-VUE-TS-CATALOGS-29-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["catalogDefinition.return.<br/>variant6"] {
        <<inferred_return>>
        name: complex
        maxLengths: object
        fields: string[]
        label: string
        entityLabel: string
        createButtonLabel: string
    }
    class R0["catalogDefinition.return.<br/>variant6.maxLengths.shape1"] {
        <<reference>>
    }
    Subject "1" --> "1" R0 : maxLengths
```

## catalogDefinition.return.variant6.maxLengths.shape1

**Fuente:** [src/modules/catalogs/catalog.ts](../../../../../src/modules/catalogs/catalog.ts) · línea 21, columna 34. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `name` | `name: number;` |
| `symbol` | `symbol?: number;` |

**Figura:** `DIA-VUE-TS-CATALOGS-30-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["catalogDefinition.return.<br/>variant6.maxLengths.shape1"] {
        <<inferred_object>>
        name: number
        symbol?: number
    }
```

## buildCatalogPayload.return

**Fuente:** [src/modules/catalogs/catalog.ts](../../../../../src/modules/catalogs/catalog.ts) · línea 27, columna 36. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `expectedVersion` | `"expectedVersion"?: number \| undefined;` |
| `isActive` | `"isActive": boolean;` |
| `symbol` | `"symbol"?: string \| undefined;` |
| `name` | `"name": string;` |

**Figura:** `DIA-VUE-TS-CATALOGS-31-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["buildCatalogPayload.return"] {
        <<inferred_return>>
        expectedVersion?: number | undefined
        isActive: boolean
        symbol?: string | undefined
        name: string
    }
```

## useCatalogEditor.return

**Fuente:** [src/modules/catalogs/composables/useCatalogEditor.ts](../../../../../src/modules/catalogs/composables/useCatalogEditor.ts) · línea 9, columna 33. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `isSubmitting` | `"isSubmitting": Ref<boolean, boolean>;` |
| `update` | `"update": (field: CatalogField, value: string \| boolean) => void;` |
| `blur` | `"blur": (field: CatalogField) => Promise<unknown> \| undefined;` |
| `submit` | `"submit": () => Promise<Promise<void> \| undefined> \| undefined;` |
| `message` | `"message": Ref<string, string>;` |
| `isConflicted` | `"isConflicted": Ref<boolean, boolean>;` |
| `execute` | `"execute": (operation: (signal: AbortSignal) => Promise<unknown>) => Promise<void>;` |
| `signal` | `"signal": AbortSignal;` |
| `isDisposed` | `"isDisposed": () => boolean;` |
| `values` | `"values": CatalogValues;` |
| `errors` | `"errors": ComputedRef<Partial<Record<"" \| "symbol" \| "name" \| "isActive", string \| undefined>>>;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | `Ref` | `isSubmitting` |
| dependency | [CatalogField](../../../../../src/modules/catalogs/catalog.ts) | `update` |
| dependency | [CatalogField](../../../../../src/modules/catalogs/catalog.ts) | `blur` |
| dependency | `Promise` | `blur` |
| dependency | `Promise` | `submit` |
| dependency | `Ref` | `message` |
| dependency | `Ref` | `isConflicted` |
| dependency | `AbortSignal` | `execute` |
| dependency | `Promise` | `execute` |
| dependency | `AbortSignal` | `signal` |
| association | [CatalogValues](../../../../../src/modules/catalogs/catalog.ts) | `values` |
| dependency | `ComputedRef` | `errors` |
| dependency | `Partial` | `errors` |
| dependency | `Record` | `errors` |

**Figura:** `DIA-VUE-TS-CATALOGS-32-1`. Parte 1/7.

```mermaid
classDiagram
    direction TB
    class Subject["useCatalogEditor.return"] {
        <<inferred_return>>
        isSubmitting: Ref~boolean, boolean~
        update: callback
        blur: callback
        submit: callback
        message: Ref~string, string~
        isConflicted: Ref~boolean, boolean~
        execute: callback
        signal: AbortSignal
    }
    class R0["Ref"] {
        <<reference>>
    }
    class R1["CatalogField"] {
        <<reference>>
    }
    Subject ..> R0 : isSubmitting
    Subject ..> R1 : update
```

**Figura:** `DIA-VUE-TS-CATALOGS-32-2`. Parte 2/7.

```mermaid
classDiagram
    direction TB
    class Subject["useCatalogEditor.return"] {
        <<inferred_return>>
        isDisposed: callback
        values: CatalogValues
        errors: complex
    }
    class R0["CatalogField"] {
        <<reference>>
    }
    class R1["Promise"] {
        <<reference>>
    }
    Subject ..> R0 : blur
    Subject ..> R1 : blur
```

**Figura:** `DIA-VUE-TS-CATALOGS-32-3`. Parte 3/7.

```mermaid
classDiagram
    direction TB
    class Subject["useCatalogEditor.return"] {
        <<inferred_return>>
    }
    class R0["Promise"] {
        <<reference>>
    }
    class R1["Ref"] {
        <<reference>>
    }
    Subject ..> R0 : submit
    Subject ..> R1 : message
```

**Figura:** `DIA-VUE-TS-CATALOGS-32-4`. Parte 4/7.

```mermaid
classDiagram
    direction TB
    class Subject["useCatalogEditor.return"] {
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

**Figura:** `DIA-VUE-TS-CATALOGS-32-5`. Parte 5/7.

```mermaid
classDiagram
    direction TB
    class Subject["useCatalogEditor.return"] {
        <<inferred_return>>
    }
    class R0["Promise"] {
        <<reference>>
    }
    class R1["AbortSignal"] {
        <<reference>>
    }
    Subject ..> R0 : execute
    Subject ..> R1 : signal
```

**Figura:** `DIA-VUE-TS-CATALOGS-32-6`. Parte 6/7.

```mermaid
classDiagram
    direction TB
    class Subject["useCatalogEditor.return"] {
        <<inferred_return>>
    }
    class R0["CatalogValues"] {
        <<reference>>
    }
    class R1["ComputedRef"] {
        <<reference>>
    }
    Subject "1" --> "1" R0 : values
    Subject ..> R1 : errors
```

**Figura:** `DIA-VUE-TS-CATALOGS-32-7`. Parte 7/7.

```mermaid
classDiagram
    direction TB
    class Subject["useCatalogEditor.return"] {
        <<inferred_return>>
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

## useCatalogList.return

**Fuente:** [src/modules/catalogs/composables/useCatalogList.ts](../../../../../src/modules/catalogs/composables/useCatalogList.ts) · línea 6, columna 31. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `query` | `"query": ShallowReactive<CatalogQuery>;` |
| `rows` | `"rows": ShallowRef<CatalogEntry[], CatalogEntry[]>;` |
| `total` | `"total": Ref<number, number>;` |
| `isLoading` | `"isLoading": Ref<boolean, boolean>;` |
| `isRefreshing` | `"isRefreshing": Ref<boolean, boolean>;` |
| `error` | `"error": Ref<string, string>;` |
| `load` | `"load": () => Promise<void>;` |
| `refresh` | `"refresh": () => Promise<void>;` |
| `applyQuery` | `"applyQuery": (changes: Partial<CatalogQuery>) => void;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | `ShallowReactive` | `query` |
| dependency | [CatalogQuery](../../../../../src/modules/catalogs/catalog.ts) | `query` |
| dependency | `ShallowRef` | `rows` |
| dependency | [CatalogEntry](../../../../../src/modules/catalogs/catalog.ts) | `rows` |
| dependency | `Ref` | `total` |
| dependency | `Ref` | `isLoading` |
| dependency | `Ref` | `isRefreshing` |
| dependency | `Ref` | `error` |
| dependency | `Promise` | `load` |
| dependency | `Promise` | `refresh` |
| dependency | `Partial` | `applyQuery` |
| dependency | [CatalogQuery](../../../../../src/modules/catalogs/catalog.ts) | `applyQuery` |

**Figura:** `DIA-VUE-TS-CATALOGS-33-1`. Parte 1/6.

```mermaid
classDiagram
    direction TB
    class Subject["useCatalogList.return"] {
        <<inferred_return>>
        query: ShallowReactive~CatalogQuery~
        rows: ShallowRef~CatalogEntry[], CatalogEntry[]~
        total: Ref~number, number~
        isLoading: Ref~boolean, boolean~
        isRefreshing: Ref~boolean, boolean~
        error: Ref~string, string~
        load: callback
        refresh: callback
    }
    class R0["ShallowReactive"] {
        <<reference>>
    }
    class R1["CatalogQuery"] {
        <<reference>>
    }
    Subject ..> R0 : query
    Subject ..> R1 : query
```

**Figura:** `DIA-VUE-TS-CATALOGS-33-2`. Parte 2/6.

```mermaid
classDiagram
    direction TB
    class Subject["useCatalogList.return"] {
        <<inferred_return>>
        applyQuery: callback
    }
    class R0["ShallowRef"] {
        <<reference>>
    }
    class R1["CatalogEntry"] {
        <<reference>>
    }
    Subject ..> R0 : rows
    Subject ..> R1 : rows
```

**Figura:** `DIA-VUE-TS-CATALOGS-33-3`. Parte 3/6.

```mermaid
classDiagram
    direction TB
    class Subject["useCatalogList.return"] {
        <<inferred_return>>
    }
    class R0["Ref"] {
        <<reference>>
    }
    Subject ..> R0 : total
    Subject ..> R0 : isLoading
```

**Figura:** `DIA-VUE-TS-CATALOGS-33-4`. Parte 4/6.

```mermaid
classDiagram
    direction TB
    class Subject["useCatalogList.return"] {
        <<inferred_return>>
    }
    class R0["Ref"] {
        <<reference>>
    }
    Subject ..> R0 : isRefreshing
    Subject ..> R0 : error
```

**Figura:** `DIA-VUE-TS-CATALOGS-33-5`. Parte 5/6.

```mermaid
classDiagram
    direction TB
    class Subject["useCatalogList.return"] {
        <<inferred_return>>
    }
    class R0["Promise"] {
        <<reference>>
    }
    Subject ..> R0 : load
    Subject ..> R0 : refresh
```

**Figura:** `DIA-VUE-TS-CATALOGS-33-6`. Parte 6/6.

```mermaid
classDiagram
    direction TB
    class Subject["useCatalogList.return"] {
        <<inferred_return>>
    }
    class R0["Partial"] {
        <<reference>>
    }
    class R1["CatalogQuery"] {
        <<reference>>
    }
    Subject ..> R0 : applyQuery
    Subject ..> R1 : applyQuery
```

## catalogService

**Fuente:** [src/modules/catalogs/services/catalogService.ts](../../../../../src/modules/catalogs/services/catalogService.ts) · línea 32, columna 14. **Declaración:** inferred export.

| Miembro | Firma completa |
| --- | --- |
| `list` | `"list": (catalog: CatalogName, query: CatalogQuery, signal?: AbortSignal) => Promise<{ data: CatalogEntry[]; recordsFiltered: number; recordsTotal: number; }>;` |
| `save` | `"save": (catalog: CatalogName, target: CatalogTarget, payload: Record<string, unknown>, signal?: AbortSignal) => Promise<CatalogEntry>;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [CatalogName](../../../../../src/modules/catalogs/catalog.ts) | `list` |
| dependency | [CatalogQuery](../../../../../src/modules/catalogs/catalog.ts) | `list` |
| dependency | `AbortSignal` | `list` |
| dependency | `Promise` | `list` |
| dependency | [catalogService.list.shape1](../../../../../src/modules/catalogs/services/catalogService.ts) | `list` |
| dependency | [CatalogName](../../../../../src/modules/catalogs/catalog.ts) | `save` |
| dependency | [CatalogTarget](../../../../../src/modules/catalogs/catalog.ts) | `save` |
| dependency | `Record` | `save` |
| dependency | `AbortSignal` | `save` |
| dependency | `Promise` | `save` |
| dependency | [CatalogEntry](../../../../../src/modules/catalogs/catalog.ts) | `save` |

**Figura:** `DIA-VUE-TS-CATALOGS-34-1`. Parte 1/6.

```mermaid
classDiagram
    direction TB
    class Subject["catalogService"] {
        <<inferred_export>>
        list: callback
        save: callback
    }
    class R0["CatalogName"] {
        <<reference>>
    }
    class R1["CatalogQuery"] {
        <<reference>>
    }
    Subject ..> R0 : list
    Subject ..> R1 : list
```

**Figura:** `DIA-VUE-TS-CATALOGS-34-2`. Parte 2/6.

```mermaid
classDiagram
    direction TB
    class Subject["catalogService"] {
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

**Figura:** `DIA-VUE-TS-CATALOGS-34-3`. Parte 3/6.

```mermaid
classDiagram
    direction TB
    class Subject["catalogService"] {
        <<inferred_export>>
    }
    class R0["catalogService.list.shape1"] {
        <<reference>>
    }
    class R1["CatalogName"] {
        <<reference>>
    }
    Subject ..> R0 : list
    Subject ..> R1 : save
```

**Figura:** `DIA-VUE-TS-CATALOGS-34-4`. Parte 4/6.

```mermaid
classDiagram
    direction TB
    class Subject["catalogService"] {
        <<inferred_export>>
    }
    class R0["CatalogTarget"] {
        <<reference>>
    }
    class R1["Record"] {
        <<reference>>
    }
    Subject ..> R0 : save
    Subject ..> R1 : save
```

**Figura:** `DIA-VUE-TS-CATALOGS-34-5`. Parte 5/6.

```mermaid
classDiagram
    direction TB
    class Subject["catalogService"] {
        <<inferred_export>>
    }
    class R0["AbortSignal"] {
        <<reference>>
    }
    class R1["Promise"] {
        <<reference>>
    }
    Subject ..> R0 : save
    Subject ..> R1 : save
```

**Figura:** `DIA-VUE-TS-CATALOGS-34-6`. Parte 6/6.

```mermaid
classDiagram
    direction TB
    class Subject["catalogService"] {
        <<inferred_export>>
    }
    class R0["CatalogEntry"] {
        <<reference>>
    }
    Subject ..> R0 : save
```

## catalogService.list.shape1

**Fuente:** [src/modules/catalogs/services/catalogService.ts](../../../../../src/modules/catalogs/services/catalogService.ts) · línea 32, columna 14. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `data` | `data: CatalogEntry[];` |
| `recordsFiltered` | `recordsFiltered: number;` |
| `recordsTotal` | `recordsTotal: number;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [CatalogEntry](../../../../../src/modules/catalogs/catalog.ts) | `data` |

**Figura:** `DIA-VUE-TS-CATALOGS-35-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
    class Subject["catalogService.list.shape1"] {
        <<inferred_object>>
        data: CatalogEntry[]
        recordsFiltered: number
        recordsTotal: number
    }
    class R0["CatalogEntry"] {
        <<reference>>
    }
    Subject "1" --> "0..*" R0 : data
```
