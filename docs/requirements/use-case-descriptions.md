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

Las descripciones **sí nombran el objeto de negocio** cuando permite distinguir el
objetivo —material, proveedor, compra, salida, detalle o reporte— y nombran el control
visible sólo cuando el actor debe reconocerlo para actuar —botón, formulario, tabla o
diálogo—. No enumeran DTO, controller, servicio, tabla, variable ni objeto interno con
el que el actor no interactúa directamente. Así, “selecciona la compra y confirma
Cancelar detalle” es verificable; “envía `goodsReceiptDTO` al controller” pertenece a la
secuencia técnica. Todos los casos usan la misma plantilla y el nivel de detalle se mide
por las interacciones y decisiones aplicables, no por exigir el mismo número de pasos a
objetivos de distinta complejidad.

## Estructura de las fichas

Cada caso emplea la misma tabla de dos columnas y conserva dentro de ella toda la
información que permite recorrer su objetivo sin consultar una segunda descripción:

- **Identificador y nombre:** identidad estable y objetivo observable.
- **Actor y disparador:** responsable que inicia el caso y necesidad que lo activa.
- **Participación de actores y sistema:** acciones que realiza el actor y respuestas,
  validaciones o escrituras que Nexus ejecuta durante la interacción.
- **Precondiciones:** lista numerada de estados que deben existir antes del primer paso;
  cada condición se registra por separado y no se confunde con una acción de validación
  ni con un resultado obtenido durante el flujo.
- **Flujo principal:** interacción numerada paso a paso; cada paso identifica un solo
  participante y una acción observable. Capturar, confirmar, validar, persistir y
  presentar el resultado se separan cuando ocurren en momentos distintos. Se nombran el botón, enlace o acción que dispara cada transición; el formulario,
  diálogo o tabla que abre Nexus; los mensajes de confirmación o error; y la validación
  y conservación del resultado cuando forman parte del caso. Expresiones pasivas como
  «revisa» o «verifica el resultado» no sustituyen una interacción observable. El paso
  desde el que se desprende una variante o un rechazo incluye entre paréntesis
  **(ver A1)** o **(ver E1)**, según el identificador correspondiente.
- **Flujos alternativos:** título breve seguido de una secuencia propia por variante,
  con numeración reiniciada, la interacción actor–Nexus y un destino explícito. Además
  de las decisiones que cambian el recorrido, incluyen la captura de información
  inválida cuando Nexus permite corregirla y volver al flujo principal. La secuencia
  comienza con el participante que debe actuar después del paso referenciado: si ese
  paso corresponde a Nexus, comienza el actor; si corresponde al actor, comienza Nexus.
  En los casos de consulta que preceden a operaciones de mantenimiento, el flujo
  principal termina con la acción de alta por ser la continuación prioritaria y esa
  selección constituye el disparador del caso siguiente. Permanecer en la consulta y
  elegir las demás acciones se documentan como alternativas; no se crea una sección de
  continuaciones asociadas para esas decisiones.
- **Excepciones:** título breve, punto de rechazo o fallo y serie numerada de pasos que
  describe el efecto protegido y la terminación del caso. Su secuencia respeta la misma
  alternancia de participantes definida para los flujos alternativos.
- **Postcondiciones (éxito y fallo):** lista numerada de estados finales observables;
  separa los efectos garantizados al terminar correctamente de las garantías que se
  conservan si el caso se rechaza o falla.
- **Reglas y requisitos relacionados:** referencias a criterios normativos que no se
  duplican dentro de la ficha.

Cada flujo alternativo y cada excepción comienza con un título que permite reconocer
rápidamente la situación. El flujo alternativo indica el paso del flujo principal
después del cual se inicia y cada excepción identifica el paso o flujo alternativo
después del cual puede ocurrir.
El primer paso de esa secuencia no repite la acción referenciada, sino que continúa con
el otro participante. Así, la variante o el rechazo puede localizarse sin inferir su
punto de extensión a partir de otra sección. Los párrafos de grupo sólo declaran
contexto realmente compartido y no mantienen una segunda versión de los flujos.

El último paso de cada alternativa declara su destino: **continúa en el paso N del flujo
principal** cuando retorna dentro del mismo caso, o **termina el caso de uso** cuando no
quedan más interacciones. No se usa «volver» o «continuar» sin indicar el paso. Si el
destino fuera otro caso de uso, no se redactaría como un salto de control informal:

- Una asociación simple enlaza objetivos relacionados y se dibuja sin texto; no implica
  por sí misma inclusión, extensión ni una llamada entre casos. Cuando una consulta
  presenta operaciones de mantenimiento, su acción prioritaria cierra el flujo principal
  y dispara el caso siguiente; las demás acciones se documentan como alternativas. El
  actor **termina la consulta** y luego **inicia** el caso seleccionado. Ambos objetivos
  permanecen independientes y el segundo vuelve a
  comprobar sus precondiciones y autorización.
- `«include»` identifica un caso requerido que el caso base incorpora siempre; al
  concluir, la interacción continúa en el paso siguiente a la inclusión.
- `«extend»` identifica comportamiento opcional que se inserta en un punto de extensión
  del caso base; al concluir, retorna a ese punto.
- La **generalización** identifica un caso especializado que sustituye el comportamiento
  heredado aplicable; no representa una llamada entre casos.

La relación debe aparecer también en el diagrama y nombrar ambos identificadores `CU-*`.
Estas continuaciones son asociaciones entre objetivos independientes, no saltos de
control, `«include»` ni `«extend»`; compartir servicios de inventario, persistencia o
consulta tampoco crea por sí solo una relación UML.

El actor principal inicia el objetivo, pero no obtiene autorización por aparecer aquí.
En cada ficha, **Nexus** identifica al sistema como participante interno; no se modela
como actor externo ni inicia el caso por sí mismo.
El **Administrador del sistema** puede iniciar todos los casos vigentes mediante la
generalización mostrada en el diagrama; las fichas conservan al actor operativo primario
para explicar el objetivo sin repetir esa herencia. **Dirección** no se atribuye como
actor mientras no se definan y autoricen sus objetivos concretos.
Los casos de catálogos siguen listar-crear-actualizar y sólo incluyen eliminar, activar,
desactivar o ajustar cuando el contexto lo permite. Los documentos comparten encabezado
y detalles, pero surtir, devolver y corregir mantienen reglas y efectos propios.

## Catálogo operativo y granularidad

Un caso de uso expresa **un objetivo observable iniciado por un actor**. Verbos amplios
como «administrar» o «mantener» se conservan únicamente como títulos de familia para
compartir participantes, precondiciones y reglas; no reciben identificador `CU-*`. Los
identificadores se asignan a operaciones concretas que pueden autorizarse, probarse y
trazarse por separado.

ISO/IEC/IEEE 29148 orienta la ingeniería y calidad de requisitos, pero no se usa como
fuente de una plantilla obligatoria, de nombres gramaticales para actores ni del formato
paso a paso de los flujos de casos de uso. La tabla de dos columnas, las secciones
enumeradas arriba y la alternancia explícita **actor → Nexus** forman la plantilla
definida por el proyecto para mejorar claridad y verificabilidad. Por ello este catálogo
no declara una conformidad formal con esa norma: adopta criterios compatibles de
identificación única, necesidad, claridad, consistencia, factibilidad y verificabilidad.
Cada ficha
contesta, con vocabulario de negocio, **quién inicia**, **qué lo dispara**, **qué debe
existir antes**, **qué recorrido exitoso sigue**, **qué resultado deja** y **cómo termina
si una regla falla**. Los detalles técnicos se conservan como evidencia, no como pasos que
el actor deba comprender.

La plantilla conserva en la ficha el recorrido completo del objetivo y omite secciones
vacías cuando no existe una alternativa o excepción. La descripción exhaustiva de la
interfaz, el contrato HTTP y la implementación permanecen en sus artefactos propietarios
y sólo se enlazan como evidencia.

### Convención de grupos funcionales e identificadores

Los grupos funcionales reúnen objetivos por capacidad de negocio y reducen el tamaño de
cada vista; no representan paquetes UML, paquetes documentales, permisos, capas de código
ni unidades de despliegue. El catálogo conserva identificadores estables
`CU-<FAMILIA>-<SECUENCIA>`: el código de familia y su secuencia permanecen estables
aunque cambie la ubicación de lectura. Si una reorganización exigiera renumerar, el
cambio se realizaría de forma coordinada en el catálogo, las fichas, los diagramas y la
trazabilidad técnica; un identificador retirado no se reasigna a un objetivo distinto.

| Código | Grupo funcional | Alcance |
| --- | --- | --- |
| `AUT` | Autenticación | Inicio y cierre observable de la sesión del usuario. |
| `IDA` | Identidad y acceso | Personas, cuentas, credenciales y asignaciones de acceso. |
| `CAT` | Catálogos | Recursos operativos y contextuales reutilizados por documentos. |
| `ENT` | Compras de material | Consulta, registro, edición, corrección y cancelación de compras recibidas. |
| `SAL` | Salidas de material y de merma | Consulta, creación, edición, surtimiento y devolución de materiales o mermas. |

#### Criterio de agrupación vigente

Se mantienen cinco grupos funcionales propietarios porque expresan capacidades de
negocio estables. Cada consulta o reporte se ubica en el grupo del recurso desde el que
se inicia; no existe un grupo independiente para reportes. Dentro de ellos, los casos se ordenan
por la entidad o el documento sobre el que actúan. Cada secuencia comienza con la
consulta y continúa con las operaciones CRUD disponibles sobre el mismo recurso. Las
operaciones específicas —por ejemplo retirar, ajustar existencia, cambiar estado,
corregir, cancelar, surtir o devolver— se colocan inmediatamente después del CRUD al que
pertenecen. La acción permanece en cada caso de uso y nunca se usa como criterio para
fusionar entidades. Esta organización evita tanto un grupo distinto por cada recurso
como listas planas difíciles de revisar.

| Grupo | Familias internas de lectura | Casos |
| --- | --- | --- |
| `AUT` | Sesión. | `CU-AUT-01` a `CU-AUT-02` |
| `IDA` | Personas; usuarios y credenciales; catálogos de acceso y sus reportes. | `CU-IDA-01` a `CU-IDA-11` |
| `CAT` | Materiales; proveedores; clientes; mermas; inventarios, movimientos, reportes y catálogos auxiliares. | `CU-CAT-01` a `CU-CAT-48` |
| `ENT` | Compras de material y su reporte. | `CU-ENT-01` a `CU-ENT-06` |
| `SAL` | Salidas de material y merma con sus reportes. | `CU-SAL-01` a `CU-SAL-14` |

Las familias internas son ayudas visuales, no nuevos grupos funcionales, permisos ni
módulos de código. Un caso conserva un único identificador y una única entidad aunque su
implementación reutilice validaciones, formularios, servicios o exportadores.

El orden anterior determina la lectura dentro de cada grupo. La numeración sigue el
orden de lectura del catálogo dentro de cada grupo propietario. El catálogo y las fichas
se presentan después en esa misma secuencia. No se conserva al final del grupo una
operación especial que pertenece a una familia anterior. Las asociaciones simples se
dibujan sin etiqueta; sólo una relación `«include»` o `«extend»` debe indicar su
semántica explícitamente.

Los prefijos anteriores sustituyen `IAM`, `REC` e `ISS`, que mezclaban abreviaturas en
inglés con nombres de grupos en español. Las referencias normativas se actualizan en
conjunto; el cambio de identificador no modifica el alcance funcional del caso.

### Grupo funcional AUT — Autenticación

| Identificador | Caso de uso específico | Evidencia funcional |
| --- | --- | --- |
| `CU-AUT-01` | Iniciar sesión | Creación de una sesión para una cuenta activa con credenciales válidas. |
| `CU-AUT-02` | Cerrar sesión | Invalidación de las credenciales de la sesión en el navegador. |

### Grupo funcional IDA — Identidad y acceso

| Identificador | Caso de uso específico | Evidencia funcional |
| --- | --- | --- |
| `CU-IDA-01` | Consultar personas | Listado de personas y asignaciones. |
| `CU-IDA-02` | Crear persona | Alta de persona sin crear cuenta. |
| `CU-IDA-03` | Editar persona | Actualización de datos y asignaciones de persona. |
| `CU-IDA-04` | Generar reporte de personas | Archivo Excel con filtros, columnas y cálculos propios del reporte. |
| `CU-IDA-05` | Consultar usuarios | Listado de cuentas y accesos. |
| `CU-IDA-06` | Crear usuario y asignar acceso | Alta transaccional de cuenta y asignación. |
| `CU-IDA-07` | Editar usuario y acceso | Actualización transaccional de cuenta y asignación. |
| `CU-IDA-08` | Cambiar contraseña de usuario | Actualización cifrada de la credencial. |
| `CU-IDA-09` | Generar reporte de usuarios | Archivo Excel con filtros, columnas y cálculos propios del reporte. |
| `CU-IDA-10` | Consultar roles | Catálogo de acceso de sólo lectura. |
| `CU-IDA-11` | Consultar departamentos | Catálogo de acceso de sólo lectura. |

### Grupo funcional CAT — Catálogos

| Identificador | Caso de uso específico | Evidencia funcional |
| --- | --- | --- |
| `CU-CAT-01` | Consultar materiales | Listado de materiales y ofertas de proveedor. |
| `CU-CAT-02` | Crear material | Alta con presentación, unidad y relaciones válidas. |
| `CU-CAT-03` | Editar material | Actualización de datos generales admitidos. |
| `CU-CAT-04` | Retirar material | Retiro condicionado por la historia operativa. |
| `CU-CAT-05` | Ajustar existencia de material | Ajuste trazable de inventario. |
| `CU-CAT-06` | Consultar inventario de materiales | Consulta autorizada sin modificar datos. |
| `CU-CAT-07` | Generar reporte de inventario de materiales | Archivo Excel con filtros, columnas y cálculos propios del reporte. |
| `CU-CAT-08` | Consultar movimientos de materiales | Consulta autorizada sin modificar datos. |
| `CU-CAT-09` | Generar reporte de movimientos de materiales | Archivo Excel con filtros, columnas y cálculos propios del reporte. |
| `CU-CAT-10` | Consultar proveedores | Listado de proveedores autorizados. |
| `CU-CAT-11` | Crear proveedor | Alta con código e identidad válidos. |
| `CU-CAT-12` | Editar proveedor | Actualización de datos admitidos. |
| `CU-CAT-13` | Cambiar estado de proveedor | Activación o desactivación del proveedor. |
| `CU-CAT-14` | Generar reporte de proveedores | Archivo Excel con filtros, columnas y cálculos propios del reporte. |
| `CU-CAT-15` | Consultar clientes | Listado de clientes autorizados. |
| `CU-CAT-16` | Crear cliente | Alta con asesor opcional válido. |
| `CU-CAT-17` | Editar cliente | Actualización de datos y asesor opcional. |
| `CU-CAT-18` | Generar reporte de clientes | Archivo Excel con filtros, columnas y cálculos propios del reporte. |
| `CU-CAT-19` | Consultar mermas | Listado de existencias de merma. |
| `CU-CAT-20` | Registrar merma | Alta desde una plantilla material-proveedor. |
| `CU-CAT-21` | Editar merma | Actualización sin alterar su identidad física. |
| `CU-CAT-22` | Ajustar existencia de merma | Ajuste trazable de inventario de merma. |
| `CU-CAT-23` | Consultar inventario de mermas | Consulta autorizada sin modificar datos. |
| `CU-CAT-24` | Generar reporte de mermas | Archivo Excel con filtros, columnas y cálculos propios del reporte. |
| `CU-CAT-25` | Consultar movimientos de mermas | Consulta autorizada sin modificar datos. |
| `CU-CAT-26` | Generar reporte de movimientos de mermas | Archivo Excel con filtros, columnas y cálculos propios del reporte. |
| `CU-CAT-27` | Consultar presentaciones | Catálogo auxiliar de sólo lectura. |
| `CU-CAT-28` | Consultar unidades de medida | Catálogo auxiliar de sólo lectura. |
| `CU-CAT-29` | Consultar motivos de ajuste | Catálogo auxiliar de sólo lectura. |
| `CU-CAT-30` | Consultar estados de cumplimiento | Catálogo auxiliar de sólo lectura. |
| `CU-CAT-31` | Consultar área | Pantalla y listado independiente de Áreas, restringidos al administrador. |
| `CU-CAT-32` | Crear área | Alta de área con los campos permitidos. |
| `CU-CAT-33` | Editar área | Actualización de área con los campos permitidos. |
| `CU-CAT-34` | Consultar rol | Pantalla y listado independiente de Roles, restringidos al administrador. |
| `CU-CAT-35` | Crear rol | Alta de rol con los campos permitidos. |
| `CU-CAT-36` | Editar rol | Actualización de rol con los campos permitidos. |
| `CU-CAT-37` | Consultar presentación | Pantalla y listado independiente de Presentaciones, restringidos al administrador. |
| `CU-CAT-38` | Crear presentación | Alta de presentación con los campos permitidos. |
| `CU-CAT-39` | Editar presentación | Actualización de presentación con los campos permitidos. |
| `CU-CAT-40` | Consultar unidad de medida | Pantalla y listado independiente de Unidades de medida, restringidos al administrador. |
| `CU-CAT-41` | Crear unidad de medida | Alta de unidad de medida con los campos permitidos. |
| `CU-CAT-42` | Editar unidad de medida | Actualización de unidad de medida con los campos permitidos. |
| `CU-CAT-43` | Consultar motivo de ajuste | Pantalla y listado independiente de Motivos de ajuste, restringidos al administrador. |
| `CU-CAT-44` | Crear motivo de ajuste | Alta de motivo de ajuste con los campos permitidos. |
| `CU-CAT-45` | Editar motivo de ajuste | Actualización de motivo de ajuste con los campos permitidos. |
| `CU-CAT-46` | Consultar estado de cumplimiento | Pantalla y listado independiente de Estados de cumplimiento, restringidos al administrador. |
| `CU-CAT-47` | Crear estado de cumplimiento | Alta de estado de cumplimiento con los campos permitidos. |
| `CU-CAT-48` | Editar estado de cumplimiento | Actualización de estado de cumplimiento con los campos permitidos. |

### Grupo funcional ENT — Compras de material

| Identificador | Caso de uso específico | Evidencia funcional |
| --- | --- | --- |
| `CU-ENT-01` | Consultar compras de material | Listado y detalle sin modificar inventario. |
| `CU-ENT-02` | Crear compra de material | Compra, detalles, existencias y movimientos transaccionales. |
| `CU-ENT-03` | Editar compra de material | Edición de encabezado y detalles admitidos. |
| `CU-ENT-04` | Corregir material de una compra | Corrección de cantidad o costo con historial. |
| `CU-ENT-05` | Cancelar material de una compra | Cancelación del detalle y reversión de inventario. |
| `CU-ENT-06` | Generar reporte de compras de material | Archivo Excel con filtros, columnas y cálculos propios del reporte. |


### Grupo funcional SAL — Salidas de material y de merma

