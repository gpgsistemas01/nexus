# Especificación de requisitos

## 1. Propósito y alcance

Este documento profundiza el [mapa visual de requisitos](requirements-diagrams.md).
Define una línea base revisable de capacidades, reglas y atributos de calidad sin
confundir tres conceptos diferentes:

- **requisito:** comportamiento o restricción que el producto debe cumplir;
- **evidencia:** código, ruta, modelo o prueba que permite comprobarlo;
- **estado:** grado en que la evidencia actual satisface el requisito.

El alcance actual comprende autenticación, administración de identidades, catálogos,
compras, inventario de materiales, inventario de merma, salidas, devoluciones,
movimientos y reportes. OpenAPI, una interfaz completa de requisiciones y objetivos de
nivel de servicio permanecen fuera de la línea base implementada.

Este documento no sustituye historias de usuario, diseños de pantalla ni el contrato
HTTP. El [contrato API](../data/api-contract.md), el
[mapa generado](../generated/code-map.md) y el esquema Prisma aportan esos otros niveles
de detalle. Su estructura adopta selectivamente las prácticas de ingeniería de
requisitos descritas en el [criterio sobre normas documentales](../governance/documentation-standards.md),
sin declarar conformidad o certificación ISO.

Los objetivos de actor, con participantes, precondiciones, garantías, pasos, flujos
alternativos y excepciones, se describen por familias en el
[catálogo de casos de uso](use-case-descriptions.md). Los
requisitos de este archivo conservan los criterios verificables y la evidencia sin
duplicar allí la narrativa de interacción.

## 2. Convenciones

### 2.1 Identificadores

| Prefijo | Tipo |
| --- | --- |
| `RF` | Requisito funcional observable por un actor o consumidor. |
| `RN` | Regla de negocio que restringe varios flujos. |
| `RD` | Requisito sobre persistencia o representación de datos. |
| `RC` | Requisito de calidad u operación. |
| `CA` | Criterio de aceptación numerado dentro de un requisito cuando se necesitan varios escenarios verificables. |

Un requisito conserva una obligación principal. Si requiere varios ejemplos o
escenarios, se redactan criterios `CA-<ID>-<n>` en lugar de construir una sola oración
con decisiones de interfaz, implementación y excepciones. La evidencia técnica se
mantiene en su columna y no sustituye el resultado observable.

ISO/IEC/IEEE 29148 no obliga a crear una fila independiente para cada verbo CRUD ni
define la numeración concreta de Nexus. Sí orienta a que los requisitos sean singulares,
inequívocos y verificables. El proyecto aplica esos criterios separando operaciones que
pueden autorizarse, fallar y probarse por separado; mantiene juntos únicamente los
atributos y escenarios que describen una misma obligación observable.

Por tanto, no se dejan juntas obligaciones independientes ni se fragmenta cada campo en
un requisito. La singularidad aplica a requisitos funcionales (`RF-*`), de datos
(`RD-*`), reglas de negocio (`RN-*`) y calidad (`RC-*`): se crea otro identificador
cuando cambia el resultado, la restricción, la aprobación o la prueba que decide su
cumplimiento. Los criterios `CA-*` conservan variantes inseparables de una misma
obligación.

### 2.2 Estados

| Estado | Interpretación |
| --- | --- |
| Implementado | Existe un flujo registrado y evidencia suficiente en el código. |
| Parcial | Existe parte del flujo, pero falta una operación, interfaz o evidencia relevante. |
| Modelado | Existen entidades o piezas aisladas, pero no un flujo web/API registrado. |
| Propuesto | Requiere decisión o implementación futura; no debe anunciarse como disponible. |

El estado describe la evidencia del repositorio, no la aprobación del producto por un
usuario responsable. Esa aprobación debe registrarse en la historia o incidencia que
originó el cambio.

### 2.3 Terminología y operaciones

Los requisitos usan los términos canónicos del
[glosario del negocio](business-glossary.md). El glosario define significado compartido
para usuarios y responsables; el [diccionario técnico](../generated/data-dictionary.md)
documenta cómo se representan los datos persistentes. Ninguno debe sustituir al otro.

La [matriz de operaciones](requirements-operations-matrix.md) resume las capacidades
permitidas por módulo y contexto, incluidas las parciales o modeladas. La autorización
efectiva continúa determinada por los permisos del servidor, no por la matriz.

