# Revisión de la suite de pruebas

## Alcance de esta revisión

Base de comparación: `features`, commit `01942254d7af1ab202e71b7ff011f4929da1e393`.
Se revisaron condiciones, aserciones y dependencias de todos los archivos de pruebas
activos, incluidos servidor, navegador, herramientas, integraciones y migraciones. El
corte incluye los ajustes de la primera pasada sobre ese commit. También se
revisaron los dos programas de rendimiento y sus archivos de soporte. Se contrastaron
los candidatos de retiro y los solapamientos con sus consumidores y código relacionado.
La clasificación por archivo no declara exhaustividad funcional ni reemplaza las fichas
selectivas de diseño/caso o la ejecución de navegador.
Este documento registra decisiones de diseño; los resultados de corridas pertenecen a
CI o a la revisión del cambio, según el [plan](test-plan.md).

### Ampliación por acceso operativo (2026-10-16)

Después del corte siguiente se amplía `permissionsTest.js` (**M**, TD) con las cinco
áreas operativas, sus seis roles admitidos y las operaciones expresamente excluidas.
La misma matriz conserva los permisos amplios de los cuatro roles de gestión en
Almacén/Sistemas, sus límites administrativos y la acumulación de asignaciones.
Se agrega `tests/integration/controllers/operationalAccessDbTest.js` (**M**, TD):
sesiones y asignaciones reales, acceso web, alta/edición persistida y consulta de
inventario sin costos; controles negativos de rol/sesión y escrituras sin efecto.
Complementa los contratos de rutas simulados; no los presenta como ejecución real
ni demuestra interacción de navegador. El inventario pasa a 114 archivos (95 unitarios
y 19 de integración); la clasificación del corte original de 113 se conserva abajo.

## Inventario completo y decisión por archivo

La revisión de altas/folios de merma reutiliza suites existentes: `wasteControllerFlowTest.js`
mantiene las reglas de creación, edición y ajuste y reemplaza la expectativa obsoleta
de ajuste inicial por entrada EME, con partición cero/positivo. `wasteWeightDbTest.js`
añade persistencia del documento, ausencia de efectos con cero y rollback; conserva
las comprobaciones de pesos y permisos existentes. `referencePrefixesDbTest.js`
conserva las migraciones previas y añade la nueva conversión con relaciones,
contadores y colisiones reales. El inventario activo continúa en 114 archivos;
no se retiran pruebas históricas ni se crea una suite duplicada.

Este inventario corresponde a los 113 archivos activos de la revisión: 95 unitarios
y 18 de integración. No incluye los dos archivos ya retirados en la primera pasada,
que se conservan identificados más abajo. Los números describen este corte de revisión,
no una meta de cantidad ni porcentaje de cobertura.

| Decisión | Archivos | Tratamiento |
| --- | --- | --- |
| **M — Mantener** | 75 | Conservan condiciones relevantes de producto o integridad. |
| **D — Depurar** | 24 | Conservar la regla; consolidar datos/aserciones, mejorar oráculos o ubicar correctamente los casos. No eliminar la suite completa. |
| **S — Soporte** | 12 | Mantener herramientas de documentación; identificarlas separadamente de la cobertura CRUD. |
| **R — Recomendar retiro** | 2 | Sin uso activo o convención editorial de bajo aporte; detallar la evidencia que permanece y la limitación aceptada. |

Las nuevas decisiones D/R de esta ampliación son recomendaciones: todavía no se
han aplicado esos retiros, fusiones ni cambios a las aserciones. Los cambios efectivos
de la primera pasada se distinguen en la sección siguiente.

**Técnicas:** PE = particiones de equivalencia; VF = valores frontera;
TD = tablas de decisión; TE = transiciones de estado. Indican cómo diseñar o depurar
las condiciones descritas, no una declaración de cobertura completa de cada técnica.
«Contrato» identifica composición de rutas mediante dobles: no es una técnica adicional
de ISO 29119 ni prueba de autorización ejecutada. Atomicidad, concurrencia y eficiencia
son riesgos/objetivos, no técnicas nuevas.

### DTO, errores, inventario y utilidades

Ubicación: `tests/unit/`.

| Archivo | Decisión | Técnica | Condición y oráculo relevante | Qué mantener o modificar |
| --- | --- | --- | --- | --- |
| [dtos/goodsReceiptDTOTest.js](../../tests/unit/dtos/goodsReceiptDTOTest.js) | **M** | PE | Factura normalizada, IDs de detalle y partidas repetidas con precios diferentes. | Mantener las tres condiciones; no agrupar partidas sólo por material. |
| [dtos/materialDTOTest.js](../../tests/unit/dtos/materialDTOTest.js) | **M** | TD / PE | Alta directa frente a compra; descarte de referencias históricas. | Conservar separación de costo/stock inicial y campos permitidos. |
| [dtos/wasteDTOTest.js](../../tests/unit/dtos/wasteDTOTest.js) | **D** | PE | Nombre, pesos capturados, campos editables y observaciones normalizados. | El caso de alta usa `toMatchObject`: añadir exclusión explícita de `weightKg` y derivados de muestra; enviarlos como datos no demuestra su descarte. |
| [errors/databaseErrorTest.js](../../tests/unit/errors/databaseErrorTest.js) | **M** | PE | P2021/P2022, cliente desactualizado y error ajeno conservado. | Mantener códigos, estado y clasificación; no depende de una BD caída. |
| [errors/wasteIssueErrorTest.js](../../tests/unit/errors/wasteIssueErrorTest.js) | **M** | PE | Conflictos de dominio tienen código, estado y traducción de interfaz. | Mantener por el defecto previo de mensajes frente a errorMap. |
| [helpers/rollbackTransactionTest.js](../../tests/unit/helpers/rollbackTransactionTest.js) | **R** | PE / TE | Ejecuta y propaga fallos de un helper de pruebas sin consumidores activos. | Retirar junto con tests/helpers/rollbackTransaction.js: sólo se referencian entre sí. No demuestra rollback real de PostgreSQL. |
| [inventory/movementHelpersTest.js](../../tests/unit/inventory/movementHelpersTest.js) | **M** | PE | Agrupar stock repetido sin fusionar evidencia de detalles. | Mantener suma decimal e identidades distintas. |
| [inventory/stockHelpersTest.js](../../tests/unit/inventory/stockHelpersTest.js) | **M** | PE / VF | Conversión con/sin dimensiones, cero permitido y saldo negativo con metadatos. | Mantener contratos plano/anidado; integración no reemplaza sus fronteras. |
| [lib/queuedPrismaPgTest.js](../../tests/unit/lib/queuedPrismaPgTest.js) | **M** | TE | Orden por transacción, propagación de fallo y avance de conexiones independientes. | Mantener las cuatro condiciones; ordenar consultas de una conexión no debe serializar el pool completo. |
| [repository/paginationRepositoryTest.js](../../tests/unit/repository/paginationRepositoryTest.js) | **M** | PE / TE | Conteos correctos, cursor sin duplicados y cancelación del consumidor. | Mantener también ausencia de conteos en exportación; aquí el número de consultas protege un requisito de eficiencia. |
| [utils/formattersUtilsTest.js](../../tests/unit/utils/formattersUtilsTest.js) | **D** | VF / PE | Febrero bisiesto y selección del mes local ante entrada inválida. | Fijar el reloj y afirmar fechas exactas del fallback; el regex actual acepta cualquier mes con forma válida. |
| [utils/issueQueryUtilsTest.js](../../tests/unit/utils/issueQueryUtilsTest.js) | **M** | PE | Filtros de salida, orden y valores predeterminados conservados. | Mantener como contrato específico sobre las utilidades HTTP generales. |
| [utils/reportExcelUtilsTest.js](../../tests/unit/utils/reportExcelUtilsTest.js) | **M** | PE / TE | XLSX real, fórmulas/cero, filas asíncronas, descargas coincidentes, fallo y limpieza al cancelar. | Mantener: valida contenido y ciclo de vida de temporales, sin sustituir medición de rendimiento. |
| [utils/requestQueryUtilsTest.js](../../tests/unit/utils/requestQueryUtilsTest.js) | **M** | PE / VF | Paginación segura, variantes de búsqueda/orden, fechas inclusivas y booleanos mensuales. | Mantener variantes de contrato admitidas; no confundirlas con repetición del mismo dato. |
| [utils/warehouseInventoryUtilsTest.js](../../tests/unit/utils/warehouseInventoryUtilsTest.js) | **D** | PE / TE | Relaciones JSON, identidad, datos inmutados y payloads de detalles. | Fusionar los dos casos de `mapSelectMaterialData` para material listado/recién creado si usan la misma forma; reunir sus aserciones únicas y conservar las demás particiones. |
| [warehouse/goodsReceiptHelpersTest.js](../../tests/unit/warehouse/goodsReceiptHelpersTest.js) | **D** | TD / PE | Activos, tipo de compra e histórico inactivo admitido para corrección. | Conservar esas reglas; reemplazar las dos aserciones de include de Prisma por relaciones observadas en respuesta real antes de retirarlas. Reubicar al área propietaria al tocar la suite. |

