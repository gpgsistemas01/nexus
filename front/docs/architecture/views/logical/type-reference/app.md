# Contratos TypeScript: app

Generado con `npm run docs:generate`. No editar manualmente.

Cada figura incluye hasta ocho miembros y dos relaciones; las partes reúnen el contrato completo.
Los destinos sin atributos son referencias: su definición completa aparece en su propia ficha.
Los objetos inline declarados muestran contexto, línea y columna. Las formas inferidas usan shapeN dentro del contrato padre; su fuente apunta al export o función original. No son clases instanciadas.

[Lectura y cobertura](index.md).

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

**Figura:** `DIA-VUE-TS-APP-1-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
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
    Subject "1" --> "0..*" R0 : groups
```

## AppNavigation.defineEmits

**Fuente:** [src/app/components/AppNavigation.vue](../../../../../src/app/components/AppNavigation.vue) · línea 19, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `navigate` | `navigate: [];` |
| `expand` | `expand: []` |

**Figura:** `DIA-VUE-TS-APP-2-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
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

**Figura:** `DIA-VUE-TS-APP-3-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
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

**Figura:** `DIA-VUE-TS-APP-4-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
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

**Figura:** `DIA-VUE-TS-APP-5-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
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

**Figura:** `DIA-VUE-TS-APP-6-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
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

**Figura:** `DIA-VUE-TS-APP-7-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
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
    Subject "1" --> "1" R1 : request
```

## DirectoryCreationPage.defineEmits

**Fuente:** [src/app/pages/DirectoryCreationPage.vue](../../../../../src/app/pages/DirectoryCreationPage.vue) · línea 10, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `close` | `close: []` |

**Figura:** `DIA-VUE-TS-APP-8-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
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

**Figura:** `DIA-VUE-TS-APP-9-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
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

**Figura:** `DIA-VUE-TS-APP-10-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
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

**Figura:** `DIA-VUE-TS-APP-11-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
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

**Figura:** `DIA-VUE-TS-APP-12-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
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

**Figura:** `DIA-VUE-TS-APP-13-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
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

**Figura:** `DIA-VUE-TS-APP-14-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
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
| dependency | `Readonly` | `user` |
| dependency | `Ref` | `user` |
| dependency | [usePageAccess.return.session.user.shape2](../../../../../src/app/composables/usePageAccess.ts) | `user` |
| dependency | [usePageAccess.return.session.user.shape3](../../../../../src/app/composables/usePageAccess.ts) | `user` |
| dependency | `Promise` | `load` |
| dependency | `SessionUser` | `load` |

**Figura:** `DIA-VUE-TS-APP-15-1`. Parte 1/3.

```mermaid
classDiagram
    direction TB
    class Subject["usePageAccess.return.session.<br/>shape1"] {
        <<inferred_object>>
        user: object
        load: callback
    }
    class R0["Readonly"] {
        <<reference>>
    }
    class R1["Ref"] {
        <<reference>>
    }
    Subject ..> R0 : user
    Subject ..> R1 : user
```

**Figura:** `DIA-VUE-TS-APP-15-2`. Parte 2/3.

```mermaid
classDiagram
    direction TB
    class Subject["usePageAccess.return.session.<br/>shape1"] {
        <<inferred_object>>
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

**Figura:** `DIA-VUE-TS-APP-15-3`. Parte 3/3.

```mermaid
classDiagram
    direction TB
    class Subject["usePageAccess.return.session.<br/>shape1"] {
        <<inferred_object>>
    }
    class R0["Promise"] {
        <<reference>>
    }
    class R1["SessionUser"] {
        <<reference>>
    }
    Subject ..> R0 : load
    Subject ..> R1 : load
```

## usePageAccess.return.session.user.shape2

**Fuente:** [src/app/composables/usePageAccess.ts](../../../../../src/app/composables/usePageAccess.ts) · línea 6, columna 30. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `id` | `readonly id: string;` |
| `name` | `readonly name: string;` |
| `permissions` | `readonly permissions: readonly string[];` |

**Figura:** `DIA-VUE-TS-APP-16-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
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

**Figura:** `DIA-VUE-TS-APP-17-1`. Parte 1/1.

```mermaid
classDiagram
    direction TB
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

**Figura:** `DIA-VUE-TS-APP-18-1`. Parte 1/3.

```mermaid
classDiagram
    direction TB
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
    }
