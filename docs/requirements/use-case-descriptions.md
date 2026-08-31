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

## Estructura de las fichas

Cada caso emplea la misma tabla de dos columnas y conserva dentro de ella toda la
información que permite recorrer su objetivo sin consultar una segunda descripción:

- **Identificador y nombre:** identidad estable y objetivo observable.
- **Actor y disparador:** responsable que inicia el caso y necesidad que lo activa.
- **Precondiciones:** estado que debe existir antes del primer paso.
- **Flujo principal:** pasos numerados del escenario exitoso.
- **Flujos alternativos:** variantes válidas enlazadas al paso correspondiente.
- **Excepciones:** punto de rechazo o fallo y efecto protegido.
- **Resultado y fallo protegido:** estado final observable y garantía mínima.
- **Reglas y requisitos relacionados:** referencias a criterios normativos que no se
  duplican dentro de la ficha.

Cada flujo alternativo indica el paso del flujo principal desde el que se inicia y cada
excepción identifica el paso o flujo alternativo en el que puede ocurrir. Así, la
variante o el rechazo puede localizarse sin inferir su punto de extensión a partir de
otra sección. Los párrafos de paquete sólo declaran contexto realmente compartido y no
mantienen una segunda versión de los flujos.

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

### Convención de paquetes e identificadores

Los paquetes agrupan objetivos por capacidad de negocio y reducen el tamaño de cada
vista; no representan permisos, capas de código ni unidades de despliegue. El catálogo
usa `CU-<PAQUETE>-<SECUENCIA>`: el código de paquete es estable, la secuencia comienza en
`01` dentro de cada paquete y un identificador retirado no se reasigna. Esta convención
mantiene la identidad del caso separada de su título y permite agregar casos sin
renumerar otros paquetes.

| Código | Paquete | Alcance |
| --- | --- | --- |
| `IDA` | Identidad y acceso | Personas, cuentas, credenciales y asignaciones de acceso. |
| `CAT` | Catálogos | Recursos operativos y contextuales reutilizados por documentos. |
| `ENT` | Entradas | Consulta, registro, edición, corrección y cancelación de recepciones. |
| `SAL` | Salidas | Consulta, creación, edición, surtimiento y devolución. |
| `REP` | Consultas y reportes | Movimientos, inventario, vistas consolidadas y archivos. |

Los prefijos anteriores sustituyen `IAM`, `REC` e `ISS`, que mezclaban abreviaturas en
inglés con nombres de paquetes en español. Las referencias normativas se actualizan en
conjunto; el cambio de identificador no modifica el alcance funcional del caso.

### Paquete IDA — Identidad y acceso

| Identificador | Caso de uso específico | Evidencia ejecutable principal |
| --- | --- | --- |
| `CU-IDA-01` | Consultar identidades y accesos | Listados de personas y usuarios. |
| `CU-IDA-02` | Crear persona | `personController` → `personService`. |
| `CU-IDA-03` | Editar persona | `personController` → `personService`. |
| `CU-IDA-04` | Crear usuario y asignar acceso | `userController` → `userService`. |
| `CU-IDA-05` | Editar usuario o cambiar contraseña | Actualización de cuenta, acceso o credencial. |

### Paquete CAT — Catálogos

| Identificador | Caso de uso específico | Evidencia ejecutable principal |
| --- | --- | --- |
| `CU-CAT-01` | Consultar catálogos | Listados parametrizados por recurso. |
| `CU-CAT-02` | Crear registro de catálogo | Creación de cliente, proveedor, material o merma. |
| `CU-CAT-03` | Editar registro de catálogo | Actualización del recurso. |
| `CU-CAT-04` | Eliminar o cambiar estado de registro | Política permitida por cada recurso. |

### Paquete ENT — Entradas

