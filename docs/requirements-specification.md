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
HTTP. El [contrato API](api-contract.md), el
[mapa generado](generated/code-map.md) y el esquema Prisma aportan esos otros niveles
de detalle. Su estructura adopta selectivamente las prácticas de ingeniería de
requisitos descritas en el [criterio sobre normas documentales](documentation-standards.md),
sin declarar conformidad o certificación ISO.

## 2. Convenciones

### 2.1 Identificadores

| Prefijo | Tipo |
| --- | --- |
| `RF` | Requisito funcional observable por un actor o consumidor. |
| `RN` | Regla de negocio que restringe varios flujos. |
| `RC` | Requisito de calidad u operación. |

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
para usuarios y responsables; el [diccionario técnico](generated/data-dictionary.md)
documenta cómo se representan los datos persistentes. Ninguno debe sustituir al otro.

La [matriz de operaciones](requirements-operations-matrix.md) resume las capacidades
permitidas por módulo y contexto, incluidas las parciales o modeladas. La autorización
efectiva continúa determinada por los permisos del servidor, no por la matriz.

## 3. Actores y alcance de acceso

| Actor | Responsabilidad |
| --- | --- |
| Personal de almacén | Mantener catálogos operativos y ejecutar entradas, salidas, devoluciones y ajustes autorizados. |
| Solicitante o aprobador | Participar en documentos operativos de acuerdo con su rol y departamento. |
| Ventas o asesoría | Mantener clientes y aportar el contexto comercial de las salidas. |
| Administración | Mantener personas, usuarios y accesos; consultar auditoría y reportes permitidos. |
| Sistema | Validar, persistir atómicamente, numerar documentos, auditar escrituras críticas y notificar actualizaciones. |

Los nombres de actor expresan responsabilidades, no conceden acceso por sí mismos. La
autorización efectiva se calcula con las asignaciones de usuario, rol y departamento
descritas en [usuarios y permisos](database-users-and-permissions-analysis.md).

## 4. Requisitos funcionales

### 4.1 Acceso e identidad

| ID | Requisito y criterio de aceptación | Estado | Evidencia principal |
| --- | --- | --- | --- |
| RF-AUT-001 | Una cuenta activa puede iniciar sesión con credenciales válidas; una credencial inválida no crea una sesión autenticada. | Implementado | `src/routes/api/authApiRoute.js`, `src/routes/web/auth/loginWebRoute.js` |
| RF-AUT-002 | Una sesión puede renovarse y cerrarse mediante los flujos registrados, invalidando o reemplazando las credenciales correspondientes. | Implementado | `src/routes/web/auth/refreshWebRoute.js`, `src/routes/web/auth/logoutWebRoute.js` |
| RF-IAM-001 | Administración puede listar, crear y actualizar usuarios, incluidas sus asignaciones de rol y departamento; la lectura posterior refleja el cambio. | Implementado | `src/routes/api/admin/userApiRoute.js`, `src/controllers/api/admin/userController.js` |
| RF-IAM-002 | Administración puede listar, crear y actualizar personas y sus asignaciones; entradas inválidas no deben persistirse. | Implementado | `src/routes/api/admin/personApiRoute.js`, `src/views/pages/admin/persons` |
| RF-IAM-003 | Roles y departamentos se pueden consultar para componer asignaciones de acceso. | Implementado | `src/routes/api/admin/roleApiRoute.js`, `src/routes/api/admin/departmentApiRoute.js` |

### 4.2 Catálogos operativos y comerciales

| ID | Requisito y criterio de aceptación | Estado | Evidencia principal |
| --- | --- | --- | --- |
| RF-CAT-001 | Almacén puede consultar, crear, actualizar y eliminar materiales con presentación, unidad y límites válidos; el listado refleja la mutación. Una oferta proveedor-material sólo se presenta como eliminable si el material no participa en entradas, salidas, movimientos, ajustes o correcciones históricas. El listado y la eliminación reutilizan una sola definición de esas relaciones: el listado exige explícitamente que cada relación esté vacía y la mutación comprueba si alguna tiene registros mediante una consulta de material. La merma conserva un snapshot independiente y no se consulta como relación de `SupplierMaterial`. | Implementado | `src/routes/api/warehouse/materialApiRoute.js`, `src/views/pages/warehouse/materials`, `src/services/warehouse/materials/supplierMaterialService.js` |
| RF-CAT-002 | Almacén puede consultar, crear y actualizar proveedores y sus relaciones con materiales sin duplicar la relación proveedor-material. | Implementado | `src/routes/api/warehouse/supplierApiRoute.js`, modelo `SupplierMaterial` |
| RF-CAT-003 | Ventas puede consultar, crear y actualizar clientes y su asesor asociado. | Implementado | `src/routes/api/sales/clientApiRoute.js`, `tests/integration/controllers/clientControllerDbTest.js` |
| RF-CAT-004 | Almacén puede consultar, registrar y actualizar existencias de merma en el contexto de un material y proveedor. | Implementado | `src/routes/api/warehouse/wasteApiRoute.js`, `src/views/pages/warehouse/wastes` |
| RF-CAT-005 | Presentaciones, unidades, motivos y estados de cumplimiento se exponen como catálogos auxiliares reutilizables por los formularios operativos. | Implementado | routers de catálogo bajo `src/routes/api/warehouse` |