```

**Figura:** `DIA-VUE-TS-APP-18-2`. Parte 2/3.

```mermaid
classDiagram
    direction TB
    class Subject["APP_ICONS"] {
        <<inferred_export>>
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

**Figura:** `DIA-VUE-TS-APP-18-3`. Parte 3/3.

```mermaid
classDiagram
    direction TB
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
| dependency | `RouterOptions` | `options` |
| dependency | [createAppRouter.return.addRoute.shape1](../../../../../src/app/router/index.ts) | `addRoute` |
| dependency | `NonNullable` | `removeRoute` |
| dependency | `RouteRecordNameGeneric` | `removeRoute` |
| dependency | `ShallowRef` | `currentRoute` |
| dependency | `RouteLocationNormalizedLoadedGeneric` | `currentRoute` |
| dependency | `NonNullable` | `hasRoute` |
| dependency | `RouteRecordNameGeneric` | `hasRoute` |
| dependency | `RouteRecordNormalized` | `getRoutes` |
| association | [createAppRouter.return.resolve.shape2](../../../../../src/app/router/index.ts) | `resolve` |
| dependency | `RouteLocationRaw` | `push` |
| dependency | `Promise` | `push` |
| dependency | `NavigationFailure` | `push` |
| dependency | `RouteLocationRaw` | `replace` |
| dependency | `Promise` | `replace` |
| dependency | `NavigationFailure` | `replace` |
| dependency | `NavigationGuardWithThis` | `beforeEach` |
| dependency | `_NavigationGuardResolved` | `beforeResolve` |
| dependency | `NavigationHookAfter` | `afterEach` |
| dependency | `_ErrorListener` | `onError` |
| dependency | `Promise` | `isReady` |
| dependency | `App` | `install` |
| dependency | `_DefineLoaderEntryMap` | `__@LOADER_ENTRIES_KEY@8831` |
| dependency | `DataLoaderEntryBase` | `__@LOADER_ENTRIES_KEY@8831` |
| dependency | `RouteLocationNormalizedLoadedGeneric` | `__@PENDING_LOCATION_KEY@8833` |
| dependency | `App` | `__@APP_KEY@8835` |
| dependency | `EffectScope` | `__@DATA_LOADERS_EFFECT_SCOPE_KEY@8839` |
| dependency | `Record` | `__@SERVER_INITIAL_DATA_KEY@8841` |
| dependency | `Record` | `__@INITIAL_DATA_KEY@8843` |

**Figura:** `DIA-VUE-TS-APP-19-1`. Parte 1/15.

```mermaid
classDiagram
    direction TB
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
    }
    class R0["RouterOptions"] {
        <<reference>>
    }
    class R1["createAppRouter.return.<br/>addRoute.shape1"] {
        <<reference>>
    }
    Subject ..> R0 : options
    Subject ..> R1 : addRoute
```

**Figura:** `DIA-VUE-TS-APP-19-2`. Parte 2/15.

```mermaid
classDiagram
    direction TB
    class Subject["createAppRouter.return"] {
        <<inferred_return>>
        resolve: object
        push: callback
        replace: callback
        back: callback
        forward: callback
        go: callback
        beforeEach: callback
        beforeResolve: callback
    }
    class R0["NonNullable"] {
        <<reference>>
    }
    class R1["RouteRecordNameGeneric"] {
        <<reference>>
    }
    Subject ..> R0 : removeRoute
    Subject ..> R1 : removeRoute
```

**Figura:** `DIA-VUE-TS-APP-19-3`. Parte 3/15.

```mermaid
classDiagram
    direction TB
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
    }
    class R0["ShallowRef"] {
        <<reference>>
    }
    class R1["RouteLocationNormalizedLoade<br/>dGeneric"] {
        <<reference>>
    }
    Subject ..> R0 : currentRoute
    Subject ..> R1 : currentRoute
```

**Figura:** `DIA-VUE-TS-APP-19-4`. Parte 4/15.

```mermaid
classDiagram
    direction TB
    class Subject["createAppRouter.return"] {
        <<inferred_return>>
        __@DATA_LOADERS_EFFECT_SCOPE_KEY@8839: EffectScope
        __@SERVER_INITIAL_DATA_KEY@8841?: false | Record~string, unknown~ | undefined
        __@INITIAL_DATA_KEY@8843?: false | Record~string, unknown~ | undefined
    }
    class R0["NonNullable"] {
        <<reference>>
    }
    class R1["RouteRecordNameGeneric"] {
        <<reference>>
    }
    Subject ..> R0 : hasRoute
    Subject ..> R1 : hasRoute
```

**Figura:** `DIA-VUE-TS-APP-19-5`. Parte 5/15.

```mermaid
classDiagram
    direction TB
    class Subject["createAppRouter.return"] {
        <<inferred_return>>
    }
    class R0["RouteRecordNormalized"] {
        <<reference>>
    }
    class R1["createAppRouter.return.<br/>resolve.shape2"] {
        <<reference>>
    }
    Subject ..> R0 : getRoutes
    Subject "1" --> "1" R1 : resolve