## 3. Actores y responsabilidad del sistema

| Participante | Responsabilidad |
| --- | --- |
| Personal de almacén (área Almacén y proveduría) | Mantener catálogos operativos y ejecutar entradas, salidas, devoluciones y ajustes autorizados. |
| Solicitante o aprobador | Participar en documentos operativos de acuerdo con su rol y departamento. |
| Administrador del sistema (área Sistemas) | Ejecutar todas las capacidades vigentes, incluida la administración de clientes, personas, usuarios y accesos, siempre con autorización comprobada en el servidor. Ventas no accede al sistema. |
| Dirección | Parte interesada de supervisión; sus casos de uso y alcance autorizado permanecen pendientes de definición. |
| Nexus (sistema) | Validar, persistir atómicamente, numerar documentos, auditar escrituras críticas y notificar actualizaciones; es participante interno, no actor externo. |

Los nombres de actor expresan responsabilidades, no conceden acceso por sí mismos. La
autorización efectiva se calcula con las asignaciones de usuario, rol y departamento
descritas en [usuarios y permisos](../data/database-users-and-permissions-analysis.md).

## 4. Catálogo unificado por ámbito

La especificación se organiza por el ámbito al que pertenece la obligación, no por el
tipo de identificador. Los prefijos `RF`, `RN`, `RD` y `RC` permiten clasificar y
trazar cada enunciado, pero no crean especificaciones paralelas. Así, una revisión de
acceso, inventario o plataforma encuentra juntas las obligaciones relacionadas de ese
ámbito.

### 4.1 Acceso e identidad

La descomposición conserva `RF-AUT-001`, `RF-AUT-002` y `RF-IAM-001` a `RF-IAM-003`
para la primera obligación observable de su alcance original. Cerrar sesión y las
mutaciones antes agrupadas reciben identificadores nuevos; ningún ID se reasigna a otro
recurso.

| ID | Requisito y criterio de aceptación | Estado | Evidencia principal |
| --- | --- | --- | --- |
| RF-AUT-001 | Una cuenta activa debe poder iniciar sesión con credenciales válidas; una credencial inválida no debe crear una sesión autenticada. | Implementado | `src/routes/api/authApiRoute.js`, `src/routes/web/auth/loginWebRoute.js` |
| RF-AUT-002 | Una sesión vigente debe poder renovarse reemplazando las credenciales correspondientes. | Implementado | `src/routes/web/auth/refreshWebRoute.js` |
| RF-AUT-003 | Una sesión autenticada debe poder cerrarse invalidando las credenciales correspondientes. | Implementado | `src/routes/web/auth/logoutWebRoute.js` |
| RF-IAM-001 | Administración debe poder consultar usuarios y sus asignaciones de rol y departamento sin exponer contraseñas. | Implementado | `src/routes/api/admin/userApiRoute.js`, `src/controllers/api/admin/userController.js` |
| RF-IAM-002 | Administración debe poder consultar personas y sus asignaciones sin concederles acceso implícito. | Implementado | `src/routes/api/admin/personApiRoute.js`, `src/views/pages/admin/persons` |
| RF-IAM-003 | Administración debe poder consultar roles y departamentos para componer asignaciones de acceso. | Implementado | `src/routes/api/admin/roleApiRoute.js`, `src/routes/api/admin/departmentApiRoute.js` |
| RF-IAM-004 | Administración debe poder crear un usuario con una cuenta única y una asignación válida de rol y departamento; la persona asociada es opcional. | Implementado | `src/routes/api/admin/userApiRoute.js`, `src/controllers/api/admin/userController.js` |
| RF-IAM-005 | Administración debe poder actualizar los datos admitidos y reemplazar atómicamente la asignación de acceso de un usuario. | Implementado | `src/routes/api/admin/userApiRoute.js`, `src/services/admin/userService.js` |
| RF-IAM-006 | Administración debe poder cambiar la contraseña de un usuario almacenando únicamente su representación cifrada. | Implementado | `src/routes/api/admin/userApiRoute.js`, `src/services/admin/userService.js` |
| RF-IAM-007 | Administración debe poder crear una persona con identidad y asignaciones válidas, sin crear por ello una cuenta de acceso. | Implementado | `src/routes/api/admin/personApiRoute.js`, `src/views/pages/admin/persons` |
| RF-IAM-008 | Administración debe poder actualizar los datos y asignaciones admitidos de una persona existente. | Implementado | `src/routes/api/admin/personApiRoute.js`, `src/views/pages/admin/persons` |

