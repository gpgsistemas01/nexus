# Cobertura automatizada relevante por caso de uso

## Alcance y criterio

Este documento resume únicamente las pruebas automatizadas que aportan evidencia
funcional a un `CU-*`. No repite el catálogo completo ni documenta por caso las pruebas
que sólo protegen DOM, plugins, selectores, formato visual, entrypoints o fábricas de
frontend. Esas pruebas se retiraron por bajo valor funcional; sólo permanecen las
colecciones y validaciones frontend que protegen reglas y fronteras de datos.

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

| Casos de uso | Evidencia automatizada relevante | Tipo, datos y resultado esperado | Estado de cobertura |
| --- | --- | --- | --- |
| `CU-AUT-01..02` | Sin prueba funcional directa. | Sesión limpia/autenticada, credenciales válidas e inválidas; crear o invalidar sesión según corresponda. | **Brecha.** |
| `CU-ALM-01` | `materialControllerTest.js`. | Unitaria de permisos e interacción; queries y retorno simulado; oculta costos sin permiso y conserva respuesta autorizada. | **Unitaria existente.** |
| `CU-ALM-02..08` | Sin prueba de servidor o integración directa. | Altas/cambios requieren payloads válidos, inválidos y fronteras; consultas/reportes requieren filtros, permisos y vacío. | **Brecha**; las pruebas de aplicación frontend no sustituyen HTTP/Prisma. |
| `CU-ALM-09` | `wasteControllerTest.js`. | Unitaria de consulta con filtros, búsqueda, proveedor, orden, paginación y servicio simulado. | **Unitaria existente.** |
| `CU-ALM-10` | `wasteControllerTest.js`, `wasteControllerFlowTest.js`, `wasteRegistrationBoundaryTest.js`. | Unitarias de alta, identidad duplicada, cálculo inicial y valores máximos; acepta entrada válida y rechaza conflicto/frontera inválida. | **Unitarias existentes**; falta integración. |
| `CU-ALM-11` | `wasteControllerTest.js`, `wasteControllerFlowTest.js`. | Unitarias de edición general, nombre duplicado y conservación de identidad/existencia. | **Unitarias existentes**; falta integración. |
| `CU-ALM-12` | `wasteControllerTest.js`, `wasteControllerFlowTest.js`. | Unitarias de ajuste con motivo, usuario, conversión y colaboradores simulados. | **Unitarias existentes**; falta integración. |
| `CU-ALM-13` | `wasteControllerTest.js`. | Unitaria de suma de existencia; cantidad y servicio simulados; no reemplaza el stock absoluto. | **Unitaria existente**; falta integración. |
| `CU-ALM-14` | `reportControllerTest.js`, `reportServiceTest.js`. | Unitarias de agrupación, total, fórmulas, decimales y conjunto vacío del reporte de mermas. | **Unitarias existentes**; falta integración del archivo. |
| `CU-ALM-15` | `movementQueryServiceTest.js`. | Unitaria de consulta por identidad de merma con Prisma simulado. | **Unitaria existente**; falta integración. |
| `CU-ALM-16` | Sin prueba funcional directa del reporte. | Fixtures de movimientos, periodo, filtros, columnas/fórmulas y vacío. | **Brecha.** |
| `CU-ALM-17` | `consumableControllerTest.js`, `consumableApiRouteTest.js`, `consumableServiceTest.js`. | Consulta con proveedor y permiso de costos simulados; comprueba respuesta `200`, autorización de lectura y filtro fijo `CONSUMABLE`. | **Unitarias existentes**; faltan paginación, vacío e integración HTTP/Prisma que demuestre la exclusión de materiales. |
| `CU-ALM-18` | `consumableControllerTest.js`, `consumableApiRouteTest.js`, `consumableServiceTest.js`. | Alta con dimensiones de entrada y actor simulados; comprueba permiso de escritura y delegación como `CONSUMABLE` con dimensiones nulas. | **Unitarias existentes**; faltan validación de fronteras e integración de identidad, oferta y ajuste inicial atómicos. |
| `CU-ALM-19` | `consumableControllerTest.js`, `consumableApiRouteTest.js`, `consumableServiceTest.js`. | Edición con id, nombre y proveedor simulados; comprueba validación, permiso y contexto fijo `CONSUMABLE`. | **Unitarias existentes**; falta integración de campos permitidos, conflicto y conservación de stock. |
| `CU-ALM-20` | `consumableControllerTest.js`, `consumableApiRouteTest.js`, `consumableServiceTest.js`. | Retiro con id de oferta simulado; comprueba permiso y delegación de baja limitada a `CONSUMABLE`. | **Unitarias existentes**; falta integración de historia protegida, otras ofertas y ausencia de eliminación parcial. |
| `CU-ALM-21` | `consumableControllerTest.js`, `consumableApiRouteTest.js`, `consumableServiceTest.js`. | Ajuste con identidad, proveedor, actor y nueva existencia simulados; comprueba permiso específico y delegación con `CONSUMABLE`. | **Unitarias existentes**; falta integración de saldo, ajuste, movimiento y rollback. |
| `CU-ALM-22` | Sin prueba funcional directa del filtro de consumibles. | Filtros visibles, tres alcances, ofertas de ambos tipos, conjunto vacío y contenido del archivo limitado a `CONSUMABLE`. | **Brecha**; las pruebas generales de `reportControllerTest.js` y `reportServiceTest.js` no comprueban este caso ni sustituyen la integración del archivo. |
| `CU-CAT-01..03` | `supplierControllerDbTest.js`. | Integración de alta, consulta y actualización con fixtures y limpieza en base aislada. | **Integración existente.** |
| `CU-CAT-04` | Sin prueba funcional directa del reporte. | Proveedores dentro/fuera de filtros, permisos y archivo esperado. | **Brecha.** |
| `CU-CAT-05..07` | `clientControllerDbTest.js`. | Integración de alta, listado, actualización y error específico con fixtures y limpieza. | **Integración existente.** |
| `CU-CAT-08` | Sin prueba funcional directa del reporte. | Clientes dentro/fuera de filtros, permisos y archivo esperado. | **Brecha.** |
| `CU-CAT-09..26` | `catalogServiceTest.js`, `catalogControllersDbTest.js`. | Unitaria del servicio compartido e integración CRUD/validación con catálogo permitido, payload válido/inválido y lectura Prisma. | **Unitaria e integración existentes.** |
| `CU-IDA-01` | Sin prueba funcional directa. | Actor autorizado/no autorizado, filtros, paginación y conjunto vacío. | **Brecha.** |
| `CU-IDA-02..03` | `personApiRouteTest.js`. | Unitaria de orden validación–autorización–handler para escrituras. | **Unitaria existente**, limitada al contrato de ruta; falta persistencia. |
| `CU-IDA-04..09` | Sin prueba de servidor o integración directa. | Reportes/usuarios requieren permisos, payloads, relaciones, credenciales, filtros y persistencia según el caso. | **Brecha**; los requests simulados de frontend no prueban el flujo completo. |
| `CU-SAL-01..05` | Sin prueba de servidor o integración directa del flujo. | Documento/estado, detalles, stock suficiente/insuficiente, permisos y rollback. | **Brecha**; la fábrica frontend compartida no es evidencia funcional suficiente. |
| `CU-SAL-06` | `goodsIssueControllerTest.js`. | Unitaria de devolución con datos sanitizados, usuario y servicio simulado. | **Unitaria existente**; falta integración de stock/movimiento. |
| `CU-SAL-07` | `reportControllerTest.js`. | Unitaria de fórmulas del reporte de salida; cantidades convertidas y escritor simulado. | **Unitaria existente**; falta integración del archivo. |
| `CU-SAL-08..12` | `wasteIssueControllerTest.js`, `wasteIssueControllerDbTest.js`. | Unitarias de consulta/DTO/edición/surtido e integración de documento, stock, movimiento, parcial y rollback con fixtures reales. | **Unitarias e integración existentes.** |
| `CU-SAL-13` | `wasteIssueControllerTest.js`. | Unitaria de devolución con cantidad, observación, usuario y servicio simulado. | **Unitaria existente**; falta integración. |
| `CU-SAL-14` | `reportControllerTest.js`. | Unitaria de fórmula/contenido operativo del reporte con escritor simulado. | **Unitaria existente**; falta integración del archivo. |
| `CU-ENT-01..02`, `CU-ENT-07..08` | `goodsReceiptContextServicesTest.js` cubre la delimitación de tipo; sin integración directa de consulta/alta. | Consulta/alta con proveedor, receptor, detalles, costos, permisos, tipo y persistencia. | **Unitaria parcial**; falta integración. |
| `CU-ENT-03..04`, `CU-ENT-09..10` | `goodsReceiptControllerTest.js` y `goodsReceiptContextServicesTest.js`. | Unitaria de edición/corrección con DTO, IDs, cantidades/costos, tipo y evento posterior. | **Unitaria existente**; falta integración. |
| `CU-ENT-05`, `CU-ENT-11` | Sin prueba funcional directa de cancelación. | Compra/detalle existente, contexto, estado cancelable, stock/movimiento y ausencia de efectos parciales. | **Brecha.** |
| `CU-ENT-06`, `CU-ENT-12` | `reportControllerTest.js` y `goodsReceiptContextServicesTest.js`. | Unitaria de delimitación, fórmulas, importes y resúmenes con escritor simulado. | **Unitaria existente**; falta integración del archivo. |

## Regla de mantenimiento

Las pruebas de frontend que sólo comprobaban DOM simulado, plugins, selectores,
entrypoints, mensajes, configuración visual o delegación de requests se retiraron porque
su costo de mantenimiento no aportaba evidencia suficiente de los casos de uso. Se
conservan los validadores y transformaciones de datos del navegador que sí protegen
reglas y fronteras observables. Cuando cambie este criterio, se actualizan en el mismo
cambio la suite y esta matriz; el registro selectivo sólo cambia si el caso cumple sus
criterios de inclusión. El resultado de la ejecución permanece en CI o en la solicitud
de cambio.
