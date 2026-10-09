# 1. Responsabilidades y contratos del frontend

La unidad de documentación es el **flujo funcional**, no un archivo aislado. Cada fila
cubre todos sus módulos propietarios de servicio, aplicación, página y EJS; los símbolos
compartidos aparecen después en una ficha transversal. De este modo no se presenta
materiales como si fuera el único flujo documentado ni se repite una ficha idéntica por
cada operación CRUD. Las rutas concretas se verifican en el [contrato API](../../../openapi/api-contract.md)
y las páginas publicadas en el [mapa generado](../code-map.md).

### Fichas de flujos funcionales

| Flujo | Vista y composición | Aplicación y transporte | Contrato y comportamiento propio | Mapa de código propietario |
| --- | --- | --- | --- | --- |
| Inicio de sesión | Detalle en la referencia del módulo. | Detalle en la referencia del módulo. | Detalle en la referencia del módulo. | [authentication](04-authentication-code.md) |
| Personas | Detalle en la referencia del módulo. | Detalle en la referencia del módulo. | Detalle en la referencia del módulo. | [persons](05-persons-code.md) |
| Usuarios | Detalle en la referencia del módulo. | Detalle en la referencia del módulo. | Detalle en la referencia del módulo. | [users](06-users-code.md) |
| Clientes | Detalle en la referencia del módulo. | Detalle en la referencia del módulo. | Detalle en la referencia del módulo. | [clients](07-clients-code.md) |
| Proveedores | Detalle en la referencia del módulo. | Detalle en la referencia del módulo. | Detalle en la referencia del módulo. | [suppliers](08-suppliers-code.md) |
| Materiales | Detalle en la referencia del módulo. | Detalle en la referencia del módulo. | Detalle en la referencia del módulo. | [materials](09-materials-code.md) |
| Consumibles | Detalle en la referencia del módulo. | Detalle en la referencia del módulo. | Detalle en la referencia del módulo. | [consumables](10-consumables-code.md) |
| Mermas | Detalle en la referencia del módulo. | Detalle en la referencia del módulo. | Detalle en la referencia del módulo. | [wastes](11-wastes-code.md) |
| Entradas de almacén | Detalle en la referencia del módulo. | Detalle en la referencia del módulo. | Detalle en la referencia del módulo. | [goods-receipts](12-goods-receipts-code.md) |
| Salidas de materiales y consumibles | Detalle en la referencia del módulo. | Detalle en la referencia del módulo. | Detalle en la referencia del módulo. | [goods-issues](13-goods-issues-code.md) |
| Salidas de mermas | Detalle en la referencia del módulo. | Detalle en la referencia del módulo. | Detalle en la referencia del módulo. | [waste-issues](14-waste-issues-code.md) |
| Movimientos | Detalle en la referencia del módulo. | Detalle en la referencia del módulo. | Detalle en la referencia del módulo. | [movements](15-movements-code.md) |
| Catálogos auxiliares | Detalle en la referencia del módulo. | Detalle en la referencia del módulo. | Detalle en la referencia del módulo. | [catalogs](16-catalogs-code.md) |
| Exportaciones dentro de cada módulo | Los botones pertenecen a las páginas de clientes, proveedores, inventarios, compras, salidas, personas, usuarios y movimientos; no existe una página general de reportes. | `createReportApplication.js` adapta el request y devuelve `response.data`; los consumidores coordinan la descarga; `application/{admin,sales,warehouse}/report.js` configura cada `reportService.js` desde la página propietaria. | Cada solicitud `GET .../reports/.../excel` continúa la consulta y los filtros del módulo visible; no decide permisos del servidor. | [Código compartido](03-shared-code-and-coverage.md) |

### Fichas de infraestructura compartida

| Pieza | Contrato documentado | Consumidores y límite | Mapa de código propietario |
| --- | --- | --- | --- |
| `createCrudApplication.js` | Configura lecturas y mutaciones, extrae claves de respuesta y permite mutaciones adicionales. | Personas, usuarios, clientes, proveedores, materiales, consumibles y mermas; no conoce DOM ni reglas de dominio. | [Applications y requests](../reuse-and-refactoring/02-browser-applications-and-requests.md) |
| `createIssueApplication.js` e `issueHeaderRules.js` | Especializan el ciclo de documentos con encabezado, detalles y reglas de edición visibles. | Salidas de materiales, consumibles y mermas; las transiciones definitivas siguen en backend. | [Applications y requests](../reuse-and-refactoring/02-browser-applications-and-requests.md) |
| `createReportApplication.js` | Devuelve `response.data` de una petición configurada; nombre de archivo y descarga permanecen en el consumidor. | Reportes de admin, ventas y almacén. | [Código compartido](03-shared-code-and-coverage.md) |
| `axiosInstanceApi.js` / `apiRequest` | Cliente HTTP común, tratamiento de sesión y propagación normalizada de errores. | Todos los servicios del navegador. | [Código compartido](03-shared-code-and-coverage.md) |
| `ui/forms`, `ui/inventory`, `ui/issues` | Reciben elementos y callbacks; controlan interacción visual y emiten resultados al propietario. | Formularios CRUD, selectores de inventario y documentos de salida. | [Composición de interfaz](../reuse-and-refactoring/03-interface-and-table-lifecycle.md) |
| `plugins/datatable`, `plugins/select2`, `plugins/mdb`, `plugins/flatpickr`, `plugins/swal` | Encapsulan bibliotecas externas y su configuración común. | Páginas, modales, fechas, confirmaciones y catálogos. | [Composición de interfaz](../reuse-and-refactoring/03-interface-and-table-lifecycle.md) |
| `utils` y `constants` | Transformaciones, validaciones auxiliares, formatos y valores sin estado visual. | Todas las capas del navegador que los importan. | [Código compartido](03-shared-code-and-coverage.md) |
| `views/shared` | Parciales configurables para formularios, tablas, modales y estructura común. | Vistas EJS propietarias. | [Composición de interfaz](../reuse-and-refactoring/03-interface-and-table-lifecycle.md) |