### 4.2 Catálogos operativos y comerciales

La separación siguiente aplica la singularidad adoptada por el proyecto: consultar,
crear, actualizar, retirar y ajustar son obligaciones independientes porque tienen
permisos, validaciones y resultados comprobables distintos. Los atributos que describen
la identidad de un mismo recurso permanecen como criterios de esa obligación y no se
convierten artificialmente en un requisito por campo.

Para conservar trazabilidad, `RF-CAT-001` a `RF-CAT-005` mantienen el recurso de la
obligación original y se acotan a su consulta; las operaciones separadas reciben los
nuevos identificadores `RF-CAT-006` a `RF-CAT-018`. No se reasigna un identificador
existente a otro recurso.

| ID | Requisito y criterio de aceptación | Estado | Evidencia principal |
| --- | --- | --- | --- |
| RF-CAT-001 | Almacén debe poder consultar materiales y sus ofertas de proveedor sin modificar existencias. | Implementado | `src/routes/api/warehouse/materialApiRoute.js`, `src/views/pages/warehouse/materials` |
| RF-CAT-002 | Almacén debe poder consultar proveedores autorizados sin modificar sus datos. | Implementado | `src/routes/api/warehouse/supplierApiRoute.js` |
| RF-CAT-003 | Administración del sistema debe poder consultar clientes autorizados sin modificar sus datos. | Implementado | `src/routes/api/sales/clientApiRoute.js`, `tests/integration/controllers/clientControllerDbTest.js` |
| RF-CAT-004 | Almacén debe poder consultar existencias de merma sin modificar sus datos ni existencias. | Implementado | `src/routes/api/warehouse/wasteApiRoute.js`, `src/views/pages/warehouse/wastes` |
| RF-CAT-005 | El sistema debe permitir consultar presentaciones, unidades de medida, motivos de ajuste y estados de cumplimiento como catálogos auxiliares, sin ofrecer su mantenimiento en este alcance. | Implementado | routers de catálogo bajo `src/routes/api/warehouse` |
| RF-CAT-006 | Almacén debe poder crear un material con presentación y unidad de medida; si captura SKU, éste debe ser único, y los límites y dimensiones deben ser válidos. | Implementado | `src/routes/api/warehouse/materialApiRoute.js`, `src/services/warehouse/materials/materialService.js` |
| RF-CAT-007 | Almacén debe poder actualizar únicamente los datos generales admitidos de un material existente, sin sustituir el flujo de ajuste de existencias. | Implementado | `src/routes/api/warehouse/materialApiRoute.js`, `src/services/warehouse/materials/materialService.js` |
| RF-CAT-008 | Almacén debe poder retirar un material sólo cuando no participe en entradas, salidas, movimientos, ajustes o correcciones históricas.<br><br>`CA-RF-CAT-008-1`: el listado y la eliminación deben reutilizar la misma definición de relaciones protegidas.<br>`CA-RF-CAT-008-2`: la merma conserva un snapshot independiente y no se considera una relación `SupplierMaterial`. | Implementado | `src/services/warehouse/materials/supplierMaterialService.js` |
| RF-CAT-009 | El administrador del sistema debe poder ajustar las existencias de un material únicamente mediante la acción autorizada disponible desde su consulta, conservando el resultado trazable; el personal de almacén sin ese permiso no debe poder ejecutarla. | Implementado | `src/routes/api/warehouse/materialApiRoute.js`, `src/controllers/api/warehouse/materialController.js`, `src/constants/permissions.js`, modelo `StockAdjustment` |
| RF-CAT-010 | Almacén debe poder crear un proveedor con código único, razón social, nombre comercial y estado válido. | Implementado | `src/routes/api/warehouse/supplierApiRoute.js`, modelo `Supplier` |
| RF-CAT-011 | Almacén debe poder actualizar los datos admitidos y el estado de un proveedor existente. | Implementado | `src/routes/api/warehouse/supplierApiRoute.js` |
| RF-CAT-012 | El sistema debe rechazar una relación material-proveedor duplicada y conservar en cada relación su SKU de proveedor, costo unitario máximo, existencia y cantidad convertida. | Implementado | modelo `SupplierMaterial`, `src/services/warehouse/materials/supplierMaterialService.js` |
| RF-CAT-013 | Administración del sistema debe poder crear un cliente; cuando indique un asesor, éste debe corresponder a una persona registrada. | Implementado | `src/routes/api/sales/clientApiRoute.js`, `tests/integration/controllers/clientControllerDbTest.js` |
| RF-CAT-014 | Administración del sistema debe poder actualizar los datos admitidos de un cliente y agregar, reemplazar o retirar su asesor opcional. | Implementado | `src/routes/api/sales/clientApiRoute.js`, `tests/integration/controllers/clientControllerDbTest.js` |
| RF-CAT-015 | Almacén debe poder crear una merma a partir de un material y proveedor usados como plantilla; la merma resultante debe conservar snapshots propios. | Implementado | `src/routes/api/warehouse/wasteApiRoute.js`, `src/services/warehouse/wastes/wasteService.js` |
| RF-CAT-016 | El sistema debe impedir que una edición de merma cambie su proveedor, presentación, unidad de medida o dimensiones, para conservar su identidad física. | Implementado | `src/dtos/wasteDTO.js`, `src/services/warehouse/wastes/wasteService.js` |
| RF-CAT-017 | Almacén debe poder actualizar el nombre y los datos secundarios admitidos de una merma sin alterar directamente sus existencias. | Implementado | `src/routes/api/warehouse/wasteApiRoute.js`, `src/views/pages/warehouse/wastes` |
| RF-CAT-018 | El administrador del sistema debe poder ajustar las existencias de una merma únicamente mediante la acción autorizada disponible desde su consulta; el personal de almacén sin ese permiso no debe poder ejecutarla. | Implementado | `src/routes/api/warehouse/wasteApiRoute.js`, `src/controllers/api/warehouse/wasteController.js`, `src/constants/permissions.js`, modelo `WasteStockAdjustment` |

