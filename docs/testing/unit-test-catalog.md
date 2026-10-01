# Catálogo de pruebas unitarias

## Suite

| Campo | `SU-UNIT-001` — Suite unitaria de Nexus |
| --- | --- |
| Objetivo | Detectar regresiones en reglas, transformaciones, autorización, contratos entre capas y efectos aislables de infraestructura real. |
| Comando | `npm run test:unit` |
| Configuración | `vitestConfig.js`: incluye `tests/**/*Test.js` y excluye `tests/integration/**`. |
| Ambiente | Node.js `>=22 <25`, Vitest `4.1.9`, ambiente `node`; no requiere navegador, PostgreSQL ni servicios externos. |
| Preparación y limpieza | Fixtures y dobles locales; cada archivo restaura sus mocks o variables globales mediante sus hooks. |
| Criterio de aprobación | Todos los archivos y casos descubiertos terminan aprobados, sin errores del runner. |
| Resultado | La ejecución de CI asociada al commit conserva conteos, duración y estado. |
| Fuera de alcance | Persistencia real, migraciones, integración HTTP con servicios reales y renderizado en navegador. |

## Técnicas aplicadas

| Técnica | Grupos | Datos o condición | Resultado observado |
| --- | --- | --- | --- |
| Partición de equivalencia | `G01`, `G03`, `G05`, `G09` | Entradas válidas, inválidas, ausentes, roles, departamentos y estados. | Valor normalizado, decisión de acceso o error esperado. |
| Valores frontera | `G02`, `G04`, `G08`, `G09` | Cero, negativos, máximos, precisión decimal, fechas, páginas y colecciones vacías. | Aceptación exacta del límite o rechazo sin efectos posteriores. |
| Tablas de decisión | `G01`, `G05`, `G09` | Combinaciones materializadas con `it.each`. | Resultado definido para cada combinación. |
| Transiciones y atomicidad | `G02`, `G04`, `G07` | Estado documental, existencia, duplicidad y callbacks transaccionales. | Transición admitida o rechazo/rollback sin resultado parcial. |
| Interacción y fallos | `G02`, `G06`, `G07`, `G10` | Servicios, middleware, Prisma y herramientas sustituidos por dobles. | Argumentos, retorno, error y ausencia de colaboradores posteriores. |

Los datos concretos, precondiciones, acciones y resultados esperados de cada caso están
en sus bloques `describe`/`it` o filas de `it.each`. Los grupos siguientes son los
diseños `DP-UNIT-GNN`; sus casos ejecutables corresponden a `CP-UNIT-GNN-*`.

## Grupos y archivos vigentes

| Diseño / unidad | Archivos | Cobertura |
| --- | --- | --- |
| `DP-UNIT-G01` Permisos | `tests/unit/constants/permissionsTest.js` (1) | Acceso permitido y denegado por rol, departamento y operación. |
| `DP-UNIT-G02` Controllers de almacén | `tests/unit/controllers/api/warehouse/*Test.js` (8) | Entradas, salidas, materiales, mermas y reportes; DTO, respuestas, límites, fallos y eventos posteriores. |
| `DP-UNIT-G03` DTO | `tests/unit/dtos/*Test.js` (3) | Normalización de entradas, materiales y mermas; opcionales, identidades, partidas y decimales. |
| `DP-UNIT-G04` Inventario y transacción | `tests/unit/helpers/rollbackTransactionTest.js`, `tests/unit/inventory/*Test.js`, `tests/unit/warehouse/goodsReceiptHelpersTest.js` (4) | Commit/rollback, movimientos, existencias y detalles de compra. |
| `DP-UNIT-G05` Validación cliente | `tests/unit/public/js/utils/**/*Test.js` (4) | Colecciones de detalles y validaciones de entradas, materiales y mermas. |
| `DP-UNIT-G06` Rutas | `tests/unit/routes/**/*Test.js` (6) | Orden de middleware, autorización y enlace de controllers en rutas API y web. |
| `DP-UNIT-G07` Servicios | `tests/unit/services/**/*Test.js` (12) | Catálogos, identidad, movimientos, entradas, salidas, relaciones proveedor-material, reportes y mermas. |
| `DP-UNIT-G08` Utilidades de servidor | `tests/unit/utils/*Test.js` (5) | Fechas, filtros, paginación, reportes Excel y contratos de inventario. |
| `DP-UNIT-G09` Validadores de servidor | `tests/unit/validators/*Test.js` (6) | Catálogos, precisión decimal, detalles de compra, devoluciones, materiales y campos obligatorios. |
| `DP-UNIT-G10` Scripts documentales | `tests/unit/scripts/*Test.js` (11) | Exportación, imágenes, Mermaid, PDF y capturas del manual. |