| Identificador | Caso de uso específico | Evidencia ejecutable principal |
| --- | --- | --- |
| `CU-ENT-01` | Consultar entradas | Listado de entradas. |
| `CU-ENT-02` | Registrar entrada | Creación transaccional de entrada. |
| `CU-ENT-03` | Editar entrada | Actualización de encabezado y detalles admitidos. |
| `CU-ENT-04` | Corregir detalle de entrada | Corrección con stock, movimiento e historial. |
| `CU-ENT-05` | Cancelar detalle de entrada | Reversión del efecto de inventario. |

### Paquete SAL — Salidas

| Identificador | Caso de uso específico | Evidencia ejecutable principal |
| --- | --- | --- |
| `CU-SAL-01` | Consultar salidas | Listados de material o merma. |
| `CU-SAL-02` | Crear salida | Creación en el contexto elegido. |
| `CU-SAL-03` | Editar encabezado de salida | Actualización de campos admitidos. |
| `CU-SAL-04` | Ajustar detalles de salida | Cambio de detalles todavía modificables. |
| `CU-SAL-05` | Surtir detalle | Descuento de stock y movimiento. |
| `CU-SAL-06` | Devolver detalle surtido | Reintegro de stock y movimiento inverso. |

### Paquete REP — Consultas y reportes

| Identificador | Caso de uso específico | Evidencia ejecutable principal |
| --- | --- | --- |
| `CU-REP-01` | Consultar movimientos e inventario | Consulta paginada y filtrada. |
| `CU-REP-02` | Generar reporte | Consulta de reporte y exportación. |

La evidencia orienta la búsqueda, pero no impone una organización por casos de uso
dentro de `src`: la aplicación está organizada por capas y dominio. Las pruebas
unitarias siguen la ubicación paralela al artefacto y las integraciones CRUD permanecen
bajo `tests/integration/controllers`.

## Fichas específicas de los casos de uso

Las fichas siguientes son la descripción normativa completa de cada `CU-*`. Cada ficha
usa dos columnas: **Sección** identifica el dato descrito e **Información relevante**
contiene su valor para ese caso. El contexto compartido se declara una sola vez al inicio
del paquete; flujos, excepciones y reglas permanecen dentro del caso al que aplican.

### Paquete IDA — Identidad y acceso

#### `CU-IDA-01` — Consultar identidades y accesos

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-IDA-01` |
| Nombre | Consultar identidades y accesos. |
| Actor y disparador | Administración necesita localizar personas, cuentas o asignaciones. |
| Precondiciones | Sesión y permiso de consulta vigentes. |
| Flujo principal | 1. Elegir listado.<br>2. Aplicar filtros.<br>3. Revisar resultados paginados. |
| Flujos alternativos | A1 — Consulta de roles o departamentos, desde el paso 2: presentarlos como apoyo sin habilitar su mantenimiento. |
| Excepciones | E1 — Operación no autorizada, antes de consultar: no exponer datos. E2 — Filtro inválido, al aplicar filtros: rechazarlo sin modificar información. |
| Resultado y fallo protegido | Muestra únicamente datos autorizados; un filtro inválido no modifica información. |
| Reglas y requisitos relacionados | `RF-IAM-001` a `RF-IAM-003`, `RN-001`, `RN-009`, `RN-010`. |

#### `CU-IDA-02` — Crear persona

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-IDA-02` |
| Nombre | Crear persona. |
| Actor y disparador | Administración necesita registrar a una persona que participa en la operación. |
| Precondiciones | La identidad no está duplicada y los datos obligatorios están disponibles. |
| Flujo principal | 1. Capturar datos.<br>2. Validar identidad.<br>3. Confirmar creación. |
| Flujos alternativos | No aplica: la creación sigue el flujo principal. |
| Excepciones | E1 — Identidad o datos inválidos, al validar: no persistir la persona. E2 — Operación no autorizada, antes de crear: no modificar datos. |
| Resultado y fallo protegido | La persona queda disponible para relacionarse; ante datos inválidos no se crea. |
| Reglas y requisitos relacionados | `RF-IAM-007`, `RN-001`, `RN-009`, `RN-010`. |