### 4.3 Entradas, salidas e inventario

Los identificadores existentes conservan la operación principal más cercana de su
alcance original. Las operaciones antes agrupadas reciben `RF-REC-007` y
`RF-REC-008`, `RF-ISS-004` a `RF-ISS-006`, `RF-WST-004` a `RF-WST-007` y
`RF-ADJ-002`, sin renumerar requisitos previos.

| ID | Requisito y criterio de aceptación | Estado | Evidencia principal |
| --- | --- | --- | --- |
| RF-REC-001 | Almacén debe poder consultar entradas, encabezados, detalles y estados sin modificar inventario. | Implementado | `src/routes/api/warehouse/goodsReceiptApiRoute.js`, modelo `GoodsReceipt` |
| RF-REC-002 | Almacén debe poder corregir un detalle activo conservando actor, motivo, valores anteriores y corregidos, e impacto de inventario. | Implementado | `GoodsReceiptDetailChange`, `src/services/warehouse/goodsReceipts/detailChanges` |
| RF-REC-003 | El sistema debe impedir que una factura pertenezca a más de una entrada del mismo proveedor e identificar la entrada existente ante un conflicto. | Implementado | `src/services/warehouse/goodsReceipts/goodsReceiptInvoiceService.js`, restricción `GoodsReceipt(supplierId, invoice)` |
| RF-REC-004 | Una entrada debe admitir detalles independientes del mismo material cuando representan precios o lotes diferentes. | Implementado | `src/public/js/pages/warehouse/goodsReceipts/goodsReceiptForm.js`, `src/public/js/plugins/datatable/warehouse/goodsReceipts/goodsReceiptDatatable.js` |
| RF-REC-005 | Almacén debe poder editar los campos admitidos de una entrada no cancelada y agregar detalles nuevos, sin cambiar el proveedor ni reescribir detalles persistidos. | Implementado | `src/public/js/pages/warehouse/goodsReceipts/goodsReceiptForm.js`, `src/services/warehouse/goodsReceipts/goodsReceiptService.js` |
| RF-REC-006 | Cuando una marca distingue físicamente un material, almacén debe registrarla como otra identidad del catálogo en lugar de capturarla en el detalle. | Implementado | `src/services/warehouse/materials/materialService.js`, modelo `GoodsReceiptDetail` |
| RF-REC-007 | Almacén debe poder registrar una entrada con proveedor y detalles válidos; encabezado, detalles, incremento de existencias y movimientos deben confirmarse como una sola operación. | Implementado | `src/routes/api/warehouse/goodsReceiptApiRoute.js`, `src/dtos/goodsReceiptDTO.js`, `src/services/warehouse/goodsReceipts/goodsReceiptService.js` |
| RF-REC-008 | Almacén debe poder cancelar un detalle activo revirtiendo su efecto de inventario y conservando su historia; un fallo no debe dejar una reversión parcial. | Implementado | `src/services/warehouse/goodsReceipts/detailChanges` |
| RF-ISS-001 | Almacén debe poder consultar salidas de material, sus detalles y contexto sin modificar existencias. | Implementado | `src/routes/api/warehouse/goodsIssueApiRoute.js`, `src/views/pages/warehouse/goodsIssues` |
| RF-ISS-002 | Almacén debe poder surtir total o parcialmente un detalle con existencia suficiente; documento, acumulados, existencias, estados y movimiento deben actualizarse atómicamente. | Implementado | `src/services/inventory/movementService.js`, `src/services/warehouse/materials/supplierMaterialService.js` |
| RF-ISS-003 | Almacén debe poder devolver una cantidad surtida todavía retornable y enlazar el movimiento inverso con el documento y detalle originales. | Implementado | modelos `GoodsIssueReturn` y `MovementDetail` |
| RF-ISS-004 | Almacén debe poder crear una salida de material con encabezado, contexto y detalles válidos, pendiente y sin descontar existencias. | Implementado | `src/routes/api/warehouse/goodsIssueApiRoute.js`, `src/views/pages/warehouse/goodsIssues` |
| RF-ISS-005 | Almacén debe poder actualizar únicamente los campos admitidos del encabezado de una salida cuyo estado permita edición. | Implementado | `src/routes/api/warehouse/goodsIssueApiRoute.js`, `src/views/pages/warehouse/goodsIssues` |
| RF-ISS-006 | Almacén debe poder agregar o actualizar detalles todavía modificables sin reescribir cantidades surtidas o devueltas. | Implementado | `src/routes/api/warehouse/goodsIssueApiRoute.js`, `src/views/pages/warehouse/goodsIssues` |
| RF-WST-001 | Almacén debe poder consultar existencias de merma reutilizando el patrón de consulta de inventario. | Implementado | `src/routes/api/warehouse/wasteApiRoute.js` |
| RF-WST-002 | Almacén debe poder crear una salida de merma con encabezado y detalles válidos dentro del estado inicial permitido. | Implementado | `src/routes/api/warehouse/wasteIssueApiRoute.js`, `src/public/js/pages/warehouse/wasteIssues/wasteIssueModal.js` |
| RF-WST-003 | Almacén debe poder surtir total o parcialmente un detalle de merma actualizando existencia, acumulados, estados y movimiento como una sola operación. | Implementado | `tests/integration/controllers/wasteIssueControllerDbTest.js` |
| RF-WST-004 | Almacén debe poder actualizar únicamente los campos admitidos del encabezado de una salida de merma cuyo estado permita edición. | Implementado | `src/routes/api/warehouse/wasteIssueApiRoute.js`, `src/public/js/pages/warehouse/wasteIssues/wasteIssueModal.js` |
| RF-WST-005 | Almacén debe poder agregar o actualizar detalles de merma todavía modificables sin reescribir cantidades surtidas o devueltas. | Implementado | `src/routes/api/warehouse/wasteIssueApiRoute.js`, `src/public/js/pages/warehouse/wasteIssues/wasteIssueModal.js` |
| RF-WST-006 | Almacén debe poder devolver una cantidad de merma todavía retornable actualizando existencia, acumulados, estados y movimiento inverso como una sola operación. | Implementado | `tests/integration/controllers/wasteIssueControllerDbTest.js` |
| RF-WST-007 | Almacén debe poder consultar salidas de merma, sus detalles y contexto sin modificar existencias. | Implementado | `src/routes/api/warehouse/wasteIssueApiRoute.js`, `src/public/js/pages/warehouse/wasteIssues/wasteIssueModal.js` |
| RF-ADJ-001 | Almacén debe poder registrar un ajuste de material o merma con motivo, tipo, estado y creador. | Parcial | modelos `StockAdjustment`, `WasteStockAdjustment`; servicios de ajuste |
| RF-ADJ-002 | Un ajuste aprobado debe poder aplicarse generando atómicamente el movimiento y los valores anterior y nuevo. | Parcial | modelos `StockAdjustment`, `WasteStockAdjustment`; servicios de ajuste |

