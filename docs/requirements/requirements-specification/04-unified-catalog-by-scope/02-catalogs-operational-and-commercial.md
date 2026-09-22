# 4.2 Catálogos operativos y comerciales

La separación siguiente aplica la singularidad adoptada por el proyecto: consultar,
crear, actualizar, retirar y ajustar son obligaciones independientes porque tienen
permisos y resultados comprobables distintos. Cada `RF-*` describe una capacidad
observable; las restricciones que se reutilizan entre operaciones se expresan una sola
vez como `RN-*`, en lugar de subdividir o extender la explicación dentro de una fila.

Para conservar trazabilidad, `RF-CAT-001` a `RF-CAT-005` mantienen el primer recurso
de la obligación original y se acotan a su consulta. Las operaciones separadas reciben
`RF-CAT-006` a `RF-CAT-018`; las demás consultas antes agrupadas en `RF-CAT-005`
reciben `RF-CAT-019` a `RF-CAT-024`. No se reasigna un identificador existente a otro
recurso.

La administración compartida comprende exactamente **Áreas**, **Roles**,
**Presentaciones**, **Unidades de medida**, **Motivos de ajuste** y **Estados de
cumplimiento**. Clientes, proveedores, materiales y mermas permanecen en sus requisitos
y módulos propietarios; no se interpretan como variantes del catálogo auxiliar.

