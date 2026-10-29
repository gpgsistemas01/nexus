# Contratos de formularios, eventos y callbacks

## Alcance

Esta referencia define los intercambios entre formularios, contenedores y
composables: props, eventos y callbacks. Las firmas completas permanecen en los
tipos y `defineEmits` de sus fuentes; los datos HTTP se describen en el
[contrato de la API consumida](client-contracts.md).

## Props y propiedad de los datos

| Entrada de presentación | Propietario y contrato |
| --- | --- |
| `values`, `errors` y `message` | El composable del editor conserva captura y errores; el contenedor los entrega al formulario. |
| `isSubmitting`, `isPending`, `isConflicted` y capacidades del modo | El contenedor aporta los indicadores que declara cada componente. |
| Opciones remotas y selección | El control recibe `LookupState`, el ID y, cuando corresponde, una opción inicial. La consulta y la selección tienen propietarios distintos. |
| Documento, detalle y vista previa | El contenedor entrega los datos de lectura o calculados que necesita la presentación; no se convierten en una copia del request. |

Los modelos de [tipos por dominio](../views/logical/class-and-type-models/index.md)
describen los datos; el [inventario de estado](../views/logical/state-and-lifecycle.md#inventario-de-propietarios)
identifica quién los conserva y cuándo se descartan.

## Eventos de interacción

| Emisor y evento | Datos comunicados | Receptor |
| --- | --- | --- |
| Formularios: `update(field, value)` | Campo y valor tipados por el dominio. Login usa eventos separados como `update:name` y `update:password`. | El contenedor conecta el setter del composable. |
| `RemoteSelect`: `update:modelValue(value)` | ID seleccionado o cadena vacía. | El contenedor actualiza el campo correspondiente. |
| Formularios: `blur(field)`; `RemoteSelect`: `blur()` | Campo que pierde foco; el contenedor identifica el campo cuando el selector no lo aporta. | Handler de interacción del editor. |
| `RemoteSelect`: `search(value)`, `more()`, `retry()` | Búsqueda, siguiente página o repetición de carga. Algunos formularios añaden el campo o tipo de selector al reenviar el evento. | Lookup correspondiente. |
| Formularios: `submit()` | Intención de enviar la captura; no contiene una confirmación. | Método `submit` del composable. |
| Detalles de Compra/Salida: `add(line)` | `PurchaseDetail` o `IssueDetail` de la captura local. | Editor del documento; agregar no confirma el documento en la API. |
| Editores: `close()` y `reload()` | Cierre o solicitud de nueva lectura. | Contenedor que abrió el editor. |
| Catálogos, Identidad, Directorio e `IssueReturnPage`: `denied(status)` | Estado de rechazo; Inventario utiliza `unauthorized()` sin argumento. | Handler de acceso del contenedor. |
| Inventario: `addStock(target)` | `StockAdditionTarget` para sustituir el editor actual por una entrada de merma. | `InventoryPage` y su coordinador. |

Fuentes: [contratos de Login](../../../src/modules/auth/login.ts),
[RemoteSelect](../../../src/shared/components/RemoteSelect.vue),
[InventoryEditor](../../../src/modules/warehouse/components/InventoryEditor.vue),
[InventoryEditorPage](../../../src/modules/warehouse/pages/InventoryEditorPage.vue),
[PurchaseLineEntryPage](../../../src/modules/purchases/pages/PurchaseLineEntryPage.vue) e
[IssueLineEntryPage](../../../src/modules/issues/pages/IssueLineEntryPage.vue).

## Resultado de guardado por contenedor

El nombre `saved` no define un payload común a todos los módulos.

| Emisor | Firma declarada | Uso del resultado |
| --- | --- | --- |
| [CatalogEditorPage](../../../src/modules/catalogs/pages/CatalogEditorPage.vue), [PersonEditorPage](../../../src/modules/identity/pages/PersonEditorPage.vue) y [UserEditorPage](../../../src/modules/identity/pages/UserEditorPage.vue) | `saved()` | Notifica confirmación sin devolver el registro al consumidor. |
| [DirectoryEditorPage](../../../src/modules/directory/pages/DirectoryEditorPage.vue) | `saved(entry?: DirectoryEntry)` | El consumidor comprueba la entrada opcional; el alta contextual la adapta a una opción. |
| [InventoryEditorPage](../../../src/modules/warehouse/pages/InventoryEditorPage.vue) | `saved(created?: LookupItem)` | El alta de artículo desde Compra devuelve la opción; las operaciones ordinarias no requieren ese resultado. |
| [PurchaseEditorPage](../../../src/modules/purchases/pages/PurchaseEditorPage.vue) y [PurchaseCorrectionPage](../../../src/modules/purchases/pages/PurchaseCorrectionPage.vue) | `saved(confirmation: MutationConfirmation)` | El coordinador de Compras consume la confirmación. |
| [IssueEditorPage](../../../src/modules/issues/pages/IssueEditorPage.vue) e [IssueReturnPage](../../../src/modules/issues/pages/IssueReturnPage.vue) | `saved(result: MutationConfirmation)` | La devolución reenvía su resultado a través del editor de Salidas. |
| [LoginPage](../../../src/modules/auth/pages/LoginPage.vue) | Callback `onSuccess()` de `useLoginForm` | El contenedor resuelve la navegación; no utiliza un evento `saved`. |

## Callbacks de composición

| Contrato | Propietario y consumidor |
| --- | --- |
| `operation(signal)` | El editor define la operación; `useRecordSave.execute` la ejecuta con su `AbortSignal`. |
| `onSaved(result)` y `onDenied(status)` | El consumidor los proporciona al composable. El contenedor decide si los transforma en eventos Vue o llama a un handler de acceso. |
| `LookupCreation` | El formulario solicita un alta con `search` y `onCreated(item)`. El contenedor de aplicación recibe el contrato y compone el editor auxiliar. |
| `ItemCreation` | Añade `supplier: LookupItem` al contrato anterior para el artículo creado desde Compra. |
| `DirectoryCreationPage.saved(entry)` | Adapta `DirectoryEntry` a `LookupItem` antes de invocar `request.onCreated(item)`. No entrega la respuesta HTTP al selector. |

`RemoteSelect.create(search)` comunica sólo la búsqueda. El contenedor adjunta el
callback al reenviarla como `createSupplier`, `createClient` o `createItem`.
El [patrón de alta contextual](../views/development/design-and-construction-patterns/09-contextual-creation.md)
desarrolla la composición y sus alternativas.

Fuentes: [useRecordSave](../../../src/shared/composables/useRecordSave.ts),
[LookupCreation](../../../src/shared/lookup.ts),
[ItemCreation](../../../src/modules/purchases/purchase.ts) y
[DirectoryCreationPage](../../../src/app/pages/DirectoryCreationPage.vue).

## Referencias de comportamiento

| Consulta | Fuente propietaria |
| --- | --- |
| Campos editables y efectos por acción | [Modos, precondiciones y efectos](../../requirements/requirements-specification/06-operation-modes-and-effects.md). |
| Validación visible, foco y mensajes | [Estándar de interfaz](../interface-standards.md#formularios). |
| Captura, cierre, conflicto y respuesta tardía | [Ciclo de vida compartido](../views/logical/state-and-lifecycle.md) y [estados de documentos](../views/logical/states/index.md). |
| Orden de llamadas y recuperación | [Secuencias de procesos](../views/processes/index.md). |
| Preparación y evidencia de un cambio | [Revisión de cambios](../../development/04-change-review.md). |