### Validaciones del servidor

Ubicación: `tests/unit/validators/`.

| Archivo | Decisión | Técnica | Condición y oráculo relevante | Qué mantener o modificar |
| --- | --- | --- | --- | --- |
| [catalogValidationTest.js](../../tests/unit/validators/catalogValidationTest.js) | **M** | PE / VF | Lista blanca, campos por catálogo, límites y códigos de rechazo. | Mantener configuraciones distintas y resolución de ID delegada al servicio. |
| [decimalPrecisionValidationTest.js](../../tests/unit/validators/decimalPrecisionValidationTest.js) | **D** | VF | Seis decimales y capacidad numérica admitida/rechazada. | Conservar datos; verificar campo/código del rechazo, no sólo una colección de errores no vacía. |
| [goodsReceiptDetailsValidationTest.js](../../tests/unit/validators/goodsReceiptDetailsValidationTest.js) | **D** | PE / VF | Detalles válidos y rechazos en alta y encabezado. | Conservar ambos contratos; comprobar campo/código por dato inválido en lugar de sólo errores no vacíos. |
| [issueReturnValidationTest.js](../../tests/unit/validators/issueReturnValidationTest.js) | **M** | PE / VF | Cantidad positiva, cero/negativo y observaciones mayores de 500. | Mantener entrada válida y las tres clases de rechazo. |
| [materialValidationTest.js](../../tests/unit/validators/materialValidationTest.js) | **M** | TD / PE | Compra/directo, pareja opcional, proveedor, consumibles sin medidas y referencias prohibidas. | Mantener; integra reglas comunes en contratos distintos del servidor. |
| [requiredFieldValidationTest.js](../../tests/unit/validators/requiredFieldValidationTest.js) | **D** | PE | Ausente, nulo, valor presente inválido y códigos de campos anidados. | Mantener datos y códigos; corregir la etiqueta valor límite para null: ausencia y nulidad son particiones, no una frontera numérica. |
| [weightCaptureValidationTest.js](../../tests/unit/validators/weightCaptureValidationTest.js) | **M** | PE / VF / TD | Tipos crudos, rango, precisión, pareja, prioridad y respuesta con códigos. | Mantener la matriz principal; la opción de total no obligatorio es un contrato genérico del helper, no un alta actual de proveedor. |

### Colecciones y validaciones del navegador

Ubicación: `tests/unit/public/js/utils/`.

| Archivo | Decisión | Técnica | Condición y oráculo relevante | Qué mantener o modificar |
| --- | --- | --- | --- | --- |
| [detailCollectionUtilsTest.js](../../tests/unit/public/js/utils/detailCollectionUtilsTest.js) | **M** | PE / TE | Nuevos/persistidos, IDs de cliente, proveedor distinto, reemplazo, retiro y ausencia. | Mantener estados e identidades; no se repiten al cambiar de material a merma si cambia la clave del contrato. |
| [validations/goodsReceiptValidatorsTest.js](../../tests/unit/public/js/utils/validations/goodsReceiptValidatorsTest.js) | **D** | TD / VF | Factura condicionada y alta con detalles frente a edición incremental vacía. | Conservar decisiones y fronteras; sustituir igualdad de referencias de funciones por entradas/resultados antes de quitar esos checks. |
| [validations/materialValidatorsTest.js](../../tests/unit/public/js/utils/validations/materialValidatorsTest.js) | **D** | TD / PE | Proveedor requerido al ajustar y costo opcional desde compra. | Conservar esas reglas; retirar orden de `Object.keys` e identidad entre funciones, trasladando cualquier condición única a aserciones de comportamiento. |
| [validations/wasteValidatorsTest.js](../../tests/unit/public/js/utils/validations/wasteValidatorsTest.js) | **M** | PE / VF / TD | Formato/rango, presentación, pareja de pesos y traducción del código. | Mantener contrato de mensajes frontend; compartir vectores con servidor si se consolidan datos, sin afirmar que una capa sustituye a la otra. |
| [wasteWeightCalculationsTest.js](../../tests/unit/public/js/utils/wasteWeightCalculationsTest.js) | **M** | PE / VF | Ancho menor, proporcionalidad, cono compartido, referencia inválida y rechazo de dimensiones forzadas. | Mantener cálculo puro y preparación del servidor; ninguna unitaria del modal prueba estos rechazos por sí sola. |

### Servicios de inventario y almacén

Ubicación: `tests/unit/services/`.

