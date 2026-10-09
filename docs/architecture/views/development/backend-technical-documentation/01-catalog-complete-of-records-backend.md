# 1. Responsabilidades y contratos del backend

La ficha se mantiene por **capacidad cohesiva**: agrupa las rutas, controladores y
servicios que implementan el mismo contrato, pero nombra todos los módulos cubiertos.
El inventario literal de cada export permanece en el
[mapa generado](../code-map.md#símbolos-exportados-por-controladores); estas
fichas agregan entrada, salida, reglas, persistencia y dependencia de implementación sin convertir
un ejemplo en la documentación de todo el backend.

### Arranque, transporte web y middleware

| Capacidad | Entrada, adaptación y salida | Colaboradores, efectos y persistencia | Mapa de código propietario |
| --- | --- | --- | --- |
| Arranque Express | `src/app.js` crea `app` y `server`, configura EJS, cuerpo, estáticos, rutas, 404 y error final. `registerWebRoutes` y `registerApiRoutes` montan sus registros. | Logging, auditoría y Socket.IO rodean el transporte; el manejador final traduce `AppError` y registra fallos desconocidos. | [Código compartido](03-shared-code-and-coverage.md) |
| Autenticación y autorización | Detalle en la referencia del módulo. | Detalle en la referencia del módulo. | [authentication](04-authentication-code.md) |
| Validación y errores | Validadores de formularios escriben errores de `express-validator`; `validate` corta la cadena antes del controlador. | `serviceErrorHandler.js` y clases de `src/errors` conservan errores de dominio; no abren transacciones. | [Código compartido](03-shared-code-and-coverage.md) |
| Auditoría | `auditService.js` identifica escrituras y persiste la evidencia producida por middleware. | Usa los datos de solicitud/respuesta definidos por el middleware y Prisma fuera del servicio funcional. | [Código compartido](03-shared-code-and-coverage.md) |
| Páginas web | Los controladores bajo `controllers/web` resuelven inicio/login y las páginas de personas, usuarios, clientes, proveedores, materiales, consumibles, mermas, entradas, salidas y movimientos. | Preparan `res.render`, metadatos y permisos para EJS; no ejecutan CRUD de dominio. | [Código compartido](03-shared-code-and-coverage.md) |

### Fichas de capacidades API y dominio

| Capacidad y módulos propietarios | Entrada y retorno | Reglas, errores y persistencia | Mapa de código propietario |
| --- | --- | --- | --- |
| Catálogos: `departmentController/Service`, `roleController/Service`, `presentationController/Service`, `reasonController/Service`, `unitMeasureController/Service`, `fulfillmentStatusController/Service` | `GET` sin cuerpo; la fábrica `createDataTableListController` adapta paginación cuando corresponde y devuelve colecciones JSON. | Lecturas Prisma; búsquedas por id/nombre son colaboradores de otros servicios y propagan ausencia según su contrato. | [Código compartido](03-shared-code-and-coverage.md) |
| Personas: `personController.js`, `personService.js`, `personRules.js` | Detalle en la referencia del módulo. | Detalle en la referencia del módulo. | [persons](05-persons-code.md) |
| Usuarios: `userController.js`, `userService.js`, `roleService.js` | Detalle en la referencia del módulo. | Detalle en la referencia del módulo. | [users](06-users-code.md) |
| Clientes: `sales/clientController.js`, `clientService.js` | Detalle en la referencia del módulo. | Detalle en la referencia del módulo. | [clients](07-clients-code.md) |
| Proveedores: `supplierController.js`, `supplierService.js` | Detalle en la referencia del módulo. | Detalle en la referencia del módulo. | [suppliers](08-suppliers-code.md) |
| Materiales: `materialController.js`, `materials/materialService.js`, `materialHelpers.js`, `materialRelations.js`, `supplierMaterialService.js`, `adjustmentService.js` | Detalle en la referencia del módulo. | Detalle en la referencia del módulo. | [materials](09-materials-code.md) |
| Consumibles: `consumableController.js`, `consumables/consumableService.js` y `consumableApiRoute.js` | Detalle en la referencia del módulo. | Detalle en la referencia del módulo. | [consumables](10-consumables-code.md) |
| Mermas: `wasteController.js`, `wastes/wasteService.js`, `wasteMaterialService.js`, `wasteInventoryService.js`, `wasteMovementService.js`, `wasteStockAdjustmentService.js` | Detalle en la referencia del módulo. | Detalle en la referencia del módulo. | [wastes](11-wastes-code.md) |
| Entradas: controllers específicos de `goodsReceipts/materials` y `goodsReceipts/consumables`, `goodsReceiptService.js`, `goodsReceiptHelpers.js`, `goodsReceiptInvoiceService.js` | Detalle en la referencia del módulo. | Detalle en la referencia del módulo. | [goods-receipts](12-goods-receipts-code.md) |
| Corrección/cancelación de entrada: controladores homónimos y `detailChanges/{goodsReceiptCorrectionService,goodsReceiptCancellationService,goodsReceiptDetailChangeService}.js` | Detalle en la referencia del módulo. | Detalle en la referencia del módulo. | [goods-receipts](12-goods-receipts-code.md) |
| Salidas de materiales y consumibles: controllers específicos de `goodsIssues/materials` y `goodsIssues/consumables`, `goodsIssues/goodsIssueService.js`, helpers, select y reglas de cumplimiento | Detalle en la referencia del módulo. | Detalle en la referencia del módulo. | [goods-issues](13-goods-issues-code.md) |
| Devolución de material: `goodsIssueController.registerGoodsIssueDetailReturn` y `detailReturns/goodsIssueReturnService.js` | Detalle en la referencia del módulo. | Detalle en la referencia del módulo. | [goods-issues](13-goods-issues-code.md) |
| Salidas de mermas: `wasteIssueController.js`, `wasteIssues/wasteIssueService.js`, `wasteIssueFulfillmentService.js` y reglas compartidas de `issues` | Detalle en la referencia del módulo. | Detalle en la referencia del módulo. | [waste-issues](14-waste-issues-code.md) |
| Devolución de merma: `wasteIssueController.registerWasteIssueDetailReturn` y `detailReturns/wasteIssueReturnService.js` | Detalle en la referencia del módulo. | Detalle en la referencia del módulo. | [waste-issues](14-waste-issues-code.md) |
| Inventario compartido: `inventory/movementService.js`, `movementHelpers.js`, `stockHelpers.js`, `materialIdentity.js` | Recibe referencia, tipo, detalles y `tx`; devuelve movimiento/resumen o valida cantidades. | `applyInventoryMovement` actualiza existencias y crea movimiento; helpers convierten cantidades y rechazan insuficiencia. Participa en la transacción llamadora. | [Código compartido](03-shared-code-and-coverage.md) |
| Movimientos y exportaciones contextuales: `movementController.js`, `movementQueryService.js`, `inventory/reportService.js`, controladores/servicios `report` de admin, ventas y almacén | Detalle en la referencia del módulo. | Detalle en la referencia del módulo. | [movements](15-movements-code.md) |
| Numeración documental: `document/referenceNumberService.js` | Año/ámbito y cliente opcional producen o validan una referencia. | Comprueba duplicados e incrementa contadores usando el `tx` recibido cuando forma parte de creación documental. | [Código compartido](03-shared-code-and-coverage.md) |

El [mapa generado de servicios](../code-map.md#símbolos-exportados-por-servicios)
completa, símbolo por símbolo, las constantes y helpers de cada módulo de la tabla. Una
nueva exportación debe pertenecer a una de estas fichas o crear una capacidad nueva; no
puede quedar documentada sólo como “otro ejemplo”.

Los mapas propietarios muestran imports y grupos de archivos. La ejecución de operaciones
se consulta en [procesos](../../processes/index.md); esta referencia conserva sólo
contratos de código y nombres de propiedades necesarios para revisar implementación.