### 4.4 Consulta, reportes y funciones modeladas

| ID | Requisito y criterio de aceptación | Estado | Evidencia principal |
| --- | --- | --- | --- |
| RF-REP-001 | Un usuario autorizado debe poder consultar movimientos de materiales o mermas con filtros; el filtro de inventario permanece bloqueado hasta elegir proveedor y se limpia cuando éste cambia. | Implementado | `src/routes/api/admin/movementApiRoute.js`, `src/views/pages/admin/movements`, `src/public/js/plugins/datatable/core/filters/tableFilterDependencies.js` |
| RF-REP-002 | Los módulos administrativo, comercial y de almacén pueden consultar los reportes registrados para su ámbito. | Implementado | routers `reportApiRoute.js` de cada dominio |
| RF-REP-003 | El reporte de mermas consolida existencias con el mismo nombre, proveedor y ancho. El total de mermas es la suma del stock agrupado y los metros cuadrados se recalculan por cada existencia como stock × ancho × largo antes de sumarse. En presentación `ROLLO`, el largo variable no separa el grupo; para las demás presentaciones, incluida `HOJA`, el largo sí forma parte de la agrupación. Las existencias sin una medida se agrupan conservando su ausencia y aportan cero metros cuadrados. Todos los grupos y el total general se exportan juntos en una sola hoja de cálculo denominada `Mermas`; no se crea una hoja de Excel por grupo ni por tipo de presentación. | Implementado | `src/controllers/api/warehouse/reportController.js`, `src/services/warehouse/reportService.js` |
| RF-REP-004 | Los archivos Excel conservan el valor calculado por el dominio como resultado disponible y colocan fórmulas en los datos que dependen directamente de otras celdas del reporte: diferencias de salidas, importes y resúmenes de compras, nuevo stock de movimientos y totales de merma. Así, un editor de hojas de cálculo compatible puede actualizar las dependencias al modificar manualmente los datos base, sin sustituir las reglas de negocio usadas al generar el reporte. | Implementado | `src/utils/reportExcelUtils.js`, `src/controllers/api/warehouse/reportController.js`, `src/controllers/api/admin/reportController.js` |
| RF-REP-005 | Un usuario autorizado debe poder exportar los movimientos ofrecidos por la consulta conservando su ámbito y filtros aplicables. | Implementado | `src/routes/api/admin/movementApiRoute.js`, `src/views/pages/admin/movements` |
| RF-MER-001 | Durante el alta de una merma, almacén debe elegir un proveedor antes del material usado como plantilla; cambiar el proveedor debe limpiar la plantilla anterior. | Implementado | `src/views/pages/warehouse/wastes/wastesPage.ejs`, `src/services/warehouse/wastes/wasteMaterialService.js` |
| RF-MER-002 | Al seleccionar una plantilla, el sistema debe proponer el mayor costo unitario máximo aplicable; almacén puede corregirlo y el valor guardado permanece como snapshot. | Implementado | `src/services/inventory/materialIdentity.js`, `src/services/warehouse/wastes/wasteMaterialService.js` |
| RF-MER-003 | Almacén debe poder actualizar el nombre, stock mínimo, costo unitario máximo y estado de una merma sin usar la edición general para cambiar existencias. | Implementado | `src/dtos/wasteDTO.js`, `src/services/warehouse/wastes/wasteService.js` |
| RF-MER-004 | El alta de una merma debe validar material, proveedor, nombre, estado, existencia no negativa y dimensiones positivas en cliente y servidor. | Implementado | `src/routes/api/warehouse/wasteApiRoute.js`, `src/validators/forms/wasteValidations.js`, `src/public/js/utils/validations/validators.js` |
| RF-MER-005 | Una edición de merma debe conservar proveedor, presentación, unidad y dimensiones como identidad física inmutable. | Implementado | `src/dtos/wasteDTO.js`, `src/services/warehouse/wastes/wasteService.js` |
| RF-MER-006 | El sistema debe impedir dos mermas con la misma combinación normalizada de nombre, proveedor, ancho y largo. | Implementado | `prisma/schema.prisma`, `src/services/warehouse/wastes/wasteService.js` |
| RF-MER-007 | Para presentación `ROLLO`, el sistema debe proponer como ancho la menor dimensión nominal positiva; para otras presentaciones, almacén debe capturar las dimensiones requeridas. | Implementado | `src/services/inventory/materialIdentity.js`, `src/public/js/pages/warehouse/wastes/wasteModal.js` |
| RF-MER-008 | El sistema debe calcular la cantidad convertida de una merma como existencia × ancho × largo en altas, ajustes y salidas, sin solicitar su captura manual. | Implementado | `src/services/inventory/stockHelpers.js`, `src/services/warehouse/wastes/wasteService.js` |
| RF-MER-009 | El material seleccionado debe funcionar sólo como plantilla: la merma conserva snapshots propios y no una relación persistente con `Material` o `SupplierMaterial`. | Implementado | `prisma/schema.prisma`, `src/services/warehouse/wastes/wasteService.js` |
| RF-REQ-001 | Una reimplementación de requisiciones debe permanecer fuera del alcance vigente hasta definir y aprobar nuevamente su comportamiento, autorización, persistencia y pruebas. | Fuera del alcance actual | `prisma/migrations/20260827000000_remove_purchase_requisitions/migration.sql` |
| RF-PRJ-001 | Administración debe poder mantener proyectos cuando se registre un CRUD autorizado para esa capacidad. | Modelado | modelo `Project` |
| RF-PRJ-002 | Almacén debe poder seleccionar un proyecto como contexto de salida cuando se defina el flujo funcional correspondiente. | Modelado | modelo `Project` |