**Total vigente:** 60 archivos. El número de casos y su estado se obtiene de la ejecución
de Vitest porque las tablas `it.each` materializan casos dinámicamente.

## Trazabilidad del diseño

Esta tabla aplica el registro de diseño definido por el [plan de pruebas](test-plan.md).
Cada fila agrupa casos homogéneos; el nombre completo de cada `it`, incluidas las filas
materializadas por `it.each`, se enumera con un ID concreto `CP-UNIT-GNN-NNN` en el
[índice de casos automatizados](automated-test-case-index.md).

| ID de diseño | Requisito / riesgo | Nivel y técnica | Condición que se cubrirá | Casos asociados |
| --- | --- | --- | --- | --- |
| `DP-UNIT-G01` | Autorización por rol, departamento y operación. | Unitario; tabla de decisión y particiones. | Conceder únicamente las operaciones asignadas y rechazar las demás. | `CP-UNIT-G01-*` en `tests/unit/constants/permissionsTest.js`. |
| `DP-UNIT-G02` | Contratos HTTP de almacén y ausencia de efectos tras un fallo. | Unitario; fronteras, transiciones e interacción. | Traducir request/DTO a status y body; ejecutar eventos posteriores sólo después del éxito. | `CP-UNIT-G02-*` en `tests/unit/controllers/api/warehouse/*Test.js`. |
| `DP-UNIT-G03` | Conservación y normalización de datos de entrada. | Unitario; particiones de equivalencia. | Normalizar opcionales, identidades, partidas y decimales sin perder información válida. | `CP-UNIT-G03-*` en `tests/unit/dtos/*Test.js`. |
| `DP-UNIT-G04` | Exactitud de inventario y atomicidad. | Unitario; valores frontera, transición y fallo. | Calcular existencias/movimientos y propagar el rollback sin resultados parciales. | `CP-UNIT-G04-*` en las rutas de inventario y transacción indicadas en la tabla anterior. |
| `DP-UNIT-G05` | Integridad de colecciones y validación de datos en cliente. | Unitario; particiones, fronteras y tabla de decisión. | Agregar, sustituir o rechazar detalles y formularios según su clase de entrada. | `CP-UNIT-G05-*` en `tests/unit/public/js/utils/**/*Test.js`. |
| `DP-UNIT-G06` | Autorización antes del handler y orden de middleware. | Unitario; interacción y decisión. | Permitir que el caso autorizado alcance el controller y detener antes el rechazado. | `CP-UNIT-G06-*` en `tests/unit/routes/**/*Test.js`. |
| `DP-UNIT-G07` | Reglas de servicios y fallos de colaboradores. | Unitario; transición, interacción y fallo. | Conservar filtros/relaciones y no continuar colaboraciones después de un dato o resultado inválido. | `CP-UNIT-G07-*` en `tests/unit/services/**/*Test.js`. |
| `DP-UNIT-G08` | Límites de fechas, consultas, inventario y exportación. | Unitario; valores frontera. | Producir defaults, rangos, fórmulas y representaciones válidas en extremos y conjuntos vacíos. | `CP-UNIT-G08-*` en `tests/unit/utils/*Test.js`. |
| `DP-UNIT-G09` | Rechazo de campos, cantidades y precisión no admitidos. | Unitario; particiones, fronteras y tabla de decisión. | Aceptar la clase válida y devolver el error correspondiente para cada clase inválida. | `CP-UNIT-G09-*` en `tests/unit/validators/*Test.js`. |
| `DP-UNIT-G10` | Fallos visibles y reproducibles de publicación documental. | Unitario; interacción, equivalencias y fallo. | Generar el recurso solicitado o rechazar argumentos, archivos y herramientas inválidos sin ocultar el error. | `CP-UNIT-G10-*` en `tests/unit/scripts/*Test.js`. |

## Especificación agrupada de los casos

Los casos automatizados se documentan sin duplicar el código: la ruta localiza la
preparación y cada nombre `it` identifica la acción reproducible y su resultado concreto.
Las filas siguientes registran los datos representativos y el oráculo común del grupo;
si un caso deja de compartirlos, debe recibir otro diseño en lugar de incorporarse a una
fila heterogénea.

El [índice de casos automatizados](automated-test-case-index.md) enumera los 281 casos
unitarios vigentes. Cada fila conserva el formato del plan —precondiciones, datos,
acción, resultado esperado y limpieza— y vincula su ID con el archivo, bloque `describe`
y nombre `it` exactos.

