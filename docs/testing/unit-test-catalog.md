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
`SU-UNIT-001`. Los datos y resultados se registran a continuación con el formato propio
de cada técnica: una tabla de decisión necesita combinaciones y decisiones; una frontera
necesita el límite y sus valores vecinos; una transición necesita estado inicial, evento
y estado final; una prueba de interacción o fallo necesita colaboradores observados y
efectos permitidos o prohibidos. Un diseño puede aparecer en más de una tabla cuando
combina técnicas. Si un caso deja de corresponder a estas filas, se actualiza el diseño
o se crea otro antes de registrar su ejecución.

### Tablas de decisión y particiones de equivalencia

| Diseño / casos | Regla o partición | Datos representativos registrados | Resultado esperado |
| --- | --- | --- | --- |
| `DP-UNIT-G01` / `CP-UNIT-G01-*` | Acceso por rol, departamento y operación. | Administrador, almacén y asesor combinados con permisos de consulta, creación, edición y eliminación de salidas. | Cada fila devuelve el booleano de acceso definido; el administrador conserva acceso, almacén recibe sólo las operaciones asignadas y el asesor no obtiene acceso operativo. |
| `DP-UNIT-G03` / `CP-UNIT-G03-*` | DTO válido, incompleto o con identidades repetidas. | Facturas con variantes de formato; nombres e IDs presentes o ausentes; detalles repetidos; opcionales y decimales. | Cada entrada válida produce el payload normalizado esperado; las identidades y partidas distintas no se fusionan ni se pierden. |
| `DP-UNIT-G05` / `CP-UNIT-G05-*` | Colección vacía, elemento nuevo, repetido o sustituido; formulario válido o incompleto. | IDs de cliente/documento, detalles vacíos o repetidos y campos ausentes o informados de entradas, materiales y mermas. | Se agrega, sustituye o elimina sólo el renglón correspondiente; cada formulario devuelve la configuración válida o el error de su partición. |
| `DP-UNIT-G09` / `CP-UNIT-G09-*` | Campo ausente, nulo, válido o inválido. | Cantidades positivas y no positivas, detalles presentes/ausentes y decimales dentro/fuera de la precisión admitida. | La clase válida se acepta y cada clase inválida devuelve su código de validación sin continuar con datos no admitidos. |

### Análisis de valores frontera

| Diseño / casos | Frontera | Valores registrados alrededor del límite | Resultado esperado |
| --- | --- | --- | --- |
| `DP-UNIT-G02` / `CP-UNIT-G02-*` | Máximos admitidos por los controllers de almacén. | Valor máximo válido y valor inmediato fuera del límite, además de IDs existentes e inexistentes. | El máximo válido llega al servicio y conserva el cuerpo esperado; el valor fuera del límite o el ID inexistente devuelve el status/error correspondiente sin efecto posterior. |
| `DP-UNIT-G04` / `CP-UNIT-G04-*` | Cantidad y existencia disponible. | Cero, decimales y cantidades inmediatamente dentro o fuera del stock, con y sin dimensiones. | Los valores admitidos producen el cálculo y movimiento exactos; cero o stock insuficiente se rechazan sin perder ni duplicar detalles. |
| `DP-UNIT-G08` / `CP-UNIT-G08-*` | Fechas, paginación, rangos y colecciones. | Mes válido, inválido y bisiesto; paginación negativa; colección vacía y rangos con extremos. | Se devuelven fechas, filtros, filas y valores por defecto del contrato, sin generar rangos o páginas inválidos. |
| `DP-UNIT-G09` / `CP-UNIT-G09-*` | Signo y precisión decimal. | Cantidad `0`, negativa y positiva; decimal en la precisión máxima y decimal que la excede. | La cantidad positiva y la precisión admitida pasan; cero, negativos y exceso de precisión devuelven el código de error correspondiente. |

### Transiciones de estado

| Diseño / casos | Estado inicial registrado | Acción o evento | Estado o resultado esperado |
| --- | --- | --- | --- |
| `DP-UNIT-G02` / `CP-UNIT-G02-*` | Documento editable, entregado, devuelto o inexistente, según el controller. | Registrar, editar, entregar, devolver o cancelar. | La transición permitida devuelve el status/body previsto y dispara su efecto posterior; la transición no permitida conserva el estado y devuelve el error de dominio. |
| `DP-UNIT-G04` / `CP-UNIT-G04-*` | Existencia suficiente o insuficiente y transacción activa. | Aplicar movimiento o hacer que el callback termine o lance error. | El éxito devuelve el cálculo agrupado; el error revierte la transacción y se propaga sin dejar un resultado parcial. |
| `DP-UNIT-G07` / `CP-UNIT-G07-*` | Factura duplicada/no duplicada, snapshot presente/ausente o identidad completa/incompleta. | Consultar o ejecutar la regla del servicio. | El estado válido devuelve la entidad o consulta esperada; duplicidad, ausencia o identidad inválida produce el error previsto y no inicia colaboraciones posteriores. |

### Interacción, fallos y resultados de colaboradores

| Diseño / casos | Entrada y colaboradores registrados | Interacción o fallo provocado | Resultado esperado y efectos observables |
| --- | --- | --- | --- |
| `DP-UNIT-G02` / `CP-UNIT-G02-*` | Request con filtros o DTO válido/manipulado; servicio y evento simulados. | El servicio resuelve, rechaza o recibe campos no permitidos. | Status/body y argumentos coinciden con el contrato; los campos no permitidos se descartan y el evento posterior sólo ocurre después del éxito. |
| `DP-UNIT-G06` / `CP-UNIT-G06-*` | Request por rol/departamento y spies de middleware y controller en rutas API/web. | Autorizar o rechazar la combinación registrada. | El caso autorizado alcanza el handler en el orden esperado; el rechazado termina antes del controller. |
| `DP-UNIT-G07` / `CP-UNIT-G07-*` | Filtros, identidades, relaciones y snapshots; Prisma y servicios colaboradores simulados. | El colaborador devuelve datos, informa duplicidad o lanza un error Prisma. | Retorno y argumentos respetan filtros/relaciones; un dato inválido o fallo conserva el error y no llama colaboradores posteriores. |
| `DP-UNIT-G10` / `CP-UNIT-G10-*` | Formato solicitado, archivo temporal, imagen válida/inválida y convertidor disponible/ausente. | Generar el recurso o forzar argumento, geometría o herramienta inválida. | El helper devuelve el plan/recurso esperado; la variante inválida rechaza explícitamente y no oculta el fallo. |

La acción reproducible de cada `CP-UNIT-*` es la invocación descrita por su nombre
`it`; el detalle de fixtures permanece junto a esa invocación. El registro de ejecución
vigente es `SU-UNIT-001` en el [registro de resultados unitarios](unit-test-results.md),
que conserva revisión, ambiente, fecha, conteos, resultado real y observaciones.

## Diagrama de identificación de lo probado

Sí se justifica un diagrama para esta suite porque permite localizar rápidamente las
familias de comportamiento y sus fronteras. No representa pasos de ejecución ni sustituye
los datos y resultados esperados de las tablas anteriores. Cada nodo terminal referencia un
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