#### `CU-IDA-03` — Editar persona

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-IDA-03` |
| Nombre | Editar persona. |
| Actor y disparador | Administración necesita corregir datos de una persona existente. |
| Precondiciones | La persona existe y los campos son modificables. |
| Flujo principal | 1. Localizar persona.<br>2. Editar campos admitidos.<br>3. Validar y confirmar. |
| Flujos alternativos | No aplica: la edición sigue el flujo principal. |
| Excepciones | E1 — Datos inválidos o conflicto, al validar: conservar los valores anteriores. E2 — Operación no autorizada, antes de editar: no modificar datos. |
| Resultado y fallo protegido | Se actualizan sólo los campos admitidos; un conflicto conserva los valores anteriores. |
| Reglas y requisitos relacionados | `RF-IAM-008`, `RN-001`, `RN-009`, `RN-010`. |

#### `CU-IDA-04` — Crear usuario y asignar acceso

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-IDA-04` |
| Nombre | Crear usuario y asignar acceso. |
| Actor y disparador | Administración necesita otorgar acceso a una persona. |
| Precondiciones | Persona, rol y área existen; la cuenta no está duplicada. |
| Flujo principal | 1. Capturar cuenta.<br>2. Seleccionar persona, rol y área.<br>3. Validar.<br>4. Crear. |
| Flujos alternativos | A1 — Cuenta sin persona, desde la captura: omitir el vínculo personal y continuar la creación. |
| Excepciones | E1 — Cuenta, persona, rol o área inválidos, al validar: no crear cuenta ni asignación parcial. E2 — Operación no autorizada, antes de crear: no modificar datos. |
| Resultado y fallo protegido | La cuenta y su asignación quedan vinculadas; cualquier fallo evita una asignación parcial. |
| Reglas y requisitos relacionados | `RF-IAM-004`, `RN-001`, `RN-009`, `RN-010`, `RN-008`. |

#### `CU-IDA-05` — Editar usuario o cambiar contraseña

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-IDA-05` |
| Nombre | Editar usuario o cambiar contraseña. |
| Actor y disparador | Administración necesita corregir la cuenta, reemplazar su asignación o renovar su credencial. |
| Precondiciones | El usuario existe; persona, rol y departamento son válidos cuando se cambia la asignación. |
| Flujo principal | 1. Localizar usuario.<br>2. Editar cuenta y acceso o capturar otra contraseña.<br>3. Validar.<br>4. Confirmar. |
| Flujos alternativos | A1 — Cambio de contraseña o acceso, desde la selección del usuario: ejecutar la acción especializada y volver a la lectura final. |
| Excepciones | E1 — Cuenta, acceso o credencial inválidos, al validar: conservar los valores anteriores. E2 — Fallo transaccional, al reemplazar la asignación: revertir toda la edición. |
| Resultado y fallo protegido | La edición de cuenta y acceso es atómica, y la contraseña se almacena cifrada; un rechazo conserva los valores anteriores. |
| Reglas y requisitos relacionados | `RF-IAM-005`, `RF-IAM-006`, `RN-001`, `RN-009`, `RN-010`, `RN-008`. |

### Paquete CAT — Catálogos

El actor es el personal que posee el permiso del recurso elegido: almacén para sus
catálogos operativos y administración cuando corresponda al catálogo contextual. Esta
formulación evita atribuir todos los catálogos a un área que no los opera.

#### `CU-CAT-01` — Consultar catálogos

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-01` |
| Nombre | Consultar catálogos. |
| Disparador | El actor necesita localizar un registro para usarlo o revisarlo. |
| Precondiciones | Sesión, permiso y catálogo vigentes. |
| Flujo principal | 1. Elegir catálogo.<br>2. Filtrar.<br>3. Ordenar o paginar.<br>4. Revisar resultados. |
| Flujos alternativos | A1 — Catálogo auxiliar, desde la elección del recurso: ofrecer sólo consulta cuando el catálogo no admite mantenimiento. |
| Excepciones | E1 — Operación no autorizada, antes de consultar: no exponer el catálogo. E2 — Filtro inválido, al consultar: no modificar datos. |
| Resultado y fallo protegido | Presenta registros autorizados sin modificar el catálogo. |
| Reglas y requisitos relacionados | `RF-CAT-001` a `RF-CAT-005`, `RN-001`, `RN-009`, `RN-010`. |

