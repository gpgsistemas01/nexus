# Ambiente, estrategia y catálogo de pruebas unitarias

## Alcance del catálogo

Este documento identifica la suite que ejecuta `npm run test:unit` y explica la
estrategia, la técnica y el resultado observable de sus casos. Los nombres concretos de
los casos permanecen en `describe`/`it` como evidencia ejecutable; este catálogo permite
revisar fuera del código qué se comprueba y cómo se aísla.

El inventario corresponde a la revisión indicada en el
[registro de resultados](unit-test-results.md). Cuando se agrega, elimina o reclasifica
un archivo de prueba, se actualizan conjuntamente este catálogo y ese registro.

## Ficha de la suite unitaria

La referencia estable de la ejecución completa es **`SU-UNIT-001` — Suite unitaria de
Nexus**. El término *suite* designa aquí el conjunto seleccionado por Vitest; cada
`*Test.js` es un archivo de prueba y cada `it` o fila materializada por `it.each` es un
caso. Esta distinción evita presentar los 70 archivos como si fueran 70 ejecuciones
independientes.

| Campo | Definición de `SU-UNIT-001` |
| --- | --- |
| Objetivo | Detectar regresiones en reglas, transformaciones, decisiones, contratos entre capas y efectos observables que pueden aislarse de infraestructura real. |
| Elemento bajo prueba | Módulos de servidor y navegador localizados por los 70 archivos de prueba inventariados en este documento. |
| Orquestador | Script `test:unit` de `package.json`, con selección y exclusiones definidas en `vitestConfig.js`. |
| Precondiciones | Dependencias instaladas mediante `npm ci`, runtime admitido y ejecución desde la raíz. No requiere servidor, navegador, Redis ni PostgreSQL activos. |
| Preparación | Cada archivo construye fixtures y dobles locales; los hooks `beforeEach`/`afterEach` restablecen mocks o globals cuando corresponde. |
| Ejecución | Vitest importa los archivos seleccionados, materializa los casos parametrizados y ejecuta los archivos con el aislamiento propio del runner. |
| Criterio de aprobación | Todos los archivos y casos descubiertos terminan aprobados, ninguno queda fallido y no existe un error del runner. Una advertencia o desviación ambiental se conserva en el registro y se resuelve antes de usar la corrida como validación del runtime admitido. |
| Criterio de bloqueo | Fallo al instalar/importar, runtime no disponible o dependencia ambiental inesperada que impida ejecutar los casos; se informa como bloqueado, no como aprobado. |
| Resultado producido | Resumen de archivos/casos aprobados, fallidos u omitidos, duración y código de salida. La última evidencia se conserva en `unit-test-results.md`. |
| Fuera de alcance | Persistencia real, migraciones, contrato HTTP con servicios reales, renderizado en navegador y pruebas manuales; corresponden a integración, esquema o validación manual. |

La suite completa se referencia por `SU-UNIT-001` en resultados y solicitudes de
cambio. Los grupos `SU-UNIT-001-G01` a `SU-UNIT-001-G15` permiten indicar qué parte se
afecta o se ejecuta de forma focalizada sin inventar una suite distinta para cada
archivo.

## Ambiente de pruebas unitarias

| Elemento | Configuración y límite |
| --- | --- |
| Runtime admitido | Node.js `>=22 <25`, de acuerdo con `package.json`. Una ejecución con otra versión se registra como observación y no reemplaza la validación en el runtime admitido. |
| Runner | Vitest `4.1.9`, instalado como dependencia de desarrollo. |
| Comando | `npm run test:unit`, equivalente a `vitest run --config vitestConfig.js`. |
| Descubrimiento | `tests/**/*Test.js`; la suite de integración `tests/integration/**` queda excluida expresamente. |
| Ambiente Vitest | Ambiente `node` predeterminado. No se configura `jsdom` ni un navegador real. |
| Estado compartido | No hay `setupFiles`, `globalSetup` ni `teardown` en `vitestConfig.js`; cada suite prepara y restaura sus dobles y globals. |
| Base de datos | Las unitarias no requieren migraciones ni una conexión real. Prisma, transacciones y servicios colaboradores se sustituyen cuando forman parte del borde de la unidad. La persistencia real pertenece a `npm run test:integration`. |
| Interfaz web | Las suites crean stubs mínimos de `window`, `document`, jQuery o plugins. No validan renderizado en un motor de navegador. |
| HTTP | Los controllers que requieren el borde HTTP reutilizan `createControllerTestApp` y Supertest con servicios simulados; no levantan el servidor completo ni abren un puerto. |
| Red y servicios externos | No son precondición de la suite. Requests, plugins y dependencias externas se reemplazan por dobles controlados. |

