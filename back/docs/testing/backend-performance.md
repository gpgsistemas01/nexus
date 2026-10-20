# Medición de rendimiento del backend

Ejecuta estos comandos desde `back/` (`cd back` desde la raíz del repositorio);
las rutas de scripts y resultados son relativas a esa carpeta.

Este procedimiento complementa las pruebas funcionales. Mide rutas API reales con
cookies, JWT, permisos vigentes, validadores, servicios, Prisma, serialización y
auditoría posterior a la respuesta. No carga vistas ni simula la red de producción.
El harness utiliza el manejo de errores de integración; el cliente HTTP y el servidor
se ejecutan en el mismo proceso, por lo que CPU y retardo del event loop incluyen ambos.

## Preparación y ejecución

Usar exclusivamente una base desechable cuyo nombre termine en `_performance_test`,
con `DATABASE_TEST_URL` y `DIRECT_TEST_URL` apuntando a ella y distintos de la base de
desarrollo. `npm run test:performance` valida el entorno, aplica migraciones y genera
el cliente antes de medir. No se debe ejecutar simultáneamente con otras pruebas
contra esa misma base. Las fixtures se identifican por sus claves y se limpian al final;
los estados y el rol de sistema necesarios para las pruebas pueden permanecer.

```sh
BENCHMARK_RECORDS=2000 BENCHMARK_SAMPLES=20 BENCHMARK_CONCURRENCY=4 npm run test:performance
```

El comando escribe JSON por escenario en stdout. Se puede redirigir a `work/` o al
artefacto de CI. `BENCHMARK_LABEL` identifica la revisión; `BENCHMARK_SCENARIO` filtra
por nombre. `BENCHMARK_PLAN_FILE` habilita el archivo de planes SQL: sólo ejecuta
`EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)` sobre lecturas ya observadas con parámetros
de las fixtures. No repite las escrituras para obtener sus planes.

El volumen permitido es de 200 a 20.000 materiales y otras tantas mermas; se divide
entre materiales y consumibles. Hay documentos con varios detalles, movimientos y
una compra con la mitad de ese número de partidas. El surtido usa 100 detalles y
comprueba los saldos persistidos después de medir. Cada escenario descarta tres
peticiones de calentamiento y registra entre 5 y 200 muestras, con concurrencia de 1
a 32 peticiones. Son límites del benchmark, no límites funcionales de la API.

## Interpretación

| Dato | Qué representa |
| --- | --- |
| `p50Ms`, `p95Ms` | Percentiles de latencia HTTP observada en las muestras, sin preparación de fixtures. |
| `queries` | Media de sentencias por petición: total del escenario dividido entre muestras, incluida la auditoría. Se cuenta globalmente porque Prisma puede agrupar consultas entre solicitudes concurrentes. Una llamada Prisma puede generar varias sentencias. |
| `databaseMeanMs` | Suma de duraciones del driver dividida entre muestras. Incluye red y cola de la conexión; operaciones concurrentes pueden solaparse y superar el tiempo HTTP. No es tiempo exclusivo del motor SQL. |
| `poolWaitP95Ms` | Percentil de las esperas individuales para obtener una conexión. |
| `cpuMs`, `eventLoopP95Ms` | CPU del proceso y retardo del event loop durante el escenario, incluidos calentamiento y cliente de prueba. |
| `bytes` | Tamaño de la respuesta; permite identificar documentos y exportaciones voluminosos. |

Para comparar revisiones se conservan volumen, muestras, concurrencia, runtime y
servicios; se ejecutan por separado. Veinte muestras orientan la revisión, pero no
establecen por sí solas un SLA. El objetivo solicitado de responder antes de cinco
segundos debe comprobarse también con latencia de red, carga y tamaños de documento
representativos del despliegue.

## Consultas y bucles revisados

