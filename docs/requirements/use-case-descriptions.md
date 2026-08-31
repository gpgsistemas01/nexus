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

## Estructura de las descripciones compartidas

Cada familia emplea las mismas secciones para documentar una sola vez las condiciones
que comparten sus casos específicos. El catálogo operativo separa los objetivos y los
diagramas separan sus recorridos; esta descripción aporta el contexto común sin volver a
fusionarlos bajo un verbo genérico:

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

## Catálogo operativo y granularidad

Un caso de uso expresa **un objetivo observable iniciado por un actor**. Verbos amplios
como «administrar» o «mantener» se conservan únicamente como títulos de familia para
compartir participantes, precondiciones y reglas; no reciben identificador `CU-*`. Los
identificadores se asignan a operaciones concretas que pueden autorizarse, probarse y
trazarse por separado.

ISO/IEC/IEEE 29148 orienta la ingeniería y calidad de requisitos, pero no prescribe una
plantilla UML obligatoria para redactar casos de uso. Por ello este catálogo no declara
una conformidad formal con esa norma: adopta criterios compatibles de identificación
única, necesidad, claridad, consistencia, factibilidad y verificabilidad. Cada ficha
contesta, con vocabulario de negocio, **quién inicia**, **qué lo dispara**, **qué debe
existir antes**, **qué recorrido exitoso sigue**, **qué resultado deja** y **cómo termina
si una regla falla**. Los detalles técnicos se conservan como evidencia, no como pasos que
el actor deba comprender.

| Familia | Identificador | Caso de uso específico | Evidencia ejecutable principal |
| --- | --- | --- | --- |
| Identidades y acceso | `CU-IAM-01` | Consultar identidades y accesos | Listados de personas y usuarios. |
| Identidades y acceso | `CU-IAM-02` | Crear persona | `personController` → `personService`. |
| Identidades y acceso | `CU-IAM-03` | Editar persona | `personController` → `personService`. |
| Identidades y acceso | `CU-IAM-04` | Crear usuario y asignar acceso | `userController` → `userService`. |
| Identidades y acceso | `CU-IAM-05` | Editar usuario o cambiar contraseña | Actualización de cuenta, acceso o credencial. |
| Catálogos | `CU-CAT-01` | Consultar catálogos | Listados parametrizados por recurso. |
| Catálogos | `CU-CAT-02` | Crear registro de catálogo | Creación de cliente, proveedor, material o merma. |
| Catálogos | `CU-CAT-03` | Editar registro de catálogo | Actualización del recurso. |
| Catálogos | `CU-CAT-04` | Eliminar o cambiar estado de registro | Política permitida por cada recurso. |
| Entradas | `CU-REC-01` | Consultar entradas | Listado de entradas. |
| Entradas | `CU-REC-02` | Registrar entrada | Creación transaccional de entrada. |
| Entradas | `CU-REC-03` | Editar entrada | Actualización de encabezado y detalles admitidos. |
| Entradas | `CU-REC-04` | Corregir detalle de entrada | Corrección con stock, movimiento e historial. |
| Entradas | `CU-REC-05` | Cancelar detalle de entrada | Reversión del efecto de inventario. |
| Salidas | `CU-ISS-01` | Consultar salidas | Listados de material o merma. |
| Salidas | `CU-ISS-02` | Crear salida | Creación en el contexto elegido. |
| Salidas | `CU-ISS-03` | Editar encabezado de salida | Actualización de campos admitidos. |
| Salidas | `CU-ISS-04` | Ajustar detalles de salida | Cambio de detalles todavía modificables. |
| Salidas | `CU-ISS-05` | Surtir detalle | Descuento de stock y movimiento. |
| Salidas | `CU-ISS-06` | Devolver detalle surtido | Reintegro de stock y movimiento inverso. |
| Consulta | `CU-REP-01` | Consultar movimientos e inventario | Consulta paginada y filtrada. |
| Consulta | `CU-REP-02` | Generar reporte | Consulta de reporte y exportación. |

La evidencia orienta la búsqueda, pero no impone una organización por casos de uso
dentro de `src`: la aplicación está organizada por capas y dominio. Las pruebas
unitarias siguen la ubicación paralela al artefacto y las integraciones CRUD permanecen
bajo `tests/integration/controllers`.

## Fichas específicas de los casos de uso

Las fichas siguientes son la descripción normativa de cada `CU-*`. Las secciones por
familia que aparecen después amplían intereses, reglas compartidas y variantes sin
fusionar otra vez los objetivos.

### Identidades y accesos