#### `CU-CAT-02` — Crear registro de catálogo

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-02` |
| Nombre | Crear registro de catálogo. |
| Disparador | El actor necesita incorporar un cliente, proveedor, material o merma. |
| Precondiciones | Relaciones requeridas existentes e identidad no duplicada. |
| Flujo principal | 1. Elegir recurso.<br>2. Capturar datos.<br>3. Validar.<br>4. Crear.<br>5. Refrescar listado. |
| Flujos alternativos | A1 — Merma desde plantilla, desde la captura: copiar los snapshots aplicables sin relacionarla permanentemente con el material. |
| Excepciones | E1 — Duplicidad, relación o dato inválido, al validar: no crear registros parciales. E2 — Operación no autorizada, antes de crear: no modificar el catálogo. |
| Resultado y fallo protegido | El registro queda disponible; una validación fallida no escribe datos parciales. |
| Reglas y requisitos relacionados | `RF-CAT-006`, `RF-CAT-010`, `RF-CAT-013`, `RF-CAT-015`, `RF-MER-001`, `RF-MER-002`, `RF-MER-004`, `RF-MER-007` a `RF-MER-009`, `RN-001`, `RN-009`, `RN-010`, `RN-020` a `RN-022`. |

#### `CU-CAT-03` — Editar registro de catálogo

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-03` |
| Nombre | Editar registro de catálogo. |
| Disparador | El actor necesita corregir datos de un registro existente. |
| Precondiciones | Registro existente, permiso vigente y campos modificables. |
| Flujo principal | 1. Localizar.<br>2. Editar.<br>3. Validar identidad y relaciones.<br>4. Confirmar. |
| Flujos alternativos | A1 — Recurso con estado, desde la selección: actualizar únicamente los campos permitidos por su política. |
| Excepciones | E1 — Duplicidad, relación o dato inválido, al validar: conservar la versión anterior. E2 — Campo inmutable, durante la edición: rechazar su modificación. |
| Resultado y fallo protegido | Actualiza sólo datos admitidos; un conflicto conserva la versión anterior. |
| Reglas y requisitos relacionados | `RF-CAT-007`, `RF-CAT-011`, `RF-CAT-014`, `RF-CAT-016`, `RF-CAT-017`, `RF-MER-003`, `RF-MER-005`, `RF-MER-006`, `RN-001`, `RN-009`, `RN-010`, `RN-006`. |