| Identificador | Caso de uso específico | Evidencia funcional |
| --- | --- | --- |
| `CU-SAL-01` | Consultar salidas de material | Consulta sin modificar existencias. |
| `CU-SAL-02` | Crear salida de material | Creación pendiente sin descontar existencias. |
| `CU-SAL-03` | Editar encabezado de salida de material | Edición de los campos admitidos. |
| `CU-SAL-04` | Editar detalles de material de una salida | Actualización de detalles todavía modificables. |
| `CU-SAL-05` | Surtir material | Descuento de existencia y registro de movimiento. |
| `CU-SAL-06` | Devolver material surtido | Reintegro de existencia y movimiento inverso. |
| `CU-SAL-07` | Generar reporte de salidas de material | Archivo Excel con filtros, columnas y cálculos propios del reporte. |
| `CU-SAL-08` | Consultar salidas de merma | Consulta sin modificar existencias. |
| `CU-SAL-09` | Crear salida de merma | Creación pendiente sin descontar existencias. |
| `CU-SAL-10` | Editar encabezado de salida de merma | Edición de los campos admitidos. |
| `CU-SAL-11` | Editar detalles de merma de una salida | Actualización de detalles todavía modificables. |
| `CU-SAL-12` | Surtir merma | Descuento de existencia y registro de movimiento. |
| `CU-SAL-13` | Devolver merma surtida | Reintegro de existencia y movimiento inverso. |
| `CU-SAL-14` | Generar reporte de salidas de merma | Archivo Excel con filtros, columnas y cálculos propios del reporte. |

La evidencia orienta la búsqueda, pero no impone una organización por casos de uso
dentro de `src`: la aplicación está organizada por capas y dominio. Las pruebas
unitarias siguen la ubicación paralela al artefacto y las integraciones CRUD permanecen
bajo `tests/integration/controllers`.

## Fichas específicas de los casos de uso

Las fichas siguientes son la descripción normativa completa de cada `CU-*`. Cada ficha
usa dos columnas: **Sección** identifica el dato descrito e **Información relevante**
contiene su valor para ese caso. El contexto compartido se declara una sola vez al inicio
del grupo; flujos, excepciones y reglas permanecen dentro del caso al que aplican.

### Grupo funcional AUT — Autenticación

Estos casos muestran el control de acceso observable. La renovación de credenciales y
la consulta de la sesión actual permanecen como responsabilidades internas de Nexus.

#### `CU-AUT-01` — Iniciar sesión

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-AUT-01` |
| Nombre | Iniciar sesión. |
| Actor y disparador | **Actor:** Usuario registrado. **Disparador:** necesita acceder a las capacidades de Nexus para realizar su trabajo autorizado. |
| Participación de actor y sistema | **Actor:** abre el acceso, captura sus credenciales y confirma.<br>**Nexus:** valida la cuenta, crea la sesión y dirige al usuario al alcance disponible. |
| Precondiciones | 1. La cuenta existe y está activa.<br>2. El actor no dispone de una sesión autenticada vigente. |
| Flujo principal | 1. **Actor:** abre la página de acceso.<br>2. **Nexus:** muestra el formulario de credenciales.<br>3. **Actor:** captura usuario y contraseña y selecciona «Iniciar sesión» **(ver E1)**.<br>4. **Nexus:** valida los datos y comprueba que correspondan a una cuenta activa.<br>5. **Nexus:** establece las credenciales de sesión y presenta la página inicial con las opciones autorizadas. |
| Excepciones | **E1 — Credenciales rechazadas (después del paso 3):**<br>1. **Nexus:** valida las credenciales, determina que son inválidas o que la cuenta no admite acceso y rechaza la solicitud sin crear la sesión; comunica el error.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Existe una sesión autenticada atribuida a la cuenta y el usuario puede acceder únicamente a las capacidades autorizadas.<br>2. **Fallo:** No se crean credenciales de sesión ni se expone información protegida. |
| Requisitos relacionados | `RF-AUT-001`, `RN-001`. |

#### `CU-AUT-02` — Cerrar sesión

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-AUT-02` |
| Nombre | Cerrar sesión. |
| Actor y disparador | **Actor:** Usuario registrado con sesión autenticada. **Disparador:** decide terminar su acceso a Nexus. |
| Participación de actor y sistema | **Actor:** selecciona la opción de cierre.<br>**Nexus:** elimina las credenciales del navegador y confirma la terminación de la sesión. |
| Precondiciones | 1. El actor dispone de una sesión autenticada. |
| Flujo principal | 1. **Actor:** selecciona «Cerrar sesión» **(ver E1)**.<br>2. **Nexus:** elimina las credenciales y el destino de retorno conservados en el navegador.<br>3. **Nexus:** dirige al actor fuera del área protegida y confirma el cierre. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** El navegador deja de conservar las credenciales de acceso de la sesión.<br>2. **Fallo:** El sistema no debe presentar contenido protegido sin volver a comprobar una sesión válida. |
| Requisitos relacionados | `RF-AUT-003`, `RN-001`. |

### Grupo funcional IDA — Identidad y acceso

Cada ficha representa una sola acción sobre una sola entidad. Los elementos compartidos se reutilizan en la implementación, pero no fusionan objetivos del actor.

#### `CU-IDA-01` — Consultar personas

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-IDA-01` |
| Nombre | Consultar personas. |
| Actor y disparador | **Actor:** Administrador del sistema. **Disparador:** necesita localizar o revisar personas y abre la opción de consulta correspondiente. |
| Participación de actor y sistema | **Actor:** abre la consulta, define criterios y selecciona registros.<br>**Nexus:** autoriza, presenta filtros y devuelve sólo la información permitida. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Flujo principal | 1. **Actor:** abre la opción para consultar personas **(ver E1)**.<br>2. **Nexus:** comprueba su autorización y muestra la consulta con sus criterios disponibles.<br>3. **Actor:** define los criterios que necesita y solicita aplicarlos **(ver A1)**.<br>4. **Nexus:** presenta la información autorizada y la acción principal para registrar una persona.<br>5. **Actor:** selecciona la acción principal; termina `CU-IDA-01` y con esa selección dispara `CU-IDA-02` Crear persona. |
| Flujos alternativos | **A1 — Continuar la consulta (después del paso 3):**<br>1. **Nexus:** actualiza la información y el total sin modificar datos.<br>2. **Actor:** revisa los resultados o cambia los criterios.<br>3. **Nexus:** conserva la consulta disponible; termina el caso de uso.<br>**A2 — Elegir otra acción (después del paso 4 del flujo principal):**<br>1. **Actor:** selecciona editar la persona en lugar de iniciar el alta; termina `CU-IDA-01` y puede iniciar `CU-IDA-03` Editar persona. También puede iniciar `CU-IDA-04` Generar reporte de personas. Cada caso elegido comprueba nuevamente sus precondiciones y autorización; la selección no constituye `«include»` ni `«extend»`. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Listado de personas y asignaciones.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-IAM-002`. |

#### `CU-IDA-02` — Crear persona

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-IDA-02` |
| Nombre | Crear persona. |
| Actor y disparador | **Actor:** Administrador del sistema. **Disparador:** selecciona la acción principal para crear una persona desde `CU-IDA-01` Consultar personas. |
| Participación de actor y sistema | **Actor:** abre el alta, captura datos y confirma.<br>**Nexus:** carga opciones, valida, registra y comunica el resultado. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de alta.<br>3. Existen los datos relacionados requeridos para completar el registro. |
| Flujo principal | 1. **Actor:** abre la opción para crear persona **(ver E1)**.<br>2. **Nexus:** muestra el formulario y carga las opciones relacionadas que puede utilizar.<br>3. **Actor:** captura los datos y relaciones requeridos y confirma **(ver A1)**.<br>4. **Nexus:** valida autorización, obligatoriedad, formato, identidad y relaciones.<br>5. **Nexus:** registra persona, actualiza el listado y muestra la confirmación. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** valida la información capturada, detecta campos incompletos, formatos incorrectos, relaciones no permitidas o cantidades fuera de las reglas del caso y los señala sin registrar cambios.<br>2. **Actor:** corrige la información indicada y vuelve a confirmar; continúa en el paso 4 del flujo principal. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Alta de persona sin crear cuenta.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-IAM-007`. |

#### `CU-IDA-03` — Editar persona

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-IDA-03` |
| Nombre | Editar persona. |
| Actor y disparador | **Actor:** Administrador del sistema. **Disparador:** detecta datos que debe corregir en una persona y selecciona su acción de edición. |
| Participación de actor y sistema | **Actor:** selecciona el registro, modifica datos y confirma.<br>**Nexus:** presenta valores vigentes, valida, actualiza y comunica el resultado. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de edición.<br>3. El registro objetivo existe.<br>4. El registro se encuentra en un estado que admite los cambios solicitados. |
| Flujo principal | 1. **Actor:** selecciona persona y abre la edición **(ver E1)**.<br>2. **Nexus:** muestra los valores actuales y habilita sólo los campos permitidos.<br>3. **Actor:** modifica los datos admitidos y confirma **(ver A1)**.<br>4. **Nexus:** valida autorización, formato, identidad y relaciones.<br>5. **Nexus:** guarda los cambios, actualiza el listado y muestra la confirmación. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** valida la información capturada, detecta campos incompletos, formatos incorrectos, relaciones no permitidas o cantidades fuera de las reglas del caso y los señala sin registrar cambios.<br>2. **Actor:** corrige la información indicada y vuelve a confirmar; continúa en el paso 4 del flujo principal. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Actualización de datos y asignaciones de persona.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-IAM-008`. |


#### `CU-IDA-04` — Generar reporte de personas

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-IDA-04` |
| Nombre | Generar reporte de personas. |
| Actor y disparador | **Actor:** Usuario con permiso sobre el reporte o consulta. **Disparador:** desde `CU-IDA-01` Consultar personas, selecciona la opción para generar el reporte con los filtros que necesita conservar. |
| Participación de actor y sistema | **Actor:** define filtros y solicita la exportación.<br>**Nexus:** autoriza, consolida la información y entrega el archivo. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Flujo principal | 1. **Nexus:** después de que el actor selecciona la exportación desde la consulta de origen, abre el modal **Exportar reporte** y muestra las opciones aplicables **(ver E1)**.<br>2. **Actor:** conserva o ajusta los filtros, incluye las opciones disponibles y confirma.<br>3. **Nexus:** vuelve a comprobar autorización y parámetros y prepara la información de personas.<br>4. **Nexus:** genera el archivo de Excel e inicia su descarga; si no hay datos, informa que el resultado está vacío. |
| Excepciones | **E1 — Exportación rechazada (después del disparador):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Archivo Excel con filtros, columnas y cálculos propios del reporte.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-REP-002`, `RF-REP-004`. |

#### `CU-IDA-05` — Consultar usuarios

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-IDA-05` |
| Nombre | Consultar usuarios. |
| Actor y disparador | **Actor:** Administrador del sistema. **Disparador:** necesita localizar o revisar usuarios y abre la opción de consulta correspondiente. |
| Participación de actor y sistema | **Actor:** abre la consulta, define criterios y selecciona registros.<br>**Nexus:** autoriza, presenta filtros y devuelve sólo la información permitida. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Flujo principal | 1. **Actor:** abre la opción para consultar usuarios **(ver E1)**.<br>2. **Nexus:** comprueba su autorización y muestra la consulta con sus criterios disponibles.<br>3. **Actor:** define los criterios que necesita y solicita aplicarlos **(ver A1)**.<br>4. **Nexus:** presenta la información autorizada y la acción principal para registrar un usuario.<br>5. **Actor:** selecciona la acción principal; termina `CU-IDA-05` y con esa selección dispara `CU-IDA-06` Crear usuario y asignar acceso. |
| Flujos alternativos | **A1 — Continuar la consulta (después del paso 3):**<br>1. **Nexus:** actualiza la información y el total sin modificar datos.<br>2. **Actor:** revisa los resultados o cambia los criterios.<br>3. **Nexus:** conserva la consulta disponible; termina el caso de uso.<br>**A2 — Elegir otra acción (después del paso 4 del flujo principal):**<br>1. **Actor:** selecciona editar el usuario o cambiar su contraseña en lugar de iniciar el alta; termina `CU-IDA-05` y puede iniciar `CU-IDA-07` Editar usuario y acceso o `CU-IDA-08` Cambiar contraseña de usuario. También puede iniciar `CU-IDA-09` Generar reporte de usuarios. Cada caso elegido comprueba nuevamente sus precondiciones y autorización; la selección no constituye `«include»` ni `«extend»`. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Listado de cuentas y accesos.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-IAM-001`. |

#### `CU-IDA-06` — Crear usuario y asignar acceso

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-IDA-06` |
| Nombre | Crear usuario y asignar acceso. |
| Actor y disparador | **Actor:** Administrador del sistema. **Disparador:** selecciona la acción principal para crear un usuario desde `CU-IDA-05` Consultar usuarios. |
| Participación de actor y sistema | **Actor:** abre el alta, captura datos y confirma.<br>**Nexus:** carga opciones, valida, registra y comunica el resultado. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de alta.<br>3. Existen los datos relacionados requeridos para completar el registro. |
| Flujo principal | 1. **Actor:** abre la opción para crear usuario y asignar acceso **(ver E1)**.<br>2. **Nexus:** muestra el formulario y carga las opciones relacionadas que puede utilizar.<br>3. **Actor:** captura los datos y relaciones requeridos y confirma **(ver A1)**.<br>4. **Nexus:** valida autorización, obligatoriedad, formato, identidad y relaciones.<br>5. **Nexus:** registra usuario y asignar acceso, actualiza el listado y muestra la confirmación. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** valida la información capturada, detecta campos incompletos, formatos incorrectos, relaciones no permitidas o cantidades fuera de las reglas del caso y los señala sin registrar cambios.<br>2. **Actor:** corrige la información indicada y vuelve a confirmar; continúa en el paso 4 del flujo principal. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Alta transaccional de cuenta y asignación.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-IAM-004`. |

#### `CU-IDA-07` — Editar usuario y acceso

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-IDA-07` |
| Nombre | Editar usuario y acceso. |
| Actor y disparador | **Actor:** Administrador del sistema. **Disparador:** detecta datos que debe corregir en una cuenta o su acceso y selecciona su acción de edición. |
| Participación de actor y sistema | **Actor:** selecciona el registro, modifica datos y confirma.<br>**Nexus:** presenta valores vigentes, valida, actualiza y comunica el resultado. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de edición.<br>3. El registro objetivo existe.<br>4. El registro se encuentra en un estado que admite los cambios solicitados. |
| Flujo principal | 1. **Actor:** selecciona usuario y acceso y abre la edición **(ver E1)**.<br>2. **Nexus:** muestra los valores actuales y habilita sólo los campos permitidos.<br>3. **Actor:** modifica los datos admitidos y confirma **(ver A1)**.<br>4. **Nexus:** valida autorización, formato, identidad y relaciones.<br>5. **Nexus:** guarda los cambios, actualiza el listado y muestra la confirmación. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** valida la información capturada, detecta campos incompletos, formatos incorrectos, relaciones no permitidas o cantidades fuera de las reglas del caso y los señala sin registrar cambios.<br>2. **Actor:** corrige la información indicada y vuelve a confirmar; continúa en el paso 4 del flujo principal. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Actualización transaccional de cuenta y asignación.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-IAM-005`. |

#### `CU-IDA-08` — Cambiar contraseña de usuario

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-IDA-08` |
| Nombre | Cambiar contraseña de usuario. |
| Actor y disparador | **Actor:** Administrador del sistema. **Disparador:** necesita renovar la credencial de una cuenta y abre la edición de contraseña. |
| Participación de actor y sistema | **Actor:** selecciona el registro, modifica datos y confirma.<br>**Nexus:** presenta valores vigentes, valida, actualiza y comunica el resultado. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de cambio de credencial.<br>3. La cuenta objetivo existe. |
| Flujo principal | 1. **Actor:** selecciona un usuario y abre «Editar contraseña» **(ver E1)**.<br>2. **Nexus:** muestra el formulario de nueva contraseña sin exponer la credencial actual.<br>3. **Actor:** captura y confirma la nueva contraseña **(ver A1)**.<br>4. **Nexus:** valida la credencial, la cifra y reemplaza el valor anterior.<br>5. **Nexus:** cierra el formulario y confirma la actualización. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** valida la información capturada, detecta campos incompletos, formatos incorrectos, relaciones no permitidas o cantidades fuera de las reglas del caso y los señala sin registrar cambios.<br>2. **Actor:** corrige la información indicada y vuelve a confirmar; continúa en el paso 4 del flujo principal. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Actualización cifrada de la credencial.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-IAM-006`. |


#### `CU-IDA-09` — Generar reporte de usuarios

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-IDA-09` |
| Nombre | Generar reporte de usuarios. |
| Actor y disparador | **Actor:** Usuario con permiso sobre el reporte o consulta. **Disparador:** desde `CU-IDA-05` Consultar usuarios, selecciona la opción para generar el reporte con los filtros que necesita conservar. |
| Participación de actor y sistema | **Actor:** define filtros y solicita la exportación.<br>**Nexus:** autoriza, consolida la información y entrega el archivo. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Flujo principal | 1. **Nexus:** después de que el actor selecciona la exportación desde la consulta de origen, abre el modal **Exportar reporte** y muestra las opciones aplicables **(ver E1)**.<br>2. **Actor:** conserva o ajusta los filtros, incluye las opciones disponibles y confirma.<br>3. **Nexus:** vuelve a comprobar autorización y parámetros y prepara la información de usuarios.<br>4. **Nexus:** genera el archivo de Excel e inicia su descarga; si no hay datos, informa que el resultado está vacío. |
| Excepciones | **E1 — Exportación rechazada (después del disparador):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Archivo Excel con filtros, columnas y cálculos propios del reporte.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-REP-002`, `RF-REP-004`. |

#### `CU-IDA-10` — Consultar roles

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-IDA-10` |
| Nombre | Consultar roles. |
| Actor y disparador | **Actor:** Administrador del sistema. **Disparador:** abre un formulario cuyo selector requiere roles. |
| Participación de actor y sistema | **Actor:** abre la consulta, define criterios y selecciona registros.<br>**Nexus:** autoriza, presenta filtros y devuelve sólo la información permitida. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Flujo principal | 1. **Actor:** abre el formulario del proceso que requiere roles **(ver E1)**.<br>2. **Nexus:** comprueba su autorización y carga roles vigentes.<br>3. **Actor:** consulta o selecciona una opción de roles.<br>4. **Nexus:** conserva la selección para continuar el proceso principal sin modificar el catálogo. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Catálogo de acceso de sólo lectura.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-IAM-003`. |

#### `CU-IDA-11` — Consultar departamentos

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-IDA-11` |
| Nombre | Consultar departamentos. |
| Actor y disparador | **Actor:** Administrador del sistema. **Disparador:** abre un formulario cuyo selector requiere departamentos. |
| Participación de actor y sistema | **Actor:** abre la consulta, define criterios y selecciona registros.<br>**Nexus:** autoriza, presenta filtros y devuelve sólo la información permitida. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Flujo principal | 1. **Actor:** abre el formulario del proceso que requiere departamentos **(ver E1)**.<br>2. **Nexus:** comprueba su autorización y carga departamentos vigentes.<br>3. **Actor:** consulta o selecciona una opción de departamentos.<br>4. **Nexus:** conserva la selección para continuar el proceso principal sin modificar el catálogo. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Catálogo de acceso de sólo lectura.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-IAM-003`. |