### 4.5 Políticas transversales del negocio

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

### 4.6 Persistencia e integridad de información

| ID | Requisito y forma de comprobación | Estado |
| --- | --- | --- |
| RD-001 | Las entidades persistentes deben usar UUID como identificador técnico cuando así lo define el modelo común. | Implementado |
| RD-002 | Cantidades, existencias, dimensiones, costos e importes deben persistirse con `Decimal(10,2)`. | Implementado |
| RD-003 | Recepciones, salidas y movimientos deben conservar mediante claves foráneas sus relaciones de encabezado y detalle. | Implementado |
| RD-004 | Correcciones, cancelaciones, devoluciones y ajustes deben representarse con registros relacionados, sin sobrescribir el hecho histórico. | Implementado |
| RD-005 | Los modelos que declaran auditoría temporal deben conservar `createdAt` y `updatedAt`. | Implementado |
| RD-006 | Los catálogos maestros que declaran `isActive` deben retirarse mediante estado cuando la eliminación física no esté permitida. | Implementado |
| RD-007 | `Person` debe representar participantes del negocio y `User` la cuenta autenticada; una identidad no sustituye a la otra. | Implementado |
| RD-008 | Las referencias documentales y las identidades de catálogo marcadas como únicas no deben duplicarse. | Implementado |
| RD-009 | Las fechas del negocio deben conservarse separadas de las marcas técnicas de creación y actualización. | Implementado |
| RD-010 | Los documentos y detalles deben persistir estados explícitos del proceso en lugar de inferirlos desde marcas temporales. | Implementado |

