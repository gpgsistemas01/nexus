# Plan de pruebas

Los comandos de validación se ejecutan desde `back/` (`cd back` desde la raíz).
Las rutas `tests/`, `src/` y `docs/` son relativas a esa carpeta.

## Datos generales del documento

| Versión documental | Versión del sistema | Estado | Fecha | Responsable |
| --- | --- | --- | --- | --- |
| 1.2 | 1.0.0 | En revisión | 2026-10-20 | Equipo Nexus |

## Objetivo y alcance

Este plan es la fuente de verdad de la estrategia, las técnicas, la ubicación, la
cobertura CRUD mínima y la ejecución de pruebas de Nexus. El
[registro selectivo de casos automatizados](automated-test-case-index.md) conserva las
fichas que necesitan trazabilidad documental por su riesgo, mientras la
[cobertura por caso de uso](use-case-test-types.md) es una vista complementaria de la
evidencia funcional vigente y de sus brechas.

Cada prueba nueva debe identificar el requisito o regla, la operación CRUD y el dato o
efecto observable. No se agrega cobertura sólo para aumentar conteos ni para fijar
detalles de HTML, estilos, selectores, eventos o estructura de archivos.

Nexus usa de forma selectiva ISO/IEC/IEEE 29119-2 para el proceso, 29119-3 para
los artefactos y 29119-4 para las técnicas de diseño, sin declarar conformidad.
Las tablas siguientes son una adaptación local; no se presentan como formularios
literales ni como cumplimiento completo de esas normas. La
[revisión de la suite](suite-review.md) registra las decisiones de conservación,
consolidación y retiro por archivo del inventario revisado.

## Selección por riesgo y mantenimiento

La prioridad considera impacto, probabilidad y defectos observados. Un cambio de stock,
permisos, atomicidad o historia tiene prioridad sobre un detalle de presentación. Los
defectos recientes de piezas, cálculo automático y confirmación de merma justifican
mantener pruebas de estado y payload del formulario además de las reglas del servidor.

Antes de agregar, cambiar o retirar una prueba:

1. Identificar requisito o riesgo, condición observable y resultado que decide si pasa
   (oráculo); enlazar un identificador existente cuando corresponda, sin inventar requisitos.
2. Elegir nivel y técnica; enumerar particiones, fronteras, combinaciones o transiciones
   relevantes. `it.each` y los mocks son mecanismos de automatización.
3. Buscar evidencia equivalente por condición y oráculo. Una fórmula pura, el payload
   enviado y el estado en PostgreSQL protegen contratos diferentes aunque usen los mismos datos.
4. Mantener matrices extensas en el nivel más pequeño que las demuestra. Integración
   añade representantes de rechazo, códigos, persistencia y ausencia de efectos parciales;
   no necesita repetir cada formato inválido ya demostrado de forma aislada.
5. Registrar la decisión en la revisión del cambio. Para reglas críticas o integraciones,
   actualizar diseño, ficha y matriz funcional afectada. Retirar sólo si la regla quedó
   obsoleta, existe evidencia equivalente o el aporte adicional no justifica el mantenimiento;
   indicar siempre qué riesgo queda cubierto y qué limitación se acepta.

No se retiran pruebas de migración por el cambio de un formulario: los estados de partida
históricos siguen siendo necesarios para comprobar una actualización sin pérdida de datos.
Los conteos de casos aprobados no expresan porcentaje de cobertura ni cumplimiento del plan.

## Forma de documentar diseño, casos y ejecución

Nexus separa tres registros para no confundir lo que se planeó con lo que realmente se
ejecutó. En una prueba automatizada, el archivo, sus fixtures y sus nombres
`describe`/`it` son la especificación ejecutable y la fuente de verdad de sus datos y
aserciones. El [registro selectivo](automated-test-case-index.md) añade una ficha sólo
para los casos que requieren trazabilidad estable fuera del código. La vista por caso de
uso enlaza únicamente la evidencia funcional relevante. Una prueba manual o una
validación de aceptación sin archivo ejecutable conserva las tres tablas en la
incidencia o en un documento de la familia `docs/testing`.

### 1. Diseño y trazabilidad

Esta tabla identifica **qué se necesita probar** antes de enumerar datos. Una fila puede
representar una condición de cobertura o un grupo homogéneo de casos, pero no debe mezclar
resultados independientes.

| ID de diseño | Requisito / riesgo | Nivel y técnica | Condición que se cubrirá | Casos asociados |
| --- | --- | --- | --- | --- |
| `DP-<DOM>-NNN` | `RF-*`, `RN-*`, `CU-*` o riesgo identificado | Unitario, integración, sistema o aceptación; técnica elegida | Particiones y representantes, fronteras, combinaciones factibles o transiciones y su oráculo | `CP-*` o ruta/grupo automatizado |

