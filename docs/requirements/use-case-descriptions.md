# Descripciones de casos de uso

## Propósito y alcance

Este catálogo desarrolla los objetivos representados en el
[diagrama de casos de uso](domain-and-use-cases.md#casos-de-uso-vigentes). Agrupa los
casos que comparten tema, actor, ciclo CRUD o efectos de inventario para revisar sus
semejanzas sin crear un documento por módulo.

Las descripciones expresan comportamiento de negocio, no endpoints ni permisos. La
[matriz de operaciones](requirements-operations-matrix.md) detalla operaciones y
permisos; la [especificación de requisitos](requirements-specification.md) contiene
criterios verificables, reglas y evidencia técnica. Una capacidad parcial, modelada o
fuera de alcance no se incorpora como caso vigente.

## Estructura de cada caso

Cada caso emplea las mismas secciones para que el recorrido y sus condiciones puedan
revisarse sin interpretar una narración compacta:

- **Resumen:** actor principal, objetivo y disparador que inicia el caso.
- **Participantes e intereses:** otros interesados y el resultado que esperan.
- **Precondiciones:** estado que debe existir antes del primer paso.
- **Garantías de éxito:** estado observable que debe existir al terminar correctamente.
- **Flujo principal:** pasos numerados e individuales del escenario exitoso.
- **Flujos alternativos:** variantes válidas enlazadas al paso del flujo principal.
- **Excepciones:** rechazos o fallos y la garantía que deben conservar.
- **Reglas y requisitos relacionados:** identificadores que contienen criterios de
  aceptación; no duplican su redacción normativa.

El actor principal inicia el objetivo, pero no obtiene autorización por aparecer aquí.
Los casos de catálogos siguen listar-crear-actualizar y sólo incluyen eliminar, activar,
desactivar o ajustar cuando el contexto lo permite. Los documentos comparten encabezado
y detalles, pero surtir, devolver y corregir mantienen reglas y efectos propios.

## 1. Acceso e identidades

### CU-IAM-01 — Administrar personas, usuarios y accesos

#### Resumen

| Elemento | Descripción |
| --- | --- |
| Actor principal | Administración del sistema. |
| Objetivo | Mantener separadas las personas que participan en la operación y las cuentas que acceden a Nexus, vinculándolas cuando corresponda. |
| Disparador | El actor necesita consultar o mantener una persona, cuenta, contraseña o asignación de acceso. |

#### Participantes e intereses

- **Administración:** requiere identidades y asignaciones vigentes.
- **Personal operativo:** requiere que su persona pueda participar en documentos sin
  adquirir acceso implícitamente.
- **Auditoría:** requiere conservar la relación correcta entre cuenta, persona, rol y
  departamento.

#### Precondiciones

- El actor inició sesión y posee el permiso de la operación solicitada.
- Los roles y departamentos necesarios están disponibles para consulta.

#### Garantías de éxito

- La persona o cuenta y sus asignaciones válidas quedan disponibles para autorización,
  contexto operativo o auditoría.
- Una persona sólo queda vinculada a una cuenta cuando esa relación fue indicada y
  validada.

#### Flujo principal

1. El actor abre el listado de personas o usuarios.
2. El sistema consulta y presenta los registros disponibles.
3. El actor selecciona un registro existente o inicia uno nuevo.
4. El actor captura los datos de identidad y las asignaciones aplicables.
5. El sistema valida los datos, el rol, el departamento y la relación opcional con una
   persona.
6. El sistema persiste la creación o actualización.
7. El sistema presenta el registro actualizado en una lectura posterior.

#### Flujos alternativos

- **A1 — Cuenta sin persona, desde el paso 4:** el actor omite la persona; el sistema
  conserva la cuenta sin vínculo personal.
- **A2 — Cambio de contraseña o accesos, desde el paso 3:** el actor elige la acción
  especializada, el sistema aplica las reglas de usuario y vuelve al paso 7.
- **A3 — Consulta de roles o departamentos, desde el paso 2:** el sistema los presenta
  como catálogos de apoyo sin ofrecer mantenimiento dentro de este caso.

#### Excepciones

- **E1 — Datos o relaciones inválidos, en el paso 5:** el sistema rechaza la solicitud y
  no persiste cambios parciales.
- **E2 — Operación no autorizada, antes del paso 2:** el sistema no expone ni modifica
  los datos protegidos.

#### Reglas y requisitos relacionados

`RF-IAM-001`, `RF-IAM-002`, `RF-IAM-003`, `RN-001`, `RN-008`.

Este caso reúne personas y usuarios porque comparten administración de identidades,
pero una persona no obtiene acceso por el solo hecho de participar en un documento.

## 2. Catálogos operativos y contextuales

### CU-CAT-01 — Mantener catálogos de almacén

#### Resumen

| Elemento | Descripción |
| --- | --- |
| Actor principal | Personal de almacén. |
| Objetivo | Mantener materiales, proveedores, ofertas proveedor-material y existencias de merma necesarias para documentos operativos. |
| Disparador | El actor necesita consultar, crear, editar, eliminar o ajustar un registro permitido del catálogo. |

#### Participantes e intereses

- **Almacén:** requiere catálogos consistentes para entradas, salidas y ajustes.
- **Administración y reportes:** requieren nombres, relaciones y estados trazables.
- **Inventario:** requiere que una edición general no sustituya un ajuste de stock.

#### Precondiciones

- El actor inició sesión y posee el permiso del catálogo y de la acción solicitada.
- Los catálogos auxiliares y relaciones obligatorias de la operación existen.

#### Garantías de éxito

- El registro queda consistente y disponible para documentos, movimientos y reportes.
- Una operación de stock queda registrada mediante el flujo de ajuste autorizado, no
  como efecto implícito de la edición general.

#### Flujo principal

1. El actor abre el catálogo y define los filtros disponibles.
2. El sistema consulta y presenta los registros.
3. El actor selecciona un registro o inicia uno nuevo.
4. El actor captura o corrige datos y relaciones obligatorias.
5. El sistema valida unicidad, estado y reglas dimensionales o comerciales.
6. El sistema persiste la creación o actualización.
7. El sistema actualiza el listado y presenta el resultado.

#### Flujos alternativos

- **A1 — Eliminar material, desde el paso 3:** el actor solicita la eliminación; si no
  existen relaciones protegidas, el sistema elimina y continúa en el paso 7.
- **A2 — Cambiar estado, desde el paso 3:** cuando el catálogo lo permite, el sistema
  actualiza el estado en lugar de eliminar físicamente.
- **A3 — Ajustar stock, desde el paso 3:** el actor usa la acción especializada; el
  sistema valida y registra el ajuste antes de actualizar el listado.
- **A4 — Crear merma desde plantilla, desde el paso 4:** el actor toma un material como
  plantilla; el sistema copia los snapshots aplicables sin crear una relación
  persistente con ese material.

#### Excepciones

- **E1 — Duplicidad o dato inválido, en el paso 5:** el sistema rechaza la operación y
  conserva el catálogo sin cambios parciales.
- **E2 — Material protegido, en A1:** el sistema rechaza la eliminación y conserva sus
  relaciones.
- **E3 — Acción inexistente para catálogo auxiliar:** el sistema sólo permite consulta.

#### Reglas y requisitos relacionados

`RF-CAT-001`, `RF-CAT-002`, `RF-CAT-004`, `RF-CAT-005`, `RF-WST-001`,
`RF-MER-001` a `RF-MER-004`, `RN-006`, `RN-007`.

### CU-CAT-02 — Mantener clientes como catálogo contextual

#### Resumen

| Elemento | Descripción |
| --- | --- |
| Actor principal | Administración del sistema. |
| Objetivo | Mantener clientes y su asesor opcional para usarlos como contexto comercial de una salida. |
| Disparador | El actor necesita consultar, registrar o actualizar un cliente. |

#### Participantes e intereses

- **Administración:** requiere información vigente del cliente.
- **Almacén:** requiere seleccionar un contexto comercial válido en las salidas.
- **Asesor:** puede quedar relacionado como contexto sin recibir acceso al sistema.

#### Precondiciones

- El actor inició sesión y posee el permiso de la operación solicitada.
- La persona asesora existe cuando el actor desea asociarla.

#### Garantías de éxito

- El cliente queda disponible para las salidas y reportes autorizados.
- La relación opcional con el asesor apunta a una persona válida.

#### Flujo principal

1. El actor abre el listado de clientes.
2. El sistema consulta y presenta los clientes disponibles.
3. El actor selecciona un cliente o inicia uno nuevo.
4. El actor captura o modifica sus datos y selecciona un asesor cuando corresponde.
5. El sistema valida los datos y la referencia de persona.
6. El sistema persiste la creación o actualización.
7. El sistema actualiza el listado con el cliente resultante.

#### Flujos alternativos

- **A1 — Cliente sin asesor, desde el paso 4:** el actor omite el asesor y el sistema
  continúa con la validación de los demás datos.

#### Excepciones

- **E1 — Datos o asesor inválidos, en el paso 5:** el sistema rechaza la solicitud y no
  persiste cambios.
- **E2 — Operación no autorizada:** el sistema no consulta ni modifica clientes fuera
  del permiso del actor.

#### Reglas y requisitos relacionados

`RF-CAT-003`, `RN-001`, `RN-006`.

Los dos casos de catálogo comparten patrón CRUD, listado y formulario. Se mantienen
separados porque pertenecen a actores y contextos distintos, y clientes no administra
inventario.

## 3. Entradas y correcciones

### CU-REC-01 — Registrar y corregir entradas

#### Resumen

| Elemento | Descripción |
| --- | --- |
| Actor principal | Personal de almacén. |
| Objetivo | Registrar la recepción de materiales y corregir detalles sin perder el historial que explica el inventario. |
| Disparador | El actor recibe una compra o necesita editar, corregir o cancelar una entrada existente. |

#### Participantes e intereses

- **Almacén:** requiere conciliar recepción física, existencias y movimientos.
- **Administración:** requiere factura, proveedor e importes trazables.
- **Auditoría:** requiere conservar valores anteriores, nuevos y motivos de corrección.

#### Precondiciones

- El actor inició sesión y posee el permiso de la operación.
- El proveedor y los materiales relacionados existen.
- Para editar, corregir o cancelar, la entrada existe y su estado admite la acción.

#### Garantías de éxito

- Encabezado, detalles, importes, existencias y movimientos quedan conciliados.
- Las correcciones conservan el historial y el motivo sin sobrescribir la recepción
  original.

#### Flujo principal

1. El actor inicia una entrada de compra.
2. El actor selecciona proveedor y captura factura, fechas, receptor y detalles.
3. El sistema valida la referencia, las relaciones, cantidades e importes.
4. El sistema inicia una transacción.
5. El sistema persiste encabezado y detalles.
6. El sistema incrementa las existencias correspondientes.
7. El sistema crea los movimientos de entrada vinculados.
8. El sistema confirma la transacción y presenta la entrada registrada.

#### Flujos alternativos

- **A1 — Editar entrada, después del paso 8:** el actor modifica el encabezado permitido
  o agrega detalles nuevos; el sistema conserva el proveedor original, valida y aplica
  los pasos 4 a 8 sólo a los cambios admitidos.
- **A2 — Corregir detalle persistido, después del paso 8:** el actor indica nuevos
  valores y motivo; el sistema registra valores anteriores y nuevos, ajusta stock y
  movimiento, y confirma la corrección.
- **A3 — Cancelar detalle, después del paso 8:** el sistema registra la cancelación y
  revierte el efecto de inventario del detalle sin borrar su historia.
- **A4 — Material repetido, desde el paso 2:** el sistema admite varios renglones del
  mismo material cuando representan lotes o precios distintos.

#### Excepciones

- **E1 — Factura duplicada para el proveedor, en el paso 3:** el sistema rechaza la
  entrada antes de escribir datos.
- **E2 — Cambio de proveedor durante A1:** el sistema rechaza la modificación.
- **E3 — Fallo transaccional, en los pasos 5 a 7 o alternativas:** el sistema revierte
  documento, stock y movimientos, sin cambios parciales.

#### Reglas y requisitos relacionados

`RF-REC-001`, `RF-REC-002`, `RF-REC-003`, `RN-002`, `RN-004`, `RN-005`.

## 4. Salidas, surtido y devolución

### CU-ISS-01 — Crear y editar salidas

#### Resumen

| Elemento | Descripción |
| --- | --- |
| Actor principal | Personal de almacén. |
| Objetivo | Preparar una salida de material o merma con contexto y cantidades solicitadas antes o durante su atención. |
| Disparador | El actor recibe una solicitud de salida o necesita editar un documento aún modificable. |

#### Participantes e intereses

- **Solicitante:** requiere que recurso y cantidad solicitada queden identificados.
- **Almacén:** requiere preparar el documento sin descontar stock no surtido.
- **Auditoría:** requiere conservar contexto y snapshots del recurso entregable.

#### Precondiciones

- El actor inició sesión y posee el permiso de la operación.
- Los catálogos requeridos existen.
- Para editar, el documento existe y su estado admite cambios.

#### Garantías de éxito

- La salida queda disponible para surtimiento con detalles pendientes y contexto
  trazable.
- Las existencias no cambian por cantidades que todavía no fueron surtidas.

#### Flujo principal

1. El actor elige el contexto de material o merma.
2. El actor captura el encabezado, solicitante y detalles.
3. El sistema valida relaciones, cantidades y campos propios del contexto.
4. El sistema guarda encabezado, detalles y snapshots aplicables.
5. El sistema deriva el estado pendiente del documento y sus detalles.
6. El sistema presenta la salida disponible para surtimiento.

#### Flujos alternativos

- **A1 — Editar documento, desde el paso 6:** el actor modifica los campos permitidos
  del encabezado o las cantidades admitidas; el sistema valida y vuelve al paso 6.
- **A2 — Agregar detalle, desde el paso 6:** si el estado lo permite, el actor incorpora
  el detalle y el sistema repite los pasos 3 a 6 para ese cambio.
- **A3 — Contexto de merma, desde el paso 1:** el flujo reutiliza encabezado y detalle,
  pero consulta el inventario y las reglas propios de merma.

#### Excepciones

- **E1 — Datos o estado inválidos, en los pasos 3 o alternativas:** el sistema rechaza
  el cambio y conserva el documento anterior.
- **E2 — Intento de reescribir una cantidad surtida o devuelta:** el sistema rechaza la
  edición para conservar los acumulados históricos.

#### Reglas y requisitos relacionados

`RF-ISS-001`, `RF-WST-002`, `RN-001`, `RN-003`, `RN-006`.

### CU-ISS-02 — Surtir detalles

#### Resumen

| Elemento | Descripción |
| --- | --- |
| Actor principal | Personal de almacén. |
| Objetivo | Entregar total o parcialmente la cantidad pendiente de un detalle de salida. |
| Disparador | El actor selecciona un detalle pendiente para registrar su entrega. |

#### Participantes e intereses

- **Solicitante:** requiere recibir la cantidad registrada.
- **Almacén:** requiere que entrega, stock y movimiento coincidan.
- **Auditoría:** requiere vincular el movimiento con el detalle de origen.

#### Precondiciones

- La salida y el detalle existen y su estado permite surtir.
- Existe cantidad pendiente.
- El inventario del contexto tiene existencia suficiente.

#### Garantías de éxito

- Cantidad surtida, estado, existencia y movimiento coinciden.
- El stock nunca queda por debajo del límite permitido.

#### Flujo principal

1. El actor selecciona un detalle pendiente.
2. El actor captura la cantidad a surtir.
3. El sistema valida que la cantidad sea positiva, pendiente y disponible.
4. El sistema inicia una transacción.
5. El sistema acumula la cantidad surtida en el detalle.
6. El sistema reduce la existencia correspondiente.
7. El sistema deriva los estados del detalle y documento.
8. El sistema crea el movimiento vinculado.
9. El sistema confirma la transacción y presenta documento e inventario actualizados.

#### Flujos alternativos

- **A1 — Surtimiento parcial, desde el paso 3:** el sistema conserva como pendiente la
  diferencia y continúa en el paso 4.
- **A2 — Contexto de merma, desde el paso 3:** el sistema aplica existencia y conversión
  propias de merma y continúa en el paso 4.

#### Excepciones

- **E1 — Cantidad inválida o stock insuficiente, en el paso 3:** el sistema rechaza el
  surtimiento sin modificar el detalle.
- **E2 — Fallo transaccional, en los pasos 5 a 8:** el sistema revierte acumulado, stock,
  estados y movimiento.

#### Reglas y requisitos relacionados

`RF-ISS-002`, `RF-WST-003`, `RN-002`, `RN-003`, `RN-004`.

### CU-ISS-03 — Devolver detalles surtidos

#### Resumen

| Elemento | Descripción |
| --- | --- |
| Actor principal | Personal de almacén. |
| Objetivo | Reintegrar al inventario una cantidad surtida sin eliminar la entrega original. |
| Disparador | El actor recibe una devolución asociada con un detalle surtido. |

#### Participantes e intereses

- **Almacén:** requiere reintegrar la existencia correcta.
- **Solicitante:** requiere que la devolución quede aplicada al documento de origen.
- **Auditoría:** requiere conservar tanto el surtimiento como el movimiento inverso.

#### Precondiciones

- La salida y el detalle existen.
- Existe cantidad surtida aún disponible para devolución.
- El actor posee el permiso específico de la operación.

#### Garantías de éxito

- La devolución queda trazada sin borrar el surtimiento.
- Acumulados, estados, existencia y movimiento inverso permanecen consistentes.

#### Flujo principal

1. El actor selecciona un detalle surtido.
2. El actor captura la cantidad a devolver.
3. El sistema calcula la cantidad todavía retornable.
4. El sistema valida que la devolución sea positiva y no exceda esa cantidad.
5. El sistema inicia una transacción.
6. El sistema acumula la cantidad devuelta.
7. El sistema incrementa la existencia correspondiente.
8. El sistema deriva los estados del detalle y documento.
9. El sistema crea el movimiento inverso enlazado al origen.
10. El sistema confirma la transacción y presenta los acumulados actualizados.

#### Flujos alternativos

- **A1 — Devolución parcial, desde el paso 4:** el sistema conserva como surtida la
  diferencia y continúa en el paso 5.
- **A2 — Contexto de merma, desde el paso 4:** el sistema aplica las reglas de existencia
  de merma y continúa en el paso 5.

#### Excepciones

- **E1 — Cantidad inválida o superior a la retornable, en el paso 4:** el sistema rechaza
  la devolución sin alterar acumulados.
- **E2 — Fallo transaccional, en los pasos 6 a 9:** el sistema revierte devolución,
  stock, estados y movimiento.

#### Reglas y requisitos relacionados

`RF-ISS-003`, `RF-WST-003`, `RN-002`, `RN-003`, `RN-005`.

Los tres casos de salida forman una familia porque material y merma replican el proceso
con diferente contexto. Separar sus objetivos evita tratar surtimiento y devolución
como una edición CRUD y permite exigir pruebas de transacción y efectos negativos.

## 5. Consulta y salida de información

### CU-REP-01 — Consultar movimientos y reportes

#### Resumen

| Elemento | Descripción |
| --- | --- |
| Actor principal | Personal de almacén o administración del sistema, según el ámbito. |
| Objetivo | Consultar trazabilidad operativa y exportar la información autorizada. |
| Disparador | El actor necesita revisar movimientos, inventario o un reporte del ámbito permitido. |

#### Participantes e intereses

- **Almacén:** requiere consultar inventario y operación con filtros vigentes.
- **Administración:** requiere reportes consolidados y exportables.
- **Auditoría:** requiere que filtros, cálculos y ámbito sean reproducibles.

#### Precondiciones

- El actor inició sesión.
- El actor posee el permiso de lectura o reporte del ámbito solicitado.

#### Garantías de éxito

- El actor obtiene una vista o archivo consistente con filtros, cálculos y permisos.
- Una consulta vacía produce un resultado válido sin inventar registros.

#### Flujo principal

1. El actor abre movimientos o un reporte.
2. El sistema presenta los filtros disponibles para su ámbito.
3. El actor define los filtros aplicables.
4. El sistema valida el ámbito y consulta los datos autorizados.
5. El sistema presenta resultados paginados o consolidados.
6. El actor solicita la exportación.
7. El sistema genera el archivo con los resultados y fórmulas aplicables.

#### Flujos alternativos

- **A1 — Sólo consulta, desde el paso 5:** el actor termina el caso sin exportar.
- **A2 — Filtro dependiente de inventario, desde el paso 3:** el actor selecciona
  primero proveedor y después material o merma; si cambia el proveedor, el sistema
  limpia la selección dependiente antes de volver al paso 4.
- **A3 — Reporte de mermas, desde el paso 4:** el sistema agrupa según presentación,
  nombre, proveedor y dimensiones definidas por los requisitos.
- **A4 — Sin resultados, desde el paso 5:** el sistema presenta una colección o archivo
  válido sin filas de datos.

#### Excepciones

- **E1 — Ámbito no autorizado, en el paso 4:** el sistema rechaza la consulta o
  exportación y no expone datos.
- **E2 — Filtros inválidos, en el paso 4:** el sistema solicita corregirlos y no genera
  resultados ni archivo con condiciones ambiguas.

#### Reglas y requisitos relacionados

`RF-REP-001`, `RF-REP-002`, `RF-REP-003`, `RF-REP-004`, `RN-001`.

## Relación entre familias y reutilización

| Tema compartido | Casos | Elementos reutilizables que deben evaluarse primero | Diferencia que debe conservarse |
| --- | --- | --- | --- |
| CRUD de catálogos | `CU-IAM-01`, `CU-CAT-01`, `CU-CAT-02` | Fábricas CRUD, listados, formularios, validación y refresco de tabla. | Permisos, identidad del recurso, relaciones y política de eliminación. |
| Documentos con detalles | `CU-REC-01`, `CU-ISS-01` | Encabezado, modal/formulario, tabla de detalles, DTO y transacción coordinadora. | La entrada incrementa stock al confirmarse; la salida no lo descuenta hasta surtir. |
| Operación de salidas | `CU-ISS-01`, `CU-ISS-02`, `CU-ISS-03` | Proceso de material replicable para merma, componentes informativos y coordinación de movimientos. | Inventario, conversión, permisos, estados y cantidades acumuladas del contexto. |
| Consulta y exportación | `CU-REP-01` y listados de los demás casos | Filtros, paginación, dependencias entre selects y utilidades Excel. | Columnas, agrupaciones, fórmulas y permiso de cada reporte. |

Reutilizar no significa fusionar reglas de negocio. Antes de crear otro flujo se revisan
los [patrones de diseño y construcción](../architecture/design-and-construction-patterns.md), se replica
el proceso existente sólo cuando cambia el contexto, y se mantienen explícitas sus
validaciones, transacciones y pruebas CRUD.

## Trazabilidad y mantenimiento

1. Al agregar, retirar o cambiar un objetivo de actor, se actualizan este catálogo y el
   diagrama de casos de uso en el mismo cambio.
2. Si cambia una operación, se revisan también la especificación, la matriz de
   operaciones y el plan de pruebas.
3. Las pruebas unitarias conservan la ruta paralela al código; las integraciones CRUD
   atraviesan HTTP y Prisma en `tests/integration/controllers/*DbTest.js`, conforme a
   la [estrategia de pruebas](../testing/service-test-coverage.md).
4. Un caso nuevo debe completar resumen, participantes e intereses, precondiciones,
   garantías de éxito, pasos del flujo principal, alternativas, excepciones y requisitos
   relacionados antes de considerarse documentado.
5. Proyectos, requisiciones y ajustes sin flujo HTTP completo permanecen en la
   especificación con su estado correspondiente; se incorporarán aquí sólo al pasar a
   alcance vigente.
