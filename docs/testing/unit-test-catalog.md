# Ambiente, estrategia y catálogo de pruebas unitarias

## Alcance del catálogo

Este documento identifica la suite que ejecuta `npm run test:unit` y explica la
estrategia, la técnica y el resultado observable de sus casos. Los nombres concretos de
los casos permanecen en `describe`/`it` como evidencia ejecutable; este catálogo permite
revisar fuera del código qué se comprueba y cómo se aísla.

El inventario corresponde a la revisión indicada en el
[registro de resultados](unit-test-results.md). Cuando se agrega, elimina o reclasifica
un archivo de prueba, se actualizan conjuntamente este catálogo y ese registro.

La revisión de valor retiró 39 archivos dedicados exclusivamente a aplicaciones con
requests simulados, constantes/selectores, entrypoints/páginas, DataTable y otros
plugins, DOM y componentes UI. Se conservan cuatro pruebas frontend de colecciones y
validaciones porque comprueban reglas y fronteras de datos. La reducción no cambia el
código de aplicación; concentra la suite en contratos con resultado funcional o técnico
estable.

## Ficha de la suite unitaria

La referencia estable de la ejecución completa es **`SU-UNIT-001` — Suite unitaria de
Nexus**. El término *suite* designa aquí el conjunto seleccionado por Vitest; cada
`*Test.js` es un archivo de prueba y cada `it` o fila materializada por `it.each` es un
caso. Esta distinción evita presentar cada uno de los 60 archivos como una ejecución
independiente.

| Campo | Definición de `SU-UNIT-001` |
| --- | --- |
| Objetivo | Detectar regresiones en reglas, transformaciones, decisiones, contratos entre capas y efectos observables que pueden aislarse de infraestructura real. |
| Elemento bajo prueba | Módulos de servidor y validadores frontend localizados por los 60 archivos de prueba inventariados en este documento. |
| Orquestador | Script `test:unit` de `package.json`, con selección y exclusiones definidas en `vitestConfig.js`. |
| Precondiciones | Dependencias instaladas mediante `npm ci`, runtime admitido y ejecución desde la raíz. No requiere servidor, navegador, Redis ni PostgreSQL activos. |
| Preparación | Cada archivo construye fixtures y dobles locales; los hooks `beforeEach`/`afterEach` restablecen mocks o globals cuando corresponde. |
| Ejecución | Vitest importa los archivos seleccionados, materializa los casos parametrizados y ejecuta los archivos con el aislamiento propio del runner. |
| Criterio de aprobación | Todos los archivos y casos descubiertos terminan aprobados, ninguno queda fallido y no existe un error del runner. Una advertencia o desviación ambiental se conserva en el registro y se resuelve antes de usar la corrida como validación del runtime admitido. |
| Criterio de bloqueo | Fallo al instalar/importar, runtime no disponible o dependencia ambiental inesperada que impida ejecutar los casos; se informa como bloqueado, no como aprobado. |
| Resultado producido | Resumen de archivos/casos aprobados, fallidos u omitidos, duración y código de salida. La última evidencia se conserva en el [registro de resultados unitarios](unit-test-results.md). |
| Fuera de alcance | Persistencia real, migraciones, contrato HTTP con servicios reales, renderizado en navegador y pruebas manuales; corresponden a integración, esquema o validación manual. |

La suite completa se referencia por `SU-UNIT-001` en resultados y solicitudes de
cambio. Los grupos `SU-UNIT-001-G01` a `SU-UNIT-001-G10` permiten indicar qué parte se
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
| Interfaz web | Sólo se conservan funciones puras de colecciones y validación; no se simulan DOM, plugins ni renderizado. |
| HTTP | Los controllers que requieren el borde HTTP reutilizan `createControllerTestApp` y Supertest con servicios simulados; no levantan el servidor completo ni abren un puerto. |
| Red y servicios externos | No son precondición de la suite. Las dependencias externas se reemplazan por dobles controlados. |

Para reproducir el ambiente se ejecuta `npm ci` con una versión admitida de Node.js y,
desde la raíz del repositorio, `npm run test:unit`. La evidencia de una entrega registra
versión de Node.js y Vitest, sistema operativo, revisión, conteos, duración y cualquier
desviación del ambiente anterior.

## Estrategia y técnicas aplicadas