### 4.3 Entradas, salidas e inventario

| ID | Requisito y criterio de aceptación | Estado | Evidencia principal |
| --- | --- | --- | --- |
| RF-REC-001 | Almacén puede listar y registrar una entrada de compra con proveedor y detalles; una creación exitosa persiste encabezado, detalles y movimiento asociado. | Implementado | `src/routes/api/warehouse/goodsReceiptApiRoute.js`, modelo `GoodsReceipt` |
| RF-REC-002 | Una entrada registrada admite correcciones autorizadas conservando actor, valores anteriores/corregidos y el efecto de inventario. | Implementado | `GoodsReceiptDetailChange`, `src/services/warehouse/goodsReceipts/detailChanges` |
| RF-ISS-001 | Almacén puede listar, registrar y actualizar salidas de material con sus detalles y contexto de cliente, solicitante y departamento. | Implementado | `src/routes/api/warehouse/goodsIssueApiRoute.js`, `src/views/pages/warehouse/goodsIssues` |
| RF-ISS-002 | La entrega de una salida modifica existencias mediante movimientos trazables y no permite aplicar parcialmente una transacción fallida. Para materiales sin dimensiones, surtidos como piezas, la cantidad convertida conserva el mismo valor que la existencia resultante; al surtir la última pieza ambas quedan en cero y nunca se registra una cantidad convertida negativa. | Implementado | `src/services/inventory/movementService.js`, `src/services/warehouse/materials/supplierMaterialService.js`, `tests/unit/services/warehouse/materials/supplierMaterialServiceTest.js` |
| RF-ISS-003 | Una devolución de material registra cantidades acumuladas y enlaza el movimiento de reversa con el documento y detalle originales. | Implementado | modelos `GoodsIssueReturn` y `MovementDetail` |
| RF-WST-001 | Almacén puede listar, crear y actualizar existencias de merma reutilizando el patrón CRUD de los demás catálogos. | Implementado | `src/routes/api/warehouse/wasteApiRoute.js` |
| RF-WST-002 | Almacén puede registrar y modificar una salida de merma y sus detalles dentro de los estados permitidos. Al editar, consultar, surtir o devolver, el modal recupera la fecha de solicitud mediante el mismo selector de encabezado que la salida de material. La tabla identifica el recurso de cada detalle como «Merma». Al seleccionar una merma, el dominio Select2 replica el flujo de material: conserva en la opción sus snapshots serializados y actualiza el input informativo de presentación mediante el componente compartido de inventario. | Implementado | `src/routes/api/warehouse/wasteIssueApiRoute.js`, `src/public/js/pages/warehouse/wasteIssues/wasteIssueModal.js`, `src/public/js/pages/warehouse/goodsIssues/goodsIssueModal.js`, `src/public/js/constants/selectors.js`, `src/public/js/plugins/select2/domains/waste.js`, `src/public/js/ui/inventory/inventorySelectUI.js` |
| RF-WST-003 | Entregas y devoluciones de merma actualizan stock, cantidades acumuladas y movimientos como una sola operación observable. | Implementado | `tests/integration/controllers/wasteIssueControllerDbTest.js` |
| RF-ADJ-001 | Un ajuste de material o merma conserva motivo, tipo, estado, creador y aprobador; al aplicarse genera el movimiento y los valores anterior/nuevo. | Parcial | modelos `StockAdjustment`, `WasteStockAdjustment`; servicios de ajuste |

### 4.4 Consulta, reportes y funciones modeladas