#### `CU-CAT-04` — Eliminar o cambiar estado de registro

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-04` |
| Nombre | Eliminar o cambiar estado de registro. |
| Disparador | El actor necesita retirar un registro del uso operativo. |
| Precondiciones | Registro existente y política del recurso conocida. |
| Flujo principal | 1. Solicitar retiro.<br>2. Comprobar relaciones.<br>3. Eliminar o cambiar estado según la política. |
| Flujos alternativos | A1 — Eliminación física, desde la solicitud de retiro: eliminar sólo sin relaciones protegidas. A2 — Cambio de estado: activar o desactivar cuando el recurso no admite eliminación. |
| Excepciones | E1 — Relación histórica protegida, al evaluar la eliminación: conservar el recurso. E2 — Política sin acción de retiro, al solicitarla: rechazar la operación. |
| Resultado y fallo protegido | El recurso deja de estar disponible de la forma permitida; relaciones protegidas impiden eliminación física. |
| Reglas y requisitos relacionados | `RF-CAT-008`, `RN-001`, `RN-009`, `RN-010`, `RN-007`. |

### Paquete ENT — Entradas

#### `CU-ENT-01` — Consultar entradas

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ENT-01` |
| Nombre | Consultar entradas. |
| Actor y disparador | Almacén necesita localizar una recepción o revisar sus detalles. |
| Precondiciones | Sesión y permiso de consulta vigentes. |
| Flujo principal | 1. Aplicar filtros.<br>2. Abrir entrada.<br>3. Revisar encabezado, detalles e historia. |
| Flujos alternativos | No aplica: la consulta sigue el flujo principal. |
| Excepciones | E1 — Operación no autorizada, antes de consultar: no exponer entradas. E2 — Filtro inválido, al consultar: no modificar datos. |
| Resultado y fallo protegido | Presenta la recepción sin alterar inventario. |
| Reglas y requisitos relacionados | `RF-REC-001`, `RN-001`, `RN-009`, `RN-010`. |

#### `CU-ENT-02` — Registrar entrada

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ENT-02` |
| Nombre | Registrar entrada. |
| Actor y disparador | Almacén recibe materiales de un proveedor. |
| Precondiciones | Proveedor y materiales existen; factura y cantidades son válidas. |
| Flujo principal | 1. Capturar encabezado y detalles.<br>2. Validar.<br>3. Confirmar la transacción. |
| Flujos alternativos | A1 — Material repetido, desde la captura de detalles: admitir renglones distintos cuando representan lotes o precios diferentes. |
| Excepciones | E1 — Factura duplicada, al validar: identificar la entrada existente y no escribir. E2 — Fallo en la transacción: revertir entrada, existencias y movimientos. |
| Resultado y fallo protegido | Entrada, stock y movimientos quedan conciliados; un fallo revierte todo. |
| Reglas y requisitos relacionados | `RF-REC-003`, `RF-REC-004`, `RF-REC-007`, `RN-002`, `RN-004`, `RN-013`, `RN-018`. |

#### `CU-ENT-03` — Editar entrada

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ENT-03` |
| Nombre | Editar entrada. |
| Actor y disparador | Almacén necesita corregir el encabezado o agregar detalles admitidos. |
| Precondiciones | Entrada existente, no cancelada y campos modificables. |
| Flujo principal | 1. Abrir entrada.<br>2. Modificar encabezado o agregar detalle.<br>3. Validar.<br>4. Confirmar. |
| Flujos alternativos | A1 — Agregar detalle, después de abrir la entrada: incorporar únicamente detalles nuevos admitidos. |
| Excepciones | E1 — Cambio de proveedor o fila persistida enviada como nueva, al validar: rechazarlo. E2 — Fallo transaccional: conservar la entrada anterior. |
| Resultado y fallo protegido | Conserva proveedor y datos inmutables; un rechazo mantiene la entrada anterior. |
| Reglas y requisitos relacionados | `RF-REC-005`, `RN-002`. |

