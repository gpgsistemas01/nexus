# Documentación técnica del frontend

## Propósito y alcance

Este documento aplica la [guía técnica común](technical-code-documentation.md) al código
que se ejecuta en el navegador y a su composición EJS: `src/public/js`,
`src/views/pages` y `src/views/shared`. El [documento de backend](backend-technical-documentation.md)
conserva rutas, controladores, servicios de dominio y persistencia. Una explicación de
frontend enlaza el [contrato API](../data/api-contract.md), pero no vuelve a declarar
permisos ni reglas de negocio que el servidor debe hacer cumplir.

## Capas documentales del navegador

La ubicación del módulo determina la responsabilidad que debe describirse. Antes de
crear una ficha se revisa una implementación equivalente en la misma fila.

| Ubicación | Responsabilidad documentada | Ejemplos existentes |
| --- | --- | --- |
| `public/js/services` | Método, URL, parámetros y cuerpo enviados mediante el cliente HTTP común. | `materialService.js`, `goodsIssueService.js`, `authService.js`. |
| `public/js/application` | Adaptación de respuestas y coordinación del caso de uso sin acceso directo al DOM. | `createCrudApplication.js`, `createIssueApplication.js`, `materials.js`. |
| `public/js/pages` | Composición e inicialización de una pantalla, formulario o modal propietario del recurso. | `materialsPage.js`, `materialForm.js`, `materialModal.js`. |
| `public/js/ui` | Comportamiento visual reutilizable que recibe el contexto por parámetros. | `formUI.js`, `modalUI.js`, `inventorySelectUI.js`. |
| `public/js/plugins` | Adaptadores y configuración común de DataTable, Select2, MDB, Flatpickr o SweetAlert. | `createDataTable.js`, `baseSelect.js`, `baseInstance.js`. |
| `public/js/utils` | Transformaciones sin propiedad visual o de dominio específico. | `formUtils.js`, `formatUtils.js`, `detailCollectionUtils.js`. |
| `views/pages` | Estructura EJS y scripts de entrada pertenecientes a una página. | `materialsPage.ejs`, `goodsIssuesPage.ejs`. |
| `views/shared` | Marcado reutilizado por más de un recurso y configurado por sus consumidores. | Formularios, tablas y modales compartidos. |

## Fichas por tipo de módulo

### Servicio HTTP del navegador

Se registra nombre exportado, constante de ruta, método HTTP, parámetros, cuerpo y forma
de respuesta entregada por `apiRequest`. La ficha enlaza la ruta propietaria del
contrato API. No describe transacciones ni errores internos del servidor.

### Aplicación

Se registra la fábrica o flujo reutilizado, configuración inyectada, claves extraídas de
la respuesta y nombres de dominio que exporta el módulo. Si existe una excepción —por
ejemplo omitir un campo en un contexto— se explica la condición y por qué no pertenece a
la fábrica común.

### Página, formulario y modal

Se documentan por separado:

- **página:** módulos que inicializa y contexto global que entrega;
- **formulario:** campos seleccionados, validación del navegador, normalización, modo y
  mutación que invoca;
- **modal:** preparación visual, carga de datos y contrato que entrega al formulario;
- **EJS:** parciales incluidos, elementos usados como puntos de montaje y scripts
  `type="module"`, conservando los cierres `contentFor`.

Sólo se enumeran selectores DOM cuando forman parte de la integración entre módulos. Una
lista de cada elemento o listener repetiría el código sin explicar el diseño.

### UI, plugin y utilidad compartida

La ficha declara consumidores, parámetros de configuración, eventos emitidos o
escuchados, estado interno y dependencia externa encapsulada. También indica qué
conocimiento **no** puede incorporar: un módulo compartido no importa la aplicación de
un recurso concreto ni decide permisos del servidor.

## Catálogo completo de fichas frontend

