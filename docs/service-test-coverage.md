# Cobertura de pruebas de servicios

Este documento resume qué servicios ya tienen pruebas y qué falta cubrir a nivel de integración. La intención es evitar listar como “faltante” un servicio que ya está cubierto por su propia suite o por una integración directa con la base de pruebas.

## Servicios con pruebas actuales

La suite ya cubre:

- `src/services/inventory/stockHelpers.js`: pruebas unitarias de cálculos y validaciones de stock.
- `src/services/warehouse/goodsIssues/goodsIssueHelpers.js`: pruebas unitarias de helpers de salidas.
- `src/services/warehouse/goodsReceipts/goodsReceiptHelpers.js`: pruebas unitarias de helpers de entradas.
- `src/services/warehouse/products/supplierProductService.js`: pruebas unitarias de consultas bulk/actualizaciones SQL.
- `src/services/warehouse/reportService.js` y `src/services/inventory/reportService.js`: pruebas unitarias de mapeo de reportes, normalización numérica y reenvío de filtros hacia servicios base.
- `src/services/sales/clientService.js`: pruebas unitarias de GET/submit y prueba de integración directa con BD para crear, listar, consultar y actualizar clientes.
- `src/services/warehouse/supplierService.js`: pruebas unitarias de GET/submit y prueba de integración directa con BD para crear, listar, consultar código y actualizar proveedores. Esta integración cubre la transacción de creación que incrementa el contador `PRO` y guarda el proveedor.
- `src/services/admin/userService.js`: pruebas unitarias de GET/listado/login/sesión y submit de crear/actualizar/cambiar contraseña; además tiene integración directa con BD para crear, listar, actualizar y cambiar contraseña con relaciones reales.
- `src/services/admin/profileService.js`: pruebas unitarias de GET/listado/perfil por usuario y submit de crear/actualizar; además tiene integración directa con BD para crear y actualizar perfiles con departamentos reales.
- `src/services/admin/departmentService.js` y `src/services/admin/roleService.js`: pruebas unitarias de GET/listado, y cobertura de integración directa vía catálogos.
- `src/services/document/referenceNumberService.js`: pruebas unitarias de incremento y generación de referencias.
- `src/services/warehouse/products/productService.js`: pruebas unitarias de GET/listado/snapshot/existencia y submit de ajuste de stock; además tiene integración directa para `createProduct`, `updateProduct` y `updateProductStock` atravesando relaciones proveedor-producto, `adjustmentService`, `movementService` y `supplierProductService` con datos reales.
- `src/services/warehouse/presentationService.js`, `unitMeasureService`, `fulfillmentStatusService` y `reasonService`: pruebas unitarias de GET/listado, y cobertura de integración directa vía catálogos.

## Estrategia de integración con BD

Las integraciones de servicios usan `DATABASE_TEST_URL`; las migraciones previas usan `DIRECT_TEST_URL`. Estas pruebas guardan datos reales y la limpieza se hace por datos de prueba al iniciar cada integración y con `tests/teardownTestDatabase.js` al finalizar la suite.

## Pendientes importantes

Quedan pendientes de integración transaccional completa con BD:

- `purchaseRequisitionService.createPurchaseRequisition` y `purchaseRequisitionService.updatePurchaseRequisition`: requisiciones con proyecto, solicitante, departamento, detalles y cambio de estado.

## Dependencias entre dominios

Cuando un servicio usa otro servicio de otro dominio, no se duplica la misma prueba unitaria en ambos lugares. Esos casos deben cubrirse como integración del flujo completo:

- `productService.updateProductStock` delega en `adjustmentService.createStockAdjustment`; su cobertura se registra en `stockAdjustmentDbTest.js`.
- `wasteService` y `goodsIssueService` comparten stock, proveedor-producto, perfiles, cliente y movimientos; su cobertura cruzada se registra en `wasteGoodsIssueDbTest.js`.
- `goodsReceiptService` comparte stock, proveedor-producto y movimientos; su cobertura cruzada se registra en `goodsReceiptServiceDbTest.js`.
- `notificationService` debe probarse como integración cuando el objetivo sea validar datos reales generados por otros servicios; reportes ya tienen unitarias de mapeo y pueden complementarse con integración si se requiere validar datos exportados end-to-end.

## Implicación para CI

En CI, usa `npm test` para pruebas sin BD y `npm run test:db` para integraciones con BD. `npm run test:db` valida `DATABASE_TEST_URL`/`DIRECT_TEST_URL`, aplica migraciones y luego ejecuta Vitest.
