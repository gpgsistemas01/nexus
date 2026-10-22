# Cobertura automatizada relevante por caso de uso

## Alcance y criterio

Este documento resume únicamente las pruebas automatizadas que aportan evidencia
funcional a un `CU-*`. No repite el catálogo completo. Las unitarias de frontend se
conservan cuando protegen decisiones, estados, payloads o fronteras de datos con riesgo
funcional; se retiran comprobaciones de configuración y presentación sin aporte adicional
según la [revisión de la suite](suite-review.md). Una prueba con DOM o plugins simulados
no demuestra un recorrido real de navegador.

Una prueba aparece aquí cuando comprueba al menos uno de estos resultados observables:
regla o autorización del servidor, contrato de controller/ruta, respuesta HTTP,
persistencia Prisma, transición de estado, movimiento, rollback o contenido funcional
de un reporte. Compartir módulo o probar sólo el request del navegador no demuestra el
caso de uso completo.

Se adopta selectivamente ISO/IEC/IEEE 29119: la parte 3 orienta la separación entre
diseño y resultado, y la parte 4 aporta técnicas como equivalencias, fronteras, tablas de
decisión y transiciones. Nexus no declara conformidad.

## Cómo leer el resumen

- **Unitaria existente:** el archivo contiene casos ejecutables dentro de `SU-UNIT-001`;
  demuestra sólo la regla o contrato aislado descrito. Su aprobación corresponde al
  registro `EP-*` de cada ejecución, no a esta matriz.
- **Integración existente:** el archivo contiene casos ejecutables con
  `DATABASE_TEST_URL`. Su aprobación también depende del registro `EP-*` de la entrega.
- **Brecha:** no existe prueba automatizada funcionalmente relevante para ese nivel.
- Varios `CU-*` se agrupan sólo cuando comparten evidencia, datos y resultado esperado.

En esta matriz, una unitaria demuestra una regla aislada y una integración demuestra el
flujo HTTP hasta Prisma con base real. Ninguna de las dos se presenta como prueba de
navegador o aceptación.

Cada fila es trazabilidad resumida, no una especificación ni un registro de ejecución.
La preparación y las aserciones permanecen en el archivo ejecutable enlazado. Los casos
de riesgo que necesitan identificador y ficha documental se encuentran en el
[registro selectivo](automated-test-case-index.md). Una ejecución sólo se declara
aprobada cuando su evidencia registra revisión, ambiente, fecha, resultado real y estado
conforme a la tabla `EP-*` del [plan](test-plan.md).

## Cobertura vigente

