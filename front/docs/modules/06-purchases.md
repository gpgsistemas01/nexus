# 6. Compras en Vue

## Propósito y fuentes

Describe para desarrollo la realización de `CU-ENT-01..12` de
[Compras](../../../back/docs/requirements/use-cases/purchases/index.md) en
[purchases](../../src/modules/purchases). La evidencia del cliente está en
[purchases.spec.ts](../../tests/e2e/purchases.spec.ts); las responsabilidades y
diagramas propietarios se enlazan desde el [índice Vue](../index.md).

Las rutas `/compras/materiales` y `/compras/consumibles` incorporan el módulo
de compras existente en Express. `/compras` abre la primera variante autorizada.
El menú sólo enlaza vistas Vue y conserva los títulos de las tablas EJS.

## Comportamiento y contratos

- Listado paginado en servidor: folio, recepción y receptor, proveedor, factura,
  estado y acciones. Búsqueda, proveedor, persona y fechas se aplican al pulsar
  Buscar; el reporte filtrado utiliza esa consulta aplicada.
- Alta: proveedor activo, persona de almacén que recibe, fecha/hora de Ciudad de
  México, factura o remisión, observaciones y partidas. La factura se requiere
  sólo cuando corresponde. Cambiar proveedor limpia receptor y partidas nuevas.
- Edición: consulta fresca por id, proveedor fijo y conservación de partidas
  guardadas. El payload contiene encabezado y únicamente partidas nuevas;
  omite `details` cuando no se agregaron. No reenvía partidas existentes.
- Consulta: todos los campos y partidas, incluidas las canceladas. Una compra
  editable permite corregir cantidad/costo o cancelar una partida activa con
  confirmación SweetAlert2. Después de una escritura se vuelve a consultar el
  documento y listado; si esa lectura falla, se bloquean nuevas modificaciones
  de partidas hasta recuperar el estado. Una compra cancelada queda de consulta.
- Reporte Excel: mes actual, mes específico o filtros aplicados, sin los límites
  de paginación del listado. El diálogo y las reglas de alcance se comparten
  con Movimientos en `shared/components/ReportScopeDialog` y `shared/report`.

`purchaseService` utiliza `/api/warehouse/goods-receipts/{materials|consumables}`
y sus operaciones por id, `details/:detailId/corrections` y
`details/:detailId/cancel`; los reportes viven en
`/api/warehouse/reports/goods-receipts/{materials|consumables}/excel`.
Los mappers comprueban contexto, cantidades, fechas y contrato del documento;
las observaciones forman parte del encabezado y se devuelven tanto en listado
como por id, incluido `null` cuando no hay texto. `includeDetails` sólo decide
si se consultan las partidas. La lectura por id permite conservarlas al editar.
El backend debe incorporar esa lectura al desplegar esta migración: el mapper rechaza una respuesta sin esa propiedad
para evitar sustituir una observación desconocida por texto vacío.

Compras no tiene contrato `expectedVersion` ni recibo `operationId`. La interfaz
no inventa esos atributos ni reintenta automáticamente escrituras con un
resultado ambiguo. La renovación de sesión ante `401` conserva el transporte
Axios compartido. Un fallo de red conserva captura y exige revisar el resultado
antes de repetir una operación;
deshabilitar submit no garantiza idempotencia. Express conserva sus transacciones,
bloqueos, validación de estado, autorización y cálculo definitivo.

## Observaciones e historia de movimientos

Las observaciones del encabezado pertenecen a `GoodsReceipt` y el contrato
actual de EJS/Express permite editarlas. Un ajuste manual guarda su propio
texto en `StockAdjustment`; capturar otro ajuste crea otro documento, sin
reescribir la observación del anterior. `InventoryMovement` enlaza al
documento origen y no guarda una copia independiente de sus observaciones.
La consulta de Movimientos sólo selecciona el folio de esas relaciones;
actualmente no presenta sus observaciones.

Corregir/cancelar una partida de compra genera un cambio de detalle y, si
cambia la cantidad, su movimiento de ajuste. Esas operaciones no editan
las observaciones del encabezado ni las de un ajuste manual. Por tanto,
editar el texto de la compra cambia ese documento vinculado, aunque no
altera saldos ni textos de ajustes anteriores. Hacerlo inmutable exigiría
una regla explícita del backend además del campo de sólo lectura en Vue.

## Responsabilidades y reutilización

| Pieza | Responsabilidad |
| --- | --- |
| `app/pages/PurchaseWorkspace` | Componer Compras con las altas rápidas existentes de Directorio e Inventario, mediante callbacks tipados; los módulos no importan páginas privadas entre sí. |
| `modules/purchases/pages` | Coordinar acceso, listado, formularios y acciones de cada documento. |
| `composables` | Estado y ciclo de vida de consulta, captura, filtros, nuevas partidas y corrección; cancelar al desmontar y descartar respuestas antiguas. |
| `components` | Presentación con props/eventos; tablas Vuetify sobre `TableFrame`/`ServerTable`, selectores `RemoteSelect` y modales `RecordEditorDialog`. |
| `services` y mappers de request/respuesta | Adaptar HTTP mediante Axios compartido y comprobar contratos. |
| `purchaseForm`, `purchaseDetails`, `purchaseCalculations` | Inicialización/validación, borradores locales y totales visibles, respectivamente. |