| Estrategia | Técnica | Aplicación en los casos |
| --- | --- | --- |
| Aislamiento de unidad | Mocks, spies, stubs y funciones inyectadas | Sustituir Prisma, servicios y dependencias; verificar retorno, error, argumentos y ausencia de efectos no permitidos. |
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
| `SU-UNIT-001-G03` DTO | `tests/unit/dtos/*Test.js` (3) | Normalización y conservación de datos de recepción y merma, incluidos valores opcionales y decimales. | Partición de equivalencia y valores frontera sobre funciones puras. |
| `SU-UNIT-001-G04` Inventario y transacción | `tests/unit/helpers/rollbackTransactionTest.js`, `tests/unit/inventory/*Test.js` y `tests/unit/warehouse/goodsReceiptHelpersTest.js` (4) | Commit/rollback controlado, movimientos, cálculo y validación de existencias, y transformaciones de detalles de recepción. | Dobles del cliente transaccional, fronteras numéricas y prueba negativa de fallo. |
| `SU-UNIT-001-G05` Utilidades y validadores cliente | `tests/unit/public/js/utils/**/*Test.js` (4) | Colecciones de detalles y validaciones de recepción, material y merma. | Funciones puras; equivalencias, fronteras y entradas ausentes. |
| `SU-UNIT-001-G06` Rutas | `tests/unit/routes/**/*Test.js` (6) | Orden de middleware, autorización y enlace de controllers para personas, clientes, merma y salida de merma. | Router aislado, spies y decisiones de acceso positivas/negativas. |
| `SU-UNIT-001-G07` Servicios | `tests/unit/services/**/*Test.js` (12) | Identidad y consulta de movimientos, detalles de salidas, factura de recepción, relación proveedor-material, reportes, listado/material/snapshot de merma. | Prisma y colaboradores simulados; fronteras, errores, argumentos y ausencia de colaboración inválida. |
| `SU-UNIT-001-G08` Utilidades de servidor | `tests/unit/utils/*Test.js` (5) | Formato, exportación Excel, query/paginación, relaciones de selección e identidad canónica del inventario. | Funciones puras, tablas de entrada, colecciones vacías y valores frontera. |
| `SU-UNIT-001-G09` Validadores de servidor | `tests/unit/validators/*Test.js` (6) | Precisión decimal, detalles de compra, cantidad de devolución y obligatoriedad de campos. | Clases de equivalencia y análisis de límites con casos aceptados y rechazados. |
| `SU-UNIT-001-G10` Scripts documentales | `tests/unit/scripts/*Test.js` (11) | Formatos y salida de exportación, imágenes, Mermaid, PDF e inventario/recuperación de capturas. | Funciones aisladas, fixtures temporales, equivalencias de argumentos y pruebas negativas de herramientas ausentes. |

La suite contiene **60 archivos de prueba**. El número de casos puede cambiar cuando se
amplían tablas parametrizadas; el conteo efectivo y su estado se toman siempre de la
ejecución de Vitest registrada, no de una suma manual de llamadas a `it`.

## Aplicación del formato documental a los casos vigentes

Los grupos anteriores constituyen los registros de diseño de la suite. Para hacer
explícita su correspondencia con el formato del [plan de pruebas](test-plan.md), cada
grupo recibe un ID `DP-UNIT-GNN`; sus casos son los `it` y las filas de `it.each` de los
archivos indicados, identificados documentalmente como `CP-UNIT-GNN-*`. El asterisco no
es un caso genérico: remite al nombre completo que Vitest materializa como evidencia
ejecutable y evita mantener una segunda copia de los 281 nombres.

Todos los casos comparten las precondiciones, el ambiente y la limpieza de la ficha
`SU-UNIT-001`. La siguiente tabla agrega los datos variables y el resultado esperado de
cada diseño. Si un caso deja de corresponder a esta fila, se actualiza el grupo o se crea
otro antes de registrar su ejecución.