### Grupo funcional CAT — Catálogos

Cada ficha representa una sola acción sobre una sola entidad. Los elementos compartidos se reutilizan en la implementación, pero no fusionan objetivos del actor.

#### `CU-CAT-01` — Consultar materiales

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-01` |
| Nombre | Consultar materiales. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** necesita localizar o revisar materiales y abre la opción de consulta correspondiente. |
| Participación de actor y sistema | **Actor:** abre la consulta, define criterios y selecciona registros.<br>**Nexus:** autoriza, presenta filtros y devuelve sólo la información permitida. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Flujo principal | 1. **Actor:** abre la opción para consultar materiales **(ver E1)**.<br>2. **Nexus:** comprueba su autorización y muestra la consulta con sus criterios disponibles.<br>3. **Actor:** define los criterios que necesita y solicita aplicarlos **(ver A1)**.<br>4. **Nexus:** presenta la información autorizada y la acción principal para registrar un material.<br>5. **Actor:** selecciona la acción principal; termina `CU-CAT-01` y con esa selección dispara `CU-CAT-02` Crear material. |
| Flujos alternativos | **A1 — Continuar la consulta (después del paso 3):**<br>1. **Nexus:** actualiza la información y el total sin modificar datos.<br>2. **Actor:** revisa los resultados o cambia los criterios.<br>3. **Nexus:** conserva la consulta disponible; termina el caso de uso.<br>**A2 — Elegir otra acción (después del paso 4 del flujo principal):**<br>1. **Actor:** selecciona editar, retirar o ajustar la existencia del material en lugar de iniciar el alta; termina `CU-CAT-01` y puede iniciar `CU-CAT-03` Editar material, `CU-CAT-04` Retirar material o `CU-CAT-05` Ajustar existencia de material. Cada caso elegido comprueba nuevamente sus precondiciones y autorización; la selección no constituye `«include»` ni `«extend»`. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Listado de materiales y ofertas de proveedor.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-CAT-001`. |

#### `CU-CAT-02` — Crear material

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-02` |
| Nombre | Crear material. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** selecciona la acción principal para crear un material desde `CU-CAT-01` Consultar materiales. |
| Participación de actor y sistema | **Actor:** abre el alta, captura datos y confirma.<br>**Nexus:** carga opciones, valida, registra y comunica el resultado. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de alta.<br>3. Existen los datos relacionados requeridos para completar el registro. |
| Flujo principal | 1. **Actor:** abre la opción para crear material **(ver E1)**.<br>2. **Nexus:** muestra el formulario y carga las opciones relacionadas que puede utilizar.<br>3. **Actor:** captura nombre, proveedor, presentación, unidad, ambas dimensiones o ninguna, y los datos de inventario requeridos; después confirma **(ver A1)**.<br>4. **Nexus:** valida autorización, obligatoriedad, formato, identidad y relaciones **(ver A2)**.<br>5. **Nexus:** registra la identidad o reutiliza la existente, crea la oferta del proveedor, actualiza el listado y muestra la confirmación. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** valida la información capturada, detecta campos incompletos, formatos incorrectos, relaciones no permitidas o cantidades fuera de las reglas del caso y los señala sin registrar cambios.<br>2. **Actor:** corrige la información indicada y vuelve a confirmar; continúa en el paso 4 del flujo principal.<br>**A2 — Identidad ya registrada (después del paso 4):**<br>1. **Actor:** revisa el material coincidente que Nexus presenta.<br>2. **Nexus:** si ya existe la relación con el mismo proveedor, rechaza el alta sin modificar la existencia e indica que debe ajustarse el inventario existente; termina el caso de uso.<br>3. **Nexus:** si la identidad sólo existe para otro proveedor, reutiliza el material y crea la nueva relación proveedor-material; continúa en el paso 5 del flujo principal. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Alta con presentación, unidad y relaciones válidas.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-CAT-006`. |

#### `CU-CAT-03` — Editar material

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-03` |
| Nombre | Editar material. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** detecta datos que debe corregir en un material y selecciona su acción de edición. |
| Participación de actor y sistema | **Actor:** selecciona el registro, modifica datos y confirma.<br>**Nexus:** presenta valores vigentes, valida, actualiza y comunica el resultado. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de edición.<br>3. El registro objetivo existe.<br>4. El registro se encuentra en un estado que admite los cambios solicitados. |
| Flujo principal | 1. **Actor:** selecciona material y abre la edición **(ver E1)**.<br>2. **Nexus:** muestra los valores actuales; bloquea proveedor, presentación, unidad y dimensiones, y habilita nombre, stock mínimo, costo máximo y estado.<br>3. **Actor:** modifica los datos admitidos y confirma **(ver A1)**.<br>4. **Nexus:** valida autorización, formato, identidad y relaciones **(ver A2)**.<br>5. **Nexus:** actualiza los datos compartidos del material y el costo de la oferta seleccionada, actualiza el listado y muestra la confirmación. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** valida la información capturada, detecta campos incompletos, formatos incorrectos, relaciones no permitidas o cantidades fuera de las reglas del caso y los señala sin registrar cambios.<br>2. **Actor:** corrige la información indicada y vuelve a confirmar; continúa en el paso 4 del flujo principal.<br>**A2 — El nombre produce una identidad existente (después del paso 4):**<br>1. **Nexus:** compara el nombre sin distinguir mayúsculas junto con la presentación, unidad y dimensiones inmutables.<br>2. **Nexus:** rechaza la edición sin modificar el material ni la oferta y comunica que la identidad ya existe; termina el caso de uso. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** El nombre, stock mínimo y estado compartidos se reflejan en todas las ofertas del material; el costo máximo cambia sólo en la oferta seleccionada.<br>2. **Éxito al desactivar:** el material conserva identidad, relaciones, stock e historia; queda excluido de operaciones nuevas, pero los detalles de salidas ya comprometidos pueden terminar de surtirse.<br>3. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-CAT-007`. |