| ID | Requisito y criterio de aceptación | Estado | Evidencia principal |
| --- | --- | --- | --- |
| RF-CAT-001 | Personal de almacén o el Administrador del sistema deben poder consultar materiales y sus ofertas de proveedor sin modificar existencias. | Implementado | `src/routes/api/warehouse/materialApiRoute.js`, `src/views/pages/warehouse/materials` |
| RF-CAT-002 | Personal de almacén o el Administrador del sistema deben poder consultar proveedores autorizados sin modificar sus datos. | Parcial | `src/routes/api/warehouse/supplierApiRoute.js`, `src/routes/web/warehouse/supplierWebRoute.js`, `src/constants/permissions.js` |
| RF-CAT-003 | Personal de almacén o el Administrador del sistema deben poder consultar clientes autorizados sin modificar sus datos. | Parcial | `src/routes/api/sales/clientApiRoute.js`, `src/routes/web/sales/clientWebRoute.js`, `src/constants/permissions.js` |
| RF-CAT-004 | Personal de almacén o el Administrador del sistema deben poder consultar existencias de merma sin modificar sus datos ni existencias. | Implementado | `src/routes/api/warehouse/wasteApiRoute.js`, `src/views/pages/warehouse/wastes` |
| RF-CAT-005 | Un usuario autorizado debe poder consultar presentaciones activas sin modificar el catálogo. | Implementado | `src/routes/api/warehouse/presentationApiRoute.js` |
| RF-CAT-006 | Personal de almacén o el Administrador del sistema deben poder crear un material y su oferta de proveedor con identidad y datos de inventario válidos. En el alta directa, costo máximo y existencia inicial son obligatorios; si el alta se abre desde una compra, esos campos no se solicitan ni se validan porque el costo y la existencia se obtienen del detalle recibido al registrar la compra. | Implementado | `src/dtos/materialDTO.js`, `src/validators/forms/materialValidations.js`, `src/services/warehouse/materials/materialService.js` |
| RF-CAT-007 | Personal de almacén o el Administrador del sistema deben poder editar el nombre y stock mínimo compartidos de un material, y el costo máximo y estado de la oferta seleccionada, sin cambiar existencias. | Implementado | `src/dtos/materialDTO.js`, `src/services/warehouse/materials/materialService.js`, `src/public/js/pages/warehouse/materials/materialFields.js` |
| RF-CAT-008 | Personal de almacén o el Administrador del sistema deben poder retirar una oferta de material sólo cuando el material no tenga historia operativa protegida. | Implementado | `src/services/warehouse/materials/supplierMaterialService.js` |
| RF-CAT-009 | El Administrador del sistema debe poder ajustar las existencias de un material únicamente mediante la acción autorizada disponible desde su consulta, conservando el resultado trazable; el personal de almacén sin ese permiso no debe poder ejecutarla. | Implementado | `src/routes/api/warehouse/materialApiRoute.js`, `src/controllers/api/warehouse/materialController.js`, `src/constants/permissions.js`, modelo `StockAdjustment` |
| RF-CAT-010 | Personal de almacén o el Administrador del sistema deben poder crear un proveedor con razón social, nombre comercial y estado válido; el sistema debe asignarle un código único. | Parcial | `src/routes/api/warehouse/supplierApiRoute.js`, `src/routes/web/warehouse/supplierWebRoute.js`, `src/services/warehouse/supplierService.js` |
| RF-CAT-011 | El Administrador del sistema del área Sistemas debe poder actualizar los datos admitidos y el estado activo de un proveedor sin eliminar sus relaciones o historia. | Implementado | `src/routes/api/warehouse/supplierApiRoute.js` |
| RF-CAT-012 | El sistema debe rechazar una oferta proveedor-material duplicada sin modificar sus datos, existencia ni costo. | Implementado | modelo `SupplierMaterial`, `src/services/warehouse/materials/materialService.js` |
| RF-CAT-013 | Personal de almacén o el Administrador del sistema deben poder crear un cliente con estado activo válido; cuando indique un asesor, éste debe corresponder a una persona registrada. | Parcial | `src/routes/api/sales/clientApiRoute.js`, `src/routes/web/sales/clientWebRoute.js`, `tests/integration/controllers/clientControllerDbTest.js` |
| RF-CAT-014 | El Administrador del sistema del área Sistemas debe poder actualizar los datos admitidos y el estado activo de un cliente sin eliminar sus relaciones o historia. | Implementado | `src/routes/api/sales/clientApiRoute.js`, `tests/integration/controllers/clientControllerDbTest.js` |
| RF-CAT-015 | Personal de almacén o el Administrador del sistema deben poder crear una merma con datos propios a partir de un material y proveedor usados como plantilla. | Implementado | `src/routes/api/warehouse/wasteApiRoute.js`, `src/services/warehouse/wastes/wasteService.js` |
| RF-CAT-016 | El sistema debe impedir que una edición de merma cambie su proveedor, presentación, unidad de medida o dimensiones, para conservar su identidad física. | Implementado | `src/dtos/wasteDTO.js`, `src/services/warehouse/wastes/wasteService.js` |
| RF-CAT-017 | Personal de almacén o el Administrador del sistema deben poder actualizar el nombre, estado activo y datos secundarios admitidos de una merma sin alterar sus existencias ni historia. | Implementado | `src/routes/api/warehouse/wasteApiRoute.js`, `src/views/pages/warehouse/wastes` |
| RF-CAT-018 | El Administrador del sistema debe poder ajustar las existencias de una merma únicamente mediante la acción autorizada disponible desde su consulta; el personal de almacén sin ese permiso no debe poder ejecutarla. | Implementado | `src/routes/api/warehouse/wasteApiRoute.js`, `src/controllers/api/warehouse/wasteController.js`, `src/constants/permissions.js`, modelo `WasteStockAdjustment` |
| RF-CAT-019 | Los usuarios operativos autorizados deben poder consultar unidades de medida activas; sólo el Administrador del sistema puede crear, editar o cambiar su estado desde la administración de catálogos. | Implementado | `src/routes/api/warehouse/unitMeasureApiRoute.js`; `src/routes/api/admin/catalogApiRoute.js` |
| RF-CAT-020 | Los usuarios operativos autorizados deben poder consultar motivos de ajuste activos; sólo el Administrador del sistema puede crear, editar o cambiar su estado desde la administración de catálogos. | Implementado | `src/routes/api/warehouse/reasonApiRoute.js`; `src/routes/api/admin/catalogApiRoute.js` |
| RF-CAT-021 | Los usuarios operativos autorizados deben poder consultar estados de cumplimiento activos; sólo el Administrador del sistema puede crearlos, editarlos o cambiar su estado desde la administración de catálogos. | Implementado | `src/routes/api/warehouse/fulfillmentStatusApiRoute.js`; `src/routes/api/admin/catalogApiRoute.js` |
| RF-CAT-022 | Sólo el Administrador del sistema del área Sistemas debe poder abrir y consultar las pantallas de áreas, roles, presentaciones, unidades de medida, motivos de ajuste y estados de cumplimiento administrables. | Implementado | `src/routes/web/admin/catalogWebRoute.js`, `src/routes/api/admin/catalogApiRoute.js`, permiso `catalogs:manage` |
| RF-CAT-023 | El administrador autorizado debe poder crear una entrada activa o inactiva en Áreas, Roles, Presentaciones, Unidades de medida, Motivos de ajuste o Estados de cumplimiento, capturando únicamente los campos admitidos para el recurso. | Implementado | `src/services/admin/catalogService.js`, `src/controllers/api/admin/catalogController.js` |
| RF-CAT-024 | El administrador autorizado debe poder editar los datos admitidos y el estado activo de una entrada de Áreas, Roles, Presentaciones, Unidades de medida, Motivos de ajuste o Estados de cumplimiento sin acceder a modelos o campos fuera de la lista blanca; una entrada inactiva no debe ofrecerse en operaciones nuevas. | Implementado | `src/services/admin/catalogService.js`, `tests/unit/services/admin/catalogServiceTest.js` |

`RF-CAT-002`, `RF-CAT-003`, `RF-CAT-010` y `RF-CAT-013` permanecen parciales porque
el Personal de almacén todavía no dispone de la consulta de proveedores y clientes desde
la cual debe iniciar sus altas. El Administrador del sistema sí puede realizar esos
recorridos; por tanto, `CU-CAT-01`, `CU-CAT-02`, `CU-CAT-05` y `CU-CAT-06` no están
disponibles aún para todos los actores definidos por el negocio.
