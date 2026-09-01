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
- **Participación de actores y sistema:** acciones que realiza el actor y respuestas,
  validaciones o escrituras que Nexus ejecuta durante la interacción.
- **Precondiciones:** estado que debe existir antes del primer paso.
- **Flujo principal:** interacción numerada paso a paso; cada paso identifica un solo
  participante y una acción observable. Capturar, confirmar, validar, persistir y
  presentar el resultado se separan cuando ocurren en momentos distintos.
- **Flujos alternativos:** secuencia propia por variante, con numeración reiniciada, la
  interacción actor–Nexus y un destino explícito.
- **Excepciones:** punto de rechazo o fallo y efecto protegido.
- **Resultado y fallo protegido:** estado final observable y garantía mínima.
- **Reglas y requisitos relacionados:** referencias a criterios normativos que no se
  duplican dentro de la ficha.

Cada flujo alternativo indica el paso del flujo principal desde el que se inicia y cada
excepción identifica el paso o flujo alternativo en el que puede ocurrir. Así, la
variante o el rechazo puede localizarse sin inferir su punto de extensión a partir de
otra sección. Los párrafos de grupo sólo declaran contexto realmente compartido y no
mantienen una segunda versión de los flujos.

El último paso de cada alternativa declara su destino: **continúa en el paso N del flujo
principal** cuando retorna dentro del mismo caso, o **termina el caso de uso** cuando no
quedan más interacciones. No se usa «volver» o «continuar» sin indicar el paso. Si el
destino fuera otro caso de uso, no se redactaría como un salto de control informal:

- `«include»` identifica un caso requerido que el caso base incorpora siempre; al
  concluir, la interacción continúa en el paso siguiente a la inclusión.
- `«extend»` identifica comportamiento opcional que se inserta en un punto de extensión
  del caso base; al concluir, retorna a ese punto.
- La **generalización** identifica un caso especializado que sustituye el comportamiento
  heredado aplicable; no representa una llamada entre casos.

La relación debe aparecer también en el diagrama y nombrar ambos identificadores `CU-*`.
En el catálogo vigente no hay saltos entre casos de uso: compartir servicios de
inventario, persistencia o consulta no crea por sí solo una relación UML.

El actor principal inicia el objetivo, pero no obtiene autorización por aparecer aquí.
En cada ficha, **Nexus** identifica al sistema como participante interno; no se modela
como actor externo ni inicia el caso por sí mismo.
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
plantilla UML obligatoria, nombres gramaticales para actores ni el formato paso a paso de
los flujos de casos de uso. La alternancia explícita **actor → Nexus** es una convención
del proyecto adoptada para mejorar claridad y verificabilidad. Por ello este catálogo no
declara una conformidad formal con esa norma: adopta criterios compatibles de
identificación única, necesidad, claridad, consistencia, factibilidad y verificabilidad.
Cada ficha
contesta, con vocabulario de negocio, **quién inicia**, **qué lo dispara**, **qué debe
existir antes**, **qué recorrido exitoso sigue**, **qué resultado deja** y **cómo termina
si una regla falla**. Los detalles técnicos se conservan como evidencia, no como pasos que
el actor deba comprender.

### Convención de grupos funcionales e identificadores

Los grupos funcionales reúnen objetivos por capacidad de negocio y reducen el tamaño de
cada vista; no representan paquetes UML, paquetes documentales, permisos, capas de código
ni unidades de despliegue. El catálogo usa `CU-<GRUPO>-<SECUENCIA>`: el código de grupo
es estable, la secuencia comienza en `01` dentro de cada grupo y un identificador retirado
no se reasigna. Esta convención
mantiene la identidad del caso separada de su título y permite agregar casos sin
renumerar otros grupos.

| Código | Grupo funcional | Alcance |
| --- | --- | --- |
| `IDA` | Identidad y acceso | Personas, cuentas, credenciales y asignaciones de acceso. |
| `CAT` | Catálogos | Recursos operativos y contextuales reutilizados por documentos. |
| `ENT` | Entradas | Consulta, registro, edición, corrección y cancelación de recepciones. |
| `SAL` | Salidas | Consulta, creación, edición, surtimiento y devolución. |
| `REP` | Consultas y reportes | Movimientos, inventario, vistas consolidadas y archivos. |

Los prefijos anteriores sustituyen `IAM`, `REC` e `ISS`, que mezclaban abreviaturas en
inglés con nombres de grupos en español. Las referencias normativas se actualizan en
conjunto; el cambio de identificador no modifica el alcance funcional del caso.

### Grupo funcional IDA — Identidad y acceso

| Identificador | Caso de uso específico | Evidencia ejecutable principal |
| --- | --- | --- |
| `CU-IDA-01` | Consultar identidades y accesos | Listados de personas y usuarios. |
| `CU-IDA-02` | Crear persona | `personController` → `personService`. |
| `CU-IDA-03` | Editar persona | `personController` → `personService`. |
| `CU-IDA-04` | Crear usuario y asignar acceso | `userController` → `userService`. |
| `CU-IDA-05` | Editar usuario o cambiar contraseña | Actualización de cuenta, acceso o credencial. |

### Grupo funcional CAT — Catálogos

| Identificador | Caso de uso específico | Evidencia ejecutable principal |
| --- | --- | --- |
| `CU-CAT-01` | Consultar catálogos | Listados parametrizados por recurso. |
| `CU-CAT-02` | Crear registro de catálogo | Creación de cliente, proveedor, material o merma. |
| `CU-CAT-03` | Editar registro de catálogo | Actualización del recurso. |
| `CU-CAT-04` | Eliminar o cambiar estado de registro | Política permitida por cada recurso. |

### Grupo funcional ENT — Entradas

| Identificador | Caso de uso específico | Evidencia ejecutable principal |
| --- | --- | --- |
| `CU-ENT-01` | Consultar entradas | Listado de entradas. |
| `CU-ENT-02` | Registrar entrada | Creación transaccional de entrada. |
| `CU-ENT-03` | Editar entrada | Actualización de encabezado y detalles admitidos. |
| `CU-ENT-04` | Corregir detalle de entrada | Corrección con stock, movimiento e historial. |
| `CU-ENT-05` | Cancelar detalle de entrada | Reversión del efecto de inventario. |

