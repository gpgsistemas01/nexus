# 4.3 Entradas, salidas e inventario

Las recepciones y salidas de artículos se operan en contextos separados de materiales
y consumibles. Comparten las obligaciones de recepción `RF-REC-001` a `RF-REC-008`
y de salida `RF-ISS-001` a `RF-ISS-006`; compartir proceso no permite mezclar detalles.
Las salidas de merma conservan sus recursos y movimientos propios.

| ID | Requisito y criterio de aceptación | Estado | Evidencia principal |
| --- | --- | --- | --- |
| RF-REC-001 | Personal de almacén o el Administrador del sistema deben poder consultar entradas, encabezados, detalles y estados sin modificar inventario; cada consulta presenta únicamente compras del contexto elegido, materiales o consumibles. | Implementado | `src/routes/api/warehouse/goodsReceipts/materials/materialGoodsReceiptApiRoute.js`, modelo `GoodsReceipt` |
| RF-REC-002 | Personal de almacén o el Administrador del sistema deben poder corregir cantidad o costo de un detalle activo conservando actor, motivo, valores anteriores y corregidos y el efecto correspondiente; se aplican los criterios de corrección. | Implementado | `GoodsReceiptDetailChange`, `src/services/warehouse/goodsReceipts/detailChanges` |
| RF-REC-003 | El sistema debe impedir que una factura pertenezca a más de una entrada del mismo proveedor e identificar la entrada existente ante un conflicto. | Implementado | `src/services/warehouse/goodsReceipts/goodsReceiptInvoiceService.js`, restricción `GoodsReceipt(supplierId, invoice)` |
| RF-REC-004 | Una entrada debe admitir detalles independientes del mismo material cuando tienen costos por presentación diferentes. | Implementado | `src/public/js/pages/warehouse/goodsReceipts/goodsReceiptForm.js`, `src/public/js/plugins/datatable/warehouse/goodsReceipts/goodsReceiptDatatable.js` |
| RF-REC-005 | Personal de almacén o el Administrador del sistema deben poder editar el encabezado admitido de una entrada no cancelada y agregar detalles nuevos, sin cambiar el proveedor ni reescribir detalles persistidos. | Implementado | `src/public/js/pages/warehouse/goodsReceipts/goodsReceiptForm.js`, `src/services/warehouse/goodsReceipts/goodsReceiptService.js` |
| RF-REC-006 | Cuando una marca distingue físicamente un material, almacén debe registrarla como otra identidad del catálogo en lugar de capturarla en el detalle. | Implementado | `src/services/warehouse/materials/materialService.js`, modelo `GoodsReceiptDetail` |
| RF-REC-007 | Personal de almacén o el Administrador del sistema deben poder registrar una entrada con proveedor y detalles válidos del mismo contexto, incrementando existencias y generando movimientos como una sola operación; el alta contextual se rige por sus criterios. | Implementado | `src/routes/api/warehouse/goodsReceipts/materials/materialGoodsReceiptApiRoute.js`, `src/dtos/goodsReceiptDTO.js`, `src/services/warehouse/goodsReceipts/goodsReceiptService.js`, `src/services/warehouse/goodsReceipts/goodsReceiptHelpers.js`, `src/public/js/plugins/select2/modules/goodsReceiptSelect.js` |
| RF-REC-008 | Personal de almacén o el Administrador del sistema deben poder cancelar un detalle activo revirtiendo su efecto de inventario y conservando su historia; un fallo no debe dejar una reversión parcial. | Implementado | `src/services/warehouse/goodsReceipts/detailChanges` |
| RF-REC-009 | Las compras de materiales y consumibles deben compartir una serie anual de folios de entrada y conservar un folio único, aunque cada contexto muestre únicamente sus compras. | Implementado | `DOCUMENT_REFERENCE_TYPES.GOODS_RECEIPT`, `src/services/document/referenceNumberService.js`, restricción única `GoodsReceipt.referenceNumber` |
| RF-REC-010 | El reporte generado desde cada consulta de compras debe incluir únicamente el contexto correspondiente y distinguirlo en el nombre del archivo y la hoja; el contexto no puede alterarse mediante filtros enviados por el usuario. | Implementado | `src/routes/api/warehouse/reportApiRoute.js`, `src/controllers/api/warehouse/reportController.js`, `src/services/warehouse/reportService.js` |
| RF-REC-011 | Las compras de consumibles deben rechazar detalles o documentos del contexto de materiales, y viceversa, sin cambios parciales; las operaciones de compra se rigen por `RF-REC-001` a `RF-REC-008`. | Implementado | `/api/warehouse/goods-receipts/consumables`, `src/services/warehouse/goodsReceipts/consumables/consumableGoodsReceiptService.js`, `CU-ENT-07` a `CU-ENT-12` |
| RF-ISS-001 | Personal de almacén o el Administrador del sistema deben poder consultar salidas de material o consumible, sus detalles y contexto sin modificar existencias; cada consulta se limita a su contexto. | Implementado | `src/routes/api/warehouse/goodsIssues/materials/materialGoodsIssueApiRoute.js`, `src/views/pages/warehouse/goodsIssues` |
| RF-ISS-002 | Personal de almacén o el Administrador del sistema deben poder surtir toda la cantidad pendiente de un detalle cuando exista stock suficiente, actualizando documento, existencias y movimiento atómicamente. | Implementado | `src/services/warehouse/goodsIssues/goodsIssueService.js`, `src/services/inventory/movementService.js`, `src/services/warehouse/materials/supplierMaterialService.js` |
| RF-ISS-003 | Personal de almacén o el Administrador del sistema deben poder devolver una cantidad positiva que no exceda el saldo entregado de un detalle de material o consumible, sólo cuando la salida esté completamente surtida, y conservar el vínculo con documento, detalle y movimiento inverso. | Implementado | modelos `GoodsIssueReturn` y `MovementDetail`, `src/services/warehouse/goodsIssues/detailReturns/goodsIssueReturnService.js` |
| RF-ISS-004 | Personal de almacén o el Administrador del sistema deben poder crear una salida pendiente de material o consumible con encabezado y detalles válidos del mismo contexto, sin descontar existencias. | Implementado | `src/routes/api/warehouse/goodsIssues/materials/materialGoodsIssueApiRoute.js`, `src/views/pages/warehouse/goodsIssues` |
| RF-ISS-005 | Personal de almacén o el Administrador del sistema deben poder actualizar únicamente los campos admitidos del encabezado de una salida cuyo estado permita edición. | Implementado | `src/routes/api/warehouse/goodsIssues/materials/materialGoodsIssueApiRoute.js`, `src/views/pages/warehouse/goodsIssues` |
| RF-ISS-006 | Personal de almacén o el Administrador del sistema deben poder agregar o actualizar detalles todavía modificables sin reescribir cantidades surtidas o devueltas. | Implementado | `src/routes/api/warehouse/goodsIssues/materials/materialGoodsIssueApiRoute.js`, `src/views/pages/warehouse/goodsIssues` |
| RF-WST-001 | Personal de almacén o el Administrador del sistema deben poder consultar el inventario de mermas y sus existencias; corresponde a la misma consulta de `RF-CAT-004`, no a documentos de salida. | Implementado | `src/routes/api/warehouse/wasteApiRoute.js` |
| RF-WST-002 | Personal de almacén o el Administrador del sistema deben poder crear una salida de merma pendiente con encabezado y detalles válidos, sin descontar existencias. | Implementado | `src/routes/api/warehouse/wasteIssueApiRoute.js`, `src/public/js/pages/warehouse/wasteIssues/wasteIssueModal.js` |
| RF-WST-003 | Personal de almacén o el Administrador del sistema deben poder surtir toda la cantidad pendiente de un detalle de merma cuando exista stock suficiente, actualizando documento, existencias y movimiento atómicamente. | Implementado | `src/services/warehouse/wasteIssues/wasteIssueService.js`, `tests/integration/controllers/wasteIssueControllerDbTest.js` |
| RF-WST-004 | Personal de almacén o el Administrador del sistema deben poder actualizar únicamente los campos admitidos del encabezado de una salida de merma cuyo estado permita edición. | Implementado | `src/routes/api/warehouse/wasteIssueApiRoute.js`, `src/public/js/pages/warehouse/wasteIssues/wasteIssueModal.js` |
| RF-WST-005 | Personal de almacén o el Administrador del sistema deben poder agregar o actualizar detalles de merma todavía modificables sin reescribir cantidades surtidas o devueltas. | Implementado | `src/routes/api/warehouse/wasteIssueApiRoute.js`, `src/public/js/pages/warehouse/wasteIssues/wasteIssueModal.js` |
| RF-WST-006 | Personal de almacén o el Administrador del sistema deben poder devolver una cantidad positiva que no exceda el saldo entregado de un detalle de merma, sólo cuando la salida esté completamente surtida, y confirmar existencia y movimiento inverso como una sola operación. | Implementado | `src/services/warehouse/wasteIssues/detailReturns/wasteIssueReturnService.js`, `tests/integration/controllers/wasteIssueControllerDbTest.js` |
| RF-WST-007 | Personal de almacén o el Administrador del sistema deben poder consultar salidas de merma, sus detalles y contexto sin modificar existencias. | Implementado | `src/routes/api/warehouse/wasteIssueApiRoute.js`, `src/public/js/pages/warehouse/wasteIssues/wasteIssueModal.js` |
| RF-ADJ-001 | El Administrador del sistema debe poder establecer la nueva existencia total no negativa de un material, consumible o merma mediante un ajuste con motivo y observaciones; se aplica inmediatamente, se deriva su tipo de la diferencia y el usuario queda registrado como creador y aprobador, sin una aprobación posterior. | Implementado | rutas de stock de `materialApiRoute.js`, `consumableApiRoute.js` y `wasteApiRoute.js`; `src/services/warehouse/adjustmentService.js`, `src/services/warehouse/wastes/wasteStockAdjustmentService.js` |
| RF-ADJ-002 | Al aplicar un ajuste, el sistema debe actualizar atómicamente la existencia y cantidad convertida, y generar el movimiento con los valores anterior, nuevo y diferencia. | Implementado | `src/services/warehouse/adjustmentService.js`, `src/services/warehouse/wastes/wasteStockAdjustmentService.js` |

