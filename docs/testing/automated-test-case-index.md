# Registro selectivo de casos de prueba automatizados

## Propósito y alcance

La suite completa vive en `tests` y se descubre con la configuración de Vitest. Este
registro no copia cada bloque `it` ni cada fila de `it.each`: esos nombres, fixtures,
datos y aserciones cambian junto con el código y constituyen su especificación
ejecutable. Duplicarlos manualmente produjo un catálogo extenso con poco valor adicional
y riesgo de desincronización.

Aquí se mantienen únicamente:

1. un inventario breve para localizar las suites unitarias; y
2. fichas `CP-*` de casos seleccionados por riesgo que necesitan trazabilidad estable.

La [matriz por caso de uso](use-case-test-types.md) indica qué evidencia funcional existe
y qué brechas permanecen. El [plan de pruebas](test-plan.md) define los criterios de
selección, los niveles y el registro de resultados. CI o la solicitud de cambio conserva
el resultado real de cada ejecución; este documento no afirma que una prueba esté
aprobada.

## Qué se documenta con ficha

Toda integración HTTP/Prisma recibe ficha porque comprueba persistencia fuera de mocks.
Entre las unitarias sólo se seleccionan autorización y seguridad, invariantes críticas
de integridad —transacción, rollback, stock, movimiento o transición— y criterios de
aceptación que requieran identificador estable. No se crea una ficha separada para
variaciones tabuladas de la misma regla: el caso y sus datos pueden permanecer agrupados
en el bloque ejecutable.

Las pruebas unitarias de transformaciones, formato, wiring, helpers, DTO, validadores o
scripts siguen siendo obligatorias cuando protegen comportamiento útil, pero no se
transcriben aquí por defecto. Al modificarlas basta actualizar el ejecutable y, si cambia
la cobertura funcional, la matriz por caso de uso. Una ficha se actualiza sólo si el
caso entra en los criterios anteriores o ya está registrado.

## Inventario de suites unitarias

Este inventario señala dónde buscar la especificación ejecutable sin enumerar todos sus
casos. Las rutas son relativas a `tests/unit/`.

| Área | Ubicación | Responsabilidad cubierta |
| --- | --- | --- |
| Permisos | `constants/` | Matriz de autorización por rol, área y operación. |
| Controllers | `controllers/` | Traducción HTTP, sanitización, delegación y propagación de errores. |
| DTO | `dtos/` | Normalización de contratos y campos opcionales. |
| Transacciones e inventario | `helpers/`, `inventory/`, `warehouse/` | Rollback, stock, movimientos y helpers del dominio. |
| Frontend funcional | `public/js/` | Colecciones y validaciones de datos observables; no detalles puramente visuales. |
| Rutas | `routes/` | Orden y presencia de validación, autorización y handlers. |
| Servicios | `services/` | Reglas de negocio y colaboración con persistencia simulada. |
| Utilidades | `utils/` | Queries, formatos, cálculos y generación de reportes. |
| Validadores | `validators/` | Obligatorios, tipos, precisión, límites y detalles. |
| Herramientas documentales | `scripts/` | Exportación, imágenes, PDF, Mermaid y capturas. |

Las unitarias se ejecutan con `npm run test:unit`. El nombre del archivo y la jerarquía
`describe`/`it` deben expresar la condición y el resultado verificable, de modo que el
reporte de Vitest sea el inventario detallado cuando se necesite revisar toda la suite.

## Resultado de la revisión

Se revisó la suite vigente contra los criterios del plan. Una ficha puede agrupar varios
`it` cuando comparten riesgo, precondición y resultado de negocio; esto evita volver a
crear el catálogo exhaustivo.

