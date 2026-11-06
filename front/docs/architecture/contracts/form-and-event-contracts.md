# Contratos de formularios, eventos y callbacks

## Alcance

Aquí se definen props, eventos, callbacks y consultas de selectores entre formularios,
contenedores y composables. Las firmas completas están en los tipos y `defineEmits`; los
datos HTTP, en el [contrato de la API](client-contracts.md).

## Props y propiedad de los datos

| Entrada de presentación | Propietario y contrato |
| --- | --- |
| `values`, `errors` y `message` | El composable del editor conserva captura y errores; el contenedor los entrega al formulario. |
| `presentation` en la entrada de detalles | La página obtiene el nombre de la opción seleccionada con `getLookupPresentation`; el formulario lo muestra en sólo lectura y no lo envía como captura. |
| `isSubmitting`, `isPending`, `isConflicted` y capacidades del modo | El contenedor aporta los indicadores que declara cada componente. |
| `FormErrorDialog.message`, `isSubmitting` y `title` | Presentación del fallo general al terminar el envío. El aviso conserva sólo su apertura local; cerrarlo no emite `submit`, no limpia la captura ni confirma un resultado. `EditorDialog` lo compone para sus consumidores; Login lo utiliza directamente. |
| `RemoteSelect.state` y selección | `LookupState` reúne `items`, `isLoading`, `hasMore` y `error`. El ID y la opción inicial se entregan aparte; el error de validación pertenece al campo. |
| Documento, detalle y vista previa | El contenedor entrega los datos de lectura o calculados que necesita la presentación; no se convierten en una copia del request. |