### Grupo funcional SAL — Salidas

| Identificador | Caso de uso específico | Evidencia ejecutable principal |
| --- | --- | --- |
| `CU-SAL-01` | Consultar salidas | Listados de material o merma. |
| `CU-SAL-02` | Crear salida | Creación en el contexto elegido. |
| `CU-SAL-03` | Editar encabezado de salida | Actualización de campos admitidos. |
| `CU-SAL-04` | Ajustar detalles de salida | Cambio de detalles todavía modificables. |
| `CU-SAL-05` | Surtir detalle | Descuento de stock y movimiento. |
| `CU-SAL-06` | Devolver detalle surtido | Reintegro de stock y movimiento inverso. |

### Grupo funcional REP — Consultas y reportes

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
del grupo; flujos, excepciones y reglas permanecen dentro del caso al que aplican.

### Grupo funcional IDA — Identidad y acceso

#### `CU-IDA-01` — Consultar identidades y accesos

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-IDA-01` |
| Nombre | Consultar identidades y accesos. |
| Actor y disparador | Administrador del sistema (área Sistemas) necesita localizar personas, cuentas o asignaciones. |
| Participación de actores y sistema | **Administrador del sistema:** elige el listado y los filtros.<br>**Nexus:** autoriza la consulta, aplica filtros y devuelve únicamente identidades y accesos permitidos. |
| Precondiciones | Sesión y permiso de consulta vigentes. |
| Flujo principal | 1. **Administrador del sistema:** elige el listado.<br>2. **Administrador del sistema:** define los filtros.<br>3. **Nexus:** valida el permiso y los filtros.<br>4. **Nexus:** presenta las identidades y accesos autorizados.<br>5. **Administrador del sistema:** revisa los resultados paginados. |
| Flujos alternativos | A1 — 1. **Administrador del sistema:** solicita «Consulta de roles o departamentos» desde el paso 2.<br>2. **Nexus:** presentarlos como apoyo sin habilitar su mantenimiento.<br>3. **Destino:** continúa en el paso 5 del flujo principal. |
| Excepciones | E1 — Operación no autorizada, antes de consultar: no exponer datos. E2 — Filtro inválido, al aplicar filtros: rechazarlo sin modificar información. |
| Resultado y fallo protegido | Muestra únicamente datos autorizados; un filtro inválido no modifica información. |
| Reglas y requisitos relacionados | `RF-IAM-001` a `RF-IAM-003`, `RN-001`, `RN-009`, `RN-010`. |

#### `CU-IDA-02` — Crear persona

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-IDA-02` |
| Nombre | Crear persona. |
| Actor y disparador | Administrador del sistema (área Sistemas) necesita registrar a una persona que participa en la operación. |
| Participación de actores y sistema | **Administrador del sistema:** captura y confirma los datos de la persona.<br>**Nexus:** valida identidad, campos y asignaciones antes de persistir la persona. |
| Precondiciones | La identidad no está duplicada y los datos obligatorios están disponibles. |
| Flujo principal | 1. **Administrador del sistema:** captura los datos de la persona.<br>2. **Administrador del sistema:** solicita guardarlos.<br>3. **Nexus:** valida identidad, campos y asignaciones.<br>4. **Nexus:** crea la persona.<br>5. **Administrador del sistema:** verifica la confirmación. |
| Flujos alternativos | No aplica: no existe una variante válida que cambie la interacción del flujo principal. |
| Excepciones | E1 — Identidad o datos inválidos, al validar: no persistir la persona. E2 — Operación no autorizada, antes de crear: no modificar datos. |
| Resultado y fallo protegido | La persona queda disponible para relacionarse; ante datos inválidos no se crea. |
| Reglas y requisitos relacionados | `RF-IAM-007`, `RN-001`, `RN-009`, `RN-010`. |

#### `CU-IDA-03` — Editar persona

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-IDA-03` |
| Nombre | Editar persona. |
| Actor y disparador | Administrador del sistema (área Sistemas) necesita corregir datos de una persona existente. |
| Participación de actores y sistema | **Administrador del sistema:** localiza la persona, modifica los campos admitidos y confirma.<br>**Nexus:** valida identidad y asignaciones, y actualiza la persona de forma consistente. |
| Precondiciones | La persona existe y los campos son modificables. |
| Flujo principal | 1. **Administrador del sistema:** localiza la persona.<br>2. **Administrador del sistema:** modifica los campos admitidos.<br>3. **Administrador del sistema:** confirma los cambios.<br>4. **Nexus:** valida identidad, campos y asignaciones.<br>5. **Nexus:** actualiza la persona.<br>6. **Nexus:** muestra el resultado. |
| Flujos alternativos | No aplica: no existe una variante válida que cambie la interacción del flujo principal. |
| Excepciones | E1 — Datos inválidos o conflicto, al validar: conservar los valores anteriores. E2 — Operación no autorizada, antes de editar: no modificar datos. |
| Resultado y fallo protegido | Se actualizan sólo los campos admitidos; un conflicto conserva los valores anteriores. |
| Reglas y requisitos relacionados | `RF-IAM-008`, `RN-001`, `RN-009`, `RN-010`. |

#### `CU-IDA-04` — Crear usuario y asignar acceso

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-IDA-04` |
| Nombre | Crear usuario y asignar acceso. |
| Actor y disparador | Administrador del sistema (área Sistemas) necesita otorgar acceso a una persona. |
| Participación de actores y sistema | **Administrador del sistema:** captura la cuenta, selecciona persona y acceso, y confirma.<br>**Nexus:** valida unicidad, referencias y credencial; cifra la contraseña y crea cuenta y asignación atómicamente. |
| Precondiciones | Persona, rol y área existen; la cuenta no está duplicada. |
| Flujo principal | 1. **Administrador del sistema:** captura la cuenta.<br>2. **Administrador del sistema:** selecciona persona, rol y área.<br>3. **Administrador del sistema:** confirma la creación.<br>4. **Nexus:** valida unicidad, referencias y credencial.<br>5. **Nexus:** cifra la contraseña.<br>6. **Nexus:** crea cuenta y asignación atómicamente.<br>7. **Administrador del sistema:** verifica la confirmación. |
| Flujos alternativos | A1 — 1. **Administrador del sistema:** solicita «Cuenta sin persona» desde la captura.<br>2. **Nexus:** acepta que el vínculo personal se omita.<br>3. **Destino:** continúa en el paso 3 del flujo principal. |
| Excepciones | E1 — Cuenta, persona, rol o área inválidos, al validar: no crear cuenta ni asignación parcial. E2 — Operación no autorizada, antes de crear: no modificar datos. |
| Resultado y fallo protegido | La cuenta y su asignación quedan vinculadas; cualquier fallo evita una asignación parcial. |
| Reglas y requisitos relacionados | `RF-IAM-004`, `RN-001`, `RN-009`, `RN-010`, `RN-008`. |