| Área | Decisión y motivo |
| --- | --- |
| Listados de administración, ventas y almacén | `paginationRepository.findPage` ejecuta filas y conteos independientes conjuntamente; comparte el conteo cuando filtro y alcance coinciden. Conserva el total distinto del filtrado cuando corresponde. |
| Consultas transaccionales | `materialHelpers` espera sus lecturas en orden. `lib/queuedPrismaPg.js` comparte una cola entre `queryRaw` y `executeRaw` de cada transacción; evita que la carga interna de relaciones de Prisma envíe consultas simultáneas a su conexión. El pool y las demás transacciones conservan su concurrencia. |
| Exportaciones | Omiten conteos que no consumen. Usan un escritor XLSX progresivo sobre un temporal privado. Inventario lee por cursor en bloques de 5.000; los demás conservan sus consultas actuales. |
| Stock de materiales y mermas | Agrupa los cambios por identidad y ejecuta una actualización parametrizada por lote. El repositorio bloquea filas en orden común, aplica la condición de saldo y devuelve los saldos de la escritura. Cualquier fila ausente provoca rollback desde el servicio. |
| Preparación del movimiento | Valida relaciones mientras agrupa cantidades. Tras recibir saldos, recorre los detalles originales para construir su historial; esta segunda etapa depende del resultado de la escritura. |
| Cumplimiento de salidas | Resuelve completo, parcial o pendiente con un recorrido y termina cuando el resultado parcial ya está determinado. |
| Filas de reportes | Filtra y construye filas sin arrays intermedios por documento; formatea una fecha por encabezado y reutiliza `Intl.DateTimeFormat`. El resumen de merma normaliza cada grupo y acumula sus totales en la misma etapa. |
| Resumen mensual | Acumula el importe mensual junto con las agrupaciones. Los porcentajes se calculan después, porque requieren conocer el total de todas las filas. |
| Selector de material para merma | Construye objetos de respuesta sólo para la página solicitada. Conserva el recorrido global necesario para la identidad de familia, costo máximo y conteo de plantillas. |
| Permisos, pesos y reintentos | Sus recorridos pequeños o acotados conservan las reglas vigentes; no se cachean permisos entre peticiones ni se retiran validaciones transaccionales. |

Los bucles por documento y sus detalles procesan cada detalle una vez: su costo es
lineal respecto del número total de detalles. Las etapas de agrupar, escribir y
construir historial tienen dependencias distintas; fusionarlas no debe volver a
consultar la base por cada elemento ni alterar el orden del historial.

## Límites que siguen necesitando diseño o carga representativa

- El selector de plantillas aún lee la familia completa antes de paginar. Llevar esa
  agrupación a SQL exige conservar las reglas de identidad y costo máximo.
- Los listados de documentos incluyen detalles para el contrato actual del navegador.
  Una compra grande genera una respuesta grande; cargar el detalle al abrir el modal
  requiere modificar ese contrato y su consumidor.
- Las exportaciones consultan hasta 100.000 documentos o movimientos. El escritor libera las
  filas conforme las confirma, pero los reportes distintos de inventario todavía
  consultan y preparan sus filas completas. La generación de XML sigue usando CPU
  del hilo principal, con pausas periódicas para permitir I/O; no equivale a un worker.
  Los temporales requieren espacio escribible en el directorio temporal del sistema.
  No se truncan resultados ni se cambia el contrato
  del listado para reducir el volumen sin adaptar también su consumidor.
- Los índices se evalúan con planes y cardinalidades representativas. Una búsqueda
  `contains`/`ILIKE '%texto%'` no se acelera por añadir cualquier índice B-tree.
- El timeout del navegador y el timeout transaccional no constituyen una medición del
  tiempo del endpoint. Pool, bloqueos y red forman parte del presupuesto de respuesta.

`pinoHttp` ya registra `responseTime` con `LOG_LEVEL=info`; el nivel predeterminado
`warn` no conserva las peticiones exitosas. Ese dato permite contrastar el despliegue
con el benchmark sin registrar cuerpos, parámetros SQL ni credenciales.

Los resultados de cada ejecución se conservan como evidencia de la entrega, no como
valores permanentes de este documento. El perfilador sólo se carga desde el benchmark
y no cambia el cliente Prisma ni el logging de producción.

## Generación de Excel y carga mixta de Node.js