| Caso | Actor y disparador | Precondiciones | Flujo exitoso resumido | Resultado y fallo protegido |
| --- | --- | --- | --- | --- |
| `CU-IAM-01` Consultar identidades y accesos | Administración necesita localizar personas, cuentas o asignaciones. | Sesión y permiso de consulta vigentes. | Elegir listado; aplicar filtros; revisar resultados paginados. | Muestra únicamente datos autorizados; un filtro inválido no modifica información. |
| `CU-IAM-02` Crear persona | Administración necesita registrar a una persona que participa en la operación. | La identidad no está duplicada y los datos obligatorios están disponibles. | Capturar datos; validar identidad; confirmar creación. | La persona queda disponible para relacionarse; ante datos inválidos no se crea. |
| `CU-IAM-03` Editar persona | Administración necesita corregir datos de una persona existente. | La persona existe y los campos son modificables. | Localizar persona; editar campos admitidos; validar y confirmar. | Se actualizan sólo los campos admitidos; un conflicto conserva los valores anteriores. |
| `CU-IAM-04` Crear usuario y asignar acceso | Administración necesita otorgar acceso a una persona. | Persona, rol y área existen; la cuenta no está duplicada. | Capturar cuenta; seleccionar persona, rol y área; validar; crear. | La cuenta y su asignación quedan vinculadas; cualquier fallo evita una asignación parcial. |
| `CU-IAM-05` Editar usuario o cambiar contraseña | Administración necesita corregir la cuenta, reemplazar su asignación o renovar su credencial. | El usuario existe; persona, rol y departamento son válidos cuando se cambia la asignación. | Localizar usuario; editar cuenta y acceso o capturar otra contraseña; validar; confirmar. | La edición de cuenta y acceso es atómica, y la contraseña se almacena cifrada; un rechazo conserva los valores anteriores. |

### Catálogos

El actor es el personal que posee el permiso del recurso elegido: almacén para sus
catálogos operativos y administración cuando corresponda al catálogo contextual. Esta
formulación evita atribuir todos los catálogos a un área que no los opera.

| Caso | Disparador | Precondiciones | Flujo exitoso resumido | Resultado y fallo protegido |
| --- | --- | --- | --- | --- |
| `CU-CAT-01` Consultar catálogos | El actor necesita localizar un registro para usarlo o revisarlo. | Sesión, permiso y catálogo vigentes. | Elegir catálogo; filtrar; ordenar o paginar; revisar resultados. | Presenta registros autorizados sin modificar el catálogo. |
| `CU-CAT-02` Crear registro de catálogo | El actor necesita incorporar un cliente, proveedor, material o merma. | Relaciones requeridas existentes e identidad no duplicada. | Elegir recurso; capturar datos; validar; crear; refrescar listado. | El registro queda disponible; una validación fallida no escribe datos parciales. |
| `CU-CAT-03` Editar registro de catálogo | El actor necesita corregir datos de un registro existente. | Registro existente, permiso vigente y campos modificables. | Localizar; editar; validar identidad y relaciones; confirmar. | Actualiza sólo datos admitidos; un conflicto conserva la versión anterior. |
| `CU-CAT-04` Eliminar o cambiar estado de registro | El actor necesita retirar un registro del uso operativo. | Registro existente y política del recurso conocida. | Solicitar retiro; comprobar relaciones; eliminar o cambiar estado según la política. | El recurso deja de estar disponible de la forma permitida; relaciones protegidas impiden eliminación física. |

### Entradas

| Caso | Actor y disparador | Precondiciones | Flujo exitoso resumido | Resultado y fallo protegido |
| --- | --- | --- | --- | --- |
| `CU-REC-01` Consultar entradas | Almacén necesita localizar una recepción o revisar sus detalles. | Sesión y permiso de consulta vigentes. | Aplicar filtros; abrir entrada; revisar encabezado, detalles e historia. | Presenta la recepción sin alterar inventario. |
| `CU-REC-02` Registrar entrada | Almacén recibe materiales de un proveedor. | Proveedor y materiales existen; factura y cantidades son válidas. | Capturar encabezado y detalles; validar; confirmar la transacción. | Entrada, stock y movimientos quedan conciliados; un fallo revierte todo. |
| `CU-REC-03` Editar entrada | Almacén necesita corregir el encabezado o agregar detalles admitidos. | Entrada existente, no cancelada y campos modificables. | Abrir entrada; modificar encabezado o agregar detalle; validar; confirmar. | Conserva proveedor y datos inmutables; un rechazo mantiene la entrada anterior. |
| `CU-REC-04` Corregir detalle de entrada | Almacén detecta diferencia de cantidad o costo en un detalle persistido. | Detalle activo, motivo existente y stock suficiente si la corrección lo reduce. | Capturar valores corregidos; calcular diferencia; ajustar stock, movimiento y totales; registrar historia. | Conserva valores anterior y resultante; cualquier fallo produce rollback. |
| `CU-REC-05` Cancelar detalle de entrada | Almacén determina que un detalle recibido debe anularse. | Detalle activo, motivo de cancelación existente y reversión de stock posible. | Confirmar cancelación; revertir inventario; actualizar totales; registrar movimiento e historia. | El detalle queda cancelado sin borrarse; un fallo no deja reversión parcial. |