| Archivo | Decisión | Técnica | Condición y oráculo relevante | Qué mantener o modificar |
| --- | --- | --- | --- | --- |
| [admin/catalogServiceTest.js](../../tests/unit/services/admin/catalogServiceTest.js) | **M** | PE / VF | Lista blanca, campos permitidos, límites y errores Prisma traducidos. | Mantener; valida invocación directa además de la validación HTTP. |
| [inventory/materialIdentityTest.js](../../tests/unit/services/inventory/materialIdentityTest.js) | **M** | PE | Menor dimensión positiva con cadenas, cero y negativos. | Mantener: este helper sigue siendo usado por las referencias de merma. |
| [inventory/movementQueryServiceTest.js](../../tests/unit/services/inventory/movementQueryServiceTest.js) | **M** | PE | Consulta de merma restringida a Waste y proveedor elegidos. | Mantener filtro específico; no representa todo el CRUD de movimientos. |
| [inventory/movementServiceTest.js](../../tests/unit/services/inventory/movementServiceTest.js) | **M** | TE / PE | Saldos reales distribuidos por detalle repetido sin mutar la oferta. | Mantener secuencia e IDs de origen; la lectura agrupada protege consistencia y consultas. |
| [warehouse/consumables/consumableServiceTest.js](../../tests/unit/services/warehouse/consumables/consumableServiceTest.js) | **M** | TD / PE | Tipo CONSUMABLE fijo en operaciones y dimensiones descartadas al crear. | Mantener: sus fachadas añaden restricciones de negocio, no son simples requests de frontend. |
| [warehouse/goodsIssues/goodsIssueContextServicesTest.js](../../tests/unit/services/warehouse/goodsIssues/goodsIssueContextServicesTest.js) | **M** | TD | Cada operación fija MATERIAL/CONSUMABLE pese a un tipo contrario recibido. | Mantener tabla de operaciones; autorización y persistencia se comprueban aparte. |
| [warehouse/goodsIssues/goodsIssueHelpersTest.js](../../tests/unit/services/warehouse/goodsIssues/goodsIssueHelpersTest.js) | **M** | TD / PE | Material/proveedor inactivos, tipo contrario y creación válida. | Mantener ambos contextos y errores específicos. |
| [warehouse/goodsIssues/goodsIssueListServiceTest.js](../../tests/unit/services/warehouse/goodsIssues/goodsIssueListServiceTest.js) | **M** | TD / PE | Contexto, área y conteos en listado/reporte. | Mantener protección de alcance y omisión de conteos; no es una medida de latencia. |
| [warehouse/goodsReceipts/goodsReceiptContextServicesTest.js](../../tests/unit/services/warehouse/goodsReceipts/goodsReceiptContextServicesTest.js) | **D** | TD | Fachadas de compra fijan tipo en consulta, corrección y reporte. | Conservar la regla; usar también parámetros de tipo contrario y cubrir operaciones de fachada faltantes con tabla compartida, sin multiplicar setup. |
| [warehouse/goodsReceipts/goodsReceiptContextWhereTest.js](../../tests/unit/services/warehouse/goodsReceipts/goodsReceiptContextWhereTest.js) | **M** | PE | Contexto con cabecera/detalles, ausencia de contexto y tipo no reconocido. | Mantener este contrato reutilizado por lecturas y escrituras; SQL real prueba además su semántica. |
| [warehouse/goodsReceipts/goodsReceiptInvoiceServiceTest.js](../../tests/unit/services/warehouse/goodsReceipts/goodsReceiptInvoiceServiceTest.js) | **M** | PE / TD | Factura duplicada, exclusión de la propia compra y ausencia de factura. | Mantener código y referencia del registro existente. |
| [warehouse/goodsReceipts/goodsReceiptListServiceTest.js](../../tests/unit/services/warehouse/goodsReceipts/goodsReceiptListServiceTest.js) | **M** | PE / TD | Conteo compartido sin filtro, conteos distintos con búsqueda y reporte sin conteos. | Mantener: los conteos y filtros son resultados/operaciones relevantes para eficiencia y contexto. |
| [warehouse/materials/supplierMaterialServiceTest.js](../../tests/unit/services/warehouse/materials/supplierMaterialServiceTest.js) | **D** | PE / TD | Elegibilidad de retiro por historia, tipo fijo y oferta anidada. | Fusionar casos repetidos de `findSupplierMaterialByIds` y parametrizar accesos por ID/par/snapshot; preservar filtros de uso y datos propios de cada contrato. |
| [warehouse/materials/supplierMaterialStockServiceTest.js](../../tests/unit/services/warehouse/materials/supplierMaterialStockServiceTest.js) | **M** | VF / TE | Agotar consumible lleva ambos saldos a cero; insuficiencia devuelve identidad/error. | Mantener SQL parametrizado y error de dominio, complementados por concurrencia real. |
| [warehouse/reportServiceTest.js](../../tests/unit/services/warehouse/reportServiceTest.js) | **D** | PE / VF | Agrupación, metros cuadrados, peso desconocido, stock cero y alcance. | Conservar; actualizar el caso titulado límite de 100 kg: ahora el unitario llega a 999.99. Probar un acumulado superior a ese máximo sin rechazarlo como peso unitario. |
| [warehouse/wastes/wasteListServiceTest.js](../../tests/unit/services/warehouse/wastes/wasteListServiceTest.js) | **M** | PE | Listado conserva datos propios de merma, catálogos y conteos. | Mantener selección de datos necesarios; no confundir respuesta simulada con verificación de privacidad de costos. |
| [warehouse/wastes/wasteMaterialServiceTest.js](../../tests/unit/services/warehouse/wastes/wasteMaterialServiceTest.js) | **M** | PE / TD | Sin proveedor no consulta; ancho/familia/costo, paginación y oferta conservada. | Mantener: integración de elegibilidad no prueba todas las reglas de familia/costo. |
| [warehouse/wastes/wasteMovementServiceTest.js](../../tests/unit/services/warehouse/wastes/wasteMovementServiceTest.js) | **M** | TE / PE | Signo de entrada/salida y saldos secuenciales de detalles repetidos. | Mantener vínculo de movimiento y agrupación de saldo sin fusionar historial. |
| [warehouse/wastes/wasteStockEntryServiceTest.js](../../tests/unit/services/warehouse/wastes/wasteStockEntryServiceTest.js) | **M** | TE | Folio, actor, observación, conversión y vínculo entre entrada y movimiento. | Mantener; agregar stock no debe confundirse con ajuste absoluto. |

### Política y controladores

Ubicación: `tests/unit/`.