Para reproducir el ambiente se ejecuta `npm ci` con una versión admitida de Node.js y,
desde la raíz del repositorio, `npm run test:unit`. La evidencia de una entrega registra
versión de Node.js y Vitest, sistema operativo, revisión, conteos, duración y cualquier
desviación del ambiente anterior.

## Estrategia y técnicas aplicadas

| Estrategia | Técnica | Aplicación en los casos |
| --- | --- | --- |
| Aislamiento de unidad | Mocks, spies, stubs y funciones inyectadas | Sustituir Prisma, servicios, requests y plugins; verificar retorno, error, argumentos y ausencia de efectos no permitidos. |
| Partición de equivalencia | Casos válidos, inválidos, ausentes y de estado | Separar caminos aceptados y rechazados en DTO, validadores, permisos, controllers y reglas de interfaz. |
| Análisis de valores frontera | Cero, negativos, máximos, precisión decimal y colecciones vacías | Probar cantidades, costos, existencias, retornos y campos obligatorios en sus límites. |
| Tablas de decisión | `it.each` y matrices de rol, departamento, estado o contexto | Verificar combinaciones sin duplicar preparación y mantener visible el resultado esperado de cada fila. |
| Transición de estado | Estado inicial, acción y estado permitido o rechazado | Cubrir edición, cancelación, entrega, devolución y controles habilitados según el estado documental. |
| Prueba de interacción | Verificación de colaboraciones observables | Confirmar DTO, status/body, callback, payload o transacción sin fijar detalles privados de implementación. |
| Prueba negativa y de fallo | Rechazos, excepciones y rollback forzado | Comprobar propagación del error y que no continúen escrituras, eventos o callbacks después del fallo. |

## Grupos, archivos y casos de la suite

La columna **Casos observados** resume los comportamientos cubiertos por todos los
archivos indicados en cada fila. Las rutas terminadas en `*Test.js` representan cada
archivo coincidente dentro de esa carpeta; no incluyen subcarpetas distintas de las que se
declaran expresamente.

