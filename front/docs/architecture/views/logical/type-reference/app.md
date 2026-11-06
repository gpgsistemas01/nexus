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

## AppNavigation.defineEmits

**Fuente:** [src/app/components/AppNavigation.vue](../../../../../src/app/components/AppNavigation.vue) · línea 19, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `navigate` | `navigate: [];` |
| `expand` | `expand: []` |

## NavigationLink

**Fuente:** [src/app/navigation.ts](../../../../../src/app/navigation.ts) · línea 32, columna 1. **Declaración:** interface.

| Miembro | Firma completa |
| --- | --- |
| `title` | `title: string;` |
| `to` | `to: string;` |
| `icon` | `icon: string;` |

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

## AccessErrorPage.defineProps

**Fuente:** [src/app/pages/AccessErrorPage.vue](../../../../../src/app/pages/AccessErrorPage.vue) · línea 6, columna 13. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `isUnavailable` | `isUnavailable?: boolean` |

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

## DirectoryCreationPage.defineEmits

**Fuente:** [src/app/pages/DirectoryCreationPage.vue](../../../../../src/app/pages/DirectoryCreationPage.vue) · línea 10, columna 26. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `close` | `close: []` |

## InventoryWorkspace.defineProps

**Fuente:** [src/app/pages/InventoryWorkspace.vue](../../../../../src/app/pages/InventoryWorkspace.vue) · línea 10, columna 27. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `resource` | `resource: InventoryResource` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [InventoryResource](../../../../../src/modules/warehouse/inventory.ts) | `resource` |

## IssueWorkspace.defineProps

**Fuente:** [src/app/pages/IssueWorkspace.vue](../../../../../src/app/pages/IssueWorkspace.vue) · línea 10, columna 13. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `resource` | `resource: IssueResource` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [IssueResource](../../../../../src/modules/issues/issue.ts) | `resource` |

## PurchaseWorkspace.defineProps

**Fuente:** [src/app/pages/PurchaseWorkspace.vue](../../../../../src/app/pages/PurchaseWorkspace.vue) · línea 11, columna 27. **Declaración:** SFC contract.

| Miembro | Firma completa |
| --- | --- |
| `resource` | `resource: PurchaseResource` |

| Relación | Destino | Origen de la referencia |
| --- | --- | --- |
| dependency | [PurchaseResource](../../../../../src/modules/purchases/purchase.ts) | `resource` |