El esquema SQL es un objeto de prueba y manual/automatizada es una forma de ejecución;
ninguno constituye por sí mismo un nivel. Un diseño puede repartir condiciones entre
niveles si cada uno aporta evidencia diferente.

### 2. Especificación del caso y datos

Cada caso que requiere ficha documental registra al menos los datos de entrada y el
resultado esperado que permiten
decidir objetivamente si pasa. En operaciones de escritura, los datos de prueba deben
identificar los valores que se intentan registrar y el resultado esperado debe indicar
tanto la respuesta que devuelve el sistema como los datos que deben quedar persistidos
o la ausencia de escritura. No basta con anotar «registro correcto» o únicamente el
código HTTP. Los valores sensibles se reemplazan por fixtures o referencias
reproducibles; no se copian credenciales ni datos personales reales.

| ID de caso | Precondiciones y estado inicial | Datos de prueba | Acción / pasos | Resultado esperado | Limpieza |
| --- | --- | --- | --- | --- | --- |
| `CP-<DOM>-NNN-01` | Estado, permisos, fixture y ambiente requeridos | Valores concretos que se envían o registran, clase de equivalencia o frontera y su procedencia | Operación reproducible o nombre del `it` | Respuesta esperada (estado y contenido relevante) y datos persistidos; ante rechazo, error y ausencia de efectos | Restauración requerida o `No aplica` |

### 3. Registro de ejecución y resultado real

El resultado esperado pertenece al diseño y no se sobrescribe después de ejecutar. El
resultado real se agrega en el registro de ejecución para conservar discrepancias y
repeticiones.

| Ejecución | Caso / suite | Revisión y ambiente | Fecha UTC y responsable | Resultado real | Estado | Evidencia / defecto |
| --- | --- | --- | --- | --- | --- | --- |
| `EP-NNN` | ID del caso, `SU-*`, ruta o comando focalizado | Commit, Node/Vitest, SO y servicios usados | Fecha y persona o CI | Conteos y observación obtenida | Aprobado, fallido, bloqueado o no ejecutado | Salida de CI, consulta verificable o incidencia |

El [registro selectivo de casos automatizados](automated-test-case-index.md) registra las
fichas que justifican documentación adicional. El [resumen por caso de
uso](use-case-test-types.md) registra únicamente su trazabilidad funcional. Los
resultados reales se conservan en CI o en la solicitud de cambio, no en un archivo
versionado.

No se replica cada `it`: se documentan las integraciones HTTP/Prisma, las unitarias de
autorización o integridad crítica y los criterios de aceptación que necesiten un
identificador estable. Las variaciones de una misma regla pueden compartir ficha; las
demás pruebas permanecen descritas por su nombre y aserciones ejecutables.

La [medición del backend](backend-performance.md) añade escenarios HTTP con consultas
SQL, planes de ejecución, percentiles y concurrencia. Se ejecuta aparte de las suites
funcionales con `npm run test:performance` y una base desechable.
`npm run test:performance:mixed` separa el cliente en otro proceso y comprueba consultas
concurrentes con descargas Excel, CPU, event loop y memoria; sus resultados se
conservan en la evidencia de la entrega o CI, sin fijar un SLA a partir de una corrida local.

## Cobertura CRUD mínima

Sólo se cubren operaciones disponibles en el producto. Una eliminación puede ser una
cancelación o transición de estado, según el dominio.

| Operación | Evidencia principal | Casos relevantes |
| --- | --- | --- |
| Consultar/listar | respuesta HTTP y datos devueltos | filtros, paginación, vacío, acceso y límites |
| Crear | respuesta y lectura posterior con Prisma | validación, duplicado, relaciones y ausencia de escritura parcial |
| Actualizar | respuesta y valores persistidos | inexistente, conflicto, campos conservados y efectos atómicos |
| Eliminar/cancelar | estado o ausencia consultable | transición inválida, relaciones protegidas y reversión de efectos |

Los catálogos pueden reutilizar preparación y casos tabulados, pero cada contexto debe
demostrar su router, configuración y persistencia. Los documentos operativos añaden
stock, movimientos, detalles y rollback cuando esos efectos formen parte del flujo.

## Niveles y ubicación

| Nivel | Ubicación | Alcance | Lo que no demuestra |
| --- | --- | --- | --- |
| Unitario | `tests/unit/<ruta paralela al código>` | Una regla, función o colaboración aislada; sustituye dependencias cuando corresponde. | Persistencia real ni el flujo completo entre capas. |
| Integración | `tests/integration/controllers` | Request HTTP, controller, servicios y Prisma contra una base aislada. | Recorrido de navegador ni aceptación del usuario. |