| Archivo | Decisión | Técnica | Condición y oráculo relevante | Qué mantener o modificar |
| --- | --- | --- | --- | --- |
| [constants/permissionsTest.js](../../tests/unit/constants/permissionsTest.js) | **M** | TD | Accesos por rol/área y denegaciones explícitas. | Mantener política de permisos; las integraciones actuales no ejercitan todas sus combinaciones. |
| [controllers/api/warehouse/consumableControllerTest.js](../../tests/unit/controllers/api/warehouse/consumableControllerTest.js) | **D** | PE / TD | Actor, permiso de costos y DTO enviados al servicio tipado. | Conservar decisiones y normalización; separar el caso que agrupa cuatro operaciones y comprobar su respuesta relevante, evitando pruebas sólo por nombre de delegado. |
| [controllers/api/warehouse/goodsIssueControllerTest.js](../../tests/unit/controllers/api/warehouse/goodsIssueControllerTest.js) | **M** | PE / TD | Devolución normalizada con actor y contexto de material/consumible. | Mantener las dos variantes de entrada al servicio y respuesta. |
| [controllers/api/warehouse/goodsReceiptControllerTest.js](../../tests/unit/controllers/api/warehouse/goodsReceiptControllerTest.js) | **M** | TE | Edición usa DTO y emite actualización de inventario después del servicio. | Mantener efecto de notificación; HTTP/Prisma no prueba por sí solo este evento. |
| [controllers/api/warehouse/materialControllerTest.js](../../tests/unit/controllers/api/warehouse/materialControllerTest.js) | **M** | TD | Permiso determina `canReadCosts` al consultar. | Mantener ambas decisiones; el mock no demuestra que un actor sin permiso reciba datos sin costo. |
| [controllers/api/warehouse/reportControllerTest.js](../../tests/unit/controllers/api/warehouse/reportControllerTest.js) | **D** | PE / TD | Fórmulas, resúmenes, etiquetas de contexto y periodo mensual. | Conservar fórmulas/valores; quitar aserciones vacías como objectContaining({}) y conteos redundantes. Las posiciones del XLSX son contrato del reporte, no CSS incidental. |
| [controllers/api/warehouse/wasteControllerFlowTest.js](../../tests/unit/controllers/api/warehouse/wasteControllerFlowTest.js) | **D** | TE / TD | Alta/ajuste, proveedor inactivo, identidad, edición permitida y conflicto. | Conservar condiciones únicas; renombrar complete flow para advertir persistencia simulada y reducir comprobaciones internas ya sustituidas por oráculos HTTP/Prisma equivalentes. |
| [controllers/api/warehouse/wasteControllerTest.js](../../tests/unit/controllers/api/warehouse/wasteControllerTest.js) | **M** | PE / TD | Filtros, costos, campos permitidos y diferencia entre sumar stock y ajustarlo. | Mantener contratos HTTP/DTO/actor; no son equivalentes a las reglas del servicio. |
| [controllers/api/warehouse/wasteIssueControllerTest.js](../../tests/unit/controllers/api/warehouse/wasteIssueControllerTest.js) | **M** | PE / TE | DTO, estados controlados por servidor, edición/surtido y devolución. | Mantener descarte de estados forzados y cantidades normalizadas. |
| [controllers/api/warehouse/wasteRegistrationBoundaryTest.js](../../tests/unit/controllers/api/warehouse/wasteRegistrationBoundaryTest.js) | **D** | PE / VF / TD | Contrato HTTP detiene errores antes del DTO/servicio. | Conservar máximos y representantes por campo/pareja; mover variantes crudas únicas a la matriz de weightCaptureValidation antes de reducir repeticiones. Un 200 con servicio simulado no demuestra alta real de Rollo sin pesos. |
| [controllers/web/warehouse/goodsIssueControllerTest.js](../../tests/unit/controllers/web/warehouse/goodsIssueControllerTest.js) | **D** | PE / TD | Contexto correcto de página y acceso oculto sin permiso. | Mantener esas condiciones; retirar las dos variantes que fijan regex de class active/orden de atributos. No acreditan seguridad HTTP ni navegador. |

### Rutas protegidas

Ubicación: `tests/unit/routes/`.

| Archivo | Decisión | Técnica | Condición y oráculo relevante | Qué mantener o modificar |
| --- | --- | --- | --- | --- |
| [api/admin/personApiRouteTest.js](../../tests/unit/routes/api/admin/personApiRouteTest.js) | **M** | Contrato | Token, validación y permiso en escrituras de personas. | Mantener hasta tener sustitución HTTP con router real; la igualdad del objeto router no añade evidencia. |
| [api/sales/clientApiRouteTest.js](../../tests/unit/routes/api/sales/clientApiRouteTest.js) | **M** | Contrato | Registro de validación y autorización de clientes. | Mantener controles; simplificar aserción del objeto router cuando se toque la suite. |
| [api/warehouse/consumableApiRouteTest.js](../../tests/unit/routes/api/warehouse/consumableApiRouteTest.js) | **M** | Contrato | Lectura, alta, edición, ajuste y retiro con permisos del dominio. | Mantener; no equivale a la suite retirada de URLs del cliente. |
| [api/warehouse/goodsIssues/goodsIssueContextRoutesTest.js](../../tests/unit/routes/api/warehouse/goodsIssues/goodsIssueContextRoutesTest.js) | **M** | Contrato | Operaciones por contexto con permisos de gestionar/surtir y validadores. | Mantener cada operación con su handler; los mocks no ejecutan JWT/autorización. |
| [api/warehouse/goodsReceipts/goodsReceiptContextRoutesTest.js](../../tests/unit/routes/api/warehouse/goodsReceipts/goodsReceiptContextRoutesTest.js) | **M** | Contrato | Rutas de compra/corrección/cancelación por contexto protegidas. | Mantener registro de controles; completar HTTP negativo antes de sustituirlos. |
| [api/warehouse/wasteApiRouteTest.js](../../tests/unit/routes/api/warehouse/wasteApiRouteTest.js) | **M** | Contrato | Alta/edición, agregar stock y ajuste con permisos distintos. | Mantener: evita exponer una escritura con el permiso equivocado. |
| [api/warehouse/wasteIssueApiRouteTest.js](../../tests/unit/routes/api/warehouse/wasteIssueApiRouteTest.js) | **M** | Contrato | CRUD, surtido y devolución de merma con protección específica. | Mantener; no presentarlo como autenticación ejecutada. |
| [web/warehouse/consumableWebRouteTest.js](../../tests/unit/routes/web/warehouse/consumableWebRouteTest.js) | **M** | Contrato | Página de consumibles exige cookie y permiso de lectura. | Mantener condición de acceso; no hace falta repetir la identidad del router. |
| [web/warehouse/wasteIssueWebRouteTest.js](../../tests/unit/routes/web/warehouse/wasteIssueWebRouteTest.js) | **M** | Contrato | Página de salida de merma exige sesión y permiso propio. | Mantener; el permiso de página difiere del permiso API. |

### Interfaz y contratos HTTP del navegador

Ubicación: `tests/unit/`.