```

**Figura:** `DIA-VUE-TS-APP-19-6`. Parte 6/15.

```mermaid
classDiagram
    direction TB
    class Subject["createAppRouter.return"] {
        <<inferred_return>>
    }
    class R0["RouteLocationRaw"] {
        <<reference>>
    }
    class R1["Promise"] {
        <<reference>>
    }
    Subject ..> R0 : push
    Subject ..> R1 : push
```

**Figura:** `DIA-VUE-TS-APP-19-7`. Parte 7/15.

```mermaid
classDiagram
    direction TB
    class Subject["createAppRouter.return"] {
        <<inferred_return>>
    }
    class R0["NavigationFailure"] {
        <<reference>>
    }
    class R1["RouteLocationRaw"] {
        <<reference>>
    }
    Subject ..> R0 : push
    Subject ..> R1 : replace
```

**Figura:** `DIA-VUE-TS-APP-19-8`. Parte 8/15.

```mermaid
classDiagram
    direction TB
    class Subject["createAppRouter.return"] {
        <<inferred_return>>
    }
    class R0["Promise"] {
        <<reference>>
    }
    class R1["NavigationFailure"] {
        <<reference>>
    }
    Subject ..> R0 : replace
    Subject ..> R1 : replace
```

**Figura:** `DIA-VUE-TS-APP-19-9`. Parte 9/15.

```mermaid
classDiagram
    direction TB
    class Subject["createAppRouter.return"] {
        <<inferred_return>>
    }
    class R0["NavigationGuardWithThis"] {
        <<reference>>
    }
    class R1["_NavigationGuardResolved"] {
        <<reference>>
    }
    Subject ..> R0 : beforeEach
    Subject ..> R1 : beforeResolve
```

**Figura:** `DIA-VUE-TS-APP-19-10`. Parte 10/15.

```mermaid
classDiagram
    direction TB
    class Subject["createAppRouter.return"] {
        <<inferred_return>>
    }
    class R0["NavigationHookAfter"] {
        <<reference>>
    }
    class R1["_ErrorListener"] {
        <<reference>>
    }
    Subject ..> R0 : afterEach
    Subject ..> R1 : onError
```

**Figura:** `DIA-VUE-TS-APP-19-11`. Parte 11/15.

```mermaid
classDiagram
    direction TB
    class Subject["createAppRouter.return"] {
        <<inferred_return>>
    }
    class R0["Promise"] {
        <<reference>>
    }
    class R1["App"] {
        <<reference>>
    }
    Subject ..> R0 : isReady
    Subject ..> R1 : install
```

**Figura:** `DIA-VUE-TS-APP-19-12`. Parte 12/15.

```mermaid
classDiagram
    direction TB
    class Subject["createAppRouter.return"] {
        <<inferred_return>>
    }
    class R0["_DefineLoaderEntryMap"] {
        <<reference>>
    }
    class R1["DataLoaderEntryBase"] {
        <<reference>>
    }
    Subject ..> R0 : __@LOADER_ENTRIES_KEY@8831
    Subject ..> R1 : __@LOADER_ENTRIES_KEY@8831
```

**Figura:** `DIA-VUE-TS-APP-19-13`. Parte 13/15.

```mermaid
classDiagram
    direction TB
    class Subject["createAppRouter.return"] {
        <<inferred_return>>
    }
    class R0["RouteLocationNormalizedLoade<br/>dGeneric"] {
        <<reference>>
    }
    class R1["App"] {
        <<reference>>
    }
    Subject ..> R0 : __@PENDING_LOCATION_KEY@8833
    Subject ..> R1 : __@APP_KEY@8835
```

**Figura:** `DIA-VUE-TS-APP-19-14`. Parte 14/15.

```mermaid
classDiagram
    direction TB
    class Subject["createAppRouter.return"] {
        <<inferred_return>>
    }
    class R0["EffectScope"] {
        <<reference>>
    }
    class R1["Record"] {
        <<reference>>
    }
    Subject ..> R0 : __@DATA_LOADERS_EFFECT_SCOPE_KEY@8839
    Subject ..> R1 : __@SERVER_INITIAL_DATA_KEY@8841
```

**Figura:** `DIA-VUE-TS-APP-19-15`. Parte 15/15.

```mermaid
classDiagram
    direction TB
    class Subject["createAppRouter.return"] {
        <<inferred_return>>
    }
    class R0["Record"] {
        <<reference>>
    }
    Subject ..> R0 : __@INITIAL_DATA_KEY@8843
```

## createAppRouter.return.addRoute.shape1

**Fuente:** [src/app/router/index.ts](../../../../../src/app/router/index.ts) · línea 13, columna 32. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `signature` | `(parentName: NonNullable<RouteRecordNameGeneric>, route: RouteRecordRaw): () => void;` |
| `signature` | `(route: RouteRecordRaw): () => void;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | `NonNullable` | `signature.parentName` |
| dependency | `RouteRecordNameGeneric` | `signature.parentName` |
| dependency | `RouteRecordRaw` | `signature.route` |