El generador compartido `utils/reportExcelUtils.js` usa
[`ExcelJS.stream.xlsx.WorkbookWriter`](https://github.com/exceljs/exceljs#streaming-xlsx).
Admite arrays o iterables asíncronos, confirma cada fila y evita construir un buffer
completo del XLSX. Deshabilita la tabla global de cadenas compartidas y usa compresión
ZIP de nivel 1; por ello el tamaño del archivo también forma parte de la comparación.
Las fórmulas se construyen con `createFormulaCell`, que entrega la expresión y su
resultado calculado; se comprueban también resultados cero y decimales.

El archivo se escribe en un directorio temporal único y se descarga sólo cuando su
construcción termina. Esto mantiene las respuestas JSON y sus códigos cuando falla
una consulta, incluso después de haber preparado algunas filas. Se limpia el archivo
al terminar la transferencia, al fallar o al cancelar el cliente; la cancelación
interrumpe el consumo del iterable y evita pedir bloques nuevos. Una consulta Prisma
ya enviada puede terminar; no se afirma que la cancelación HTTP aborte el SQL activo.
Los fallos tras comenzar la transferencia se delegan al manejo HTTP para cerrar la
conexión, sin intentar añadir JSON al archivo. El temporal no es una cola persistente:
una terminación forzada del proceso puede impedir su limpieza normal.

El despliegue de Compose usa `/tmp` como tmpfs de 64 MB. El espacio de los temporales
se carga a ese recurso y puede contabilizarse como memoria del contenedor aunque no
aparezca en el RSS del proceso. La compresión reduce su tamaño, pero no elimina el
límite: hay que comprobar espacio y concurrencia con los archivos reales. No se añade
un límite arbitrario de filas ni se cambia la configuración de despliegue en esta prueba.

Se cede el event loop cada 250 filas y se espera al drenaje del destino cuando está
saturado. La generación sigue usando el hilo principal; estas pausas no ejecutan el
cálculo en paralelo. No se incorpora un pool de workers. Los controladores conservan
las columnas y permisos existentes. Inventario, compras, salidas, movimientos,
proveedores, usuarios, personas y clientes se consultan por bloques. SheetJS queda como lector independiente para verificar los archivos en
las pruebas, sin formar parte de las dependencias de producción.

`findWarehouseReportRows` entrega un iterable asíncrono y reutiliza `findBatches` del
repositorio de paginación. Consulta como máximo 5.000 relaciones material–proveedor por
bloque, selecciona el id interno necesario para avanzar y conserva el campo de orden
solicitado con id como desempate. No hace conteos ni crea otra conexión o cliente
Prisma. Las pruebas con más de un bloque verifican nombres repetidos, orden ascendente
y descendente, filtros y ausencia de modificaciones al inventario. Las lecturas no
abren una transacción larga: son consultas operativas sucesivas y no garantizan una
instantánea común si los datos cambian entre bloques. El tamaño de bloque reduce
los viajes respecto a bloques pequeños, pero las relaciones de Prisma generan varias
sentencias por bloque: hay que medir ese costo frente a la consulta completa anterior.

La alternativa anterior con workers reutilizados también se midió, pero su mayor RSS
no justificó incorporarla. El escritor progresivo debe compararse con el generador
anterior sobre el mismo volumen y carga: puede reducir memoria y bloqueo del servidor
a cambio de más consultas, uso temporal de disco y mayor duración de la descarga.

Los errores JSON de las descargas se deserializan en el transporte Axios antes de
normalizarlos, incluso cuando la petición usa `responseType: blob`. Se conserva el
código, el estado y el mensaje existente; una respuesta JSON inválida obtiene un
mensaje seguro manteniendo el estado HTTP original.

```sh
BENCHMARK_RECORDS=10000 BENCHMARK_SAMPLES=16 BENCHMARK_CONCURRENCY=4 npm run test:performance:mixed
```

Este comando reutiliza la base desechable y las fixtures del benchmark anterior.
El servidor carga las rutas registradas, JWT, permisos, validadores y logger; las
solicitudes son GET y no generan auditoría de escrituras. El cliente HTTP se ejecuta
en otro proceso y descarta los cuerpos recibidos después de contar bytes. Se prueban
consultas solas y descargas secuenciales de inventario mientras los demás clientes
consultan inventario continuamente. La concurrencia incluye un cliente de reportes;
los resultados indican cuántas consultas terminaron durante las descargas. Este
modelo mantiene clientes activos, por lo que una revisión más rápida puede atender
más consultas; no representa una tasa fija de llegada.

El tercer escenario, `fixed-mixed-excel`, mantiene la misma cantidad de descargas y
fija tres consultas por ronda y cliente de inventario. Permite comparar el mismo
trabajo total: los clientes terminan al completar sus consultas, aunque las descargas
continúen. No exige que las dos clases de tráfico terminen al mismo tiempo.
Para comparar memoria sin el historial de los escenarios anteriores, ejecútalo solo
con `BENCHMARK_SCENARIO=fixed-mixed-excel`, en un proceso nuevo para cada revisión.

Cada escenario descarta tres rondas de calentamiento. El volumen admite 200–20.000
materiales y otras tantas mermas, 5–50 rondas y 2–8 clientes. Registra p50/p95 HTTP,
bytes, CPU, retardo y utilización del event loop mediante `node:perf_hooks`, además
de máximos de memoria muestreados cada 20 ms. RSS y CPU pertenecen al proceso servidor;
si se prueba un pool, incluyen sus threads, mientras que heap corresponde sólo al hilo
principal. El muestreo no garantiza capturar el pico absoluto, especialmente durante
bloqueos, y las fixtures también dejan memoria en el proceso. El cliente queda fuera
de estas métricas. Compara revisiones por separado, con el mismo runtime, volumen,
rondas y concurrencia; conserva también tiempos de descarga, consultas completadas y
memoria para no atribuir toda diferencia al costo del XLSX. Una reducción de memoria de las filas no implica por sí sola una reducción equivalente
del RSS de todo el proceso.

## Compatibilidad de consultas transaccionales con pg

`pg` avisa que dejar consultas en espera sobre un mismo cliente dejará de estar
admitido en su siguiente versión mayor. Puede aparecer incluso usando `await` en el
servicio: Prisma 7 carga relaciones hermanas en paralelo dentro de su intérprete.
El caso se sigue en [Prisma #29407](https://github.com/prisma/orm/issues/29407) y la
[propuesta #29979](https://github.com/prisma/orm/pull/29979).

`QueuedPrismaPg` mantiene la configuración y el cliente compartido existentes y
adapta los métodos públicos del objeto devuelto por `startTransaction`. La cola es
local a la transacción, abarca lecturas y escrituras y avanza también tras un rechazo;
el error original llega a Prisma, que conserva la responsabilidad del rollback.
No se añade una consulta, no se cambia el esquema ni se editan dependencias instaladas.
Los métodos del pool y las consultas de otras transacciones no pasan por esa cola.
La adaptación se revisa al actualizar Prisma para retirarla cuando la biblioteca
resuelva la serialización por conexión; no constituye una garantía de compatibilidad
con todas las interfaces de una versión futura de `pg`.

La verificación combina orden de lectura/escritura, propagación de errores,
independencia de transacciones y concurrencia del pool, junto con integración HTTP
que comprueba altas, rollback y operaciones concurrentes reales. Se usa
`NODE_OPTIONS=--trace-deprecation` durante la integración para identificar y comprobar
la ausencia del aviso; no se desactivan las advertencias del proceso.

## Escenarios después de las correcciones de concurrencia

La fixture de plantillas debe usar unidad m² y materiales con dimensiones; el benchmark
rechaza un resultado vacío. No se presenta como mejora una medición que excluya todos
los candidatos por unidad. Comparar cabeceras de compras/salidas por bytes y consultas;
el detalle se mide mediante su GET por id. Las exportaciones recorren lotes sin el
límite anterior de 100 000 filas y producen filas progresivamente, con acumuladores
para los resúmenes. Para grandes documentos, un lote de cabeceras todavía incluye todos
los detalles de cada documento; no garantiza memoria constante respecto al tamaño del
mayor documento ni al número de grupos de resumen.

Conservar percentiles, volumen elegible, concurrencia, SQL y event loop junto con el
commit y ambiente. Las corridas locales no certifican un máximo de cinco segundos
para Supabase en producción. Los recibos de idempotencia añaden consultas a escrituras
nuevas para evitar duplicados; los reintentos confirmados sólo consultan el recibo.

## Lectura progresiva y validación de entradas

`cursor` conserva el ID de la última fila leída; el siguiente bloque omite esa fila
con `skip: 1`. Se mantiene el orden solicitado y el ID como desempate. El tamaño de
consulta está en `QUERY_BATCH_SIZES`; es independiente de la página de DataTables.
`function*` transforma filas bajo demanda y `async function*` espera cada bloque antes
de entregarlo al escritor. Esos generadores evitan construir un segundo array completo;
no crean threads ni sustituyen los filtros de SQL. Los resúmenes conservan acumuladores.

Las exportaciones de usuarios, personas y clientes también reutilizan sus consultas
de dominio sin conteos. La integración atraviesa el límite con 5.001 registros por
recurso y comprueba orden, contenido y encabezados sin versiones técnicas.

Las validaciones de UUID, cantidades y pesos son locales y no consultan la base. En
merma se conservan las comprobaciones de presentación, cálculo y estado que requieren
la oferta vigente, dentro de su servicio. Las pequeñas listas de campos no justifican
retirar reglas de integridad; su costo se distingue del número y tiempo de consultas.
El alta/entrada deja de recargar el movimiento desde `WasteStockEntry.create`: el
servicio ya lo obtuvo al aplicar el movimiento y el consumidor no requiere esa relación.
La lectura final de merma sí conserva saldos y versión resultantes para la respuesta.