| Archivo | Decisión | Técnica | Condición y oráculo relevante | Qué mantener o modificar |
| --- | --- | --- | --- | --- |
| [plugins/select2/wasteMaterialTemplateTest.js](../../tests/unit/plugins/select2/wasteMaterialTemplateTest.js) | **D** | TE / PE | Objeto seleccionado/relaciones conservados, cálculo y limpieza repetida segura. | Mantener; quitar el check de configuración `clearOnOpen` si no añade condición observable. No sustituye el plugin real. |
| [public/js/api/errorHandlerTest.js](../../tests/unit/public/js/api/errorHandlerTest.js) | **M** | PE | Error conocido presenta mensaje y código identificable al usuario. | Mantener código visible; no afirmar sanitización de mensajes arbitrarios sólo por esta entrada conocida. |
| [public/js/api/utilsTest.js](../../tests/unit/public/js/api/utilsTest.js) | **M** | PE | JSON en Blob, códigos sin mensaje, fallo de red y contenido inválido. | Mantener normalización de errores de descargas y estado HTTP. |
| [public/js/pages/warehouse/materials/materialFormTest.js](../../tests/unit/public/js/pages/warehouse/materials/materialFormTest.js) | **M** | PE | Crear/editar no envían referencias históricas del rollo. | Mantener lista de campos del navegador; DTO del servidor no prueba ese payload. |
| [public/js/pages/warehouse/wastes/wasteFormTest.js](../../tests/unit/public/js/pages/warehouse/wastes/wasteFormTest.js) | **M** | TD / TE | Confirmar/cancelar duplicado, permiso/modo/ID y payload con medidas deshabilitadas. | Mantener todas las condiciones de negocio; abrir modal no debe escribir stock. |
| [public/js/pages/warehouse/wastes/wasteStockAdditionModalTest.js](../../tests/unit/public/js/pages/warehouse/wastes/wasteStockAdditionModalTest.js) | **M** | TE / VF | Precarga, resultado al editar y cero convertido en cantidad pendiente. | Mantener cantidad/observaciones y saldo calculado; no afirma renderizado real de MDB. |
| [public/js/services/warehouse/goodsIssueServiceTest.js](../../tests/unit/public/js/services/warehouse/goodsIssueServiceTest.js) | **M** | TD | Contexto de página/aplicación dirige solicitudes y reporte al recurso correcto. | Mantener: contiene decisiones de contexto, a diferencia de la delegación trivial retirada. |
| [public/js/services/warehouse/goodsReceiptServiceTest.js](../../tests/unit/public/js/services/warehouse/goodsReceiptServiceTest.js) | **M** | TD | Entradas conservan contexto fijo frente a página/parametrización contraria. | Mantener ambos contextos y sus operaciones. |
| [public/js/ui/forms/formUITest.js](../../tests/unit/public/js/ui/forms/formUITest.js) | **M** | TE | Un envío pendiente no repite preparación/validación/escritura. | Mantener: aquí contar llamadas protege contra doble envío, no sólo contra cambios de implementación. |
| [public/js/ui/inventory/materialMeasurementFieldTest.js](../../tests/unit/public/js/ui/inventory/materialMeasurementFieldTest.js) | **M** | TD / TE | Unidad y modo habilitan/descartan/conservan medidas; consumibles sin dimensiones. | Mantener por la regresión de piezas; pruebas puras de validación no asignan esos estados al formulario. |
| [public/js/ui/inventory/warehouseInventoryColumnsTest.js](../../tests/unit/public/js/ui/inventory/warehouseInventoryColumnsTest.js) | **M** | PE | Cero de cono se diferencia de peso desconocido y de no aplicable. | Mantener este caso semántico ya depurado; no restaurar orden/HTML exactos. |
| [public/js/ui/inventory/wasteWeightFieldTest.js](../../tests/unit/public/js/ui/inventory/wasteWeightFieldTest.js) | **M** | TE / TD | Recálculo y limpieza de neto/largo, ancho fijo, modo inmutable y cambio a Hoja. | Mantener las orientaciones y cambios de referencia; el cálculo puro no comprueba la asignación de campos. |

### Herramientas de documentación

Ubicación: `tests/unit/scripts/`.

| Archivo | Decisión | Técnica | Condición y oráculo relevante | Qué mantener o modificar |
| --- | --- | --- | --- | --- |
| [architectureDiagramUtilsTest.js](../../tests/unit/scripts/architectureDiagramUtilsTest.js) | **S** | PE | Verificador detecta rutas/métodos/funciones atribuidos al archivo equivocado. | Mantener como soporte; no valida la semántica de negocio del diagrama. |
| [documentExportContentUtilsTest.js](../../tests/unit/scripts/documentExportContentUtilsTest.js) | **S** | PE / TD | Anclas, enlaces, narración e imágenes por actor sin alterar código literal. | Mantener contratos del exportador; no son casos CRUD. |
| [documentExportFormatsTest.js](../../tests/unit/scripts/documentExportFormatsTest.js) | **S** | TD | CLI selecciona familia/sección/formato y conserva DOCX intermedio para PDF. | Mantener combinaciones válidas; no implica conversión real. |
| [documentExportImageUtilsTest.js](../../tests/unit/scripts/documentExportImageUtilsTest.js) | **S** | PE | PNG válido/inválido y orientación limitan dimensión de la figura. | Mantener regla de tamaño; exportación visual sigue siendo una verificación distinta. |
| [documentOutputUtilsTest.js](../../tests/unit/scripts/documentOutputUtilsTest.js) | **S** | TE | Archivo ocupado se reintenta y error persistente informa cómo liberarlo. | Mantener por Windows; número de intentos es contrato de recuperación. |
| [expressRouteUtilsTest.js](../../tests/unit/scripts/expressRouteUtilsTest.js) | **D** | PE | Parser de rutas literales y alternativas no omite rutas dinámicas silenciosamente. | Mantener parser; reemplazar la expectativa de seis rutas del archivo real por un fixture estable. Agregar un endpoint no debe romper un test por cantidad fija. |
| [manualCaseNumberingTest.js](../../tests/unit/scripts/manualCaseNumberingTest.js) | **R** | Convención editorial | Sólo fija consecutivos, prefijos de archivo, títulos y orden del índice. | Recomendar retiro por bajo aporte funcional; no perder validación de IDs/enlaces/inventario en otras herramientas. Se deja de exigir consecutividad desde Vitest. |
| [manualPublicationContentTest.js](../../tests/unit/scripts/manualPublicationContentTest.js) | **D** | TD / PE | Publicación por perfil no incorpora acciones/capturas de otro actor. | Mantener permisos documentados, enlaces e imágenes; consolidar unicidad redundante con `validateInventory` y evitar cantidades editoriales fijas sin regla. |
| [manualScreenshotInventoryTest.js](../../tests/unit/scripts/manualScreenshotInventoryTest.js) | **D** | PE / TD | CLI lista inventario por área y excluye acciones ajenas al perfil. | Mantener alcance/IDs; retirar ordinales fijos 90/101/186 y comparación de tabla como texto exacto. No exige generar capturas nuevas. |
| [manualScreenshotPageStateTest.js](../../tests/unit/scripts/manualScreenshotPageStateTest.js) | **S** | TE | Captura sólo continúa con estado esperado; distingue sesión expirada y falta de permiso. | Mantener soporte de captura; no demuestra el flujo real del producto. |
| [manualScreenshotRecoveryTest.js](../../tests/unit/scripts/manualScreenshotRecoveryTest.js) | **S** | TE | Timeout reintenta con página nueva; otros fallos no se repiten y se cierra el recurso. | Mantener recuperación y limpieza; son efectos útiles del automatizador. |
| [mermaidExportUtilsTest.js](../../tests/unit/scripts/mermaidExportUtilsTest.js) | **S** | PE | Normalización, geometría no finita y caché según contenido/renderizador. | Mantener; un string válido no sustituye una exportación Mermaid real. |
| [pdfExportUtilsTest.js](../../tests/unit/scripts/pdfExportUtilsTest.js) | **S** | PE | Distingue salida no PDF y PDF truncado por marcadores. | Mantener como guardia mínima; no acredita estructura completa ni legibilidad del documento. |
| [prepareMermaidCliTest.js](../../tests/unit/scripts/prepareMermaidCliTest.js) | **S** | TD / TE | Renderer compatible se reutiliza; instalación no altera manifiestos y falla si es incompatible. | Mantener dobles de comandos, sin ejecutar instalaciones en la suite. |
| [preparePdfConverterTest.js](../../tests/unit/scripts/preparePdfConverterTest.js) | **S** | TD / TE | Selección por SO, entorno no mutado, ejecutable explícito y fallo de preparación. | Mantener recuperación por plataforma; no acredita conversión real en todos los sistemas. |
| [sequenceDiagramUtilsTest.js](../../tests/unit/scripts/sequenceDiagramUtilsTest.js) | **S** | PE | Fragmentos, activaciones y trazabilidad de archivos/importaciones/líneas de vida. | Mantener contratos del verificador usado por documentación; no contarlo como aceptación funcional. |