| Decisión | Casos o suites | Motivo |
| --- | --- | --- |
| Documentar | `permissionsTest.js` y las seis suites de `tests/unit/routes/` | Protegen autorización por contexto y la presencia/orden de autenticación, validación y permisos. |
| Documentar | `wasteControllerFlowTest.js` y `wasteRegistrationBoundaryTest.js` | Protegen identidad, límites persistentes, alta y ajustes de existencias de merma. |
| Documentar | `stockHelpersTest.js`, `movementHelpersTest.js`, el caso de stock final de `supplierMaterialServiceTest.js`, `wasteMovementServiceTest.js` y `wasteStockEntryServiceTest.js` | Protegen stock no negativo, agrupación y signos de movimientos, saldos, folio y actor. |
| Documentar | Casos de surtido/devolución de `goodsIssueControllerTest.js` y `wasteIssueControllerTest.js` | Protegen actor, cantidades y estados que el cliente no puede imponer. |
| Documentar | Los cuatro archivos de `tests/integration/controllers/` | Demuestran HTTP, persistencia real, estados y ausencia de efectos parciales. |
| No documentar por caso | DTO, formato, queries, reportes, validadores generales, frontend funcional y servicios CRUD aislados | Sus nombres y aserciones son suficientes; la matriz por caso de uso conserva la trazabilidad funcional cuando aplica. |
| No documentar por caso | Helpers de pruebas y scripts documentales | Validan infraestructura del repositorio, no un riesgo o criterio de aceptación del producto. |

Un archivo clasificado como «no documentar por caso» no pierde cobertura ni deja de
ejecutarse. Si posteriormente incorpora autorización, persistencia, stock, movimiento,
rollback o una transición crítica, se revisa únicamente ese nuevo bloque.

## Casos unitarios seleccionados

Las variaciones de la matriz de acceso se agrupan porque prueban la misma política con
roles, áreas y operaciones distintas. El mismo criterio se usa para fronteras y
movimientos tabulados: se documenta la regla, no una ficha repetida por dato.

| ID de caso | Precondiciones y estado inicial | Datos de prueba | Acción / pasos | Resultado esperado | Limpieza |
| --- | --- | --- | --- | --- | --- |
| `CP-UNIT-AUT-001` | Política de permisos cargada; no requiere sesión ni base de datos. | Roles de ventas, coordinación, administración y almacén combinados con las áreas de ventas y almacén. | Ejecutar `tests/unit/constants/permissionsTest.js` › `políticas funcionales de acceso`. | Ventas no recibe permisos; un asesor de almacén no administra salidas; el almacenista conserva el CRUD de salidas y las consultas de clientes y proveedores. | No aplica. |
| `CP-UNIT-AUT-002` | Routers API/web aislados con middleware y handlers simulados. | Rutas de personas, clientes, mermas, salidas de merma y páginas operativas. | Ejecutar las suites bajo `tests/unit/routes/`. | Las escrituras validan antes de autorizar; cada endpoint y página exige autenticación y el permiso específico antes de ejecutar su handler. | Mocks restaurados por hooks. |
| `CP-UNIT-ALM-001` | Controller de merma aislado con transacción y colaboradores simulados. | Alta inicial, edición de identidad/estado, ajuste físico y conflicto por identidad repetida. | Ejecutar `tests/unit/controllers/api/warehouse/wasteControllerFlowTest.js` › `wasteController complete flow`. | El alta registra existencia y ajuste inicial; la edición no altera identidad ni stock fuera del flujo permitido; el ajuste conserva saldos convertidos y los duplicados se rechazan sin actualizar. | Mocks restaurados por hooks. |
| `CP-UNIT-ALM-002` | Endpoint de alta de merma con validator real y servicio simulado. | Máximos admitidos y particiones inválidas de nombre, UUID, dimensiones, stock, costo y observaciones. | Ejecutar `tests/unit/controllers/api/warehouse/wasteRegistrationBoundaryTest.js` › `wasteController registration boundaries`. | Los valores máximos exactos llegan normalizados al servicio; todo valor inválido obtiene `VALIDATION_ERROR` antes de intentar registrar. | Mocks restaurados por hooks. |
| `CP-UNIT-INV-001` | Helpers y servicio de inventario aislados. | Cantidades con/sin dimensiones, saldo cero o negativo, contratos planos/anidados y surtido de la última pieza. | Ejecutar `tests/unit/inventory/stockHelpersTest.js` › `stockHelpers` y el caso `sincroniza en cero...` de `tests/unit/services/warehouse/materials/supplierMaterialServiceTest.js`. | La conversión se normaliza, el saldo cero sincroniza ambas cantidades y cualquier saldo negativo produce el error de negocio con metadatos identificables. | Mocks restaurados por hooks. |
| `CP-UNIT-INV-002` | Helpers y servicio de movimientos con una transacción simulada. | Detalles repetidos para resumen; entrada y salida con cantidades convertidas. | Ejecutar `tests/unit/inventory/movementHelpersTest.js` y `tests/unit/services/warehouse/wastes/wasteMovementServiceTest.js`. | El resumen agrupa stock sin fusionar la evidencia de detalles; la entrada usa signo positivo, la salida negativo y cada detalle conserva sus saldos. | Mocks restaurados por hooks. |
| `CP-UNIT-INV-003` | Servicio de entrada con generador de folio y movimiento simulados. | Merma, cantidad, observación y actor autenticado. | Ejecutar `tests/unit/services/warehouse/wastes/wasteStockEntryServiceTest.js` › `documento de entrada de existencia de merma`. | El documento conserva folio, actor, captura, saldos y vínculo con el movimiento que incrementó la existencia. | Mocks restaurados por hooks. |
| `CP-UNIT-SAL-001` | Controllers de salidas aislados con servicios simulados. | Surtido, devolución, actor autenticado y campos de estado enviados por el cliente. | Ejecutar los casos de surtido/devolución de `tests/unit/controllers/api/warehouse/goodsIssueControllerTest.js` y `wasteIssueControllerTest.js`. | El controller normaliza cantidades y actor, descarta estados controlados por el servidor y limita una salida surtida a las modificaciones permitidas. | Mocks restaurados por hooks. |

