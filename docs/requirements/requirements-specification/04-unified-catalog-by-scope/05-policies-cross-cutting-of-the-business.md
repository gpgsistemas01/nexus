# 4.5 Políticas transversales del negocio

Las reglas también aplican singularidad: cada `RN-*` expresa una restricción que puede
incumplirse y comprobarse de manera independiente.

| ID | Regla verificable | Estado | Evidencia principal |
| --- | --- | --- | --- |
| RN-001 | Toda operación protegida debe comprobar autenticación válida en el servidor antes de acceder a datos. | Implementado | `src/middleware/authMiddleware.js` |
| RN-002 | Una operación que cambia documento, detalle, stock y movimiento debe ser atómica: se confirman todos los cambios o ninguno. | Implementado | servicios transaccionales bajo `src/services/warehouse` |
| RN-003 | La cantidad acumulada surtida de un detalle no debe superar su cantidad solicitada vigente. | Implementado | `src/services/warehouse/issues/issueFulfillmentRules.js` |
| RN-004 | Cada documento o movimiento que requiera referencia debe tener una referencia única. | Implementado | `src/services/document/referenceNumberService.js` |
| RN-005 | Las correcciones y ajustes deben conservar datos históricos suficientes para explicar el valor anterior, el nuevo, el motivo y el actor. | Implementado | modelos de cambios y ajustes en `prisma/schema.prisma` |
| RN-006 | Un catálogo debe reutilizar el ciclo listar-crear-actualizar y sus componentes existentes cuando no cambien sus reglas, permisos ni persistencia. | Implementado | fábricas CRUD y servicios de catálogo compartidos |
| RN-007 | La eliminación física sólo debe proceder cuando el recurso no tenga relaciones históricas protegidas; en otro caso se debe conservar mediante estado o cancelación. | Implementado | `src/services/warehouse/materials/supplierMaterialService.js` |
| RN-008 | Cada escritura crítica configurada debe registrar actor, acción, recurso, resultado y los datos de solicitud admitidos por la política de auditoría. | Implementado | middleware y modelo de auditoría |
| RN-009 | Toda operación protegida debe comprobar en el servidor el permiso requerido antes de ejecutar el caso de uso. | Implementado | middleware de autorización y `src/constants/permissions.js` |
| RN-010 | Toda mutación debe validar en el servidor la entrada admitida antes de persistir cambios. | Implementado | `src/middleware/validatorMiddleware.js`, `src/validators` |
| RN-011 | Cada movimiento debe conservar el vínculo con el único documento, devolución o ajuste que lo originó. | Implementado | `src/services/inventory/movementService.js`, modelo `MovementDetail` |
| RN-012 | Una disminución de inventario debe rechazarse cuando la existencia vigente no alcance para cubrir la cantidad solicitada. | Implementado | `src/services/inventory/stockHelpers.js`, `src/services/warehouse/wastes/wasteInventoryService.js` |
| RN-013 | Una cantidad operativa de entrada, salida, devolución, corrección o ajuste debe ser mayor que cero antes de afectar inventario. | Implementado | `src/validators/fields/fieldsValidator.js` y DTO de almacén |
| RN-014 | La cantidad devuelta acumulada de un detalle no debe superar la cantidad que ya fue surtida y permanece retornable. | Implementado | `src/services/warehouse/goodsIssues/detailReturns/goodsIssueReturnService.js`, `src/services/warehouse/wasteIssues/detailReturns/wasteIssueReturnService.js` |
| RN-015 | El estado de un detalle debe ser pendiente sin surtimiento, parcial con surtimiento menor que lo solicitado y completo al alcanzar la cantidad solicitada. | Implementado | `src/services/warehouse/issues/issueFulfillmentRules.js` |
| RN-016 | El estado de una salida debe ser completo si todos sus detalles están completos, parcial si alguno tiene surtimiento y pendiente en otro caso. | Implementado | `src/services/warehouse/issues/issueFulfillmentRules.js` |
| RN-017 | Un detalle cancelado de entrada no debe volver a cancelarse ni participar en los totales activos del documento. | Implementado | `src/services/warehouse/goodsReceipts/goodsReceiptHelpers.js` |
| RN-018 | Una factura informada sólo puede identificar una entrada por proveedor; un conflicto debe señalar la entrada ya registrada. | Implementado | `src/services/warehouse/goodsReceipts/goodsReceiptInvoiceService.js` |
| RN-019 | Una salida para el cliente interno `GPG INTERNO` sólo debe admitir como asesor a una persona con acceso de coordinador. | Implementado | `src/services/admin/person/personRules.js`, `src/constants/issueHeaderRules.js` |
| RN-020 | El stock convertido de una merma debe calcularse a partir de existencia, ancho y largo con la misma fórmula en altas, ajustes y movimientos. | Implementado | `src/services/inventory/stockHelpers.js` |
| RN-021 | Dos mermas no deben compartir simultáneamente la misma identidad normalizada de nombre, proveedor, ancho y largo. | Implementado | `src/services/warehouse/wastes/wasteService.js`, `prisma/schema.prisma` |
| RN-022 | El alta de una merma debe usar un material-proveedor sólo como plantilla y conservar proveedor, presentación, unidad, dimensiones y costo como snapshots propios. | Implementado | `src/services/warehouse/wastes/wasteService.js`, `prisma/schema.prisma` |
| RN-023 | Una oferta proveedor-material, merma o proveedor inactivo no debe incorporarse a una relación o detalle nuevo; su desactivación debe conservar identidad, stock e historia y no debe impedir completar un detalle registrado previamente, sujeto a las demás validaciones del surtimiento. | Implementado | `src/services/warehouse/goodsReceipts`, `src/services/warehouse/goodsIssues`, `src/services/warehouse/wasteIssues`, `src/services/warehouse/wastes` |
| RN-024 | Dos materiales no deben coexistir con el mismo nombre recortado y comparado sin distinguir mayúsculas, presentación, unidad de medida, base y altura. | Implementado | `src/dtos/materialDTO.js`, `src/services/warehouse/materials/materialService.js` |
| RN-025 | Una identidad de material existente debe reutilizarse cuando otro proveedor ofrezca el mismo material. | Implementado | `src/services/warehouse/materials/materialService.js` |
| RN-026 | Las dimensiones de un material pueden omitirse ambas; si se informa una, base y altura son obligatorias y positivas. | Implementado | `src/validators/forms/materialValidations.js` |
| RN-027 | Al editar un material, presentación, unidad de medida y dimensiones deben permanecer inmutables. | Implementado | `src/dtos/materialDTO.js` |
| RN-028 | Una devolución parcial debe conservar el detalle como `Surtido`; devolver toda la cantidad surtida debe marcarlo `Cancelado` sin una operación de cancelación separada. | Implementado | servicios `detailReturns` de salidas de material y merma |
| RN-029 | Una salida debe quedar `Cancelada` sólo cuando todos sus detalles queden cancelados después de sus devoluciones. | Implementado | servicios `detailReturns` de salidas de material y merma |
| RN-030 | Existencia, cantidad convertida, costo máximo y estado activo deben pertenecer a cada oferta proveedor-material y no crear otra identidad de material. | Implementado | modelo `SupplierMaterial`, `src/services/warehouse/materials/supplierMaterialService.js` |
| RN-031 | Un cambio de nombre de material debe rechazarse cuando produzca otra identidad existente. | Implementado | `src/services/warehouse/materials/materialService.js` |
| RN-032 | Base y altura deben compararse en sus posiciones respectivas y no intercambiarse al determinar la identidad de un material. | Implementado | `src/services/warehouse/materials/materialService.js` |
