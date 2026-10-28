# 8. Contratos de captura, eventos y recuperación

## Alcance y fuentes

Esta referencia reúne las diferencias que un desarrollador necesita al conectar una
pantalla Vue: qué dato se captura, qué se recibe sólo para consulta, qué evento comunica
una intención y qué sucede al confirmar, rechazar o cerrar. Los modelos de
[tipos](../../logical/class-and-type-models/index.md) describen estructuras; los
[procesos](../../processes/index.md), el orden de las operaciones.

## Captura y datos de consulta

| Familia | Captura admitida | Datos leídos o derivados |
| --- | --- | --- |
| Login | `name` y `password`; recordar nombre es una preferencia local. | Identidad, permisos y cookies proceden de la sesión. |
| Catálogos | `name`, `isActive`; `symbol` sólo para unidad de medida. | `id` y `version` vienen del registro leído. |
| Personas | `fullName` y responsabilidades `departmentId`/`roleId`; una por área y al menos una. | Nombres de área/rol son etiquetas para la UI; el payload conserva IDs. |
| Usuarios | Nombre, área/rol y contraseña en alta; contraseña en su acción específica. | La edición de datos conserva el vínculo de persona; no vuelve a enviar la contraseña. |
| Clientes/proveedores | Cliente: nombre/estado. Proveedor: razón social, nombre comercial/estado. | ID/versión y etiquetas de consulta; sin teléfono en estos formularios. |
| Documentos | Encabezado y partidas admitidas por modo. | Folio, estados, totales y saldos proceden de la API; la vista previa no los convierte en autoridad de escritura. |

Fuentes: [login.ts](../../../../../src/modules/auth/login.ts),
[catalog.ts](../../../../../src/modules/catalogs/catalog.ts),
[identity.ts](../../../../../src/modules/identity/identity.ts),
[directory.ts](../../../../../src/modules/directory/directory.ts) y mappers de cada recurso.

## Modos de inventario

| Contexto/acción | Editable | Consulta, dependencia o exclusión |
| --- | --- | --- |
| Material/consumible `create` | Identidad, proveedor, presentación, unidad, mínimos, costo/estado y `newStock` inicial admitidos. | Consumible no captura dimensiones; Material aplica las medidas según unidad. El motivo inicial es fijo. |
| Merma `create` | Proveedor/plantilla, nombre, medidas, `initialQuantity` y pesos aplicables, mínimos, costo y estado. | Plantilla depende del proveedor; presentación/unidad provienen de ella. Peso neto y largo estimado son derivados. |
| `edit` | Nombre, mínimo, costo y estado admitidos por recurso. | Identidad de proveedor/presentación/unidad, medidas y stock no se cambian con el guardado de metadatos. |
| `stock` | `newStock`, motivo y observaciones. | Nuevo stock es el saldo total deseado; conserva la lectura/versiones de la operación. |
| Merma `add-stock` | Cantidad a agregar y observaciones. | Suma a la merma identificada; conserva su identidad y pesos. Reintenta con el mismo cuerpo e `operationId` cuando el resultado es incierto. |
| Artículo desde Compra | Alta con proveedor fijado y búsqueda precargada. | `creationContext=goodsReceipt` omite la captura inicial de stock/costo; la recepción pertenece a la compra. |

La configuración efectiva está en [inventorySections](../../../../../src/modules/warehouse/formFields.ts)
y [formModel](../../../../../src/modules/warehouse/formModel.ts); la operación selecciona
campos mediante [inventoryMapper](../../../../../src/modules/warehouse/mappers/inventoryMapper.ts).
Un campo visible de consulta no amplía el payload. Un costo ausente sigue siendo ausente;
cero requiere una captura válida y no sirve para ocultar una respuesta incompleta.

## Modos de documentos

| Modo | Compras | Salidas |
| --- | --- | --- |
| Alta | Proveedor, receptor, fecha, comprobante/factura condicional, observaciones y partidas nuevas. | Cliente, asesor, área, solicitante, proyecto, fecha, observaciones y detalles del recurso. |
| Edición completa | Proveedor del documento fijo; encabezado admitido y nuevas partidas. Las persistidas se corrigen/cancelan por otra acción. | Sólo cuando el documento es editable y su cumplimiento está pendiente; conserva las protecciones de los detalles leídos. |
| Encabezado | Forma parte de la edición admitida. | `header`: no envía detalles. Se resuelve sobre el documento leído cuando su cumplimiento permite sólo este alcance. |
| Consulta | `view`: no presenta guardado general; permite acciones de detalle si estado/permiso lo admiten. | `view`: no guarda. Una petición de edición sin gestión o sobre un estado no editable resuelve consulta. |
| Surtido | No aplica. | `supply`: documento editable con cumplimiento pendiente/parcial; sólo detalles elegidos y cantidad convertida de proyecto. |
| Devolución | No aplica. | `return`: permiso y cumplimiento completo; formulario propio con cantidad positiva hasta el saldo leído y observaciones. |
| Corrección/cancelación | Acción de detalle con IDs de compra y partida; confirma antes de escribir. | El editor general no ofrece esas acciones de compra. |

