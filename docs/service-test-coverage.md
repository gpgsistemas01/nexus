# Cobertura de pruebas de servicios

Este documento resume qué servicios ya tienen pruebas y qué falta cubrir a nivel de integración. La intención es evitar listar como “faltante” un servicio que ya está cubierto por su propia suite o por una integración directa con la base de pruebas.

## Servicios con pruebas actuales

La suite ya cubre:

- `src/services/inventory/stockHelpers.js`: pruebas unitarias de cálculos y validaciones de stock.
- `src/services/warehouse/goodsIssues/goodsIssueHelpers.js`: pruebas unitarias de helpers de salidas.
- `src/services/warehouse/goodsReceipts/goodsReceiptHelpers.js`: pruebas unitarias de helpers de entradas.
- `src/services/warehouse/products/supplierProductService.js`: pruebas unitarias de consultas bulk/actualizaciones SQL.
- `src/services/sales/clientService.js`: pruebas unitarias de GET/submit y prueba de integración directa con BD para crear, listar, consultar y actualizar clientes.
- `src/services/warehouse/supplierService.js`: pruebas unitarias de GET/submit y prueba de integración directa con BD para crear, listar, consultar código y actualizar proveedores. Esta integración cubre la transacción de creación que incrementa el contador `PRO` y guarda el proveedor.
- `src/services/admin/userService.js`: pruebas unitarias de GET/listado/login/sesión y submit de crear/actualizar/cambiar contraseña; además tiene integración directa con BD para crear, listar, actualizar y cambiar contraseña con relaciones reales.
- `src/services/admin/profileService.js`: pruebas unitarias de GET/listado/perfil por usuario y submit de crear/actualizar; además tiene integración directa con BD para crear y actualizar perfiles con departamentos reales.
- `src/services/admin/departmentService.js` y `src/services/admin/roleService.js`: pruebas unitarias de GET/listado, y cobertura de integración directa vía catálogos.
- `src/services/document/referenceNumberService.js`: pruebas unitarias de incremento y generación de referencias.
- `src/services/warehouse/products/productService.js`: pruebas unitarias de GET/listado/snapshot/existencia y submit de ajuste de stock; además tiene integración directa para `createProduct`, `updateProduct` y `updateProductStock` atravesando relaciones proveedor-producto, `adjustmentService`, `movementService` y `supplierProductService` con datos reales.
- `src/services/warehouse/presentationService.js`, `unitMeasureService`, `fulfillmentStatusService` y `reasonService`: pruebas unitarias de GET/listado, y cobertura de integración directa vía catálogos.

## Integraciones directas con BD

Las pruebas en `tests/integration/services` guardan información real en `DATABASE_TEST_URL` y no usan rollback:

- `clientServiceDbTest.js`: crea, lista, consulta y actualiza clientes.
- `supplierServiceDbTest.js`: crea, lista, consulta y actualiza proveedores, incluyendo la transacción de creación con contador de referencia.
- `adminServicesDbTest.js`: crea y actualiza perfiles/usuarios con relaciones reales de departamento/rol, cubriendo transacciones de `profileService` y `userService`.
- `stockAdjustmentDbTest.js`: cubre `productService.createProduct`, `productService.updateProduct`, `productService.updateProductStock` y `adjustmentService.createStockAdjustment` atravesando relaciones proveedor-producto, `movementService` y `supplierProductService` con producto/proveedor/usuario/razón reales.
- `wasteGoodsIssueDbTest.js`: cubre merma (`wasteService.createWasteAdjustment`, `updateWaste`, `updateWasteStock`) y salidas (`goodsIssueService.createGoodsIssue`, `updateGoodsIssue`, `updateGoodsIssueDetails`, `findAllGoodsIssues`) con producto/proveedor/stock/perfiles/departamento/cliente reales.
- `goodsReceiptServiceDbTest.js`: cubre compra/entrada (`goodsReceiptService.createGoodsReceipt`, `findAllGoodsReceipts`) con detalle, movimiento `ENTRY`, stock proveedor-producto y actualización de costo.
- `catalogServicesDbTest.js`: crea catálogos de administración/almacén y los lee con servicios GET.

Para que las corridas sean repetibles, cada integración limpia registros previos por nombre único al iniciar y `tests/teardownTestDatabase.js` ejecuta limpieza global al finalizar toda la suite.

## Servicios relacionados a submit

Estado actualizado de submit:

- Cubiertos con unitarias e integración directa: `clientService.createClient`, `clientService.updateClient`, `supplierService.createSupplier` y `supplierService.updateSupplier`.
- Cubiertos con unitarias e integración directa: `userService.createUser`, `userService.updateUser`, `userService.updateUserPassword`, `profileService.createProfile` y `profileService.updateProfile`.
- Cubiertos con unitarias e integración directa entre dominios: `productService.createProduct`, `productService.updateProduct`, `productService.updateProductStock` y `adjustmentService.createStockAdjustment`.
- Cubiertos con integración directa de merma/salidas: `wasteService.createWasteAdjustment`, `wasteService.updateWaste`, `wasteService.updateWasteStock`, `goodsIssueService.createGoodsIssue`, `goodsIssueService.updateGoodsIssue` y `goodsIssueService.updateGoodsIssueDetails`.
- Cubierto con integración directa de compra/entrada: `goodsReceiptService.createGoodsReceipt`.

## Pendientes importantes

Quedan pendientes de integración transaccional completa con BD:

- `purchaseRequisitionService.createPurchaseRequisition` y `purchaseRequisitionService.updatePurchaseRequisition`: requisiciones con proyecto, solicitante, departamento, detalles y cambio de estado.

## Dependencias entre dominios

Cuando un servicio usa otro servicio de otro dominio, no se duplica la misma prueba unitaria en ambos lugares. Esos casos deben cubrirse como integración del flujo completo:

- `productService.updateProductStock` delega en `adjustmentService.createStockAdjustment`; ese flujo ya tiene integración completa con movimientos/stock reales en `stockAdjustmentDbTest.js`.
- `wasteService.createWasteAdjustment`, `wasteService.updateWaste`, `wasteService.updateWasteStock`, `goodsIssueService.createGoodsIssue`, `goodsIssueService.updateGoodsIssue`, `goodsIssueService.updateGoodsIssueDetails`, `goodsReceiptService.createGoodsReceipt` y `adjustmentService.createStockAdjustment` ya tienen integración directa con BD; quedan pendientes requisiciones (`purchaseRequisitionService`).
- `notificationService` y reportes deben probarse como integración cuando el objetivo sea validar datos reales generados por otros servicios.

## Implicación para CI

Las pruebas que dependan de Prisma o migraciones deben ejecutarse en CI con `npm run test:db`, porque ese script valida `DATABASE_TEST_URL`, aplica migraciones y después corre Vitest contra la base de pruebas. Además, Vitest carga `tests/setupTestDatabaseEnv.js`: si una corrida define `DATABASE_URL` o `DATABASE_TEST_URL`, la suite valida que `NODE_ENV=test`, que exista `DATABASE_TEST_URL` y que no sea igual a `DATABASE_URL` antes de ejecutar pruebas.
