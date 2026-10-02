# Plan de pruebas

## Datos generales del documento

| Versión documental | Versión del sistema | Estado | Fecha | Responsable |
| --- | --- | --- | --- | --- |
| 1.0 | 1.0.0 | En revisión | 2026-09-10 | Equipo Nexus |

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
| `DP-<DOM>-NNN` | `RF-*`, `RN-*`, `CU-*` o riesgo identificado | Unitario, integración, esquema o manual; técnica de 29119-4 aplicada | Regla, frontera, combinación o transición observable | `CP-<DOM>-NNN-*` o ruta/grupo automatizado |

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

| Nivel | Ubicación | Uso |
| --- | --- | --- |
| Unitario | `tests/unit/<ruta paralela al código>` | reglas, límites, decisiones y transformaciones de un registro o consulta |
| Integración | `tests/integration/controllers` | CRUD por HTTP con servicios reales y comprobación mediante Prisma |
| Esquema | migraciones sobre `DATABASE_TEST_URL` | restricciones, relaciones y atomicidad no demostrables con mocks |
| Documentación | `npm run docs:check` | documentos generados sincronizados con código y Prisma |

No se crea un nivel unitario para componentes visuales o infraestructura incidental.
Si un helper compartido coordina datos CRUD, se prueba una vez en la ruta paralela a su
módulo y los contextos reutilizan ese contrato.

### Técnicas de diseño

Se elige la técnica según el riesgo observable. La técnica orienta el diseño, pero no
crea otro inventario paralelo al índice de casos:

| Técnica | Aplicación |
| --- | --- |
| Particiones de equivalencia | Entradas válidas, inválidas o ausentes y decisiones de autorización. |
| Valores frontera | Cero, negativos, máximos, precisión decimal, fechas, páginas y colecciones vacías. |
| Tablas de decisión | Combinaciones de rol, departamento, operación o estado; pueden materializarse con `it.each`. |
| Transiciones y atomicidad | Cambios de estado, duplicidad, movimientos y rollback sin efectos parciales. |
| Interacción y fallos | Contratos entre capas y detención de colaboradores posteriores ante un error. |

### Ambiente de pruebas e integración con base de datos

Las unitarias se ejecutan con Node.js 22–24 y Vitest, sin una base real. Las integraciones
usan `NODE_ENV=test`, se ejecutan de forma serial y trabajan contra PostgreSQL mediante
`DATABASE_TEST_URL`, que debe ser distinta de `DATABASE_URL`.

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
| Salidas de material | Incorporar integración HTTP de registro, entrega/devolución, stock y rollback. |
| Entradas de compra | Incorporar integración HTTP de registro, corrección, costo, movimiento y rollback. |
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
- `npm run docs:check` confirma la documentación generada.

En desarrollo se ejecutan primero las unitarias e integraciones del área. En el pull
request se ejecutan `npm run test:unit`, `npm run test:integration` con base aislada y
`npm run docs:check`. La evidencia indica comando, resultado y commit; una captura no
sustituye aserciones HTTP o Prisma.