Las reglas de formulario pertenecen a `@nexus/form-validation`. La vista previa de
partidas reutiliza `@nexus/purchase-calculations`, ya público en el backend;
las fechas reutilizan `@nexus/date-time`. Sólo se envían artículo, cantidad y costo
capturado. Los totales y costos derivados de la pantalla no se persisten desde
el navegador. No se duplica la fórmula ni se publica código privado del servidor.

Las altas rápidas reutilizan `DirectoryEditorPage` e `InventoryEditorPage`.
El artículo se crea con `creationContext=goodsReceipt`, sin stock ni costo inicial
capturado: su existencia entra al guardar la compra. El proveedor se fija al de
la captura. Tras guardar se selecciona el registro devuelto y se refresca la
primera página del selector; no es necesario que aparezca en esa página para
conservar la selección. Los artículos inactivos se muestran deshabilitados.

### Tipo de artículo y flujo de creación

`resource` y `creationContext` representan decisiones independientes:

| Valor | Responsabilidad |
| --- | --- |
| `resource=materials` o `consumables` | Selecciona el tipo de artículo, los campos correspondientes y la URL del recurso. Es una prop/parámetro del frontend; el servidor fija el tipo a partir de esa ruta. |
| `creationContext=goodsReceipt` | Identifica en el body del POST el alta rápida desde Compras. El artículo se registra sin stock/costo inicial capturado; el stock entra al guardar la compra. |

Por ejemplo, `resource=materials` permite tanto un alta normal de inventario
(sin `creationContext`) como un alta rápida desde Compras
(`creationContext=goodsReceipt`). Lo mismo aplica a consumibles. Cambiar el
flujo de creación no cambia el tipo de artículo ni el endpoint. Este metadato
ya pertenece al contrato de Express/EJS y Vue lo reutiliza; no selecciona
permisos ni exime las validaciones obligatorias de edición o ajuste de stock.

La validación visible comienza después de capturar o enviar; abrir o perder foco
sin cambios no publica errores. La recarga visible de 30 segundos se pausa durante
captura, consulta o reporte, siguiendo el flujo compartido de los otros módulos.

## Permisos y evidencia

La ruta requiere `goods:receipts-page-view`; listar, consultar y escribir,
`goods:receipts-manage`; exportar, `warehouse:reports-read`. Los selectores
requieren sus permisos de lectura de proveedores, personas e inventario.
El alta rápida de proveedor requiere `suppliers:manage` y `suppliers:read`;
la de artículo, `materials:write`, `materials:read`, `presentations:read` y
`unit:measures-read`. Express comprueba cada petición independientemente del menú.

`tests/unit/modules/purchases/purchaseTest.ts` cubre contratos, separación de
contextos, payload incremental, fechas, validación diferida y respuestas tardías.
`tests/e2e/purchases.spec.ts` ejecuta recorridos de navegador con HTTP simulado;
no demuestra persistencia. La integración HTTP/PostgreSQL del backend se conserva
en `goodsReceiptContextDbTest.js`, incluida lectura de observaciones y aislamiento
de variantes, y en las pruebas existentes de concurrencia de almacén.

Consulta [arquitectura](../architecture/01-structure-and-boundaries.md), [estándar y herramientas](../development/02-tooling.md)
y la [referencia técnica de compras](../../../back/docs/architecture/views/development/frontend-technical-documentation/12-goods-receipts-code.md).

## Paridad con EJS y revisión de reutilización

Los botones Guardar, Actualizar, Agregar y Regresar, el título de corrección,
los encabezados agrupados Medidas/Conversión y los textos de importes conservan
el vocabulario de EJS. Editar y Ver incluyen el folio en el título del modal.
La corrección muestra Nuevos totales estimados y pide confirmación antes de
escribir. Sin cambios, informa que se debe modificar cantidad o costo; cancelar
conserva la captura sin pedir una escritura. Los cálculos siguen siendo una
vista previa y Express conserva la validación y los importes persistidos.

`PurchaseTotals` presenta los resúmenes del documento y de la corrección.
`useReportScope` coordina apertura, validación del mes, errores y descarga
tanto en Compras como en Movimientos, sobre `useFileExport`. La política de
detalles editables se comparte entre corregir y cancelar dentro de Compras.
`confirmAction` concentra la confirmación SweetAlert2 con o sin escritura en
`preConfirm`, y cancela su diálogo al desmontar.

Los códigos de éxito pertenecen a
`back/src/shared/constants/apiSuccessCodes.js`: controllers, EJS y Vue importan
`successCodeMessages` desde ese propietario público. Vue usa el alias
`@nexus/api-success-codes`. `confirmMutation` comprueba el código real recibido
contra la constante esperada; no crea códigos ni deduce éxito de un prefijo.
Su resultado conserva ese código y traduce el texto mediante `getSuccessMessage`,
el mismo catálogo público de EJS. Los avisos de Compras usan ese resultado
confirmado. El servicio no importa SweetAlert2 ni presenta avisos.

El lector de documentos ahora pertenece a `shared/composables/useDocumentRead`;
Compras inyecta su solicitud y mensaje de error. Salidas reutiliza el mismo ciclo
de cancelación y descarte de respuestas tardías.

El selector de artículos admite también el listado real de inventario, que omite
`material.type`; el endpoint ya separa materiales y consumibles. Un tipo explícito
contradictorio se rechaza y los documentos conservan la comprobación estricta.

`purchase.ts` conserva tipos; `purchaseConfig` y `purchaseRules` son los propietarios
de configuración y modos. Las escrituras reciben opciones con destino y cambio
tipados. Consulta la [revisión de responsabilidades y nombres](../patterns/08-document-responsibilities.md).
