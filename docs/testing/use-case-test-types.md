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

- **Unitaria aprobada:** el archivo se ejecutó dentro de `SU-UNIT-001`; demuestra sólo la
  regla o contrato aislado descrito.
- **Integración disponible:** existe el archivo, pero en esta revisión no se ejecutó con
  `DATABASE_TEST_URL`; no se informa como aprobado.
- **Brecha:** no existe prueba automatizada funcionalmente relevante para ese nivel.
- Varios `CU-*` se agrupan sólo cuando comparten evidencia, datos y resultado esperado.

## Cobertura vigente

| Casos de uso | Evidencia automatizada relevante | Tipo, datos y resultado esperado | Resultado vigente |
| --- | --- | --- | --- |
| `CU-AUT-01..02` | Sin prueba funcional directa. | Sesión limpia/autenticada, credenciales válidas e inválidas; crear o invalidar sesión según corresponda. | **Brecha.** |
| `CU-ALM-01` | `materialControllerTest.js`. | Unitaria de permisos e interacción; queries y retorno simulado; oculta costos sin permiso y conserva respuesta autorizada. | **Unitaria aprobada.** |
| `CU-ALM-02..08` | Sin prueba de servidor o integración directa. | Altas/cambios requieren payloads válidos, inválidos y fronteras; consultas/reportes requieren filtros, permisos y vacío. | **Brecha**; las pruebas de aplicación frontend no sustituyen HTTP/Prisma. |
| `CU-ALM-09` | `wasteControllerTest.js`. | Unitaria de consulta con filtros, búsqueda, proveedor, orden, paginación y servicio simulado. | **Unitaria aprobada.** |
| `CU-ALM-10` | `wasteControllerTest.js`, `wasteControllerFlowTest.js`, `wasteRegistrationBoundaryTest.js`. | Unitarias de alta, identidad duplicada, cálculo inicial y valores máximos; acepta entrada válida y rechaza conflicto/frontera inválida. | **Unitarias aprobadas**; falta integración. |
| `CU-ALM-11` | `wasteControllerTest.js`, `wasteControllerFlowTest.js`. | Unitarias de edición general, nombre duplicado y conservación de identidad/existencia. | **Unitarias aprobadas**; falta integración. |
| `CU-ALM-12` | `wasteControllerTest.js`, `wasteControllerFlowTest.js`. | Unitarias de ajuste con motivo, usuario, conversión y colaboradores simulados. | **Unitarias aprobadas**; falta integración. |
| `CU-ALM-13` | `wasteControllerTest.js`. | Unitaria de suma de existencia; cantidad y servicio simulados; no reemplaza el stock absoluto. | **Unitaria aprobada**; falta integración. |
| `CU-ALM-14` | `reportControllerTest.js`, `reportServiceTest.js`. | Unitarias de agrupación, total, fórmulas, decimales y conjunto vacío del reporte de mermas. | **Unitarias aprobadas**; falta integración del archivo. |
| `CU-ALM-15` | `movementQueryServiceTest.js`. | Unitaria de consulta por identidad de merma con Prisma simulado. | **Unitaria aprobada**; falta integración. |
| `CU-ALM-16` | Sin prueba funcional directa del reporte. | Fixtures de movimientos, periodo, filtros, columnas/fórmulas y vacío. | **Brecha.** |
| `CU-CAT-01..03` | `supplierControllerDbTest.js`. | Integración de alta, consulta y actualización con fixtures y limpieza en base aislada. | **Integración disponible, no ejecutada en esta revisión.** |
| `CU-CAT-04` | Sin prueba funcional directa del reporte. | Proveedores dentro/fuera de filtros, permisos y archivo esperado. | **Brecha.** |
| `CU-CAT-05..07` | `clientControllerDbTest.js`. | Integración de alta, listado, actualización y error específico con fixtures y limpieza. | **Integración disponible, no ejecutada en esta revisión.** |
| `CU-CAT-08` | Sin prueba funcional directa del reporte. | Clientes dentro/fuera de filtros, permisos y archivo esperado. | **Brecha.** |
| `CU-CAT-09..26` | `catalogServiceTest.js`, `catalogControllersDbTest.js`. | Unitaria del servicio compartido e integración CRUD/validación con catálogo permitido, payload válido/inválido y lectura Prisma. | **Unitaria aprobada; integración disponible, no ejecutada.** |
| `CU-IDA-01` | Sin prueba funcional directa. | Actor autorizado/no autorizado, filtros, paginación y conjunto vacío. | **Brecha.** |
| `CU-IDA-02..03` | `personApiRouteTest.js`. | Unitaria de orden validación–autorización–handler para escrituras. | **Unitaria aprobada**, limitada al contrato de ruta; falta persistencia. |
| `CU-IDA-04..09` | Sin prueba de servidor o integración directa. | Reportes/usuarios requieren permisos, payloads, relaciones, credenciales, filtros y persistencia según el caso. | **Brecha**; los requests simulados de frontend no prueban el flujo completo. |
| `CU-SAL-01..05` | Sin prueba de servidor o integración directa del flujo. | Documento/estado, detalles, stock suficiente/insuficiente, permisos y rollback. | **Brecha**; la fábrica frontend compartida no es evidencia funcional suficiente. |
| `CU-SAL-06` | `goodsIssueControllerTest.js`. | Unitaria de devolución con datos sanitizados, usuario y servicio simulado. | **Unitaria aprobada**; falta integración de stock/movimiento. |
| `CU-SAL-07` | `reportControllerTest.js`. | Unitaria de fórmulas del reporte de salida; cantidades convertidas y escritor simulado. | **Unitaria aprobada**; falta integración del archivo. |
| `CU-SAL-08..12` | `wasteIssueControllerTest.js`, `wasteIssueControllerDbTest.js`. | Unitarias de consulta/DTO/edición/surtido e integración de documento, stock, movimiento, parcial y rollback con fixtures reales. | **Unitarias aprobadas; integración disponible, no ejecutada.** |
| `CU-SAL-13` | `wasteIssueControllerTest.js`. | Unitaria de devolución con cantidad, observación, usuario y servicio simulado. | **Unitaria aprobada**; falta integración. |
| `CU-SAL-14` | `reportControllerTest.js`. | Unitaria de fórmula/contenido operativo del reporte con escritor simulado. | **Unitaria aprobada**; falta integración del archivo. |
| `CU-ENT-01..02` | Sin prueba de servidor o integración directa. | Consulta/alta con proveedor, receptor, detalles, costos, permisos y persistencia. | **Brecha**; el contrato frontend no basta. |
| `CU-ENT-03..04` | `goodsReceiptControllerTest.js`. | Unitaria de edición/corrección con DTO, IDs, cantidades/costos y evento posterior. | **Unitaria aprobada**; falta integración. |
| `CU-ENT-05` | Sin prueba funcional directa de cancelación. | Compra/detalle existente, estado cancelable, stock/movimiento y ausencia de efectos parciales. | **Brecha.** |
| `CU-ENT-06` | `reportControllerTest.js`. | Unitaria de fórmulas de importes y resúmenes con datos decimales y escritor simulado. | **Unitaria aprobada**; falta integración del archivo. |

## Regla de mantenimiento

Las pruebas de frontend que sólo comprobaban DOM simulado, plugins, selectores,
entrypoints, mensajes, configuración visual o delegación de requests se retiraron porque
su costo de mantenimiento no aportaba evidencia suficiente de los casos de uso. Se
conservan los validadores y transformaciones de datos del navegador que sí protegen
reglas y fronteras observables. Cuando cambie este criterio, se actualizan en el mismo
cambio la suite, esta matriz, el catálogo y el registro de resultados.