#### `CU-ENT-04` — Corregir detalle de entrada

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ENT-04` |
| Nombre | Corregir detalle de entrada. |
| Actor y disparador | Almacén detecta diferencia de cantidad o costo en un detalle persistido. |
| Precondiciones | Detalle activo, motivo existente y stock suficiente si la corrección lo reduce. |
| Flujo principal | 1. Capturar valores corregidos.<br>2. Calcular diferencia.<br>3. Ajustar stock, movimiento y totales.<br>4. Registrar historia. |
| Flujos alternativos | A1 — Corrección de cantidad o costo, desde la selección del detalle: calcular la diferencia y coordinar inventario, totales e historia. |
| Excepciones | E1 — Detalle, motivo, cantidad o existencia inválidos, al validar: no aplicar la corrección. E2 — Fallo transaccional: revertir inventario, totales, movimiento e historia. |
| Resultado y fallo protegido | Conserva valores anterior y resultante; cualquier fallo produce rollback. |
| Reglas y requisitos relacionados | `RF-REC-002`, `RN-002`, `RN-005`, `RN-012`, `RN-013`, `RN-017`. |

#### `CU-ENT-05` — Cancelar detalle de entrada

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ENT-05` |
| Nombre | Cancelar detalle de entrada. |
| Actor y disparador | Almacén determina que un detalle recibido debe anularse. |
| Precondiciones | Detalle activo, motivo de cancelación existente y reversión de stock posible. |
| Flujo principal | 1. Confirmar cancelación.<br>2. Revertir inventario.<br>3. Actualizar totales.<br>4. Registrar movimiento e historia. |
| Flujos alternativos | A1 — Cancelación confirmada, desde la selección del detalle: revertir su efecto sin borrar el registro histórico. |
| Excepciones | E1 — Detalle, motivo o reversión inválidos, al validar: no cancelar. E2 — Fallo transaccional: no dejar una reversión parcial. |
| Resultado y fallo protegido | El detalle queda cancelado sin borrarse; un fallo no deja reversión parcial. |
| Reglas y requisitos relacionados | `RF-REC-008`, `RN-002`, `RN-005`, `RN-012`, `RN-017`. |

### Paquete SAL — Salidas

#### `CU-SAL-01` — Consultar salidas

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-SAL-01` |
| Nombre | Consultar salidas. |
| Actor y disparador | Almacén necesita localizar una salida de material o merma. |
| Precondiciones | Sesión y permiso del contexto vigentes. |
| Flujo principal | 1. Elegir contexto.<br>2. Filtrar listado.<br>3. Abrir encabezado y detalles. |
| Flujos alternativos | A1 — Contexto de merma, desde la elección del tipo: consultar el inventario y las reglas propios de merma. |
| Excepciones | E1 — Operación no autorizada, antes de consultar: no exponer salidas. E2 — Contexto o filtro inválido, al consultar: no modificar datos. |
| Resultado y fallo protegido | Presenta cantidades y estados sin modificar stock. |
| Reglas y requisitos relacionados | `RF-ISS-001`, `RF-WST-007`, `RN-001`, `RN-009`, `RN-010`. |

#### `CU-SAL-02` — Crear salida

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-SAL-02` |
| Nombre | Crear salida. |
| Actor y disparador | Almacén recibe una solicitud de material o merma. |
| Precondiciones | Catálogos y relaciones del contexto existen. |
| Flujo principal | 1. Elegir contexto.<br>2. Capturar encabezado y detalles.<br>3. Validar.<br>4. Confirmar. |
| Flujos alternativos | A1 — Contexto de merma, desde la elección del tipo: reutilizar encabezado y detalles con el inventario de merma. |
| Excepciones | E1 — Encabezado, detalle o contexto inválidos, al validar: no crear un documento parcial. E2 — Operación no autorizada, antes de crear: no modificar datos. |
| Resultado y fallo protegido | Crea una salida pendiente sin descontar stock; un fallo no crea documento parcial. |
| Reglas y requisitos relacionados | `RF-ISS-004`, `RF-WST-002`, `RN-001`, `RN-009`, `RN-010`, `RN-013`, `RN-019`. |