| ID | Requisito y criterio de aceptación | Estado | Evidencia principal |
| --- | --- | --- | --- |
| RF-REP-001 | Un usuario autorizado puede consultar movimientos de materiales o mermas con filtros y exportar la información ofrecida por la pantalla. En ambos contextos, el filtro de inventario (`materialId` o `wasteId`) permanece bloqueado hasta seleccionar un proveedor; cambiar o limpiar el proveedor limpia también esa selección antes de aplicar la consulta. | Implementado | `src/routes/api/admin/movementApiRoute.js`, `src/views/pages/admin/movements`, `src/public/js/plugins/datatable/core/filters/tableFilterDependencies.js` |
| RF-REP-002 | Los módulos administrativo, comercial y de almacén pueden consultar los reportes registrados para su ámbito. | Implementado | routers `reportApiRoute.js` de cada dominio |
| RF-REP-003 | El reporte de mermas consolida existencias con el mismo nombre, proveedor y ancho. El total de mermas es la suma del stock agrupado y los metros cuadrados se recalculan por cada existencia como stock × ancho × largo antes de sumarse. En presentación `ROLLO`, el largo variable no separa el grupo; para las demás presentaciones, incluida `HOJA`, el largo sí forma parte de la agrupación. Las existencias sin una medida se agrupan conservando su ausencia y aportan cero metros cuadrados. Todos los grupos y el total general se exportan juntos en una sola hoja de cálculo denominada `Mermas`; no se crea una hoja de Excel por grupo ni por tipo de presentación. | Implementado | `src/controllers/api/warehouse/reportController.js`, `src/services/warehouse/reportService.js` |
| RF-REP-004 | Los archivos Excel conservan el valor calculado por el dominio como resultado disponible y colocan fórmulas en los datos que dependen directamente de otras celdas del reporte: diferencias de salidas, importes y resúmenes de compras, nuevo stock de movimientos y totales de merma. Así, un editor de hojas de cálculo compatible puede actualizar las dependencias al modificar manualmente los datos base, sin sustituir las reglas de negocio usadas al generar el reporte. | Implementado | `src/utils/reportExcelUtils.js`, `src/controllers/api/warehouse/reportController.js`, `src/controllers/api/admin/reportController.js` |
| RF-MER-001 | El alta de una merma exige elegir primero un proveedor según el criterio operativo. Mientras no exista proveedor, el selector de material permanece deshabilitado y al intentar usarlo muestra la misma advertencia que el flujo de compras; al elegir o cambiar proveedor, consulta únicamente los materiales relacionados mediante `SupplierMaterial` y limpia cualquier plantilla anterior. La selección de un material funciona únicamente como plantilla: el servicio devuelve identidades distintas por nombre y ancho dentro del proveedor, muestra nombre y ambas medidas nominales y normaliza como ancho sugerido la menor medida positiva. El operador confirma o corrige el ancho y captura el largo real. `Waste` conserva nombre, proveedor, presentación, unidad, costo y medidas como snapshots propios, pero no `materialId` ni una relación con `Material`, porque el origen físico de la merma no siempre es trazable. | Implementado | `prisma/schema.prisma`, `src/views/pages/warehouse/wastes/wastesPage.ejs`, `src/services/warehouse/wastes/wasteMaterialService.js`, `src/services/warehouse/wastes/wasteService.js` |
| RF-MER-002 | Al registrar una merma, el formulario propone como costo unitario máximo el mayor `maxUnitCost` disponible entre las ofertas del proveedor seleccionado para los materiales que comparten el mismo nombre y ancho normalizados que la plantilla. La normalización considera como ancho la menor dimensión positiva aunque base y altura estén invertidas. El costo máximo es obligatorio: al cambiar la selección del material, el handler del dominio aplica inmediatamente la plantilla al formulario. El frontend completa el valor desde la plantilla, pero el request debe enviarlo: Express Validator rechaza valores nulos, ausentes, negativos o inválidos antes de ejecutar el controlador y el servicio. El operador puede corregirlo durante el alta y la edición. El valor guardado es un snapshot independiente y no cambia si posteriormente se modifican los costos del catálogo; cuando el proveedor no tiene un costo registrado, debe capturarse manualmente. | Implementado | `prisma/schema.prisma`, `src/services/inventory/materialIdentity.js`, `src/services/warehouse/wastes/wasteMaterialService.js`, `src/services/warehouse/wastes/wasteService.js` |
| RF-MER-003 | El material de referencia se selecciona en un control propio durante el alta y no se presenta como identidad persistente al editar una merma. La selección siempre muestra, mediante el componente compartido `informativeValue`, el nombre de la merma, la presentación y la unidad de medida que el servidor copiará; son textos informativos y no inputs enviados. El dominio `wasteMaterialTemplate` concentra todos los eventos de los que depende este select: selección, limpieza, cambio a vacío y cambio del proveedor. Sus handlers delegan en el componente compartido `inventorySelectUI`, que reúne en un solo archivo las actualizaciones de presentación e inputs derivadas de selects de inventario; cambiar proveedor limpia la opción y reutiliza el evento resultante, sin ejecutar una segunda limpieza. El módulo `wasteSelect` sólo compone selectores y opciones de inicialización, y el modal reutiliza el componente UI para presentar los snapshots persistidos al abrirse. También completa el costo máximo unitario y, al deseleccionar la plantilla tanto mediante el evento de limpieza como mediante el cambio a un valor vacío, limpia esos `span`, el ancho sugerido y el costo para evitar conservar datos de otro material. El ancho y largo reales son obligatorios. Sólo para presentación `ROLLO` el servicio determina y el formulario completa automáticamente el ancho con la menor dimensión nominal positiva, sin esperar una captura manual; al asignar ancho o costo actualiza también el contenedor visual MDB del input, igual que los campos de presentación que reciben valores programáticos. Para otras presentaciones ambas medidas se registran manualmente. La cantidad convertida nunca se captura: se calcula como existencia × ancho × largo en altas, ajustes y salidas de merma. No se deduce un largo sin una medida física o un dato adicional de área, peso y gramaje. | Implementado | `src/views/shared/forms/informativeValue.ejs`, `src/views/pages/warehouse/wastes/wastesPage.ejs`, `src/public/js/ui/inventory/inventorySelectUI.js`, `src/public/js/plugins/select2/domains/wasteMaterialTemplate.js`, `src/public/js/plugins/select2/modules/wasteSelect.js`, `src/public/js/pages/warehouse/wastes/wasteModal.js`, `src/services/warehouse/wastes/wasteMaterialService.js`, `src/services/inventory/stockHelpers.js` |
| RF-MER-004 | El alta valida en cliente y servidor material, proveedor, ancho y largo positivos, estado y existencia no negativa. El frontend envía `materialId`, `supplierId`, medidas, stock mínimo, estado, existencia inicial y observaciones; el servidor deriva nombre, presentación, unidad, costo máximo y cantidad convertida. Materiales y mermas reutilizan las reglas comunes de estado de inventario y observaciones de ajuste, conservando separadas sólo sus reglas dimensionales y de stock específicas. El alta resuelve en un solo servicio del dominio de mermas el snapshot de material y su costo máximo; consulta el material seleccionado y después sus equivalentes con ofertas incluidas, recorre una sola vez esos equivalentes y evita una tercera agregación separada. El listado, los movimientos y el reporte consultan directamente los identificadores y snapshots de merma; los filtros de movimientos usan `wasteId` y no el identificador de la plantilla Material, con costo sujeto a permiso y sin reconstruir una relación con `SupplierMaterial`. La consulta especializada de plantillas pertenece al dominio de mermas y atraviesa su ruta, controlador, servicio, factory de lista de aplicación y dominio Select2; cada opción reutiliza el mapper común de identidad de inventario. Igual que en el flujo de material, el dominio Select2 reconstruye primero los objetos serializados de presentación y unidad y sólo después entrega la plantilla normalizada al formulario; los lectores de etiquetas no mezclan presentación con parseo de JSON. Para el select de salidas, presentación y unidad se serializan en los atributos de la opción y se reconstruyen al agregar la merma; sólo el identificador se envía al servidor. Los valores informativos vacíos reutilizan una constante visual compartida. | Implementado | `src/dtos/wasteDTO.js`, `src/validators/forms/inventoryValidations.js`, `src/validators/forms/wasteValidations.js`, `src/public/js/utils/validations/validators.js`, `src/services/warehouse/wastes/wasteService.js` |
| RF-REQ-001 | Una eventual reimplementación de requisiciones deberá definir nuevamente alcance, rutas, persistencia y pruebas CRUD; el módulo anterior fue retirado. | Fuera del alcance actual | `prisma/migrations/20260827000000_remove_purchase_requisitions/migration.sql`, `docs/service-test-coverage.md` |
| RF-PRJ-001 | Los proyectos podrán mantenerse y seleccionarse como contexto de salidas. No existe actualmente un CRUD registrado. | Modelado | modelo `Project` |