La unidad de documentación es el **flujo funcional**, no un archivo aislado. Cada fila
cubre todos sus módulos propietarios de servicio, aplicación, página y EJS; los símbolos
compartidos aparecen después en una ficha transversal. De este modo no se presenta
materiales como si fuera el único flujo documentado ni se repite una ficha idéntica por
cada operación CRUD. Las rutas concretas se verifican en el [contrato API](../data/api-contract.md)
y las páginas publicadas en el [mapa generado](../generated/code-map.md#rutas-web-16).

### Fichas de flujos funcionales

| Flujo | Vista y composición | Aplicación y transporte | Contrato y comportamiento propio | Diagrama aplicable |
| --- | --- | --- | --- | --- |
| Inicio de sesión | `loginPage.ejs` y `loginForm.js` recopilan credenciales; `indexPage.js` prepara la portada autenticada. | `application/auth/login.js` coordina `services/authService.js`; sus exports `registerRequest` y `resetPasswordRequest` no tienen consumidor ni ruta vigente y se registran como brecha, no como funcionalidad publicada. | `POST /api/auth/login`; normaliza la respuesta de éxito y deja cookies, tokens y permisos efectivos al servidor. | **Secuencia**, porque cruza formulario, API y establecimiento de sesión; reutilizar el recorrido HTTP de `code-diagrams.md` para las capas servidoras. |
| Personas | `personsPage.ejs`, `personsPage.js`, `personModal.js` y `personForm.js` componen listado, alta y edición. | `application/admin/persons/persons.js` usa `services/admin/personService.js`; consulta departamentos mediante su catálogo. | `GET`, `POST` y `PUT /api/admin/persons`; adapta la persona devuelta y refresca el listado. | **Ciclo CRUD compartido**; no requiere secuencia propia mientras no cambie la coordinación. |
| Usuarios | `usersPage.ejs`, `usersPage.js`, `userModal.js` y `userForm.js` separan alta, edición y cambio de contraseña. | `application/admin/users/users.js` usa `userService.js` y consume los catálogos de roles y departamentos. | `GET`, `POST`, `PATCH /api/admin/users/:id` y `PATCH .../:id/password`; el modo decide campos y mutación. | **Actividad o secuencia específica** sólo para cambio de contraseña si se agregan pasos asíncronos; el CRUD usa la vista común. |
| Clientes | `clientsPage.ejs`, `clientModal.ejs`, `clientsPage.js`, `clientModal.js` y `clientForm.js`. | `application/sales/clients/clients.js` usa `services/sales/clientService.js`; `application/sales/report.js` usa el servicio de reporte. | CRUD de `/api/sales/clients` y exportación `/api/sales/reports/clients/excel`. | **Ciclo CRUD** para mantenimiento y **secuencia corta de descarga** sólo si se necesita explicar la exportación. |
| Proveedores | `suppliersPage.ejs`, `supplierModal.ejs`, `suppliersPage.js`, `supplierModal.js` y `supplierForm.js`. | `application/warehouse/suppliers/suppliers.js` usa `supplierService.js`; el reporte usa la fábrica común. | CRUD de `/api/warehouse/suppliers` y reporte de proveedores. | **Ciclo CRUD compartido**; sin diagrama exclusivo. |
| Materiales | `materialsPage.ejs`, `materialModal.ejs`, `materialsPage.js`, `materialModal.js`, `materialForm.js` y `materialFields.js`. | `application/warehouse/materials/materials.js` configura `createCrudApplication` sobre `materialService.js`. | CRUD de `/api/warehouse/materials`; `goodsReceipt` omite `maxUnitCost` al crear y el ajuste usa `PATCH /:id/stock`. | **Secuencia** para ajuste de existencias por su mutación adicional y **ciclo CRUD** para el resto. |
| Mermas | `wastesPage.ejs`, `wastesPage.js`, `wasteModal.js`, `wasteForm.js` y `wasteFields.js`. | `application/warehouse/wastes/wastes.js` configura la fábrica CRUD sobre `wasteService.js`. | CRUD de `/api/warehouse/wastes`, plantillas de material y ajuste `PATCH /:id/stock`. | **Secuencia** sólo para creación desde plantilla o ajuste si se documenta esa bifurcación; CRUD común para las demás operaciones. |
| Entradas de almacén | `goodsReceiptsPage.ejs`, `goodsReceiptsPage.js`, formulario, modal y detalles componen el documento; `correctionForm.js` y `correctionModal.js` aíslan corrección/cancelación. | `application/warehouse/goodsReceipts/goodsReceipts.js` usa `goodsReceiptService.js` y catálogos; el reporte usa `createReportApplication`. | Lista, alta, edición de encabezado, corrección y cancelación bajo `/api/warehouse/goods-receipts`. | **Secuencia** para alta y **actividad/secuencia** para corrección y cancelación, pues tienen decisiones y efectos de inventario distintos. |
| Salidas de materiales | `goodsIssuesPage.ejs`, página, modal y formulario coordinan encabezado y detalles; `returns/goodsIssueReturn.js` gestiona devoluciones. | `application/warehouse/goodsIssues/goodsIssues.js` adapta `createIssueApplication` sobre `goodsIssueService.js`. | Lista, alta, edición, encabezado, surtimiento y devolución bajo `/api/warehouse/goods-issues`. | **Secuencia** para surtimiento y devolución; **máquina de estados** se referencia desde requisitos, no se redibuja en frontend. |
| Salidas de mermas | `wasteIssuesPage.ejs`, página, modal, formulario y `returns/wasteIssueReturn.js`. | `application/warehouse/wasteIssues/wasteIssues.js` reutiliza `createIssueApplication` sobre `wasteIssueService.js`. | Mismas clases de operación bajo `/api/warehouse/waste-issues`, con selección y cantidades propias de merma. | **Secuencia** para surtimiento y devolución; compartir la vista de estados normativa. |
| Movimientos | `movementsPage.ejs` y `movementsPage.js` eligen inventario de materiales o mermas según contexto de la vista. | `application/admin/movements/movements.js` usa `movementService.js`; `application/admin/report.js` coordina exportaciones. | Lecturas `/api/admin/movements/{materials,wastes}` y reportes correspondientes. | **Flujo de datos/listado**; no secuencia propia mientras sólo consulte y descargue. |
| Catálogos | No poseen página: alimentan Select2 y formularios consumidores. | `catalogs/{departments,roles,fulfillmentStatuses,presentations,reasons,unitMeasures}.js` adaptan sus servicios homólogos. | Operaciones `GET` de sólo lectura; entregan colecciones normalizadas a personas, usuarios, materiales y documentos. | **Sin diagrama propio**; se muestran como participantes sólo en el flujo consumidor. |
| Exportaciones dentro de cada módulo | Los botones pertenecen a las páginas de clientes, proveedores, inventarios, compras, salidas, personas, usuarios y movimientos; no existe una página general de reportes. | `createReportApplication.js` centraliza la descarga; `application/{admin,sales,warehouse}/report.js` configura cada `reportService.js` desde la página propietaria. | Cada solicitud `GET .../reports/.../excel` continúa la consulta y los filtros del módulo visible; no decide permisos del servidor. | Se documenta dentro del caso y recorrido del módulo propietario. La factory sólo requiere una vista estructural compartida, no una secuencia transversal de reportes. |

### Fichas de infraestructura compartida

| Pieza | Contrato documentado | Consumidores y límite | Diagrama aplicable |
| --- | --- | --- | --- |
| `createCrudApplication.js` | Configura lecturas y mutaciones, extrae claves de respuesta y permite mutaciones adicionales. | Personas, usuarios, clientes, proveedores, materiales y mermas; no conoce DOM ni reglas de dominio. | Diagrama canónico de **fábrica CRUD** en `code-diagrams.md`. |
| `createIssueApplication.js` e `issueHeaderRules.js` | Especializan el ciclo de documentos con encabezado, detalles y reglas de edición visibles. | Salidas de materiales y mermas; las transiciones definitivas siguen en backend. | **Actividad** para bifurcaciones del encabezado y **secuencia** para coordinación asíncrona. |
| `createReportApplication.js` | Convierte una petición configurada en descarga y nombre de archivo. | Reportes de admin, ventas y almacén. | Normalmente ninguno; secuencia sólo al investigar descarga o error. |
| `axiosInstanceApi.js` / `apiRequest` | Cliente HTTP común, tratamiento de sesión y propagación normalizada de errores. | Todos los servicios del navegador. | Participante único en secuencias; nunca un diagrama por llamada. |
| `ui/forms`, `ui/inventory`, `ui/issues` | Reciben elementos y callbacks; controlan interacción visual y emiten resultados al propietario. | Formularios CRUD, selectores de inventario y documentos de salida. | **Componentes** si cambia la reutilización; **secuencia** si coordina eventos asíncronos. |
| `plugins/datatable`, `plugins/select2`, `plugins/mdb`, `plugins/flatpickr`, `plugins/swal` | Encapsulan bibliotecas externas y su configuración común. | Páginas, modales, fechas, confirmaciones y catálogos. | Sin vista por adaptador; aparecen en el diagrama de componentes compartidos. |
| `utils` y `constants` | Transformaciones, validaciones auxiliares, formatos y valores sin estado visual. | Todas las capas del navegador que los importan. | Sin diagrama salvo que una transformación tenga decisiones de negocio, caso en que debe moverse o documentarse en su flujo propietario. |
| `views/shared` | Parciales configurables para formularios, tablas, modales y estructura común. | Vistas EJS propietarias. | Diagrama de **componentes/composición**, no secuencia por inclusión. |

## Aplicación de todos los casos al código frontend

Esta matriz documenta cada `CU-*` desde el código que se ejecuta en el navegador. Una
fila puede señalar que no existe pantalla independiente: en ese caso identifica el
componente consumidor real en vez de inventar un flujo frontend. Las factories se
reutilizan, pero cada fila conserva la página, aplicación o request de su contexto.
La misma cobertura se representa visualmente, caso por caso, en los
[diagramas frontend aplicados al código](frontend-use-case-diagrams.md).

| Caso | Página o interacción concreta | Aplicación, servicio y resultado observable |
| --- | --- | --- |
| `CU-AUT-01` | `loginPage.ejs` → `loginForm.js`. | `login` → `loginRequest`; envía `POST /api/auth/login` y navega al inicio. |
| `CU-AUT-02` | Opción Cerrar sesión de la navegación compartida. | Navega a `/cerrar-sesion`; el cierre es web y no usa una mutación de `authService.js`. |
| `CU-IDA-01` | `personsPage.ejs` y `personsPage.js` cargan la tabla. | `getAllPersons` → `getAllPersonsRequest`; consulta `GET /api/admin/persons`. |
| `CU-IDA-02` | `personModal.js` abre `personForm.js` en modo alta. | `registerPerson` → `registerPersonRequest`; envía `POST /api/admin/persons`. |
| `CU-IDA-03` | `personModal.js` precarga la persona seleccionada. | `updatePerson` → `updatePersonRequest`; envía `PUT /api/admin/persons/:id`. |
| `CU-IDA-04` | `usersPage.ejs` y `usersPage.js` cargan la tabla. | `getAllUsers` → `getAllUsersRequest`; consulta `GET /api/admin/users`. |
| `CU-IDA-05` | `userModal.js` abre `userForm.js` para una cuenta nueva. | `registerUser` → `registerUserRequest`; envía `POST /api/admin/users`. |
| `CU-IDA-06` | `userModal.js` abre la cuenta y acceso existentes. | `editUser` → `editUserRequest`; envía `PATCH /api/admin/users/:id`. |
| `CU-IDA-07` | `userForm.js` selecciona el modo de contraseña. | `editUserPassword` → `editUserPasswordRequest`; envía `PATCH /api/admin/users/:id/password`. |
| `CU-IDA-08` | Select de rol dentro de formularios de personas y usuarios. | `getAllRoles` → `getAllRolesRequest`; consume `GET /api/admin/roles`. |
| `CU-IDA-09` | Select de departamento dentro de formularios de personas y usuarios. | `getAllDepartments` → `getAllDepartmentsRequest`; consume `GET /api/admin/departments`. |
| `CU-CAT-01` | `materialsPage.ejs` y `materialsPage.js` cargan inventario. | `getAllMaterials` → `getAllMaterialsRequest`; consulta `GET /api/warehouse/materials`. |
| `CU-CAT-02` | `materialModal.js` abre `materialForm.js` en modo alta. | `registerMaterial` → `registerMaterialRequest`; envía `POST /api/warehouse/materials`. |
| `CU-CAT-03` | `materialModal.js` precarga material y relación con proveedor. | `editMaterial` → `editMaterialRequest`; envía `PATCH /api/warehouse/materials/:id`. |
| `CU-CAT-04` | Acción de retiro en `materialDatatable.js`. | `deleteMaterial` → `deleteMaterialRequest`; envía `DELETE /api/warehouse/materials/:id`. |
| `CU-CAT-05` | `materialForm.js` usa el modo de ajuste de existencia. | `editMaterialStock` → `editMaterialStockRequest`; envía `PATCH /api/warehouse/materials/:id/stock`. |
| `CU-CAT-06` | `suppliersPage.ejs` y `suppliersPage.js` cargan proveedores. | `getAllSuppliers` → `getAllSuppliersRequest`; consulta `GET /api/warehouse/suppliers`. |
| `CU-CAT-07` | `supplierModal.js` abre `supplierForm.js` en alta. | `registerSupplier` → `registerSupplierRequest`; envía `POST /api/warehouse/suppliers`. |
| `CU-CAT-08` | `supplierModal.js` precarga el proveedor. | `editSupplier` → `editSupplierRequest`; envía `PUT /api/warehouse/suppliers/:id`. |
| `CU-CAT-09` | El estado se edita en `supplierForm.js`; no hay pantalla separada. | `editSupplier` conserva el contexto y usa `PUT /api/warehouse/suppliers/:id`. |
| `CU-CAT-10` | `clientsPage.ejs` y `clientsPage.js` cargan clientes. | `getAllClients` → `getAllClientsRequest`; consulta `GET /api/sales/clients`. |
| `CU-CAT-11` | `clientModal.js` abre `clientForm.js` en alta. | `registerClient` → `createClientRequest`; envía `POST /api/sales/clients`. |
| `CU-CAT-12` | `clientModal.js` precarga el cliente. | `editClient` → `editClientRequest`; envía `PUT /api/sales/clients/:id`. |
| `CU-CAT-13` | `wastesPage.ejs` y `wastesPage.js` cargan mermas. | `getAllWastes` → `getAllWastesRequest`; consulta `GET /api/warehouse/wastes`. |
| `CU-CAT-14` | `wasteModal.js` y `wasteForm.js` seleccionan una plantilla de material. | `getWasteMaterialTemplates` prepara datos y `registerWaste` envía `POST /api/warehouse/wastes`. |
| `CU-CAT-15` | `wasteModal.js` precarga la merma. | `editWaste` → `editWasteRequest`; envía `PATCH /api/warehouse/wastes/:id`. |
| `CU-CAT-16` | `wasteForm.js` usa el modo de ajuste. | `editWasteStock` → `editWasteStockRequest`; envía `PATCH /api/warehouse/wastes/:id/stock`. |
| `CU-CAT-17` | Select de presentación en `materialFields.js` y `wasteFields.js`. | `getAllPresentations` → `getAllPresentationsRequest`; consume `GET /api/warehouse/presentations`. |
| `CU-CAT-18` | Select de unidad en formularios de material y merma. | `getAllUnitMeasures` → `getAllUnitMeasuresRequest`; consume `GET /api/warehouse/unit-measures`. |
| `CU-CAT-19` | Select de motivo en los modos de ajuste. | `getAllReasons` → `getAllReasonsRequest`; consume `GET /api/warehouse/reasons`. |
| `CU-CAT-20` | Estado visible en tablas y formularios de salidas. | `getAllFulfillmentStatuses` → request homólogo; consume `GET /api/warehouse/fulfillment-statuses`. |
| `CU-ENT-01` | `goodsReceiptsPage.ejs` y su DataTable cargan compras. | `getAllGoodsReceipts` → request homólogo; consulta `GET /api/warehouse/goods-receipts`. |
| `CU-ENT-02` | `goodsReceiptModal.js` captura encabezado y detalles. | `registerGoodsReceipt` → `registerGoodsReceiptRequest`; envía `POST /api/warehouse/goods-receipts`. |
| `CU-ENT-03` | `goodsReceiptModal.js` abre una compra existente. | `editGoodsReceiptHeader` → request homólogo; envía `PATCH /api/warehouse/goods-receipts/:id`. |
| `CU-ENT-04` | `correctionModal.js` y `correctionForm.js` aíslan la corrección. | `correctGoodsReceiptDetail` → request homólogo; envía `PATCH /api/warehouse/goods-receipts/:id/details/:detailId/corrections`. |
| `CU-ENT-05` | Acción Cancelar del detalle en el modal de compra. | `cancelGoodsReceiptDetail` → request homólogo; envía `PATCH /api/warehouse/goods-receipts/:id/details/:detailId/cancel`. |
| `CU-SAL-01` | `goodsIssuesPage.ejs` y su DataTable cargan salidas. | `getAllGoodsIssues` → request homólogo; consulta `GET /api/warehouse/goods-issues`. |
| `CU-SAL-02` | `goodsIssueModal.js` captura documento y materiales. | `registerGoodsIssue` → request homólogo; envía `POST /api/warehouse/goods-issues`. |
| `CU-SAL-03` | Modo encabezado de `goodsIssueModal.js`. | `editGoodsIssueHeader` → request homólogo; envía `PATCH /api/warehouse/goods-issues/:id/header`. |
| `CU-SAL-04` | Modo detalles de `goodsIssueModal.js`. | `editGoodsIssueDetails` → request homólogo; envía `PATCH /api/warehouse/goods-issues/:id/details`. |
| `CU-SAL-05` | Acción Surtir dentro de los detalles de salida. | `editGoodsIssueDetails` envía cantidades a `PATCH /api/warehouse/goods-issues/:id/details` y refresca el documento. |
| `CU-SAL-06` | `returns/goodsIssueReturn.js` configura `issueReturnUI`. | `returnGoodsIssueDetail` → request homólogo; envía `PATCH /api/warehouse/goods-issues/:id/details/:detailId/returns`. |
| `CU-SAL-07` | `wasteIssuesPage.ejs` y su DataTable cargan salidas de merma. | `getAllWasteIssues` → request homólogo; consulta `GET /api/warehouse/waste-issues`. |
| `CU-SAL-08` | `wasteIssueModal.js` captura documento y mermas. | `registerWasteIssue` → request homólogo; envía `POST /api/warehouse/waste-issues`. |
| `CU-SAL-09` | Modo encabezado de `wasteIssueModal.js`. | `editWasteIssueHeader` → request homólogo; envía `PATCH /api/warehouse/waste-issues/:id/header`. |
| `CU-SAL-10` | Modo detalles de `wasteIssueModal.js`. | `editWasteIssueDetails` → request homólogo; envía `PATCH /api/warehouse/waste-issues/:id/details`. |
| `CU-SAL-11` | Acción Surtir dentro de los detalles de merma. | `editWasteIssueDetails` envía cantidades a `PATCH /api/warehouse/waste-issues/:id/details` y refresca el documento. |
| `CU-SAL-12` | `returns/wasteIssueReturn.js` configura `issueReturnUI`. | `returnWasteIssueDetail` → request homólogo; envía `PATCH /api/warehouse/waste-issues/:id/details/:detailId/returns`. |
| `CU-REP-01` | La consulta es el listado de `materialsPage.js`; no hay página de reporte. | Reutiliza `getAllMaterialsRequest` y sus filtros, sin mutación. |
| `CU-REP-02` | `movementsPage.js` selecciona el contexto material. | `getAllMovements({ context: 'materials' })` consulta `/api/admin/movements/materials`. |
| `CU-REP-03` | Botón Excel de `materialDatatable.js`. | `exportWarehouseReport` → `exportWarehouseReportRequest`; descarga `/api/warehouse/reports/inventory/excel`. |
| `CU-REP-04` | Botón Excel del listado de salidas de material. | `exportGoodsIssueReport` → request homólogo; descarga `/api/warehouse/reports/goods-issues/excel`. |
| `CU-REP-05` | Botón Excel de movimientos en contexto material. | `exportMovementReport` → request con `materials`; descarga `/api/admin/reports/movements/materials/excel`. |
| `CU-REP-06` | La consulta es el listado de `wastesPage.js`; no hay página de reporte. | Reutiliza `getAllWastesRequest` y sus filtros, sin mutación. |
| `CU-REP-07` | `movementsPage.js` selecciona el contexto merma. | `getAllMovements({ context: 'wastes' })` consulta `/api/admin/movements/wastes`. |
| `CU-REP-08` | Botón Excel del listado de salidas de merma. | `exportWasteIssueReport` → request homólogo; descarga `/api/warehouse/reports/waste-issues/excel`. |
| `CU-REP-09` | Botón Excel de `wasteDatatable.js`. | `exportWasteReport` → request homólogo; descarga `/api/warehouse/reports/wastes/excel`. |
| `CU-REP-10` | Botón Excel de movimientos en contexto merma. | `exportMovementReport` → request con `wastes`; descarga `/api/admin/reports/movements/wastes/excel`. |
| `CU-REP-11` | Botón Excel de `goodsReceiptDatatable.js`. | `exportGoodsReceiptReport` → request homólogo; descarga `/api/warehouse/reports/goods-receipts/excel`. |
| `CU-REP-12` | Botón Excel de `supplierDatatable.js`. | `exportSupplierReport` → request homólogo; descarga `/api/warehouse/reports/suppliers/excel`. |
| `CU-REP-13` | Botón Excel de `clientDatatable.js`. | `exportClientReport` → request homólogo; descarga `/api/sales/reports/clients/excel`. |
| `CU-REP-14` | Botón Excel de `personDatatable.js`. | `exportPersonReport` → request homólogo; descarga `/api/admin/reports/persons/excel`. |
| `CU-REP-15` | Botón Excel de `userDatatable.js`. | `exportUserReport` → request homólogo; descarga `/api/admin/reports/users/excel`. |

## Matriz de decisión de diagramas frontend

La columna de cada ficha anterior es una decisión explícita, no una invitación a crear
todos los diagramas posibles. Se aplica esta matriz al cambiar el flujo:

| Caso observable | Vista que aplica | Vista que no aporta | Fuente que debe enlazarse |
| --- | --- | --- | --- |
| Alta, consulta, edición o baja sin coordinación adicional | Ciclo CRUD compartido. | Una secuencia repetida por recurso. | Contrato API y patrón de fábrica. |
| Formulario/modal con llamadas encadenadas o evento posterior | Secuencia. | Entidad-relación. | Módulos de página, aplicación y servicio HTTP. |
| Validación visual con alternativas que cambian el recorrido | Actividad. | Máquina de estados si no existen estados persistentes. | Reglas de formulario y caso de uso. |
| Documento con estados persistentes | Referencia a máquina de estados de requisitos. | Copia frontend de las transiciones. | `requirements-diagrams.md`. |
| Reutilización de parciales, UI, plugins o fábricas | Componentes o dependencias. | Secuencia por cada consumidor. | `code-diagrams.md` y patrón aplicado. |
| Una petición HTTP directa o un catálogo de lectura | Ninguno propio. | Secuencia de una sola llamada. | Ficha funcional y contrato API. |
| Exportación Excel iniciada desde un listado | Continuación del caso específico del módulo. | Grupo o secuencia independiente de “Reportes”. | Página propietaria, request concreto y caso `CU-REP-*`. |

Cada diagrama declara el límite del navegador. Si atraviesa la API, termina en el método
y URL y enlaza backend; no dibuja Prisma ni atribuye seguridad a la validación visual.

## Vistas técnicas aplicadas por flujo frontend

Estas vistas no son diagramas de casos de uso: comienzan dentro del navegador y muestran
la composición EJS/JavaScript, eventos, factories y transporte que implementan el caso.
Cada vista dinámica se vincula con un solo `CU-*` y nombra página, aplicación, request y
endpoint concretos. La reutilización de una factory o componente se explica en la ficha
transversal, pero no se usa para hacer que una secuencia represente varios casos. Los
CRUD homogéneos permanecen en fichas tabulares mientras no necesiten un diagrama propio.

### Inicio de sesión y establecimiento de la navegación autenticada

**Identificador:** `DIA-FE-SEQ-002`. **Caso:** `CU-AUT-01`. Explica qué módulos del
navegador recopilan credenciales y entregan el control al servidor; no describe la
validación del token, que pertenece al backend.

```mermaid
sequenceDiagram
    actor User as Usuario
    participant EJS as loginPage.ejs
    participant Form as loginForm / useForm
    participant App as login
    participant Request as loginRequest / apiRequest
    participant API as POST /api/auth/login
    participant Browser as Navegador

    EJS->>Form: carga el módulo del formulario
    User->>Form: captura y envía credenciales
    Form->>Form: valida campos requeridos
    Form->>App: { formData }
    App->>Request: { data: formData }
    Request->>API: petición JSON
    API-->>Request: respuesta y cookies de sesión
    Request-->>App: respuesta normalizada
    App-->>Form: resultado exitoso
    Form->>Browser: navega a la portada autenticada
```

### Alta de merma desde una plantilla de material

**Identificador:** `DIA-FE-ACT-001`. **Caso:** `CU-CAT-14`. Esta actividad hace visible
la dependencia proveedor → material y la preparación de snapshots; no representa las
decisiones de persistencia del servicio.

```mermaid
flowchart TB
    open["Abrir wasteModal en modo crear"] --> supplier["Seleccionar proveedor"]
    supplier --> clear["Limpiar plantilla de material anterior"]
    clear --> load["wasteMaterialService consulta materiales del proveedor"]
    load --> choose{"¿Se seleccionó una plantilla?"}
    choose -->|No| blocked["Mantener material y envío sin completar"]
    choose -->|Sí| map["wasteMaterialTemplate adapta nombre, medidas y costo propuesto"]
    map --> editable["Usuario completa campos editables"]
    editable --> validate{"¿Validación del navegador correcta?"}
    validate -->|No| errors["Mostrar errores sin llamar la API"]
    validate -->|Sí| register["registerWaste → POST /api/warehouse/wastes"]
```

### Corrección de un detalle de entrada

**Identificador:** `DIA-FE-SEQ-003`. **Caso:** `CU-ENT-04`. La vista se concentra en el
modal secundario y en el evento que sincroniza el documento principal después de una
respuesta exitosa.

```mermaid
sequenceDiagram
    actor Warehouse as Almacén
    participant Main as goodsReceiptModal
    participant Correction as correctionModal / correctionForm
    participant App as correctGoodsReceiptDetail
    participant Request as correctGoodsReceiptDetailRequest
    participant API as POST /goods-receipts/:id/details/:detailId/corrections

    Warehouse->>Main: selecciona Corregir detalle
    Main->>Correction: openGoodsReceiptCorrectionModal({ receipt, detail })
    Correction->>Correction: precarga detalle y recalcula totales previstos
    Warehouse->>Correction: confirma datos corregidos
    Correction->>Correction: valida cantidad, costo y motivo
    Correction->>App: { id, detailId, formData }
    App->>Request: mutación configurada
    Request->>API: petición JSON
    API-->>Correction: { correction, code }
    Correction->>Main: emite goods-receipt-correction:applied
    Main->>Main: reemplaza documento y refresca detalles/totales
```

### Devolución de un detalle de material surtido

**Identificador:** `DIA-FE-SEQ-004`. **Caso:** `CU-SAL-06`. La secuencia concreta la
configuración del componente compartido para una salida de materiales; no usa nombres
alternativos que también pretendan representar la devolución de merma.

```mermaid
sequenceDiagram
    actor Warehouse as Almacén
    participant Issue as goodsIssueModal
    participant Return as issueReturn UI
    participant Domain as initializeGoodsIssueReturns
    participant App as returnGoodsIssueDetail
    participant API as PATCH /api/warehouse/goods-issues/:id/details/:detailId/returns

    Warehouse->>Issue: selecciona Devolver en un detalle
    Issue->>Domain: entrega detalles y documento actual
    Domain->>Return: abre devolución con cantidad retornable
    Warehouse->>Return: captura cantidad y confirma
    Return->>Return: valida límite retornable
    Return->>App: { id, detailId, formData }
    App->>API: returnGoodsIssueDetailRequest
    API-->>App: salida actualizada
    App-->>Return: respuesta exitosa
    Return->>Issue: recarga la página y consulta el estado actualizado
```

### Devolución de un detalle de merma surtida

**Identificador:** `DIA-FE-SEQ-006`. **Caso:** `CU-SAL-12`. Esta vista muestra la
configuración y el endpoint propios de `WasteIssue`, aunque la UI base sea reutilizada.

```mermaid
sequenceDiagram
    actor Warehouse as Almacén
    participant Issue as wasteIssueModal
    participant Return as issueReturn UI
    participant Domain as initializeWasteIssueReturns
    participant App as returnWasteIssueDetail
    participant API as PATCH /api/warehouse/waste-issues/:id/details/:detailId/returns

    Warehouse->>Issue: selecciona Devolver en un detalle de merma
    Issue->>Domain: entrega detalle y salida de merma actual
    Domain->>Return: abre devolución con cantidad retornable
    Warehouse->>Return: captura cantidad y confirma
    Return->>Return: valida límite retornable
    Return->>App: { id, detailId, formData }
    App->>API: returnWasteIssueDetailRequest
    API-->>App: wasteIssueReturn
    App-->>Return: respuesta exitosa
    Return->>Issue: recarga la página y consulta la salida actualizada
```

### Ajuste de existencias desde el navegador

Esta vista se conserva porque la ficha de materiales identifica una mutación adicional
que sí cambia el flujo CRUD común. Documenta exclusivamente `CU-CAT-05`; el ajuste de
merma, surtimientos, devoluciones y cambios de entradas no sustituyen nombres dentro de
esta secuencia y requieren una vista propia cuando su coordinación de frontend deba
explicarse.

**Identificador:** `DIA-FE-SEQ-001`. **Caso:** `CU-CAT-05`. **Tipo:** secuencia Mermaid
con semántica UML. **Actor:** `Administrador del sistema` es el actor canónico del caso;
los participantes técnicos se nombran por responsabilidad o módulo y nunca se declaran
como actores.

```mermaid
sequenceDiagram
    actor User as Administrador del sistema
    participant EJS as materialsPage.ejs
    participant Form as materialForm / useForm
    participant App as editMaterialStock
    participant Factory as createApplicationMutation
    participant Request as editMaterialStockRequest
    participant API as PATCH /api/warehouse/materials/:id/stock

    EJS->>Form: carga módulo y formulario
    User->>Form: confirma ajuste
    Form->>Form: selecciona campos y valida
    Form->>App: { formData, id }
    App->>Factory: mutación configurada editStock
    Factory->>Request: { data: formData, id }
    Request->>API: apiRequest({ method: patch, url, data })
    API-->>Request: { material, code }
    Request-->>Factory: response
    Factory-->>Form: material
    Form->>Form: form.onSave?.(material)
```

La autorización, validación definitiva, transacción, auditoría y movimiento pertenecen
al backend y se consultan en el [contrato de la ruta](../data/api-contract.md#ejemplo-aplicado-ajuste-de-existencias-de-material).
La correspondencia completa requisito–frontend–backend–prueba está en la
[matriz de trazabilidad técnica](traceability-matrix.md).

## Lista de revisión frontend

1. Confirmar que toda carpeta nueva de `services`, `application` o `pages` queda incluida
   en una ficha funcional o transversal del catálogo.
2. Confirmar que la vista EJS carga los scripts propietarios y conserva su última línea
   y llamadas `contentFor`.
3. Revisar imports, exports, selectores, eventos y consumidores del símbolo documentado.
4. Comprobar que `pages` compone, `application` coordina, `services` transporta y `ui`
   permanece independiente del recurso.
5. Enlazar el contrato API y no presentar la validación del navegador como control de
   seguridad.
6. Aplicar la matriz de diagramas y actualizar sólo la vista cuya semántica cambió.
7. Localizar las pruebas bajo `tests/unit/public` o registrar la brecha existente sin
   afirmar cobertura.
8. Ejecutar `npm run docs:check` y validar el paquete de arquitectura.