#### `CU-IDA-05` — Editar usuario o cambiar contraseña

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-IDA-05` |
| Nombre | Editar usuario o cambiar contraseña. |
| Actor y disparador | Administrador del sistema (área Sistemas) necesita corregir la cuenta, reemplazar su asignación o renovar su credencial. |
| Participación de actores y sistema | **Administrador del sistema:** selecciona la cuenta y solicita el cambio de datos, acceso o contraseña.<br>**Nexus:** valida el cambio, cifra la nueva contraseña cuando aplica y actualiza la cuenta y su asignación atómicamente. |
| Precondiciones | El usuario existe; persona, rol y departamento son válidos cuando se cambia la asignación. |
| Flujo principal | 1. **Administrador del sistema:** localiza la cuenta.<br>2. **Administrador del sistema:** modifica datos, acceso o contraseña.<br>3. **Administrador del sistema:** confirma el cambio.<br>4. **Nexus:** valida cuenta, asignación y credencial.<br>5. **Nexus:** cifra la contraseña cuando aplica.<br>6. **Nexus:** actualiza cuenta y asignación atómicamente.<br>7. **Administrador del sistema:** verifica el resultado. |
| Flujos alternativos | A1 — 1. **Administrador del sistema:** solicita «Cambio de contraseña o acceso» desde la selección del usuario.<br>2. **Nexus:** ejecuta la acción especializada.<br>3. **Destino:** continúa en el paso 7 del flujo principal. |
| Excepciones | E1 — Cuenta, acceso o credencial inválidos, al validar: conservar los valores anteriores. E2 — Fallo transaccional, al reemplazar la asignación: revertir toda la edición. |
| Resultado y fallo protegido | La edición de cuenta y acceso es atómica, y la contraseña se almacena cifrada; un rechazo conserva los valores anteriores. |
| Reglas y requisitos relacionados | `RF-IAM-005`, `RF-IAM-006`, `RN-001`, `RN-009`, `RN-010`, `RN-008`. |

### Grupo funcional CAT — Catálogos

El actor es el personal que posee el permiso del recurso elegido: almacén para sus
catálogos operativos y administración cuando corresponda al catálogo contextual. Esta
formulación evita atribuir todos los catálogos a un área que no los opera.

#### `CU-CAT-01` — Consultar catálogos

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-01` |
| Nombre | Consultar catálogos. |
| Actor y disparador | Personal de almacén (área Almacén y proveduría) o Administrador del sistema (área Sistemas) necesita localizar un registro de su ámbito para usarlo o revisarlo. |
| Participación de actores y sistema | **Personal de almacén (área Almacén y proveduría) o Administrador del sistema (área Sistemas):** elige y consulta un catálogo dentro de su ámbito.<br>**Nexus:** comprueba el permiso del recurso, aplica filtros y presenta sólo los registros autorizados. |
| Precondiciones | Sesión, permiso y catálogo vigentes. |
| Flujo principal | 1. **Personal de almacén o Administrador del sistema:** elige un catálogo de su ámbito.<br>2. **Personal de almacén o Administrador del sistema:** define filtros.<br>3. **Nexus:** valida el permiso del recurso y los filtros.<br>4. **Nexus:** presenta los registros autorizados, ordenados y paginados.<br>5. **Personal de almacén o Administrador del sistema:** revisa los resultados. |
| Flujos alternativos | A1 — 1. **Personal de almacén o Administrador del sistema:** solicita «Catálogo auxiliar» desde la elección del recurso.<br>2. **Nexus:** ofrecer sólo consulta cuando el catálogo no admite mantenimiento.<br>3. **Destino:** continúa en el paso 5 del flujo principal. |
| Excepciones | E1 — Operación no autorizada, antes de consultar: no exponer el catálogo. E2 — Filtro inválido, al consultar: no modificar datos. |
| Resultado y fallo protegido | Presenta registros autorizados sin modificar el catálogo. |
| Reglas y requisitos relacionados | `RF-CAT-001` a `RF-CAT-005`, `RN-001`, `RN-009`, `RN-010`. |