#### `CU-SAL-03` — Editar encabezado de salida

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-SAL-03` |
| Nombre | Editar encabezado de salida. |
| Actor y disparador | Almacén necesita corregir datos contextuales de una salida. |
| Precondiciones | Salida existente y estado que admite edición. |
| Flujo principal | 1. Abrir salida.<br>2. Editar campos permitidos.<br>3. Validar.<br>4. Confirmar. |
| Flujos alternativos | A1 — Contexto de merma, desde la elección del tipo: editar sólo los campos permitidos del encabezado correspondiente. |
| Excepciones | E1 — Estado o campo inválidos, al validar: conservar el encabezado anterior. E2 — Intento de cambiar cantidades históricas: rechazar la edición. |
| Resultado y fallo protegido | Actualiza el encabezado sin reescribir cantidades históricas. |
| Reglas y requisitos relacionados | `RF-ISS-005`, `RF-WST-004`, `RN-001`, `RN-009`, `RN-010`, `RN-015`, `RN-016`. |

#### `CU-SAL-04` — Ajustar detalles de salida

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-SAL-04` |
| Nombre | Ajustar detalles de salida. |
| Actor y disparador | Almacén necesita agregar o cambiar cantidades todavía modificables. |
| Precondiciones | Salida existente y detalles no consolidados por surtimiento o devolución. |
| Flujo principal | 1. Editar o agregar detalle.<br>2. Validar recurso y cantidad.<br>3. Recalcular estado.<br>4. Confirmar. |
| Flujos alternativos | A1 — Agregar detalle, desde el documento abierto: incorporar el detalle y repetir validación, persistencia y cálculo de estado. A2 — Contexto de merma: aplicar sus reglas de inventario. |
| Excepciones | E1 — Estado, recurso o cantidad inválidos, al validar: conservar los detalles anteriores. E2 — Cantidad ya surtida o devuelta, antes de persistir: rechazar la reescritura. |
| Resultado y fallo protegido | Detalles pendientes quedan consistentes; cantidades surtidas o devueltas permanecen inmutables. |
| Reglas y requisitos relacionados | `RF-ISS-006`, `RF-WST-005`, `RN-002`, `RN-003`, `RN-013`, `RN-015`, `RN-016`. |

#### `CU-SAL-05` — Surtir detalle

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-SAL-05` |
| Nombre | Surtir detalle. |
| Actor y disparador | Almacén entrega total o parcialmente un detalle pendiente. |
| Precondiciones | Cantidad pendiente positiva y existencia suficiente. |
| Flujo principal | 1. Indicar cantidad.<br>2. Validar.<br>3. Descontar stock.<br>4. Acumular surtido.<br>5. Derivar estados.<br>6. Crear movimiento. |
| Flujos alternativos | A1 — Surtimiento parcial, desde la cantidad indicada: conservar pendiente la diferencia. A2 — Contexto de merma: aplicar existencia y conversión propias. |
| Excepciones | E1 — Cantidad inválida o existencia insuficiente, al validar: no surtir. E2 — Fallo transaccional: revertir acumulado, existencia, estados y movimiento. |
| Resultado y fallo protegido | Documento, detalle, stock y movimiento coinciden; un fallo revierte todo. |
| Reglas y requisitos relacionados | `RF-ISS-002`, `RF-WST-003`, `RN-002` a `RN-004`, `RN-012`, `RN-013`, `RN-015`, `RN-016`. |

#### `CU-SAL-06` — Devolver detalle surtido

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-SAL-06` |
| Nombre | Devolver detalle surtido. |
| Actor y disparador | Almacén recibe una devolución asociada a una salida. |
| Precondiciones | Existe cantidad surtida todavía retornable. |
| Flujo principal | 1. Indicar cantidad.<br>2. Validar.<br>3. Reintegrar stock.<br>4. Acumular devolución.<br>5. Derivar estados.<br>6. Crear movimiento inverso. |
| Flujos alternativos | A1 — Devolución parcial, desde la cantidad indicada: conservar como surtida la diferencia no devuelta. A2 — Contexto de merma: aplicar existencia y conversión propias. |
| Excepciones | E1 — Cantidad inválida o superior a la retornable, al validar: no devolver. E2 — Fallo transaccional: revertir devolución, existencia, estados y movimiento inverso. |
| Resultado y fallo protegido | Conserva surtimiento y devolución trazables; un fallo no modifica acumulados. |
| Reglas y requisitos relacionados | `RF-ISS-003`, `RF-WST-006`, `RN-002` a `RN-004`, `RN-013` a `RN-016`. |