### Criterios de recepción y corrección

- **CA-RF-REC-007-1:** la entrada tiene al menos un detalle y todos pertenecen al
  contexto correspondiente. Un documento vacío, mixto o de otro contexto se rechaza
  sin modificar documento, existencia ni movimientos.
- **CA-RF-REC-007-2:** un artículo no catalogado puede darse de alta desde la compra;
  su oferta queda sin existencia hasta confirmar la recepción conforme a `RF-CAT-006`
  o `RF-CAT-026`. No se contabiliza dos veces la cantidad recibida.
- **CA-RF-REC-002-1:** la cantidad corregida es positiva y no supera la cantidad
  recibida vigente; el costo es positivo y debe existir un cambio de cantidad o costo.
- **CA-RF-REC-002-2:** reducir la cantidad requiere existencia suficiente para revertir
  la diferencia. Una corrección sólo de costo conserva cantidades y no genera movimiento
  de inventario; recalcula los importes y conserva su historia.
- **CA-RF-REC-008-1:** cancelar un detalle revierte su cantidad vigente; si la existencia
  no lo permite, se rechaza sin cambios. La compra queda cancelada cuando no conserva
  detalles activos.

### Criterios de salida y ajuste

- **CA-RF-ISS-002-1:** cada detalle seleccionado se surte por toda su cantidad pendiente.
  La salida queda parcialmente surtida si permanecen otros detalles pendientes; no se
  ofrece captura libre de una entrega parcial de un detalle.
- **CA-RF-ISS-003-1:** la nueva devolución no supera cantidad suministrada menos
  devoluciones anteriores. Una devolución parcial conserva `Surtido`; devolver el saldo
  completo cancela el detalle. Cancelar todos los detalles cancela la salida.
- **CA-RF-WST-003-1:** las mismas condiciones de surtimiento completo del detalle se
  aplican a merma; la existencia y sus movimientos permanecen independientes.
- **CA-RF-WST-006-1:** se aplican las mismas condiciones de saldo y cancelación derivada
  de devolución, sin una acción de cancelación directa de la salida.
- **CA-RF-ADJ-001-1:** la cantidad indicada es el saldo final, no un incremento. Puede
  ser cero; la diferencia con la existencia anterior puede ser positiva, negativa o cero.
  No se admite una existencia final negativa.