#### `CU-CAT-02` — Crear registro de catálogo

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-02` |
| Nombre | Crear registro de catálogo. |
| Actor y disparador | Personal de almacén (área Almacén y proveduría) o Administrador del sistema (área Sistemas) necesita incorporar un registro en un catálogo de su ámbito. |
| Participación de actores y sistema | **Personal de almacén (área Almacén y proveduría) o Administrador del sistema (área Sistemas):** elige un catálogo de su ámbito, captura el registro y confirma.<br>**Nexus:** valida identidad, datos y relaciones antes de crear el registro. |
| Precondiciones | Relaciones requeridas existentes e identidad no duplicada. |
| Flujo principal | 1. **Personal de almacén o Administrador del sistema:** elige un recurso de su ámbito.<br>2. **Personal de almacén o Administrador del sistema:** captura sus datos.<br>3. **Personal de almacén o Administrador del sistema:** confirma la creación.<br>4. **Nexus:** valida identidad, datos y relaciones.<br>5. **Nexus:** crea el registro.<br>6. **Nexus:** actualiza el listado.<br>7. **Personal de almacén o Administrador del sistema:** verifica el resultado. |
| Flujos alternativos | A1 — 1. **Personal de almacén o Administrador del sistema:** solicita «Merma desde plantilla» desde plantilla, desde la captura.<br>2. **Nexus:** copiar los snapshots aplicables sin relacionarla permanentemente con el material.<br>3. **Destino:** continúa en el paso 3 del flujo principal. |
| Excepciones | E1 — Duplicidad, relación o dato inválido, al validar: no crear registros parciales. E2 — Operación no autorizada, antes de crear: no modificar el catálogo. |
| Resultado y fallo protegido | El registro queda disponible; una validación fallida no escribe datos parciales. |
| Reglas y requisitos relacionados | `RF-CAT-006`, `RF-CAT-010`, `RF-CAT-013`, `RF-CAT-015`, `RF-MER-001`, `RF-MER-002`, `RF-MER-004`, `RF-MER-007` a `RF-MER-009`, `RN-001`, `RN-009`, `RN-010`, `RN-020` a `RN-022`. |

#### `CU-CAT-03` — Editar registro de catálogo

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-03` |
| Nombre | Editar registro de catálogo. |
| Actor y disparador | Personal de almacén (área Almacén y proveduría) o Administrador del sistema (área Sistemas) necesita corregir un registro de su ámbito. |
| Participación de actores y sistema | **Personal de almacén (área Almacén y proveduría) o Administrador del sistema (área Sistemas):** localiza un registro de su ámbito, cambia los campos admitidos y confirma.<br>**Nexus:** valida identidad, relaciones y política del recurso antes de actualizarlo. |
| Precondiciones | Registro existente, permiso vigente y campos modificables. |
| Flujo principal | 1. **Personal de almacén o Administrador del sistema:** localiza el registro.<br>2. **Personal de almacén o Administrador del sistema:** modifica los campos admitidos.<br>3. **Personal de almacén o Administrador del sistema:** confirma los cambios.<br>4. **Nexus:** valida identidad, relaciones y política del recurso.<br>5. **Nexus:** actualiza el registro.<br>6. **Nexus:** presenta el resultado. |
| Flujos alternativos | A1 — 1. **Personal de almacén o Administrador del sistema:** solicita «Recurso con estado» desde la selección.<br>2. **Nexus:** actualizar únicamente los campos permitidos por su política.<br>3. **Destino:** continúa en el paso 3 del flujo principal. |
| Excepciones | E1 — Duplicidad, relación o dato inválido, al validar: conservar la versión anterior. E2 — Campo inmutable, durante la edición: rechazar su modificación. |
| Resultado y fallo protegido | Actualiza sólo datos admitidos; un conflicto conserva la versión anterior. |
| Reglas y requisitos relacionados | `RF-CAT-007`, `RF-CAT-011`, `RF-CAT-014`, `RF-CAT-016`, `RF-CAT-017`, `RF-MER-003`, `RF-MER-005`, `RF-MER-006`, `RN-001`, `RN-009`, `RN-010`, `RN-006`. |

#### `CU-CAT-04` — Eliminar o cambiar estado de registro

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-04` |
| Nombre | Eliminar o cambiar estado de registro. |
| Actor y disparador | Personal de almacén (área Almacén y proveduría) o Administrador del sistema (área Sistemas) necesita retirar un registro de su ámbito. |
| Participación de actores y sistema | **Personal de almacén (área Almacén y proveduría) o Administrador del sistema (área Sistemas):** selecciona un registro de su ámbito y solicita retirarlo.<br>**Nexus:** comprueba relaciones protegidas y ejecuta eliminación o cambio de estado según la política del recurso. |
| Precondiciones | Registro existente y política del recurso conocida. |
| Flujo principal | 1. **Personal de almacén o Administrador del sistema:** selecciona el registro.<br>2. **Personal de almacén o Administrador del sistema:** solicita retirarlo.<br>3. **Nexus:** valida el permiso, la política y las relaciones protegidas.<br>4. **Nexus:** elimina el registro o cambia su estado según corresponda.<br>5. **Personal de almacén o Administrador del sistema:** verifica el resultado. |
| Flujos alternativos | A1 — 1. **Personal de almacén o Administrador del sistema:** solicita «Eliminación física» desde la solicitud de retiro.<br>2. **Nexus:** eliminar sólo sin relaciones protegidas.<br>3. **Destino:** continúa en el paso 5 del flujo principal.<br>A2 — 1. **Personal de almacén o Administrador del sistema:** solicita «Cambio de estado» desde el paso correspondiente del flujo principal.<br>2. **Nexus:** activar.<br>3. **Nexus:** desactivar cuando el recurso no admite eliminación.<br>4. **Destino:** continúa en el paso 5 del flujo principal. |
| Excepciones | E1 — Relación histórica protegida, al evaluar la eliminación: conservar el recurso. E2 — Política sin acción de retiro, al solicitarla: rechazar la operación. |
| Resultado y fallo protegido | El recurso deja de estar disponible de la forma permitida; relaciones protegidas impiden eliminación física. |
| Reglas y requisitos relacionados | `RF-CAT-008`, `RN-001`, `RN-009`, `RN-010`, `RN-007`. |

### Grupo funcional ENT — Entradas

#### `CU-ENT-01` — Consultar entradas

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ENT-01` |
| Nombre | Consultar entradas. |
| Actor y disparador | Personal de almacén (área Almacén y proveduría) necesita localizar una recepción o revisar sus detalles. |
| Participación de actores y sistema | **Personal de almacén:** define filtros y selecciona una entrada.<br>**Nexus:** autoriza la consulta y presenta encabezado, detalles activos e historial aplicable. |
| Precondiciones | Sesión y permiso de consulta vigentes. |
| Flujo principal | 1. **Personal de almacén:** define filtros.<br>2. **Personal de almacén:** solicita la consulta.<br>3. **Nexus:** valida permiso y filtros.<br>4. **Nexus:** presenta las entradas autorizadas.<br>5. **Personal de almacén:** selecciona una entrada.<br>6. **Nexus:** muestra encabezado, detalles activos e historial aplicable.<br>7. **Personal de almacén:** revisa la información. |
| Flujos alternativos | No aplica: no existe una variante válida que cambie la interacción del flujo principal. |
| Excepciones | E1 — Operación no autorizada, antes de consultar: no exponer entradas. E2 — Filtro inválido, al consultar: no modificar datos. |
| Resultado y fallo protegido | Presenta la recepción sin alterar inventario. |
| Reglas y requisitos relacionados | `RF-REC-001`, `RN-001`, `RN-009`, `RN-010`. |