### Integración HTTP y PostgreSQL

Ubicación: `tests/integration/controllers/`.

| Archivo | Decisión | Técnica | Condición y oráculo relevante | Qué mantener o modificar |
| --- | --- | --- | --- | --- |
| [catalogControllersDbTest.js](../../tests/integration/controllers/catalogControllersDbTest.js) | **M** | PE / VF | Catálogos registrados, CRUD compartido, persistencia y límite rechazado. | Mantener configuración real de cada lectura y escritura representativa del servicio compartido. |
| [clientControllerDbTest.js](../../tests/integration/controllers/clientControllerDbTest.js) | **M** | TE / PE | Crear/listar/editar cliente y traducir inexistente a CLIENT_NOT_FOUND. | Mantener HTTP más lectura Prisma; no equivale al test de registro de middleware. |
| [goodsIssueControllerDbTest.js](../../tests/integration/controllers/goodsIssueControllerDbTest.js) | **D** | TD / TE | Aislamiento de tipos, escrituras permitidas/prohibidas, stock, folios y rollback. | Mantener todos los escenarios; mover pruebas de migración a migrations sin borrarlas y evitar migration.split(';')[1]. Llamar filas de reporte a la consulta que no descarga XLSX. |
| [goodsReceiptContextDbTest.js](../../tests/integration/controllers/goodsReceiptContextDbTest.js) | **M** | TD / TE | Compras homogéneas frente a mixtas/vacías, tipo fijo, folios concurrentes y fallo atómico. | Mantener; las filas del servicio de reporte no prueban el archivo Excel. |
| [inventoryReportControllerDbTest.js](../../tests/integration/controllers/inventoryReportControllerDbTest.js) | **M** | VF / PE | XLSX con más de 5000 filas, columna Stock actual, orden/alcance/tipo, vacío y sin cambios de stock. | Mantener cruce de bloque y nombres iguales. Usa router real/cookie firmada; no reemplazarlo por respuesta mock. |
| [materialControllerDbTest.js](../../tests/integration/controllers/materialControllerDbTest.js) | **M** | TD / PE | Pieza/consumible sin dimensiones, conversión, compra contextual y origen m² de merma. | Mantener guardia del servidor ante ID forzado; el filtro de Select2 no lo sustituye. |
| [movementContextDbTest.js](../../tests/integration/controllers/movementContextDbTest.js) | **M** | TD / PE | Listado y XLSX por tipo, paginación/filtros y HTTP 401/403. | Mantener: monta routers reales y JWT/cookies; es evidencia adicional a los controllers con actor inyectado. |
| [supplierControllerDbTest.js](../../tests/integration/controllers/supplierControllerDbTest.js) | **M** | TE | Alta, consulta y edición del proveedor con persistencia real. | Mantener; la normalización genérica de catálogos no sustituye este dominio. |
| [warehouseConcurrencyControllerDbTest.js](../../tests/integration/controllers/warehouseConcurrencyControllerDbTest.js) | **M** | TE / TD | Surtido/devolución coincidentes, lotes, saldos e historial, correcciones/cancelaciones y rollback. | Mantener bloqueos y oráculos completos. No eliminar por contener bucles: generan escenarios adversos reales; algunos ejercitan servicios y otros controllers HTTP. |
| [wasteIssueControllerDbTest.js](../../tests/integration/controllers/wasteIssueControllerDbTest.js) | **D** | TE / TD | Alta, edición, surtido, movimientos, devoluciones parcial/total, bloqueo posterior y stock insuficiente. | Conservar reglas; dividir el primer it extenso en escenarios con preparación reutilizable y oráculos propios. No perder retorno total ni prohibición de resurtir. |
| [wasteWeightDbTest.js](../../tests/integration/controllers/wasteWeightDbTest.js) | **D** | PE / VF / TD | Pesos/neto/largo, origen, inmutabilidad, historia, stock separado y XLSX real. | Mantener cobertura principal. Consolidar variantes de sólo lectura tras cubrirlas en validación; comprobar códigos concretos en los últimos rechazos de material, cuyo motivo actual es campo prohibido, no formato de peso. |

### Migraciones y conservación histórica

Ubicación: `tests/integration/migrations/`.

| Archivo | Decisión | Técnica | Condición y oráculo relevante | Qué mantener o modificar |
| --- | --- | --- | --- | --- |
| [referencePrefixesDbTest.js](../../tests/integration/migrations/referencePrefixesDbTest.js) | **M** | PE / TE | Series por tipo, contador máximo, años/sufijos, colisión, repetición e instalación vacía. | Mantener toda la actualización histórica e idempotencia; emitir folios nuevos no demuestra migrar los anteriores. |
| [wasteFullRollReferenceDbTest.js](../../tests/integration/migrations/wasteFullRollReferenceDbTest.js) | **M** | PE / VF | Agrega peso total sin inferirlo y exige neto coherente con el mismo cono. | Mantener versión histórica del CHECK y ausencia de modificación tras rechazo. |
| [wasteRollCaptureDbTest.js](../../tests/integration/migrations/wasteRollCaptureDbTest.js) | **M** | PE / VF | Conserva netos previos, campos finales, identidad y restricciones de pesos. | Mantener casos legados y nuevos; columnas históricas no equivalen a campos capturables hoy. |
| [wasteSampleHistoryDbTest.js](../../tests/integration/migrations/wasteSampleHistoryDbTest.js) | **M** | TE / PE | Transición desde CHECK que exigía muestra a altas nuevas sin derivados persistidos. | Mantener datos anteriores y rechazos posteriores; es la migración que habilita el flujo actual. |
| [wasteSampleReferenceDbTest.js](../../tests/integration/migrations/wasteSampleReferenceDbTest.js) | **M** | PE / VF | Muestra histórica completa, positiva y con precisión conservada. | Mantener: una regla que deja de capturarse puede seguir siendo necesaria al actualizar instalaciones antiguas. |
| [wasteWeightCapDbTest.js](../../tests/integration/migrations/wasteWeightCapDbTest.js) | **M** | VF / TE | Transición histórica al tope de 100 conserva datos o revierte sin recortar. | Mantener aunque el máximo vigente sea 999.99; la prueba pertenece a esa migración aplicada. |
| [wasteWeightScaleDbTest.js](../../tests/integration/migrations/wasteWeightScaleDbTest.js) | **M** | VF / TE | Reducción de escala conserva compatibles y rechaza pérdida por redondeo. | Mantener rollback y precisión anterior; no sustituir por probar únicamente el esquema final. |

## Rendimiento y archivos auxiliares

Los siguientes archivos no coinciden con `*Test.js` y no forman parte del total de 113.
Se revisan por separado para no perder infraestructura necesaria ni presentar una
medición como prueba funcional completa.