| ID de caso | Precondiciones y estado inicial | Datos de prueba | Acción / pasos | Resultado esperado | Limpieza |
| --- | --- | --- | --- | --- | --- |
| `CP-UNIT-G01-*` | Política cargada; dobles restaurados por la suite. | Administrador, personal de almacén y asesor de ventas combinados con operaciones permitidas y denegadas. | Ejecutar el `it` o fila `it.each` de `permissionsTest.js`. | Cada combinación devuelve el booleano definido; ventas no obtiene permisos del sistema. | Restauración de mocks por hooks. |
| `CP-UNIT-G02-*` | Request/response aislados y servicio de almacén simulado en estado exitoso o fallido. | Filtros; DTO válidos, manipulados o en frontera; IDs existentes/inexistentes; error del servicio. | Ejecutar el `it` del controller indicado por la ruta del diseño. | Status, body y argumentos coinciden con el caso; datos no permitidos no llegan al servicio y un fallo impide eventos posteriores. | Restauración de mocks por hooks. |
| `CP-UNIT-G03-*` | Función DTO aislada. | Facturas con variantes de formato, opcionales presentes/ausentes, IDs, detalles repetidos y decimales. | Invocar el DTO según el `it` del archivo asociado. | Se obtiene exactamente el payload esperado sin fusionar identidades o partidas distintas. | No aplica. |
| `CP-UNIT-G04-*` | Existencia suficiente/insuficiente o transacción activa; cliente transaccional simulado. | Cero, decimales, cantidades dentro/fuera del stock, dimensiones presentes/ausentes y callback que resuelve o falla. | Ejecutar el helper o movimiento nombrado por el `it`. | El cálculo y movimiento son exactos; el fallo se propaga y la transacción no deja un resultado parcial. | Restauración de mocks por hooks. |
| `CP-UNIT-G05-*` | Colección o formulario aislado en su estado inicial declarado por el caso. | Colección vacía, detalle nuevo/repetido, IDs y campos válidos, ausentes o fuera de frontera. | Ejecutar la operación o validador nombrado por el `it`. | Sólo cambia el detalle objetivo o se devuelve la configuración/error esperado, sin alterar los demás datos. | Restauración de globals cuando aplique. |
| `CP-UNIT-G06-*` | Router aislado con middleware y controller observables. | Requests con rol/departamento autorizado y no autorizado. | Enviar la request descrita por el `it` a la ruta bajo prueba. | El caso permitido recorre los middlewares en orden y alcanza el handler; el rechazado no invoca el controller. | Restauración de spies por hooks. |
| `CP-UNIT-G07-*` | Prisma o servicio colaborador simulado; estado inicial descrito en el `it`. | Identidades completas/incompletas, filtros, snapshots, relaciones, facturas duplicadas/no duplicadas y errores simulados. | Invocar el servicio nombrado por el `it`. | Retorno y argumentos respetan filtros y relaciones; el rechazo/error previsto detiene colaboradores posteriores. | Restauración de mocks por hooks. |
| `CP-UNIT-G08-*` | Utilidad pura o escritor simulado. | Mes válido/inválido/bisiesto, página negativa, rangos, fórmulas, relaciones y colecciones vacías. | Invocar la utilidad conforme al `it`. | Fechas, filtros, filas, fórmulas y defaults coinciden con el valor esperado sin producir rangos inválidos. | No aplica o restauración del escritor simulado. |
| `CP-UNIT-G09-*` | Validador aislado. | Campo ausente, nulo o válido; cantidad `0`, negativa y positiva; decimal dentro y fuera de precisión. | Ejecutar el validador o fila `it.each` indicada. | La clase válida se acepta; cada clase inválida devuelve su código y no acepta el dato fuera del límite. | No aplica. |
| `CP-UNIT-G10-*` | Fixture temporal y herramienta simulada disponible/ausente según el caso. | Formato, ruta, imagen, geometría, estado de recuperación y convertidor válidos o inválidos. | Ejecutar el helper documental nombrado por el `it`. | Se produce el plan/recurso esperado o un rechazo explícito, sin ocultar el fallo. | Hooks eliminan temporales y restauran mocks. |

## Registro de ejecución

El catálogo no convierte la existencia de un archivo en un resultado aprobado ni
mantiene una instantánea que pueda quedar obsoleta. Para cada entrega, `SU-UNIT-001` se
registra como `EP-*` en CI o en la solicitud de cambio con revisión, versiones de Node y
Vitest, sistema operativo, fecha UTC, conteos, duración, estado y enlace a la salida. Un
caso focalizado referencia además su `CP-UNIT-GNN-*`; el resultado real nunca reemplaza
el resultado esperado de la tabla anterior.