#### `CU-ENT-02` — Registrar entrada

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ENT-02` |
| Nombre | Registrar entrada. |
| Actor y disparador | Personal de almacén (área Almacén y proveduría) recibe materiales de un proveedor. |
| Participación de actores y sistema | **Personal de almacén:** captura proveedor, factura, encabezado y detalles, y confirma la recepción.<br>**Nexus:** valida los datos y registra entrada, detalles, incremento de existencias y movimientos en una transacción. |
| Precondiciones | Proveedor y materiales existen; factura y cantidades son válidas. |
| Flujo principal | 1. **Personal de almacén:** captura proveedor, factura, encabezado y detalles.<br>2. **Personal de almacén:** confirma la recepción.<br>3. **Nexus:** valida factura, relaciones y cantidades.<br>4. **Nexus:** registra entrada, detalles, existencias y movimientos en una transacción.<br>5. **Personal de almacén:** verifica la confirmación. |
| Flujos alternativos | A1 — 1. **Personal de almacén:** solicita «Material repetido» desde la captura de detalles.<br>2. **Nexus:** admitir renglones distintos cuando representan lotes o precios diferentes.<br>3. **Destino:** continúa en el paso 2 del flujo principal. |
| Excepciones | E1 — Factura duplicada, al validar: identificar la entrada existente y no escribir. E2 — Fallo en la transacción: revertir entrada, existencias y movimientos. |
| Resultado y fallo protegido | Entrada, stock y movimientos quedan conciliados; un fallo revierte todo. |
| Reglas y requisitos relacionados | `RF-REC-003`, `RF-REC-004`, `RF-REC-007`, `RN-002`, `RN-004`, `RN-013`, `RN-018`. |

#### `CU-ENT-03` — Editar entrada

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ENT-03` |
| Nombre | Editar entrada. |
| Actor y disparador | Personal de almacén (área Almacén y proveduría) necesita corregir el encabezado o agregar detalles admitidos. |
| Participación de actores y sistema | **Personal de almacén:** abre la entrada, modifica el encabezado o agrega detalles admitidos y confirma.<br>**Nexus:** valida estado, factura y detalles nuevos, y persiste todos los cambios admitidos en una transacción. |
| Precondiciones | Entrada existente, no cancelada y campos modificables. |
| Flujo principal | 1. **Personal de almacén:** abre la entrada.<br>2. **Personal de almacén:** modifica el encabezado.<br>3. **Personal de almacén:** agrega detalles admitidos.<br>4. **Personal de almacén:** confirma los cambios.<br>5. **Nexus:** valida estado, factura y detalles nuevos.<br>6. **Nexus:** persiste los cambios admitidos en una transacción.<br>7. **Nexus:** presenta el resultado. |
| Flujos alternativos | A1 — 1. **Personal de almacén:** solicita «Agregar detalle» después de abrir la entrada.<br>2. **Nexus:** incorporar únicamente detalles nuevos admitidos.<br>3. **Destino:** continúa en el paso 4 del flujo principal. |
| Excepciones | E1 — Cambio de proveedor o fila persistida enviada como nueva, al validar: rechazarlo. E2 — Fallo transaccional: conservar la entrada anterior. |
| Resultado y fallo protegido | Conserva proveedor y datos inmutables; un rechazo mantiene la entrada anterior. |
| Reglas y requisitos relacionados | `RF-REC-005`, `RN-002`. |

#### `CU-ENT-04` — Corregir detalle de entrada

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ENT-04` |
| Nombre | Corregir detalle de entrada. |
| Actor y disparador | Personal de almacén (área Almacén y proveduría) detecta diferencia de cantidad o costo en un detalle persistido. |
| Participación de actores y sistema | **Personal de almacén:** selecciona el detalle, captura valores corregidos y motivo, y confirma.<br>**Nexus:** valida estado y existencia, calcula la diferencia y actualiza stock, movimiento, totales e historial atómicamente. |
| Precondiciones | Detalle activo, motivo existente y stock suficiente si la corrección lo reduce. |
| Flujo principal | 1. **Personal de almacén:** selecciona el detalle.<br>2. **Personal de almacén:** captura valores corregidos y motivo.<br>3. **Personal de almacén:** confirma la corrección.<br>4. **Nexus:** valida estado, motivo y existencia.<br>5. **Nexus:** calcula la diferencia.<br>6. **Nexus:** actualiza stock, movimiento, totales e historial atómicamente.<br>7. **Personal de almacén:** verifica el resultado. |
| Flujos alternativos | A1 — 1. **Personal de almacén:** solicita «Corrección de cantidad o costo» desde la selección del detalle.<br>2. **Nexus:** calcular la diferencia.<br>3. **Nexus:** coordinar inventario, totales e historia.<br>4. **Destino:** continúa en el paso 7 del flujo principal. |
| Excepciones | E1 — Detalle, motivo, cantidad o existencia inválidos, al validar: no aplicar la corrección. E2 — Fallo transaccional: revertir inventario, totales, movimiento e historia. |
| Resultado y fallo protegido | Conserva valores anterior y resultante; cualquier fallo produce rollback. |
| Reglas y requisitos relacionados | `RF-REC-002`, `RN-002`, `RN-005`, `RN-012`, `RN-013`, `RN-017`. |

#### `CU-ENT-05` — Cancelar detalle de entrada

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ENT-05` |
| Nombre | Cancelar detalle de entrada. |
| Actor y disparador | Personal de almacén (área Almacén y proveduría) determina que un detalle recibido debe anularse. |
| Participación de actores y sistema | **Personal de almacén:** selecciona el detalle activo, indica el motivo y confirma la cancelación.<br>**Nexus:** valida estado y existencia, revierte el inventario y registra totales, movimiento e historial atómicamente. |
| Precondiciones | Detalle activo, motivo de cancelación existente y reversión de stock posible. |
| Flujo principal | 1. **Personal de almacén:** selecciona el detalle activo e indica el motivo.<br>2. **Personal de almacén:** confirma la cancelación.<br>3. **Nexus:** valida estado, motivo y posibilidad de reversión.<br>4. **Nexus:** revierte inventario.<br>5. **Nexus:** actualiza totales, movimiento e historial atómicamente.<br>6. **Personal de almacén:** verifica el resultado. |
| Flujos alternativos | A1 — 1. **Personal de almacén:** solicita «Cancelación confirmada» desde la selección del detalle.<br>2. **Nexus:** revertir su efecto sin borrar el registro histórico.<br>3. **Destino:** continúa en el paso 6 del flujo principal. |
| Excepciones | E1 — Detalle, motivo o reversión inválidos, al validar: no cancelar. E2 — Fallo transaccional: no dejar una reversión parcial. |
| Resultado y fallo protegido | El detalle queda cancelado sin borrarse; un fallo no deja reversión parcial. |
| Reglas y requisitos relacionados | `RF-REC-008`, `RN-002`, `RN-005`, `RN-012`, `RN-017`. |