| Archivo desde `tests/` | Decisión | Aporte y límite |
| --- | --- | --- |
| [performance/backendBenchmark.js](../../tests/performance/backendBenchmark.js) | Mantener, ejecución separada | Mide consultas SQL, espera de pool, percentiles HTTP y event loop; verifica saldos tras surtidos y permite EXPLAIN. Un HTTP 200 de listado no verifica todos sus datos. Ejecutar al evaluar consultas o rendimiento, con base desechable. |
| [performance/backendMixedBenchmark.js](../../tests/performance/backendMixedBenchmark.js) | Mantener, ejecución separada | Contrasta lecturas con descargas Excel concurrentes, CPU, event loop y memoria del servidor. El cliente en otro proceso evita distorsionar su reloj por un bloqueo del servidor. No establece un SLA desde una sola corrida. |
| [performance/backendFixture.js](../../tests/performance/backendFixture.js) | Mantener soporte | Preparación identificable por corrida, verificación de stock y limpieza compartidas por ambos programas. No duplicar esas tareas en cada escenario. |
| [performance/backendLoadClient.js](../../tests/performance/backendLoadClient.js) | Mantener soporte | Cliente de carga hijo usado por la medición mixta; conserva concurrencia, calentamiento y límites de espera. No es una suite Vitest faltante. |
| [performance/queryProfiler.js](../../tests/performance/queryProfiler.js) | Mantener soporte | Instrumenta consultas y espera de conexiones únicamente en test; se usa para medir, no en código de producción. |
| [helpers/controllerTestHarness.js](../../tests/helpers/controllerTestHarness.js) | Mantener soporte | Express y manejo de errores comunes. Por sí solo no monta el router de producción ni autentica actores: depende de cada suite. |
| [helpers/concurrentDatabaseOperations.js](../../tests/helpers/concurrentDatabaseOperations.js) | Mantener soporte | Retiene una fila y verifica que las operaciones esperan un bloqueo antes de liberarla. Esta coincidencia real es parte del oráculo de concurrencia; no sustituirla por pausas arbitrarias. |
| [setupIntegrationTestDatabase.js](../../tests/setupIntegrationTestDatabase.js) | Mantener soporte | Está registrado en Vitest de integración y comprueba configuración/cliente generado antes de usar persistencia. |
| [teardownTestDatabase.js](../../tests/teardownTestDatabase.js) | Mantener soporte | Limpieza de fixtures reconocibles tras la suite. Requiere aislamiento real; no reemplaza el afterAll propietario ni debe borrar datos ajenos. |
| [helpers/rollbackTransaction.js](../../tests/helpers/rollbackTransaction.js) | Recomendar retiro con su prueba | No tiene consumidores fuera de `rollbackTransactionTest.js`. Las pruebas de rollback real permanecen en integraciones y migraciones. |
| [setupTestDatabaseEnv.js](../../tests/setupTestDatabaseEnv.js) | Recomendar retiro del archivo inactivo | No está referenciado por los comandos ni configuraciones versionados de Vitest. Se conserva el setup de integración activo y el verificador invocado por los scripts npm. |

`AGENTS.md` conserva los criterios generales de selección y documentación del plan.
Este inventario pertenece a `docs/testing`; no se copian sus 113 entradas a las
instrucciones operativas ni se exige una ficha documental por cada `it`.

## Cambios y decisiones de la primera pasada

Esta sección registra los cambios ya aplicados. La clasificación individual anterior
refina las decisiones generales, especialmente para las herramientas de documentación.

Las rutas de esta tabla son relativas a la raíz del repositorio. Los diseños y casos
críticos se enlazan en el [registro selectivo](automated-test-case-index.md).

| Área / archivos | Decisión y motivo | Evidencia conservada y límite |
| --- | --- | --- |
| `tests/unit/public/js/services/warehouse/consumableServiceTest.js` | Retirar sus dos casos: repiten constantes, métodos y delegación a `apiRequest`, sin decisión ni transformación propia. Retirar de la lista activa `CP-UNIT-ALM-008`; no reutilizar su ID. | Rutas, permisos y tipo fijo siguen en `consumableApiRouteTest.js`, controller y servicio de consumibles. `materialControllerDbTest.js` conserva altas sin medidas. Esas pruebas no comprueban la URL construida en el navegador: se acepta retirar esa comprobación aislada de bajo riesgo. |
| `tests/unit/plugins/select2/goodsIssueSelectTest.js` | Retirar sus dos casos: comprueban inicialización y opciones de colaboradores simulados. No ejercitan selección ni consulta real. | Permanecen contratos de contexto y autorización en rutas/servicios de salidas. La interacción real de Select2 sigue requiriendo navegador; no se considera cubierta por esas unitarias. |
| `warehouseInventoryColumnsTest.js` | Retirar orden exacto, clases de encabezado y cantidad fija de columnas; conservar significado del dato renderizado. | Distingue cono `0`, peso desconocido y presentación ajena a rollo. No demuestra disposición visual ni comportamiento responsivo. |
| `materialMeasurementFieldTest.js` | Conservar transiciones de unidad y modos; quitar aserciones CSS y validaciones puras repetidas. | Pieza y consumible descartan/deshabilitan medidas; metros/litros permiten capturarlas y edición conserva valores. Las reglas de pareja y rango siguen en validadores y `materialControllerDbTest.js`. |
| `wasteMaterialTemplateTest.js` | Conservar objeto recibido, oferta, cálculo y limpieza; retirar conteo de llamadas al helper privado. | Cambiar o limpiar selección no deja resultados anteriores. Select2/MDB simulados no prueban el plugin real. |
| `weightCaptureValidationTest.js` | Conservar matriz de tipos, formato, rango, precisión, pareja y códigos; retirar espías del orden/conteo de reglas. | La colección de errores esperada verifica un único código y ausencia de errores secundarios. La opción genérica de total no obligatorio se conserva como contrato del helper; no representa un alta actual de proveedor. |
| `wasteWeightDbTest.js`, rechazos de peso | Consolidar quince ejemplos en cinco representantes: mínimo inválido, formato, tipo JSON, precisión y máximo inválido. Cada uno verifica código y ausencia de merma, ajuste y movimiento. | Las variantes extensas siguen en `weightCaptureValidationTest.js` y `wasteRegistrationBoundaryTest.js`; los límites válidos `0.01` y `999.99` permanecen integrados. No se usa esta selección para afirmar exhaustividad. |
| `wasteWeightDbTest.js`, rechazo de referencias | Retirar lecturas finales que se comparaban consigo mismas después del rechazo, sin acción entre ellas. | Permanecen instantáneas anteriores al request, rechazo HTTP, referencias de proveedor y filas de merma sin cambios. |
| `wasteWeightCalculationsTest.js`, `wasteWeightFieldTest.js`, `wasteFormTest.js` | Conservar: cálculo puro, asignación de campos y payload son contratos diferentes. | Se cubren orientación por medida menor, proporcionalidad, recálculo, limpieza, inputs deshabilitados y exclusión de valores derivados. No sustituyen persistencia ni navegador completo. |
| `wasteFormTest.js`, `wasteStockAdditionModalTest.js`, `formUITest.js` | Conservar por regresiones de captura y riesgo de escritura duplicada. | Confirmar el Swal abre Agregar stock sin guardar; cancelar conserva captura; cero exige nueva cantidad; un envío pendiente no se duplica. |
| `goodsReceiptServiceTest.js`, `goodsIssueServiceTest.js` de frontend | Conservar: seleccionan contexto y aplicaciones específicas, no son sólo delegación. Corregir nombre de suite de entradas. | Material/consumible se dirige al contexto correcto incluso si página o parámetros indican el opuesto. No demuestra autorización del servidor. |
| `tests/unit/routes`, `tests/unit/constants/permissionsTest.js` | Conservar: política de acceso y registro de middlewares. | El harness HTTP de controllers monta rutas de prueba e inyecta actor; no ejecuta necesariamente routers reales ni JWT. Integración de persistencia no sustituye esos contratos de autorización. |
| `warehouseConcurrencyControllerDbTest.js`, `queuedPrismaPgTest.js` | Conservar por integridad transaccional. | Surtidos/devoluciones coincidentes, saldos e historial, rollback y serialización del cliente transaccional; no fijan tiempos de respuesta. |
| `tests/integration/migrations` | Conservar todos los escenarios históricos. | Actualizaciones desde CHECK anteriores, referencias, netos históricos y rollback siguen siendo necesarias aunque el alta nueva no guarde `sampleLengthM` ni `sampleNetWeightKg`. No modificar migraciones aplicadas. |
| Pruebas de herramientas de documentación y reportes | Conservar sus contratos de soporte; revisarlas al cambiar la herramienta. | Validación de fuentes, exportaciones y contratos de salida. No se contabilizan como aceptación de un caso de uso CRUD. |