Las unitarias de UI se limitan a estados y datos con riesgo funcional: descartar medidas
para piezas, actualizar el neto y la longitud, incluir inputs deshabilitados en el payload
o impedir una escritura antes de confirmar en el modal. No fijan HTML, CSS, orden de
columnas ni detalles privados del plugin. Las colaboraciones sólo justifican aserciones
de llamadas cuando representan un efecto contractual, como impedir un doble envío.
Si un helper compartido coordina datos CRUD, su regla se prueba en la ruta paralela a su
módulo; los contextos añaden evidencia sólo cuando tienen decisiones o contratos propios.

Las pruebas de `tests/integration/migrations` verifican restricciones, conservación
histórica y rollback en PostgreSQL; no se confunden con preparar el esquema de las
integraciones HTTP. Las unitarias de herramientas y del adaptador transaccional protegen
sus contratos de soporte; `npm run docs:check` valida documentación. No constituyen
niveles funcionales nuevos. Actualmente no existe una suite automatizada de sistema,
navegador o aceptación; cuando se requiera, se registra de forma separada.

### Técnicas de diseño

Se elige la técnica según el riesgo observable. La técnica orienta el diseño, pero no
crea otro inventario paralelo al índice de casos:

| Técnica | Aplicación |
| --- | --- |
| Particiones de equivalencia | Identificar clases con el mismo tratamiento: válido, ausente, formato incorrecto o tipo JSON incompatible. Elegir representantes por clase. |
| Valores frontera | Precisar el límite y sus vecinos según la resolución admitida; para peso con dos decimales, `0`, `0.01`, `999.99` y `1000`. La precisión excesiva es además una clase inválida. |
| Tablas de decisión | Enumerar condiciones, combinaciones factibles y acciones esperadas, por ejemplo conflicto, modo, permiso, identidad y confirmación. Parametrizar datos no basta para afirmar esta técnica. |
| Transiciones de estado | Identificar estado inicial, evento y estado final; probar transiciones permitidas y rechazos relevantes, como pendiente → surtido o captura → modal de stock. |

Atomicidad, concurrencia, aislamiento de contextos y fallos de persistencia son riesgos
y escenarios que estas técnicas ayudan a diseñar; no técnicas adicionales. La inyección
de fallos y el bloqueo de filas son medios de ejecución. Si se necesita cobertura de
sentencias o ramas, debe medirse con instrumentación; no se deduce de las tablas ni de
la cantidad de pruebas.

### Medición de cobertura

Vitest usa `@vitest/coverage-v8` de la misma versión para medir líneas, sentencias,
funciones y ramas. La medición se habilita con `--coverage`; las ejecuciones ordinarias
mantienen la cobertura desactivada. No se impone un porcentaje mínimo inicial: los
resultados sirven para identificar brechas y priorizarlas por el riesgo del módulo.

| Suite | Comando | Alcance | Reporte HTML |
| --- | --- | --- | --- |
| Unitaria | `npm run test:coverage` | JavaScript de `src`, incluidos frontend y módulos compartidos. | `coverage/unit/index.html` |
| Integración | `npm run test:coverage:integration` | JavaScript de `src` excepto `src/public`; incluye módulos compartidos usados por el servidor. | `coverage/integration/index.html` |

Ambas configuraciones incluyen archivos no ejecutados dentro de su alcance para no
limitar el porcentaje a los módulos importados por las pruebas. La exclusión de
`src/public` en integración corresponde a su contrato HTTP/Prisma: esa suite no ejecuta
el navegador. Las plantillas EJS, SQL, el cliente Prisma generado y las herramientas de
`scripts` no forman parte de estos porcentajes de aplicación; conservan las pruebas
funcionales o auxiliares que correspondan.

Cada ejecución escribe resumen de terminal, HTML, LCOV y `coverage-summary.json` en
su propio directorio; ejecutar integración no borra el reporte unitario. Los porcentajes
de suites con distinto alcance no se suman ni promedian para declarar cobertura total.
Un porcentaje alto demuestra ejecución del código, no suficiencia de las aserciones,
cumplimiento de requisitos ni funcionamiento en un navegador real.

CI activa la cobertura en los pasos existentes de unitarias e integración y publica
`coverage-reports`, conservando por separado los reportes JUnit. Se intenta generar y
conservar la cobertura también ante fallos de pruebas; si la suite no llega a iniciarse,
no se afirma que exista un reporte válido. Los archivos de `coverage` están ignorados
por Git y se guardan como evidencia de ejecución, sin versionarlos en `docs`.

### Ambiente de pruebas e integración con base de datos

Las unitarias se ejecutan con Node.js 22–24 y Vitest, sin una base real. Las integraciones
usan `NODE_ENV=test`, se ejecutan de forma serial y trabajan contra PostgreSQL mediante
`DATABASE_TEST_URL`, que debe ser distinta de `DATABASE_URL`.
Los scripts establecen el entorno con `cross-env` para conservar este flujo en Windows
y sistemas POSIX, tanto con cobertura como sin ella.