### Grupo funcional SAL — Salidas

#### `CU-SAL-01` — Consultar salidas

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-SAL-01` |
| Nombre | Consultar salidas. |
| Actor y disparador | Personal de almacén (área Almacén y proveduría) necesita localizar una salida de material o merma. |
| Participación de actores y sistema | **Personal de almacén:** elige el contexto, aplica filtros y selecciona una salida.<br>**Nexus:** autoriza la consulta y presenta encabezado, detalles, cantidades y estados vigentes. |
| Precondiciones | Sesión y permiso del contexto vigentes. |
| Flujo principal | 1. **Personal de almacén:** elige el contexto.<br>2. **Personal de almacén:** define filtros.<br>3. **Nexus:** valida permiso, contexto y filtros.<br>4. **Nexus:** presenta las salidas autorizadas.<br>5. **Personal de almacén:** selecciona una salida.<br>6. **Nexus:** muestra encabezado, detalles, cantidades y estados vigentes.<br>7. **Personal de almacén:** revisa la información. |
| Flujos alternativos | A1 — 1. **Personal de almacén:** solicita «Contexto de merma» desde la elección del tipo.<br>2. **Nexus:** consultar el inventario y las reglas propios de merma.<br>3. **Destino:** continúa en el paso 2 del flujo principal. |
| Excepciones | E1 — Operación no autorizada, antes de consultar: no exponer salidas. E2 — Contexto o filtro inválido, al consultar: no modificar datos. |
| Resultado y fallo protegido | Presenta cantidades y estados sin modificar stock. |
| Reglas y requisitos relacionados | `RF-ISS-001`, `RF-WST-007`, `RN-001`, `RN-009`, `RN-010`. |

#### `CU-SAL-02` — Crear salida

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-SAL-02` |
| Nombre | Crear salida. |
| Actor y disparador | Personal de almacén (área Almacén y proveduría) recibe una solicitud de material o merma. |
| Participación de actores y sistema | **Personal de almacén:** elige material o merma, captura encabezado y detalles, y confirma.<br>**Nexus:** valida contexto, participantes, recursos y cantidades, y crea la salida pendiente sin descontar existencias. |
| Precondiciones | Catálogos y relaciones del contexto existen. |
| Flujo principal | 1. **Personal de almacén:** elige material o merma.<br>2. **Personal de almacén:** captura encabezado y detalles.<br>3. **Personal de almacén:** confirma la creación.<br>4. **Nexus:** valida contexto, participantes, recursos y cantidades.<br>5. **Nexus:** crea la salida pendiente sin descontar existencias.<br>6. **Personal de almacén:** verifica la confirmación. |
| Flujos alternativos | A1 — 1. **Personal de almacén:** solicita «Contexto de merma» desde la elección del tipo.<br>2. **Nexus:** reutilizar encabezado y detalles con el inventario de merma.<br>3. **Destino:** continúa en el paso 2 del flujo principal. |
| Excepciones | E1 — Encabezado, detalle o contexto inválidos, al validar: no crear un documento parcial. E2 — Operación no autorizada, antes de crear: no modificar datos. |
| Resultado y fallo protegido | Crea una salida pendiente sin descontar stock; un fallo no crea documento parcial. |
| Reglas y requisitos relacionados | `RF-ISS-004`, `RF-WST-002`, `RN-001`, `RN-009`, `RN-010`, `RN-013`, `RN-019`. |

