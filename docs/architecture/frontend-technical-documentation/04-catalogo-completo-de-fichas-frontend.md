# 4. Catálogo completo de fichas frontend

La unidad de documentación es el **flujo funcional**, no un archivo aislado. Cada fila
cubre todos sus módulos propietarios de servicio, aplicación, página y EJS; los símbolos
compartidos aparecen después en una ficha transversal. De este modo no se presenta
materiales como si fuera el único flujo documentado ni se repite una ficha idéntica por
cada operación CRUD. Las rutas concretas se verifican en el [contrato API](../api-contract/index.md)
y las páginas publicadas en el [mapa generado](../../generated/code-map.md#rutas-web-19).

### Fichas de flujos funcionales

| Flujo | Vista y composición | Aplicación y transporte | Contrato y comportamiento propio | Diagrama aplicable |
| --- | --- | --- | --- | --- |
| Inicio de sesión | `loginPage.ejs` y `loginForm.js` recopilan credenciales; `indexPage.js` prepara la portada autenticada. | `application/auth/login.js` coordina `services/authService.js`; sus exports `registerRequest` y `resetPasswordRequest` no tienen consumidor ni ruta vigente y se registran como brecha, no como funcionalidad publicada. | `POST /api/auth/login`; normaliza la respuesta de éxito y deja cookies, tokens y permisos efectivos al servidor. | **Secuencia**, porque cruza formulario, API y establecimiento de sesión; reutilizar el recorrido HTTP de `code-diagrams/index.md` para las capas servidoras. |
| Personas | `personsPage.ejs`, `personsPage.js`, `personModal.js` y `personForm.js` componen listado, alta y edición. | `application/admin/persons/persons.js` usa `services/admin/personService.js`; consulta departamentos mediante su catálogo. | `GET`, `POST` y `PUT /api/admin/persons`; adapta la persona devuelta y refresca el listado. | **Ciclo CRUD compartido**; no requiere secuencia propia mientras no cambie la coordinación. |
| Usuarios | `usersPage.ejs`, `usersPage.js`, `userModal.js` y `userForm.js` separan alta, edición y cambio de contraseña. | `application/admin/users/users.js` usa `userService.js` y consume los catálogos de roles y departamentos. | `GET`, `POST`, `PATCH /api/admin/users/:id` y `PATCH .../:id/password`; el modo decide campos y mutación. | **Actividad o secuencia específica** sólo para cambio de contraseña si se agregan pasos asíncronos; el CRUD usa la vista común. |
| Clientes | `clientsPage.ejs`, `clientModal.ejs`, `clientsPage.js`, `clientModal.js` y `clientForm.js`. | `application/sales/clients/clients.js` usa `services/sales/clientService.js`; `application/sales/report.js` usa el servicio de reporte. | CRUD de `/api/sales/clients` y exportación `/api/sales/reports/clients/excel`. | **Ciclo CRUD** para mantenimiento y **secuencia corta de descarga** sólo si se necesita explicar la exportación. |
| Proveedores | `suppliersPage.ejs`, `supplierModal.ejs`, `suppliersPage.js`, `supplierModal.js` y `supplierForm.js`. | `application/warehouse/suppliers/suppliers.js` usa `supplierService.js`; el reporte usa la fábrica común. | CRUD de `/api/warehouse/suppliers` y reporte de proveedores. | **Ciclo CRUD compartido**; cada operación conserva su vista aplicada `DIA-FE-CU-*`, sin añadir una secuencia dinámica repetida. |
| Materiales | `materialsPage.ejs`, `materialModal.ejs`, `materialsPage.js`, `materialModal.js`, `materialForm.js` y `materialFields.js`. | `application/warehouse/materials/materials.js` configura `createCrudApplication` sobre `materialService.js`. | CRUD de `/api/warehouse/materials`; `goodsReceipt` omite `maxUnitCost` al crear y el ajuste usa `PATCH /:id/stock`. | **Secuencia** para ajuste de existencias por su mutación adicional y **ciclo CRUD** para el resto. |
| Mermas | `wastesPage.ejs`, `wastesPage.js`, `wasteModal.js`, `wasteForm.js` y `wasteFields.js`. | `application/warehouse/wastes/wastes.js` configura la fábrica CRUD sobre `wasteService.js`. | CRUD de `/api/warehouse/wastes`, plantillas de material y ajuste `PATCH /:id/stock`. | **Secuencia** sólo para creación desde plantilla o ajuste si se documenta esa bifurcación; CRUD común para las demás operaciones. |
| Entradas de almacén | `goodsReceiptsPage.ejs`, `goodsReceiptsPage.js`, formulario, modal y detalles componen el documento; `correctionForm.js` y `correctionModal.js` aíslan corrección/cancelación. | `application/warehouse/goodsReceipts/goodsReceipts.js` usa `goodsReceiptService.js` y catálogos; el reporte usa `createReportApplication`. | Lista, alta, edición de encabezado, corrección y cancelación bajo `/api/warehouse/goods-receipts`. | **Secuencia** para alta y **actividad/secuencia** para corrección y cancelación, pues tienen decisiones y efectos de inventario distintos. |
| Salidas de materiales | `goodsIssuesPage.ejs`, página, modal y formulario coordinan encabezado y detalles; `returns/goodsIssueReturn.js` gestiona devoluciones. | `application/warehouse/goodsIssues/goodsIssues.js` adapta `createIssueApplication` sobre `goodsIssueService.js`. | Lista, alta, edición, encabezado, surtimiento y devolución bajo `/api/warehouse/goods-issues`. | **Secuencia** para surtimiento y devolución; **máquina de estados** se referencia desde requisitos, no se redibuja en frontend. |
| Salidas de mermas | `wasteIssuesPage.ejs`, página, modal, formulario y `returns/wasteIssueReturn.js`. | `application/warehouse/wasteIssues/wasteIssues.js` reutiliza `createIssueApplication` sobre `wasteIssueService.js`. | Mismas clases de operación bajo `/api/warehouse/waste-issues`, con selección y cantidades propias de merma. | **Secuencia** para surtimiento y devolución; compartir la vista de estados normativa. |
| Movimientos | `movementsPage.ejs` y `movementsPage.js` eligen inventario de materiales o mermas según contexto de la vista. | `application/admin/movements/movements.js` usa `movementService.js`; `application/admin/report.js` coordina exportaciones. | Lecturas `/api/admin/movements/{materials,wastes}` y reportes correspondientes. | **Flujo de datos/listado**; no secuencia propia mientras sólo consulte y descargue. |
| Catálogos auxiliares | `catalogsPage.ejs` compone `mainTable` y el modal compartido; cada URL representa un único recurso registrado. | `catalogsPage.js`, `catalogForm.js`, `catalogModal.js` y `catalogDatatable.js` coordinan `application/admin/catalogs/catalogs.js`; los adaptadores operativos de Select2 permanecen separados. | GET, POST y PUT bajo `/api/admin/catalogs/:catalog`, protegidos con `catalogs:manage`; las lecturas operativas conservan sus endpoints y permisos. | **Ciclo CRUD compartido** configurado por lista blanca para `CU-CAT-27` a `CU-CAT-44`. Las lecturas operativas para selectores conservan sus endpoints y permisos, pero no constituyen casos de uso independientes. |
| Exportaciones dentro de cada módulo | Los botones pertenecen a las páginas de clientes, proveedores, inventarios, compras, salidas, personas, usuarios y movimientos; no existe una página general de reportes. | `createReportApplication.js` centraliza la descarga; `application/{admin,sales,warehouse}/report.js` configura cada `reportService.js` desde la página propietaria. | Cada solicitud `GET .../reports/.../excel` continúa la consulta y los filtros del módulo visible; no decide permisos del servidor. | Se documenta dentro del caso y recorrido del módulo propietario. La factory sólo requiere una vista estructural compartida, no una secuencia transversal de reportes. |

### Fichas de infraestructura compartida

| Pieza | Contrato documentado | Consumidores y límite | Diagrama aplicable |
| --- | --- | --- | --- |
| `createCrudApplication.js` | Configura lecturas y mutaciones, extrae claves de respuesta y permite mutaciones adicionales. | Personas, usuarios, clientes, proveedores, materiales y mermas; no conoce DOM ni reglas de dominio. | Diagrama canónico de **fábrica CRUD** en `code-diagrams/index.md`. |
| `createIssueApplication.js` e `issueHeaderRules.js` | Especializan el ciclo de documentos con encabezado, detalles y reglas de edición visibles. | Salidas de materiales y mermas; las transiciones definitivas siguen en backend. | **Actividad** para bifurcaciones del encabezado y **secuencia** para coordinación asíncrona. |
| `createReportApplication.js` | Convierte una petición configurada en descarga y nombre de archivo. | Reportes de admin, ventas y almacén. | Normalmente ninguno; secuencia sólo al investigar descarga o error. |
| `axiosInstanceApi.js` / `apiRequest` | Cliente HTTP común, tratamiento de sesión y propagación normalizada de errores. | Todos los servicios del navegador. | Participante único en secuencias; nunca un diagrama por llamada. |
| `ui/forms`, `ui/inventory`, `ui/issues` | Reciben elementos y callbacks; controlan interacción visual y emiten resultados al propietario. | Formularios CRUD, selectores de inventario y documentos de salida. | **Componentes** si cambia la reutilización; **secuencia** si coordina eventos asíncronos. |
| `plugins/datatable`, `plugins/select2`, `plugins/mdb`, `plugins/flatpickr`, `plugins/swal` | Encapsulan bibliotecas externas y su configuración común. | Páginas, modales, fechas, confirmaciones y catálogos. | Sin vista por adaptador; aparecen en el diagrama de componentes compartidos. |
| `utils` y `constants` | Transformaciones, validaciones auxiliares, formatos y valores sin estado visual. | Todas las capas del navegador que los importan. | Sin diagrama salvo que una transformación tenga decisiones de negocio, caso en que debe moverse o documentarse en su flujo propietario. |
| `views/shared` | Parciales configurables para formularios, tablas, modales y estructura común. | Vistas EJS propietarias. | Diagrama de **componentes/composición**, no secuencia por inclusión. |

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

La casilla `isActive` de materiales y mermas viaja en `create` o `edit`: no provoca un
cambio de modo y no debe confundirse con la identidad ni con una transición documental.
En salidas, `resolveIssueEditMode` sólo traduce el estado persistido a la presentación
adecuada; los servicios derivan `fulfillmentStatus` después de surtir o devolver. Por
ello el frontend no ofrece esos estados como campos editables.

| Flujo | Modo | Controles habilitados por la vista | Controles bloqueados o de consulta |
| --- | --- | --- | --- |
| Material | `create` | Identidad y relación (`name`, `supplierId`, `presentationId`, `unitMeasureId`, `base`, `height`), `minStock`, `maxUnitCost`, `isActive`, `newStock` y `observations` | `reasonId` muestra el motivo fijo de stock inicial. En el contexto de compra se ocultan stock inicial y costo máximo. |
| Material | `edit` | `name`, `minStock`, `maxUnitCost`, `isActive` | Proveedor, presentación, unidad, dimensiones y sección de stock. |
| Material | `edit-stock` | `newStock`, `reasonId`, `observations` | Identidad, relación, mínimos, costo y estado. |
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
[matriz de operaciones](../../requirements/requirements-operations-matrix.md#modos-precondiciones-y-datos-modificados);
las secuencias muestran únicamente la coordinación que cruza componentes o transporte,
no vuelven a enumerar cada control.
