# Contratos TypeScript: directory

Generado con `npm run docs:generate`. No editar manualmente.

[Alcance y notación](index.md#alcance-y-notación).

## DirectoryForm.defineProps

**Fuente:** [src/modules/directory/components/DirectoryForm.vue](../../../../../src/modules/directory/components/DirectoryForm.vue) · línea 7, columna 13. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `resource` | `resource: DirectoryResource;` |
| `title` | `title: string;` |
| `values` | `values: DirectoryValues;` |
| `errors` | `errors: Partial<Record<DirectoryField, string>>;` |
| `message` | `message: string;` |
| `isSubmitting` | `isSubmitting: boolean;` |
| `isConflicted` | `isConflicted: boolean;` |
| `isEditing` | `isEditing: boolean;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [DirectoryResource](../../../../../src/modules/directory/directory.ts) | `resource` |
| association | [DirectoryValues](../../../../../src/modules/directory/directory.ts) | `values` |
| dependency | [DirectoryField](../../../../../src/modules/directory/directory.ts) | `errors` |

**Figura:** `DIA-VUE-TS-DIRECTORY-1-1`.

```mermaid
classDiagram
    direction LR
    class Subject["DirectoryForm.defineProps"] {
        <<SFC_contract>>
        resource: DirectoryResource
        title: string
        values: DirectoryValues
        errors: Partial~Record~DirectoryField, string~~
        message: string
        isSubmitting: boolean
        isConflicted: boolean
        isEditing: boolean
    }
    class R0["DirectoryResource"] {
        <<reference>>
    }
    class R1["DirectoryValues"] {
        <<reference>>
    }
    class R2["DirectoryField"] {
        <<reference>>
    }
    Subject ..> R0 : resource
    Subject --> "1" R1 : values
    Subject ..> R2 : errors
```

## DirectoryForm.defineEmits

**Fuente:** [src/modules/directory/components/DirectoryForm.vue](../../../../../src/modules/directory/components/DirectoryForm.vue) · línea 17, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `update` | `update: [field: DirectoryField, value: string \| boolean];` |
| `blur` | `blur: [field: DirectoryField];` |
| `submit` | `submit: [];` |
| `close` | `close: [];` |
| `reload` | `reload: [];` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [DirectoryField](../../../../../src/modules/directory/directory.ts) | `update` |
| dependency | [DirectoryField](../../../../../src/modules/directory/directory.ts) | `blur` |

**Figura:** `DIA-VUE-TS-DIRECTORY-2-1`.

```mermaid
classDiagram
    direction LR
    class Subject["DirectoryForm.defineEmits"] {
        <<SFC_contract>>
        update: tuple
        blur: tuple
        submit: tuple
        close: tuple
        reload: tuple
    }
    class R0["DirectoryField"] {
        <<reference>>
    }
    Subject ..> R0 : update
    Subject ..> R0 : blur
```

## DirectoryTable.defineProps

**Fuente:** [src/modules/directory/components/DirectoryTable.vue](../../../../../src/modules/directory/components/DirectoryTable.vue) · línea 11, columna 27. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `resource` | `resource: DirectoryResource;` |
| `rows` | `rows: DirectoryEntry[];` |
| `query` | `query: RecordQuery;` |
| `total` | `total: number;` |
| `isLoading` | `isLoading: boolean;` |
| `canEdit` | `canEdit: boolean;` |
| `canSeeState` | `canSeeState: boolean;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [DirectoryResource](../../../../../src/modules/directory/directory.ts) | `resource` |
| association | [DirectoryEntry](../../../../../src/modules/directory/directory.ts) | `rows` |
| association | [RecordQuery](../../../../../src/shared/list.ts) | `query` |

**Figura:** `DIA-VUE-TS-DIRECTORY-3-1`.

```mermaid
classDiagram
    direction LR
    class Subject["DirectoryTable.defineProps"] {
        <<SFC_contract>>
        resource: DirectoryResource
        rows: DirectoryEntry[]
        query: RecordQuery
        total: number
        isLoading: boolean
        canEdit: boolean
        canSeeState: boolean
    }
    class R0["DirectoryResource"] {
        <<reference>>
    }
    class R1["DirectoryEntry"] {
        <<reference>>
    }
    class R2["RecordQuery"] {
        <<reference>>
    }
    Subject ..> R0 : resource
    Subject --> "0..*" R1 : rows
    Subject --> "1" R2 : query
```

## DirectoryTable.defineEmits

**Fuente:** [src/modules/directory/components/DirectoryTable.vue](../../../../../src/modules/directory/components/DirectoryTable.vue) · línea 20, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `edit` | `edit: [row: DirectoryEntry];` |
| `query` | `query: [changes: Partial<RecordQuery>]` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [DirectoryEntry](../../../../../src/modules/directory/directory.ts) | `edit` |
| dependency | [RecordQuery](../../../../../src/shared/list.ts) | `query` |

**Figura:** `DIA-VUE-TS-DIRECTORY-4-1`.

```mermaid
classDiagram
    direction LR
    class Subject["DirectoryTable.defineEmits"] {
        <<SFC_contract>>
        edit: tuple
        query: tuple
    }
    class R0["DirectoryEntry"] {
        <<reference>>
    }
    class R1["RecordQuery"] {
        <<reference>>
    }
    Subject ..> R0 : edit
    Subject ..> R1 : query
```

## useDirectoryEditor.options@15:45

**Fuente:** [src/modules/directory/composables/useDirectoryEditor.ts](../../../../../src/modules/directory/composables/useDirectoryEditor.ts) · línea 15, columna 45. **Declaración:** inline object.

| Miembro | Firma completa |
| --- | --- |
| `resource` | `resource: DirectoryResource;` |
| `target` | `target: DirectoryTarget;` |
| `onSaved` | `onSaved: (entry?: DirectoryEntry) => void;` |
| `onDenied` | `onDenied: (status: number) => void;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [DirectoryResource](../../../../../src/modules/directory/directory.ts) | `resource` |
| dependency | [DirectoryTarget](../../../../../src/modules/directory/directory.ts) | `target` |
| dependency | [DirectoryEntry](../../../../../src/modules/directory/directory.ts) | `onSaved` |

**Figura:** `DIA-VUE-TS-DIRECTORY-5-1`.

```mermaid
classDiagram
    direction LR
    class Subject["useDirectoryEditor.<br/>options@15:45"] {
        <<inline_object>>
        resource: DirectoryResource
        target: DirectoryTarget
        onSaved: callback
        onDenied: callback
    }
    class R0["DirectoryResource"] {
        <<reference>>
    }
    class R1["DirectoryTarget"] {
        <<reference>>
    }
    class R2["DirectoryEntry"] {
        <<reference>>
    }
    Subject ..> R0 : resource
    Subject ..> R1 : target
    Subject ..> R2 : onSaved
```

## DirectoryResource

**Fuente:** [src/modules/directory/directory.ts](../../../../../src/modules/directory/directory.ts) · línea 3, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
'clients' | 'suppliers'
```

## DirectoryValues

**Fuente:** [src/modules/directory/directory.ts](../../../../../src/modules/directory/directory.ts) · línea 4, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `name` | `name: string;` |
| `legalName` | `legalName: string;` |
| `tradeName` | `tradeName: string;` |
| `isActive` | `isActive: boolean;` |

**Figura:** `DIA-VUE-TS-DIRECTORY-7-1`.

```mermaid
classDiagram
    direction LR
    class Subject["DirectoryValues"] {
        <<interface>>
        name: string
        legalName: string
        tradeName: string
        isActive: boolean
    }
```

## DirectoryEntry

**Fuente:** [src/modules/directory/directory.ts](../../../../../src/modules/directory/directory.ts) · línea 10, columna 1. **Declaración:** interface.

**Extensión/implementación:** `extends DirectoryValues`.

| Miembro | Firma completa |
| --- | --- |
| `id` | `id: string;` |
| `version` | `version: number;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| inheritance | [DirectoryValues](../../../../../src/modules/directory/directory.ts) | `extends` |

**Figura:** `DIA-VUE-TS-DIRECTORY-8-1`.

```mermaid
classDiagram
    direction LR
    class Subject["DirectoryEntry"] {
        <<interface>>
        id: string
        version: number
    }
    class R0["DirectoryValues"] {
        <<reference>>
    }
    R0 <|-- Subject : extends
```

## DirectoryTarget

**Fuente:** [src/modules/directory/directory.ts](../../../../../src/modules/directory/directory.ts) · línea 14, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
{ action: 'create'; initialName?: string } | { action: 'edit'; row: DirectoryEntry }
```

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [DirectoryTarget@15:5](../../../../../src/modules/directory/directory.ts) | `type` |
| dependency | [DirectoryTarget@15:50](../../../../../src/modules/directory/directory.ts) | `type` |

**Figura:** `DIA-VUE-TS-DIRECTORY-9-1`.

```mermaid
classDiagram
    direction LR
    class Subject["DirectoryTarget"] {
        <<type>>
    }
    class R0["DirectoryTarget@15:5"] {
        <<reference>>
    }
    class R1["DirectoryTarget@15:50"] {
        <<reference>>
    }
    Subject ..> R0 : type
    Subject ..> R1 : type
```

## DirectoryTarget@15:5

**Fuente:** [src/modules/directory/directory.ts](../../../../../src/modules/directory/directory.ts) · línea 15, columna 5. **Declaración:** inline object.

| Miembro | Firma completa |
| --- | --- |
| `action` | `action: 'create';` |
| `initialName` | `initialName?: string` |

**Figura:** `DIA-VUE-TS-DIRECTORY-10-1`.

```mermaid
classDiagram
    direction LR
    class Subject["DirectoryTarget@15:5"] {
        <<inline_object>>
        action: 'create'
        initialName?: string
    }
```

## DirectoryTarget@15:50

**Fuente:** [src/modules/directory/directory.ts](../../../../../src/modules/directory/directory.ts) · línea 15, columna 50. **Declaración:** inline object.

| Miembro | Firma completa |
| --- | --- |
| `action` | `action: 'edit';` |
| `row` | `row: DirectoryEntry` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [DirectoryEntry](../../../../../src/modules/directory/directory.ts) | `row` |

**Figura:** `DIA-VUE-TS-DIRECTORY-11-1`.

```mermaid
classDiagram
    direction LR
    class Subject["DirectoryTarget@15:50"] {
        <<inline_object>>
        action: 'edit'
        row: DirectoryEntry
    }
    class R0["DirectoryEntry"] {
        <<reference>>
    }
    Subject --> "1" R0 : row
```

## DirectoryField

**Fuente:** [src/modules/directory/directory.ts](../../../../../src/modules/directory/directory.ts) · línea 16, columna 1. **Declaración:** type.

**Definición completa:**

```typescript
keyof DirectoryValues
```

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [DirectoryValues](../../../../../src/modules/directory/directory.ts) | `type` |

**Figura:** `DIA-VUE-TS-DIRECTORY-12-1`.

```mermaid
classDiagram
    direction LR
    class Subject["DirectoryField"] {
        <<type>>
    }
    class R0["DirectoryValues"] {
        <<reference>>
    }
    Subject ..> R0 : type
```

## DirectoryEditorPage.defineProps

**Fuente:** [src/modules/directory/pages/DirectoryEditorPage.vue](../../../../../src/modules/directory/pages/DirectoryEditorPage.vue) · línea 7, columna 27. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `resource` | `resource: DirectoryResource;` |
| `target` | `target: DirectoryTarget` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [DirectoryResource](../../../../../src/modules/directory/directory.ts) | `resource` |
| dependency | [DirectoryTarget](../../../../../src/modules/directory/directory.ts) | `target` |

**Figura:** `DIA-VUE-TS-DIRECTORY-13-1`.

```mermaid
classDiagram
    direction LR
    class Subject["DirectoryEditorPage.<br/>defineProps"] {
        <<SFC_contract>>
        resource: DirectoryResource
        target: DirectoryTarget
    }
    class R0["DirectoryResource"] {
        <<reference>>
    }
    class R1["DirectoryTarget"] {
        <<reference>>
    }
    Subject ..> R0 : resource
    Subject ..> R1 : target
```

## DirectoryEditorPage.defineEmits

**Fuente:** [src/modules/directory/pages/DirectoryEditorPage.vue](../../../../../src/modules/directory/pages/DirectoryEditorPage.vue) · línea 8, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `saved` | `saved: [entry?: DirectoryEntry];` |
| `close` | `close: [];` |
| `reload` | `reload: [];` |
| `denied` | `denied: [status: number];` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [DirectoryEntry](../../../../../src/modules/directory/directory.ts) | `saved` |

**Figura:** `DIA-VUE-TS-DIRECTORY-14-1`.

```mermaid
classDiagram
    direction LR
    class Subject["DirectoryEditorPage.<br/>defineEmits"] {
        <<SFC_contract>>
        saved: tuple
        close: tuple
        reload: tuple
        denied: tuple
    }
    class R0["DirectoryEntry"] {
        <<reference>>
    }
    Subject ..> R0 : saved
```

## DirectoryPage.defineProps

**Fuente:** [src/modules/directory/pages/DirectoryPage.vue](../../../../../src/modules/directory/pages/DirectoryPage.vue) · línea 20, columna 27. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `resource` | `resource: DirectoryResource` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [DirectoryResource](../../../../../src/modules/directory/directory.ts) | `resource` |

**Figura:** `DIA-VUE-TS-DIRECTORY-15-1`.

```mermaid
classDiagram
    direction LR
    class Subject["DirectoryPage.defineProps"] {
        <<SFC_contract>>
        resource: DirectoryResource
    }
    class R0["DirectoryResource"] {
        <<reference>>
    }
    Subject ..> R0 : resource
```

## useDirectoryEditor.return

**Fuente:** [src/modules/directory/composables/useDirectoryEditor.ts](../../../../../src/modules/directory/composables/useDirectoryEditor.ts) · línea 15, columna 35. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `submit` | `"submit": () => Promise<Promise<void> \| undefined> \| undefined;` |
| `update` | `"update": (field: keyof DirectoryValues, value: string \| boolean) => void;` |
| `blur` | `"blur": (field: keyof DirectoryValues) => Promise<unknown> \| undefined;` |
| `message` | `"message": Ref<string, string>;` |
| `isSubmitting` | `"isSubmitting": Ref<boolean, boolean>;` |
| `isConflicted` | `"isConflicted": Ref<boolean, boolean>;` |
| `execute` | `"execute": (operation: (signal: AbortSignal) => Promise<unknown>) => Promise<void>;` |
| `signal` | `"signal": AbortSignal;` |
| `isDisposed` | `"isDisposed": () => boolean;` |
| `values` | `"values": DirectoryValues;` |
| `errors` | `"errors": ComputedRef<Partial<Record<"" \| "name" \| "isActive" \| "legalName" \| "tradeName", string \| undefined>>>;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [DirectoryValues](../../../../../src/modules/directory/directory.ts) | `update` |
| dependency | [DirectoryValues](../../../../../src/modules/directory/directory.ts) | `blur` |
| association | [DirectoryValues](../../../../../src/modules/directory/directory.ts) | `values` |

**Figura:** `DIA-VUE-TS-DIRECTORY-16-1`.

```mermaid
classDiagram
    direction LR
    class Subject["useDirectoryEditor.return"] {
        <<inferred_return>>
        submit: callback
        update: callback
        blur: callback
        message: Ref~string, string~
        isSubmitting: Ref~boolean, boolean~
        isConflicted: Ref~boolean, boolean~
        execute: callback
        signal: AbortSignal
        isDisposed: callback
        values: DirectoryValues
        errors: complex
    }
    class R0["DirectoryValues"] {
        <<reference>>
    }
    Subject ..> R0 : update
    Subject ..> R0 : blur
    Subject --> "1" R0 : values
```

## DIRECTORY_CONFIG

**Fuente:** [src/modules/directory/directory.ts](../../../../../src/modules/directory/directory.ts) · línea 18, columna 14. **Declaración:** inferred export.

| Miembro | Firma completa |
| --- | --- |
| `clients` | `"clients": { readonly title: "Clientes"; readonly singular: "cliente"; readonly createLabel: "Nuevo cliente"; readonly read: "clients:read"; readonly create: "clients:create"; readonly update: "clients:update"; readonly report: "client:reports-read"; readonly path: "/api/sales/clients"; readonly reportPath: "/api/sales/reports/clients/excel"; };` |
| `suppliers` | `"suppliers": { readonly title: "Proveedores"; readonly singular: "proveedor"; readonly createLabel: "Nuevo proveedor"; readonly read: "suppliers:read"; readonly create: "suppliers:manage"; readonly update: "suppliers:update"; readonly report: "supplier:reports-read"; readonly path: "/api/warehouse/suppliers"; readonly reportPath: "/api/warehouse/reports/suppliers/excel"; };` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [DIRECTORY_CONFIG.clients.shape1](../../../../../src/modules/directory/directory.ts) | `clients` |
| association | [DIRECTORY_CONFIG.suppliers.shape2](../../../../../src/modules/directory/directory.ts) | `suppliers` |

**Figura:** `DIA-VUE-TS-DIRECTORY-17-1`.

```mermaid
classDiagram
    direction LR
    class Subject["DIRECTORY_CONFIG"] {
        <<inferred_export>>
        clients: object
        suppliers: object
    }
    class R0["DIRECTORY_CONFIG.clients.<br/>shape1"] {
        <<reference>>
    }
    class R1["DIRECTORY_CONFIG.suppliers.<br/>shape2"] {
        <<reference>>
    }
    Subject --> "1" R0 : clients
    Subject --> "1" R1 : suppliers
```

## DIRECTORY_CONFIG.clients.shape1

**Fuente:** [src/modules/directory/directory.ts](../../../../../src/modules/directory/directory.ts) · línea 18, columna 14. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `title` | `readonly title: "Clientes";` |
| `singular` | `readonly singular: "cliente";` |
| `createLabel` | `readonly createLabel: "Nuevo cliente";` |
| `read` | `readonly read: "clients:read";` |
| `create` | `readonly create: "clients:create";` |
| `update` | `readonly update: "clients:update";` |
| `report` | `readonly report: "client:reports-read";` |
| `path` | `readonly path: "/api/sales/clients";` |
| `reportPath` | `readonly reportPath: "/api/sales/reports/clients/excel";` |

**Figura:** `DIA-VUE-TS-DIRECTORY-18-1`.

```mermaid
classDiagram
    direction LR
    class Subject["DIRECTORY_CONFIG.clients.<br/>shape1"] {
        <<inferred_object>>
        title: "Clientes"
        singular: "cliente"
        createLabel: "Nuevo cliente"
        read: "clients:read"
        create: "clients:create"
        update: "clients:update"
        report: "client:reports-read"
        path: "/api/sales/clients"
        reportPath: "/api/sales/reports/clients/excel"
    }
```

## DIRECTORY_CONFIG.suppliers.shape2

**Fuente:** [src/modules/directory/directory.ts](../../../../../src/modules/directory/directory.ts) · línea 18, columna 14. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `title` | `readonly title: "Proveedores";` |
| `singular` | `readonly singular: "proveedor";` |
| `createLabel` | `readonly createLabel: "Nuevo proveedor";` |
| `read` | `readonly read: "suppliers:read";` |
| `create` | `readonly create: "suppliers:manage";` |
| `update` | `readonly update: "suppliers:update";` |
| `report` | `readonly report: "supplier:reports-read";` |
| `path` | `readonly path: "/api/warehouse/suppliers";` |
| `reportPath` | `readonly reportPath: "/api/warehouse/reports/suppliers/excel";` |

**Figura:** `DIA-VUE-TS-DIRECTORY-19-1`.

```mermaid
classDiagram
    direction LR
    class Subject["DIRECTORY_CONFIG.suppliers.<br/>shape2"] {
        <<inferred_object>>
        title: "Proveedores"
        singular: "proveedor"
        createLabel: "Nuevo proveedor"
        read: "suppliers:read"
        create: "suppliers:manage"
        update: "suppliers:update"
        report: "supplier:reports-read"
        path: "/api/warehouse/suppliers"
        reportPath: "/api/warehouse/reports/suppliers/excel"
    }
```

## directoryPayload.return.variant1

**Fuente:** [src/modules/directory/directory.ts](../../../../../src/modules/directory/directory.ts) · línea 43, columna 33. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `expectedVersion` | `"expectedVersion"?: number \| undefined;` |
| `isActive` | `"isActive": boolean;` |
| `name` | `"name": string;` |

**Figura:** `DIA-VUE-TS-DIRECTORY-20-1`.

```mermaid
classDiagram
    direction LR
    class Subject["directoryPayload.return.<br/>variant1"] {
        <<inferred_return>>
        expectedVersion?: number | undefined
        isActive: boolean
        name: string
    }
```

## directoryPayload.return.variant2

**Fuente:** [src/modules/directory/directory.ts](../../../../../src/modules/directory/directory.ts) · línea 43, columna 33. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `expectedVersion` | `"expectedVersion"?: number \| undefined;` |
| `isActive` | `"isActive": boolean;` |
| `legalName` | `"legalName": string;` |
| `tradeName` | `"tradeName": string;` |

**Figura:** `DIA-VUE-TS-DIRECTORY-21-1`.

```mermaid
classDiagram
    direction LR
    class Subject["directoryPayload.return.<br/>variant2"] {
        <<inferred_return>>
        expectedVersion?: number | undefined
        isActive: boolean
        legalName: string
        tradeName: string
    }
```

## directoryService

**Fuente:** [src/modules/directory/services/directoryService.ts](../../../../../src/modules/directory/services/directoryService.ts) · línea 40, columna 14. **Declaración:** inferred export.

| Miembro | Firma completa |
| --- | --- |
| `list` | `"list": (resource: DirectoryResource, query: RecordQuery, signal?: AbortSignal) => Promise<{ data: DirectoryEntry[]; recordsFiltered: number; recordsTotal: number; }>;` |
| `save` | `"save": (resource: DirectoryResource, target: DirectoryTarget, payload: Record<string, unknown>, signal: AbortSignal) => Promise<DirectoryEntry>;` |
| `export` | `"export": (resource: DirectoryResource, query: RecordQuery, signal: AbortSignal) => Promise<Blob>;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [DirectoryResource](../../../../../src/modules/directory/directory.ts) | `list` |
| dependency | [RecordQuery](../../../../../src/shared/list.ts) | `list` |
| dependency | [directoryService.list.shape1](../../../../../src/modules/directory/services/directoryService.ts) | `list` |
| dependency | [DirectoryResource](../../../../../src/modules/directory/directory.ts) | `save` |
| dependency | [DirectoryTarget](../../../../../src/modules/directory/directory.ts) | `save` |
| dependency | [DirectoryEntry](../../../../../src/modules/directory/directory.ts) | `save` |
| dependency | [DirectoryResource](../../../../../src/modules/directory/directory.ts) | `export` |
| dependency | [RecordQuery](../../../../../src/shared/list.ts) | `export` |

**Figura:** `DIA-VUE-TS-DIRECTORY-22-1`. Parte 1/2.

```mermaid
classDiagram
    direction LR
    class Subject["directoryService"] {
        <<inferred_export>>
        list: callback
        save: callback
        export: callback
    }
    class R0["DirectoryResource"] {
        <<reference>>
    }
    class R1["RecordQuery"] {
        <<reference>>
    }
    class R2["directoryService.list.shape1"] {
        <<reference>>
    }
    class R3["DirectoryTarget"] {
        <<reference>>
    }
    Subject ..> R0 : list
    Subject ..> R1 : list
    Subject ..> R2 : list
    Subject ..> R0 : save
    Subject ..> R3 : save
    Subject ..> R0 : export
    Subject ..> R1 : export
```

**Figura:** `DIA-VUE-TS-DIRECTORY-22-2`. Parte 2/2.

```mermaid
classDiagram
    direction LR
    class Subject["directoryService"] {
        <<inferred_export>>
        save: callback
    }
    class R0["DirectoryEntry"] {
        <<reference>>
    }
    Subject ..> R0 : save
```

## directoryService.list.shape1

**Fuente:** [src/modules/directory/services/directoryService.ts](../../../../../src/modules/directory/services/directoryService.ts) · línea 40, columna 14. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `data` | `data: DirectoryEntry[];` |
| `recordsFiltered` | `recordsFiltered: number;` |
| `recordsTotal` | `recordsTotal: number;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [DirectoryEntry](../../../../../src/modules/directory/directory.ts) | `data` |

**Figura:** `DIA-VUE-TS-DIRECTORY-23-1`.

```mermaid
classDiagram
    direction LR
    class Subject["directoryService.list.shape1"] {
        <<inferred_object>>
        data: DirectoryEntry[]
        recordsFiltered: number
        recordsTotal: number
    }
    class R0["DirectoryEntry"] {
        <<reference>>
    }
    Subject --> "0..*" R0 : data
```
