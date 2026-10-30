# Contratos TypeScript: app

Generado con `npm run docs:generate`. No editar manualmente.

[Alcance y notación](index.md#alcance-y-notación).

## AppNavigation.defineProps

**Fuente:** [src/app/components/AppNavigation.vue](../../../../../src/app/components/AppNavigation.vue) · línea 12, columna 27. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `userName` | `userName: string;` |
| `groups` | `groups: readonly NavigationGroup[];` |
| `activeGroup` | `activeGroup: string;` |
| `isCompact` | `isCompact: boolean;` |
| `isTemporary` | `isTemporary: boolean;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| association | [NavigationGroup](../../../../../src/app/navigation.ts) | `groups` |

**Figura:** `DIA-VUE-TS-APP-1-1`.

```mermaid
classDiagram
    direction LR
    class Subject["AppNavigation.defineProps"] {
        <<SFC_contract>>
        userName: string
        groups: readonly NavigationGroup[]
        activeGroup: string
        isCompact: boolean
        isTemporary: boolean
    }
    class R0["NavigationGroup"] {
        <<reference>>
    }
    Subject --> "0..*" R0 : groups
```

## AppNavigation.defineEmits

**Fuente:** [src/app/components/AppNavigation.vue](../../../../../src/app/components/AppNavigation.vue) · línea 19, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `navigate` | `navigate: [];` |
| `expand` | `expand: []` |

**Figura:** `DIA-VUE-TS-APP-2-1`.

```mermaid
classDiagram
    direction LR
    class Subject["AppNavigation.defineEmits"] {
        <<SFC_contract>>
        navigate: tuple
        expand: tuple
    }
```

## NavigationLink

**Fuente:** [src/app/navigation.ts](../../../../../src/app/navigation.ts) · línea 32, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `title` | `title: string;` |
| `to` | `to: string;` |
| `icon` | `icon: string;` |

**Figura:** `DIA-VUE-TS-APP-3-1`.

```mermaid
classDiagram
    direction LR
    class Subject["NavigationLink"] {
        <<interface>>
        title: string
        to: string
        icon: string
    }
```

## NavigationGroup

**Fuente:** [src/app/navigation.ts](../../../../../src/app/navigation.ts) · línea 38, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `id` | `id: string;` |
| `title` | `title: string;` |
| `icon` | `icon: string;` |
| `links` | `links: readonly (NavigationLink & { permission: string })[];` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [NavigationLink](../../../../../src/app/navigation.ts) | `links` |
| dependency | [NavigationGroup.links@42:39](../../../../../src/app/navigation.ts) | `links` |

**Figura:** `DIA-VUE-TS-APP-4-1`.

```mermaid
classDiagram
    direction LR
    class Subject["NavigationGroup"] {
        <<interface>>
        id: string
        title: string
        icon: string
        links: object
    }
    class R0["NavigationLink"] {
        <<reference>>
    }
    class R1["NavigationGroup.links@42:39"] {
        <<reference>>
    }
    Subject ..> R0 : links
    Subject ..> R1 : links
```

## NavigationGroup.links@42:39

**Fuente:** [src/app/navigation.ts](../../../../../src/app/navigation.ts) · línea 42, columna 39. **Declaración:** inline object.

| Miembro | Firma completa |
| --- | --- |
| `permission` | `permission: string` |

**Figura:** `DIA-VUE-TS-APP-5-1`.

```mermaid
classDiagram
    direction LR
    class Subject["NavigationGroup.links@42:39"] {
        <<inline_object>>
        permission: string
    }
```

## AccessErrorPage.defineProps

**Fuente:** [src/app/pages/AccessErrorPage.vue](../../../../../src/app/pages/AccessErrorPage.vue) · línea 6, columna 13. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `isUnavailable` | `isUnavailable?: boolean` |

**Figura:** `DIA-VUE-TS-APP-6-1`.

```mermaid
classDiagram
    direction LR
    class Subject["AccessErrorPage.defineProps"] {
        <<SFC_contract>>
        isUnavailable?: boolean
    }
```

## DirectoryCreationPage.defineProps

**Fuente:** [src/app/pages/DirectoryCreationPage.vue](../../../../../src/app/pages/DirectoryCreationPage.vue) · línea 9, columna 27. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `resource` | `resource: DirectoryResource;` |
| `request` | `request: LookupCreation` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [DirectoryResource](../../../../../src/modules/directory/directory.ts) | `resource` |
| association | [LookupCreation](../../../../../src/shared/lookup.ts) | `request` |

**Figura:** `DIA-VUE-TS-APP-7-1`.

```mermaid
classDiagram
    direction LR
    class Subject["DirectoryCreationPage.<br/>defineProps"] {
        <<SFC_contract>>
        resource: DirectoryResource
        request: LookupCreation
    }
    class R0["DirectoryResource"] {
        <<reference>>
    }
    class R1["LookupCreation"] {
        <<reference>>
    }
    Subject ..> R0 : resource
    Subject --> "1" R1 : request
```

## DirectoryCreationPage.defineEmits

**Fuente:** [src/app/pages/DirectoryCreationPage.vue](../../../../../src/app/pages/DirectoryCreationPage.vue) · línea 10, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `close` | `close: []` |

**Figura:** `DIA-VUE-TS-APP-8-1`.

```mermaid
classDiagram
    direction LR
    class Subject["DirectoryCreationPage.<br/>defineEmits"] {
        <<SFC_contract>>
        close: tuple
    }
```

## InventoryWorkspace.defineProps

**Fuente:** [src/app/pages/InventoryWorkspace.vue](../../../../../src/app/pages/InventoryWorkspace.vue) · línea 10, columna 27. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `resource` | `resource: InventoryResource` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [InventoryResource](../../../../../src/modules/warehouse/inventory.ts) | `resource` |

**Figura:** `DIA-VUE-TS-APP-9-1`.

```mermaid
classDiagram
    direction LR
    class Subject["InventoryWorkspace.<br/>defineProps"] {
        <<SFC_contract>>
        resource: InventoryResource
    }
    class R0["InventoryResource"] {
        <<reference>>
    }
    Subject ..> R0 : resource
```

## IssueWorkspace.defineProps

**Fuente:** [src/app/pages/IssueWorkspace.vue](../../../../../src/app/pages/IssueWorkspace.vue) · línea 10, columna 13. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `resource` | `resource: IssueResource` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [IssueResource](../../../../../src/modules/issues/issue.ts) | `resource` |

**Figura:** `DIA-VUE-TS-APP-10-1`.

```mermaid
classDiagram
    direction LR
    class Subject["IssueWorkspace.defineProps"] {
        <<SFC_contract>>
        resource: IssueResource
    }
    class R0["IssueResource"] {
        <<reference>>
    }
    Subject ..> R0 : resource
```

## PurchaseWorkspace.defineProps

**Fuente:** [src/app/pages/PurchaseWorkspace.vue](../../../../../src/app/pages/PurchaseWorkspace.vue) · línea 11, columna 27. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `resource` | `resource: PurchaseResource` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [PurchaseResource](../../../../../src/modules/purchases/purchase.ts) | `resource` |

**Figura:** `DIA-VUE-TS-APP-11-1`.

```mermaid
classDiagram
    direction LR
    class Subject["PurchaseWorkspace.<br/>defineProps"] {
        <<SFC_contract>>
        resource: PurchaseResource
    }
    class R0["PurchaseResource"] {
        <<reference>>
    }
    Subject ..> R0 : resource
```

## auxiliary@14:6

**Fuente:** [src/app/pages/PurchaseWorkspace.vue](../../../../../src/app/pages/PurchaseWorkspace.vue) · línea 14, columna 6. **Declaración:** inline object.

| Miembro | Firma completa |
| --- | --- |
| `kind` | `kind: 'supplier'` |

**Figura:** `DIA-VUE-TS-APP-12-1`.

```mermaid
classDiagram
    direction LR
    class Subject["auxiliary@14:6"] {
        <<inline_object>>
        kind: 'supplier'
    }
```

## auxiliary@14:48

**Fuente:** [src/app/pages/PurchaseWorkspace.vue](../../../../../src/app/pages/PurchaseWorkspace.vue) · línea 14, columna 48. **Declaración:** inline object.

| Miembro | Firma completa |
| --- | --- |
| `kind` | `kind: 'item'` |

**Figura:** `DIA-VUE-TS-APP-13-1`.

```mermaid
classDiagram
    direction LR
    class Subject["auxiliary@14:48"] {
        <<inline_object>>
        kind: 'item'
    }
```

## usePageAccess.return

**Fuente:** [src/app/composables/usePageAccess.ts](../../../../../src/app/composables/usePageAccess.ts) · línea 6, columna 30. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `session` | `"session": { user: Readonly<Ref<{ readonly id: string; readonly name: string; readonly permissions: readonly string[]; } \| null, { readonly id: string; readonly name: string; readonly permissions: readonly string[]; } \| null>>; load: () => Promise<SessionUser>; };` |
| `has` | `"has": (permission: string) => boolean;` |
| `onDenied` | `"onDenied": (status: number) => void;` |
| `onError` | `"onError": (cause: unknown) => void;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [usePageAccess.return.session.shape1](../../../../../src/app/composables/usePageAccess.ts) | `session` |

**Figura:** `DIA-VUE-TS-APP-14-1`.

```mermaid
classDiagram
    direction LR
    class Subject["usePageAccess.return"] {
        <<inferred_return>>
        session: callback
        has: callback
        onDenied: callback
        onError: callback
    }
    class R0["usePageAccess.return.session.<br/>shape1"] {
        <<reference>>
    }
    Subject ..> R0 : session
```

## usePageAccess.return.session.shape1

**Fuente:** [src/app/composables/usePageAccess.ts](../../../../../src/app/composables/usePageAccess.ts) · línea 6, columna 30. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `user` | `user: Readonly<Ref<{ readonly id: string; readonly name: string; readonly permissions: readonly string[]; } \| null, { readonly id: string; readonly name: string; readonly permissions: readonly string[]; } \| null>>;` |
| `load` | `load: () => Promise<SessionUser>;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [usePageAccess.return.session.user.shape2](../../../../../src/app/composables/usePageAccess.ts) | `user` |
| dependency | [usePageAccess.return.session.user.shape3](../../../../../src/app/composables/usePageAccess.ts) | `user` |

**Figura:** `DIA-VUE-TS-APP-15-1`.

```mermaid
classDiagram
    direction LR
    class Subject["usePageAccess.return.session.<br/>shape1"] {
        <<inferred_object>>
        user: object
        load: callback
    }
    class R0["usePageAccess.return.session.<br/>user.shape2"] {
        <<reference>>
    }
    class R1["usePageAccess.return.session.<br/>user.shape3"] {
        <<reference>>
    }
    Subject ..> R0 : user
    Subject ..> R1 : user
```

## usePageAccess.return.session.user.shape2

**Fuente:** [src/app/composables/usePageAccess.ts](../../../../../src/app/composables/usePageAccess.ts) · línea 6, columna 30. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `id` | `readonly id: string;` |
| `name` | `readonly name: string;` |
| `permissions` | `readonly permissions: readonly string[];` |

**Figura:** `DIA-VUE-TS-APP-16-1`.

```mermaid
classDiagram
    direction LR
    class Subject["usePageAccess.return.session.<br/>user.shape2"] {
        <<inferred_object>>
        id: string
        name: string
        permissions: readonly string[]
    }
```

## usePageAccess.return.session.user.shape3

**Fuente:** [src/app/composables/usePageAccess.ts](../../../../../src/app/composables/usePageAccess.ts) · línea 6, columna 30. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `id` | `readonly id: string;` |
| `name` | `readonly name: string;` |
| `permissions` | `readonly permissions: readonly string[];` |

**Figura:** `DIA-VUE-TS-APP-17-1`.

```mermaid
classDiagram
    direction LR
    class Subject["usePageAccess.return.session.<br/>user.shape3"] {
        <<inferred_object>>
        id: string
        name: string
        permissions: readonly string[]
    }
```

## APP_ICONS

**Fuente:** [src/app/icons.ts](../../../../../src/app/icons.ts) · línea 26, columna 14. **Declaración:** inferred export.

| Miembro | Firma completa |
| --- | --- |
| `issues` | `"issues": string;` |
| `warehouse` | `"warehouse": string;` |
| `purchases` | `"purchases": string;` |
| `movements` | `"movements": string;` |
| `materials` | `"materials": string;` |
| `consumables` | `"consumables": string;` |
| `wastes` | `"wastes": string;` |
| `catalogs` | `"catalogs": string;` |
| `departments` | `"departments": string;` |
| `roles` | `"roles": string;` |
| `presentations` | `"presentations": string;` |
| `unit-measures` | `"unit-measures": string;` |
| `reasons` | `"reasons": string;` |
| `fulfillment-statuses` | `"fulfillment-statuses": string;` |
| `identity` | `"identity": string;` |
| `persons` | `"persons": string;` |
| `users` | `"users": string;` |
| `directory` | `"directory": string;` |
| `clients` | `"clients": string;` |
| `suppliers` | `"suppliers": string;` |
| `logout` | `"logout": string;` |

**Figura:** `DIA-VUE-TS-APP-18-1`. Parte 1/2.

```mermaid
classDiagram
    direction LR
    class Subject["APP_ICONS"] {
        <<inferred_export>>
        issues: string
        warehouse: string
        purchases: string
        movements: string
        materials: string
        consumables: string
        wastes: string
        catalogs: string
        departments: string
        roles: string
        presentations: string
        unit-measures: string
        reasons: string
        fulfillment-statuses: string
        identity: string
        persons: string
    }
```

**Figura:** `DIA-VUE-TS-APP-18-2`. Parte 2/2.

```mermaid
classDiagram
    direction LR
    class Subject["APP_ICONS"] {
        <<inferred_export>>
        users: string
        directory: string
        clients: string
        suppliers: string
        logout: string
    }
```

## createAppRouter.return

**Fuente:** [src/app/router/index.ts](../../../../../src/app/router/index.ts) · línea 13, columna 32. **Declaración:** inferred return.

| Miembro | Firma completa |
| --- | --- |
| `options` | `"options": RouterOptions;` |
| `addRoute` | `"addRoute": { (parentName: NonNullable<RouteRecordNameGeneric>, route: RouteRecordRaw): () => void; (route: RouteRecordRaw): () => void; };` |
| `removeRoute` | `"removeRoute": (name: NonNullable<RouteRecordNameGeneric>) => void;` |
| `clearRoutes` | `"clearRoutes": () => void;` |
| `currentRoute` | `"currentRoute": ShallowRef<RouteLocationNormalizedLoadedGeneric>;` |
| `listening` | `"listening": boolean;` |
| `hasRoute` | `"hasRoute": (name: NonNullable<RouteRecordNameGeneric>) => boolean;` |
| `getRoutes` | `"getRoutes": () => RouteRecordNormalized[];` |
| `resolve` | `"resolve": { <Name extends keyof RouteMap = string \| symbol>(to: RouteLocationAsRelativeTyped<RouteMap, Name>, currentLocation?: RouteLocationNormalizedLoaded): RouteLocationResolved<Name>; (to: RouteLocationAsString \| RouteLocationAsRelative \| RouteLocationAsPath, currentLocation?: RouteLocationNormalizedLoaded): RouteLocationResolved; };` |
| `push` | `"push": (to: RouteLocationRaw) => Promise<NavigationFailure \| void \| undefined>;` |
| `replace` | `"replace": (to: RouteLocationRaw) => Promise<NavigationFailure \| void \| undefined>;` |
| `back` | `"back": () => void;` |
| `forward` | `"forward": () => void;` |
| `go` | `"go": (delta: number) => void;` |
| `beforeEach` | `"beforeEach": (guard: NavigationGuardWithThis<undefined>) => () => void;` |
| `beforeResolve` | `"beforeResolve": (guard: _NavigationGuardResolved) => () => void;` |
| `afterEach` | `"afterEach": (guard: NavigationHookAfter) => () => void;` |
| `onError` | `"onError": (handler: _ErrorListener) => () => void;` |
| `isReady` | `"isReady": () => Promise<void>;` |
| `install` | `"install": (app: App) => void;` |
| `__@LOADER_ENTRIES_KEY@8831` | `"__@LOADER_ENTRIES_KEY@8831": _DefineLoaderEntryMap<DataLoaderEntryBase<unknown, unknown, unknown>>;` |
| `__@PENDING_LOCATION_KEY@8833` | `"__@PENDING_LOCATION_KEY@8833": RouteLocationNormalizedLoadedGeneric \| null;` |
| `__@APP_KEY@8835` | `"__@APP_KEY@8835": App<unknown>;` |
| `__@IS_SSR_KEY@8837` | `"__@IS_SSR_KEY@8837": boolean;` |
| `__@DATA_LOADERS_EFFECT_SCOPE_KEY@8839` | `"__@DATA_LOADERS_EFFECT_SCOPE_KEY@8839": EffectScope;` |
| `__@SERVER_INITIAL_DATA_KEY@8841` | `"__@SERVER_INITIAL_DATA_KEY@8841"?: false \| Record<string, unknown> \| undefined;` |
| `__@INITIAL_DATA_KEY@8843` | `"__@INITIAL_DATA_KEY@8843"?: false \| Record<string, unknown> \| undefined;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [createAppRouter.return.addRoute.shape1](../../../../../src/app/router/index.ts) | `addRoute` |
| association | [createAppRouter.return.resolve.shape2](../../../../../src/app/router/index.ts) | `resolve` |

**Figura:** `DIA-VUE-TS-APP-19-1`. Parte 1/2.

```mermaid
classDiagram
    direction LR
    class Subject["createAppRouter.return"] {
        <<inferred_return>>
        options: RouterOptions
        addRoute: callback
        removeRoute: callback
        clearRoutes: callback
        currentRoute: complex
        listening: boolean
        hasRoute: callback
        getRoutes: callback
        resolve: object
        push: callback
        replace: callback
        back: callback
        forward: callback
        go: callback
        beforeEach: callback
        beforeResolve: callback
    }
    class R0["createAppRouter.return.<br/>addRoute.shape1"] {
        <<reference>>
    }
    class R1["createAppRouter.return.<br/>resolve.shape2"] {
        <<reference>>
    }
    Subject ..> R0 : addRoute
    Subject --> "1" R1 : resolve
```

**Figura:** `DIA-VUE-TS-APP-19-2`. Parte 2/2.

```mermaid
classDiagram
    direction LR
    class Subject["createAppRouter.return"] {
        <<inferred_return>>
        afterEach: callback
        onError: callback
        isReady: callback
        install: callback
        __@LOADER_ENTRIES_KEY@8831: complex
        __@PENDING_LOCATION_KEY@8833: RouteLocationNormalizedLoadedGeneric | null
        __@APP_KEY@8835: App~unknown~
        __@IS_SSR_KEY@8837: boolean
        __@DATA_LOADERS_EFFECT_SCOPE_KEY@8839: EffectScope
        __@SERVER_INITIAL_DATA_KEY@8841?: false | Record~string, unknown~ | undefined
        __@INITIAL_DATA_KEY@8843?: false | Record~string, unknown~ | undefined
    }
```

## createAppRouter.return.addRoute.shape1

**Fuente:** [src/app/router/index.ts](../../../../../src/app/router/index.ts) · línea 13, columna 32. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `signature` | `(parentName: NonNullable<RouteRecordNameGeneric>, route: RouteRecordRaw): () => void;` |
| `signature` | `(route: RouteRecordRaw): () => void;` |

**Figura:** `DIA-VUE-TS-APP-20-1`.

```mermaid
classDiagram
    direction LR
    class Subject["createAppRouter.return.<br/>addRoute.shape1"] {
        <<inferred_object>>
        signature: callback
        signature: callback
    }
```

## createAppRouter.return.resolve.shape2

**Fuente:** [src/app/router/index.ts](../../../../../src/app/router/index.ts) · línea 13, columna 32. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `signature` | `<Name extends keyof RouteMap = string \| symbol>(to: RouteLocationAsRelativeTyped<RouteMap, Name>, currentLocation?: RouteLocationNormalizedLoaded): RouteLocationResolved<Name>;` |
| `signature` | `(to: RouteLocationAsString \| RouteLocationAsRelative \| RouteLocationAsPath, currentLocation?: RouteLocationNormalizedLoaded): RouteLocationResolved;` |

**Figura:** `DIA-VUE-TS-APP-21-1`.

```mermaid
classDiagram
    direction LR
    class Subject["createAppRouter.return.<br/>resolve.shape2"] {
        <<inferred_object>>
        signature: RouteLocationResolved~Name~
        signature: RouteLocationResolved
    }
```