Las integraciones guardan y consultan datos
reales y limpian únicamente los fixtures identificables de su suite. La limpieza se
realiza al preparar cada integración, en `afterAll` cuando el agregado lo requiera y,
como red de seguridad, mediante `tests/teardownTestDatabase.js`. No se vacían catálogos
compartidos ni se sustituye con mocks la transacción que constituye el objeto de la
integración.

Cada integración CRUD HTTP se ubica en
`tests/integration/controllers/<dominio>ControllerDbTest.js`, comprueba la respuesta y
el estado persistido con Prisma, y cubre al menos una regla de rechazo relevante. Los
flujos entre dominios se demuestran en la integración propietaria en lugar de duplicar
la misma prueba unitaria. `npm run test:integration` valida que la URL de pruebas sea
distinta de `DATABASE_URL`, aplica las migraciones y genera el cliente antes de ejecutar
Vitest.

## Cobertura prioritaria

| Capacidad | Estado / siguiente paso |
| --- | --- |
| Catálogos, clientes y proveedores | Mantener integraciones de alta y consulta; ampliar actualización o baja sólo al modificar esos flujos. |
| Salidas de merma | Mantener registro, persistencia, movimiento y rollback existentes. |
| Consumibles | Mantener unitarias por operación y altas sin medidas integradas en `materialControllerDbTest.js`; completar consulta, edición, retiro y ajuste HTTP de su propio inventario. |
| Salidas de material | Mantener `goodsIssueControllerDbTest.js` y `warehouseConcurrencyControllerDbTest.js`: contexto, surtido, devolución parcial, concurrencia y rollback; completar fronteras de devolución. |
| Entradas de compra | Mantener `goodsReceiptContextDbTest.js` y `warehouseConcurrencyControllerDbTest.js`: aislamiento, alta, edición, corrección, cancelación, folios y fallos; ampliar sólo la regla afectada. |
| Personas y usuarios | Incorporar persistencia de relaciones de rol y departamento. |
| Autorización por contexto | Mantener casos unitarios positivos y negativos por combinación rol/departamento; ventas permanece sin permisos del sistema. |
| Auditoría de escrituras | Incorporar unitarias de clasificación/sanitizado y middleware, más integración que distinga respuesta exitosa, fallida y persistencia best effort. |
| Ajustes, requisiciones y proyectos | Probar únicamente cuando exista el CRUD accesible desde controller. |
| Reportes y movimientos | Cubrir consultas, permisos, filtros y datos exportados. |

## Entrada, salida y evidencia

Antes de implementar debe existir un flujo real, una regla identificada y un ambiente
aislado si se usa Prisma. Para aceptar el cambio:

- pasan las pruebas relacionadas al CRUD afectado;
- cada escritura integrada se consulta con Prisma;
- los errores de operaciones compuestas no dejan registros parciales;
- no hay pruebas deshabilitadas ni duplicación del mismo camino feliz;
- cada retiro conserva la cobertura identificada o documenta la limitación aceptada;
- `npm run docs:check` confirma la documentación generada.

En desarrollo se ejecutan primero las unitarias e integraciones del área. En el pull
request se ejecutan `npm run test:unit`, `npm run test:integration` con base aislada y
`npm run docs:check`. La evidencia indica comando, resultado y commit; una captura no
sustituye aserciones HTTP o Prisma.

CI ejecuta unitarias e integración en pasos distintos y conserva `unit.xml` e
`integration.xml` como artefacto `test-results`, incluso si una suite falla. Los reportes
JUnit complementan el log y los metadatos de la ejecución (commit, ambiente y fecha);
no sustituyen la trazabilidad de diseño ni constituyen una certificación ISO. Si una
suite no llega a ejecutarse, se registra como no ejecutada o bloqueada, no como aprobada.
No se versionan esos reportes en `docs`.

## Referencias

- [ISO/IEC/IEEE 29119-3:2021](https://www.iso.org/standard/79429.html): documentación de pruebas; adaptación selectiva a diseño, caso y ejecución.
- [ISO/IEC/IEEE 29119-4:2021](https://www.iso.org/standard/79430.html): técnicas de diseño.
- [ISTQB CTFL 4.0.1](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf), apartados 1.4, 4.2 y 5.2: trazabilidad, técnicas y priorización por riesgo.
- [Reporters de Vitest](https://vitest.dev/guide/reporters.html) y [artefactos de GitHub Actions](https://docs.github.com/en/actions/tutorials/store-and-share-data): evidencia automatizada de ejecución.
- [Cobertura de Vitest](https://vitest.dev/guide/coverage.html): proveedor V8, alcance y formatos de reporte.