#### `CU-SAL-03` — Editar encabezado de salida

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-SAL-03` |
| Nombre | Editar encabezado de salida. |
| Actor y disparador | Personal de almacén (área Almacén y proveduría) necesita corregir datos contextuales de una salida. |
| Participación de actores y sistema | **Personal de almacén:** abre una salida, cambia los campos permitidos del encabezado y confirma.<br>**Nexus:** valida estado, participantes y campos modificables antes de actualizar el encabezado. |
| Precondiciones | Salida existente y estado que admite edición. |
| Flujo principal | 1. **Personal de almacén:** abre la salida.<br>2. **Nexus:** presenta los campos modificables.<br>3. **Personal de almacén:** cambia los campos permitidos.<br>4. **Personal de almacén:** confirma la edición.<br>5. **Nexus:** valida el estado.<br>6. **Nexus:** valida los participantes.<br>7. **Nexus:** valida los campos modificados.<br>8. **Nexus:** actualiza el encabezado.<br>9. **Nexus:** presenta el resultado. |
| Flujos alternativos | A1 — 1. **Personal de almacén:** solicita «Contexto de merma» desde la elección del tipo.<br>2. **Nexus:** editar sólo los campos permitidos del encabezado correspondiente.<br>3. **Destino:** continúa en el paso 3 del flujo principal. |
| Excepciones | E1 — Estado o campo inválidos, al validar: conservar el encabezado anterior. E2 — Intento de cambiar cantidades históricas: rechazar la edición. |
| Resultado y fallo protegido | Actualiza el encabezado sin reescribir cantidades históricas. |
| Reglas y requisitos relacionados | `RF-ISS-005`, `RF-WST-004`, `RN-001`, `RN-009`, `RN-010`, `RN-015`, `RN-016`. |

#### `CU-SAL-04` — Ajustar detalles de salida

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-SAL-04` |
| Nombre | Ajustar detalles de salida. |
| Actor y disparador | Personal de almacén (área Almacén y proveduría) necesita agregar o cambiar cantidades todavía modificables. |
| Participación de actores y sistema | **Personal de almacén:** agrega o modifica detalles todavía ajustables y confirma.<br>**Nexus:** valida recursos, cantidades y acumulados, persiste los detalles y deriva el estado correspondiente. |
| Precondiciones | Salida existente y detalles no consolidados por surtimiento o devolución. |
| Flujo principal | 1. **Personal de almacén:** selecciona agregar o editar un detalle.<br>2. **Nexus:** presenta los campos ajustables.<br>3. **Personal de almacén:** captura el recurso y la cantidad.<br>4. **Personal de almacén:** confirma los cambios.<br>5. **Nexus:** valida el recurso y la cantidad.<br>6. **Nexus:** valida los acumulados.<br>7. **Nexus:** persiste el detalle.<br>8. **Nexus:** deriva el estado correspondiente.<br>9. **Personal de almacén:** verifica el resultado. |
| Flujos alternativos | A1 — 1. **Personal de almacén:** solicita «Agregar detalle» desde el documento abierto.<br>2. **Nexus:** incorporar el detalle.<br>3. **Nexus:** repetir validación, persistencia y cálculo de estado.<br>4. **Destino:** continúa en el paso 4 del flujo principal.<br>A2 — 1. **Personal de almacén:** solicita «Contexto de merma» desde el paso correspondiente del flujo principal.<br>2. **Nexus:** aplicar sus reglas de inventario.<br>3. **Destino:** continúa en el paso 3 del flujo principal. |
| Excepciones | E1 — Estado, recurso o cantidad inválidos, al validar: conservar los detalles anteriores. E2 — Cantidad ya surtida o devuelta, antes de persistir: rechazar la reescritura. |
| Resultado y fallo protegido | Detalles pendientes quedan consistentes; cantidades surtidas o devueltas permanecen inmutables. |
| Reglas y requisitos relacionados | `RF-ISS-006`, `RF-WST-005`, `RN-002`, `RN-003`, `RN-013`, `RN-015`, `RN-016`. |

#### `CU-SAL-05` — Surtir detalle

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-SAL-05` |
| Nombre | Surtir detalle. |
| Actor y disparador | Personal de almacén (área Almacén y proveduría) entrega total o parcialmente un detalle pendiente. |
| Participación de actores y sistema | **Personal de almacén:** selecciona un detalle pendiente, indica la cantidad a entregar y confirma.<br>**Nexus:** valida cantidad y existencia, descuenta stock, acumula surtimiento, deriva estados y registra el movimiento atómicamente. |
| Precondiciones | Cantidad pendiente positiva y existencia suficiente. |
| Flujo principal | 1. **Personal de almacén:** selecciona un detalle pendiente.<br>2. **Nexus:** presenta la cantidad pendiente y la existencia.<br>3. **Personal de almacén:** indica la cantidad a entregar.<br>4. **Personal de almacén:** confirma el surtimiento.<br>5. **Nexus:** valida cantidad y existencia.<br>6. **Nexus:** descuenta stock.<br>7. **Nexus:** acumula surtimiento.<br>8. **Nexus:** deriva estados.<br>9. **Nexus:** registra el movimiento atómicamente.<br>10. **Personal de almacén:** verifica cantidades y estado resultantes. |
| Flujos alternativos | A1 — 1. **Personal de almacén:** solicita «Surtimiento parcial» desde la cantidad indicada.<br>2. **Nexus:** conservar pendiente la diferencia.<br>3. **Destino:** continúa en el paso 10 del flujo principal.<br>A2 — 1. **Personal de almacén:** solicita «Contexto de merma» desde el paso correspondiente del flujo principal.<br>2. **Nexus:** aplicar existencia y conversión propias.<br>3. **Destino:** continúa en el paso 6 del flujo principal. |
| Excepciones | E1 — Cantidad inválida o existencia insuficiente, al validar: no surtir. E2 — Fallo transaccional: revertir acumulado, existencia, estados y movimiento. |
| Resultado y fallo protegido | Documento, detalle, stock y movimiento coinciden; un fallo revierte todo. |
| Reglas y requisitos relacionados | `RF-ISS-002`, `RF-WST-003`, `RN-002` a `RN-004`, `RN-012`, `RN-013`, `RN-015`, `RN-016`. |

#### `CU-SAL-06` — Devolver detalle surtido

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-SAL-06` |
| Nombre | Devolver detalle surtido. |
| Actor y disparador | Personal de almacén (área Almacén y proveduría) recibe una devolución asociada a una salida. |
| Participación de actores y sistema | **Personal de almacén:** selecciona un detalle surtido, indica la cantidad recibida de vuelta y confirma.<br>**Nexus:** valida la cantidad retornable, reintegra stock, acumula devolución, deriva estados y registra el movimiento inverso atómicamente. |
| Precondiciones | Existe cantidad surtida todavía retornable. |
| Flujo principal | 1. **Personal de almacén:** selecciona un detalle surtido.<br>2. **Nexus:** presenta la cantidad retornable.<br>3. **Personal de almacén:** indica la cantidad devuelta.<br>4. **Personal de almacén:** confirma la devolución.<br>5. **Nexus:** valida la cantidad retornable.<br>6. **Nexus:** reintegra stock.<br>7. **Nexus:** acumula devolución.<br>8. **Nexus:** deriva estados.<br>9. **Nexus:** registra el movimiento inverso atómicamente.<br>10. **Personal de almacén:** verifica cantidades y estado resultantes. |
| Flujos alternativos | A1 — 1. **Personal de almacén:** solicita «Devolución parcial» desde la cantidad indicada.<br>2. **Nexus:** conservar como surtida la diferencia no devuelta.<br>3. **Destino:** continúa en el paso 10 del flujo principal.<br>A2 — 1. **Personal de almacén:** solicita «Contexto de merma» desde el paso correspondiente del flujo principal.<br>2. **Nexus:** aplicar existencia y conversión propias.<br>3. **Destino:** continúa en el paso 6 del flujo principal. |
| Excepciones | E1 — Cantidad inválida o superior a la retornable, al validar: no devolver. E2 — Fallo transaccional: revertir devolución, existencia, estados y movimiento inverso. |
| Resultado y fallo protegido | Conserva surtimiento y devolución trazables; un fallo no modifica acumulados. |
| Reglas y requisitos relacionados | `RF-ISS-003`, `RF-WST-006`, `RN-002` a `RN-004`, `RN-013` a `RN-016`. |