### Salidas

| Caso | Actor y disparador | Precondiciones | Flujo exitoso resumido | Resultado y fallo protegido |
| --- | --- | --- | --- | --- |
| `CU-ISS-01` Consultar salidas | Almacén necesita localizar una salida de material o merma. | Sesión y permiso del contexto vigentes. | Elegir contexto; filtrar listado; abrir encabezado y detalles. | Presenta cantidades y estados sin modificar stock. |
| `CU-ISS-02` Crear salida | Almacén recibe una solicitud de material o merma. | Catálogos y relaciones del contexto existen. | Elegir contexto; capturar encabezado y detalles; validar; confirmar. | Crea una salida pendiente sin descontar stock; un fallo no crea documento parcial. |
| `CU-ISS-03` Editar encabezado de salida | Almacén necesita corregir datos contextuales de una salida. | Salida existente y estado que admite edición. | Abrir salida; editar campos permitidos; validar; confirmar. | Actualiza el encabezado sin reescribir cantidades históricas. |
| `CU-ISS-04` Ajustar detalles de salida | Almacén necesita agregar o cambiar cantidades todavía modificables. | Salida existente y detalles no consolidados por surtimiento o devolución. | Editar o agregar detalle; validar recurso y cantidad; recalcular estado; confirmar. | Detalles pendientes quedan consistentes; cantidades surtidas o devueltas permanecen inmutables. |
| `CU-ISS-05` Surtir detalle | Almacén entrega total o parcialmente un detalle pendiente. | Cantidad pendiente positiva y existencia suficiente. | Indicar cantidad; validar; descontar stock; acumular surtido; derivar estados; crear movimiento. | Documento, detalle, stock y movimiento coinciden; un fallo revierte todo. |
| `CU-ISS-06` Devolver detalle surtido | Almacén recibe una devolución asociada a una salida. | Existe cantidad surtida todavía retornable. | Indicar cantidad; validar; reintegrar stock; acumular devolución; derivar estados; crear movimiento inverso. | Conserva surtimiento y devolución trazables; un fallo no modifica acumulados. |

### Consultas y reportes

| Caso | Actor y disparador | Precondiciones | Flujo exitoso resumido | Resultado y fallo protegido |
| --- | --- | --- | --- | --- |
| `CU-REP-01` Consultar movimientos e inventario | Personal autorizado necesita conocer existencias o rastrear movimientos. | Sesión, permiso y filtros dentro de su alcance. | Elegir consulta; capturar filtros; validar; revisar página y totales. | Presenta información autorizada sin cambiar datos operativos. |
| `CU-REP-02` Generar reporte | Personal autorizado necesita analizar o entregar información consolidada. | Reporte disponible y permiso de sus datos. | Elegir reporte y parámetros; consultar; revisar vista o solicitar archivo. | Produce vista o archivo con columnas autorizadas; parámetros inválidos no generan resultados engañosos. |

## 1. Acceso e identidades

### Familia IAM — Personas, usuarios y accesos

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

### Familia CAT-A — Catálogos de almacén

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

### Familia CAT-B — Clientes como catálogo contextual

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

### Familia REC — Entradas y correcciones

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

`RF-REC-001` a `RF-REC-006`, `RN-002`, `RN-004`, `RN-005`.

## 4. Salidas, surtido y devolución

### Familia ISS-A — Creación y edición de salidas

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

### Familia ISS-B — Surtimiento de detalles

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

### Familia ISS-C — Devolución de detalles surtidos

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

### Familia REP — Movimientos y reportes

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
| CRUD de identidades y catálogos | `CU-IAM-01` a `CU-IAM-05`; `CU-CAT-01` a `CU-CAT-04` | Fábricas CRUD, listados, formularios, validación y refresco de tabla. | Permisos, identidad del recurso, relaciones y política de eliminación. |
| Documentos con detalles | `CU-REC-02`, `CU-REC-03`, `CU-ISS-02` a `CU-ISS-04` | Encabezado, modal/formulario, tabla de detalles, DTO y transacción coordinadora. | La entrada incrementa stock al confirmarse; la salida no lo descuenta hasta surtir. |
| Operación de salidas | `CU-ISS-02` a `CU-ISS-06` | Proceso de material replicable para merma, componentes informativos y coordinación de movimientos. | Inventario, conversión, permisos, estados y cantidades acumuladas del contexto. |
| Consulta y exportación | `CU-REP-01`, `CU-REP-02` y casos de consulta de cada familia | Filtros, paginación, dependencias entre selects y utilidades Excel. | Columnas, agrupaciones, fórmulas y permiso de cada reporte. |

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