#### `CU-CAT-04` — Retirar material

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-04` |
| Nombre | Retirar material. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** determina que debe retirar material y solicita la eliminación. |
| Participación de actor y sistema | **Actor:** solicita y confirma el retiro.<br>**Nexus:** comprueba historia y relaciones, ejecuta sólo el retiro permitido e informa el resultado. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de retiro.<br>3. El recurso objetivo existe.<br>4. El recurso se encuentra en un estado que permite retirarlo. |
| Flujo principal | 1. **Actor:** selecciona un material y solicita retirarlo **(ver E1)**.<br>2. **Nexus:** identifica el material y solicita confirmar la eliminación.<br>3. **Actor:** confirma que desea retirarlo.<br>4. **Nexus:** comprueba si el material tiene historia protegida o relaciones con proveedores **(ver A1)**.<br>5. **Nexus:** elimina la relación proveedor-material y, cuando no quedan otras relaciones ni historia protegida, elimina también la identidad del material; después actualiza el listado y confirma el retiro. |
| Flujos alternativos | **A1 — Material con historia o relaciones protegidas (después del paso 4):**<br>1. **Actor:** revisa el conflicto y las relaciones que Nexus informa.<br>2. **Nexus:** conserva la identidad, la existencia y la historia del material sin efectuar una eliminación parcial.<br>3. **Actor:** reconoce que el material no puede retirarse en esas condiciones; termina el caso de uso. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La relación seleccionada deja de estar disponible y la identidad sólo se elimina si no conserva otras relaciones ni historia protegida.<br>2. **Fallo:** La identidad, las relaciones, la existencia y la historia permanecen sin cambios; no se produce un retiro parcial ni se expone información no autorizada. |
| Requisitos relacionados | `RF-CAT-008`, `RN-007`. |

#### `CU-CAT-05` — Ajustar existencia de material

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-05` |
| Nombre | Ajustar existencia de material. |
| Actor y disparador | **Actor:** Administrador del sistema. **Disparador:** detecta o autoriza una diferencia de existencia de material y abre el ajuste de stock desde la consulta de materiales. |
| Participación de actor y sistema | **Actor:** selecciona el inventario, captura el ajuste y confirma.<br>**Nexus:** muestra la existencia, valida, registra el ajuste y actualiza inventario. |
| Precondiciones | 1. El actor inició sesión como administrador del sistema.<br>2. El actor cuenta con el permiso `materials:adjust-stock`.<br>3. El recurso cuya existencia se ajustará existe. |
| Flujo principal | 1. **Actor:** selecciona el material y abre «Ajustar existencia» **(ver E1)**.<br>2. **Nexus:** muestra la existencia actual y los campos de tipo, cantidad y motivo.<br>3. **Actor:** captura el ajuste y lo confirma **(ver A1)**.<br>4. **Nexus:** valida la autorización, el motivo y la cantidad y registra el ajuste junto con la nueva existencia.<br>5. **Nexus:** actualiza las vistas de inventario y confirma el resultado. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** valida la información capturada, detecta campos incompletos, formatos incorrectos, relaciones no permitidas o cantidades fuera de las reglas del caso y los señala sin registrar cambios.<br>2. **Actor:** corrige la información indicada y vuelve a confirmar; continúa en el paso 4 del flujo principal. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La existencia del material refleja el ajuste autorizado.<br>2. **Éxito:** El ajuste queda registrado con su motivo y trazabilidad.<br>3. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-CAT-009`. |


#### `CU-CAT-06` — Consultar inventario de materiales

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-06` |
| Nombre | Consultar inventario de materiales. |
| Actor y disparador | **Actor:** Usuario con permiso sobre el reporte o consulta. **Disparador:** necesita localizar o revisar inventario de materiales y abre la opción de consulta correspondiente. |
| Participación de actor y sistema | **Actor:** abre la consulta, define criterios y selecciona registros.<br>**Nexus:** autoriza, presenta filtros y devuelve sólo la información permitida. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Flujo principal | 1. **Actor:** abre la opción para consultar inventario de materiales **(ver E1)**.<br>2. **Nexus:** comprueba su autorización y muestra los filtros disponibles.<br>3. **Actor:** define los criterios que necesita y solicita aplicarlos **(ver A1)**.<br>4. **Nexus:** presenta la información autorizada y la opción **Exportar Excel**.<br>5. **Actor:** selecciona **Exportar Excel**; termina `CU-CAT-06` y con esa selección dispara `CU-CAT-07` Generar reporte de inventario de materiales. |
| Flujos alternativos | **A1 — Permanecer en la consulta (después del paso 3):**<br>1. **Nexus:** actualiza la tabla y el total sin modificar datos.<br>2. **Actor:** revisa los resultados o cambia los criterios.<br>3. **Nexus:** conserva la consulta disponible; termina el caso de uso. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Consulta autorizada sin modificar datos.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-REP-001`. |


#### `CU-CAT-07` — Generar reporte de inventario de materiales

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-07` |
| Nombre | Generar reporte de inventario de materiales. |
| Actor y disparador | **Actor:** Usuario con permiso sobre el reporte o consulta. **Disparador:** desde `CU-CAT-06` Consultar inventario de materiales, selecciona **Exportar Excel** con los filtros que necesita conservar. |
| Participación de actor y sistema | **Actor:** define filtros y solicita la exportación.<br>**Nexus:** autoriza, consolida la información y entrega el archivo. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Flujo principal | 1. **Nexus:** después de que el actor selecciona la exportación desde la consulta de origen, abre el modal **Exportar reporte** y muestra las opciones aplicables **(ver E1)**.<br>2. **Actor:** conserva o ajusta los filtros, incluye el alcance y las opciones disponibles y confirma.<br>3. **Nexus:** vuelve a comprobar autorización y parámetros y prepara la información de inventario de materiales.<br>4. **Nexus:** genera el archivo de Excel e inicia su descarga; si no hay datos, informa que el resultado está vacío. |
| Excepciones | **E1 — Exportación rechazada (después del disparador):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Archivo Excel con filtros, columnas y cálculos propios del reporte.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-REP-002`, `RF-REP-004`, `RF-REP-008`. |


#### `CU-CAT-08` — Consultar movimientos de materiales

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-08` |
| Nombre | Consultar movimientos de materiales. |
| Actor y disparador | **Actor:** Usuario con permiso sobre el reporte o consulta. **Disparador:** necesita localizar o revisar movimientos de materiales y abre la opción de consulta correspondiente. |
| Participación de actor y sistema | **Actor:** abre la consulta, define criterios y selecciona registros.<br>**Nexus:** autoriza, presenta filtros y devuelve sólo la información permitida. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Flujo principal | 1. **Actor:** abre la opción para consultar movimientos de materiales **(ver E1)**.<br>2. **Nexus:** comprueba su autorización y muestra los filtros disponibles.<br>3. **Actor:** define los criterios que necesita y solicita aplicarlos **(ver A1)**.<br>4. **Nexus:** presenta la información autorizada y la opción **Exportar Excel**.<br>5. **Actor:** selecciona **Exportar Excel**; termina `CU-CAT-08` y con esa selección dispara `CU-CAT-09` Generar reporte de movimientos de materiales. |
| Flujos alternativos | **A1 — Permanecer en la consulta (después del paso 3):**<br>1. **Nexus:** actualiza la tabla y el total sin modificar datos.<br>2. **Actor:** revisa los resultados o cambia los criterios.<br>3. **Nexus:** conserva la consulta disponible; termina el caso de uso. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Consulta autorizada sin modificar datos.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-REP-001`. |


#### `CU-CAT-09` — Generar reporte de movimientos de materiales

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-09` |
| Nombre | Generar reporte de movimientos de materiales. |
| Actor y disparador | **Actor:** Usuario con permiso sobre el reporte o consulta. **Disparador:** desde `CU-CAT-08` Consultar movimientos de materiales, selecciona **Exportar Excel** con los filtros que necesita conservar. |
| Participación de actor y sistema | **Actor:** define filtros y solicita la exportación.<br>**Nexus:** autoriza, consolida la información y entrega el archivo. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Flujo principal | 1. **Nexus:** después de que el actor selecciona la exportación desde la consulta de origen, abre el modal **Exportar reporte** y muestra las opciones aplicables **(ver E1)**.<br>2. **Actor:** conserva o ajusta los filtros, incluye las opciones disponibles y confirma.<br>3. **Nexus:** vuelve a comprobar autorización y parámetros y prepara la información de movimientos de materiales.<br>4. **Nexus:** genera el archivo de Excel e inicia su descarga; si no hay datos, informa que el resultado está vacío. |
| Excepciones | **E1 — Exportación rechazada (después del disparador):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Archivo Excel con filtros, columnas y cálculos propios del reporte.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-REP-002`, `RF-REP-004`, `RF-REP-005`. |

#### `CU-CAT-10` — Consultar proveedores

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-10` |
| Nombre | Consultar proveedores. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** necesita localizar o revisar proveedores y abre la opción de consulta correspondiente. |
| Participación de actor y sistema | **Actor:** abre la consulta, define criterios y selecciona registros.<br>**Nexus:** autoriza, presenta filtros y devuelve sólo la información permitida. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Flujo principal | 1. **Actor:** abre la opción para consultar proveedores **(ver E1)**.<br>2. **Nexus:** comprueba su autorización y muestra la consulta con sus criterios disponibles.<br>3. **Actor:** define los criterios que necesita y solicita aplicarlos **(ver A1)**.<br>4. **Nexus:** presenta la información autorizada y la acción principal para registrar un proveedor.<br>5. **Actor:** selecciona la acción principal; termina `CU-CAT-10` y con esa selección dispara `CU-CAT-11` Crear proveedor. |
| Flujos alternativos | **A1 — Continuar la consulta (después del paso 3):**<br>1. **Nexus:** actualiza la información y el total sin modificar datos.<br>2. **Actor:** revisa los resultados o cambia los criterios.<br>3. **Nexus:** conserva la consulta disponible; termina el caso de uso.<br>**A2 — Elegir otra acción (después del paso 4 del flujo principal):**<br>1. **Actor:** selecciona editar el proveedor o cambiar su estado en lugar de iniciar el alta; termina `CU-CAT-10` y puede iniciar `CU-CAT-12` Editar proveedor o `CU-CAT-13` Cambiar estado de proveedor. También puede iniciar `CU-CAT-14` Generar reporte de proveedores. Cada caso elegido comprueba nuevamente sus precondiciones y autorización; la selección no constituye `«include»` ni `«extend»`. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Listado de proveedores autorizados.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-CAT-002`. |

#### `CU-CAT-11` — Crear proveedor

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-11` |
| Nombre | Crear proveedor. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** selecciona la acción principal para crear un proveedor desde `CU-CAT-10` Consultar proveedores. |
| Participación de actor y sistema | **Actor:** abre el alta, captura datos y confirma.<br>**Nexus:** carga opciones, valida, registra y comunica el resultado. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de alta.<br>3. Existen los datos relacionados requeridos para completar el registro. |
| Flujo principal | 1. **Actor:** abre la opción para crear proveedor **(ver E1)**.<br>2. **Nexus:** muestra el formulario y carga las opciones relacionadas que puede utilizar.<br>3. **Actor:** captura los datos y relaciones requeridos y confirma **(ver A1)**.<br>4. **Nexus:** valida autorización, obligatoriedad, formato, identidad y relaciones.<br>5. **Nexus:** registra proveedor, actualiza el listado y muestra la confirmación. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** valida la información capturada, detecta campos incompletos, formatos incorrectos, relaciones no permitidas o cantidades fuera de las reglas del caso y los señala sin registrar cambios.<br>2. **Actor:** corrige la información indicada y vuelve a confirmar; continúa en el paso 4 del flujo principal. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Alta con código e identidad válidos.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-CAT-010`. |

#### `CU-CAT-12` — Editar proveedor

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-12` |
| Nombre | Editar proveedor. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** detecta datos que debe corregir en un proveedor y selecciona su acción de edición. |
| Participación de actor y sistema | **Actor:** selecciona el registro, modifica datos y confirma.<br>**Nexus:** presenta valores vigentes, valida, actualiza y comunica el resultado. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de edición.<br>3. El registro objetivo existe.<br>4. El registro se encuentra en un estado que admite los cambios solicitados. |
| Flujo principal | 1. **Actor:** selecciona proveedor y abre la edición **(ver E1)**.<br>2. **Nexus:** muestra los valores actuales y habilita sólo los campos permitidos.<br>3. **Actor:** modifica los datos admitidos y confirma **(ver A1)**.<br>4. **Nexus:** valida autorización, formato, identidad y relaciones.<br>5. **Nexus:** guarda los cambios, actualiza el listado y muestra la confirmación. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** valida la información capturada, detecta campos incompletos, formatos incorrectos, relaciones no permitidas o cantidades fuera de las reglas del caso y los señala sin registrar cambios.<br>2. **Actor:** corrige la información indicada y vuelve a confirmar; continúa en el paso 4 del flujo principal. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Actualización de datos admitidos.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-CAT-011`. |

#### `CU-CAT-13` — Cambiar estado de proveedor

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-13` |
| Nombre | Cambiar estado de proveedor. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** necesita activar o desactivar un proveedor y abre su edición. |
| Participación de actor y sistema | **Actor:** selecciona el registro, modifica datos y confirma.<br>**Nexus:** presenta valores vigentes, valida, actualiza y comunica el resultado. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de edición.<br>3. El proveedor objetivo existe. |
| Flujo principal | 1. **Actor:** selecciona un proveedor y abre su edición **(ver E1)**.<br>2. **Nexus:** muestra los datos actuales, incluido el estado.<br>3. **Actor:** elige el nuevo estado y confirma **(ver A1)**.<br>4. **Nexus:** valida los datos y actualiza el proveedor como parte de la edición.<br>5. **Nexus:** refresca el listado y confirma el cambio de estado. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** valida la información capturada, detecta campos incompletos, formatos incorrectos, relaciones no permitidas o cantidades fuera de las reglas del caso y los señala sin registrar cambios.<br>2. **Actor:** corrige la información indicada y vuelve a confirmar; continúa en el paso 4 del flujo principal. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Activación o desactivación del proveedor.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-CAT-011`. |


#### `CU-CAT-14` — Generar reporte de proveedores

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-14` |
| Nombre | Generar reporte de proveedores. |
| Actor y disparador | **Actor:** Usuario con permiso sobre el reporte o consulta. **Disparador:** desde `CU-CAT-10` Consultar proveedores, selecciona la opción para generar el reporte con los filtros que necesita conservar. |
| Participación de actor y sistema | **Actor:** define filtros y solicita la exportación.<br>**Nexus:** autoriza, consolida la información y entrega el archivo. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Flujo principal | 1. **Nexus:** después de que el actor selecciona la exportación desde la consulta de origen, abre el modal **Exportar reporte** y muestra las opciones aplicables **(ver E1)**.<br>2. **Actor:** conserva o ajusta los filtros, incluye las opciones disponibles y confirma.<br>3. **Nexus:** vuelve a comprobar autorización y parámetros y prepara la información de proveedores.<br>4. **Nexus:** genera el archivo de Excel e inicia su descarga; si no hay datos, informa que el resultado está vacío. |
| Excepciones | **E1 — Exportación rechazada (después del disparador):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Archivo Excel con filtros, columnas y cálculos propios del reporte.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-REP-002`, `RF-REP-004`. |

#### `CU-CAT-15` — Consultar clientes

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-15` |
| Nombre | Consultar clientes. |
| Actor y disparador | **Actor:** Administrador del sistema. **Disparador:** necesita localizar o revisar clientes y abre la opción de consulta correspondiente. |
| Participación de actor y sistema | **Actor:** abre la consulta, define criterios y selecciona registros.<br>**Nexus:** autoriza, presenta filtros y devuelve sólo la información permitida. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Flujo principal | 1. **Actor:** abre la opción para consultar clientes **(ver E1)**.<br>2. **Nexus:** comprueba su autorización y muestra la consulta con sus criterios disponibles.<br>3. **Actor:** define los criterios que necesita y solicita aplicarlos **(ver A1)**.<br>4. **Nexus:** presenta la información autorizada y la acción principal para registrar un cliente.<br>5. **Actor:** selecciona la acción principal; termina `CU-CAT-15` y con esa selección dispara `CU-CAT-16` Crear cliente. |
| Flujos alternativos | **A1 — Continuar la consulta (después del paso 3):**<br>1. **Nexus:** actualiza la información y el total sin modificar datos.<br>2. **Actor:** revisa los resultados o cambia los criterios.<br>3. **Nexus:** conserva la consulta disponible; termina el caso de uso.<br>**A2 — Elegir otra acción (después del paso 4 del flujo principal):**<br>1. **Actor:** selecciona editar el cliente en lugar de iniciar el alta; termina `CU-CAT-15` y puede iniciar `CU-CAT-17` Editar cliente. También puede iniciar `CU-CAT-18` Generar reporte de clientes. Cada caso elegido comprueba nuevamente sus precondiciones y autorización; la selección no constituye `«include»` ni `«extend»`. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Listado de clientes autorizados.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-CAT-003`. |

#### `CU-CAT-16` — Crear cliente

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-16` |
| Nombre | Crear cliente. |
| Actor y disparador | **Actor:** Administrador del sistema. **Disparador:** selecciona la acción principal para crear un cliente desde `CU-CAT-15` Consultar clientes. |
| Participación de actor y sistema | **Actor:** abre el alta, captura datos y confirma.<br>**Nexus:** carga opciones, valida, registra y comunica el resultado. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de alta.<br>3. Existen los datos relacionados requeridos para completar el registro. |
| Flujo principal | 1. **Actor:** abre la opción para crear cliente **(ver E1)**.<br>2. **Nexus:** muestra el formulario con el cliente inicialmente activo.<br>3. **Actor:** captura el nombre, revisa la casilla **Activo** y confirma **(ver A1)**.<br>4. **Nexus:** comprueba que la información sea válida.<br>5. **Nexus:** registra el cliente, actualiza el listado y muestra la confirmación. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** valida la información capturada, detecta campos incompletos, formatos incorrectos, relaciones no permitidas o cantidades fuera de las reglas del caso y los señala sin registrar cambios.<br>2. **Actor:** corrige la información indicada y vuelve a confirmar; continúa en el paso 4 del flujo principal. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** El cliente queda registrado con el estado elegido.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-CAT-013`. |

#### `CU-CAT-17` — Editar cliente

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-17` |
| Nombre | Editar cliente. |
| Actor y disparador | **Actor:** Administrador del sistema. **Disparador:** detecta datos que debe corregir en un cliente y selecciona su acción de edición. |
| Participación de actor y sistema | **Actor:** selecciona el registro, modifica datos y confirma.<br>**Nexus:** presenta valores vigentes, valida, actualiza y comunica el resultado. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de edición.<br>3. El registro objetivo existe.<br>4. El registro se encuentra en un estado que admite los cambios solicitados. |
| Flujo principal | 1. **Actor:** selecciona cliente y abre la edición **(ver E1)**.<br>2. **Nexus:** muestra el nombre y el estado actuales.<br>3. **Actor:** modifica el nombre o la casilla **Activo** y confirma **(ver A1)**.<br>4. **Nexus:** comprueba que la información sea válida.<br>5. **Nexus:** guarda los cambios, actualiza el listado y muestra la confirmación. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** valida la información capturada, detecta campos incompletos, formatos incorrectos, relaciones no permitidas o cantidades fuera de las reglas del caso y los señala sin registrar cambios.<br>2. **Actor:** corrige la información indicada y vuelve a confirmar; continúa en el paso 4 del flujo principal. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** El cliente conserva el nombre y estado elegidos; si queda inactivo, ya no se ofrece en salidas nuevas y mantiene su historia.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-CAT-014`. |


#### `CU-CAT-18` — Generar reporte de clientes

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-18` |
| Nombre | Generar reporte de clientes. |
| Actor y disparador | **Actor:** Usuario con permiso sobre el reporte o consulta. **Disparador:** desde `CU-CAT-15` Consultar clientes, selecciona la opción para generar el reporte con los filtros que necesita conservar. |
| Participación de actor y sistema | **Actor:** define filtros y solicita la exportación.<br>**Nexus:** autoriza, consolida la información y entrega el archivo. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Flujo principal | 1. **Nexus:** después de que el actor selecciona la exportación desde la consulta de origen, abre el modal **Exportar reporte** y muestra las opciones aplicables **(ver E1)**.<br>2. **Actor:** conserva o ajusta los filtros, incluye las opciones disponibles y confirma.<br>3. **Nexus:** vuelve a comprobar autorización y parámetros y prepara la información de clientes.<br>4. **Nexus:** genera el archivo de Excel e inicia su descarga; si no hay datos, informa que el resultado está vacío. |
| Excepciones | **E1 — Exportación rechazada (después del disparador):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Archivo Excel con filtros, columnas y cálculos propios del reporte.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-REP-002`, `RF-REP-004`. |

#### `CU-CAT-19` — Consultar mermas

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-19` |
| Nombre | Consultar mermas. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** necesita localizar o revisar mermas y abre la opción de consulta correspondiente. |
| Participación de actor y sistema | **Actor:** abre la consulta, define criterios y selecciona registros.<br>**Nexus:** autoriza, presenta filtros y devuelve sólo la información permitida. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Flujo principal | 1. **Actor:** abre la opción para consultar mermas **(ver E1)**.<br>2. **Nexus:** comprueba su autorización y muestra la consulta con sus criterios disponibles.<br>3. **Actor:** define los criterios que necesita y solicita aplicarlos **(ver A1)**.<br>4. **Nexus:** presenta la información autorizada y la acción principal para registrar una merma.<br>5. **Actor:** selecciona la acción principal; termina `CU-CAT-19` y con esa selección dispara `CU-CAT-20` Registrar merma. |
| Flujos alternativos | **A1 — Continuar la consulta (después del paso 3):**<br>1. **Nexus:** actualiza la información y el total sin modificar datos.<br>2. **Actor:** revisa los resultados o cambia los criterios.<br>3. **Nexus:** conserva la consulta disponible; termina el caso de uso.<br>**A2 — Elegir otra acción (después del paso 4 del flujo principal):**<br>1. **Actor:** selecciona editar o ajustar la existencia de la merma en lugar de iniciar el alta; termina `CU-CAT-19` y puede iniciar `CU-CAT-21` Editar merma o `CU-CAT-22` Ajustar existencia de merma. Cada caso elegido comprueba nuevamente sus precondiciones y autorización; la selección no constituye `«include»` ni `«extend»`. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Listado de existencias de merma.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-CAT-004`. |

#### `CU-CAT-20` — Registrar merma

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-20` |
| Nombre | Registrar merma. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** selecciona la acción principal para registrar una merma desde `CU-CAT-19` Consultar mermas. |
| Participación de actor y sistema | **Actor:** abre el alta, captura datos y confirma.<br>**Nexus:** carga opciones, valida, registra y comunica el resultado. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de alta.<br>3. Existen los datos relacionados requeridos para completar el registro. |
| Flujo principal | 1. **Actor:** abre «Agregar merma» y selecciona primero un proveedor **(ver E1)**.<br>2. **Nexus:** carga los materiales de ese proveedor que pueden utilizarse como plantilla.<br>3. **Actor:** elige el material, completa los datos propios de la merma y confirma **(ver A1)**.<br>4. **Nexus:** valida identidad, dimensiones, existencia y datos relacionados **(ver A2)**.<br>5. **Nexus:** crea la merma con sus propios datos históricos, registra su existencia inicial y confirma el alta. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** valida la información capturada, detecta campos incompletos, formatos incorrectos, relaciones no permitidas o cantidades fuera de las reglas del caso y los señala sin registrar cambios.<br>2. **Actor:** corrige la información indicada y vuelve a confirmar; continúa en el paso 4 del flujo principal.<br>**A2 — Merma ya registrada (después del paso 4):**<br>1. **Actor:** revisa la merma coincidente que Nexus presenta.<br>2. **Nexus:** rechaza el alta, conserva la existencia y muestra la opción para localizar el registro existente.<br>3. **Actor:** termina `CU-CAT-20` y puede iniciar `CU-CAT-22` Ajustar existencia de merma; termina el caso de uso. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Alta desde una plantilla material-proveedor.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-CAT-015`. |

#### `CU-CAT-21` — Editar merma

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-21` |
| Nombre | Editar merma. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** detecta datos que debe corregir en una merma y selecciona su acción de edición. |
| Participación de actor y sistema | **Actor:** selecciona el registro, modifica datos y confirma.<br>**Nexus:** presenta valores vigentes, valida, actualiza y comunica el resultado. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de edición.<br>3. El registro objetivo existe.<br>4. El registro se encuentra en un estado que admite los cambios solicitados. |
| Flujo principal | 1. **Actor:** selecciona merma y abre la edición **(ver E1)**.<br>2. **Nexus:** muestra los valores actuales y habilita sólo los campos permitidos.<br>3. **Actor:** modifica los datos admitidos y confirma **(ver A1)**.<br>4. **Nexus:** valida autorización, formato, identidad y relaciones.<br>5. **Nexus:** guarda los cambios, actualiza el listado y muestra la confirmación. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** valida la información capturada, detecta campos incompletos, formatos incorrectos, relaciones no permitidas o cantidades fuera de las reglas del caso y los señala sin registrar cambios.<br>2. **Actor:** corrige la información indicada y vuelve a confirmar; continúa en el paso 4 del flujo principal. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Actualización sin alterar su identidad física.<br>2. **Éxito al desactivar:** la merma no puede agregarse a salidas nuevas; conserva stock e historia y puede completar detalles previamente comprometidos.<br>3. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-CAT-016`, `RF-CAT-017`. |

#### `CU-CAT-22` — Ajustar existencia de merma

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-22` |
| Nombre | Ajustar existencia de merma. |
| Actor y disparador | **Actor:** Administrador del sistema. **Disparador:** detecta o autoriza una diferencia de existencia de merma y abre el ajuste de stock desde la consulta de mermas. |
| Participación de actor y sistema | **Actor:** selecciona el inventario, captura el ajuste y confirma.<br>**Nexus:** muestra la existencia, valida, registra el ajuste y actualiza inventario. |
| Precondiciones | 1. El actor inició sesión como administrador del sistema.<br>2. El actor cuenta con el permiso `wastes:adjust-stock`.<br>3. El recurso cuya existencia se ajustará existe. |
| Flujo principal | 1. **Actor:** selecciona el registro de merma y abre «Ajustar existencia» **(ver E1)**.<br>2. **Nexus:** muestra la existencia actual y los campos de tipo, cantidad y motivo.<br>3. **Actor:** captura el ajuste y lo confirma **(ver A1)**.<br>4. **Nexus:** valida la autorización, el motivo y la cantidad y registra el ajuste junto con la nueva existencia.<br>5. **Nexus:** actualiza las vistas de inventario y confirma el resultado. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** valida la información capturada, detecta campos incompletos, formatos incorrectos, relaciones no permitidas o cantidades fuera de las reglas del caso y los señala sin registrar cambios.<br>2. **Actor:** corrige la información indicada y vuelve a confirmar; continúa en el paso 4 del flujo principal. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La existencia de la merma refleja el ajuste autorizado.<br>2. **Éxito:** El ajuste queda registrado con su motivo y trazabilidad.<br>3. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-CAT-018`. |


#### `CU-CAT-23` — Consultar inventario de mermas

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-23` |
| Nombre | Consultar inventario de mermas. |
| Actor y disparador | **Actor:** Usuario con permiso sobre el reporte o consulta. **Disparador:** necesita localizar o revisar inventario de mermas y abre la opción de consulta correspondiente. |
| Participación de actor y sistema | **Actor:** abre la consulta, define criterios y selecciona registros.<br>**Nexus:** autoriza, presenta filtros y devuelve sólo la información permitida. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Flujo principal | 1. **Actor:** abre la opción para consultar inventario de mermas **(ver E1)**.<br>2. **Nexus:** comprueba su autorización y muestra los filtros disponibles.<br>3. **Actor:** define los criterios que necesita y solicita aplicarlos **(ver A1)**.<br>4. **Nexus:** presenta la información autorizada y la opción **Exportar Excel**.<br>5. **Actor:** selecciona **Exportar Excel**; termina `CU-CAT-23` y con esa selección dispara `CU-CAT-24` Generar reporte de mermas. |
| Flujos alternativos | **A1 — Permanecer en la consulta (después del paso 3):**<br>1. **Nexus:** actualiza la tabla y el total sin modificar datos.<br>2. **Actor:** revisa los resultados o cambia los criterios.<br>3. **Nexus:** conserva la consulta disponible; termina el caso de uso. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Consulta autorizada sin modificar datos.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-REP-001`. |


#### `CU-CAT-24` — Generar reporte de mermas

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-24` |
| Nombre | Generar reporte de mermas. |
| Actor y disparador | **Actor:** Usuario con permiso sobre el reporte o consulta. **Disparador:** desde `CU-CAT-23` Consultar inventario de mermas, selecciona **Exportar Excel** con los filtros que necesita conservar. |
| Participación de actor y sistema | **Actor:** define filtros y solicita la exportación.<br>**Nexus:** autoriza, consolida la información y entrega el archivo. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Flujo principal | 1. **Nexus:** después de que el actor selecciona la exportación desde la consulta de origen, abre el modal **Exportar reporte** y muestra las opciones aplicables **(ver E1)**.<br>2. **Actor:** conserva o ajusta los filtros, incluye el alcance y las opciones disponibles y confirma.<br>3. **Nexus:** vuelve a comprobar autorización y parámetros y prepara la información de mermas.<br>4. **Nexus:** genera el archivo de Excel e inicia su descarga; si no hay datos, informa que el resultado está vacío. |
| Excepciones | **E1 — Exportación rechazada (después del disparador):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Archivo Excel con filtros, columnas y cálculos propios del reporte.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-REP-002` a `RF-REP-004`, `RF-REP-006` a `RF-REP-009`. |


#### `CU-CAT-25` — Consultar movimientos de mermas

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-25` |
| Nombre | Consultar movimientos de mermas. |
| Actor y disparador | **Actor:** Usuario con permiso sobre el reporte o consulta. **Disparador:** necesita localizar o revisar movimientos de mermas y abre la opción de consulta correspondiente. |
| Participación de actor y sistema | **Actor:** abre la consulta, define criterios y selecciona registros.<br>**Nexus:** autoriza, presenta filtros y devuelve sólo la información permitida. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Flujo principal | 1. **Actor:** abre la opción para consultar movimientos de mermas **(ver E1)**.<br>2. **Nexus:** comprueba su autorización y muestra los filtros disponibles.<br>3. **Actor:** define los criterios que necesita y solicita aplicarlos **(ver A1)**.<br>4. **Nexus:** presenta la información autorizada y la opción **Exportar Excel**.<br>5. **Actor:** selecciona **Exportar Excel**; termina `CU-CAT-25` y con esa selección dispara `CU-CAT-26` Generar reporte de movimientos de mermas. |
| Flujos alternativos | **A1 — Permanecer en la consulta (después del paso 3):**<br>1. **Nexus:** actualiza la tabla y el total sin modificar datos.<br>2. **Actor:** revisa los resultados o cambia los criterios.<br>3. **Nexus:** conserva la consulta disponible; termina el caso de uso. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Consulta autorizada sin modificar datos.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-REP-001`. |


#### `CU-CAT-26` — Generar reporte de movimientos de mermas

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-26` |
| Nombre | Generar reporte de movimientos de mermas. |
| Actor y disparador | **Actor:** Usuario con permiso sobre el reporte o consulta. **Disparador:** desde `CU-CAT-25` Consultar movimientos de mermas, selecciona **Exportar Excel** con los filtros que necesita conservar. |
| Participación de actor y sistema | **Actor:** define filtros y solicita la exportación.<br>**Nexus:** autoriza, consolida la información y entrega el archivo. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Flujo principal | 1. **Nexus:** después de que el actor selecciona la exportación desde la consulta de origen, abre el modal **Exportar reporte** y muestra las opciones aplicables **(ver E1)**.<br>2. **Actor:** conserva o ajusta los filtros, incluye las opciones disponibles y confirma.<br>3. **Nexus:** vuelve a comprobar autorización y parámetros y prepara la información de movimientos de mermas.<br>4. **Nexus:** genera el archivo de Excel e inicia su descarga; si no hay datos, informa que el resultado está vacío. |
| Excepciones | **E1 — Exportación rechazada (después del disparador):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Archivo Excel con filtros, columnas y cálculos propios del reporte.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-REP-002`, `RF-REP-004`, `RF-REP-005`. |

#### `CU-CAT-27` — Consultar presentaciones

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-27` |
| Nombre | Consultar presentaciones. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** abre un formulario cuyo selector requiere presentaciones. |
| Participación de actor y sistema | **Actor:** abre la consulta, define criterios y selecciona registros.<br>**Nexus:** autoriza, presenta filtros y devuelve sólo la información permitida. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Flujo principal | 1. **Actor:** abre el formulario del proceso que requiere presentaciones **(ver E1)**.<br>2. **Nexus:** comprueba su autorización y carga presentaciones vigentes.<br>3. **Actor:** consulta o selecciona una opción de presentaciones.<br>4. **Nexus:** conserva la selección para continuar el proceso principal sin modificar el catálogo. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Catálogo auxiliar de sólo lectura.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-CAT-005`. |

#### `CU-CAT-28` — Consultar unidades de medida

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-28` |
| Nombre | Consultar unidades de medida. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** abre un formulario cuyo selector requiere unidades de medida. |
| Participación de actor y sistema | **Actor:** abre la consulta, define criterios y selecciona registros.<br>**Nexus:** autoriza, presenta filtros y devuelve sólo la información permitida. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Flujo principal | 1. **Actor:** abre el formulario del proceso que requiere unidades de medida **(ver E1)**.<br>2. **Nexus:** comprueba su autorización y carga unidades de medida vigentes.<br>3. **Actor:** consulta o selecciona una opción de unidades de medida.<br>4. **Nexus:** conserva la selección para continuar el proceso principal sin modificar el catálogo. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Catálogo auxiliar de sólo lectura.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-CAT-019`. |

#### `CU-CAT-29` — Consultar motivos de ajuste

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-29` |
| Nombre | Consultar motivos de ajuste. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** abre un formulario cuyo selector requiere motivos de ajuste. |
| Participación de actor y sistema | **Actor:** abre la consulta, define criterios y selecciona registros.<br>**Nexus:** autoriza, presenta filtros y devuelve sólo la información permitida. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Flujo principal | 1. **Actor:** abre el formulario del proceso que requiere motivos de ajuste **(ver E1)**.<br>2. **Nexus:** comprueba su autorización y carga motivos de ajuste vigentes.<br>3. **Actor:** consulta o selecciona una opción de motivos de ajuste.<br>4. **Nexus:** conserva la selección para continuar el proceso principal sin modificar el catálogo. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Catálogo auxiliar de sólo lectura.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-CAT-020`. |

#### `CU-CAT-30` — Consultar estados de cumplimiento

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-30` |
| Nombre | Consultar estados de cumplimiento. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** abre un formulario cuyo selector requiere estados de cumplimiento. |
| Participación de actor y sistema | **Actor:** abre la consulta, define criterios y selecciona registros.<br>**Nexus:** autoriza, presenta filtros y devuelve sólo la información permitida. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Flujo principal | 1. **Actor:** abre el formulario del proceso que requiere estados de cumplimiento **(ver E1)**.<br>2. **Nexus:** comprueba su autorización y carga estados de cumplimiento vigentes.<br>3. **Actor:** consulta o selecciona una opción de estados de cumplimiento.<br>4. **Nexus:** conserva la selección para continuar el proceso principal sin modificar el catálogo. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Catálogo auxiliar de sólo lectura.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-CAT-021`. |

#### `CU-CAT-31` — Consultar área

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-31` |
| Nombre | Consultar área. |
| Actor y disparador | **Actor:** Administrador del sistema del área Sistemas. **Disparador:** selecciona **Áreas** en el submenú **Catálogos auxiliares**. |
| Participación de actor y sistema | **Actor:** abre y revisa el listado de Áreas.<br>**Nexus:** autoriza, valida el recurso registrado y devuelve sus entradas. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con autorización para administrar catálogos y pertenece al contexto administrativo autorizado. |
| Flujo principal | 1. **Administrador:** selecciona **Áreas** en el submenú **Catálogos auxiliares** **(ver E1)**.<br>2. **Nexus:** comprueba que puede consultar Áreas y muestra su tabla.<br>3. **Nexus:** presenta **Nuevo** como acción principal para registrar un área.<br>4. **Administrador:** selecciona **Nuevo**; termina `CU-CAT-31` y con esa selección dispara `CU-CAT-32` Crear área. |
| Flujos alternativos | **A1 — Permanecer en la consulta (después del paso 3):**<br>1. **Administrador:** decide no iniciar el alta y revisa o busca entradas sin modificar datos.<br>2. **Nexus:** conserva la tabla de Áreas; termina el caso de uso.<br>**A2 — Editar una entrada (después del paso 3 del flujo principal):**<br>1. **Administrador:** selecciona **Editar registro** en una entrada; termina `CU-CAT-31` y puede iniciar `CU-CAT-33` Editar área. El caso de edición comprueba nuevamente sus precondiciones y autorización. |
| Excepciones | **E1 — Acceso, recurso o entrada rechazados:**<br>1. **Nexus:** rechaza la operación sin exponer otro catálogo ni producir cambios parciales.<br>2. **Administrador:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La tabla muestra exclusivamente las entradas de Áreas.<br>2. **Fallo:** No se exponen datos ni modelos no autorizados. |
| Requisitos relacionados | `RF-CAT-022`, `RN-001`, `RN-006`. |