### Paquete REP — Consultas y reportes

#### `CU-REP-01` — Consultar movimientos e inventario

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-REP-01` |
| Nombre | Consultar movimientos e inventario. |
| Actor y disparador | Personal autorizado necesita conocer existencias o rastrear movimientos. |
| Precondiciones | Sesión, permiso y filtros dentro de su alcance. |
| Flujo principal | 1. Elegir consulta.<br>2. Capturar filtros.<br>3. Validar.<br>4. Revisar página y totales. |
| Flujos alternativos | A1 — Filtro dependiente, desde la captura: habilitar inventario después del proveedor y limpiar la selección dependiente al cambiarlo. A2 — Sin resultados: presentar una colección válida vacía. |
| Excepciones | E1 — Ámbito no autorizado, antes de consultar: no exponer datos. E2 — Filtros inválidos, al validarlos: solicitar corrección y no generar resultados ambiguos. |
| Resultado y fallo protegido | Presenta información autorizada sin cambiar datos operativos. |
| Reglas y requisitos relacionados | `RF-REP-001`, `RN-001`, `RN-009`, `RN-010`. |

#### `CU-REP-02` — Generar reporte

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-REP-02` |
| Nombre | Generar reporte. |
| Actor y disparador | Personal autorizado necesita analizar o entregar información consolidada. |
| Precondiciones | Reporte disponible y permiso de sus datos. |
| Flujo principal | 1. Elegir reporte y parámetros.<br>2. Consultar.<br>3. Revisar vista o solicitar archivo. |
| Flujos alternativos | A1 — Vista sin exportación, después de consultar: terminar tras revisar el resultado. A2 — Reporte de mermas: aplicar su agrupación y dimensiones. A3 — Sin resultados: producir una salida válida sin filas. |
| Excepciones | E1 — Ámbito no autorizado, antes de consultar o exportar: no exponer datos. E2 — Parámetros inválidos, al validarlos: no generar vista ni archivo engañosos. |
| Resultado y fallo protegido | Produce vista o archivo con columnas autorizadas; parámetros inválidos no generan resultados engañosos. |
| Reglas y requisitos relacionados | `RF-REP-002` a `RF-REP-005`, `RN-001`, `RN-009`, `RN-010`. |

## Relación entre familias y reutilización

| Tema compartido | Casos | Elementos reutilizables que deben evaluarse primero | Diferencia que debe conservarse |
| --- | --- | --- | --- |
| CRUD de identidades y catálogos | `CU-IDA-01` a `CU-IDA-05`; `CU-CAT-01` a `CU-CAT-04` | Fábricas CRUD, listados, formularios, validación y refresco de tabla. | Permisos, identidad del recurso, relaciones y política de eliminación. |
| Documentos con detalles | `CU-ENT-02`, `CU-ENT-03`, `CU-SAL-02` a `CU-SAL-04` | Encabezado, modal/formulario, tabla de detalles, DTO y transacción coordinadora. | La entrada incrementa stock al confirmarse; la salida no lo descuenta hasta surtir. |
| Operación de salidas | `CU-SAL-02` a `CU-SAL-06` | Proceso de material replicable para merma, componentes informativos y coordinación de movimientos. | Inventario, conversión, permisos, estados y cantidades acumuladas del contexto. |
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
4. Un caso nuevo debe completar identificador, nombre, actor y disparador,
   precondiciones, pasos del flujo principal, alternativas, excepciones, resultado y
   reglas o requisitos relacionados antes de considerarse documentado.
5. Proyectos, requisiciones y ajustes sin flujo HTTP completo permanecen en la
   especificación con su estado correspondiente; se incorporarán aquí sólo al pasar a
   alcance vigente.