### 4.7 Operación y calidad del producto

| ID | Requisito y forma de comprobación | Estado |
| --- | --- | --- |
| RC-SEG-001 | Las contraseñas deben almacenarse mediante hash y nunca como texto plano. | Implementado |
| RC-SEG-002 | Las rutas protegidas deben rechazar una sesión ausente o un permiso insuficiente antes de ejecutar el controlador. | Implementado |
| RC-SEG-003 | Una ruta con cuerpo debe rechazar un tipo de contenido distinto del declarado antes de procesarlo. | Implementado |
| RC-SEG-004 | Los secretos y URLs con credenciales deben proceder de variables de entorno y no exponerse en logs. | Implementado |
| RC-DAT-001 | Las migraciones deben poder desplegarse de forma reproducible. | Implementado |
| RC-DAT-002 | Las pruebas con persistencia real deben usar `DATABASE_TEST_URL` y nunca la base de desarrollo. | Implementado |
| RC-PRU-001 | Las pruebas unitarias deben cubrir límites, decisiones, errores y efectos negativos del artefacto modificado. | Parcial |
| RC-PRU-002 | Las integraciones CRUD deben atravesar HTTP y comprobar la persistencia real con Prisma. | Parcial |
| RC-MAN-001 | Rutas, capas y pruebas deben organizarse por dominio. | Implementado |
| RC-MAN-002 | Antes de crear un flujo debe evaluarse la reutilización de fábricas CRUD y componentes compartidos. | Implementado |
| RC-DOC-001 | Los cambios en rutas, imports o Prisma deben dejar actualizados los documentos generados y superar `npm run docs:check`. | Implementado |
| RC-OBS-001 | Los fallos operacionales deben registrarse mediante logs estructurados. | Implementado |
| RC-OBS-002 | Los errores y logs expuestos al cliente no deben revelar secretos. | Implementado |
| RC-DES-001 | Si falta `DIRECT_URL` o falla una migración requerida, el contenedor debe terminar antes de iniciar la aplicación. | Implementado |
| RC-DES-002 | La aplicación debe usar `DATABASE_URL` y Prisma CLI debe preferir `DIRECT_URL` para migraciones. | Implementado |
| RC-COM-001 | La aplicación debe instalarse y ejecutarse en Node.js `>=22 <25`. | Implementado |
| RC-COM-002 | La API debe intercambiar JSON salvo rutas declaradas para archivos o texto plano. | Implementado |
| RC-USA-001 | Una tabla en pantalla angosta debe conservar accesibles las acciones y datos prioritarios. | Implementado |
| RC-USA-002 | La interfaz debe presentar los errores de validación sin perder el contexto del formulario. | Implementado |
| RC-REN-001 | Los listados deben aplicar paginación y filtros en la consulta de datos cuando el servicio los declara. | Parcial |
| RC-REN-002 | Los tiempos máximos de respuesta requieren línea base, umbral y aprobación del responsable del producto. | Propuesto |
| RC-REN-003 | Los límites de concurrencia y volumen requieren línea base, umbral y aprobación del responsable del producto. | Propuesto |
| RC-DIS-001 | El objetivo de disponibilidad requiere infraestructura, medida y aprobación explícitas. | Propuesto |
| RC-DIS-002 | Los objetivos de recuperación y respaldo requieren RTO, RPO, infraestructura y aprobación explícitos. | Propuesto |

