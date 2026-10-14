# 4.2 Catálogos operativos y comerciales

La separación siguiente aplica la singularidad adoptada por el proyecto: consultar,
crear, actualizar, retirar y ajustar son obligaciones independientes porque tienen
permisos y resultados comprobables distintos. Cada `RF-*` describe una capacidad
observable; las restricciones que se reutilizan entre operaciones se expresan una sola
vez como `RN-*`, en lugar de subdividir o extender la explicación dentro de una fila.

La administración compartida comprende exactamente **Áreas**, **Roles**,
**Presentaciones**, **Unidades de medida**, **Motivos de ajuste** y **Estados de
cumplimiento**. Clientes, proveedores, materiales y mermas permanecen en sus requisitos
y módulos propietarios; no se interpretan como variantes del catálogo auxiliar.

| ID | Requisito y criterio de aceptación | Estado | Evidencia principal |
| --- | --- | --- | --- |
| RF-CAT-001 | Personal de almacén o el Administrador del sistema deben poder consultar materiales y sus ofertas de proveedor sin modificar existencias. | Implementado | `src/routes/api/warehouse/materialApiRoute.js`, `src/views/pages/warehouse/materials` |
| RF-CAT-002 | El Administrador del sistema del área Sistemas debe poder consultar proveedores autorizados sin modificar sus datos. | Implementado | `src/routes/api/warehouse/supplierApiRoute.js`, `src/routes/web/warehouse/supplierWebRoute.js`, `src/constants/permissions.js` |
| RF-CAT-003 | El Administrador del sistema del área Sistemas debe poder consultar clientes autorizados sin modificar sus datos. | Implementado | `src/routes/api/sales/clientApiRoute.js`, `src/routes/web/sales/clientWebRoute.js`, `src/constants/permissions.js` |
| RF-CAT-004 | Personal de almacén o el Administrador del sistema deben poder consultar existencias de merma sin modificar sus datos ni existencias. | Implementado | `src/routes/api/warehouse/wasteApiRoute.js`, `src/views/pages/warehouse/wastes` |
| RF-CAT-005 | Un usuario autorizado debe poder consultar presentaciones activas sin modificar el catálogo. | Implementado | `src/routes/api/warehouse/presentationApiRoute.js` |
| RF-CAT-006 | Personal de almacén o el Administrador del sistema deben poder crear un material y su oferta de proveedor con identidad y datos válidos; el efecto inicial depende del alta directa o contextual según sus criterios. | Implementado | `src/dtos/materialDTO.js`, `src/validators/forms/materialValidations.js`, `src/services/warehouse/materials/materialService.js` |
| RF-CAT-007 | Personal de almacén o el Administrador del sistema deben poder editar el nombre y stock mínimo compartidos de un material, y el costo máximo y estado de la oferta seleccionada, sin cambiar existencias. | Implementado | `src/dtos/materialDTO.js`, `src/services/warehouse/materials/materialService.js`, `src/public/js/pages/warehouse/materials/materialFields.js` |
| RF-CAT-008 | Personal de almacén o el Administrador del sistema deben poder retirar una oferta de material sólo cuando el material no tenga historia operativa protegida; su identidad sólo se elimina si no conserva otras ofertas. | Implementado | `src/services/warehouse/materials/supplierMaterialService.js` |
| RF-CAT-009 | El Administrador del sistema debe poder ajustar las existencias de un material únicamente mediante la acción autorizada disponible desde su consulta, conservando el resultado trazable; el personal de almacén sin ese permiso no debe poder ejecutarla. | Implementado | `src/routes/api/warehouse/materialApiRoute.js`, `src/controllers/api/warehouse/materialController.js`, `src/constants/permissions.js`, modelo `StockAdjustment` |
| RF-CAT-010 | Personal de almacén o el Administrador del sistema deben poder crear un proveedor con razón social, nombre comercial y estado válido; el sistema debe asignarle un código único. Personal de almacén inicia el alta desde el selector de una compra o de otro formulario operativo autorizado, sin acceder al listado independiente. | Implementado | `src/routes/api/warehouse/supplierApiRoute.js`, `src/views/pages/warehouse/goodsReceipts/goodsReceiptsPage.ejs`, `src/services/warehouse/supplierService.js` |
| RF-CAT-011 | El Administrador del sistema del área Sistemas debe poder actualizar los datos admitidos y el estado activo de un proveedor sin eliminar sus relaciones o historia. | Implementado | `src/routes/api/warehouse/supplierApiRoute.js` |
| RF-CAT-012 | El sistema debe rechazar una oferta de proveedor duplicada sin modificar sus datos, existencia ni costo. | Implementado | modelo `SupplierMaterial`, `src/services/warehouse/materials/materialService.js` |
| RF-CAT-013 | Personal de almacén o el Administrador del sistema deben poder crear un cliente con estado activo válido; cuando indique un asesor, éste debe corresponder a una persona registrada. Personal de almacén inicia el alta desde el selector de una salida autorizada, sin acceder al listado independiente. | Implementado | `src/routes/api/sales/clientApiRoute.js`, `src/views/pages/warehouse/goodsIssues/goodsIssuesPage.ejs`, `tests/integration/controllers/clientControllerDbTest.js` |
| RF-CAT-014 | El Administrador del sistema del área Sistemas debe poder actualizar los datos admitidos y el estado activo de un cliente sin eliminar sus relaciones o historia. | Implementado | `src/routes/api/sales/clientApiRoute.js`, `tests/integration/controllers/clientControllerDbTest.js` |
| RF-CAT-015 | Personal de almacén o el Administrador del sistema deben poder crear una merma con datos propios a partir de un material y proveedor usados como plantilla. | Implementado | `src/routes/api/warehouse/wasteApiRoute.js`, `src/services/warehouse/wastes/wasteService.js` |
| RF-CAT-016 | El sistema debe impedir que una edición de merma cambie su proveedor, presentación, unidad de medida o dimensiones, para conservar su identidad física. | Implementado | `src/dtos/wasteDTO.js`, `src/services/warehouse/wastes/wasteService.js` |
| RF-CAT-017 | Personal de almacén o el Administrador del sistema deben poder actualizar nombre, stock mínimo, costo unitario máximo y estado activo de una merma sin alterar existencias ni historia; `RF-MER-003` precisa esa misma edición. | Implementado | `src/routes/api/warehouse/wasteApiRoute.js`, `src/views/pages/warehouse/wastes` |
| RF-CAT-018 | El Administrador del sistema debe poder ajustar las existencias de una merma únicamente mediante la acción autorizada disponible desde su consulta; el personal de almacén sin ese permiso no debe poder ejecutarla. | Implementado | `src/routes/api/warehouse/wasteApiRoute.js`, `src/controllers/api/warehouse/wasteController.js`, `src/constants/permissions.js`, modelo `WasteStockAdjustment` |
| RF-CAT-019 | Un usuario operativo autorizado debe poder consultar unidades de medida activas para las operaciones que las requieren; su mantenimiento se rige por `RF-CAT-022` a `RF-CAT-024`. | Implementado | `src/routes/api/warehouse/unitMeasureApiRoute.js`; `src/routes/api/admin/catalogApiRoute.js` |
| RF-CAT-020 | Un usuario autorizado debe poder consultar motivos de ajuste activos para las operaciones que los requieren; su mantenimiento se rige por `RF-CAT-022` a `RF-CAT-024`. | Implementado | `src/routes/api/warehouse/reasonApiRoute.js`; `src/routes/api/admin/catalogApiRoute.js` |
| RF-CAT-021 | Un usuario autorizado debe poder consultar estados de cumplimiento activos; su mantenimiento se rige por `RF-CAT-022` a `RF-CAT-024` y no permite asignar libremente el estado de un documento. | Implementado | `src/routes/api/warehouse/fulfillmentStatusApiRoute.js`; `src/routes/api/admin/catalogApiRoute.js` |
| RF-CAT-022 | Sólo el Administrador del sistema del área Sistemas debe poder abrir y consultar las pantallas de áreas, roles, presentaciones, unidades de medida, motivos de ajuste y estados de cumplimiento administrables. | Implementado | `src/routes/web/admin/catalogWebRoute.js`, `src/routes/api/admin/catalogApiRoute.js`, permiso `catalogs:manage` |
| RF-CAT-023 | El administrador autorizado debe poder crear una entrada activa o inactiva en Áreas, Roles, Presentaciones, Unidades de medida, Motivos de ajuste o Estados de cumplimiento, capturando únicamente los campos admitidos para el recurso. | Implementado | `src/services/admin/catalogService.js`, `src/controllers/api/admin/catalogController.js` |
| RF-CAT-024 | El administrador autorizado debe poder editar los datos admitidos y el estado activo de una opción de los seis catálogos auxiliares; debe rechazarse un recurso o dato no admitido sin modificar el catálogo. | Implementado | `src/services/admin/catalogService.js`, `tests/unit/services/admin/catalogServiceTest.js` |
| RF-CAT-025 | Personal de almacén o el Administrador del sistema deben poder consultar, buscar y filtrar por proveedor las ofertas de consumibles, sin incluir materiales ni modificar existencias. | Implementado | `src/routes/api/warehouse/consumableApiRoute.js`, `src/services/warehouse/consumables/consumableService.js`, `src/views/pages/warehouse/consumables` |
| RF-CAT-026 | Personal de almacén o el Administrador del sistema deben poder crear un consumible y su oferta de proveedor con presentación y unidad explícitas, sin dimensiones; su existencia inicial sigue las variantes de alta directa y desde compra de los criterios de `RF-CAT-006`. | Implementado | `src/controllers/api/warehouse/consumableController.js`, `src/services/warehouse/consumables/consumableService.js` |
| RF-CAT-027 | Personal de almacén o el Administrador del sistema deben poder editar el nombre y stock mínimo compartidos de un consumible y el costo máximo y estado de la oferta seleccionada, sin cambiar su tipo, identidad física ni existencia. | Implementado | `src/services/warehouse/consumables/consumableService.js`, `src/public/js/pages/warehouse/materials/materialForm.js` |
| RF-CAT-028 | Personal de almacén o el Administrador del sistema deben poder retirar una oferta de consumible sólo cuando no exista historia operativa protegida; la identidad sólo debe eliminarse cuando no conserve otras ofertas. | Implementado | `src/services/warehouse/consumables/consumableService.js`, `src/services/warehouse/materials/materialService.js` |
| RF-CAT-029 | El Administrador del sistema debe poder ajustar la existencia de un consumible mediante motivo y observaciones, conservando el ajuste y movimiento trazables; un recurso de otro tipo debe rechazarse. | Implementado | `src/routes/api/warehouse/consumableApiRoute.js`, `src/services/warehouse/consumables/consumableService.js` |

### Criterios de alta de artículos

- **CA-RF-CAT-006-1:** en el alta directa se requieren costo máximo y existencia
  inicial no negativos; se conserva el ajuste inicial con sus observaciones.
- **CA-RF-CAT-006-2:** desde una compra no se solicitan costo máximo, existencia
  inicial, motivo ni observaciones de ajuste. La oferta se crea sin existencia ni ajuste
  inicial; el detalle recibido establece costo y existencia al confirmar la compra.
- **CA-RF-CAT-006-3:** si la identidad ya existe para otro proveedor, se reutiliza y se
  crea únicamente la oferta nueva; si la oferta ya existe, se rechaza sin modificarla.
- **CA-RF-CAT-026-1:** las mismas variantes se aplican al consumible con clasificación
  explícita y sin dimensiones; su unidad de medida no está restringida a «pieza».

`RF-CAT-016` y `RF-MER-005` describen la misma garantía de identidad física de la merma;
`RF-CAT-017` y `RF-MER-003` describen la misma edición. Sus IDs se conservan por
trazabilidad y se comprueban juntos, sin exigir operaciones duplicadas.