| Referencia y unidad | Archivos | Casos observados | Estrategia y técnica aplicada |
| --- | --- | --- | --- |
| `SU-UNIT-001-G01` Permisos | `tests/unit/constants/permissionsTest.js` (1) | Acceso permitido y denegado por combinación de rol y departamento. | Tabla de decisión; particiones positivas y negativas. |
| `SU-UNIT-001-G02` Controllers de almacén | `tests/unit/controllers/api/warehouse/*Test.js` (8) | Recepciones, salidas, materiales, mermas, reportes, registro y eventos posteriores; respuestas exitosas, validaciones, inexistencia y fallos de colaboradores. | Harness HTTP o invocación aislada, servicios simulados, spies y pruebas negativas/de interacción. |
| `SU-UNIT-001-G03` DTO | `tests/unit/dtos/*Test.js` (2) | Normalización y conservación de datos de recepción y merma, incluidos valores opcionales y decimales. | Partición de equivalencia y valores frontera sobre funciones puras. |
| `SU-UNIT-001-G04` Inventario y transacción | `tests/unit/helpers/rollbackTransactionTest.js`, `tests/unit/inventory/*Test.js` y `tests/unit/warehouse/goodsReceiptHelpersTest.js` (4) | Commit/rollback controlado, movimientos, cálculo y validación de existencias, y transformaciones de detalles de recepción. | Dobles del cliente transaccional, fronteras numéricas y prueba negativa de fallo. |
| `SU-UNIT-001-G05` Aplicaciones cliente | `tests/unit/public/js/application/**/*Test.js` (7) | Fábricas CRUD y reportes, configuraciones de catálogos/contextos, materiales y salidas; payloads, callbacks, reutilización y errores. | Inyección de configuración y requests simulados; interacción y tablas de contexto. |
| `SU-UNIT-001-G06` Constantes cliente | `tests/unit/public/js/constants/*Test.js` (2) | Mensajes de recepción y selectores públicos esperados por consumidores. | Prueba de contrato exportado y particiones por mensaje/contexto. |
| `SU-UNIT-001-G07` Páginas cliente | `tests/unit/public/js/pages/**/*Test.js` (2) | Edición de detalles de recepción y ciclo del modal de merma. | Stubs mínimos del DOM, eventos/callbacks observables y transiciones de modo. |
| `SU-UNIT-001-G08` DataTable | `tests/unit/public/js/plugins/datatable/**/*Test.js` (10) | Acciones, operaciones, filtros, dependencias, estado, inventario, columnas/encabezados/reglas de detalles y filas de material. | Datos tabulados, callbacks simulados y transformaciones puras; casos vacíos, activos y editables. |
| `SU-UNIT-001-G09` Plugins de fecha, MDB y Select2 | `tests/unit/public/js/plugins/flatpickr/*Test.js`, `tests/unit/public/js/plugins/mdb/*Test.js` y `tests/unit/public/js/plugins/select2/**/*Test.js` (6) | Inicialización y reutilización de instancias, selección de merma/material y sincronización de valores. | Dobles de plugin, `window`/`document` controlados, spies y equivalencias con/sin selección. |
| `SU-UNIT-001-G10` Interfaz cliente | `tests/unit/public/js/ui/**/*Test.js` (5) | Estado de formularios, totales, modal/selector de inventario y permisos de edición de salidas según estado. | Stubs del DOM, tablas de estado y verificación de propiedades/callbacks observables. |
| `SU-UNIT-001-G11` Utilidades y validadores cliente | `tests/unit/public/js/utils/**/*Test.js` (5) | Colecciones de detalles, operaciones DOM y validaciones de recepción, material y merma. | Funciones puras o DOM mínimo; equivalencias, fronteras y entradas ausentes. |
| `SU-UNIT-001-G12` Rutas | `tests/unit/routes/api/warehouse/*Test.js` y `tests/unit/routes/web/warehouse/*Test.js` (3) | Orden de middleware, autorización y enlace de controllers para merma y salida de merma. | Router aislado, spies y decisiones de acceso positivas/negativas. |
| `SU-UNIT-001-G13` Servicios | `tests/unit/services/**/*Test.js` (9) | Identidad y consulta de movimientos, factura de recepción, relación proveedor-material, reportes, listado/material/snapshot de merma. | Prisma y colaboradores simulados; fronteras, errores, argumentos y ausencia de colaboración inválida. |
| `SU-UNIT-001-G14` Utilidades de servidor | `tests/unit/utils/*Test.js` (4) | Formato, exportación Excel, query/paginación e identidad canónica del inventario. | Funciones puras, tablas de entrada, colecciones vacías y valores frontera. |
| `SU-UNIT-001-G15` Validadores de servidor | `tests/unit/validators/*Test.js` (3) | Precisión decimal, cantidad de devolución y obligatoriedad de campos. | Clases de equivalencia y análisis de límites con casos aceptados y rechazados. |

La suite contiene **70 archivos de prueba**. El número de casos puede cambiar cuando se
amplían tablas parametrizadas; el conteo efectivo y su estado se toman siempre de la
ejecución de Vitest registrada, no de una suma manual de llamadas a `it`.