**Figura:** `DIA-VUE-TS-APP-20-1`. Parte 1/2.

```mermaid
classDiagram
    direction TB
    class Subject["createAppRouter.return.<br/>addRoute.shape1"] {
        <<inferred_object>>
        signature: callback
        signature: callback
    }
    class R0["NonNullable"] {
        <<reference>>
    }
    class R1["RouteRecordNameGeneric"] {
        <<reference>>
    }
    Subject ..> R0 : signature.parentName
    Subject ..> R1 : signature.parentName
```

**Figura:** `DIA-VUE-TS-APP-20-2`. Parte 2/2.

```mermaid
classDiagram
    direction TB
    class Subject["createAppRouter.return.<br/>addRoute.shape1"] {
        <<inferred_object>>
    }
    class R0["RouteRecordRaw"] {
        <<reference>>
    }
    Subject ..> R0 : signature.route
```

## createAppRouter.return.resolve.shape2

**Fuente:** [src/app/router/index.ts](../../../../../src/app/router/index.ts) · línea 13, columna 32. **Declaración:** inferred object.

| Miembro | Firma completa |
| --- | --- |
| `signature` | `<Name extends keyof RouteMap = string \| symbol>(to: RouteLocationAsRelativeTyped<RouteMap, Name>, currentLocation?: RouteLocationNormalizedLoaded): RouteLocationResolved<Name>;` |
| `signature` | `(to: RouteLocationAsString \| RouteLocationAsRelative \| RouteLocationAsPath, currentLocation?: RouteLocationNormalizedLoaded): RouteLocationResolved;` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | `RouteLocationResolved` | `signature` |
| dependency | `Name` | `signature` |
| dependency | `RouteLocationAsRelativeTyped` | `signature.to` |
| dependency | `RouteMap` | `signature.to` |
| dependency | `Name` | `signature.to` |
| dependency | `RouteLocationNormalizedLoaded` | `signature.currentLocation` |
| dependency | `RouteLocationAsString` | `signature.to` |
| dependency | `RouteLocationAsRelative` | `signature.to` |
| dependency | `RouteLocationAsPath` | `signature.to` |

**Figura:** `DIA-VUE-TS-APP-21-1`. Parte 1/5.

```mermaid
classDiagram
    direction TB
    class Subject["createAppRouter.return.<br/>resolve.shape2"] {
        <<inferred_object>>
        signature: RouteLocationResolved~Name~
        signature: RouteLocationResolved
    }
    class R0["RouteLocationResolved"] {
        <<reference>>
    }
    class R1["Name"] {
        <<reference>>
    }
    Subject ..> R0 : signature
    Subject ..> R1 : signature
```

**Figura:** `DIA-VUE-TS-APP-21-2`. Parte 2/5.

```mermaid
classDiagram
    direction TB
    class Subject["createAppRouter.return.<br/>resolve.shape2"] {
        <<inferred_object>>
    }
    class R0["RouteLocationAsRelativeTyped"] {
        <<reference>>
    }
    class R1["RouteMap"] {
        <<reference>>
    }
    Subject ..> R0 : signature.to
    Subject ..> R1 : signature.to
```

**Figura:** `DIA-VUE-TS-APP-21-3`. Parte 3/5.

```mermaid
classDiagram
    direction TB
    class Subject["createAppRouter.return.<br/>resolve.shape2"] {
        <<inferred_object>>
    }
    class R0["Name"] {
        <<reference>>
    }
    class R1["RouteLocationNormalizedLoade<br/>d"] {
        <<reference>>
    }
    Subject ..> R0 : signature.to
    Subject ..> R1 : signature.currentLocation
```

**Figura:** `DIA-VUE-TS-APP-21-4`. Parte 4/5.

```mermaid
classDiagram
    direction TB
    class Subject["createAppRouter.return.<br/>resolve.shape2"] {
        <<inferred_object>>
    }
    class R0["RouteLocationAsString"] {
        <<reference>>
    }
    class R1["RouteLocationAsRelative"] {
        <<reference>>
    }
    Subject ..> R0 : signature.to
    Subject ..> R1 : signature.to
```

**Figura:** `DIA-VUE-TS-APP-21-5`. Parte 5/5.

```mermaid
classDiagram
    direction TB
    class Subject["createAppRouter.return.<br/>resolve.shape2"] {
        <<inferred_object>>
    }
    class R0["RouteLocationAsPath"] {
        <<reference>>
    }
    Subject ..> R0 : signature.to
```