## 5. Reglas de negocio transversales

| ID | Regla verificable |
| --- | --- |
| RN-001 | Toda mutación debe validar autenticación, autorización y entrada en el servidor; ocultar un control en EJS o JavaScript no sustituye esa validación. |
| RN-002 | Una operación que cambia documento, detalle, stock y movimiento debe ser atómica: se confirman todos los cambios o ninguno. |
| RN-003 | Las cantidades suministradas o devueltas no pueden producir acumulados incompatibles con la cantidad válida del detalle. |
| RN-004 | Los documentos y movimientos que requieren referencia deben usar una referencia única y conservar el vínculo con su origen. |
| RN-005 | Las correcciones y ajustes conservan datos históricos suficientes para explicar el valor anterior, el nuevo, el motivo y el actor. |
| RN-006 | Los catálogos reutilizan el ciclo listar-crear-actualizar y componentes existentes; una diferencia de contexto no justifica duplicar transporte o coordinación CRUD. |
| RN-007 | La eliminación física sólo procede cuando el dominio y sus relaciones lo permiten; en los demás casos se usa estado, cancelación o activación. |
| RN-008 | Las escrituras críticas configuradas deben registrar actor, acción, recurso, resultado y datos de solicitud admitidos por la política de auditoría. |

## 6. Requisitos de calidad