#### `CU-CAT-32` — Crear área

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-32` |
| Nombre | Crear área. |
| Actor y disparador | **Actor:** Administrador del sistema del área Sistemas. **Disparador:** selecciona **Nuevo** en `CU-CAT-31` Consultar área. |
| Participación de actor y sistema | **Actor:** captura y confirma una nueva entrada de Áreas.<br>**Nexus:** autoriza, limita los campos, valida, crea y refresca la tabla. |
| Precondiciones | 1. El actor inició sesión y cuenta con autorización para administrar catálogos.<br>2. La pantalla seleccionada corresponde exactamente a **Áreas**. |
| Flujo principal | 1. **Administrador:** abre la pantalla **Áreas** y selecciona **Nuevo** **(ver E1)**.<br>2. **Nexus:** presenta los campos **Nombre** y **Activo**.<br>3. **Administrador:** captura los datos y selecciona **Guardar** **(ver A1)**.<br>4. **Nexus:** revisa la información y crea la entrada de Áreas.<br>5. **Nexus:** confirma y refresca la tabla de Áreas. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** señala los campos requeridos sin crear la entrada.<br>2. **Administrador:** corrige y vuelve a confirmar; continúa en el paso 4. |
| Excepciones | **E1 — Acceso, recurso o entrada rechazados:**<br>1. **Nexus:** rechaza la operación sin exponer otro catálogo ni producir cambios parciales.<br>2. **Administrador:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La nueva entrada de Áreas queda registrada y visible.<br>2. **Fallo:** No se crea ninguna entrada. |
| Requisitos relacionados | `RF-CAT-023`, `RN-001`, `RN-006`. |

#### `CU-CAT-33` — Editar área

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-33` |
| Nombre | Editar área. |
| Actor y disparador | **Actor:** Administrador del sistema del área Sistemas. **Disparador:** selecciona **Editar registro** en la pantalla **Áreas**. |
| Participación de actor y sistema | **Actor:** modifica y confirma una entrada de Áreas.<br>**Nexus:** autoriza, limita los campos, valida, actualiza y refresca la tabla. |
| Precondiciones | 1. El actor inició sesión y cuenta con autorización para administrar catálogos.<br>2. La entrada existe en **Áreas**. |
| Flujo principal | 1. **Administrador:** abre **Áreas** y selecciona **Editar registro** en una fila **(ver E1)**.<br>2. **Nexus:** presenta los valores existentes de **Nombre** y **Activo**.<br>3. **Administrador:** modifica los datos y selecciona **Actualizar** **(ver A1)**.<br>4. **Nexus:** revisa la información y actualiza la entrada de Áreas.<br>5. **Nexus:** confirma y refresca la tabla de Áreas. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** señala los campos requeridos y conserva la entrada sin cambios.<br>2. **Administrador:** corrige y vuelve a confirmar; continúa en el paso 4. |
| Excepciones | **E1 — Acceso, recurso o entrada rechazados:**<br>1. **Nexus:** rechaza la operación sin exponer otro catálogo ni producir cambios parciales.<br>2. **Administrador:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La entrada de Áreas conserva los cambios admitidos.<br>2. **Fallo:** La entrada conserva su estado anterior. |
| Requisitos relacionados | `RF-CAT-024`, `RN-001`, `RN-006`. |

#### `CU-CAT-34` — Consultar rol

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-34` |
| Nombre | Consultar rol. |
| Actor y disparador | **Actor:** Administrador del sistema del área Sistemas. **Disparador:** selecciona **Roles** en el submenú **Catálogos auxiliares**. |
| Participación de actor y sistema | **Actor:** abre y revisa el listado de Roles.<br>**Nexus:** autoriza, valida el recurso registrado y devuelve sus entradas. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con autorización para administrar catálogos y pertenece al contexto administrativo autorizado. |
| Flujo principal | 1. **Administrador:** selecciona **Roles** en el submenú **Catálogos auxiliares** **(ver E1)**.<br>2. **Nexus:** comprueba que puede consultar Roles y muestra su tabla.<br>3. **Nexus:** presenta **Nuevo** como acción principal para registrar un rol.<br>4. **Administrador:** selecciona **Nuevo**; termina `CU-CAT-34` y con esa selección dispara `CU-CAT-35` Crear rol. |
| Flujos alternativos | **A1 — Permanecer en la consulta (después del paso 3):**<br>1. **Administrador:** decide no iniciar el alta y revisa o busca entradas sin modificar datos.<br>2. **Nexus:** conserva la tabla de Roles; termina el caso de uso.<br>**A2 — Editar una entrada (después del paso 3 del flujo principal):**<br>1. **Administrador:** selecciona **Editar registro** en una entrada; termina `CU-CAT-34` y puede iniciar `CU-CAT-36` Editar rol. El caso de edición comprueba nuevamente sus precondiciones y autorización. |
| Excepciones | **E1 — Acceso, recurso o entrada rechazados:**<br>1. **Nexus:** rechaza la operación sin exponer otro catálogo ni producir cambios parciales.<br>2. **Administrador:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La tabla muestra exclusivamente las entradas de Roles.<br>2. **Fallo:** No se exponen datos ni modelos no autorizados. |
| Requisitos relacionados | `RF-CAT-022`, `RN-001`, `RN-006`. |

#### `CU-CAT-35` — Crear rol

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-35` |
| Nombre | Crear rol. |
| Actor y disparador | **Actor:** Administrador del sistema del área Sistemas. **Disparador:** selecciona **Nuevo** en `CU-CAT-34` Consultar rol. |
| Participación de actor y sistema | **Actor:** captura y confirma una nueva entrada de Roles.<br>**Nexus:** autoriza, limita los campos, valida, crea y refresca la tabla. |
| Precondiciones | 1. El actor inició sesión y cuenta con autorización para administrar catálogos.<br>2. La pantalla seleccionada corresponde exactamente a **Roles**. |
| Flujo principal | 1. **Administrador:** abre la pantalla **Roles** y selecciona **Nuevo** **(ver E1)**.<br>2. **Nexus:** presenta los campos **Nombre** y **Activo**.<br>3. **Administrador:** captura los datos y selecciona **Guardar** **(ver A1)**.<br>4. **Nexus:** revisa la información y crea la entrada de Roles.<br>5. **Nexus:** confirma y refresca la tabla de Roles. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** señala los campos requeridos sin crear la entrada.<br>2. **Administrador:** corrige y vuelve a confirmar; continúa en el paso 4. |
| Excepciones | **E1 — Acceso, recurso o entrada rechazados:**<br>1. **Nexus:** rechaza la operación sin exponer otro catálogo ni producir cambios parciales.<br>2. **Administrador:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La nueva entrada de Roles queda registrada y visible.<br>2. **Fallo:** No se crea ninguna entrada. |
| Requisitos relacionados | `RF-CAT-023`, `RN-001`, `RN-006`. |

#### `CU-CAT-36` — Editar rol

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-36` |
| Nombre | Editar rol. |
| Actor y disparador | **Actor:** Administrador del sistema del área Sistemas. **Disparador:** selecciona **Editar registro** en la pantalla **Roles**. |
| Participación de actor y sistema | **Actor:** modifica y confirma una entrada de Roles.<br>**Nexus:** autoriza, limita los campos, valida, actualiza y refresca la tabla. |
| Precondiciones | 1. El actor inició sesión y cuenta con autorización para administrar catálogos.<br>2. La entrada existe en **Roles**. |
| Flujo principal | 1. **Administrador:** abre **Roles** y selecciona **Editar registro** en una fila **(ver E1)**.<br>2. **Nexus:** presenta los valores existentes de **Nombre** y **Activo**.<br>3. **Administrador:** modifica los datos y selecciona **Actualizar** **(ver A1)**.<br>4. **Nexus:** revisa la información y actualiza la entrada de Roles.<br>5. **Nexus:** confirma y refresca la tabla de Roles. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** señala los campos requeridos y conserva la entrada sin cambios.<br>2. **Administrador:** corrige y vuelve a confirmar; continúa en el paso 4. |
| Excepciones | **E1 — Acceso, recurso o entrada rechazados:**<br>1. **Nexus:** rechaza la operación sin exponer otro catálogo ni producir cambios parciales.<br>2. **Administrador:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La entrada de Roles conserva los cambios admitidos.<br>2. **Fallo:** La entrada conserva su estado anterior. |
| Requisitos relacionados | `RF-CAT-024`, `RN-001`, `RN-006`. |

#### `CU-CAT-37` — Consultar presentación

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-37` |
| Nombre | Consultar presentación. |
| Actor y disparador | **Actor:** Administrador del sistema del área Sistemas. **Disparador:** selecciona **Presentaciones** en el submenú **Catálogos auxiliares**. |
| Participación de actor y sistema | **Actor:** abre y revisa el listado de Presentaciones.<br>**Nexus:** autoriza, valida el recurso registrado y devuelve sus entradas. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con autorización para administrar catálogos y pertenece al contexto administrativo autorizado. |
| Flujo principal | 1. **Administrador:** selecciona **Presentaciones** en el submenú **Catálogos auxiliares** **(ver E1)**.<br>2. **Nexus:** comprueba que puede consultar Presentaciones y muestra su tabla.<br>3. **Nexus:** presenta **Nuevo** como acción principal para registrar una presentación.<br>4. **Administrador:** selecciona **Nuevo**; termina `CU-CAT-37` y con esa selección dispara `CU-CAT-38` Crear presentación. |
| Flujos alternativos | **A1 — Permanecer en la consulta (después del paso 3):**<br>1. **Administrador:** decide no iniciar el alta y revisa o busca entradas sin modificar datos.<br>2. **Nexus:** conserva la tabla de Presentaciones; termina el caso de uso.<br>**A2 — Editar una entrada (después del paso 3 del flujo principal):**<br>1. **Administrador:** selecciona **Editar registro** en una entrada; termina `CU-CAT-37` y puede iniciar `CU-CAT-39` Editar presentación. El caso de edición comprueba nuevamente sus precondiciones y autorización. |
| Excepciones | **E1 — Acceso, recurso o entrada rechazados:**<br>1. **Nexus:** rechaza la operación sin exponer otro catálogo ni producir cambios parciales.<br>2. **Administrador:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La tabla muestra exclusivamente las entradas de Presentaciones.<br>2. **Fallo:** No se exponen datos ni modelos no autorizados. |
| Requisitos relacionados | `RF-CAT-022`, `RN-001`, `RN-006`. |

#### `CU-CAT-38` — Crear presentación

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-38` |
| Nombre | Crear presentación. |
| Actor y disparador | **Actor:** Administrador del sistema del área Sistemas. **Disparador:** selecciona **Nuevo** en `CU-CAT-37` Consultar presentación. |
| Participación de actor y sistema | **Actor:** captura y confirma una nueva entrada de Presentaciones.<br>**Nexus:** autoriza, limita los campos, valida, crea y refresca la tabla. |
| Precondiciones | 1. El actor inició sesión y cuenta con autorización para administrar catálogos.<br>2. La pantalla seleccionada corresponde exactamente a **Presentaciones**. |
| Flujo principal | 1. **Administrador:** abre la pantalla **Presentaciones** y selecciona **Nuevo** **(ver E1)**.<br>2. **Nexus:** presenta los campos **Nombre** y **Activo**.<br>3. **Administrador:** captura los datos y selecciona **Guardar** **(ver A1)**.<br>4. **Nexus:** revisa la información y crea la entrada de Presentaciones.<br>5. **Nexus:** confirma y refresca la tabla de Presentaciones. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** señala los campos requeridos sin crear la entrada.<br>2. **Administrador:** corrige y vuelve a confirmar; continúa en el paso 4. |
| Excepciones | **E1 — Acceso, recurso o entrada rechazados:**<br>1. **Nexus:** rechaza la operación sin exponer otro catálogo ni producir cambios parciales.<br>2. **Administrador:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La nueva entrada de Presentaciones queda registrada y visible.<br>2. **Fallo:** No se crea ninguna entrada. |
| Requisitos relacionados | `RF-CAT-023`, `RN-001`, `RN-006`. |

#### `CU-CAT-39` — Editar presentación

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-39` |
| Nombre | Editar presentación. |
| Actor y disparador | **Actor:** Administrador del sistema del área Sistemas. **Disparador:** selecciona **Editar registro** en la pantalla **Presentaciones**. |
| Participación de actor y sistema | **Actor:** modifica y confirma una entrada de Presentaciones.<br>**Nexus:** autoriza, limita los campos, valida, actualiza y refresca la tabla. |
| Precondiciones | 1. El actor inició sesión y cuenta con autorización para administrar catálogos.<br>2. La entrada existe en **Presentaciones**. |
| Flujo principal | 1. **Administrador:** abre **Presentaciones** y selecciona **Editar registro** en una fila **(ver E1)**.<br>2. **Nexus:** presenta los valores existentes de **Nombre** y **Activo**.<br>3. **Administrador:** modifica los datos y selecciona **Actualizar** **(ver A1)**.<br>4. **Nexus:** revisa la información y actualiza la entrada de Presentaciones.<br>5. **Nexus:** confirma y refresca la tabla de Presentaciones. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** señala los campos requeridos y conserva la entrada sin cambios.<br>2. **Administrador:** corrige y vuelve a confirmar; continúa en el paso 4. |
| Excepciones | **E1 — Acceso, recurso o entrada rechazados:**<br>1. **Nexus:** rechaza la operación sin exponer otro catálogo ni producir cambios parciales.<br>2. **Administrador:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La entrada de Presentaciones conserva los cambios admitidos.<br>2. **Fallo:** La entrada conserva su estado anterior. |
| Requisitos relacionados | `RF-CAT-024`, `RN-001`, `RN-006`. |