Para la interfaz Vue de `CU-ALM-01..06` y `CU-ALM-09..14`, la evidencia adicional
está en [DP-VUE-WH-001–010](../../../front/docs/tooling.md#pruebas-de-almacén):
`inventoryFormTest.ts`, `inventoryNavigationTest.ts`, `apiClientTest.ts` y
`warehouse.spec.ts`. Cubre permisos visuales, altas, edición, identificador de baja,
versiones de captura, filtros/paginación, descarga y recuperación de merma tras
recarga. Chromium usa respuestas HTTP simuladas: no sustituye la evidencia
persistente ni resuelve las brechas HTTP/Prisma indicadas en la tabla.
El flujo de duplicado Vue muestra el rechazo y permite localizar la merma para
Agregar stock; no replica la apertura automática del modal EJS.

| Casos de uso | Evidencia automatizada relevante | Tipo, datos y resultado esperado | Estado de cobertura |
| --- | --- | --- | --- |
| `CU-AUT-01..02` | Sin prueba funcional directa. | Sesión limpia/autenticada, credenciales válidas e inválidas; crear o invalidar sesión según corresponda. | **Brecha.** |
| `CU-ALM-01` | `materialControllerTest.js`. `operationalAccessDbTest.js` (`CP-INT-AUT-001`): autorización real de áreas operativas. | Unitaria de permisos e interacción; queries y retorno simulado; oculta costos sin permiso y conserva respuesta autorizada. | **Unitaria existente.** |
| `CU-ALM-02` | `materialValidationTest.js`, `materialMeasurementFieldTest.js`, `materialControllerDbTest.js`. | Unitarias e integración de piezas sin medidas, pareja opcional completa, conversión y alta contextual desde compra. | **Evidencia parcial existente**; no demuestra todo el CRUD de materiales. |
| `CU-ALM-03` | `wasteWeightDbTest.js`, `materialDTOTest.js`. | Edición de costo conserva pesos históricos; DTO descarta referencias del material. | **Evidencia parcial existente**; no acredita toda la edición de materiales. |
| `CU-ALM-04` | `supplierMaterialServiceTest.js`. | Unitaria de elegibilidad por relaciones históricas y consulta de uso. | **Unitaria parcial**; falta baja HTTP/Prisma con historia protegida. |
| `CU-ALM-05` | `stockHelpersTest.js`, `supplierMaterialStockServiceTest.js`, `warehouseConcurrencyControllerDbTest.js`. | Cero, insuficiencia y ajuste por servicio coincidente con una entrada, con saldos e historial. | **Evidencia parcial existente**; falta integración del endpoint de ajuste de material y sus controles. |
| `CU-ALM-06` | `inventoryReportControllerDbTest.js`, `reportExcelUtilsTest.js`. | Exportación XLSX real con más de 5000 filas, tipos, alcances, orden, vacío y stock conservado. | **Integración existente**, sin atribuirle privacidad de costos no comprobada. |
| `CU-ALM-07..08` | `movementContextDbTest.js`. | Routers reales con cookie/JWT, filtros, paginación, separación de tipos y XLSX personalizado/mensual. | **Integración existente**, incluidos 401/403 para los accesos probados. |
| `CU-ALM-09` | `wasteControllerTest.js`. `operationalAccessDbTest.js` (`CP-INT-AUT-001`): autorización real de áreas operativas. | Unitaria de consulta con filtros, búsqueda, proveedor, orden, paginación y servicio simulado. | **Unitaria existente.** |
| `CU-ALM-10` | `wasteControllerFlowTest.js`, `wasteRegistrationBoundaryTest.js`, `wasteFormTest.js`, `wasteWeightDbTest.js`, `materialControllerDbTest.js`. | Límites, duplicado, origen MATERIAL en m², referencia de rollo completo y neto/largo recalculados; rechazo sin efectos y payload sin derivados de muestra; entrada EME inicial, cantidad cero sin documentos ni folio y rollback de entrada/movimiento/contador (`CP-INT-MER-004`). | **Unitarias e integración existentes**; interacción real Select2/Swal/modal requiere navegador. |
| `CU-ALM-11` | `wasteControllerFlowTest.js`, `wasteWeightDbTest.js`. | Edición de campos permitidos, rechazo de pesos inmutables y conservación de muestras históricas. | **Unitarias e integración existentes**, limitadas a las reglas descritas. |
| `CU-ALM-12` | `wasteWeightDbTest.js`, `wasteControllerFlowTest.js`, `warehouseConcurrencyControllerDbTest.js`. | Ajuste AME independiente de EME, por controller HTTP y coincidente con entrada, diferencias sobre saldo vigente y movimientos reales; la variante de material usa servicio directo. | **Evidencia parcial existente**; el harness de concurrencia no monta validadores ni permisos de la ruta de producción. |
| `CU-ALM-13` | `wasteControllerTest.js`, `wasteFormTest.js`, `wasteStockAdditionModalTest.js`, `wasteWeightDbTest.js`. | Agregar stock conserva pesos, suma cantidad y genera entrada EME; confirmar duplicado sólo abre modal, permite revisar captura y evita escritura directa. | **Unitarias e integración existentes**; falta recorrido completo de navegador. |
| `CU-ALM-14` | `reportControllerTest.js`, `reportServiceTest.js`, `wasteWeightDbTest.js`. | Agrupación y cálculo; integración descarga Excel, comprueba peso neto total, fórmula SUM y peso desconocido sin modificar inventario. | **Unitarias e integración del archivo existentes**, sin afirmar todos sus filtros. |
| `CU-ALM-15` | `movementQueryServiceTest.js`. | Unitaria de consulta por identidad de merma con Prisma simulado. | **Unitaria existente**; falta integración. |
| `CU-ALM-16` | Sin prueba funcional directa del reporte. | Fixtures de movimientos, periodo, filtros, columnas/fórmulas y vacío. | **Brecha.** |
| `CU-ALM-17` | `consumableControllerTest.js`, `consumableApiRouteTest.js`, `consumableServiceTest.js`. `operationalAccessDbTest.js` (`CP-INT-AUT-001`): autorización real de áreas operativas. | Consulta con proveedor y permiso de costos simulados; comprueba respuesta `200`, autorización de lectura y filtro fijo `CONSUMABLE`. | **Unitarias existentes**; faltan paginación, vacío e integración HTTP/Prisma que demuestre la exclusión de materiales. |
| `CU-ALM-18` | `consumableControllerTest.js`, `consumableApiRouteTest.js`, `consumableServiceTest.js` del servidor y `materialControllerDbTest.js`. | Permiso/contexto fijo; integración de altas directa y desde compra que descartan medidas y conservan cantidad. | **Unitarias e integración parcial existentes**; completar otras fronteras y atomicidad del alta de consumibles. |
| `CU-ALM-19` | `consumableControllerTest.js`, `consumableApiRouteTest.js`, `consumableServiceTest.js`. | Edición con id, nombre y proveedor simulados; comprueba validación, permiso y contexto fijo `CONSUMABLE`. | **Unitarias existentes**; falta integración de campos permitidos, conflicto y conservación de stock. |
| `CU-ALM-20` | `consumableControllerTest.js`, `consumableApiRouteTest.js`, `consumableServiceTest.js`. | Retiro con id de oferta simulado; comprueba permiso y delegación de baja limitada a `CONSUMABLE`. | **Unitarias existentes**; falta integración de historia protegida, otras ofertas y ausencia de eliminación parcial. |
| `CU-ALM-21` | `consumableControllerTest.js`, `consumableApiRouteTest.js`, `consumableServiceTest.js`. | Ajuste con identidad, proveedor, actor y nueva existencia simulados; comprueba permiso específico y delegación con `CONSUMABLE`. | **Unitarias existentes**; falta integración de saldo, ajuste, movimiento y rollback. |
| `CU-ALM-22` | Sin prueba funcional directa del filtro de consumibles. | Filtros visibles, tres alcances, ofertas de ambos tipos, conjunto vacío y contenido del archivo limitado a `CONSUMABLE`. | **Brecha**; las pruebas generales de `reportControllerTest.js` y `reportServiceTest.js` no comprueban este caso ni sustituyen la integración del archivo. |
| `CU-ALM-23` | Integración HTTP/Prisma: contexto, conteos, paginación, filtros cruzados y permisos. | Historial de consumibles separado, con proveedor y selector propios. | `movementContextDbTest.js`. |
| `CU-ALM-24` | Integración con Excel real personalizado y mensual, contenido y permisos. | Descargar desde la consulta y revisar hoja, folios y saldos. | `movementContextDbTest.js`. |
| `CU-CAT-01..03` | `supplierControllerDbTest.js`. | Integración de alta, consulta y actualización con fixtures y limpieza en base aislada. | **Integración existente.** |
| `CU-CAT-04` | Sin prueba funcional directa del reporte. | Proveedores dentro/fuera de filtros, permisos y archivo esperado. | **Brecha.** |
| `CU-CAT-05..07` | `clientControllerDbTest.js`. | Integración de alta, listado, actualización y error específico con fixtures y limpieza. | **Integración existente.** |
| `CU-CAT-08` | Sin prueba funcional directa del reporte. | Clientes dentro/fuera de filtros, permisos y archivo esperado. | **Brecha.** |
| `CU-CAT-09..26` | `catalogServiceTest.js`, `catalogControllersDbTest.js`. | Unitaria del servicio compartido e integración CRUD/validación con catálogo permitido, payload válido/inválido y lectura Prisma. | **Unitaria e integración existentes.** |
| `CU-IDA-01` | Sin prueba funcional directa. | Actor autorizado/no autorizado, filtros, paginación y conjunto vacío. | **Brecha.** |
| `CU-IDA-02..03` | `personApiRouteTest.js`. | Unitaria de orden validación–autorización–handler para escrituras. | **Unitaria existente**, limitada al contrato de ruta; falta persistencia. |
| `CU-IDA-04..09` | Sin prueba de servidor o integración directa. | Reportes/usuarios requieren permisos, payloads, relaciones, credenciales, filtros y persistencia según el caso. | **Brecha**; los requests simulados de frontend no prueban el flujo completo. |
| `CU-SAL-01..05` | `goodsIssueContextServicesTest.js`, `goodsIssueContextRoutesTest.js`, `goodsIssueControllerDbTest.js`, `warehouseConcurrencyControllerDbTest.js`. `operationalAccessDbTest.js` (`CP-INT-AUT-001`): autorización real de áreas operativas. | Contexto fijo, rutas y validadores; alta/edición/surtido, rechazo cruzado, surtido coincidente, stock insuficiente y rollback con saldos/movimientos. | **Unitarias e integración existentes**; completar otras fronteras de cantidades según el cambio. |
| `CU-SAL-06` | `goodsIssueControllerTest.js`, `goodsIssueControllerDbTest.js`. | Delegación unitaria e integración de devolución parcial con existencia, acumulados y movimiento. | **Unitarias e integración existentes**; faltan devolución total, cantidad excesiva y rollback. |
| `CU-SAL-07` | `reportControllerTest.js`. | Unitaria de fórmulas del reporte de salida; cantidades convertidas y escritor simulado. | **Unitaria existente**; falta integración del archivo. |
| `CU-SAL-08..12` | `wasteIssueControllerTest.js`, `wasteIssueControllerDbTest.js`. `operationalAccessDbTest.js` (`CP-INT-AUT-001`): autorización real de áreas operativas. | Unitarias de consulta/DTO/edición/surtido e integración de documento, stock, movimiento, parcial y rollback con fixtures reales. | **Unitarias e integración existentes.** |
| `CU-SAL-13` | `wasteIssueControllerTest.js`, `wasteIssueControllerDbTest.js`, `warehouseConcurrencyControllerDbTest.js`. | DTO/actor; devolución parcial y total con saldo/estado, prohibición de resurtir una salida cancelada y devoluciones coincidentes sin sobrepasar disponible. | **Unitarias e integración existentes**; conservar estos escenarios al dividir el caso extenso. |
| `CU-SAL-14` | `reportControllerTest.js`. | Unitaria de fórmula/contenido operativo del reporte con escritor simulado. | **Unitaria existente**; falta integración del archivo. |
| `CU-SAL-15..20` | `goodsIssueContextServicesTest.js`, `goodsIssueContextRoutesTest.js`, `goodsIssueControllerDbTest.js`. `operationalAccessDbTest.js` (`CP-INT-AUT-001`): autorización real de áreas operativas. | Tipo fijo, rutas, permisos y validadores; integración de alta, consultas, edición, surtimiento y devolución parcial, con saldos y movimientos, además del rechazo de operaciones cruzadas. | **Unitarias e integración existentes**; faltan fronteras de cantidad y existencia, devolución total y rollback de fallos operativos. |
| `CU-SAL-21` | `goodsIssueContextServicesTest.js`, `goodsIssueControllerDbTest.js`. | Delegación de consulta de reporte con tipo fijo e integración de filas limitadas al contexto. | **Evidencia de aislamiento existente**; falta integración del archivo Excel, fórmulas y resultado vacío de consumibles. |
| `CU-ENT-01..02`, `CU-ENT-07..08` | `goodsReceiptContextServicesTest.js`, `goodsReceiptContextDbTest.js`. | Consulta de compras homogéneas; alta concurrente CMA/CCO con tipo fijo, stock y movimientos; fallo revierte contador/compra/stock. | **Unitarias e integración existentes**, limitadas a esos escenarios. |
| `CU-ENT-03..04`, `CU-ENT-09..10` | `goodsReceiptControllerTest.js`, `goodsReceiptContextDbTest.js`, `warehouseConcurrencyControllerDbTest.js`. | Cabecera homogénea y rechazo cruzado; correcciones concurrentes y fallo de historial revierten stock/costos en compra material. | **Evidencia existente**; no atribuir corrección completa de consumibles a fixtures de material. |
| `CU-ENT-05`, `CU-ENT-11` | `goodsReceiptContextDbTest.js`, `warehouseConcurrencyControllerDbTest.js`. | Contexto cruzado rechazado sin cambios; cancelación duplicada de compra material modifica stock una vez y conserva estado al agregar detalle. | **Integración parcial existente**; cancelación homogénea de consumibles requiere revisión propia. |
| `CU-ENT-06`, `CU-ENT-12` | `reportControllerTest.js` y `goodsReceiptContextServicesTest.js`. | Unitaria de delimitación, fórmulas, importes y resúmenes con escritor simulado. | **Unitaria existente**; falta integración del archivo. |

## Escrituras concurrentes de almacén

`warehouseConcurrencyControllerDbTest.js` complementa las pruebas CRUD de salidas,
devoluciones, ajustes y compras. Retiene una fila en PostgreSQL mientras las peticiones
coinciden y verifica tanto HTTP como existencias, cantidades convertidas, estados,
totales, historial y ausencia de efectos parciales. Incluye surtidos y devoluciones
duplicadas, edición durante surtido, detalles distintos de un mismo documento,
cancelaciones concurrentes y rollback de una corrección cuyo registro histórico falla.
Los casos de movimiento y ajuste de materiales ejercitan directamente sus servicios
transaccionales; no se presentan como cobertura HTTP de esos endpoints.

## Regla de mantenimiento

`DP-VAL-003` cubre la captura de detalles de salidas de material, consumible y merma:
booleanos/textos válidos conservan `false`; tipos incorrectos se rechazan con códigos
por campo antes del controller. La integración comprueba que no cambian documentos,
saldos ni movimientos ante esos rechazos.

La recuperación compartida de lecturas de listados se verifica en `DP-UI-001` con
`createDataTableTest.js` y `errorHandlerTest.js`: reintento limitado, Swal ante error
definitivo y ausencia de resultados tardíos. Esta evidencia transversal no sustituye
los filtros, permisos o consultas de cada caso ni un recorrido real de navegador.
`DP-VAL-002` añade el contrato de acceso (`CU-AUT-01`) con router y servicio reales:
captura inválida, rechazo genérico de credenciales y acceso válido. La renovación
coordinada se cubre de forma unitaria; los dobles no acreditan cookies en un navegador.

La decisión de conservar, consolidar o retirar depende de la condición y del oráculo,
no de que el archivo pertenezca a frontend o backend. Se conservan cálculo, asignación
de resultados, serialización, permisos y estados críticos. Se retiran aserciones sobre
CSS, orden incidental o delegaciones sin decisiones según la
[revisión de la suite](suite-review.md). Las matrices completas de formatos viven en
unitarias; integración comprueba representantes y efectos persistidos. El registro
selectivo documenta las reglas críticas; los resultados de corridas permanecen en CI o
en la revisión del cambio. La revisión por archivo abarca el inventario activo completo;
esa clasificación no acredita aceptación ni cobertura funcional total del sistema.

La cobertura del peso unitario de merma se distribuye entre estas pruebas:

| Pruebas | Comportamiento verificado |
| --- | --- |
| `wasteValidatorsTest.js`, `wasteRegistrationBoundaryTest.js` | Formato, precisión y rango; errores de campo antes de invocar el servicio. |
| `wasteWeightFieldTest.js` | Captura del peso del rollo completo y del sobrante, cálculo automático, limpieza y consulta posterior. |
| `wasteWeightDbTest.js` | Captura de cono y total, neto calculado, consulta, identidad por medidas y pesos, rollo completo capturado desde merma, largo del material y cono compartido, conservación histórica, cálculo automático en base o altura, edición protegida, stock independiente y Excel con peso neto. |
| `reportServiceTest.js` | Agrupación, peso total y datos desconocidos. |
| `wasteWeightCapDbTest.js`, `wasteWeightScaleDbTest.js`, `wasteRollCaptureDbTest.js` | Restricciones en PostgreSQL, conservación de valores compatibles y rollback de las migraciones ante valores incompatibles. |

`wasteWeightCalculationsTest.js` verifica la orientación del ancho menor y la proporcionalidad por largo nominal y pesos netos del rollo completo y merma. `wasteRollCaptureDbTest.js` también verifica la migración de referencias, conservación de filas, identidad con pesos y protección de duplicados históricos sin pesos y migración consolidada que conserva netos históricos y agrega sólo campos finales.

`materialValidationTest.js` verifica la pareja opcional de medidas, consumibles sin
medidas y rechazo de referencias históricas. `wasteRegistrationBoundaryTest.js` cubre
peso del rollo completo, campos calculados, precisión y códigos de `errorMap` antes de ejecutar el servicio.
`wasteSampleReferenceDbTest.js` prueba conservación histórica y el CHECK de muestra completa.

Las pruebas de UI de merma comprueban selección recibida desde Select2,
recálculo al modificar pesos y limpieza de resultados obsoletos. Las plantillas
de otras presentaciones omiten las referencias de peso sin consultarlas.

La recuperación de una merma existente comprueba confirmación y apertura del modal
de Agregar stock con cantidad y observaciones precargadas, sin registrar entradas
desde el Swal. También cubre cancelación, cantidad inicial cero y separación de
permisos y modos. `wasteStockAdditionModalTest.js` comprueba la precarga, la cantidad
vacía cuando se recibe cero y el saldo resultante al editar.
`wasteMaterialTemplateTest.js` cubre selección, cálculo con el peso del rollo completo capturado y largo del material y
limpieza programática sin reconstruir la selección desde el DOM.

`materialMeasurementFieldTest.js` comprueba medidas según unidad y consumibles siempre
sin medidas. `materialFormTest.js` omite las referencias históricas del payload.
`materialControllerDbTest.js` verifica altas directas y desde compra, conversión,
consumibles sin dimensiones y origen de merma limitado a materiales en m². El rechazo
de identificadores forzados demuestra que el filtro de Select2 no sustituye el control
al guardar. `wasteWeightDbTest.js` verifica el cono compartido, el guardado del total de muestra, la ausencia de valores derivados nuevos y la conservación de históricos.

`wasteFullRollReferenceDbTest.js` prueba que la migración conserva referencias anteriores
y exige que el neto del rollo completo corresponda al total menos el mismo cono.

`wasteSampleHistoryDbTest.js` prueba la transición desde el CHECK anterior: admite
altas sin persistir largo ni neto de muestra y conserva valores históricos y sus
restricciones. Las migraciones aplicadas no se alteran.

Las entradas de merma `CU-ALM-10/13`, altas `CU-ALM-02/18` y consultas operativas
incorporan `CP-INT-CON-001/002/003` del registro selectivo para idempotencia, versiones,
alta concurrente y paginación SQL. El bloqueo de submit y la recuperación se verifican
como estados/payloads unitarios; queda pendiente el recorrido de navegador real.

En `CU-AUT-01`, `authValidationTest.js` compara presencia/tipo y fronteras de login entre frontend/backend; la integración de acceso utiliza una clave histórica con espacios, comprueba que el valor recortado se rechaza y conserva la cuenta. Los tests de application de entradas/salidas demuestran rutas y datos sin importar páginas; la autorización real permanece cubierta en integración.


`DP-VAL-004` añade fronteras y particiones de captura para personas, clientes,
inventario, catálogos y documentos. `CP-INT-VAL-004` prueba con routers reales los
rechazos de tipos, precisión y fecha, junto con la ausencia de escrituras. Para
`CU-IDA-02..03`, la prueba de tabla verifica carga/retiro/reinicio con dobles; para
edición de compras, `goodsReceiptFormTest.js` verifica la lista incremental omitida o
presente. No cierra las brechas de persistencia exitosa de personas ni el recorrido
real de navegador, y no acredita validación de estado de roles/áreas en el servicio.


`DP-VAL-005` cubre precisión y signo sin confundir capas: unitarias comparan captura
front/back y el body tipado, mientras `CP-INT-VAL-005` verifica la escritura real de
material y los rechazos de inventario. Se conserva la cobertura existente de cantidad
inicial de merma cero sin entrada y de adición/devolución positiva. Los DTOs y
controllers reciben los tipos que entregan los validators; sus pruebas no simulan
una conversión adicional. No se modifica el esquema para redondear históricos.