## Aplicación de técnicas

El registro contiene diseños `DP-*`, datos y oráculos concretos `CP-*` para la revisión:

- **Particiones y fronteras:** datos de peso válidos/ausentes, formatos y tipos JSON;
  en HTTP se elige un representante por rechazo y se consulta el estado posterior.
- **Decisiones:** modo, duplicado identificado, permiso y respuesta de confirmación
  determinan si se abre el modal o se conserva/rechaza la operación.
- **Transiciones:** selección → cálculo → limpieza; captura → confirmación → modal;
  pendiente → surtido y rechazo sin cambio de saldo.

La concurrencia y la inyección de fallos son escenarios para demostrar esas reglas, no
nombres de técnicas. No se afirma cobertura total de decisiones o ramas sin enumerar
los elementos de cobertura o medirlos.

## Verificación pendiente fuera de las unitarias

El primer recorrido manual de navegador debe diseñarse así y registrar su ejecución
en la revisión, sin marcarlo aprobado por el uso de dobles en Vitest:

| ID de caso | Precondiciones y estado inicial | Datos de prueba | Acción / pasos | Resultado esperado | Limpieza |
| --- | --- | --- | --- | --- | --- |
| `CP-MAN-MER-001` | Entorno de prueba, actor con permisos de crear merma/agregar stock; proveedor con material Rollo de `1.5 × 20 m`, unidad m², sin captura pendiente. | Cono `0.25 kg`, rollo completo con cono `2.25 kg`, sobrante con cono `1.25 kg`, cantidad `1`. | Seleccionar material con Select2; capturar pesos; limpiar/reseleccionar y repetir. Guardar una vez y volver a intentar la misma identidad; cancelar el Swal y después confirmar. | Neto `1 kg`, longitud `10 m`, ancho `1.5 m`, ambas medidas deshabilitadas; limpiar descarta resultados. Duplicado no guarda; cancelar conserva captura; confirmar abre Agregar stock con cantidad/observaciones, sin escritura hasta enviar ese modal. | Eliminar sólo fixtures de esta verificación y sus efectos en la base aislada. |

Este recorrido tiene prioridad por los defectos observados. La revisión completa de
archivos no cierra las brechas de comportamiento ni convierte las fichas antiguas
genéricas en especificaciones documentales completas. La
[matriz funcional](use-case-test-types.md) mantiene esos límites.

## Prioridad para la siguiente depuración

1. **Aislamiento de BD:** falta una prueba del verificador contra URLs distintas que
   apuntan a la misma base. `validateTestDatabaseEnv` compara cadenas normalizadas:
   cambiar usuario o agregar `application_name` permite pasar esa comparación sin
   cambiar la base. Diseñar `DP-AIS-001` con ausencia de URL de test, igualdad literal,
   mismo servidor/base con credenciales u opciones distintas y una base realmente
   diferente. El resultado esperado es rechazar las tres primeras situaciones antes
   de conectar o escribir. La prueba debe ser pura, con URLs ficticias; no usar una
   BD real para demostrar el rechazo. Resolver el criterio de identidad en el
   verificador junto con esa regresión, antes de confiar en él como aislamiento.
2. **Autoridad del servidor y privacidad:** mantener permisos y whitelists actuales;
   completar respuestas sin costos para actores sin permiso, no sólo la bandera
   `canReadCosts` simulada. Movimiento sí tiene pruebas con routers reales y 401/403;
   eso no cubre login/logout ni todos los endpoints de almacén.
3. **Oráculos y duplicidad:** aplicar los cambios D preservando sus condiciones únicas:
   errores concretos, reloj fijo, descarte explícito de derivados y contratos anidados.
   Antes de reducir matrices HTTP, ubicar sus variantes únicas en la prueba de
   validación propietaria. Separar migraciones de los controllers sin eliminar historia.
4. **Mantenimiento de bajo aporte:** retirar los dos candidatos R y sus auxiliares
   inactivos; conservar los contratos de inventario, enlaces y perfiles del manual.
   Al retirar la prueba editorial se acepta no exigir consecutividad de títulos/archivos
   desde Vitest. La unicidad de IDs y asociación de capturas sigue siendo necesaria.
5. **Brechas funcionales y evidencia:** concretar fichas antiguas al modificar su regla;
   completar edición/retiro/ajuste HTTP de consumibles y fronteras de devolución de
   materiales según riesgo. No duplicar pruebas de devolución total de merma: ya existen
   en `wasteIssueControllerDbTest.js` y deben conservarse al dividir su caso extenso.

Estas prioridades no agregan una puerta de aprobación ni presentan los retiros
recomendados como ejecutados. Cada cambio posterior debe mantener diseño, caso y
evidencia conforme al [plan](test-plan.md).

## Control de ejecución

La configuración anterior de CI ejecutaba integración mediante `test:db`, sin unitarias.
La configuración actual añade ambas suites y reportes JUnit por separado. El artefacto y el log
se relacionan con el commit y el ambiente del job conforme al formato `EP-*` del plan.
Una suite omitida o bloqueada no se declara aprobada. No se versionan los XML de corridas.

La revisión del contrato de merma conserva las suites existentes: el payload separa
`initialQuantity` (alta), `quantity` (entrada adicional) y `newStock` (saldo de ajuste).
Se amplían particiones de cantidad ausente/fuera de rango y la lectura persistida de
`minStock`/`isActive`; no se agregan pruebas de estructura HTML ni otra suite de CRUD.
La correspondencia entre contrato y persistencia se registra en `DP-MER-005`.
