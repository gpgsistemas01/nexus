# Plan de pruebas

## Datos generales del documento

| Versión documental | Versión del sistema | Estado | Fecha | Responsable |
| --- | --- | --- | --- | --- |
| 1.0 | 1.0.0 | En revisión | 2026-09-10 | Equipo Nexus |

## Objetivo y alcance

Este plan acepta cambios de Nexus mediante evidencia de los flujos que registran o
consultan datos. La [estrategia de pruebas](service-test-coverage.md) define técnicas y
ubicación; este documento establece la cobertura CRUD mínima y la ejecución.

Cada prueba nueva debe identificar el requisito o regla, la operación CRUD y el dato o
efecto observable. No se agrega cobertura sólo para aumentar conteos ni para fijar
detalles de HTML, estilos, selectores, eventos o estructura de archivos.

Nexus usa de forma selectiva ISO/IEC/IEEE 29119-2 para el proceso, 29119-3 para
los artefactos y 29119-4 para las técnicas de diseño, sin declarar conformidad.

## Forma de documentar diseño, casos y ejecución

Nexus separa tres registros para no confundir lo que se planeó con lo que realmente se
ejecutó. En una prueba automatizada, el archivo y los nombres `describe`/`it` son la
especificación ejecutable; una tabla de este paquete puede agrupar casos equivalentes y
debe enlazar la ruta o grupo correspondiente. Una prueba manual o una validación de
aceptación que no tenga archivo ejecutable conserva las tres tablas en la incidencia o
en un documento de la familia `docs/testing`.

### 1. Diseño y trazabilidad

Esta tabla identifica **qué se necesita probar** antes de enumerar datos. Una fila puede
representar una condición de cobertura o un grupo homogéneo de casos, pero no debe mezclar
resultados independientes.

| ID de diseño | Requisito / riesgo | Nivel y técnica | Condición que se cubrirá | Casos asociados |
| --- | --- | --- | --- | --- |
| `DP-<DOM>-NNN` | `RF-*`, `RN-*`, `CU-*` o riesgo identificado | Unitario, integración, esquema o manual; técnica de 29119-4 aplicada | Regla, frontera, combinación o transición observable | `CP-<DOM>-NNN-*` o ruta/grupo automatizado |

### 2. Especificación del caso y datos

Cada caso registra al menos los datos de entrada y el resultado esperado que permiten
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

El [resumen por caso de uso](use-case-test-types.md) registra evidencia funcional;
el [catálogo unitario](unit-test-catalog.md) registra los diseños `DP-UNIT-*`, casos
`CP-UNIT-*`, técnicas, datos y resultados esperados de la suite, y el
[índice de casos automatizados](automated-test-case-index.md) enumera cada caso unitario
o de integración declarado en el código.

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

El [catálogo de pruebas unitarias](unit-test-catalog.md) registra la suite, el ambiente,
las técnicas, los datos y los resultados observados por grupo.

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