## Integración HTTP/Prisma

Estos casos requieren `DATABASE_TEST_URL` y se ejecutan mediante
`npm run test:integration`. Sus fixtures, precondiciones, datos concretos, aserciones HTTP
y Prisma, y limpieza están en el bloque `it` enlazado.

| ID de caso | Precondiciones y estado inicial | Datos de prueba | Acción / pasos | Resultado esperado | Limpieza |
| --- | --- | --- | --- | --- | --- |
| `CP-INT-CAT-001` | `DATABASE_TEST_URL` aislada, migrada; fixtures y actor del bloque preparados. | Payload HTTP y registros iniciales concretos declarados en el `it`; prefijo exclusivo de la suite. | Ejecutar `tests/integration/controllers/catalogControllersDbTest.js` › `catalog controllers database integration` › `guarda catálogos en DATABASE_TEST_URL y los lee desde sus controllers`. | Se obtiene el resultado verificable descrito por el caso: «guarda catálogos en DATABASE_TEST_URL y los lee desde sus controllers»; las aserciones del `it` fijan valor, error, respuesta o ausencia de efectos. | El `afterAll` elimina fixtures de la suite; el teardown global actúa como respaldo. |
| `CP-INT-CAT-002` | `DATABASE_TEST_URL` aislada, migrada; fixtures y actor del bloque preparados. | Payload HTTP y registros iniciales concretos declarados en el `it`; prefijo exclusivo de la suite. | Ejecutar `tests/integration/controllers/catalogControllersDbTest.js` › `catalog controllers database integration` › `crea, consulta y edita un catálogo administrable mediante el flujo compartido`. | Se obtiene el resultado verificable descrito por el caso: «crea, consulta y edita un catálogo administrable mediante el flujo compartido»; las aserciones del `it` fijan valor, error, respuesta o ausencia de efectos. | El `afterAll` elimina fixtures de la suite; el teardown global actúa como respaldo. |
| `CP-INT-CAT-003` | `DATABASE_TEST_URL` aislada, migrada; fixtures y actor del bloque preparados. | Payload HTTP y registros iniciales concretos declarados en el `it`; prefijo exclusivo de la suite. | Ejecutar `tests/integration/controllers/catalogControllersDbTest.js` › `catalog controllers database integration` › `rechaza el payload antes de persistir cuando excede el límite del catálogo`. | Se obtiene el resultado verificable descrito por el caso: «rechaza el payload antes de persistir cuando excede el límite del catálogo»; las aserciones del `it` fijan valor, error, respuesta o ausencia de efectos. | El `afterAll` elimina fixtures de la suite; el teardown global actúa como respaldo. |
| `CP-INT-CLI-001` | `DATABASE_TEST_URL` aislada, migrada; fixtures y actor del bloque preparados. | Payload HTTP y registros iniciales concretos declarados en el `it`; prefijo exclusivo de la suite. | Ejecutar `tests/integration/controllers/clientControllerDbTest.js` › `clientController database integration` › `guarda, lista y actualiza clientes desde el controller con todos sus servicios`. | Se obtiene el resultado verificable descrito por el caso: «guarda, lista y actualiza clientes desde el controller con todos sus servicios»; las aserciones del `it` fijan valor, error, respuesta o ausencia de efectos. | El `afterAll` elimina fixtures de la suite; el teardown global actúa como respaldo. |
| `CP-INT-CLI-002` | `DATABASE_TEST_URL` aislada, migrada; fixtures y actor del bloque preparados. | Payload HTTP y registros iniciales concretos declarados en el `it`; prefijo exclusivo de la suite. | Ejecutar `tests/integration/controllers/clientControllerDbTest.js` › `clientController database integration` › `conserva el tipo y el código del error específico producido por los servicios`. | Se obtiene el resultado verificable descrito por el caso: «conserva el tipo y el código del error específico producido por los servicios»; las aserciones del `it` fijan valor, error, respuesta o ausencia de efectos. | El `afterAll` elimina fixtures de la suite; el teardown global actúa como respaldo. |
| `CP-INT-PRO-001` | `DATABASE_TEST_URL` aislada, migrada; fixtures y actor del bloque preparados. | Payload HTTP y registros iniciales concretos declarados en el `it`; prefijo exclusivo de la suite. | Ejecutar `tests/integration/controllers/supplierControllerDbTest.js` › `supplierController database integration` › `guarda, consulta y actualiza proveedores desde el controller`. | Se obtiene el resultado verificable descrito por el caso: «guarda, consulta y actualiza proveedores desde el controller»; las aserciones del `it` fijan valor, error, respuesta o ausencia de efectos. | El `afterAll` elimina fixtures de la suite; el teardown global actúa como respaldo. |
| `CP-INT-SAL-001` | `DATABASE_TEST_URL` aislada, migrada; fixtures y actor del bloque preparados. | Payload HTTP y registros iniciales concretos declarados en el `it`; prefijo exclusivo de la suite. | Ejecutar `tests/integration/controllers/wasteIssueControllerDbTest.js` › `waste issue controller database integration` › `crea y surte una salida por HTTP, persiste estados, stock y movimiento`. | Se obtiene el resultado verificable descrito por el caso: «crea y surte una salida por HTTP, persiste estados, stock y movimiento»; las aserciones del `it` fijan valor, error, respuesta o ausencia de efectos. | El `afterAll` elimina fixtures de la suite; el teardown global actúa como respaldo. |
| `CP-INT-SAL-002` | `DATABASE_TEST_URL` aislada, migrada; fixtures y actor del bloque preparados. | Payload HTTP y registros iniciales concretos declarados en el `it`; prefijo exclusivo de la suite. | Ejecutar `tests/integration/controllers/wasteIssueControllerDbTest.js` › `waste issue controller database integration` › `elimina al guardar el detalle registrado que fue retirado durante la edición pendiente`. | Se obtiene el resultado verificable descrito por el caso: «elimina al guardar el detalle registrado que fue retirado durante la edición pendiente»; las aserciones del `it` fijan valor, error, respuesta o ausencia de efectos. | El `afterAll` elimina fixtures de la suite; el teardown global actúa como respaldo. |
| `CP-INT-SAL-003` | `DATABASE_TEST_URL` aislada, migrada; fixtures y actor del bloque preparados. | Payload HTTP y registros iniciales concretos declarados en el `it`; prefijo exclusivo de la suite. | Ejecutar `tests/integration/controllers/wasteIssueControllerDbTest.js` › `waste issue controller database integration` › `permite completar una salida parcial aunque la merma se desactive después de solicitarla`. | Se obtiene el resultado verificable descrito por el caso: «permite completar una salida parcial aunque la merma se desactive después de solicitarla»; las aserciones del `it` fijan valor, error, respuesta o ausencia de efectos. | El `afterAll` elimina fixtures de la suite; el teardown global actúa como respaldo. |
| `CP-INT-SAL-004` | `DATABASE_TEST_URL` aislada, migrada; fixtures y actor del bloque preparados. | Payload HTTP y registros iniciales concretos declarados en el `it`; prefijo exclusivo de la suite. | Ejecutar `tests/integration/controllers/wasteIssueControllerDbTest.js` › `waste issue controller database integration` › `rechaza stock insuficiente y revierte toda la transacción`. | Se obtiene el resultado verificable descrito por el caso: «rechaza stock insuficiente y revierte toda la transacción»; las aserciones del `it` fijan valor, error, respuesta o ausencia de efectos. | El `afterAll` elimina fixtures de la suite; el teardown global actúa como respaldo. |

**Total documentado:** 8 casos unitarios agrupados y 10 casos de integración.