Fuentes: [purchaseForm](../../../../../src/modules/purchases/purchaseForm.ts),
[purchaseRequestMapper](../../../../../src/modules/purchases/mappers/purchaseRequestMapper.ts),
[issueForm](../../../../../src/modules/issues/issueForm.ts),
[issueRules](../../../../../src/modules/issues/issueRules.ts) e
[issueRequestMapper](../../../../../src/modules/issues/mappers/issueRequestMapper.ts).
Las fechas se presentan en la zona del sistema y los mappers construyen el instante UTC.

La edición de catálogos, identidades, directorio e inventario conserva sus metadatos de
versión. Los contratos actuales de Compra/Salida utilizan ID, modo y estado del documento;
sus mappers no añaden `expectedVersion`. La API decide pertenencia, permiso y estado vigente. La detección de lectura obsoleta
mediante versión sólo se atribuye a las operaciones que envían ese metadato.

## Props, eventos y callbacks

| Contrato | Qué comunica | Consumidor responsable |
| --- | --- | --- |
| Props del formulario | Valores, errores, modo y capacidades de interacción. | Contenedor/composable conserva el estado; presentación emite intención. |
| `update` o `update:modelValue` | Campo/valor o ID seleccionado, según el componente. | Actualiza captura mediante el contrato tipado; no envía HTTP. |
| `blur` | Salida del campo. | `useFormInteraction` valida si se editó o ya hubo intento de envío. La precarga no publica errores. |
| `search`, `more`, `retry` | Buscar opciones, cargar página o repetir carga fallida. | Lookup del recurso; el ID seleccionado permanece separado de sus páginas. |
| `create` / `createSupplier` / `createClient` | Intención de alta contextual; el contenedor adjunta búsqueda y callback. | Workspace comprueba acceso y compone el editor auxiliar. |
| `saved` | Resultado confirmado del contrato específico. | Página/Workspace cierra, recarga o adapta el registro a `LookupItem`; no interpreta todo `saved` como el mismo payload. |
| `close` / `reload` | Cerrar captura o solicitar una lectura nueva. | Contenedor conserva el ciclo del editor; cerrar sin guardar no equivale a éxito. |

Ejemplos de fuente: [RemoteSelect](../../../../../src/shared/components/RemoteSelect.vue),
[InventoryEditorPage](../../../../../src/modules/warehouse/pages/InventoryEditorPage.vue),
[IssueEditor](../../../../../src/modules/issues/components/IssueEditor.vue) y
[DirectoryCreationPage](../../../../../src/app/pages/DirectoryCreationPage.vue).
`LookupCreation.onCreated(item)` es un callback recibido; `emit('saved', result)` es
un evento Vue. `useRecordSave` ejecuta `operation(signal)` definida por el editor y
notifica `onSaved(result)` sólo al confirmar con consumidor vigente.

## Ciclo de vida y recuperación

| Momento/condición | Efecto observable |
| --- | --- |
| Abrir | Crea captura por instancia; en documentos, lee antes de resolver el modo. `editorKey` fuerza una instancia nueva en los coordinadores de documentos. |
| Precargar/enfocar | Sin errores iniciales; los campos se definen con validación programática controlada. |
| Enviar | Valida el esquema del modo y bloquea la operación simultánea; consulta/devolución no usan el guardado documental general. |
| Rechazo de campos | Conserva captura y presenta mensajes junto a su contexto. |
| Conflicto de versión | Conserva captura/versión original y bloquea reenvío incompatible; solicita reabrir/actualizar. |
| Confirmación | El servicio comprueba código/resultado; el contenedor ejecuta cierre, recarga y aviso correspondientes. |
| Cerrar/desmontar | Limpia callbacks, temporizadores/listeners y aborta/invalida lecturas; un resultado tardío no abre otra captura. Abortar no demuestra reversión de una escritura. |
| Resultado incierto de merma | Recupera la operación pendiente con la misma identidad/cuerpo, en vez de generar otra intención. |

Fuentes: [useFormInteraction](../../../../../src/shared/composables/useFormInteraction.ts),
[useRecordSave](../../../../../src/shared/composables/useRecordSave.ts),
[useDocumentRead](../../../../../src/shared/composables/useDocumentRead.ts),
[useVisibleRefresh](../../../../../src/shared/composables/useVisibleRefresh.ts) y
[estados de interacción](../../logical/states/index.md).

## Recorrido de un cambio

| Cambio | Revisar conjuntamente |
| --- | --- |
| Campo o modo | Tipo, valores iniciales/esquema, descriptor visual, mapper y contrato API. |
| Selector dependiente | ID/etiqueta inicial, limpieza de dependencias, búsqueda/página y retorno de alta contextual. |
| Evento o callback | Emisor, payload tipado, contenedor que lo consume y limpieza al cerrar. |
| Estado o permiso | Guarda de ruta, capacidades visuales, resolución de modo y autorización del servidor. |
| Flujo observable | CU, proceso, caso de prueba y procedimiento/captura de usuario afectados. |

La [matriz de pruebas](../../../../testing/04-use-case-coverage.md) identifica oráculos y
límites por CU. Las pruebas de Vue con API simulada verifican interacción/contratos;
la persistencia y autorización definitivas requieren el recorrido con API y base reales.