No se inventan umbrales de rendimiento o disponibilidad: deben acordarse con quien
opera el sistema y convertirse en una prueba o monitor reproducible antes de cambiar
su estado.

## 5. Criterio de terminado y trazabilidad

Cualquier requisito o regla nuevo o modificado se considera listo para revisión cuando:

1. conserva un identificador estable y criterios observables en este documento;
2. usa la terminología canónica o actualiza el glosario con validación funcional;
3. enlaza su ruta, permiso, validadores, controller/DTO, servicio y persistencia;
4. reutiliza el proceso CRUD o componente aplicable antes de introducir otro flujo,
   consultando los [patrones aplicados](../architecture/design-and-construction-patterns.md);
5. incluye pruebas relacionadas con el CRUD en la ubicación y con las estrategias de
   [pruebas](../testing/service-test-coverage.md) correspondientes, y actualiza la matriz del
   [plan de pruebas](../testing/test-plan.md) cuando cambia el alcance;
6. actualiza la matriz de operaciones y los diagramas curados afectados, y ejecuta el
   generador cuando cambia rutas o Prisma;
7. distingue explícitamente comportamiento implementado, parcial y pendiente.

La evidencia puede enlazarse desde una incidencia hacia el ID del requisito. No se
añade una matriz duplicada de cada endpoint: el mapa generado ya conserva ese
inventario y evita que dos listas manuales diverjan.

## 6. Mantenimiento y decisiones pendientes

- El responsable funcional debe validar prioridades y criterios de aceptación; este
  análisis sólo establece la línea base derivada del repositorio.
- Al implementar requisiciones o proyectos, primero se debe revisar si el patrón de
  documentos de salida o el CRUD común puede parametrizarse para el nuevo contexto.
- OpenAPI debe comenzar con un CRUD completo y reutilizar esquemas compartidos, según
  la estrategia del contrato API.
- Las metas de rendimiento, disponibilidad, retención de auditoría y respaldo deben
  incorporarse sólo con valores medibles, propietario y mecanismo de comprobación.