### Grupo funcional REP — Consultas y reportes

#### `CU-REP-01` — Consultar movimientos e inventario

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-REP-01` |
| Nombre | Consultar movimientos e inventario. |
| Actor y disparador | Personal de almacén (área Almacén y proveduría), Administrador del sistema (área Sistemas) o Director (área Dirección) necesitan conocer existencias o rastrear movimientos. |
| Participación de actores y sistema | **Personal de almacén (área Almacén y proveduría), Administrador del sistema (área Sistemas) o Director (área Dirección):** elige la consulta y proporciona filtros dentro de su ámbito.<br>**Nexus:** comprueba permiso y alcance, consulta los datos y presenta página y totales autorizados. |
| Precondiciones | Sesión, permiso y filtros dentro de su alcance. |
| Flujo principal | 1. **Personal de almacén, Administrador del sistema, Director:** elige movimientos o inventario.<br>2. **Personal de almacén, Administrador del sistema, Director:** define filtros dentro de su ámbito.<br>3. **Nexus:** valida permiso, alcance y filtros.<br>4. **Nexus:** consulta los datos.<br>5. **Nexus:** presenta página y totales autorizados.<br>6. **Personal de almacén, Administrador del sistema, Director:** revisa los resultados. |
| Flujos alternativos | A1 — 1. **Personal de almacén, Administrador del sistema, Director:** solicita «Filtro dependiente» desde la captura.<br>2. **Nexus:** habilitar inventario después del proveedor.<br>3. **Nexus:** limpiar la selección dependiente al cambiarlo.<br>4. **Destino:** continúa en el paso 2 del flujo principal.<br>A2 — 1. **Personal de almacén, Administrador del sistema, Director:** solicita «Sin resultados» desde el paso correspondiente del flujo principal.<br>2. **Nexus:** presentar una colección válida vacía.<br>3. **Destino:** termina el caso de uso. |
| Excepciones | E1 — Ámbito no autorizado, antes de consultar: no exponer datos. E2 — Filtros inválidos, al validarlos: solicitar corrección y no generar resultados ambiguos. |
| Resultado y fallo protegido | Presenta información autorizada sin cambiar datos operativos. |
| Reglas y requisitos relacionados | `RF-REP-001`, `RN-001`, `RN-009`, `RN-010`. |

#### `CU-REP-02` — Generar reporte

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-REP-02` |
| Nombre | Generar reporte. |
| Actor y disparador | Personal de almacén (área Almacén y proveduría), Administrador del sistema (área Sistemas) o Director (área Dirección) necesitan analizar o entregar información consolidada. |
| Participación de actores y sistema | **Personal de almacén (área Almacén y proveduría), Administrador del sistema (área Sistemas) o Director (área Dirección):** elige el reporte, captura parámetros y solicita vista o archivo.<br>**Nexus:** valida permiso y parámetros, consolida los datos autorizados y genera la salida solicitada. |
| Precondiciones | Reporte disponible y permiso de sus datos. |
| Flujo principal | 1. **Personal de almacén, Administrador del sistema, Director:** elige el reporte.<br>2. **Personal de almacén, Administrador del sistema, Director:** captura parámetros.<br>3. **Personal de almacén, Administrador del sistema, Director:** solicita vista o archivo.<br>4. **Nexus:** valida permiso, alcance y parámetros.<br>5. **Nexus:** consolida los datos.<br>6. **Nexus:** genera la salida autorizada.<br>7. **Personal de almacén, Administrador del sistema, Director:** revisa la vista.<br>8. **Personal de almacén, Administrador del sistema, Director:** recibe el archivo. |
| Flujos alternativos | A1 — 1. **Personal de almacén, Administrador del sistema, Director:** solicita «Vista sin exportación» después de consultar.<br>2. **Nexus:** terminar tras revisar el resultado.<br>3. **Destino:** termina el caso de uso.<br>A2 — 1. **Personal de almacén, Administrador del sistema, Director:** solicita «Reporte de mermas» desde el paso correspondiente del flujo principal.<br>2. **Nexus:** aplicar su agrupación y dimensiones.<br>3. **Destino:** continúa en el paso 5 del flujo principal.<br>A3 — 1. **Personal de almacén, Administrador del sistema, Director:** solicita «Sin resultados» desde el paso correspondiente del flujo principal.<br>2. **Nexus:** producir una salida válida sin filas.<br>3. **Destino:** termina el caso de uso. |
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
   participación de actores y sistema, precondiciones, pasos granulares del flujo
   principal, secuencias actor–Nexus y destino para cada alternativa, excepciones,
   resultado y reglas o requisitos relacionados antes de considerarse documentado.
5. Proyectos, requisiciones y ajustes sin flujo HTTP completo permanecen en la
   especificación con su estado correspondiente; se incorporarán aquí sólo al pasar a
   alcance vigente.