| Diseño / casos | Condición que se debe probar | Datos de prueba vigentes | Resultado esperado del grupo |
| --- | --- | --- | --- |
| `DP-UNIT-G01` / `CP-UNIT-G01-*` | Decisión de acceso por rol, departamento y operación. | Combinaciones tabuladas de administrador, almacén y asesor; permisos CRUD de salidas. | Cada combinación devuelve exactamente permitido o denegado y un asesor no obtiene acceso operativo. |
| `DP-UNIT-G02` / `CP-UNIT-G02-*` | Contrato HTTP aislado de controllers de almacén en caminos exitosos, límites y fallos. | Requests con filtros, DTO válidos o manipulados, valores máximos, IDs existentes/inexistentes y errores de servicios simulados. | Status/body y argumentos enviados al servicio coinciden con el contrato; campos no permitidos se descartan y los efectos posteriores sólo ocurren tras el éxito. |
| `DP-UNIT-G03` / `CP-UNIT-G03-*` | Normalización y conservación de identidad en DTO de entradas y mermas. | Facturas con variantes de formato, nombres, IDs, detalles repetidos, opcionales y decimales. | El DTO produce el payload normalizado esperado sin fusionar ni perder identidades o partidas válidas. |
| `DP-UNIT-G04` / `CP-UNIT-G04-*` | Cálculo de stock/movimientos y frontera transaccional ante éxito o error. | Cantidades con/sin dimensiones, cero, decimales, stock suficiente/insuficiente y callbacks que resuelven o lanzan error. | Cálculos y agrupaciones conservan los detalles; la transacción revierte siempre y propaga el error original cuando corresponde. |
| `DP-UNIT-G05` / `CP-UNIT-G05-*` | Colecciones y validaciones de entradas, materiales y mermas. | Colecciones vacías o repetidas, IDs de cliente/documento, campos ausentes/válidos y valores de frontera. | Se agrega, sustituye o elimina el renglón correcto sin afectar otros; los validadores devuelven la configuración o error esperado. |
| `DP-UNIT-G06` / `CP-UNIT-G06-*` | Orden de middleware, autorización y enlace de handlers en rutas de merma. | Requests por rol/departamento y spies de middleware/controller para rutas API y web. | El acceso autorizado alcanza el handler en el orden previsto y el no autorizado se rechaza antes del controller. |
| `DP-UNIT-G07` / `CP-UNIT-G07-*` | Reglas y consultas de servicios con persistencia sustituida. | Identidades completas/incompletas, filtros, snapshots, relaciones, facturas duplicadas/no duplicadas y errores Prisma simulados. | Retorno y argumentos Prisma respetan filtros y relaciones; entradas inválidas o fallos no disparan colaboraciones posteriores. |
| `DP-UNIT-G08` / `CP-UNIT-G08-*` | Transformación compartida de formatos, Excel, queries e identidad de inventario. | Mes válido/inválido o bisiesto, paginación negativa, rangos, fórmulas, relaciones serializadas y colecciones vacías. | Fechas, filtros, filas, fórmulas y representación canónica coinciden con el contrato y usan defaults seguros. |
| `DP-UNIT-G09` / `CP-UNIT-G09-*` | Clases de equivalencia y fronteras de validadores del servidor. | Campo ausente/nulo/válido, cantidad positiva/no positiva y decimales dentro/fuera de precisión. | Cada valor válido se acepta; cada clase inválida devuelve el código correspondiente sin aceptar datos fuera del límite. |
| `DP-UNIT-G10` / `CP-UNIT-G10-*` | Contratos de los scripts de publicación y capturas documentales. | Formatos solicitados, archivos temporales, imágenes válidas/inválidas, disponibilidad de convertidores y estados de recuperación. | Cada helper produce el plan o recurso esperado y rechaza argumentos, geometrías o herramientas no válidas sin ocultar el fallo. |

La acción reproducible de cada `CP-UNIT-*` es la invocación descrita por su nombre
`it`; el detalle de fixtures permanece junto a esa invocación. El registro de ejecución
vigente es `SU-UNIT-001` en el [registro de resultados unitarios](unit-test-results.md),
que conserva revisión, ambiente, fecha, conteos, resultado real y observaciones.

## Diagrama de identificación de lo probado

Sí se justifica un diagrama para esta suite porque permite localizar rápidamente las
familias de comportamiento y sus fronteras. No representa pasos de ejecución ni sustituye
los datos y resultados esperados de la tabla anterior. Cada nodo terminal referencia un
diseño vigente; por tanto, un área sin nodo se considera fuera del alcance unitario hasta
que se incorpore y catalogue una prueba.

```mermaid
flowchart TB
    SU[SU-UNIT-001<br/>Suite unitaria]
    SU --> BE[Servidor]
    SU --> CT[Contratos transversales]

    BE --> G02[G02 Controllers HTTP]
    BE --> G03[G03 DTO]
    BE --> G04[G04 Inventario y transacción]
    BE --> G06[G06 Rutas]
    BE --> G07[G07 Servicios]
    BE --> G08[G08 Utilidades]
    BE --> G09[G09 Validadores]


    CT --> G01[G01 Permisos]
    CT --> G05[G05 Validadores cliente]
    CT --> G10[G10 Scripts documentales]
```

**Propósito:** identificar qué debe comprobar la suite y ubicar su ficha de diseño.
**Alcance:** los 10 grupos y 60 archivos seleccionados por `vitestConfig.js`.
**Fuente:** tabla de grupos, archivos `tests/unit/**/*Test.js` y configuración de
Vitest. **Límite:** muestra cobertura estructural documentada, no porcentaje de código,
persistencia real, navegador real ni integración entre capas.