#### `CU-CAT-40` — Consultar unidad de medida

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-40` |
| Nombre | Consultar unidad de medida. |
| Actor y disparador | **Actor:** Administrador del sistema del área Sistemas. **Disparador:** selecciona **Unidades de medida** en el submenú **Catálogos auxiliares**. |
| Participación de actor y sistema | **Actor:** abre y revisa el listado de Unidades de medida.<br>**Nexus:** autoriza, valida el recurso registrado y devuelve sus entradas. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con autorización para administrar catálogos y pertenece al contexto administrativo autorizado. |
| Flujo principal | 1. **Administrador:** selecciona **Unidades de medida** en el submenú **Catálogos auxiliares** **(ver E1)**.<br>2. **Nexus:** comprueba que puede consultar Unidades de medida y muestra su tabla.<br>3. **Nexus:** presenta **Nuevo** como acción principal para registrar una unidad de medida.<br>4. **Administrador:** selecciona **Nuevo**; termina `CU-CAT-40` y con esa selección dispara `CU-CAT-41` Crear unidad de medida. |
| Flujos alternativos | **A1 — Permanecer en la consulta (después del paso 3):**<br>1. **Administrador:** decide no iniciar el alta y revisa o busca entradas sin modificar datos.<br>2. **Nexus:** conserva la tabla de Unidades de medida; termina el caso de uso.<br>**A2 — Editar una entrada (después del paso 3 del flujo principal):**<br>1. **Administrador:** selecciona **Editar registro** en una entrada; termina `CU-CAT-40` y puede iniciar `CU-CAT-42` Editar unidad de medida. El caso de edición comprueba nuevamente sus precondiciones y autorización. |
| Excepciones | **E1 — Acceso, recurso o entrada rechazados:**<br>1. **Nexus:** rechaza la operación sin exponer otro catálogo ni producir cambios parciales.<br>2. **Administrador:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La tabla muestra exclusivamente las entradas de Unidades de medida.<br>2. **Fallo:** No se exponen datos ni modelos no autorizados. |
| Requisitos relacionados | `RF-CAT-022`, `RN-001`, `RN-006`. |

#### `CU-CAT-41` — Crear unidad de medida

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-41` |
| Nombre | Crear unidad de medida. |
| Actor y disparador | **Actor:** Administrador del sistema del área Sistemas. **Disparador:** selecciona **Nuevo** en `CU-CAT-40` Consultar unidad de medida. |
| Participación de actor y sistema | **Actor:** captura y confirma una nueva entrada de Unidades de medida.<br>**Nexus:** autoriza, limita los campos, valida, crea y refresca la tabla. |
| Precondiciones | 1. El actor inició sesión y cuenta con autorización para administrar catálogos.<br>2. La pantalla seleccionada corresponde exactamente a **Unidades de medida**. |
| Flujo principal | 1. **Administrador:** abre la pantalla **Unidades de medida** y selecciona **Nuevo** **(ver E1)**.<br>2. **Nexus:** presenta los campos **Nombre**, **Símbolo** y **Activo**.<br>3. **Administrador:** captura los datos y selecciona **Guardar** **(ver A1)**.<br>4. **Nexus:** revisa la información y crea la entrada de Unidades de medida.<br>5. **Nexus:** confirma y refresca la tabla de Unidades de medida. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** señala los campos requeridos sin crear la entrada.<br>2. **Administrador:** corrige y vuelve a confirmar; continúa en el paso 4. |
| Excepciones | **E1 — Acceso, recurso o entrada rechazados:**<br>1. **Nexus:** rechaza la operación sin exponer otro catálogo ni producir cambios parciales.<br>2. **Administrador:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La nueva entrada de Unidades de medida queda registrada y visible.<br>2. **Fallo:** No se crea ninguna entrada. |
| Requisitos relacionados | `RF-CAT-023`, `RN-001`, `RN-006`. |

#### `CU-CAT-42` — Editar unidad de medida

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-42` |
| Nombre | Editar unidad de medida. |
| Actor y disparador | **Actor:** Administrador del sistema del área Sistemas. **Disparador:** selecciona **Editar registro** en la pantalla **Unidades de medida**. |
| Participación de actor y sistema | **Actor:** modifica y confirma una entrada de Unidades de medida.<br>**Nexus:** autoriza, limita los campos, valida, actualiza y refresca la tabla. |
| Precondiciones | 1. El actor inició sesión y cuenta con autorización para administrar catálogos.<br>2. La entrada existe en **Unidades de medida**. |
| Flujo principal | 1. **Administrador:** abre **Unidades de medida** y selecciona **Editar registro** en una fila **(ver E1)**.<br>2. **Nexus:** presenta los valores existentes de **Nombre**, **Símbolo** y **Activo**.<br>3. **Administrador:** modifica los datos y selecciona **Actualizar** **(ver A1)**.<br>4. **Nexus:** revisa la información y actualiza la entrada de Unidades de medida.<br>5. **Nexus:** confirma y refresca la tabla de Unidades de medida. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** señala los campos requeridos y conserva la entrada sin cambios.<br>2. **Administrador:** corrige y vuelve a confirmar; continúa en el paso 4. |
| Excepciones | **E1 — Acceso, recurso o entrada rechazados:**<br>1. **Nexus:** rechaza la operación sin exponer otro catálogo ni producir cambios parciales.<br>2. **Administrador:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La entrada de Unidades de medida conserva los cambios admitidos.<br>2. **Fallo:** La entrada conserva su estado anterior. |
| Requisitos relacionados | `RF-CAT-024`, `RN-001`, `RN-006`. |

#### `CU-CAT-43` — Consultar motivo de ajuste

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-43` |
| Nombre | Consultar motivo de ajuste. |
| Actor y disparador | **Actor:** Administrador del sistema del área Sistemas. **Disparador:** selecciona **Motivos de ajuste** en el submenú **Catálogos auxiliares**. |
| Participación de actor y sistema | **Actor:** abre y revisa el listado de Motivos de ajuste.<br>**Nexus:** autoriza, valida el recurso registrado y devuelve sus entradas. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con autorización para administrar catálogos y pertenece al contexto administrativo autorizado. |
| Flujo principal | 1. **Administrador:** selecciona **Motivos de ajuste** en el submenú **Catálogos auxiliares** **(ver E1)**.<br>2. **Nexus:** comprueba que puede consultar Motivos de ajuste y muestra su tabla.<br>3. **Nexus:** presenta **Nuevo** como acción principal para registrar un motivo de ajuste.<br>4. **Administrador:** selecciona **Nuevo**; termina `CU-CAT-43` y con esa selección dispara `CU-CAT-44` Crear motivo de ajuste. |
| Flujos alternativos | **A1 — Permanecer en la consulta (después del paso 3):**<br>1. **Administrador:** decide no iniciar el alta y revisa o busca entradas sin modificar datos.<br>2. **Nexus:** conserva la tabla de Motivos de ajuste; termina el caso de uso.<br>**A2 — Editar una entrada (después del paso 3 del flujo principal):**<br>1. **Administrador:** selecciona **Editar registro** en una entrada; termina `CU-CAT-43` y puede iniciar `CU-CAT-45` Editar motivo de ajuste. El caso de edición comprueba nuevamente sus precondiciones y autorización. |
| Excepciones | **E1 — Acceso, recurso o entrada rechazados:**<br>1. **Nexus:** rechaza la operación sin exponer otro catálogo ni producir cambios parciales.<br>2. **Administrador:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La tabla muestra exclusivamente las entradas de Motivos de ajuste.<br>2. **Fallo:** No se exponen datos ni modelos no autorizados. |
| Requisitos relacionados | `RF-CAT-022`, `RN-001`, `RN-006`. |

#### `CU-CAT-44` — Crear motivo de ajuste

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-44` |
| Nombre | Crear motivo de ajuste. |
| Actor y disparador | **Actor:** Administrador del sistema del área Sistemas. **Disparador:** selecciona **Nuevo** en `CU-CAT-43` Consultar motivo de ajuste. |
| Participación de actor y sistema | **Actor:** captura y confirma una nueva entrada de Motivos de ajuste.<br>**Nexus:** autoriza, limita los campos, valida, crea y refresca la tabla. |
| Precondiciones | 1. El actor inició sesión y cuenta con autorización para administrar catálogos.<br>2. La pantalla seleccionada corresponde exactamente a **Motivos de ajuste**. |
| Flujo principal | 1. **Administrador:** abre la pantalla **Motivos de ajuste** y selecciona **Nuevo** **(ver E1)**.<br>2. **Nexus:** presenta únicamente los campos **Nombre** y **Activo**.<br>3. **Administrador:** captura los datos y selecciona **Guardar** **(ver A1)**.<br>4. **Nexus:** revisa la información y crea la entrada de Motivos de ajuste.<br>5. **Nexus:** confirma y refresca la tabla de Motivos de ajuste. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** señala los campos requeridos sin crear la entrada.<br>2. **Administrador:** corrige y vuelve a confirmar; continúa en el paso 4. |
| Excepciones | **E1 — Acceso, recurso o entrada rechazados:**<br>1. **Nexus:** rechaza la operación sin exponer otro catálogo ni producir cambios parciales.<br>2. **Administrador:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La nueva entrada de Motivos de ajuste queda registrada y visible.<br>2. **Fallo:** No se crea ninguna entrada. |
| Requisitos relacionados | `RF-CAT-023`, `RN-001`, `RN-006`. |

#### `CU-CAT-45` — Editar motivo de ajuste

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-45` |
| Nombre | Editar motivo de ajuste. |
| Actor y disparador | **Actor:** Administrador del sistema del área Sistemas. **Disparador:** selecciona **Editar registro** en la pantalla **Motivos de ajuste**. |
| Participación de actor y sistema | **Actor:** modifica y confirma una entrada de Motivos de ajuste.<br>**Nexus:** autoriza, limita los campos, valida, actualiza y refresca la tabla. |
| Precondiciones | 1. El actor inició sesión y cuenta con autorización para administrar catálogos.<br>2. La entrada existe en **Motivos de ajuste**. |
| Flujo principal | 1. **Administrador:** abre **Motivos de ajuste** y selecciona **Editar registro** en una fila **(ver E1)**.<br>2. **Nexus:** presenta los valores existentes y únicamente los campos **Nombre** y **Activo**.<br>3. **Administrador:** modifica los datos y selecciona **Actualizar** **(ver A1)**.<br>4. **Nexus:** revisa la información y actualiza la entrada de Motivos de ajuste.<br>5. **Nexus:** confirma y refresca la tabla de Motivos de ajuste. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** señala los campos requeridos y conserva la entrada sin cambios.<br>2. **Administrador:** corrige y vuelve a confirmar; continúa en el paso 4. |
| Excepciones | **E1 — Acceso, recurso o entrada rechazados:**<br>1. **Nexus:** rechaza la operación sin exponer otro catálogo ni producir cambios parciales.<br>2. **Administrador:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La entrada de Motivos de ajuste conserva los cambios admitidos.<br>2. **Fallo:** La entrada conserva su estado anterior. |
| Requisitos relacionados | `RF-CAT-024`, `RN-001`, `RN-006`. |

#### `CU-CAT-46` — Consultar estado de cumplimiento

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-46` |
| Nombre | Consultar estado de cumplimiento. |
| Actor y disparador | **Actor:** Administrador del sistema del área Sistemas. **Disparador:** selecciona **Estados de cumplimiento** en el submenú **Catálogos auxiliares**. |
| Participación de actor y sistema | **Actor:** abre y revisa el listado de Estados de cumplimiento.<br>**Nexus:** autoriza, valida el recurso registrado y devuelve sus entradas. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con autorización para administrar catálogos y pertenece al contexto administrativo autorizado. |
| Flujo principal | 1. **Administrador:** selecciona **Estados de cumplimiento** en el submenú **Catálogos auxiliares** **(ver E1)**.<br>2. **Nexus:** comprueba que puede consultar Estados de cumplimiento y muestra su tabla.<br>3. **Nexus:** presenta **Nuevo** como acción principal para registrar un estado de cumplimiento.<br>4. **Administrador:** selecciona **Nuevo**; termina `CU-CAT-46` y con esa selección dispara `CU-CAT-47` Crear estado de cumplimiento. |
| Flujos alternativos | **A1 — Permanecer en la consulta (después del paso 3):**<br>1. **Administrador:** decide no iniciar el alta y revisa o busca entradas sin modificar datos.<br>2. **Nexus:** conserva la tabla de Estados de cumplimiento; termina el caso de uso.<br>**A2 — Editar una entrada (después del paso 3 del flujo principal):**<br>1. **Administrador:** selecciona **Editar registro** en una entrada; termina `CU-CAT-46` y puede iniciar `CU-CAT-48` Editar estado de cumplimiento. El caso de edición comprueba nuevamente sus precondiciones y autorización. |
| Excepciones | **E1 — Acceso, recurso o entrada rechazados:**<br>1. **Nexus:** rechaza la operación sin exponer otro catálogo ni producir cambios parciales.<br>2. **Administrador:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La tabla muestra exclusivamente las entradas de Estados de cumplimiento.<br>2. **Fallo:** No se exponen datos ni modelos no autorizados. |
| Requisitos relacionados | `RF-CAT-022`, `RN-001`, `RN-006`. |

#### `CU-CAT-47` — Crear estado de cumplimiento

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-47` |
| Nombre | Crear estado de cumplimiento. |
| Actor y disparador | **Actor:** Administrador del sistema del área Sistemas. **Disparador:** selecciona **Nuevo** en `CU-CAT-46` Consultar estado de cumplimiento. |
| Participación de actor y sistema | **Actor:** captura y confirma una nueva entrada de Estados de cumplimiento.<br>**Nexus:** autoriza, limita los campos, valida, crea y refresca la tabla. |
| Precondiciones | 1. El actor inició sesión y cuenta con autorización para administrar catálogos.<br>2. La pantalla seleccionada corresponde exactamente a **Estados de cumplimiento**. |
| Flujo principal | 1. **Administrador:** abre la pantalla **Estados de cumplimiento** y selecciona **Nuevo** **(ver E1)**.<br>2. **Nexus:** presenta los campos **Nombre** y **Activo**.<br>3. **Administrador:** captura los datos y selecciona **Guardar** **(ver A1)**.<br>4. **Nexus:** revisa la información y crea la entrada de Estados de cumplimiento.<br>5. **Nexus:** confirma y refresca la tabla de Estados de cumplimiento. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** señala los campos requeridos sin crear la entrada.<br>2. **Administrador:** corrige y vuelve a confirmar; continúa en el paso 4. |
| Excepciones | **E1 — Acceso, recurso o entrada rechazados:**<br>1. **Nexus:** rechaza la operación sin exponer otro catálogo ni producir cambios parciales.<br>2. **Administrador:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La nueva entrada de Estados de cumplimiento queda registrada y visible.<br>2. **Fallo:** No se crea ninguna entrada. |
| Requisitos relacionados | `RF-CAT-023`, `RN-001`, `RN-006`. |