### Contrato técnico de los modos de formulario de almacén

Los modos provienen de `FORM_MODES`; no son estados persistidos. La habilitación se
centraliza en los arreglos `materialFields` y `wasteFields`, en
`ISSUE_HEADER_ENABLED_MODES` y `issueFormUI`, y en la configuración del modal de
compras. La siguiente matriz es el inventario técnico de esa frontera: usa nombres de
propiedad y reúne todos los modos para facilitar la revisión del código. El manual no
la reproduce; allí cada procedimiento nombra sólo los controles que el operador usa y
advierte los bloqueos que afectan ese recorrido.

El atributo visual `disabled` no constituye una regla de autorización. Impide la
captura accidental y comunica el modo vigente, pero los DTO, validadores y servicios
del servidor siguen limitando los datos aceptados y aplicando las precondiciones de la
operación. Un valor visible en un control bloqueado es contexto para el operador, no
parte editable de la solicitud.

La casilla `isActive` de materiales, consumibles y mermas viaja en `create` o `edit`: no provoca un
cambio de modo y no debe confundirse con la identidad ni con una transición documental.
En salidas, `resolveIssueEditMode` sólo traduce el estado persistido a la presentación
adecuada; los servicios derivan `fulfillmentStatus` después de surtir o devolver. Por
ello el frontend no ofrece esos estados como campos editables.

| Flujo | Modo | Controles habilitados por la vista | Controles bloqueados o de consulta |
| --- | --- | --- | --- |
| Material | `create` | Identidad y relación (`name`, `supplierId`, `presentationId`, `unitMeasureId`, `base`, `height`), `minStock`, `maxUnitCost`, `isActive`, `newStock` y `observations` | `reasonId` muestra el motivo fijo de stock inicial. En el contexto de compra se ocultan stock inicial y costo máximo. |
| Material | `edit` | `name`, `minStock`, `maxUnitCost`, `isActive` | Proveedor, presentación, unidad, dimensiones y sección de stock. |
| Material | `edit-stock` | `newStock`, `reasonId`, `observations` | Identidad, relación, mínimos, costo y estado. |
| Consumible | `create` | Identidad y relación (`name`, `supplierId`, `presentationId`, `unitMeasureId`), `minStock`, `maxUnitCost`, `isActive`, `newStock` y `observations` | `base` y `height` permanecen ocultos; `reasonId` muestra el motivo fijo de stock inicial. |
| Consumible | `edit` | `name`, `minStock`, `maxUnitCost`, `isActive` | Proveedor, presentación, unidad, tipo, dimensiones y sección de stock. |
| Consumible | `edit-stock` | `newStock`, `reasonId`, `observations` | Identidad, relación, mínimos, costo y estado. |
| Merma | `create` | Plantilla (`supplierId`, `materialId`), `name`, `base`, `height`, `minStock`, `maxUnitCost`, `isActive`, `newStock` y `observations` | `reasonId` muestra el motivo fijo de stock inicial; presentación y unidad son datos derivados de la plantilla. |
| Merma | `edit` | `name`, `minStock`, `maxUnitCost`, `isActive` | Plantilla, proveedor, presentación, unidad, dimensiones y sección de stock. |
| Merma | `edit-stock` | `newStock`, `reasonId`, `observations` | Identidad, plantilla, dimensiones, mínimos, costo y estado. |
| Compra | `create` | Tipo de comprobante, factura condicional, proveedor, receptor, fecha, observaciones y captura de detalles. | Ninguno de los datos nuevos; la captura de materiales se habilita después de elegir proveedor. |
| Compra | `edit` | Tipo de comprobante, factura condicional, receptor, fecha, observaciones y detalles nuevos. | Proveedor y detalles persistidos; éstos se cambian sólo mediante corrección o cancelación. |
| Compra | `view` | Ninguno. | Encabezado, detalles y acciones de una compra cancelada. |
| Salida de material o merma | `create` | Encabezado completo y captura de detalles. | Cantidades surtidas y devueltas, todavía inexistentes. |
| Salida de material o merma | `edit` | Encabezado completo y detalles de una salida pendiente. | Cantidades surtidas o devueltas. |
| Salida de material o merma | `edit-header` | Encabezado completo. | Todos los detalles. |
| Salida de material o merma | `edit-detail` | Selección del renglón y cantidad de proyecto que se surtirá. | Encabezado y detalles ya surtidos. |
| Salida de material o merma | `return` | Cantidad y observaciones de la devolución en su diálogo específico. | Encabezado y detalle original. |
| Salida de material o merma | `view` | Ninguno. | Encabezado y detalles de una salida cancelada. |

La regla funcional equivalente y los estados requeridos se mantienen en la
[modos, precondiciones y efectos](../../../../requirements/requirements-specification/06-operation-modes-and-effects.md);
las secuencias muestran únicamente la coordinación que cruza componentes o transporte,
no vuelven a enumerar cada control.

Los mapas propietarios muestran imports y grupos de archivos. La ejecución de operaciones
se consulta en [procesos](../../processes/index.md); esta referencia conserva sólo
contratos de código y nombres de propiedades necesarios para revisar implementación.
