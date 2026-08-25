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
| RF-CAT-001 | Almacén puede consultar, crear y actualizar materiales con presentación, unidad y límites válidos; el listado refleja la mutación. | Implementado | `src/routes/api/warehouse/materialApiRoute.js`, `src/views/pages/warehouse/materials` |
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
| RF-ISS-002 | La entrega de una salida modifica existencias mediante movimientos trazables y no permite aplicar parcialmente una transacción fallida. | Implementado | servicios de salida e inventario bajo `src/services/warehouse` |
| RF-ISS-003 | Una devolución de material registra cantidades acumuladas y enlaza el movimiento de reversa con el documento y detalle originales. | Implementado | modelos `GoodsIssueReturn` y `MovementDetail` |
| RF-WST-001 | Almacén puede listar, crear y actualizar existencias de merma reutilizando el patrón CRUD de los demás catálogos. | Implementado | `src/routes/api/warehouse/wasteApiRoute.js` |
| RF-WST-002 | Almacén puede registrar y modificar una salida de merma y sus detalles dentro de los estados permitidos. | Implementado | `src/routes/api/warehouse/wasteIssueApiRoute.js` |
| RF-WST-003 | Entregas y devoluciones de merma actualizan stock, cantidades acumuladas y movimientos como una sola operación observable. | Implementado | `tests/integration/controllers/wasteIssueControllerDbTest.js` |
| RF-ADJ-001 | Un ajuste de material o merma conserva motivo, tipo, estado, creador y aprobador; al aplicarse genera el movimiento y los valores anterior/nuevo. | Parcial | modelos `StockAdjustment`, `WasteStockAdjustment`; servicios de ajuste |

### 4.4 Consulta, reportes y funciones modeladas

| ID | Requisito y criterio de aceptación | Estado | Evidencia principal |
| --- | --- | --- | --- |
| RF-REP-001 | Un usuario autorizado puede consultar movimientos de materiales o mermas con filtros y exportar la información ofrecida por la pantalla. | Implementado | `src/routes/api/admin/movementApiRoute.js`, `src/views/pages/admin/movements` |
| RF-REP-002 | Los módulos administrativo, comercial y de almacén pueden consultar los reportes registrados para su ámbito. | Implementado | routers `reportApiRoute.js` de cada dominio |
| RF-REP-003 | El reporte de mermas consolida por material, proveedor y ancho el número de mermas, la cantidad en existencia y sus metros cuadrados, e incluye la suma total del reporte. El largo variable de la merma no separa mermas relacionadas. | Implementado | `src/controllers/api/warehouse/reportController.js`, `src/services/warehouse/reportService.js` |
| RF-MER-001 | El alta de una merma exige un proveedor elegido explícitamente según el criterio operativo. La selección de un material funciona únicamente como plantilla: el servicio de plantillas del dominio de mermas devuelve materiales distintos sin repetirlos por proveedor, muestra nombre y ambas medidas nominales y normaliza como ancho sugerido la menor medida positiva. El operador confirma o corrige el ancho y captura el largo real. Nombre, proveedor y medidas quedan almacenados como datos propios de la merma, sin conservar una relación con el material seleccionado ni afirmar trazabilidad de lote, rollo o recepción. | Implementado | `prisma/schema.prisma`, `src/views/pages/warehouse/wastes/wastesPage.ejs`, `src/services/warehouse/wastes/wasteMaterialService.js`, `src/services/warehouse/wastes/wasteService.js` |
| RF-MER-002 | Al registrar una merma, el sistema conserva como costo unitario máximo el mayor `maxUnitCost` disponible entre todas las ofertas de los materiales que comparten el mismo nombre y ancho normalizados que la plantilla. La normalización considera como ancho la menor dimensión positiva aunque base y altura estén invertidas. El valor es un snapshot independiente del proveedor declarado y no cambia si posteriormente se modifican los costos del catálogo; cuando ninguna oferta tiene costo, permanece sin valor. | Implementado | `prisma/schema.prisma`, `src/services/inventory/materialIdentity.js`, `src/services/warehouse/wastes/wasteMaterialService.js`, `src/services/warehouse/wastes/wasteService.js` |
| RF-MER-003 | La selección del material siempre muestra, mediante el componente compartido `informativeValue`, la presentación y unidad de medida que el servidor copiará a la merma; son textos informativos y no inputs enviados. El ancho y largo reales son obligatorios. Sólo para presentación `ROLLO` el servicio determina y el formulario completa automáticamente el ancho con la menor dimensión nominal positiva, sin esperar una captura manual; para otras presentaciones ambas medidas se registran manualmente. La cantidad convertida nunca se captura: se calcula como existencia × ancho × largo en altas, ajustes y salidas de merma. No se deduce un largo sin una medida física o un dato adicional de área, peso y gramaje. | Implementado | `src/views/shared/forms/informativeValue.ejs`, `src/views/pages/warehouse/wastes/wastesPage.ejs`, `src/public/js/pages/warehouse/wastes/wasteTemplateForm.js`, `src/services/warehouse/wastes/wasteMaterialService.js`, `src/services/inventory/stockHelpers.js` |
| RF-MER-004 | El alta valida en cliente y servidor material, proveedor, ancho y largo positivos, estado y existencia no negativa. El frontend envía `materialId`, `supplierId`, medidas, stock mínimo, estado, existencia inicial y observaciones; el servidor deriva nombre, presentación, unidad, costo máximo y cantidad convertida. Materiales y mermas reutilizan las reglas comunes de estado de inventario y observaciones de ajuste, conservando separadas sólo sus reglas dimensionales y de stock específicas. El alta resuelve en un solo servicio del dominio de mermas el snapshot de material y su costo máximo. El listado, los movimientos y el reporte consultan directamente los identificadores y snapshots de merma, con costo sujeto a permiso y sin reconstruir una relación con `SupplierMaterial`. La consulta especializada de plantillas pertenece al dominio de mermas y atraviesa su ruta, controlador, servicio, factory de lista de aplicación y dominio Select2; cada opción reutiliza el mapper común de identidad de inventario y conserva directamente el material con sus objetos de presentación y unidad. El dominio adjunta el evento de selección y entrega esos datos al formulario sin serialización adicional; sólo el identificador se envía al servidor. Los valores informativos vacíos reutilizan una constante visual compartida. | Implementado | `src/dtos/wasteDTO.js`, `src/validators/forms/inventoryValidations.js`, `src/validators/forms/wasteValidations.js`, `src/public/js/utils/validations/validators.js`, `src/services/warehouse/wastes/wasteService.js` |
| RF-REQ-001 | Solicitantes y aprobadores podrán registrar, consultar, aprobar y entregar requisiciones con detalles y proyecto. No se considera disponible hasta registrar rutas web/API y pruebas del flujo. | Modelado | modelos `PurchaseRequisition` y `PurchaseRequisitionDetail` |
| RF-PRJ-001 | Los proyectos podrán mantenerse y seleccionarse como contexto de requisiciones y salidas. No existe actualmente un CRUD registrado. | Modelado | modelo `Project` |

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