#### `CU-CAT-48` — Editar estado de cumplimiento

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-CAT-48` |
| Nombre | Editar estado de cumplimiento. |
| Actor y disparador | **Actor:** Administrador del sistema del área Sistemas. **Disparador:** selecciona **Editar registro** en la pantalla **Estados de cumplimiento**. |
| Participación de actor y sistema | **Actor:** modifica y confirma una entrada de Estados de cumplimiento.<br>**Nexus:** autoriza, limita los campos, valida, actualiza y refresca la tabla. |
| Precondiciones | 1. El actor inició sesión y cuenta con autorización para administrar catálogos.<br>2. La entrada existe en **Estados de cumplimiento**. |
| Flujo principal | 1. **Administrador:** abre **Estados de cumplimiento** y selecciona **Editar registro** en una fila **(ver E1)**.<br>2. **Nexus:** presenta los valores existentes de **Nombre** y **Activo**.<br>3. **Administrador:** modifica los datos y selecciona **Actualizar** **(ver A1)**.<br>4. **Nexus:** revisa la información y actualiza la entrada de Estados de cumplimiento.<br>5. **Nexus:** confirma y refresca la tabla de Estados de cumplimiento. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** señala los campos requeridos y conserva la entrada sin cambios.<br>2. **Administrador:** corrige y vuelve a confirmar; continúa en el paso 4. |
| Excepciones | **E1 — Acceso, recurso o entrada rechazados:**<br>1. **Nexus:** rechaza la operación sin exponer otro catálogo ni producir cambios parciales.<br>2. **Administrador:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La entrada de Estados de cumplimiento conserva los cambios admitidos.<br>2. **Fallo:** La entrada conserva su estado anterior. |
| Requisitos relacionados | `RF-CAT-024`, `RN-001`, `RN-006`. |

### Grupo funcional ENT — Compras de material

Cada ficha representa una sola acción sobre una sola entidad. Los elementos compartidos se reutilizan en la implementación, pero no fusionan objetivos del actor.

#### `CU-ENT-01` — Consultar compras de material

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ENT-01` |
| Nombre | Consultar compras de material. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** necesita localizar o revisar compras de material y abre la opción de consulta correspondiente. |
| Participación de actor y sistema | **Actor:** abre la consulta, define criterios y selecciona registros.<br>**Nexus:** autoriza, presenta filtros y devuelve sólo la información permitida. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Flujo principal | 1. **Actor:** abre la opción para consultar compras de material **(ver E1)**.<br>2. **Nexus:** comprueba su autorización y muestra la consulta con sus criterios disponibles.<br>3. **Actor:** define los criterios que necesita y solicita aplicarlos **(ver A1)**.<br>4. **Nexus:** presenta la información autorizada y la acción principal para registrar una compra.<br>5. **Actor:** selecciona la acción principal; termina `CU-ENT-01` y con esa selección dispara `CU-ENT-02` Crear compra de material. |
| Flujos alternativos | **A1 — Continuar la consulta (después del paso 3):**<br>1. **Nexus:** actualiza la información y el total sin modificar datos.<br>2. **Actor:** revisa los resultados o cambia los criterios.<br>3. **Nexus:** conserva la consulta disponible; termina el caso de uso.<br>**A2 — Elegir otra acción (después del paso 4 del flujo principal):**<br>1. **Actor:** selecciona editar la compra, corregir uno de sus materiales o cancelarlo en lugar de iniciar el alta; termina `CU-ENT-01` y puede iniciar `CU-ENT-03` Editar compra de material, `CU-ENT-04` Corregir material de una compra o `CU-ENT-05` Cancelar material de una compra. También puede iniciar `CU-ENT-06` Generar reporte de compras de material. Cada caso elegido comprueba nuevamente sus precondiciones y autorización; la selección no constituye `«include»` ni `«extend»`. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Listado y detalle sin modificar inventario.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-REC-001`. |

#### `CU-ENT-02` — Crear compra de material

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ENT-02` |
| Nombre | Crear compra de material. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** selecciona la acción principal para crear una compra desde `CU-ENT-01` Consultar compras de material. |
| Participación de actor y sistema | **Actor:** abre el alta, captura datos y confirma.<br>**Nexus:** carga opciones, valida, registra y comunica el resultado. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de alta.<br>3. Existen los datos relacionados requeridos para completar el registro. |
| Flujo principal | 1. **Actor:** abre «Agregar compra» **(ver E1)**.<br>2. **Nexus:** muestra el formulario y carga proveedores, personas receptoras y materiales disponibles.<br>3. **Actor:** indica si el comprobante es factura o remisión; captura el número de factura sólo cuando corresponde, proveedor, persona receptora, fecha y hora de recepción y observaciones.<br>4. **Actor:** agrega cada material con su cantidad y costo por presentación, revisa los detalles y confirma **(ver A1)** **(ver A2)**.<br>5. **Nexus:** valida el tipo de comprobante, la factura cuando aplica, las relaciones, la fecha, las cantidades y los costos, y calcula los totales **(ver A3)** **(ver A4)**.<br>6. **Nexus:** registra compra y detalles, incrementa existencias y conserva los movimientos como una sola operación.<br>7. **Nexus:** actualiza la tabla y confirma el registro. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 4):**<br>1. **Nexus:** valida la información capturada, detecta campos incompletos, formatos incorrectos, relaciones no permitidas o cantidades fuera de las reglas del caso y los señala sin registrar cambios.<br>2. **Actor:** corrige la información indicada y vuelve a confirmar; continúa en el paso 5 del flujo principal.<br>**A2 — Material repetido en el detalle (después del paso 4):**<br>1. **Nexus:** conserva renglones separados del mismo material cuando representan cantidades o costos por presentación distintos y muestra cada detalle para revisión.<br>2. **Actor:** confirma que los renglones corresponden a recepciones diferenciadas; continúa en el paso 5 del flujo principal.<br>**A3 — Factura ya registrada (después del paso 5):**<br>1. **Actor:** revisa el folio existente que Nexus presenta.<br>2. **Nexus:** rechaza la combinación repetida de proveedor y factura sin registrar compra, detalles, movimientos ni existencias.<br>3. **Actor:** termina `CU-ENT-02` y puede abrir la compra existente para agregar los materiales faltantes; termina el caso de uso.<br>**A4 — Material o proveedor inactivo (después del paso 5):**<br>1. **Actor:** revisa los recursos inactivos señalados por Nexus.<br>2. **Nexus:** conserva el formulario sin crear detalles, movimientos ni cambios de stock.<br>3. **Actor:** selecciona recursos activos o solicita su reactivación cuando proceda y vuelve a confirmar; continúa en el paso 5 del flujo principal. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La compra y sus detalles quedan registrados.<br>2. **Éxito:** Las existencias incorporan las cantidades recibidas.<br>3. **Éxito:** Los movimientos de entrada quedan registrados.<br>4. **Éxito:** La compra, las existencias y los movimientos se conservan como una sola operación transaccional.<br>5. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-REC-003`, `RF-REC-004`, `RF-REC-007`. |

#### `CU-ENT-03` — Editar compra de material

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ENT-03` |
| Nombre | Editar compra de material. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** detecta datos que debe corregir en una compra de material y selecciona su acción de edición. |
| Participación de actor y sistema | **Actor:** selecciona el registro, modifica datos y confirma.<br>**Nexus:** presenta valores vigentes, valida, actualiza y comunica el resultado. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de edición.<br>3. El registro objetivo existe.<br>4. El registro se encuentra en un estado que admite los cambios solicitados. |
| Flujo principal | 1. **Actor:** selecciona una compra y abre su edición **(ver E1)**.<br>2. **Nexus:** muestra el encabezado y los detalles actuales y habilita sólo los campos permitidos.<br>3. **Actor:** modifica el tipo de comprobante, número de factura cuando aplica, proveedor, persona receptora, fecha, observaciones o agrega detalles con material, cantidad y costo por presentación; después selecciona «Actualizar» **(ver A1)**.<br>4. **Nexus:** valida el estado, la factura y los cambios solicitados **(ver A2)**.<br>5. **Nexus:** guarda los cambios sin volver a aplicar la existencia de detalles anteriores y confirma la actualización. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** valida la información capturada, detecta campos incompletos, formatos incorrectos, relaciones no permitidas o cantidades fuera de las reglas del caso y los señala sin registrar cambios.<br>2. **Actor:** corrige la información indicada y vuelve a confirmar; continúa en el paso 4 del flujo principal.<br>**A2 — Recurso inactivo en un detalle nuevo (después del paso 4):**<br>1. **Actor:** revisa el material o proveedor inactivo señalado por Nexus.<br>2. **Nexus:** conserva el encabezado y los detalles persistidos sin agregar el detalle nuevo ni modificar stock.<br>3. **Actor:** selecciona recursos activos y vuelve a confirmar; continúa en el paso 4 del flujo principal. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** El encabezado y los detalles admitidos reflejan los cambios confirmados.<br>2. **Éxito:** Las existencias de los detalles anteriores no vuelven a aplicarse.<br>3. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-REC-005`. |

#### `CU-ENT-04` — Corregir material de una compra

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ENT-04` |
| Nombre | Corregir material de una compra. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** detecta una diferencia en un material de una compra y abre la corrección del detalle. |
| Participación de actor y sistema | **Actor:** selecciona el detalle, captura la corrección y confirma.<br>**Nexus:** valida y coordina detalle, existencia, movimiento, totales e historial. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso operativo.<br>3. La compra y el detalle existen.<br>4. El detalle se encuentra en un estado que admite corrección. |
| Flujo principal | 1. **Actor:** selecciona un material de la compra y abre «Corregir detalle» **(ver E1)**.<br>2. **Nexus:** muestra el detalle y sus valores actuales y habilita «Cantidad correcta» y «Costo por presentación correcto».<br>3. **Actor:** captura la corrección y la confirma **(ver A1)**.<br>4. **Nexus:** valida que la cantidad corregida sea positiva y no exceda la recibida, que el costo sea positivo, que exista una diferencia y que el inventario permita aplicar la reducción **(ver E2)**.<br>5. **Nexus:** actualiza detalle, existencia, movimiento, totales e historial como una sola operación y confirma. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** valida la información capturada, detecta campos incompletos, formatos incorrectos, relaciones no permitidas o cantidades fuera de las reglas del caso y los señala sin registrar cambios.<br>2. **Actor:** corrige la información indicada y vuelve a confirmar; continúa en el paso 4 del flujo principal. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso.<br>**E2 — Existencia insuficiente para reducir la recepción (después del paso 4):**<br>1. **Actor:** revisa la existencia disponible y la reducción que Nexus no puede aplicar.<br>2. **Nexus:** rechaza la corrección y conserva sin cambios el detalle, la existencia, el movimiento, los totales y el historial; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** El detalle conserva la cantidad o el costo corregido.<br>2. **Éxito:** La existencia refleja la diferencia autorizada.<br>3. **Éxito:** El movimiento y los totales reflejan la corrección.<br>4. **Éxito:** El historial conserva los valores anteriores, los corregidos y el actor de la corrección.<br>5. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-REC-002`, `RN-002`, `RN-005`, `RN-012`. |

#### `CU-ENT-05` — Cancelar material de una compra

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ENT-05` |
| Nombre | Cancelar material de una compra. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** determina que debe anular material de una compra y solicita la cancelación. |
| Participación de actor y sistema | **Actor:** selecciona el detalle y confirma la cancelación.<br>**Nexus:** valida y coordina la cancelación, la existencia, el movimiento y los totales. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso operativo.<br>3. La compra y el detalle activo existen.<br>4. El detalle se encuentra en un estado que admite cancelación. |
| Flujo principal | 1. **Actor:** selecciona un detalle activo y solicita cancelarlo **(ver E1)**.<br>2. **Nexus:** identifica el detalle y solicita confirmación.<br>3. **Actor:** confirma la cancelación.<br>4. **Nexus:** valida que el detalle siga activo y que la existencia recibida pueda revertirse **(ver E2)**.<br>5. **Nexus:** cancela el detalle, revierte existencia, movimiento y totales y confirma el resultado. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso.<br>**E2 — Detalle no cancelable o existencia insuficiente (después del paso 4):**<br>1. **Actor:** revisa el estado vigente del detalle o la existencia insuficiente que Nexus informa.<br>2. **Nexus:** rechaza la cancelación y conserva sin cambios el detalle, la existencia, el movimiento y los totales; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** El detalle queda cancelado.<br>2. **Éxito:** La existencia recibida por el detalle queda revertida.<br>3. **Éxito:** El movimiento y los totales reflejan la cancelación.<br>4. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-REC-008`, `RN-002`, `RN-012`, `RN-017`. |

#### `CU-ENT-06` — Generar reporte de compras de material

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-ENT-06` |
| Nombre | Generar reporte de compras de material. |
| Actor y disparador | **Actor:** Usuario con permiso sobre el reporte o consulta. **Disparador:** desde `CU-ENT-01` Consultar compras de material, selecciona la opción para generar el reporte con los filtros que necesita conservar. |
| Participación de actor y sistema | **Actor:** define filtros y solicita la exportación.<br>**Nexus:** autoriza, consolida la información y entrega el archivo. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Flujo principal | 1. **Nexus:** después de que el actor selecciona la exportación desde la consulta de origen, abre el modal **Exportar reporte** y muestra las opciones aplicables **(ver E1)**.<br>2. **Actor:** conserva o ajusta los filtros, incluye las opciones disponibles y confirma.<br>3. **Nexus:** vuelve a comprobar autorización y parámetros y prepara la información de compras de material.<br>4. **Nexus:** genera el archivo de Excel e inicia su descarga; si no hay datos, informa que el resultado está vacío. |
| Excepciones | **E1 — Exportación rechazada (después del disparador):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Archivo Excel con filtros, columnas y cálculos propios del reporte.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-REP-002`, `RF-REP-004`. |


### Grupo funcional SAL — Salidas de material y de merma

Cada ficha representa una sola acción sobre una sola entidad. Los elementos compartidos se reutilizan en la implementación, pero no fusionan objetivos del actor.

#### `CU-SAL-01` — Consultar salidas de material

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-SAL-01` |
| Nombre | Consultar salidas de material. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** necesita localizar o revisar salidas de material y abre la opción de consulta correspondiente. |
| Participación de actor y sistema | **Actor:** abre la consulta, define criterios y selecciona registros.<br>**Nexus:** autoriza, presenta filtros y devuelve sólo la información permitida. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Flujo principal | 1. **Actor:** abre la opción para consultar salidas de material **(ver E1)**.<br>2. **Nexus:** comprueba su autorización y muestra la consulta con sus criterios disponibles.<br>3. **Actor:** define los criterios que necesita y solicita aplicarlos **(ver A1)**.<br>4. **Nexus:** presenta la información autorizada y la acción principal para registrar una salida de material.<br>5. **Actor:** selecciona la acción principal; termina `CU-SAL-01` y con esa selección dispara `CU-SAL-02` Crear salida de material. |
| Flujos alternativos | **A1 — Continuar la consulta (después del paso 3):**<br>1. **Nexus:** actualiza la información y el total sin modificar datos.<br>2. **Actor:** revisa los resultados o cambia los criterios.<br>3. **Nexus:** conserva la consulta disponible; termina el caso de uso.<br>**A2 — Elegir otra acción (después del paso 4 del flujo principal):**<br>1. **Actor:** selecciona editar el encabezado o los materiales, surtir o devolver material en lugar de iniciar el alta; termina `CU-SAL-01` y puede iniciar `CU-SAL-03` Editar encabezado, `CU-SAL-04` Editar detalles de material, `CU-SAL-05` Surtir material o `CU-SAL-06` Devolver material surtido. También puede iniciar `CU-SAL-07` Generar reporte de salidas de material. Cada caso elegido comprueba nuevamente sus precondiciones y autorización; la selección no constituye `«include»` ni `«extend»`. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Consulta sin modificar existencias.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-ISS-001`. |

#### `CU-SAL-02` — Crear salida de material

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-SAL-02` |
| Nombre | Crear salida de material. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** selecciona la acción principal para crear una salida desde `CU-SAL-01` Consultar salidas de material. |
| Participación de actor y sistema | **Actor:** abre el alta, captura datos y confirma.<br>**Nexus:** carga opciones, valida, registra y comunica el resultado. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de alta.<br>3. Existen los datos relacionados requeridos para completar el registro. |
| Flujo principal | 1. **Actor:** abre «Agregar salida de material» **(ver E1)**.<br>2. **Nexus:** muestra el formulario y carga clientes, asesores, áreas, solicitantes y materiales disponibles.<br>3. **Actor:** selecciona cliente, asesor, área y solicitante; captura número de proyecto, fecha y hora de solicitud y observaciones.<br>4. **Actor:** agrega cada material con su cantidad, revisa los detalles y selecciona «Guardar» **(ver A1)**. Si vuelve a agregar la misma combinación material-proveedor, el formulario reemplaza su renglón con la cantidad capturada más reciente, sin sumarla.<br>5. **Nexus:** valida participantes, relaciones, materiales y cantidades **(ver A2)**.<br>6. **Nexus:** crea la salida pendiente sin descontar existencias, actualiza la tabla y confirma. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 4):**<br>1. **Nexus:** valida la información capturada, detecta campos incompletos, formatos incorrectos, relaciones no permitidas o cantidades fuera de las reglas del caso y los señala sin registrar cambios.<br>2. **Actor:** corrige la información indicada y vuelve a confirmar; continúa en el paso 5 del flujo principal.<br>**A2 — Material o proveedor inactivo (después del paso 5):**<br>1. **Actor:** revisa los recursos inactivos señalados por Nexus.<br>2. **Nexus:** conserva el formulario sin crear la salida, detalles ni cambios de stock.<br>3. **Actor:** selecciona recursos activos y vuelve a confirmar; continúa en el paso 5 del flujo principal. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La salida de material queda registrada en estado pendiente.<br>2. **Éxito:** Las existencias permanecen sin cambios hasta el surtimiento.<br>3. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-ISS-004`. |

#### `CU-SAL-03` — Editar encabezado de salida de material

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-SAL-03` |
| Nombre | Editar encabezado de salida de material. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** detecta datos que debe corregir en el encabezado de una salida de material y selecciona su acción de edición. |
| Participación de actor y sistema | **Actor:** selecciona el registro, modifica datos y confirma.<br>**Nexus:** presenta valores vigentes, valida, actualiza y comunica el resultado. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de edición.<br>3. El registro objetivo existe.<br>4. El registro se encuentra en un estado que admite los cambios solicitados. |
| Flujo principal | 1. **Actor:** selecciona una salida de material y abre la edición de encabezado **(ver E1)**.<br>2. **Nexus:** muestra los datos actuales y habilita sólo los campos permitidos por su estado.<br>3. **Actor:** modifica los datos contextuales y confirma **(ver A1)**.<br>4. **Nexus:** valida el estado, los participantes y las relaciones y actualiza el encabezado.<br>5. **Nexus:** conserva intactas las cantidades y existencias y confirma la actualización. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** valida la información capturada, detecta campos incompletos, formatos incorrectos, relaciones no permitidas o cantidades fuera de las reglas del caso y los señala sin registrar cambios.<br>2. **Actor:** corrige la información indicada y vuelve a confirmar; continúa en el paso 4 del flujo principal. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** El encabezado conserva los cambios admitidos.<br>2. **Éxito:** Los detalles, las cantidades y las existencias permanecen sin cambios.<br>3. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-ISS-005`. |

#### `CU-SAL-04` — Editar detalles de material de una salida

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-SAL-04` |
| Nombre | Editar detalles de material de una salida. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** necesita agregar o corregir materiales de una salida todavía modificables y abre los detalles. |
| Participación de actor y sistema | **Actor:** selecciona la salida o detalle, captura la acción y confirma.<br>**Nexus:** presenta cantidades y acciones permitidas, valida y actualiza documento, inventario y movimientos cuando corresponde. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de edición.<br>3. La salida existe.<br>4. La salida se encuentra en un estado que admite modificar sus detalles. |
| Flujo principal | 1. **Actor:** abre los detalles de una salida todavía modificable **(ver E1)**.<br>2. **Nexus:** muestra los materiales actuales, cantidades y acciones permitidas.<br>3. **Actor:** agrega o modifica materiales y confirma los cambios **(ver A1)**.<br>4. **Nexus:** valida estado, recursos, cantidades pendientes y acumulados.<br>5. **Nexus:** actualiza los detalles sin descontar existencias y confirma el resultado. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** valida la información capturada, detecta campos incompletos, formatos incorrectos, relaciones no permitidas o cantidades fuera de las reglas del caso y los señala sin registrar cambios.<br>2. **Actor:** corrige la información indicada y vuelve a confirmar; continúa en el paso 4 del flujo principal. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Los detalles conservan los materiales y cantidades confirmados.<br>2. **Éxito:** Las existencias permanecen sin cambios hasta el surtimiento.<br>3. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-ISS-006`. |

#### `CU-SAL-05` — Surtir material

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-SAL-05` |
| Nombre | Surtir material. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** va a entregar material de una solicitud pendiente y abre sus detalles. |
| Participación de actor y sistema | **Actor:** selecciona la salida o detalle, captura la acción y confirma.<br>**Nexus:** presenta cantidades y acciones permitidas, valida y actualiza documento, inventario y movimientos cuando corresponde. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso operativo.<br>3. La salida y el detalle existen.<br>4. El detalle conserva cantidad pendiente.<br>5. Hay existencia suficiente para surtir la cantidad solicitada. |
| Flujo principal | 1. **Actor:** abre los detalles de la salida de material y selecciona un renglón pendiente **(ver E1)**.<br>2. **Nexus:** muestra la cantidad pendiente y la existencia disponible.<br>3. **Actor:** marca los renglones que surtirá, captura la cantidad de proyecto requerida para cada uno y confirma **(ver A1)**.<br>4. **Nexus:** valida el estado, los renglones seleccionados, la cantidad pendiente y la existencia suficiente **(ver A2)** **(ver E2)**.<br>5. **Nexus:** descuenta existencia, acumula lo surtido, actualiza estados, registra el movimiento y confirma. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** valida la información capturada, detecta campos incompletos, formatos incorrectos, relaciones no permitidas o cantidades fuera de las reglas del caso y los señala sin registrar cambios.<br>2. **Actor:** corrige la información indicada y vuelve a confirmar; continúa en el paso 4 del flujo principal.<br>**A2 — Recurso desactivado después de registrar la salida (después del paso 4):**<br>1. **Actor:** revisa el aviso de que el recurso del detalle fue desactivado después de registrar la salida.<br>2. **Nexus:** conserva el detalle histórico y permite surtir su pendiente si existe stock suficiente, sin habilitar el recurso para operaciones nuevas.<br>3. **Actor:** confirma que completará el compromiso y continúa en el paso 5 del flujo principal, o cancela la confirmación y termina el caso de uso con el detalle pendiente. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso.<br>**E2 — Existencia insuficiente o detalle ya atendido (después del paso 4):**<br>1. **Actor:** revisa la existencia o la cantidad pendiente vigentes que Nexus informa.<br>2. **Nexus:** rechaza el surtimiento y conserva sin cambios el detalle, el encabezado, la existencia y los movimientos; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La existencia disminuye en la cantidad surtida.<br>2. **Éxito:** El detalle acumula la cantidad surtida.<br>3. **Éxito:** Los estados de cumplimiento quedan actualizados.<br>4. **Éxito:** El movimiento de salida queda registrado.<br>5. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-ISS-002`, `RN-002`, `RN-003`, `RN-012`, `RN-015`, `RN-016`. |

#### `CU-SAL-06` — Devolver material surtido

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-SAL-06` |
| Nombre | Devolver material surtido. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** recibe de vuelta material surtido y abre la devolución del detalle. |
| Participación de actor y sistema | **Actor:** selecciona la salida o detalle, captura la acción y confirma.<br>**Nexus:** presenta cantidades y acciones permitidas, valida y actualiza documento, inventario y movimientos cuando corresponde. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso operativo.<br>3. La salida y el detalle existen.<br>4. El detalle conserva una cantidad surtida todavía retornable. |
| Flujo principal | 1. **Actor:** abre una salida de material y selecciona un detalle surtido para devolverlo **(ver E1)**.<br>2. **Nexus:** muestra la cantidad que todavía puede devolverse.<br>3. **Actor:** captura la cantidad recibida de vuelta, registra las observaciones y selecciona «Devolver» **(ver A1)**.<br>4. **Nexus:** valida la cantidad retornable.<br>5. **Nexus:** reintegra existencia, acumula la devolución, actualiza estados, registra el movimiento inverso y confirma. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** valida la información capturada, detecta campos incompletos, formatos incorrectos, relaciones no permitidas o cantidades fuera de las reglas del caso y los señala sin registrar cambios.<br>2. **Actor:** corrige la información indicada y vuelve a confirmar; continúa en el paso 4 del flujo principal. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La existencia aumenta en la cantidad devuelta y el movimiento inverso queda registrado.<br>2. **Éxito, devolución parcial del detalle:** el detalle acumula la devolución y conserva cumplimiento `Surtido`; no queda cancelado.<br>3. **Éxito, devolución total del detalle:** el detalle acumula la devolución y deriva cumplimiento `Cancelado`; no se ejecuta una acción adicional de cancelación.<br>4. **Éxito, agregación del encabezado:** sólo si todos los detalles tienen cumplimiento `Cancelado`, la salida deriva cumplimiento `Cancelado` y estado documental `Cancelada`; mientras exista otro detalle no cancelado, el encabezado no se cancela.<br>5. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-ISS-003`, `RN-002`, `RN-014`, `RN-028`, `RN-029`. |


#### `CU-SAL-07` — Generar reporte de salidas de material

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-SAL-07` |
| Nombre | Generar reporte de salidas de material. |
| Actor y disparador | **Actor:** Usuario con permiso sobre el reporte o consulta. **Disparador:** desde `CU-SAL-01` Consultar salidas de material, selecciona la opción para generar el reporte con los filtros que necesita conservar. |
| Participación de actor y sistema | **Actor:** define filtros y solicita la exportación.<br>**Nexus:** autoriza, consolida la información y entrega el archivo. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Flujo principal | 1. **Nexus:** después de que el actor selecciona la exportación desde la consulta de origen, abre el modal **Exportar reporte** y muestra las opciones aplicables **(ver E1)**.<br>2. **Actor:** conserva o ajusta los filtros, incluye las opciones disponibles y confirma.<br>3. **Nexus:** vuelve a comprobar autorización y parámetros y prepara la información de salidas de material.<br>4. **Nexus:** genera el archivo de Excel e inicia su descarga; si no hay datos, informa que el resultado está vacío. |
| Excepciones | **E1 — Exportación rechazada (después del disparador):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Archivo Excel con filtros, columnas y cálculos propios del reporte.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-REP-002`, `RF-REP-004`. |

#### `CU-SAL-08` — Consultar salidas de merma

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-SAL-08` |
| Nombre | Consultar salidas de merma. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** necesita localizar o revisar salidas de merma y abre la opción de consulta correspondiente. |
| Participación de actor y sistema | **Actor:** abre la consulta, define criterios y selecciona registros.<br>**Nexus:** autoriza, presenta filtros y devuelve sólo la información permitida. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Flujo principal | 1. **Actor:** abre la opción para consultar salidas de merma **(ver E1)**.<br>2. **Nexus:** comprueba su autorización y muestra la consulta con sus criterios disponibles.<br>3. **Actor:** define los criterios que necesita y solicita aplicarlos **(ver A1)**.<br>4. **Nexus:** presenta la información autorizada y la acción principal para registrar una salida de merma.<br>5. **Actor:** selecciona la acción principal; termina `CU-SAL-08` y con esa selección dispara `CU-SAL-09` Crear salida de merma. |
| Flujos alternativos | **A1 — Continuar la consulta (después del paso 3):**<br>1. **Nexus:** actualiza la información y el total sin modificar datos.<br>2. **Actor:** revisa los resultados o cambia los criterios.<br>3. **Nexus:** conserva la consulta disponible; termina el caso de uso.<br>**A2 — Elegir otra acción (después del paso 4 del flujo principal):**<br>1. **Actor:** selecciona editar el encabezado o las mermas, surtir o devolver merma en lugar de iniciar el alta; termina `CU-SAL-08` y puede iniciar `CU-SAL-10` Editar encabezado, `CU-SAL-11` Editar detalles de merma, `CU-SAL-12` Surtir merma o `CU-SAL-13` Devolver merma surtida. También puede iniciar `CU-SAL-14` Generar reporte de salidas de merma. Cada caso elegido comprueba nuevamente sus precondiciones y autorización; la selección no constituye `«include»` ni `«extend»`. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Consulta sin modificar existencias.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-WST-001`. |

#### `CU-SAL-09` — Crear salida de merma

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-SAL-09` |
| Nombre | Crear salida de merma. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** selecciona la acción principal para crear una salida desde `CU-SAL-08` Consultar salidas de merma. |
| Participación de actor y sistema | **Actor:** abre el alta, captura datos y confirma.<br>**Nexus:** carga opciones, valida, registra y comunica el resultado. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de alta.<br>3. Existen los datos relacionados requeridos para completar el registro. |
| Flujo principal | 1. **Actor:** abre «Agregar salida de merma» **(ver E1)**.<br>2. **Nexus:** muestra el formulario y carga clientes, asesores, áreas, solicitantes y mermas disponibles.<br>3. **Actor:** selecciona cliente, asesor, área y solicitante; captura número de proyecto, fecha y hora de solicitud y observaciones.<br>4. **Actor:** agrega cada merma con su cantidad, revisa los detalles y selecciona «Guardar» **(ver A1)**. Si vuelve a agregar la misma merma, el formulario reemplaza su renglón con la cantidad capturada más reciente, sin sumarla.<br>5. **Nexus:** valida participantes, relaciones, mermas y cantidades y rechaza cualquier carga que todavía contenga una merma repetida **(ver A2)**.<br>6. **Nexus:** crea la salida pendiente sin descontar existencias, actualiza la tabla y confirma. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 4):**<br>1. **Nexus:** valida la información capturada, detecta campos incompletos, formatos incorrectos, relaciones no permitidas o cantidades fuera de las reglas del caso y los señala sin registrar cambios.<br>2. **Actor:** corrige la información indicada y vuelve a confirmar; continúa en el paso 5 del flujo principal.<br>**A2 — Merma inactiva (después del paso 5):**<br>1. **Actor:** revisa la merma inactiva señalada por Nexus.<br>2. **Nexus:** conserva el formulario sin crear la salida, detalles ni cambios de stock.<br>3. **Actor:** selecciona una merma activa y vuelve a confirmar; continúa en el paso 5 del flujo principal. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La salida de merma queda registrada en estado pendiente.<br>2. **Éxito:** Las existencias permanecen sin cambios hasta el surtimiento.<br>3. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-WST-002`. |

#### `CU-SAL-10` — Editar encabezado de salida de merma

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-SAL-10` |
| Nombre | Editar encabezado de salida de merma. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** detecta datos que debe corregir en el encabezado de una salida de merma y selecciona su acción de edición. |
| Participación de actor y sistema | **Actor:** selecciona el registro, modifica datos y confirma.<br>**Nexus:** presenta valores vigentes, valida, actualiza y comunica el resultado. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de edición.<br>3. El registro objetivo existe.<br>4. El registro se encuentra en un estado que admite los cambios solicitados. |
| Flujo principal | 1. **Actor:** selecciona una salida de merma y abre la edición de encabezado **(ver E1)**.<br>2. **Nexus:** muestra los datos actuales y habilita sólo los campos permitidos por su estado.<br>3. **Actor:** modifica los datos contextuales y confirma **(ver A1)**.<br>4. **Nexus:** valida el estado, los participantes y las relaciones y actualiza el encabezado.<br>5. **Nexus:** conserva intactas las cantidades y existencias y confirma la actualización. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** valida la información capturada, detecta campos incompletos, formatos incorrectos, relaciones no permitidas o cantidades fuera de las reglas del caso y los señala sin registrar cambios.<br>2. **Actor:** corrige la información indicada y vuelve a confirmar; continúa en el paso 4 del flujo principal. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** El encabezado conserva los cambios admitidos.<br>2. **Éxito:** Los detalles, las cantidades y las existencias permanecen sin cambios.<br>3. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-WST-004`. |

#### `CU-SAL-11` — Editar detalles de merma de una salida

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-SAL-11` |
| Nombre | Editar detalles de merma de una salida. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** necesita agregar o corregir mermas de una salida todavía modificables y abre los detalles. |
| Participación de actor y sistema | **Actor:** selecciona la salida o detalle, captura la acción y confirma.<br>**Nexus:** presenta cantidades y acciones permitidas, valida y actualiza documento, inventario y movimientos cuando corresponde. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de edición.<br>3. La salida existe.<br>4. La salida se encuentra en un estado que admite modificar sus detalles. |
| Flujo principal | 1. **Actor:** abre los detalles de una salida todavía modificable **(ver E1)**.<br>2. **Nexus:** muestra las mermas actuales, cantidades y acciones permitidas.<br>3. **Actor:** agrega o modifica mermas y confirma los cambios **(ver A1)**.<br>4. **Nexus:** valida estado, recursos, cantidades pendientes y acumulados.<br>5. **Nexus:** actualiza los detalles sin descontar existencias y confirma el resultado. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** valida la información capturada, detecta campos incompletos, formatos incorrectos, relaciones no permitidas o cantidades fuera de las reglas del caso y los señala sin registrar cambios.<br>2. **Actor:** corrige la información indicada y vuelve a confirmar; continúa en el paso 4 del flujo principal. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Los detalles conservan las mermas y cantidades confirmadas.<br>2. **Éxito:** Las existencias permanecen sin cambios hasta el surtimiento.<br>3. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-WST-005`. |

#### `CU-SAL-12` — Surtir merma

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-SAL-12` |
| Nombre | Surtir merma. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** va a entregar merma de una solicitud pendiente y abre sus detalles. |
| Participación de actor y sistema | **Actor:** selecciona el detalle pendiente, registra la cantidad convertida del proyecto cuando aplica y confirma el surtimiento.<br>**Nexus:** presenta cantidades y acciones permitidas, valida y actualiza documento, inventario y movimientos. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso operativo.<br>3. La salida y el detalle existen.<br>4. El detalle conserva cantidad pendiente.<br>5. Hay existencia suficiente para surtir la cantidad solicitada. |
| Flujo principal | 1. **Actor:** abre los detalles de la salida de merma y selecciona un renglón pendiente **(ver E1)**.<br>2. **Nexus:** muestra la cantidad solicitada pendiente y la existencia disponible.<br>3. **Actor:** marca el detalle para surtirlo, registra la cantidad convertida del proyecto cuando corresponde y confirma **(ver A1)**.<br>4. **Nexus:** valida el estado, el detalle seleccionado y la existencia suficiente para surtir toda su cantidad pendiente **(ver A2)** **(ver E2)**.<br>5. **Nexus:** descuenta la cantidad pendiente completa, marca el detalle como surtido, actualiza estados, registra el movimiento y confirma. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** valida la información capturada, detecta campos incompletos, formatos incorrectos, relaciones no permitidas o cantidades fuera de las reglas del caso y los señala sin registrar cambios.<br>2. **Actor:** corrige la información indicada y vuelve a confirmar; continúa en el paso 4 del flujo principal.<br>**A2 — Merma desactivada después de registrar la salida (después del paso 4):**<br>1. **Actor:** revisa el aviso de que la merma fue desactivada después de registrar la salida.<br>2. **Nexus:** conserva el detalle histórico y permite surtir su pendiente si existe stock suficiente, mientras mantiene la merma bloqueada para salidas nuevas.<br>3. **Actor:** confirma que completará el compromiso y continúa en el paso 5 del flujo principal, o cancela la confirmación y termina el caso de uso con el detalle pendiente. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso.<br>**E2 — Existencia insuficiente o detalle ya atendido (después del paso 4):**<br>1. **Actor:** revisa la existencia o la cantidad pendiente vigentes que Nexus informa.<br>2. **Nexus:** rechaza el surtimiento y conserva sin cambios el detalle, el encabezado, la existencia y los movimientos; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La existencia disminuye en la cantidad surtida.<br>2. **Éxito:** El detalle acumula la cantidad surtida.<br>3. **Éxito:** Los estados de cumplimiento quedan actualizados.<br>4. **Éxito:** El movimiento de salida queda registrado.<br>5. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-WST-003`, `RN-002`, `RN-003`, `RN-012`, `RN-015`, `RN-016`. |

#### `CU-SAL-13` — Devolver merma surtida

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-SAL-13` |
| Nombre | Devolver merma surtida. |
| Actor y disparador | **Actor:** Personal de almacén. **Disparador:** recibe de vuelta merma surtida y abre la devolución del detalle. |
| Participación de actor y sistema | **Actor:** selecciona la salida o detalle, captura la acción y confirma.<br>**Nexus:** presenta cantidades y acciones permitidas, valida y actualiza documento, inventario y movimientos cuando corresponde. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso operativo.<br>3. La salida y el detalle existen.<br>4. El detalle conserva una cantidad surtida todavía retornable. |
| Flujo principal | 1. **Actor:** abre una salida de merma y selecciona un detalle surtido para devolverlo **(ver E1)**.<br>2. **Nexus:** muestra la cantidad que todavía puede devolverse.<br>3. **Actor:** captura la cantidad recibida de vuelta, registra las observaciones y selecciona «Devolver» **(ver A1)**.<br>4. **Nexus:** valida la cantidad retornable.<br>5. **Nexus:** reintegra existencia, acumula la devolución, actualiza estados, registra el movimiento inverso y confirma. |
| Flujos alternativos | **A1 — Datos inválidos (después del paso 3):**<br>1. **Nexus:** valida la información capturada, detecta campos incompletos, formatos incorrectos, relaciones no permitidas o cantidades fuera de las reglas del caso y los señala sin registrar cambios.<br>2. **Actor:** corrige la información indicada y vuelve a confirmar; continúa en el paso 4 del flujo principal. |
| Excepciones | **E1 — Acceso rechazado (después del paso 1):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** La existencia aumenta en la cantidad devuelta y el movimiento inverso queda registrado.<br>2. **Éxito, devolución parcial del detalle:** el detalle acumula la devolución y conserva cumplimiento `Surtido`; no queda cancelado.<br>3. **Éxito, devolución total del detalle:** el detalle acumula la devolución y deriva cumplimiento `Cancelado`; no se ejecuta una acción adicional de cancelación.<br>4. **Éxito, agregación del encabezado:** sólo si todos los detalles tienen cumplimiento `Cancelado`, la salida deriva cumplimiento `Cancelado` y estado documental `Cancelada`; mientras exista otro detalle no cancelado, el encabezado no se cancela.<br>5. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-WST-006`, `RN-002`, `RN-014`, `RN-028`, `RN-029`. |


#### `CU-SAL-14` — Generar reporte de salidas de merma

| Sección | Información relevante |
| --- | --- |
| Identificador | `CU-SAL-14` |
| Nombre | Generar reporte de salidas de merma. |
| Actor y disparador | **Actor:** Usuario con permiso sobre el reporte o consulta. **Disparador:** desde `CU-SAL-08` Consultar salidas de merma, selecciona la opción para generar el reporte con los filtros que necesita conservar. |
| Participación de actor y sistema | **Actor:** define filtros y solicita la exportación.<br>**Nexus:** autoriza, consolida la información y entrega el archivo. |
| Precondiciones | 1. El actor inició sesión.<br>2. El actor cuenta con el permiso de consulta o reporte correspondiente. |
| Flujo principal | 1. **Nexus:** después de que el actor selecciona la exportación desde la consulta de origen, abre el modal **Exportar reporte** y muestra las opciones aplicables **(ver E1)**.<br>2. **Actor:** conserva o ajusta los filtros, incluye las opciones disponibles y confirma.<br>3. **Nexus:** vuelve a comprobar autorización y parámetros y prepara la información de salidas de merma.<br>4. **Nexus:** genera el archivo de Excel e inicia su descarga; si no hay datos, informa que el resultado está vacío. |
| Excepciones | **E1 — Exportación rechazada (después del disparador):**<br>1. **Nexus:** comprueba las precondiciones y la autorización, determina que alguna no se cumple y rechaza la solicitud sin modificar datos ni exponer información no autorizada; comunica el motivo.<br>2. **Actor:** reconoce el rechazo; termina el caso de uso. |
| Postcondiciones (éxito y fallo) | 1. **Éxito:** Archivo Excel con filtros, columnas y cálculos propios del reporte.<br>2. **Fallo:** Un rechazo no debe producir cambios parciales ni exponer información no autorizada. |
| Requisitos relacionados | `RF-REP-002`, `RF-REP-004`. |
## Relación entre familias y reutilización

| Tema compartido | Casos | Elementos reutilizables que deben evaluarse primero | Diferencia que debe conservarse |
| --- | --- | --- | --- |
| CRUD de identidades y catálogos | `CU-IDA-01` a `CU-IDA-11`; `CU-CAT-01` a `CU-CAT-48` | Fábricas CRUD, listados, formularios, validación y refresco de tabla. | Permisos, identidad del recurso, relaciones y política de eliminación. |
| Documentos con detalles | `CU-ENT-02`, `CU-ENT-03`, `CU-SAL-02` a `CU-SAL-04` y `CU-SAL-09` a `CU-SAL-11` | Encabezado, modal/formulario, tabla de detalles, DTO y transacción coordinadora. | La entrada incrementa stock al confirmarse; la salida no lo descuenta hasta surtir. |
| Operación de salidas | `CU-SAL-02` a `CU-SAL-06` y `CU-SAL-09` a `CU-SAL-13` | Proceso de material replicable para merma, componentes informativos y coordinación de movimientos. | Inventario, conversión, permisos, estados y cantidades acumuladas del contexto. |
| Consulta y exportación | `CU-IDA-04`, `CU-IDA-09`, `CU-CAT-07`, `CU-CAT-09`, `CU-CAT-14`, `CU-CAT-18`, `CU-CAT-24`, `CU-CAT-26`, `CU-ENT-06`, `CU-SAL-07` y `CU-SAL-14` y casos de consulta de cada familia | Filtros, paginación, dependencias entre selects y utilidades Excel. | Columnas, agrupaciones, fórmulas y permiso de cada reporte. |

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