Los modelos de [tipos por dominio](../views/logical/class-and-type-models/index.md)
describen los datos; el [inventario de estado](../views/logical/states/04-state-ownership-and-save.md#inventario-de-propietarios)
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
| `DocumentReadDialog`: `retry()` y `cancel()` | Reintentar o detener la lectura, sin datos de formulario. | La página conecta `actions.retry` y `actions.cancelRead`; el lector aborta e invalida respuestas anteriores. |
| Catálogos, Identidad, Directorio e `IssueReturnPage`: `denied(status)` | Estado de rechazo; Inventario utiliza `unauthorized()` sin argumento. | Handler de acceso del contenedor. |
| Inventario: `addStock(target)` | `StockAdditionTarget` para sustituir el editor actual por una entrada de merma. | `InventoryPage` y su coordinador. |

Fuentes: [contratos de Login](../../../src/modules/auth/login.ts),
[RemoteSelect](../../../src/shared/components/RemoteSelect.vue),
[InventoryEditor](../../../src/modules/warehouse/components/InventoryEditor.vue),
[InventoryEditorPage](../../../src/modules/warehouse/pages/InventoryEditorPage.vue),
[PurchaseLineEntryPage](../../../src/modules/purchases/pages/PurchaseLineEntryPage.vue) e
[IssueLineEntryPage](../../../src/modules/issues/pages/IssueLineEntryPage.vue).

Los detalles nuevos de Compra y Salida reciben un ID local de
[createUuid](../../../src/shared/utils/createUuid.ts) para identificarlos durante la
captura. Los mappers omiten esa clave al registrar los detalles; la API asigna sus
identificadores persistentes.

### Eventos del login

| Evento | Argumentos |
| --- | --- |
| `update:name` | `[name: string]`. |
| `update:password` | `[password: string]`. |
| `update:shouldRememberUser` | `[shouldRememberUser: boolean]`. |
| `blur` | `[field: LoginField]`. |
| `togglePassword` / `submit` | `[]`. |

## Resultado de guardado por contenedor

El nombre `saved` no define un payload común a todos los módulos.

| Emisor | Firma declarada | Uso del resultado |
| --- | --- | --- |
| [CatalogEditorPage](../../../src/modules/catalogs/pages/CatalogEditorPage.vue), [PersonEditorPage](../../../src/modules/identity/pages/PersonEditorPage.vue) y [UserEditorPage](../../../src/modules/identity/pages/UserEditorPage.vue) | `saved()` | Notifica confirmación sin devolver el registro al consumidor. |
| [DirectoryEditorPage](../../../src/modules/directory/pages/DirectoryEditorPage.vue) | `saved(entry?: DirectoryEntry)` | El consumidor comprueba la entrada opcional; el alta contextual la adapta a una opción. |
| [InventoryEditorPage](../../../src/modules/warehouse/pages/InventoryEditorPage.vue) | `saved(created?: LookupItem)` | El alta de artículo desde Compra devuelve la opción; las operaciones ordinarias no requieren ese resultado. |
| [PurchaseEditorPage](../../../src/modules/purchases/pages/PurchaseEditorPage.vue) y [PurchaseCorrectionPage](../../../src/modules/purchases/pages/PurchaseCorrectionPage.vue) | `saved(confirmation: MutationConfirmation)` | El coordinador de Compras consume la confirmación. |
| [IssueEditorPage](../../../src/modules/issues/pages/IssueEditorPage.vue) | `saved(result: MutationConfirmation)` / `detailSaved(result: MutationConfirmation)` | `saved` cierra el documento guardado. `detailSaved` corresponde a una devolución: refresca el listado y vuelve a leer la salida; mantiene devolución si queda saldo o abre consulta al quedar cancelada. |
| [IssueReturnPage](../../../src/modules/issues/pages/IssueReturnPage.vue) | `saved(result: MutationConfirmation)` | El editor cierra el secundario y emite `detailSaved` hacia la página de Salidas. |
| [LoginPage](../../../src/modules/auth/pages/LoginPage.vue) | Callback `onSuccess()` de `useLoginForm` | El contenedor resuelve la navegación; no utiliza un evento `saved`. |

## Callbacks de composición

| Contrato | Propietario y consumidor |
| --- | --- |
| `useRecordForm.handleSubmit(operation)` | Devuelve `submit()`: comprueba el bloqueo, valida y llama a `operation(values, signal)`. El editor aporta el mapper y el servicio; el resultado llega a `onSaved`. |
| `operation(signal)` | `useRecordSave.execute` ejecuta la operación del consumidor con su `AbortSignal`. |
| `onSaved(result)` y `onDenied(status)` | El consumidor los proporciona al composable. El contenedor decide si los transforma en eventos Vue o llama a un handler de acceso. |
| `LookupCreation` | El formulario solicita un alta con `search` y `onCreated(item)`. El contenedor de aplicación recibe el contrato y compone el editor auxiliar. |
| `ItemCreation` | Añade `supplier: LookupItem` al contrato anterior para el artículo creado desde Compra. |
| `DirectoryCreationPage.saved(entry)` | Adapta `DirectoryEntry` a `LookupItem` antes de invocar `request.onCreated(item)`. No entrega la respuesta HTTP al selector. |

`RemoteSelect.create(search)` comunica sólo la búsqueda. El contenedor adjunta el
callback al reenviarla como `createSupplier`, `createClient` o `createItem`.
El [patrón de alta contextual](../views/development/design-and-construction-patterns/09-contextual-creation.md)
desarrolla la composición y sus alternativas.

Fuentes: [useRecordForm](../../../src/shared/composables/useRecordForm.ts),
[useRecordSave](../../../src/shared/composables/useRecordSave.ts),
[LookupCreation](../../../src/shared/lookup.ts),
[ItemCreation](../../../src/modules/purchases/purchase.ts) y
[DirectoryCreationPage](../../../src/app/pages/DirectoryCreationPage.vue).

## Consultas de selectores

`useRemoteLookup` invoca `request(search, page, signal)`. El consumidor añade el
contexto del dominio y llama al servicio con `(query, signal)`. Los datos comunes
de `query` son `LookupQuery`: `search: string` y `page: number`.

| Solicitud | Contexto adicional y fuente |
| --- | --- |
| `PurchaseLookupRequest` | `kind`, `resource`, `supplierId?` y `capture?`; [purchaseLookupService](../../../src/modules/purchases/services/purchaseLookupService.ts). |
| `IssueLookupRequest` | `kind`, `resource` y `filters?` para condiciones de personas; [issueLookupService](../../../src/modules/issues/services/issueLookupService.ts). |
| `InventoryLookupRequest` | `path` y `supplierId?`; [inventoryCatalogService](../../../src/modules/warehouse/services/inventoryCatalogService.ts). |
| `OrganizationLookupRequest` | `resource` (`departments` o `roles`); [organizationService](../../../src/shared/services/organizationService.ts). |

El servicio convierte la página a `start`/`length` y devuelve
`PageResult<LookupItem>`. La cancelación no forma parte de los datos enviados a
la API. La captura conserva el ID seleccionado; `LookupState` contiene sólo el
estado visual del selector.

## Referencias de comportamiento

| Consulta | Fuente propietaria |
| --- | --- |
| Campos editables y efectos por acción | [Modos, precondiciones y efectos](../../requirements/requirements-specification/06-operation-modes-and-effects.md). |
| Validación visible, foco y mensajes | [Estándar de interfaz](../interface-standards.md#formularios). |
| Captura, cierre, conflicto y respuesta tardía | [Ciclo de vida compartido](../views/logical/states/04-state-ownership-and-save.md) y [estados de documentos](../views/logical/states/index.md). |
| Orden de llamadas y recuperación | [Secuencias de procesos](../views/processes/index.md). |
| Preparación y evidencia de un cambio | [Revisión de cambios](../../development/04-change-review.md). |