| ID | Requisito y forma de comprobación | Estado |
| --- | --- | --- |
| RC-SEG-001 | Las contraseñas y secretos no se almacenan en texto plano ni se versionan; las rutas protegidas rechazan sesiones ausentes o sin permiso. Se comprueba con configuración, middleware y pruebas negativas. | Implementado |
| RC-DAT-001 | Las migraciones deben poder desplegarse de forma reproducible y las pruebas nunca deben usar la base de desarrollo. CI verifica la URL antes de migrar. | Implementado |
| RC-PRU-001 | Las unitarias de controllers aplican límites, particiones, decisiones, errores o efectos negativos; las integraciones CRUD atraviesan HTTP y comprueban persistencia con Prisma. | Parcial |
| RC-MAN-001 | Rutas, capas y pruebas se organizan por dominio; antes de crear un flujo se evalúan las fábricas CRUD y componentes compartidos existentes. | Implementado |
| RC-DOC-001 | Cambios en rutas, imports o Prisma deben dejar actualizados los documentos generados; `npm run docs:check` debe terminar correctamente. | Implementado |
| RC-OBS-001 | Fallos operacionales deben quedar en logs estructurados sin exponer secretos al cliente. | Implementado |
| RC-REN-001 | Tiempos máximos de respuesta, concurrencia y volumen requieren una línea base medida y aprobación del responsable del producto. | Propuesto |
| RC-DIS-001 | Objetivos de disponibilidad, recuperación y respaldo requieren infraestructura y valores acordados; no se infieren del código. | Propuesto |

No se inventan umbrales de rendimiento o disponibilidad: deben acordarse con quien
opera el sistema y convertirse en una prueba o monitor reproducible antes de cambiar
su estado.

## 7. Criterio de terminado y trazabilidad

Un requisito funcional nuevo o modificado se considera listo para revisión cuando:

1. conserva un identificador estable y criterios observables en este documento;
2. usa la terminología canónica o actualiza el glosario con validación funcional;
3. enlaza su ruta, permiso, validadores, controller/DTO, servicio y persistencia;
4. reutiliza el proceso CRUD o componente aplicable antes de introducir otro flujo,
   consultando los [patrones aplicados](design-and-construction-patterns.md);
5. incluye pruebas relacionadas con el CRUD en la ubicación y con las estrategias de
   [pruebas](service-test-coverage.md) correspondientes, y actualiza la matriz del
   [plan de pruebas](test-plan.md) cuando cambia el alcance;
6. actualiza la matriz de operaciones y los diagramas curados afectados, y ejecuta el
   generador cuando cambia rutas o Prisma;
7. distingue explícitamente comportamiento implementado, parcial y pendiente.

La evidencia puede enlazarse desde una incidencia hacia el ID del requisito. No se
añade una matriz duplicada de cada endpoint: el mapa generado ya conserva ese
inventario y evita que dos listas manuales diverjan.

## 8. Mantenimiento y decisiones pendientes

- El responsable funcional debe validar prioridades y criterios de aceptación; este
  análisis sólo establece la línea base derivada del repositorio.
- Al implementar requisiciones o proyectos, primero se debe revisar si el patrón de
  documentos de salida o el CRUD común puede parametrizarse para el nuevo contexto.
- OpenAPI debe comenzar con un CRUD completo y reutilizar esquemas compartidos, según
  la estrategia del contrato API.
- Las metas de rendimiento, disponibilidad, retención de auditoría y respaldo deben
  incorporarse sólo con valores medibles, propietario y mecanismo de comprobación.
